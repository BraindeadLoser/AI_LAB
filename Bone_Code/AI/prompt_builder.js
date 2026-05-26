import { listAllowedFiles } from "../Fetch_Files/file_access.js";

export function buildPrompt(messages, bridge) {

    let systemRules = `
You are an AI assistant.

Logs are background context.
Do NOT mention logs unless explicitly asked.
Use them only if relevant.
`;

    if (bridge.mode === "active") {
        systemRules += `
You MAY analyze logs if useful.
`;
    }

    const finalMessages = [
        {
            role: "system",
            content: systemRules
        },
        {
            role: "system",
            content:
`You operate with TWO response modes.

1. USER RESPONSE MODE
- Used for normal conversation with the user.
- Respond naturally.

2. TOOL REQUEST MODE
- Used ONLY when you need file contents.
- In this mode, respond ONLY with raw JSON.
- No markdown.
- No explanations.
- No extra text.

Tool request format:

{
  "tool": "file_access",
  "action": "read",
  "file": "sample.py"
}

Available files:
${listAllowedFiles().join("\n")}

Never invent file contents.
Only request files when necessary.`
        }
    ];

    if (bridge.logs.length > 0) {
        finalMessages.push({
            role: "system",
            content: `BACKGROUND_LOGS:${JSON.stringify(bridge.logs)}`
        });
    }

    finalMessages.push(...messages);

    return finalMessages;
}