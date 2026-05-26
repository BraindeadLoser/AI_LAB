import { logEvent }
from "../../Logging/Event_Logging/event_logger.js";

export function bindKeyboardEvents({
    input,
    onSend
}) {

    input.addEventListener(
        "keydown",
        async function (e) {

            if (
                e.key === "Enter" &&
                !e.shiftKey
            ) {

                e.preventDefault();

                logEvent({
                    type: "ui_click",
                    data: {
                        target:
                            "send_button"
                    }
                });

                await onSend();
            }
        }
    );
}