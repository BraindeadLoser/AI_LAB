import { addMessage } from "../UI/Chat/chat_ui.js";

export function restoreMessages({
    chat,
    targetMessages,
    userColor,
    aiColor
}) {

    chat.innerHTML = "";

    targetMessages.forEach((m) => {
        addMessage({
            chat,
            text: m.content,
            type: m.role === "user"
                ? "user"
                : "ai",

            userColor,
            aiColor,

            captureUserMessage: () => {},
            captureAIMessage: () => {},

            getMessageSeq: () => 0,
            incrementMessageSeq: () => {},

            shouldLog: false
        });
    });
}