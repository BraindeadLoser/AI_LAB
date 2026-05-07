const ALLOWED_FILES = [
    "sample.py",
    "sample.java",
    "sample.go",
    "sample.rb"
];

const MAX_AGENT_LOOPS = 3;

export function listAllowedFiles() {
    return [...ALLOWED_FILES];
}

export function isAllowedFile(filename) {
    return ALLOWED_FILES.includes(filename);
}

export async function readSandboxFile(filename) {

    if (!isAllowedFile(filename)) {
        throw new Error("Access denied");
    }

    const content = await window.ipc.readSandboxFile(filename);

    return {
        filename,
        content
    };
}

export async function executeFileAccessAgent(userPrompt) {

    let loopCount = 0;

    const availableFiles = listAllowedFiles();

    let messages = [
        {
            role: "system",
            content:
`You are a file access assistant operating inside a Docker sandbox.

Available files:
${availableFiles.join("\n")}

Rules:
- Never access files outside the allowed list.
- To read a file, respond ONLY with valid JSON.
- Example:
{
  "tool": "file_access",
  "action": "read",
  "file": "sample.py"
}
- If no file is needed, answer normally.
- Never invent file contents.`
        },
        {
            role: "user",
            content: userPrompt
        }
    ];

    while (loopCount < MAX_AGENT_LOOPS) {

        loopCount++;

        const response = await fetch("http://127.0.0.1:1234/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "local-model",
                temperature: 0,
                messages
            })
        });

        const data = await response.json();
        console.log(data);

        const rawContent = data.choices?.[0]?.message?.content;

console.log(rawContent);

const assistantMessage =
    typeof rawContent === "string"
        ? rawContent.trim()
        : "";
       if (!assistantMessage) {

    console.log(data);

    return "Model returned empty response after file retrieval.";
}
        let toolRequest = null;

        try {
            toolRequest = JSON.parse(assistantMessage);
        }
        catch {
            return assistantMessage;
        }

        if (
            toolRequest.tool !== "file_access" ||
            toolRequest.action !== "read"
        ) {
            return assistantMessage;
        }

        const filename = toolRequest.file;

        if (!isAllowedFile(filename)) {
            throw new Error("Unauthorized file request");
        }

        const fileData = await readSandboxFile(filename);

        messages.push({
            role: "assistant",
            content: assistantMessage
        });

        messages.push({
            role: "system",
            content:
`FILE CONTENTS (${fileData.filename}):

${fileData.content}`
        });
    }

    throw new Error("Agent loop limit exceeded");
}
