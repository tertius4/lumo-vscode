const vscode = acquireVsCodeApi();

const form = document.getElementById("chat-form");

const message = document.getElementById("message");

const messagesContainer = document.getElementById("messages");
const sendButton = form.querySelector("button");

let assistantMessageElement = null;

/**
 * Add a message from the user to the chat.
 */
function addUserMessage(text) {
  const messageElement = document.createElement("div");

  messageElement.className = "message user-message";
  messageElement.textContent = text;

  messagesContainer.appendChild(messageElement);

  scrollToBottom();
}

/**
 * Create an empty assistant message.
 *
 * The Lumo response will be streamed into this element
 * one chunk at a time.
 */
function addAssistantMessage() {
  const messageElement = document.createElement("div");

  messageElement.className = "message assistant-message";

  messageElement.textContent = "";

  messagesContainer.appendChild(messageElement);

  scrollToBottom();

  return messageElement;
}

/**
 * Append a streamed piece of text to the assistant's message.
 */
function appendAssistantChunk(element, text) {
  alert("Element: " + element);
  if (!element) {
    return;
  }

  element.textContent += text;

  scrollToBottom();
}

/**
 * Enable/disable the input while Lumo is responding.
 */
function setLoading(isLoading) {
  message.disabled = isLoading;

  sendButton.disabled = isLoading;

  if (isLoading) {
    sendButton.textContent = "Thinking...";
  } else {
    sendButton.textContent = "Send";
  }
}

/**
 * Display an error in the conversation.
 */
function showError(text) {
  const errorElement = document.createElement("div");

  errorElement.className = "message error-message";
  errorElement.textContent = `Error: ${text}`;

  messagesContainer.appendChild(errorElement);

  scrollToBottom();
}

/**
 * Keep the latest message visible.
 */
function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Send a message to the VS Code extension.
 */
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = message.value.trim();

  if (!text) {
    return;
  }

  addUserMessage(text);

  assistantMessageElement = addAssistantMessage();

  setLoading(true);

  message.value = "";

  vscode.postMessage({
    type: "sendMessage",
    text: text,
  });
});

/**
 * Receive messages from the VS Code extension.
 */
window.addEventListener("message", (event) => {
  const message = event.data;

  switch (message.type) {
    case "chunk":
      appendAssistantChunk(assistantMessageElement, message.text);
      break;

    case "complete":
      setLoading(false);
      assistantMessageElement = null;
      break;

    case "error":
      setLoading(false);

      if (assistantMessageElement) {
        assistantMessageElement.remove();
        assistantMessageElement = null;
      }

      showError(message.error);
      break;
  }
});
