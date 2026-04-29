// aiConnector.js
import { getLogs } from "./logSystem.js";

export default class AIConnector {
  constructor(baseUrl) {
    this.baseUrl = baseUrl; // e.g. "http://127.0.0.1:1234"
  }

  // Generic send method for chat or single log
  async send(prompt) {
    // ✅ prepare logs OUTSIDE body
    const logs = getLogs(20);

    const formattedLogs = logs.map(l =>
      `[${l.type}] ${l.seq !== null ? `#${l.seq}` : ""} ${l.data.content || JSON.stringify(l.data)}`
    ).join("\n");

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "dolphin-x1-8b",
        messages: [
          {
            role: "system",
content: `
You are an assistant with access to real application logs.

STRICT RULES:
- You MUST ONLY answer using the provided logs
- If logs do NOT contain the answer, say: "No data available in logs"
- NEVER invent UI actions, timestamps, or system behavior
- NEVER assume anything outside logs
- DO NOT generalize or guess
- Logs are the ONLY source of truth

If the user asks about UI actions, timestamps, or behavior:
→ Answer strictly from logs
`.trim()
          },
          {
            role: "user",
            content: `
User message:
${prompt}

Context logs:
${formattedLogs}
            `.trim()
          }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  }

  // Specialized method for log batches
  async analyzeLogs(batch) {
    const prompt = `Analyze these logs:\n${JSON.stringify(batch, null, 2)}`;
    return await this.send(prompt);
  }
}