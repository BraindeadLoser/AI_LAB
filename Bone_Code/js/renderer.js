import { savePreferences, loadPreferences } from "./storage.js";
import { createConversation, updateConversation } from "./conversations.js";
import { getAllConversations } from "./conversations.js";
import { deleteConversation } from "./conversations.js";
import {
    listAllowedFiles,
    readSandboxFile
} from "./Fetch_Files/file_access.js";
import customConsole from "./console.js";
import {
  captureUserMessage,
  captureAIMessage,
  enableDevMode,
  disableDevMode
} from "./logSystem.js";
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

const prefs = loadPreferences();

if (prefs) {
    if (prefs.bgColor) {
        bgColor = prefs.bgColor;
        document.body.style.backgroundColor = bgColor;
    }

    if (prefs.userColor) {
        userColor = prefs.userColor;
    }

    if (prefs.aiColor) {
        aiColor = prefs.aiColor;
    }
}

function addMessage(text, type) {
  const div = document.createElement("div");
div.className = "msg " + type;

if (type === "user") div.style.background = userColor;
if (type === "ai") div.style.background = aiColor;  
div.innerHTML = marked.parse(text);
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  
  // Log message in JSON format
if (type === "user") {
  captureUserMessage(text, messageSeq++);
} else if (type === "ai") {
  captureAIMessage(text, messageSeq++);
}
}
async function send() {
  const msg = input.value;
  if (!msg) return;

  addMessage(msg, "user");
  messages.push({ role: "user", content: msg });
  updateConversation(currentConversation.id, messages);
  input.value = "";

const typingDiv = document.createElement("div");
typingDiv.className = "msg ai";
typingDiv.style.background = aiColor;
typingDiv.innerText = "...";
  chat.appendChild(typingDiv);
  chat.scrollTop = chat.scrollHeight;

try {
  // Step 1: Build bridge context
  const bridge = await buildBridgeContext(msg);

  // Step 2: Base system rules
  let systemRules = `
You are an AI assistant.

Logs are background context.
Do NOT mention logs unless explicitly asked.
Use them only if relevant.
`;

  // Step 3: Modify rules if active mode
  if (bridge.mode === "active") {
    systemRules += `
You MAY analyze logs if useful.
`;
  }
  // Step 4: Construct messages
  const finalMessages = [
    {
      role: "system",
      content: systemRules
    },
    {
    role: "system",
    content:
`You operate with TWO response modes.

1. USER RESPONSE MODE
- Used for normal conversation with the user.
- Respond naturally.

2. TOOL REQUEST MODE
- Used ONLY when you need file contents.
- In this mode, respond ONLY with raw JSON.
- No markdown.
- No explanations.
- No extra text.

Tool request format:

{
  "tool": "file_access",
  "action": "read",
  "file": "sample.py"
}

Available files:
${listAllowedFiles().join("\n")}

Never invent file contents.
Only request files when necessary.`
}
  ];
  // Step 5: Inject logs ONLY if present
  if (bridge.logs.length > 0) {
    finalMessages.push({
      role: "system",
      content: `BACKGROUND_LOGS:${JSON.stringify(bridge.logs)}`
    });
  }

  // Step 6: Add conversation history (important: keep your existing messages[])
  finalMessages.push(...messages);

  // Step 7: Send to model
  const response = await fetch("http://127.0.0.1:1234/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: finalMessages,
      stream: true
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let aiResponse = "";
  let firstChunk = true;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data:')) {
        const jsonStr = line.slice(5).trim();
        if (jsonStr === '[DONE]') continue;

        try {
          const json = JSON.parse(jsonStr);
          const content = json.choices?.[0]?.delta?.content || '';
          if (content) {
            aiResponse += content;
            if (firstChunk) {
              typingDiv.innerText = content;
              firstChunk = false;
            } else {
              typingDiv.innerText += content;
            }
            chat.scrollTop = chat.scrollHeight;
          }
        } catch (e) {
          // Ignore parsing errors on stream chunks
        }
      }
    }
  }

  // Add AI response to messages and save
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
function newChat() {
  currentConversation = createConversation();
  messages = currentConversation.messages;
  messageSeq = 0;
  chat.innerHTML = "";
  logEvent({ type: 'ui_click', data: { target: 'new_chat_button' } });
}

