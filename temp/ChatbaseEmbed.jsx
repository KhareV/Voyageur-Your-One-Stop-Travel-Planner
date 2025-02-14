import { useEffect } from "react";

const ChatbaseIntegration = () => {
  useEffect(() => {
    let isChatbaseInitialized = false;

    // Initialize chatbase queue if not already initialized
    if (!window.chatbase || window.chatbase("getState") !== "initialized") {
      window.chatbase = (...args) => {
        if (!window.chatbase.q) {
          window.chatbase.q = [];
        }
        window.chatbase.q.push(args);
      };

      // Create proxy for chatbase
      window.chatbase = new Proxy(window.chatbase, {
        get(target, prop) {
          if (prop === "q") {
            return target.q;
          }
          return (...params) => target(prop, ...params);
        },
      });
    }

    // Function to handle chat widget state
    const handleChatWidget = () => {
      const chatIframe = document.querySelector(
        'iframe[id^="chatbase-bubble-window"]'
      );
      if (chatIframe) {
        const chatButton = document.querySelector(".chatbase-bubble");
        if (chatButton) {
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (
                mutation.type === "attributes" &&
                mutation.attributeName === "class"
              ) {
                const isOpen = chatButton.classList.contains(
                  "chatbase-bubble-active"
                );
                chatIframe.style.display = isOpen ? "block" : "none";
              }
            });
          });

          observer.observe(chatButton, {
            attributes: true,
            attributeFilter: ["class"],
          });
        }
      }
    };

    // Load the script
    const script = document.createElement("script");
    script.src = "https://www.chatbase.co/embed.min.js";
    script.id = "tyk81Bz_NaOSBeEShd4pj";
    script.setAttribute("domain", "www.chatbase.co");

    // Add event listener for script load
    script.onload = () => {
      isChatbaseInitialized = true;
      // Wait a bit for the chat widget to be fully initialized
      setTimeout(handleChatWidget, 1000);
    };

    document.body.appendChild(script);

    // Cleanup function
    return () => {
      const existingScript = document.getElementById("lQkgW4wm54ar98NHCDMXM");
      if (existingScript) {
        existingScript.remove();
      }
      // Remove any observers or event listeners if they exist
      const chatButton = document.querySelector(".chatbase-bubble");
      if (chatButton) {
        const observers = chatButton._observers;
        if (observers) {
          observers.forEach((observer) => observer.disconnect());
        }
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  return null; // This component doesn't render anything
};

export default ChatbaseIntegration;
