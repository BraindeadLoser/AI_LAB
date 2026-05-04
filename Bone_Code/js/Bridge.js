/**
 * Bridge.js
 * ----------------------------------------
 * Purpose:
 * Acts as a controlled "context bridge" between:
 *   - SQLite logs (via Electron main process)
 *   - AI model input (renderer → LM Studio)
 *
 * Responsibilities:
 *   1. Request recent logs via IPC
 *   2. Normalize + compress logs
 *   3. Determine usage mode (passive / active)
 *   4. Output structured, token-efficient context
 *
 * IMPORTANT ARCHITECTURE RULE:
 * - NO direct database access here
 * - All DB reads must go through preload → IPC → main
 */

/**
 * Configuration constants
 */
const MAX_LOGS = 10;          // Hard cap to prevent token explosion
const MAX_DETAIL_LENGTH = 30; // Max characters for compressed details

/**
 * Entry point: Build bridge payload
 * @param {string} userInput - raw user message
 * @returns {Promise<Object>} structured bridge output
 */
export async function buildBridgeContext(userInput) {
  try {
    const isDevMode = await window.ipc.getDevelopMode();

    if (!isDevMode) {
      return { mode: "passive", logs: [] };
    }

    const rawLogs = await window.ipc.getRecentLogs(10);

    // Step 1: Determine mode based on user intent
    const mode = detectMode(userInput);

    // Step 2: Normalize logs (already fetched above)

    // Step 3: Normalize + compress logs
    const logs = rawLogs.map(normalizeLog);

    // Step 4: Return structured payload
    return {
      mode,
      logs
    };

  } catch (error) {
    console.error("Bridge.js error:", error);

    // Fail-safe: never break chat flow
    return {
      mode: "passive",
      logs: []
    };
  }
}

/**
 * Detect whether logs should be actively used
 * @param {string} input
 * @returns {"passive" | "active"}
 */
function detectMode(input) {
  const triggers = ["log", "error", "debug", "issue", "problem"];

  const lower = input.toLowerCase();

  // If user explicitly refers to logs → active mode
  const isActive = triggers.some(word => lower.includes(word));

  return isActive ? "active" : "passive";
}

/**
 * Normalize and compress a single log entry
 * @param {Object} log - raw DB log row
 * @returns {Object} compressed log object
 */
function normalizeLog(log) {
  return {
    t: compressTimestamp(log.timestamp),
    type: normalizeType(log.type),
    event: log.event,
    d: compressDetails(log.type, log.details)
  };
}

/**
 * Convert ISO timestamp → short time (HH:MM:SS)
 */
function compressTimestamp(ts) {
  try {
    const date = new Date(ts);
    return date.toTimeString().split(" ")[0]; // "08:37:10"
  } catch {
    return "00:00:00"; // fallback
  }
}

/**
 * Normalize type field (reduce verbosity)
 */
function normalizeType(type) {
  switch (type) {
    case "CLICK": return "click";
    case "AI_MESSAGE": return "ai";
    case "USER_MESSAGE": return "user";
    case "ERROR": return "error";
    default: return type.toLowerCase();
  }
}

/**
 * Compress details field based on log type
 * @param {string} type
 * @param {string|Object} details
 */
function compressDetails(type, details) {
  try {
    // Ensure details is parsed JSON
    const parsed = typeof details === "string" ? JSON.parse(details) : details;

    switch (type) {
      case "CLICK":
        return `target:${parsed.target || "unknown"}`;

      case "AI_MESSAGE":
        return `msg:${shorten(parsed.content)}`;

      case "USER_MESSAGE":
        return `msg:${shorten(parsed.content)}`;

      case "ERROR":
        return `err:${shorten(parsed.message || parsed.error || "unknown")}`;

      default:
        return shorten(JSON.stringify(parsed));
    }

  } catch {
    return "invalid_details";
  }
}

/**
 * Hard truncate text to control token usage
 */
function shorten(text) {
  if (!text) return "";
  return text.length > MAX_DETAIL_LENGTH
    ? text.slice(0, MAX_DETAIL_LENGTH)
    : text;
}