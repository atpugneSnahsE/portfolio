import os
import glob
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Warning: GEMINI_API_KEY not found in environment variables")
else:
    genai.configure(api_key=api_key)

# Global variable to store knowledge base
KNOWLEDGE_BASE = ""

def load_knowledge_base():
    """Reads all markdown files from the ../chatbot directory and combines them."""
    global KNOWLEDGE_BASE
    kb_content = []
    
    # Path to the chatbot directory containing markdown files
    # Assuming app.py is in /chatbot_backend/ and markdown files are in /chatbot/
    chatbot_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'chatbot')
    
    print(f"Loading knowledge base from: {chatbot_dir}")
    
    md_files = glob.glob(os.path.join(chatbot_dir, "*.md"))
    
    for file_path in md_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                filename = os.path.basename(file_path)
                content = f.read()
                kb_content.append(f"--- START FILE: {filename} ---\n{content}\n--- END FILE: {filename} ---\n")
                print(f"Loaded: {filename}")
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            
    KNOWLEDGE_BASE = "\n".join(kb_content)
    print(f"Knowledge base loaded. Total characters: {len(KNOWLEDGE_BASE)}")

# Load KB on startup
load_knowledge_base()

@app.route('/api/chat', methods=['POST'])
def chat():
    if not api_key:
        return jsonify({"error": "Server configuration error: API key missing"}), 500
        
    data = request.json
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({"error": "No message provided"}), 400
        
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Construct the prompt
        system_prompt = """
        You are an AI assistant for Eshan Sengupta's portfolio website. 
        Your goal is to answer questions about Eshan based ONLY on the provided context.
        
        Rules:
        1. Use a professional but friendly tone.
        2. If the answer is found in the context, synthesize it clearly.
        3. If the answer is NOT in the context, politely say you don't know and suggest asking about his experience, research, or projects.
        4. Keep answers concise (under 150 words) unless asked for details.
        5. Do not hallucinate facts not present in the context.
        
        Context Data about Eshan:
        """
        
        full_prompt = f"{system_prompt}\n\n{KNOWLEDGE_BASE}\n\nUser Question: {user_message}"
        
        response = model.generate_content(full_prompt)
        
        return jsonify({"response": response.text})
        
    except Exception as e:
        print(f"Error generating response: {e}")
        return jsonify({"error": "Failed to generate response"}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port)
