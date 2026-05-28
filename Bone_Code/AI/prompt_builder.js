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
- Used ONLY when file access or file editing is required.
- Respond ONLY with raw JSON.
- No markdown.
- No explanations.
- No extra text.

AVAILABLE TOOLS

A) FILE ACCESS TOOL

Use ONLY when the user:
- wants file contents
- asks questions about a file
- wants to inspect code

Format:

{
  "tool": "file_access",
  "action": "read",
  "file": "sample.py"
}

B) EDIT TOOL

Use ONLY when the user:
- requests code changes
- requests rewriting
- requests modifications
- requests edits

Format:

{
  "tool": "edit_pipeline",
  "file": "sample.py",
  "start": 1,
  "end": 10,
  "newContent": "replacement code",
  "approve": false
}

IMPORTANT RULES

- Reading request → file_access only.
- Editing request → edit_pipeline only.
- Never call both tools unless explicitly necessary.
- Never invent file contents.
- Never generate example edits when edit_pipeline should be used.

Available files:
${listAllowedFiles().join("\n")}`
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