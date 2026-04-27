import { savePreferences, loadPreferences } from "./storage.js";
import { createConversation, updateConversation } from "./conversations.js";
import { getAllConversations } from "./conversations.js";
import { deleteConversation } from "./conversations.js";

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
if (type === "ai") div.style.background = aiColor;  div.innerText = text;
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
        typingDiv.innerText = fullText;
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
  item.style.background = "#2a2b32";
}  
item.innerHTML = "";

const title = document.createElement("span");
title.innerText = conv.title || "New Chat";

const del = document.createElement("button");
del.innerText = "x";
del.style.float = "right";
del.style.background = "transparent";
del.style.color = "white";
del.style.border = "none";
del.style.cursor = "pointer";

item.appendChild(title);
item.appendChild(del);

del.addEventListener("click", (e) => {
  e.stopPropagation();

  const isActive = currentConversation.id === conv.id;

  deleteConversation(conv.id);

  const remaining = getAllConversations();

  if (isActive) {
    if (remaining.length > 0) {
      currentConversation = remaining[0];
    } else {
      currentConversation = createConversation();
    }

    messages = currentConversation.messages;

    chat.innerHTML = "";
    messages.forEach(m => {
      addMessage(m.content, m.role === "user" ? "user" : "ai");
    });
  }

  renderConversations();
});

  item.addEventListener("click", () => {
    currentConversation = conv;
    messages = conv.messages;

    chat.innerHTML = "";

    messages.forEach(m => {
      addMessage(m.content, m.role === "user" ? "user" : "ai");
    });
      renderConversations(); // 🔥 critical fix
  });

  list.appendChild(item);
});
}

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
    document.querySelectorAll(".user").forEach(el => {
        el.style.background = userColor;
    });

    document.querySelectorAll(".ai").forEach(el => {
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