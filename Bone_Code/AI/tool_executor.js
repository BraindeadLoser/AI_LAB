import { readSandboxFile } from "../Fetch_Files/file_access.js";
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

        const toolCall = JSON.parse(cleaned);

        if (
            toolCall.tool === "file_access" &&
            toolCall.action === "read"
        ) {

            const fileContent = await readSandboxFile(
                toolCall.file
            );

            const secondPassMessages = [
                ...finalMessages,
                {
                    role: "system",
                    content:
`REAL_FILE_CONTENT:

FILE: ${fileContent.filename}

CONTENT:
${fileContent.content}`
                },
                {
                    role: "system",
                    content:
`CRITICAL INSTRUCTION:

You now possess the REAL file contents retrieved from the sandbox.

You MUST treat the sandbox content as the single source of truth.

You are STRICTLY FORBIDDEN from:
- inventing file contents
- using prior knowledge
- generating example code
- hallucinating placeholder scripts

You MUST answer ONLY using the retrieved file contents.

If the user asks for:
- first line
- exact content
- code excerpts

you MUST extract them EXACTLY from the REAL_FILE_CONTENT block.`
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
        "[TOOL_EXECUTOR] edit_pipeline result:",
        result
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
            result.validationResult.containerId
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

    } catch (e) {}

    return aiResponse;
}