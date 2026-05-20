import {
    getAllConversations,
    deleteConversation,
    updateConversation
} from "../js/conversations.js";

export function renderConversations({
    currentConversation,
    setCurrentConversation,
    messages,
    setMessages,
    messageSeq,
    setMessageSeq,
    chat,
    addMessage,
    createConversation,
    logEvent
}) {

    const list = document.getElementById("chatList");

    list.innerHTML = "";

    const conversations = getAllConversations();

    conversations.forEach(conv => {

        // conversation item container
        const item = document.createElement("div");

        item.className = "chat-item";

        if (conv.id === currentConversation.id) {
            item.style.background = "#0a0b14";
        }

        list.appendChild(item);
    });
}