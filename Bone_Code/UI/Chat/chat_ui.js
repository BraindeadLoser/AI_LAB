export function addMessage({
  chat,
  text,
  type,
  userColor,
  aiColor,
  captureUserMessage,
  captureAIMessage,
  getMessageSeq,
  incrementMessageSeq,
  shouldLog = true
}) {
  const div = document.createElement("div");

  div.className = "msg " + type;

  if (type === "user") {
    div.style.background = userColor;
  }

  if (type === "ai") {
    div.style.background = aiColor;
  }

  div.innerHTML = marked.parse(text);

  chat.appendChild(div);

  chat.scrollTop = chat.scrollHeight;

if (shouldLog) {
  if (type === "user") {
    captureUserMessage(text, getMessageSeq());
    incrementMessageSeq();
  } else if (type === "ai") {
    captureAIMessage(text, getMessageSeq());
    incrementMessageSeq();
  }
}
  return div;
}

export function createTypingIndicator({
  chat,
  aiColor
}) {
  const typingDiv = document.createElement("div");

  typingDiv.className = "msg ai";
  typingDiv.style.background = aiColor;
  typingDiv.innerText = "...";

  chat.appendChild(typingDiv);

  chat.scrollTop = chat.scrollHeight;

  return typingDiv;
}