import { sendToAI } from "../AI/ai_client.js";
import { buildPrompt } from "../AI/prompt_builder.js";
import { executeToolPipeline } from "../AI/tool_executor.js";
import {renderConversations,toggleSidebar,enableResize,initializeSidebar} from "../UI/Panels/sidebar_ui.js";
import {addMessage,createTypingIndicator} from "../UI/Chat/chat_ui.js";
import { initializeTheme } from "../UI/Customization/theme_ui.js";
import { createConversation, updateConversation } from "./conversations.js";
import { getAllConversations } from "./conversations.js";
import { deleteConversation } from "./conversations.js";
import customConsole from "./console.js";
import {captureUserMessage,captureAIMessage,enableDevMode,disableDevMode} from "./logSystem.js";
import { buildBridgeContext } from "./Bridge.js";
// Log events to the bottom console
function logEvent(entry) {
  customConsole.log(entry.type || 'info', 'app', entry.data || {});
}
//Test starts here
//Test ends here
const chat = document.getElementById("chat");
const input = document.getElementById("input");

// Message sequence tracking for JSON logs
let messageSeq = 0;

const allConvs = getAllConversations();
let currentConversation;
if (allConvs.length > 0) {
  currentConversation = allConvs[0]; // load latest
} else {
  currentConversation = createConversation();
}

let messages = currentConversation.messages;

let userColor = "#0b93f6";
let aiColor = "#444654";
let bgColor = "#343541";

async function send() {
  const msg = input.value;
  if (!msg) return;

  addMessage({
  chat,
  text: msg,
  type: "user",
      userColor: document.getElementById("userColor").value,
      aiColor: document.getElementById("aiColor").value,
  captureUserMessage,
  captureAIMessage,
  getMessageSeq: () => messageSeq,
  incrementMessageSeq: () => {},
  shouldLog: false
});
  messages.push({ role: "user", content: msg });
  updateConversation(currentConversation.id, messages);
  input.value = "";

const typingDiv = createTypingIndicator({
  chat,
  aiColor: document.getElementById("aiColor").value
});

try {
  // Step 1: Build bridge context
  const bridge = await buildBridgeContext(msg);

  // Step 2: Base system rules
const finalMessages = buildPrompt(
    messages,
    bridge
);
  // Step 7: Send to model
  console.log(JSON.stringify(finalMessages, null, 2));
  let aiResponse = await sendToAI(
    finalMessages,
    typingDiv,
    chat
);
  // Add AI response to messages and save
aiResponse = await executeToolPipeline(
    aiResponse,
    finalMessages,
    typingDiv
);

  messages.push({ role: "assistant", content: aiResponse });
  updateConversation(currentConversation.id, messages);
  captureAIMessage(aiResponse, messageSeq++);

} catch (err) {
  logEvent({ type: 'error', data: { message: "Error in send function", stack: err.stack } });
  messages.pop();
  updateConversation(currentConversation.id, messages);
  typingDiv.innerText = "Error occurred";
}
}

function restoreMessages(targetMessages = messages) {
  chat.innerHTML = "";

targetMessages.forEach(m => {
    addMessage({
      chat,
      text: m.content,
      type: m.role === "user" ? "user" : "ai",
      userColor,
      aiColor,
      captureUserMessage: () => {},
      captureAIMessage: () => {},
      getMessageSeq: () => 0,
      incrementMessageSeq: () => {},
      shouldLog: false
    });
  });
}

function newChat() {
  currentConversation = createConversation();
  messages = currentConversation.messages;
  messageSeq = 0;
  chat.innerHTML = "";
  logEvent({ type: 'ui_click', data: { target: 'new_chat_button' } });
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".dropdown-menu") && !e.target.closest("button")) {
    document.querySelectorAll(".dropdown-menu").forEach(menu => {
      menu.style.display = "none";
    });
  }
});

enableResize();

