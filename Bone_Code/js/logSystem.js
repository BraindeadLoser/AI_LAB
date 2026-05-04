// logSystem.js (Renderer-safe, DevMode-synchronized via IPC)

let isDevMode = false;

// --------------------------------------------------
// Sync Dev Mode from Main Process
// --------------------------------------------------

async function syncDevMode() {
  try {
    isDevMode = await window.ipc.getDevelopMode();
  } catch (err) {
    console.error("Failed to sync dev mode:", err);
  }
}

// Initial sync on load
syncDevMode();

// --------------------------------------------------
// Public hooks to update state when button is used
// (IMPORTANT: call these from renderer.js after toggle)
// --------------------------------------------------

async function enableDevMode() {
  await window.ipc.enableDevelopMode();
  isDevMode = true;
}

async function disableDevMode() {
  await window.ipc.disableDevelopMode();
  isDevMode = false;
}

// --------------------------------------------------
// Core Log Dispatcher (gated)
// --------------------------------------------------

async function addLog(entry) {
  if (!isDevMode) return;

  try {
    await window.ipc.addLog({
      type: entry.type || "UNKNOWN",
      event: entry.event || "",
      details: entry.details || {}
    });
  } catch (err) {
    console.error("IPC log failed:", err);
  }
}

// --------------------------------------------------
// Event Capture: UI Clicks
// --------------------------------------------------

document.addEventListener("click", (e) => {
  addLog({
    type: "CLICK",
    event: "ui_interaction",
    details: {
      target: e.target.id || e.target.tagName,
      class: e.target.className || null
    }
  });
});

// --------------------------------------------------
// Event Capture: User Messages
// --------------------------------------------------

function captureUserMessage(content, index) {
  addLog({
    type: "USER_MESSAGE",
    event: `message_${index}`,
    details: {
      content,
      index
    }
  });
}

// --------------------------------------------------
// Event Capture: AI Messages
// --------------------------------------------------

function captureAIMessage(content, index) {
  addLog({
    type: "AI_MESSAGE",
    event: `message_${index}`,
    details: {
      content,
      index
    }
  });
}

// --------------------------------------------------
// Event Capture: Runtime Errors
// --------------------------------------------------

window.addEventListener("error", (err) => {
  addLog({
    type: "ERROR",
    event: "runtime",
    details: {
      message: err.message,
      file: err.filename || "unknown",
      line: err.lineno || "unknown",
      col: err.colno || "unknown"
    }
  });
});

// --------------------------------------------------
// Event Capture: Unhandled Promises
// --------------------------------------------------

window.addEventListener("unhandledrejection", (event) => {
  addLog({
    type: "ERROR",
    event: "unhandled_promise",
    details: {
      reason: event.reason?.message || String(event.reason)
    }
  });
});

// --------------------------------------------------
// Lifecycle Log
// --------------------------------------------------

window.addEventListener("DOMContentLoaded", () => {
  addLog({
    type: "SYSTEM",
    event: "renderer_loaded",
    details: {
      url: window.location.href
    }
  });
});

// --------------------------------------------------
// Exports
// --------------------------------------------------

export {
  addLog,
  captureUserMessage,
  captureAIMessage,
  enableDevMode,
  disableDevMode,
  syncDevMode
};