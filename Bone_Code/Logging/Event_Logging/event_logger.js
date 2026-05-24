import customConsole from "../../js/console.js";

function logToConsole(entry) {
  customConsole.log(
    entry.type || "INFO",
    "app",
    entry.details || {}
  );
}

export function captureClickEvent(e) {
  const target = e.target.closest(
    `
      #sendBtn,
      #newChatBtn,
      #devToggle,
      #consoleToggleBtn,
      .resize-handle,
      .conversation-item,
      [data-action],
      button,
      [id]
    `
  );

  let entry = {
    type: "CLICK",
    event: "ui_interaction",
    details: {}
  };

  if (!target) {
    entry.details.target = "unknown";
    visualizeEvent(entry);
    return entry;
  }

  // ---------- Explicit IDs ----------
  switch (target.id) {
    case "sendBtn":
      entry.event = "send_button";
      break;

    case "newChatBtn":
      entry.event = "new_chat_button";
      break;

    case "devToggle":
      entry.event = "dev_toggle";
      break;

    case "consoleToggleBtn":
      entry.event = "console_toggle";
      break;
  }

  // ---------- Sidebar Resize ----------
  if (
    target.classList.contains("resize-handle")
  ) {
    entry.event = "sidebar_resize";
  }

  // ---------- Conversation Selection ----------
  if (
    target.classList.contains(
      "conversation-item"
    )
  ) {
    entry.event = "conversation_select";
  }

  // ---------- Future-proof Actions ----------
  if (target.dataset?.action) {
    entry.event =
      target.dataset.action;
  }

  // ---------- Metadata ----------
  entry.details = {
    target:
      target.id ||
      target.dataset?.action ||
      target.className ||
      target.tagName
  };

  visualizeEvent(entry);

  return entry;
}

export function visualizeEvent(entry) {
  logToConsole(entry);
}

export function logEvent(entry) {
  visualizeEvent({
    type: entry.type || "INFO",
    event: entry.event || "ui_interaction",
    details: entry.data || entry.details || {}
  });
}

export function captureUserMessageEvent(content, index) {
  const entry = {
    type: "USER_MESSAGE",
    event: `message_${index}`,
    details: {
      content,
      index
    }
  };

  visualizeEvent(entry);

  return entry;
}

export function captureAIMessageEvent(content, index) {
  const entry = {
    type: "AI_MESSAGE",
    event: `message_${index}`,
    details: {
      content,
      index
    }
  };

  visualizeEvent(entry);

  return entry;
}

export function captureErrorEvent(err) {
  const entry = {
    type: "ERROR",
    event: "runtime",
    details: {
      message: err.message || "unknown",
      file: err.filename || "unknown",
      line: err.lineno || "unknown",
      col: err.colno || "unknown"
    }
  };

  visualizeEvent(entry);

  return entry;
}

export function captureUnhandledPromiseEvent(event) {
  const entry = {
    type: "ERROR",
    event: "unhandled_promise",
    details: {
      reason:
        event.reason?.message ||
        String(event.reason)
    }
  };

  visualizeEvent(entry);

  return entry;
}