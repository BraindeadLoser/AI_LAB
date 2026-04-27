import { loadConversations } from "./storage.js";
import { saveConversations } from "./storage.js";
let conversations = loadConversations();

export function createConversation() {
  const newConv = {
    id: "conv_" + Date.now(),
    title: "New Chat",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  conversations.unshift(newConv);

  saveConversations(conversations); // ← add this line

  return newConv;
}

export function getConversationById(id) {
  return conversations.find(c => c.id === id);
}

export function updateConversation(id, messages) {
  const conv = getConversationById(id);
  if (!conv) return;

  conv.messages = messages;
  conv.updatedAt = Date.now();

  const firstUserMsg = messages.find(m => m.role === "user");
  if (firstUserMsg) {
    conv.title = firstUserMsg.content.slice(0, 30);
  }
  saveConversations(conversations); // ← add this line
}

export function getAllConversations() {
  return conversations;
}

export function deleteConversation(id) {
  conversations = conversations.filter(c => c.id !== id);
  saveConversations(conversations);
}