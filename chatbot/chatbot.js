/**
 * Eshan's Portfolio Chatbot - Smart AI Assistant
 * Uses TF-IDF for semantic search (no external APIs required)
 * 100% Client-side, Zero cost
 */

class PortfolioChatbot {
  constructor() {
    this.knowledgeBase = null;
    this.isInitialized = false;
    this.conversationHistory = [];
    this.init();
  }

  async init() {
    try {
      // Load knowledge base
      await this.loadKnowledgeBase();

      // Initialize UI
      this.initializeUI();

      // Setup event listeners
      this.setupEventListeners();

      this.isInitialized = true;
      console.log("✅ Chatbot initialized successfully");
    } catch (error) {
      console.error("❌ Chatbot initialization failed:", error);
      this.showError("Failed to initialize chatbot. Please refresh the page.");
    }
  }

  async loadKnowledgeBase() {
    try {
      // Try to load from chatbot folder first
      let response = await fetch("chatbot/knowledge-base.json");

      // If not found, try root directory
      if (!response.ok) {
        response = await fetch("knowledge-base.json");
      }

      if (!response.ok) {
        throw new Error("Knowledge base not found");
      }

      this.knowledgeBase = await response.json();
      console.log(
        "✅ Knowledge base loaded:",
        this.knowledgeBase.metadata.name
      );
    } catch (error) {
      console.error("❌ Failed to load knowledge base:", error);
      throw error;
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

    // Quick action buttons are handled by global function
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
      const response = await this.processMessage(message);

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
      this.addMessage(
        "Sorry, I encountered an error processing your question. Please try again.",
        "bot"
      );
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
    // Convert URLs to links
    text = text.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank">$1</a>'
    );

    // Convert line breaks
    text = text.replace(/\n/g, "<br>");

    // Convert **bold** to <strong>
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

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
    const query = userMessage.toLowerCase();

    // Check for greetings
    if (this.isGreeting(query)) {
      return this.getGreetingResponse();
    }

    // Check for contact requests
    if (this.isContactRequest(query)) {
      return this.getContactResponse();
    }

    // Check for conversational patterns first
    const conversationalResponse = this.checkConversationalPatterns(query);
    if (conversationalResponse) {
      return conversationalResponse;
    }

    // Search knowledge base
    const results = this.searchKnowledgeBase(query);

    if (results.length === 0) {
      return this.getNoResultsResponse(userMessage);
    }

    // Generate response from best matches
    return this.generateResponse(query, results);
  }

