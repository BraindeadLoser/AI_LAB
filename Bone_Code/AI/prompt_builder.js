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
  "instruction": "modify sample.py to print till 10"
}

RULES

- NEVER generate replacement code.
- NEVER generate newContent.
- NEVER include start/end.
- NEVER include approve.
- Pass the user's edit intent through instruction.
- edit_pipeline will retrieve the REAL file, generate edits, validate, and handle approval.

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