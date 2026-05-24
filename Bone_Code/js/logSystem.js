import {captureClickEvent,captureUserMessageEvent,
  captureAIMessageEvent,captureErrorEvent,
  captureUnhandledPromiseEvent, visualizeEvent} from "../Logging/Event_Logging/event_logger.js";
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
  const entry = captureClickEvent(e);

  visualizeEvent(entry);

  addLog(entry);
});

// --------------------------------------------------
// Event Capture: User Messages
// --------------------------------------------------

function captureUserMessage(content, index) {
  addLog(
    captureUserMessageEvent(content, index)
  );
}

// --------------------------------------------------
// Event Capture: AI Messages
// --------------------------------------------------

function captureAIMessage(content, index) {
  addLog(
    captureAIMessageEvent(content, index)
  );
}

// --------------------------------------------------
// Event Capture: Runtime Errors
// --------------------------------------------------

function captureError(err) {
  addLog(
    captureErrorEvent(err)
  );
}

window.addEventListener("error", captureError);

// --------------------------------------------------
// Event Capture: Unhandled Promises
// --------------------------------------------------

window.addEventListener(
  "unhandledrejection",
  (event) => {
    addLog(
      captureUnhandledPromiseEvent(event)
    );
  }
);

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