initializeSidebar({
  toggleSidebar,
  newChat,
  renderArgs: () => ({
    currentConversation,
    restoreMessages,
    userColor: document.getElementById("userColor").value,
    aiColor: document.getElementById("aiColor").value,
    setCurrentConversation: (conv) => {
      currentConversation = conv;
    },
    messages,
    setMessages: (newMessages) => {
      messages = newMessages;
    },
    messageSeq,
    setMessageSeq: (seq) => {
      messageSeq = seq;
    },
    chat,
    addMessage,
    createConversation,
    logEvent
  })
});

initializeTheme({
  getUserColor: () => userColor,
  setUserColor: (color) => {
    userColor = color;
  },

  getAIColor: () => aiColor,
  setAIColor: (color) => {
    aiColor = color;
  },

  getBgColor: () => bgColor,
  setBgColor: (color) => {
    bgColor = color;
  }
});

input.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    logEvent({ type: 'ui_click', data: { target: 'send_button' } });
    send();
  }
});

document.getElementById("sendBtn").addEventListener("click", send);
document.getElementById("consoleToggleBtn").addEventListener("click", () => {
  const consoleDiv = document.getElementById('bottom-console');
  if (consoleDiv.classList.contains('hidden')) {
    consoleDiv.classList.remove('hidden');
  } else {
    consoleDiv.classList.add('hidden');
  }
});

const devBtn = document.getElementById("devToggle");
let devState = false;

/**
 * Update develop mode state across all systems
 * Synchronizes: Main Process + Renderer Process + Console Singleton
 */
async function updateDevelopMode(enabled) {
    const consoleDiv = document.getElementById("bottom-console");
    
    try {
        if (enabled) {
            // Enable develop mode in main process
            await enableDevMode();
            
            // Sync console singleton
            customConsole.setDevelopMode(true);
            // Update UI
            devBtn.classList.remove("dev-off");
            devBtn.classList.add("dev-on");
            if (consoleDiv) {
                consoleDiv.classList.remove("hidden");
            }
            devState = true;
            // Log the mode change (will be captured now)
            logEvent({ type: 'DEV_MODE', data: { status: 'enabled', timestamp: new Date().toISOString() } });
            console.log("[DevMode] ✓ Develop mode ENABLED - All logging active");
        } else {
            // Disable develop mode in main process
            await disableDevMode();
            
            // Sync console singleton
            customConsole.setDevelopMode(false);
            // Update UI
            devBtn.classList.remove("dev-on");
            devBtn.classList.add("dev-off");
            if (consoleDiv) {
                consoleDiv.classList.add("hidden");
                consoleDiv.innerHTML = ""; // Clear logs
            }
            devState = false;
            console.log("[DevMode] ✓ Develop mode DISABLED - Logging paused");
        }
    } catch (err) {
        console.error("[DevMode] Error updating develop mode:", err);
    }
}

devBtn.addEventListener("click", () => {
    updateDevelopMode(!devState);
});

/**
 * Initialize develop mode state on app load
 * Syncs renderer with main process state
 */
async function initializeDevelopMode() {
    try {
        const mainProcessState = await window.ipc?.getDevelopMode?.();
        customConsole.setDevelopMode(mainProcessState || false);
        console.log(`[Init] Develop mode initialized from main process: ${mainProcessState}`);
    } catch (err) {
        console.error("[Init] Failed to initialize develop mode:", err);
        customConsole.setDevelopMode(false);
    }
}

// Initialize on load
initializeDevelopMode();

window.newChat = newChat;
window.getAllConversations = getAllConversations;
renderConversations({
    currentConversation,
    restoreMessages,
userColor: document.getElementById("userColor").value,
aiColor: document.getElementById("aiColor").value,
    setCurrentConversation: (conv) => {
        currentConversation = conv;
    },
    messages,
    setMessages: (newMessages) => {
        messages = newMessages;
    },
    messageSeq,
    setMessageSeq: (seq) => {
        messageSeq = seq;
    },
    chat,
    addMessage,
    createConversation,
    logEvent
});