import { sendToAI } from "../AI/ai_client.js";
import { buildPrompt } from "../AI/prompt_builder.js";
import { executeToolPipeline } from "../AI/tool_executor.js";
import { createTypingIndicator, addMessage } from "../UI/Chat/chat_ui.js";
import { buildBridgeContext } from "../js/Bridge.js";
import { updateConversation } from "../js/conversations.js";
import { logEvent } from "../Logging/Event_Logging/event_logger.js";

export async function sendMessage({
    chat,
    input,
    messages,
    currentConversation,
    captureUserMessage,
    captureAIMessage,
    messageSeq,
    setMessageSeq
}) {

    const msg = input.value;

    if (!msg) return;

    addMessage({
        chat,
        text: msg,
        type: "user",
        userColor: document.getElementById("userColor").value,
        aiColor: document.getElementById("aiColor").value,
        captureUserMessage,
        captureAIMessage,
        getMessageSeq: () => messageSeq,
        incrementMessageSeq: () => {},
        shouldLog: false
    });

    messages.push({
        role: "user",
        content: msg
    });

    updateConversation(currentConversation.id, messages);

    input.value = "";

    const typingDiv = createTypingIndicator({
        chat,
        aiColor: document.getElementById("aiColor").value
    });

    try {

        const bridge = await buildBridgeContext(msg);

        const finalMessages = buildPrompt(
            messages,
            bridge
        );

        console.log(
            JSON.stringify(finalMessages, null, 2)
        );

        let aiResponse = await sendToAI(
            finalMessages,
            typingDiv,
            chat
        );

        aiResponse = await executeToolPipeline(
            aiResponse,
            finalMessages,
            typingDiv
        );

        messages.push({
            role: "assistant",
            content: aiResponse
        });

        updateConversation(
            currentConversation.id,
            messages
        );

        captureAIMessage(
            aiResponse,
            messageSeq
        );

        setMessageSeq(messageSeq + 1);

    } catch (err) {

        logEvent({
            type: "error",
            data: {
                message: "Error in send function",
                stack: err.stack
            }
        });

        messages.pop();

        updateConversation(
            currentConversation.id,
            messages
        );

        typingDiv.innerText =
            "Error occurred";
    }
}