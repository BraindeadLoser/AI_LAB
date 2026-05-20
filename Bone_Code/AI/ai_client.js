import { handleStream } from "./stream_handler.js";

export async function sendToAI(finalMessages, typingDiv, chat) {
    console.log(JSON.stringify(finalMessages, null, 2));
    const response = await fetch(
        "http://127.0.0.1:1234/v1/chat/completions",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: finalMessages,
                stream: true
            })
        }
    );

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return await handleStream(response, typingDiv, chat);
}