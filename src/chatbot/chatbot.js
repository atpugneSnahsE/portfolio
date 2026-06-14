/**
 * Eshan's Portfolio Chatbot - Smart AI Assistant
 * Powered by Google Gemini API
 */

class PortfolioChatbot {
  constructor() {
    this.isInitialized = false;
    this.conversationHistory = [];
    this.API_URL = "https://portfolio-wxry.onrender.com/api/chat"; // Added /api/chat path
    this.init();
  }

  async init() {
    try {
      // Check if we are in production
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      ) {
        this.API_URL = "http://127.0.0.1:5001/api/chat";
        console.log("🔧 Running in development mode. API URL:", this.API_URL);
      } else {
        // Production URL
        console.log("🚀 Running in production mode. API URL:", this.API_URL);
      }

      this.initializeUI();
      this.setupEventListeners();
      this.isInitialized = true;
      console.log("✅ Chatbot initialized successfully");
    } catch (error) {
      console.error("❌ Chatbot initialization failed:", error);
      this.showError("Failed to initialize chatbot. Please refresh the page.");
    }
  }

  initializeUI() {
    this.chatMessages = document.getElementById("chat-messages");
    this.chatInput = document.getElementById("input");
    this.sendBtn = document.getElementById("send");
    this.typingIndicator = document.getElementById("typing");
  }

  setupEventListeners() {
    // Send message
    this.sendBtn.addEventListener("click", () => this.handleSendMessage());
    this.chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.handleSendMessage();
      }
    });

    // Quick action buttons
    // The HTML has onclick="askQuestion(...)". We need to define this global function
    // or attach listeners if we want to keep it contained.
    // For now, let's expose specific method or handle it via delegation.
    window.askQuestion = (question) => {
      this.chatInput.value = question;
      this.handleSendMessage();
    };
  }

  async handleSendMessage() {
    const message = this.chatInput.value.trim();

    if (!message) return;

    // Clear input
    this.chatInput.value = "";

    // Add user message
    this.addMessage(message, "user");

    // Show typing indicator
    this.showTyping();

    // Process message and get response
    try {
      // Set a warning timeout for 30 seconds
      const timeoutWarningId = setTimeout(() => {
        this.addMessage(
          "⚠️ The model is powered by free resources. Due to resource constraints, initial load-up might take some time. Thanks for your patience!",
          "bot"
        );
      }, 30000); // 30 seconds

      const response = await this.processMessage(message);

      // Clear the warning timeout if response arrives in time
      clearTimeout(timeoutWarningId);

      // Hide typing indicator
      this.hideTyping();

      // Add bot response
      this.addMessage(response, "bot");

      // Save to history
      this.conversationHistory.push({
        user: message,
        bot: response,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.hideTyping();
      let errorMessage =
        "Sorry, I encountered an error connecting to the AI server.";

      if (error.message.includes("Server returned")) {
        errorMessage += ` (${error.message})`;
      } else if (error.message === "Failed to fetch") {
        errorMessage +=
          " (Network Error: Backend might be sleeping or unreachable)";
      } else {
        errorMessage += ` (Details: ${error.message})`;
      }

      this.addMessage(errorMessage, "bot");
      console.error("Error processing message:", error);
    }
  }

  addMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}`;

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = sender === "bot" ? "ES" : "You";

    const content = document.createElement("div");
    content.className = "message-content";
    content.innerHTML = this.formatMessage(text);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    // Insert before typing indicator
    this.chatMessages.insertBefore(messageDiv, this.typingIndicator);

    // Scroll to bottom
    this.scrollToBottom();
  }

  formatMessage(text) {
    if (!text) return "";

    // Check if markdown (basic check)
    // You might want to use a proper markdown library like marked.js if available
    // For now, keeping the simple formatting from before

    // Convert URLs to links
    text = text.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank">$1</a>'
    );

    // Convert line breaks
    text = text.replace(/\n/g, "<br>");

    // Convert **bold** to <strong>
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Convert *italic* to <em>
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Bullet points
    text = text.replace(/• /g, "&bull; ");

    return text;
  }

  showTyping() {
    this.typingIndicator.classList.add("active");
    this.scrollToBottom();
  }

  hideTyping() {
    this.typingIndicator.classList.remove("active");
  }

  scrollToBottom() {
    setTimeout(() => {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }, 100);
  }

  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    this.chatMessages.appendChild(errorDiv);
  }

  // ==================== AI PROCESSING ====================

  async processMessage(userMessage) {
    // Call the Python Backend
    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }
}

// Initialize the chatbot when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  window.chatbot = new PortfolioChatbot();
});
