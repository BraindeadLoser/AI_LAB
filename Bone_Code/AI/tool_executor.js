
import {readSandboxFile, readSandboxFileLines, readSandboxSymbol} from "../Fetch_Files/file_access.js";
import { finalizeEdit } from "../Edit_Files/edit_pipeline.js";
import {renderEditApprovalButtons} from "../UI/Buttons/editApprovalButtons.js";

export async function executeToolPipeline(
    aiResponse,
    finalMessages,
    typingDiv
) {
    try {

const cleaned = aiResponse
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

const jsonMatch =
    cleaned.match(/\{[\s\S]*\}/);

if (!jsonMatch) {
    return aiResponse;
}

let toolCall;

try {

    toolCall = JSON.parse(
        jsonMatch[0]
    );

} catch {

    return aiResponse;
}
        if (toolCall.tool === "file_access") {

    let retrieval;
    if (toolCall.action === "read") {
retrieval =
    await readSandboxFile(
        toolCall.file
    );

console.log(
    "[TOOL_EXECUTOR] retrieval:",
    {
        type: "read",
        file: toolCall.file
    }
);

    } else if (
        toolCall.action === "read_lines"
    ) {
retrieval =
    await readSandboxFileLines(
        toolCall.file,
        toolCall.startLine,
        toolCall.endLine
    );

console.log(
    "[TOOL_EXECUTOR] retrieval:",
    {
        type: "read_lines",
        file: toolCall.file,
        startLine:
            toolCall.startLine,
        endLine:
            toolCall.endLine
    }
);
    } else if (
        toolCall.action === "read_symbol"
    ) {
retrieval =
    await readSandboxSymbol(
        toolCall.file,
        toolCall.symbolName
    );

console.log(
    "[TOOL_EXECUTOR] retrieval:",
    {
        type: "read_symbol",
        file: toolCall.file,
        symbolName:
            toolCall.symbolName
    }
);
    } else {
        throw new Error(
            "Unsupported file_access action"
        );
    }

    const secondPassMessages = [
        ...finalMessages,
        {
            role: "system",
            content:
`REAL_RETRIEVAL_RESULT:

${JSON.stringify(
    retrieval,
    null,
    2
)}`
        },
        {
            role: "system",
            content:
`CRITICAL GROUNDING POLICY

REAL_RETRIEVAL_RESULT is the ONLY source of truth.

You MUST:
- answer ONLY from retrieved content
- quote exact code when requested
- explain implementation using retrieved data only
- remain fully grounded

You are STRICTLY FORBIDDEN from:
- inventing code
- hallucinating unseen implementation
- assuming missing behavior
- filling gaps using prior knowledge
- speculating about unseen files

If requested information is absent:
say so clearly.

Never guess.`
        }
    ];
            console.log(JSON.stringify(secondPassMessages, null, 2));
            const secondResponse = await fetch(
                "http://127.0.0.1:1234/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        messages: secondPassMessages,
                        stream: false
                    })
                }
            );

            const secondData =
                await secondResponse.json();

            const groundedAnswer =
                secondData.choices?.[0]?.message?.content ||
                "No grounded response.";

            typingDiv.innerText = groundedAnswer;

            return groundedAnswer;
        }
        
if (
    toolCall.tool === "edit_pipeline"
) {

    console.log(
        "[TOOL_EXECUTOR] edit_pipeline triggered"
    );

    const result =
        await finalizeEdit(
            toolCall.file,
            toolCall.instruction
        );

console.log(
  "[TOOL_EXECUTOR] validation:",
  result.validationResult
);
console.log(
  "[TOOL_EXECUTOR] validation errors:",
  result.validationResult?.errors
);

    if (
        result.success &&
        result.validationResult?.success
    ) {

        typingDiv.innerText =
            "Edit proposed successfully. Review and approve.";

    renderEditApprovalButtons(
        typingDiv,
        result.workingCopy,
        result.validationResult.containerId,
        result.retrieval,
        toolCall.instruction
    );

    } else {

        typingDiv.innerText =
            "Edit validation failed.";
    }

    return JSON.stringify(
        result,
        null,
        2
    );
}

} catch (e) {

    console.log(
        "[TOOL_EXECUTOR] failure:",
        e
    );

    typingDiv.innerText =
        "Tool execution failed.";

    return aiResponse;
}
}