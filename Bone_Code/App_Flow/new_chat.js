import { createConversation } from "../js/conversations.js";
import { logEvent } from "../Logging/Event_Logging/event_logger.js";

export function newChat({
    chat,
    setCurrentConversation,
    setMessages,
    setMessageSeq
}) {

    const currentConversation =
        createConversation();

    setCurrentConversation(
        currentConversation
    );

    setMessages(
        currentConversation.messages
    );

    setMessageSeq(0);

    chat.innerHTML = "";

    logEvent({
        type: "ui_click",
        data: {
            target:
                "new_chat_button"
        }
    });
}