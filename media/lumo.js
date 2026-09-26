const vscode = acquireVsCodeApi();

const form = document.getElementById("chat-form");

const message = document.getElementById("message");

const response = document.getElementById("response");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  vscode.postMessage({
    type: "sendMessage",
    text: message.value,
  });
});

window.addEventListener("message", (event) => {
  const message = event.data;

  if (message.type === "response") {
    response.textContent = message.text;
  }
});
