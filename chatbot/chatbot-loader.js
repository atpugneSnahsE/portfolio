/**
 * Standalone Chatbot Loader
 * Loads chatbot in an isolated iframe to prevent CSS conflicts
 */

(function () {
  "use strict";

  // Create floating button
  const button = document.createElement("button");
  button.id = "chatbot-toggle-standalone";
  button.innerHTML = "<i class='fa-regular fa-comments'></i>";
  button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: none;
        background: #e23b2e;
        color: #ffffff;
        font-size: 26px;
        cursor: pointer;
        box-shadow: 0 12px 30px rgba(226, 59, 46, 0.35);
        z-index: 999999;
        transition: transform 0.25s ease, box-shadow 0.25s ease, bottom 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

  // Create iframe container
  const container = document.createElement("div");
  container.id = "chatbot-iframe-container";
  container.style.cssText = `
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 420px;
        height: 600px;
        max-width: calc(100vw - 40px);
        max-height: calc(100vh - 120px);
        border: none;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
        z-index: 999998;
        display: none;
        overflow: hidden;
        background: #ffffff;
    `;

  // Create iframe
  const iframe = document.createElement("iframe");
  iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 20px;
        background: transparent;
    `;

  container.appendChild(iframe);

  // Add to page
  document.body.appendChild(button);
  document.body.appendChild(container);

  // Toggle functionality
  let isOpen = false;
  button.addEventListener("click", () => {
    isOpen = !isOpen;
    container.style.display = isOpen ? "block" : "none";
    button.style.transform = isOpen ? "scale(0.9)" : "scale(1)";

    if (isOpen && !iframe.src) {
      iframe.src = "chatbot/chatbot-standalone.html";
    }
  });

  // Hover effect
  button.addEventListener("mouseenter", () => {
    if (!isOpen) {
      button.style.transform = "scale(1.08)";
      button.style.boxShadow = "0 16px 40px rgba(226, 59, 46, 0.45)";
    }
  });

  button.addEventListener("mouseleave", () => {
    if (!isOpen) {
      button.style.transform = "scale(1)";
      button.style.boxShadow = "0 12px 30px rgba(226, 59, 46, 0.35)";
    }
  });

  // Mobile responsiveness
  function updateMobileView() {
    if (window.innerWidth <= 480) {
      container.style.bottom = "0";
      container.style.right = "0";
      container.style.width = "100%";
      container.style.height = "100%";
      container.style.maxWidth = "100%";
      container.style.maxHeight = "100%";
      container.style.borderRadius = "0";
      iframe.style.borderRadius = "0";
    } else {
      container.style.bottom = "90px";
      container.style.right = "20px";
      container.style.width = "420px";
      container.style.height = "600px";
      container.style.maxWidth = "calc(100vw - 40px)";
      container.style.maxHeight = "calc(100vh - 120px)";
      container.style.borderRadius = "20px";
      iframe.style.borderRadius = "20px";
    }
  }

  window.addEventListener("resize", updateMobileView);
  updateMobileView();
})();
