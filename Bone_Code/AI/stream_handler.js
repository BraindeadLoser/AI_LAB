export async function handleStream(response, typingDiv, chat) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let aiResponse = "";
    let firstChunk = true;

    while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
            if (line.startsWith("data:")) {
                const jsonStr = line.slice(5).trim();

                if (jsonStr === "[DONE]") continue;

                try {
                    const json = JSON.parse(jsonStr);

                    const content =
                        json.choices?.[0]?.delta?.content || "";

                    if (content) {
                        aiResponse += content;

                        if (firstChunk) {
                            typingDiv.innerText = content;
                            firstChunk = false;
                        } else {
                            typingDiv.innerText += content;
                        }

                        chat.scrollTop = chat.scrollHeight;
                    }
                } catch (e) {
                    // ignore malformed chunks
                }
            }
        }
    }

    return aiResponse;
}