function renderConversations() {
  const list = document.getElementById("chatList");
  list.innerHTML = "";

  const conversations = getAllConversations();

conversations.forEach(conv => {
  const item = document.createElement("div");
  
item.className = "chat-item";

if (conv.id === currentConversation.id) {
  item.style.background = "#0a0b14";
}  
item.innerHTML = "";

const title = document.createElement("span");
title.innerText = conv.title || "New Chat";

const menuBtn = document.createElement("button");
menuBtn.innerText = "⋯"; // three horizontal dots
menuBtn.style.float = "right";
menuBtn.style.background = "transparent";
menuBtn.style.color = "ccc";
menuBtn.style.border = "none";
menuBtn.style.cursor = "pointer";

item.appendChild(title);
item.appendChild(menuBtn);

// dropdown container
const dropdown = document.createElement("div");
dropdown.className = "dropdown-menu";
dropdown.style.display = "none"; // hidden by default
dropdown.style.position = "absolute";
dropdown.style.background = "#2a2b32";
dropdown.style.color = "white";
dropdown.style.padding = "5px";
dropdown.style.borderRadius = "4px";

const delOption = document.createElement("div");
delOption.innerText = "Delete";
delOption.onclick = (e) => {
  e.stopPropagation();
  const isActive = currentConversation.id === conv.id;
  logEvent({ type: 'ui_click', data: { target: 'delete_conversation' } });
  deleteConversation(conv.id);

  const remaining = getAllConversations();
  if (isActive) {
    currentConversation = remaining.length > 0 ? remaining[0] : createConversation();
    messages = currentConversation.messages;
    messageSeq = 0;
    chat.innerHTML = "";
    messages.forEach(m => addMessage(m.content, m.role === "user" ? "user" : "ai"));
  }
  renderConversations();
};

// rename option
const renameOption = document.createElement("div");
renameOption.innerText = "Rename";
renameOption.onclick = (e) => {
  e.stopPropagation();

  // create inline input
  const input = document.createElement("input");
  input.type = "text";
  input.value = conv.title || "New Chat";
  input.style.width = "120px";

  // replace renameOption with input temporarily
  dropdown.replaceChild(input, renameOption);
  // prevent dropdown from closing when clicking inside input
  input.addEventListener("click", (ev) => {
    ev.stopPropagation();
  });
  // handle Enter key
  input.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      const newTitle = input.value.trim();
      if (newTitle !== "") {
        logEvent({ type: 'ui_click', data: { target: 'rename_conversation' } });
        conv.title = newTitle;
        updateConversation(conv.id, messages);
        renderConversations();
      }
    }
  });
};
dropdown.appendChild(delOption);
dropdown.appendChild(renameOption);
item.appendChild(dropdown);
// toggle dropdown on menuBtn click
menuBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
});
  item.addEventListener("click", () => {
    currentConversation = conv;
    messages = conv.messages;
    messageSeq = 0;
    logEvent({ type: 'ui_click', data: { target: 'conversation_item' } });
    chat.innerHTML = "";

    messages.forEach(m => {
      addMessage(m.content, m.role === "user" ? "user" : "ai");
    });
      renderConversations(); // 🔥 critical fix
      dropdown.style.display = "none";
  });

  list.appendChild(item);
});
}
document.addEventListener("click", (e) => {
  if (!e.target.closest(".dropdown-menu") && !e.target.closest("button")) {
    document.querySelectorAll(".dropdown-menu").forEach(menu => {
      menu.style.display = "none";
    });
  }
});

function togglePanel() {
  const panel = document.getElementById("panel");
  panel.style.display =
    panel.style.display === "none" ? "block" : "none";
}

function enableResize() {
  const sidebar = document.getElementById("sidebar");
  const resizer = document.getElementById("resizer");
  const main = document.getElementById("main");

  let isResizing = false;

  resizer.addEventListener("mousedown", () => {
    isResizing = true;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isResizing) return;

    const newWidth = e.clientX;
    sidebar.style.width = newWidth + "px";
    main.style.marginLeft = newWidth + "px";
  });

  document.addEventListener("mouseup", () => {
    isResizing = false;
  });
}
enableResize();
input.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    logEvent({ type: 'ui_click', data: { target: 'send_button' } });
    send();
  }
});

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const main = document.getElementById("main");
  logEvent({ type: 'ui_click', data: { target: 'toggle_sidebar' } });

  if (sidebar.style.display === "none") {
    sidebar.style.display = "block";
    main.style.marginLeft = "250px";
  } else {
    sidebar.style.display = "none";
    main.style.marginLeft = "0";
  }
}


function applyColors() {
    userColor = document.getElementById("userColor").value;
    aiColor = document.getElementById("aiColor").value;
    bgColor = document.getElementById("bgColor").value;

    // apply background
    document.body.style.background = bgColor;

    // update existing messages
document.querySelectorAll(".msg.user").forEach(el => {
  el.style.background = userColor;
});

document.querySelectorAll(".msg.ai").forEach(el => {
  el.style.background = aiColor;
});


    // ✅ SAVE
    savePreferences({
        userColor,
        aiColor,
        bgColor
    });
}

document.getElementById("toggleBtn").addEventListener("click", toggleSidebar);
document.getElementById("customizeBtn").addEventListener("click", togglePanel);
document.getElementById("applyBtn").addEventListener("click", applyColors);
document.getElementById("sendBtn").addEventListener("click", send);
document.getElementById("consoleToggleBtn").addEventListener("click", () => {
  const consoleDiv = document.getElementById('bottom-console');
  if (consoleDiv.classList.contains('hidden')) {
    consoleDiv.classList.remove('hidden');
  } else {
    consoleDiv.classList.add('hidden');
  }
});
document.getElementById("newChatBtn").addEventListener("click", () => {
  newChat();
  renderConversations();
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
renderConversations();