  checkConversationalPatterns(query) {
    if (!this.knowledgeBase.conversationalPatterns) return null;

    const patterns = this.knowledgeBase.conversationalPatterns;

    // Who is Eshan / Tell me about yourself
    if (
      query.match(
        /who (is|are) (you|eshan)|tell me about (yourself|you|eshan)|introduce yourself/i
      )
    ) {
      const responses = patterns.whoIsEshan || [];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // What do you do
    if (
      query.match(
        /what (do you|does he|does eshan) do|what('s| is) (your|his|eshan's) (work|job)/i
      )
    ) {
      const responses = patterns.whatDoesHeDo || [];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Why hire / What makes you special
    if (
      query.match(
        /why (hire|choose) (you|him|eshan)|what makes you (special|different|unique)|why should i/i
      )
    ) {
      const responses = patterns.whyHireHim || [];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Availability
    if (
      query.match(
        /are you available|can you (work|start)|looking for (work|job)|available for/i
      )
    ) {
      const responses = patterns.availability || [];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Work Authorization
    if (query.match(/visa|work permit|authorization|legal|citizenship/i)) {
      const responses = patterns.workAuthorization || [];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Employment Type
    if (
      query.match(/full time|part time|contract|freelance|employment type/i)
    ) {
      const responses = patterns.employmentType || [];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Location and Remote
    if (query.match(/remote|location|relocate|move|onsite|based in/i)) {
      const responses = patterns.locationAndRemote || [];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // IP and NDA
    if (query.match(/ip|intellectual property|nda|confidentiality/i)) {
      const responses = patterns.intellectualProperty || [];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Tax and Compliance
    if (query.match(/tax|compliance|invoicing|legal/i)) {
      const responses = patterns.taxAndCompliance || [];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Privacy and Ethics
    if (query.match(/privacy|gdpr|ethics|data protection/i)) {
      const responses = patterns.dataPrivacyAndEthics || [];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    return null;
  }

  isGreeting(query) {
    const greetings = [
      "hi",
      "hello",
      "hey",
      "greetings",
      "good morning",
      "good afternoon",
      "good evening",
    ];
    return greetings.some((greeting) => query.includes(greeting));
  }

  getGreetingResponse() {
    const responses = [
      "Hello! I'm Eshan's AI assistant. I can tell you about his research, experience, skills, and projects. What would you like to know?",
      "Hi there! Feel free to ask me anything about Eshan's work, publications, or background.",
      "Hey! I'm here to help you learn more about Eshan. Ask me about his research, skills, or experience!",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  isContactRequest(query) {
    const contactKeywords = [
      "contact",
      "email",
      "reach",
      "get in touch",
      "message",
      "call",
      "phone",
    ];
    return contactKeywords.some((keyword) => query.includes(keyword));
  }

  getContactResponse() {
    const contact = this.knowledgeBase.contact;
    return (
      `You can reach Eshan at:\n\n` +
      `📧 Email: ${contact.email}\n` +
      `💼 LinkedIn: ${contact.linkedin}\n` +
      `📍 Location: ${contact.location}\n\n` +
      `${contact.preferredContact}`
    );
  }

  getNoResultsResponse(query) {
    return (
      `I don't have specific information about "${query}" in my knowledge base. However, you can:\n\n` +
      `• Ask about Eshan's research and publications\n` +
      `• Inquire about his technical skills and experience\n` +
      `• Learn about his projects and achievements\n` +
      `• Get his contact information\n\n` +
      `Try rephrasing your question or use the quick action buttons above!`
    );
  }

  // ==================== SEMANTIC SEARCH ====================

  searchKnowledgeBase(query) {
    const results = [];
    const kb = this.knowledgeBase;

    // Search in different sections with weights
    const searchSections = [
      { data: kb.about, weight: 1.0, section: "about" },
      { data: kb.personalInfo, weight: 0.9, section: "personalInfo" },
      { data: kb.skills, weight: 0.9, section: "skills" },
      { data: kb.experience, weight: 0.9, section: "experience" },
      { data: kb.publications, weight: 0.8, section: "publications" },
      { data: kb.education, weight: 0.7, section: "education" },
      { data: kb.projects, weight: 0.8, section: "projects" },
      { data: kb.services, weight: 0.85, section: "services" },
      { data: kb.volunteering, weight: 0.6, section: "volunteering" },
      { data: kb.memberships, weight: 0.6, section: "memberships" },
      { data: kb.achievements, weight: 0.8, section: "achievements" },
      { data: kb.workingWith, weight: 0.7, section: "workingWith" },
      { data: kb.values, weight: 0.7, section: "values" },
      { data: kb.funFacts, weight: 0.5, section: "funFacts" },
      { data: kb.researchInterests, weight: 0.8, section: "research" },
      { data: kb.faq, weight: 1.0, section: "faq" },
    ];

    searchSections.forEach(({ data, weight, section }) => {
      if (!data) return;

      const matches = this.findMatches(query, data, section);
      matches.forEach((match) => {
        results.push({
          ...match,
          score: match.score * weight,
        });
      });
    });

    // Sort by score and return top results
    return results.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  findMatches(query, data, section) {
    const results = [];
    const queryTokens = this.tokenize(query);

    // Helper function to calculate similarity
    const calculateSimilarity = (text) => {
      if (!text) return 0;
      const textTokens = this.tokenize(text.toLowerCase());
      return this.cosineSimilarity(queryTokens, textTokens);
    };

    // Search through different data structures
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        if (typeof item === "string") {
          const score = calculateSimilarity(item);
          if (score > 0.1) {
            results.push({ content: item, score, section, index });
          }
        } else if (typeof item === "object") {
          const textContent = JSON.stringify(item).toLowerCase();
          const score = calculateSimilarity(textContent);
          if (score > 0.1) {
            results.push({ content: item, score, section, index });
          }
        }
      });
    } else if (typeof data === "object") {
      Object.entries(data).forEach(([key, value]) => {
        const textContent =
          typeof value === "string" ? value : JSON.stringify(value);
        const score = calculateSimilarity(textContent.toLowerCase());
        if (score > 0.1) {
          results.push({ content: value, score, section, key });
        }
      });
    } else if (typeof data === "string") {
      const score = calculateSimilarity(data);
      if (score > 0.1) {
        results.push({ content: data, score, section });
      }
    }

    return results;
  }

  tokenize(text) {
    // Remove punctuation and split into words
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2); // Filter out very short words
  }

  cosineSimilarity(tokens1, tokens2) {
    // Create word frequency vectors
    const allWords = [...new Set([...tokens1, ...tokens2])];
    const vector1 = allWords.map(
      (word) => tokens1.filter((t) => t === word).length
    );
    const vector2 = allWords.map(
      (word) => tokens2.filter((t) => t === word).length
    );

    // Calculate dot product
    const dotProduct = vector1.reduce(
      (sum, val, i) => sum + val * vector2[i],
      0
    );

    // Calculate magnitudes
    const magnitude1 = Math.sqrt(
      vector1.reduce((sum, val) => sum + val * val, 0)
    );
    const magnitude2 = Math.sqrt(
      vector2.reduce((sum, val) => sum + val * val, 0)
    );

    // Return cosine similarity
    return magnitude1 && magnitude2
      ? dotProduct / (magnitude1 * magnitude2)
      : 0;
  }

  // ==================== RESPONSE GENERATION ====================

  generateResponse(query, results) {
    if (results.length === 0) {
      return this.getNoResultsResponse(query);
    }

    const topResult = results[0];
    const section = topResult.section;

    // Check if there's an "interestingQuestions" section for casual questions
    if (this.knowledgeBase.interestingQuestions) {
      for (const item of this.knowledgeBase.interestingQuestions) {
        const questionLower = item.question.toLowerCase();
        if (
          query.includes(questionLower.substring(0, 15)) ||
          this.cosineSimilarity(
            this.tokenize(query),
            this.tokenize(questionLower)
          ) > 0.4
        ) {
          return item.answer;
        }
      }
    }

    // Generate contextual response based on section
    switch (section) {
      case "about":
        return this.generateAboutResponse(results, query);

      case "skills":
        return this.generateSkillsResponse(query, results);

      case "experience":
        return this.generateExperienceResponse(results, query);

      case "publications":
        return this.generatePublicationsResponse(query, results);

      case "education":
        return this.generateEducationResponse(results);

      case "projects":
        return this.generateProjectsResponse(results);

      case "research":
        return this.generateResearchResponse(results);

      case "services":
        return this.generateServicesResponse(results);

      case "volunteering":
        return this.generateVolunteeringResponse(results);

      case "personalInfo":
        return this.generatePersonalInfoResponse(results);

      case "memberships":
        return this.generateMembershipsResponse(results);

      case "achievements":
        return this.generateAchievementsResponse(results);

      case "workingWith":
        return this.generateWorkingWithResponse(results);

      case "values":
        return this.generateValuesResponse(results);

      case "funFacts":
        return this.generateFunFactsResponse(results);

      case "faq":
        return this.generateFAQResponse(results);

      default:
        return this.generateGenericResponse(results);
    }
  }

  generateAboutResponse(results, query) {
    const about = this.knowledgeBase.about;

    // Use casual bio for informal questions
    if (query.match(/casual|simple|plain english|layman/i) && about.casualBio) {
      return about.casualBio;
    }

    // Check if asking about personality/character
    if (
      query.match(/personality|character|person|like|how (is|are)/i) &&
      about.personality
    ) {
      return about.personality;
    }

    // Default to bio with quick facts
    return `${about.bio}\n\n**Quick Facts:**\n${about.quickFacts
      .map((fact) => `• ${fact}`)
      .join("\n")}`;
  }

  generateSkillsResponse(query, results) {
    const skills = this.knowledgeBase.skills;

    // Check if asking about specific skill category
    if (query.includes("programming") || query.includes("language")) {
      return `**Programming Languages:**\n${skills.technical.programming.join(
        ", "
      )}`;
    }

    if (
      query.includes("ai") ||
      query.includes("ml") ||
      query.includes("machine learning")
    ) {
      return `**AI/ML Skills:**\n${skills.technical.aiml.join(
        ", "
      )}\n\n**Research Areas:**\n${skills.research
        .slice(0, 5)
        .map((r) => `• ${r}`)
        .join("\n")}`;
    }

    if (query.includes("business") || query.includes("analysis")) {
      return `**Business Analysis Skills:**\n${skills.technical.businessAnalysis.join(
        ", "
      )}\n\n**Business Domains:**\n${skills.technical.businessDomains.join(
        ", "
      )}`;
    }

    // General skills overview
    return (
      `**Technical Skills:**\n\n` +
      `**Programming:** ${skills.technical.programming.join(", ")}\n\n` +
      `**AI/ML:** ${skills.technical.aiml
        .slice(0, 4)
        .join(", ")}, and more\n\n` +
      `**Tools:** ${skills.technical.tools.slice(0, 5).join(", ")}\n\n` +
      `**Business Analysis:** Requirements Gathering, Process Mapping, Stakeholder Management`
    );
  }

  generateExperienceResponse(results, query) {
    const experience = this.knowledgeBase.experience;

    // If asking about specific company
    const companies = ["bsrm", "new technology", "deepesh"];
    const company = companies.find((c) => query.includes(c));

    if (company) {
      const job = experience.find((j) =>
        j.company.toLowerCase().includes(company)
      );
      if (job) {
        let response = `**${job.role}** at ${job.company}\n`;
        response += `📅 ${job.period} | ${job.type}\n\n`;
        response += `${job.description}\n\n`;
        if (job.achievements && job.achievements.length > 0) {
          response += `**Key Achievements:**\n${job.achievements
            .map((a) => `• ${a}`)
            .join("\n")}\n\n`;
        }
        if (job.learned) {
          response += `**What I learned:** ${job.learned}`;
        }
        return response;
      }
    }

    // General experience overview
    let response = `**Professional Experience:**\n\n`;

    experience.slice(0, 3).forEach((job) => {
      response += `**${job.role}** at ${job.company}\n`;
      response += `📅 ${job.period}\n`;
      response += `${job.description}\n`;
      if (job.achievements && job.achievements.length > 0) {
        response += `\n✨ ${job.achievements[0]}\n`;
      }
      response += `\n`;
    });

    return response;
  }

  generatePublicationsResponse(query, results) {
    const publications = this.knowledgeBase.publications;
    const stats = this.knowledgeBase.publicationStats;

    // Check if asking for count
    if (
      query.includes("how many") ||
      query.includes("number") ||
      query.includes("count")
    ) {
      if (stats) {
        return `Eshan has published **${stats.total} research papers** (${stats.journals} journals, ${stats.conferences} conferences). \n\n**Impact:** ${stats.q1Journals} Q1 Journals, ${stats.q2Journals} Q2 Journals.\n\n${stats.impactStatement}`;
      }
      return `Eshan has published **${publications.length} research papers** in prestigious international journals and conferences.`;
    }

    // Show recent publications
    return this.formatPublicationsList(publications);
  }

  formatPublicationsList(publications) {
    let response = `**Selected Publications:**\n\n`;
    publications.slice(0, 5).forEach((pub, index) => {
      response += `${index + 1}. **${pub.title}**\n`;
      response += `   📚 ${pub.journal || pub.conference}`;
      if (pub.impact) response += ` (${pub.impact})`;
      response += `\n   📅 ${pub.date}\n`;
      if (pub.summary) response += `   💡 ${pub.summary}\n`;
      response += `\n`;
    });

    response += `\nFor the complete list, visit his Google Scholar profile.`;
    return response;
  }

  generateEducationResponse(results) {
    const education = this.knowledgeBase.education;
    let response = `**Education:**\n\n`;

    education.forEach((edu) => {
      response += `**${edu.degree}**\n`;
      response += `🎓 ${edu.institution}\n`;
      response += `📍 ${edu.location}\n`;
      response += `📅 ${edu.period}\n`;
      if (edu.highlights && edu.highlights.length > 0) {
        response += `\nHighlights:\n${edu.highlights
          .map((h) => `• ${h}`)
          .join("\n")}\n`;
      }
      response += `\n`;
    });

    return response;
  }

  generateProjectsResponse(results) {
    const projects = this.knowledgeBase.projects;
    let response = "";

    if (projects.summary) {
      response += `${projects.summary}\n\n`;
    }

    // Highlighted Projects
    if (projects.highlighted && projects.highlighted.length > 0) {
      response += `**Featured Projects:**\n\n`;
      projects.highlighted.slice(0, 3).forEach((project) => {
        response += `**${project.name}**\n`;
        response += `${project.description}\n`;
        if (project.technologies)
          response += `💻 ${project.technologies.join(", ")}\n`;
        if (project.impact) response += `📊 ${project.impact}\n`;
        response += `\n`;
      });
    }

    // GitHub Projects
    if (projects.githubProjects && projects.githubProjects.length > 0) {
      response += `**Open Source & GitHub:**\n\n`;
      projects.githubProjects.forEach((proj) => {
        response += `**${proj.name}**\n${proj.description}\n🔗 Status: ${proj.status}\n\n`;
      });
    }

    return (
      response ||
      "Eshan has worked on multiple AI and ML projects. Ask me about specific projects!"
    );
  }

  generateResearchResponse(results) {
    const interests = this.knowledgeBase.researchInterests;
    return (
      `**Research Interests:**\n\n${interests
        .slice(0, 8)
        .map((interest) => `• ${interest}`)
        .join("\n")}\n\n` +
      `Eshan's research combines theoretical AI/ML with practical applications in real-world scenarios.`
    );
  }

  generateVolunteeringResponse(results) {
    const volunteering = this.knowledgeBase.volunteering;
    let response = `**Leadership & Community Involvement:**\n\n`;

    volunteering.forEach((role) => {
      response += `**${role.role}**\n`;
      response += `🏢 ${role.organization}\n`;
      response += `📅 ${role.period}\n`;
      response += `${role.description}\n\n`;
    });

    return response;
  }

  generateServicesResponse(results) {
    const services = this.knowledgeBase.services;

    // Check if asking about collaboration specifically
    if (
      results.some(
        (r) =>
          r.content.includes("collaboration") || r.content.includes("research")
      )
    ) {
      return `**Research Collaboration:**\n${services.researchCollaboration}\n\n**Availability:** ${services.availability}`;
    }

    // General services overview
    return (
      `**Services Offered:**\n\n` +
      services.offered
        .slice(0, 6)
        .map((s) => `• ${s}`)
        .join("\n") +
      `\n\n**Approach:** ${services.approach}\n\n` +
      `*Available for freelance and consulting projects.*`
    );
  }

  generateFAQResponse(results) {
    const topMatch = results[0];

    if (topMatch.content.answer) {
      return topMatch.content.answer;
    }

    // Find closest FAQ match
    const faq = this.knowledgeBase.faq;
    const bestMatch = faq[0]; // Simplified - in reality, you'd find the best match

    if (bestMatch) {
      return bestMatch.answer;
    }

    return this.generateGenericResponse(results);
  }

  generatePersonalInfoResponse(results) {
    const info = this.knowledgeBase.personalInfo;
    return (
      `**Personal Information:**\n\n` +
      `👤 Name: ${info.fullName}\n` +
      `🎂 Age: ${info.age} (Born: ${info.dateOfBirth})\n` +
      `📍 Location: ${info.currentLocation}\n` +
      `🗣️ Languages: ${info.languages.join(", ")}\n` +
      `🌍 Nationality: ${info.nationality}\n` +
      `✅ Work Permit: ${info.workPermit}`
    );
  }

  generateMembershipsResponse(results) {
    const memberships = this.knowledgeBase.memberships;
    let response = `**Professional Memberships:**\n\n`;
    memberships.forEach((m) => {
      response += `• **${m.organization}**\n  ${m.status} | ${m.location}\n`;
    });
    return response;
  }

  generateAchievementsResponse(results) {
    const achievements = this.knowledgeBase.achievements;
    return (
      `**Key Achievements:**\n\n` +
      achievements
        .slice(0, 5)
        .map((a) => `🏆 ${a}`)
        .join("\n\n")
    );
  }

  generateWorkingWithResponse(results) {
    const working = this.knowledgeBase.workingWith;
    return (
      `**Working Style & Collaboration:**\n\n` +
      `**Ideal Environment:** ${working.ideal}\n\n` +
      `**Process:** ${working.process}\n\n` +
      `**Communication:** ${working.communication}`
    );
  }

  generateValuesResponse(results) {
    const values = this.knowledgeBase.values;
    return `**Core Values:**\n\n` + values.map((v) => `💎 ${v}`).join("\n");
  }

  generateFunFactsResponse(results) {
    const facts = this.knowledgeBase.funFacts;
    // Return a random fun fact or list a few
    const randomFact = facts[Math.floor(Math.random() * facts.length)];
    return `**Did you know?**\n\n${randomFact}`;
  }

  generateGenericResponse(results) {
    const topResult = results[0];

    if (typeof topResult.content === "string") {
      return topResult.content;
    }

    if (typeof topResult.content === "object") {
      // Try to extract meaningful text from object
      const obj = topResult.content;

      if (obj.description) return obj.description;
      if (obj.bio) return obj.bio;
      if (obj.answer) return obj.answer;

      // Fallback: stringify relevant parts
      return JSON.stringify(obj, null, 2)
        .replace(/[{}"]/g, "")
        .replace(/,/g, "\n")
        .trim();
    }

    return "I found some relevant information, but I'm not sure how to best present it. Could you please rephrase your question?";
  }
}

// Initialize chatbot when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.chatbot = new PortfolioChatbot();
  });
} else {
  window.chatbot = new PortfolioChatbot();
}

// Global function for quick action buttons
function askQuestion(question) {
  if (window.chatbot && window.chatbot.chatInput) {
    window.chatbot.chatInput.value = question;
    window.chatbot.handleSendMessage();
  }
}
