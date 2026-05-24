import {
  getAllConversations,
  deleteConversation,
  updateConversation
} from "../../js/conversations.js";

export function initializeSidebar({
  toggleSidebar,
  newChat,
  renderArgs
}) {
  document
    .getElementById("toggleBtn")
    .addEventListener("click", toggleSidebar);

  document
    .getElementById("newChatBtn")
    .addEventListener("click", () => {
      newChat();
      renderConversations(renderArgs());
    });
}

export function toggleSidebar() {
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

export function enableResize() {
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

export function renderConversations({
  currentConversation,
  restoreMessages,
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
    const item = document.createElement("div");

    item.className = "chat-item";

    if (conv.id === currentConversation.id) {
      item.style.background = "#0a0b14";
    }

    const title = document.createElement("span");
    title.innerText = conv.title || "New Chat";

    const menuBtn = document.createElement("button");
    menuBtn.innerText = "⋯";
    menuBtn.style.float = "right";
    menuBtn.style.background = "transparent";
    menuBtn.style.color = "#ccc";
    menuBtn.style.border = "none";
    menuBtn.style.cursor = "pointer";

    item.appendChild(title);
    item.appendChild(menuBtn);

    const dropdown = document.createElement("div");
    dropdown.className = "dropdown-menu";
    dropdown.style.display = "none";
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

      logEvent({
        type: "ui_click",
        data: { target: "delete_conversation" }
      });

      deleteConversation(conv.id);

      const remaining = getAllConversations();

      if (isActive) {
        const nextConv =
          remaining.length > 0
            ? remaining[0]
            : createConversation();

        setCurrentConversation(nextConv);
        setMessages(nextConv.messages);
        setMessageSeq(0);

        chat.innerHTML = "";
        restoreMessages(nextConv.messages);
      }

      renderConversations({
        currentConversation: isActive
          ? remaining[0]
          : currentConversation,
        setCurrentConversation,
        messages,
        setMessages,
        messageSeq,
        setMessageSeq,
        chat,
        addMessage,
        createConversation,
        restoreMessages,
        logEvent
      });
    };

    const renameOption = document.createElement("div");
    renameOption.innerText = "Rename";

    renameOption.onclick = (e) => {
      e.stopPropagation();

      const input = document.createElement("input");
      input.type = "text";
      input.value = conv.title || "New Chat";
      input.style.width = "120px";

      dropdown.replaceChild(input, renameOption);

      input.addEventListener("click", (ev) => {
        ev.stopPropagation();
      });

      input.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
          const newTitle = input.value.trim();

          if (newTitle !== "") {
            logEvent({
              type: "ui_click",
              data: { target: "rename_conversation" }
            });

            conv.title = newTitle;

            updateConversation(conv.id, messages);

            renderConversations({
              currentConversation,
              restoreMessages,
              setCurrentConversation,
              messages,
              setMessages,
              messageSeq,
              setMessageSeq,
              chat,
              addMessage,
              createConversation,
              logEvent
            });
          }
        }
      });
    };

    dropdown.appendChild(delOption);
    dropdown.appendChild(renameOption);

    item.appendChild(dropdown);

    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      dropdown.style.display =
        dropdown.style.display === "none"
          ? "block"
          : "none";
    });

    item.addEventListener("click", () => {
      setCurrentConversation(conv);
      setMessages(conv.messages);
      setMessageSeq(0);

      logEvent({
        type: "ui_click",
        data: { target: "conversation_item" }
      });

      chat.innerHTML = "";
restoreMessages(conv.messages);
      renderConversations({
        currentConversation: conv,
        setCurrentConversation,
        restoreMessages,
        messages: conv.messages,
        setMessages,
        messageSeq,
        setMessageSeq,
        chat,
        addMessage,
        createConversation,
        logEvent
      });

      dropdown.style.display = "none";
    });

    list.appendChild(item);
  });
}

document.addEventListener("click", (e) => {
  if (
    !e.target.closest(".dropdown-menu") &&
    !e.target.closest("button")
  ) {
    document.querySelectorAll(".dropdown-menu").forEach(menu => {
      menu.style.display = "none";
    });
  }
});