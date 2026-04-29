// import { addLog } from "./logPipeline.js";
let logs = [];
let counter = 0;

const MAX_LOGS = 100;

// 🔒 DEV MODE TOGGLE
let isDevMode = false;

export function setDevMode(state) {
    isDevMode = state;
}

// 📝 OUTPUT TO DOM CONSOLE
function outputToConsole(event) {
    const consoleDiv = document.getElementById("bottom-console");
    if (!consoleDiv) return;

    const logEntry = document.createElement("div");
    logEntry.style.marginBottom = "4px";
    logEntry.style.padding = "2px 0";
    
    const time = new Date(event.timestamp).toLocaleTimeString();
    const typeColor = event.type === "error" ? "#ff4444" : "#00ff00";
    
    logEntry.innerHTML = `<span style="color: #888;">[${time}]</span> <span style="color: ${typeColor};">${event.type.toUpperCase()}${event.seq !== null ? `(#${event.seq})` : ""}:</span> ${event.data.content || JSON.stringify(event.data)}`;
    
    consoleDiv.appendChild(logEntry);
    consoleDiv.scrollTop = consoleDiv.scrollHeight; // auto-scroll to bottom
}

// 🧠 CORE LOGGER
export function logEvent({ type, data = {}, sessionId = "default", seq = null }) {
    const event = {
        id: counter++,
        type,
        timestamp: Date.now(),
        sessionId,
        seq,
        data
    };

    logs.push(event);

    if (logs.length > MAX_LOGS) {
        logs.shift();
    }
    // Always output to console - logs are always captured
    outputToConsole(event);

    return event;
}

// 📤 EXPORT LOGS AS JSON
export function getLogsAsJSON() {
    return JSON.stringify(logs, null, 2);
}

// 💾 DOWNLOAD LOGS AS JSON FILE
export function downloadLogsAsJSON() {
    const json = getLogsAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// 📦 ACCESSORS
export function getLogs(limit = 20) {
    return logs.slice(-limit);
}

export function clearLogs() {
    logs = [];
}

// 🚨 GLOBAL ERROR CAPTURE (with origin details)
export function initErrorLogging() {
    window.onerror = function (message, source, lineno, colno, error) {
        logEvent({
            type: "error",
            data: {
                message,
                source,
                line: lineno,
                column: colno,
                stack: error?.stack
            }
        });
    };

    window.onunhandledrejection = function (event) {
        logEvent({
            type: "error",
            data: {
                message: event.reason?.message || "Unhandled Promise Rejection",
                source: "unhandledRejection",
                line: 0,
                column: 0,
                stack: event.reason?.stack
            }
        });
    };
}

// 📤 DISPLAY ALL LOGS TO CONSOLE
export function displayAllLogs() {
    const consoleDiv = document.getElementById("bottom-console");
    if (!consoleDiv) return;
    
    consoleDiv.innerHTML = ""; // clear old
    logs.forEach(event => outputToConsole(event));
}