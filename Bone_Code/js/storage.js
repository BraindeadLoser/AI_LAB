const STORAGE_KEY = "ui_preferences";

export function savePreferences(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error("Save failed:", e);
    }
}

export function loadPreferences() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error("Load failed:", e);
        return null;
    }
}

const CHAT_KEY = "chat_conversations";

export function saveConversations(conversations) {
  try {
    localStorage.setItem(CHAT_KEY, JSON.stringify(conversations));
  } catch (e) {
    console.error("Save conversations failed", e);
  }
}

export function loadConversations() {
  try {
    const data = localStorage.getItem(CHAT_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Load conversations failed", e);
    return [];
  }
}