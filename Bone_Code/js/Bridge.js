/**
 * Bridge.js - AI Model Interface with Development Mode Isolation
 * 
 * This module bridges the application with the AI model (dolphin-x1-8b) at LMStudio
 * with a clear separation between development logs and normal chat messages.
 * 
 * DESIGN PRINCIPLE:
 * - When devMode = OFF: Only user messages are sent to AI (normal chat)
 * - When devMode = ON: User messages + development logs are sent as context
 */

const LM_STUDIO_URL = "http://127.0.0.1:1234/v1/chat/completions";
const MODEL = "dolphin-x1-8b";

let isDevMode = false;
let logs = [];

/**
 * Set development mode state
 * @param {boolean} state - true to enable dev mode, false to disable
 */
export function setAIBridgeDevMode(state) {
    isDevMode = state;
    console.log(`[Bridge] Dev Mode: ${isDevMode ? "ON" : "OFF"}`);
}

/**
 * Get current development mode state
 * @returns {boolean}
 */
export function getAIBridgeDevMode() {
    return isDevMode;
}

/**
 * Update logs for AI context (only used when devMode is ON)
 * @param {Array} logArray - Array of log events from logSystem
 */
export function updateBridgeLogs(logArray) {
    if (isDevMode) {
        logs = logArray;
    }
}

/**
 * Format logs into a development context message
 * @returns {string} Formatted logs as text
 */
function formatDevLogs() {
    if (!isDevMode || logs.length === 0) return "";

    const logText = logs
        .map(log => {
            const time = new Date(log.timestamp).toLocaleTimeString();
            const seq = log.seq !== null && log.seq !== undefined ? `[#${log.seq}] ` : "";
            const data = log.data.content || JSON.stringify(log.data);
            return `[${time}] ${seq}${log.type.toUpperCase()}: ${data}`;
        })
        .join("\n");

    return `\n---DEV LOGS---\n${logText}\n---END DEV LOGS---`;
}

/**
 * Build messages array for AI
 * When devMode is ON: includes development logs as system context
 * When devMode is OFF: sends only the regular conversation
 * 
 * @param {Array} conversationMessages - Regular chat messages
 * @returns {Array} Messages formatted for AI model
 */
function buildAIMessages(conversationMessages) {
    const messages = [];

    // If dev mode is ON, inject development logs as system context
    if (isDevMode && logs.length > 0) {
        messages.push({
            role: "system",
            content: `You are an assistant. You have access to development logs for context:\n${formatDevLogs()}\n\nHelp the user with their message while using this context if relevant.`
        });
    }

    // Add all conversation messages
    messages.push(...conversationMessages);

    return messages;
}

/**
 * Send message to AI model
 * Automatically includes development logs if devMode is ON
 * 
 * @param {Array} conversationMessages - Current conversation messages
 * @returns {Promise<ReadableStreamDefaultReader>} Reader for streaming response
 */
export async function sendToAI(conversationMessages) {
    const messages = buildAIMessages(conversationMessages);

    console.log(`[Bridge] Sending to AI - DevMode: ${isDevMode}, Messages: ${messages.length}, Logs: ${logs.length}`);

    const response = await fetch(LM_STUDIO_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: MODEL,
            messages: messages,
            stream: true
        })
    });

    if (!response.ok) {
        throw new Error(`LM Studio error: ${response.status} ${response.statusText}`);
    }

    return response.body.getReader();
}

/**
 * Decode streaming response from AI
 * @param {ReadableStreamDefaultReader} reader - Stream reader
 * @returns {Promise<string>} Complete AI response
 */
export async function decodeAIStream(reader) {
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
                }
            } catch (e) {
                // ignore bad chunks
            }
        }
    }

    return fullText;
}

/**
 * Complete AI request-response cycle
 * Handles streaming and error management
 * 
 * @param {Array} conversationMessages - Current conversation
 * @returns {Promise<string>} Complete AI response
 */
export async function queryAI(conversationMessages) {
    try {
        const reader = await sendToAI(conversationMessages);
        return await decodeAIStream(reader);
    } catch (error) {
        console.error("[Bridge] AI query failed:", error);
        throw error;
    }
}

/**
 * Get Bridge status (for debugging)
 * @returns {Object} Current Bridge state
 */
export function getBridgeStatus() {
    return {
        devMode: isDevMode,
        logsCount: logs.length,
        model: MODEL,
        server: LM_STUDIO_URL,
        timestamp: new Date().toISOString()
    };
}
