import AIConnector from './aiConnector.js';
import appConsole from './console.js';
import LogPipeline from './logPipeline.js';
import { savePreferences, loadPreferences } from "./storage.js";
import { createConversation, updateConversation } from "./conversations.js";
import { getAllConversations } from "./conversations.js";
import { deleteConversation } from "./conversations.js";
const aiConnector = new AIConnector("http://127.0.0.1:1234", "dolphin-x1-8b");
const pipeline = new LogPipeline(aiConnector);
const chat = document.getElementById("chat");
const input = document.getElementById("input");

const API_URL = "http://localhost:1234/v1/chat/completions";

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
typingDiv.style.background = aiColor; // ✅ add this
typingDiv.innerText = "...";
  chat.appendChild(typingDiv);
  chat.scrollTop = chat.scrollHeight;

try {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "dolphin-x1-8b",
      messages: messages,
      stream: true
    })
  });

const reader = res.body.getReader();
const decoder = new TextDecoder("utf-8");

let fullText = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value, { stream: true });
  const lines = chunk.split("\n");

  for (let line of lines) {
    if (!line.startsWith("data: ")) continue;

    const data = line.replace("data: ", "").trim();

    if (data === "[DONE]") break;

    try {
      const json = JSON.parse(data);
      const token = json.choices[0].delta?.content;

      if (token) {
        fullText += token;
        typingDiv.innerHTML = marked.parse(fullText);
        chat.scrollTop = chat.scrollHeight;
      }
    } catch (e) {
      // ignore bad chunks
    }
  }
}

messages.push({ role: "assistant", content: fullText });
updateConversation(currentConversation.id, messages);

} catch (err) {
  messages.pop(); // remove last user message
  updateConversation(currentConversation.id, messages);
  typingDiv.innerText = "Error: LM Studio not reachable";
}
}
function newChat() {
  currentConversation = createConversation();
  messages = currentConversation.messages;

  chat.innerHTML = "";
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
  deleteConversation(conv.id);

  const remaining = getAllConversations();
  if (isActive) {
    currentConversation = remaining.length > 0 ? remaining[0] : createConversation();
    messages = currentConversation.messages;
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
    send();
  }
});

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const main = document.getElementById("main");

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
document.getElementById("newChatBtn").addEventListener("click", () => {
  newChat();
  renderConversations();
});
window.newChat = newChat;
window.getAllConversations = getAllConversations;
renderConversations();
// --- AppConsole hooks ---
document.addEventListener('click', (e) => {
  appConsole.log('UI_EVENT', 'click', { target: e.target.id || e.target.tagName });
});

window.addEventListener('error', (err) => {
  appConsole.log('ERROR', 'runtime', { message: err.message, stack: err.error?.stack });
});

async function apiCall(url, options) {
  appConsole.log('API_CALL', 'request', { url, options });
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    appConsole.log('API_CALL', 'response', { url, status: res.status });
    return data;
  } catch (error) {
    appConsole.log('ERROR', 'api', { url, message: error.message });
    throw error;
  }
}
// After appConsole import
// Assume aiModel is already initialized in your app
appConsole.on('suggestions', (suggestions) => {
  const panel = document.getElementById('ai-suggestions');
  if (!panel) return;
  panel.innerHTML = ''; // clear old
  suggestions.forEach(s => {
    const item = document.createElement('div');
    item.textContent = `💡 ${s.message}`;
    panel.appendChild(item);
  });
});
