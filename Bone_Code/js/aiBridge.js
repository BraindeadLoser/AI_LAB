import { getLogs } from "./logSystem.js";
import AIConnector from "./aiConnector.js";
import { getLogs } from "./logSystem.js";

const ai = new AIConnector("http://127.0.0.1:1234/v1/chat/completions");
const API_URL = "http://127.0.0.1:1234/v1/chat/completions"; // LM Studio
const MODEL = "dolphin-x1-8b"; // ← put your model name here

// 🔒 internal gate (no direct link to button)
let lastLogCount = 0;

export async function sendLogsIfAny() {
    const logs = getLogs(20);

    // only proceed if new logs exist
    if (!logs.length || logs.length === lastLogCount) return null;

    lastLogCount = logs.length;

    const formattedLogs = logs.map(l =>
        `[${l.type}] ${l.seq !== null ? `#${l.seq}` : ""} ${l.data.content || JSON.stringify(l.data)}`
    ).join("\n");

    const body = {
        model: MODEL,
        messages: [
            {
                role: "system",
                content: `
You are a debugging assistant.

Rules:
- Do NOT repeat logs
- Do NOT summarize logs
- Do NOT talk unless user asks a debugging question
- Use logs only as hidden context
- Answer normally unless explicitly asked about issues
                `.trim()
            },
            {
                role: "user",
                content: `
Context logs:
${formattedLogs}

User task: analyze only if needed, otherwise ignore logs.
                `.trim()
            }
        ],
        temperature: 0.3
    };

try {
    return await ai.send(`
Context logs:
${formattedLogs}

Rules:
- Do NOT repeat logs
- Use logs only if needed
- Otherwise behave normally
    `);

} catch (err) {
    console.error("AI BRIDGE ERROR:", err);
    return null;
}
}