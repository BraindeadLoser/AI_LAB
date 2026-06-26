import { sendToAI } from "../AI/ai_client.js";
import { buildPrompt } from "../AI/prompt_builder.js";
import { executeToolPipeline } from "../AI/tool_executor.js";
import {renderConversations,toggleSidebar,enableResize,initializeSidebar} from "../UI/Panels/sidebar_ui.js";
import {addMessage,createTypingIndicator} from "../UI/Chat/chat_ui.js";
import { initializeTheme } from "../UI/Customization/theme_ui.js";
import { createConversation, updateConversation } from "./conversations.js";
import { getAllConversations } from "./conversations.js";
import { deleteConversation } from "./conversations.js";
import {captureUserMessage,captureAIMessage} from "./logSystem.js";
import { initializeDevelopMode } from "../Modes/Develop_mode/develop_mode.js";
import { initializeConsoleToggle }
from "../UI/Panels/console_toggle.js";
import { logEvent } from "../Logging/Event_Logging/event_logger.js";
import { buildBridgeContext } from "./Bridge.js";
import { readSandboxFileLines } from "../Fetch_Files/file_access.js";
//Test starts here
import { finalizeEdit } from "../Edit_Files/edit_pipeline.js";
//Test ends here
const chat = document.getElementById("chat");
const input = document.getElementById("input");

// Message sequence tracking for JSON logs
let messageSeq = 0;

// Theme color variables
let userColor = "#f0f0f0";
let aiColor = "#e0e0e0";
let bgColor = "#ffffff";

const allConvs = getAllConversations();
let currentConversation;
if (allConvs.length > 0) {
  currentConversation = allConvs[0]; // load latest
} else {
  currentConversation = createConversation();
}
let messages = currentConversation.messages;

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

initializeDevelopMode();
initializeConsoleToggle();

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