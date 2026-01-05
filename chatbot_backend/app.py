import os
import glob
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import hashlib
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Rate Limiter Configuration
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Simple In-Memory Cache
RESPONSE_CACHE = {}
MAX_CACHE_SIZE = 100

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Warning: GEMINI_API_KEY not found in environment variables")
else:
    genai.configure(api_key=api_key)
    
    # List available models for debugging
    try:
        print("Available models:")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f" - {m.name}")
    except Exception as e:
        print(f"Error listing models: {e}")

# Global variable to store knowledge base chunks
KNOWLEDGE_CHUNKS = {} # filename -> content

def load_knowledge_base():
    """Reads all markdown files from the ../chatbot directory and stores them as chunks."""
    global KNOWLEDGE_CHUNKS
    
    # Path to the chatbot directory containing markdown files
    chatbot_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'chatbot')
    
    print(f"Loading knowledge base from: {chatbot_dir}")
    
    md_files = glob.glob(os.path.join(chatbot_dir, "*.md"))
    
    for file_path in md_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                filename = os.path.basename(file_path)
                content = f.read()
                KNOWLEDGE_CHUNKS[filename] = content
                print(f"Loaded chunk: {filename} ({len(content)} chars)")
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            
    print(f"Knowledge base loaded. Total chunks: {len(KNOWLEDGE_CHUNKS)}")

def get_relevant_context(user_query):
    """
    Selects the most relevant chunks based on keyword overlap.
    This is a lightweight alternative to embeddings (saves RAM for Render free tier).
    """
    query_tokens = set(user_query.lower().split())
    
    # Always include 'identity.md' if it exists, as it contains core persona info
    selected_chunks = []
    if 'identity.md' in KNOWLEDGE_CHUNKS:
        selected_chunks.append(f"--- SOURCE: identity.md ---\n{KNOWLEDGE_CHUNKS['identity.md']}\n")
        
    # Score other chunks
    scored_chunks = []
    for filename, content in KNOWLEDGE_CHUNKS.items():
        if filename == 'identity.md': continue
        
        # Simple score: count query words in the content
        score = 0
        content_lower = content.lower()
        for token in query_tokens:
            if len(token) > 3 and token in content_lower: # Ignore small stop words roughly
                score += content_lower.count(token)
        
        if score > 0:
            scored_chunks.append((score, filename, content))
            
    # Sort by score desc and take top 3
    scored_chunks.sort(key=lambda x: x[0], reverse=True)
    top_chunks = scored_chunks[:3]
    
    for score, fname, content in top_chunks:
        print(f"Selected context: {fname} (Score: {score})")
        selected_chunks.append(f"--- SOURCE: {fname} ---\n{content}\n")
        
    if not top_chunks and 'identity.md' not in KNOWLEDGE_CHUNKS:
        # Fallback if nothing matches and identity is missing: send everything (careful with tokens)
        # But for valid KB, usually identity.md exists.
        pass
        
    return "\n".join(selected_chunks)

# Load KB on startup
load_knowledge_base()

@app.route('/api/chat', methods=['POST'])
@limiter.limit("5 per minute") # Rate limit: 5 requests per minute per IP
def chat():
    if not api_key:
        return jsonify({"error": "Server configuration error: API key missing"}), 500
        
    data = request.json
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({"error": "No message provided"}), 400
        
    # Check Cache
    # Create a simple hash of the normalized message
    msg_hash = hashlib.md5(user_message.strip().lower().encode()).hexdigest()
    
    if msg_hash in RESPONSE_CACHE:
        print(f"Cache hit for: {user_message[:20]}...")
        return jsonify({"response": RESPONSE_CACHE[msg_hash]})
        
    try:
        # Try available models in order of preference
        available_models = ['gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro']
        model = None
        
        for m_name in available_models:
            try:
                model = genai.GenerativeModel(m_name)
                # print(f"Successfully initialized model: {m_name}") # Reduce log spam
                break
            except Exception as e:
                print(f"Failed to initialize {m_name}: {e}")
                
        if not model:
            # Fallback to the first available content generation model found dynamically
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    model = genai.GenerativeModel(m.name)
                    print(f"Fallback to dynamic model: {m.name}")
                    break
        
        if not model:
            raise Exception("No suitable Gemini model found.")
        
        # Get optimized context
        relevant_context = get_relevant_context(user_message)
        
        # Construct the prompt
        system_prompt = """
        You are an AI assistant for Eshan Sengupta. Answer based ONLY on the provided context.
        
        Rules:
        1. BE EXTREMELY CONCISE. Max 2-3 sentences max unless asking for a list.
        2. NO filler words ("Based on the context...", "I found..."). Go straight to the point.
        3. Use bullet points for lists to save tokens.
        4. If info is missing, say "I don't have that info."
        5. STRICTLY NO HALLUCINATIONS.
        
        Context:
        """
        
        full_prompt = f"{system_prompt}\n\n{relevant_context}\n\nUser Question: {user_message}"
        
        # Configure generation to be compact
        generation_config = genai.types.GenerationConfig(
            max_output_tokens=150, # Limit response length strictly
            temperature=0.7,
        )
        
        response = model.generate_content(full_prompt, generation_config=generation_config)
        response_text = response.text.strip()
        
        # Update Cache
        if len(RESPONSE_CACHE) >= MAX_CACHE_SIZE:
            # Simple FIFO: remove first item (not perfect but simple)
            first_key = next(iter(RESPONSE_CACHE))
            del RESPONSE_CACHE[first_key]
            
        RESPONSE_CACHE[msg_hash] = response_text
        
        return jsonify({"response": response_text})
        
    except Exception as e:
        print(f"Error generating response: {e}")
        # Return the specific error to the frontend for debugging
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port)
