import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class LumoViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "lumo.chat";

  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, "media")],
    };

    webviewView.webview.html = this.getHtml(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      console.log("Message received from Webview:", message);

      if (message.type === "sendMessage") {
        webviewView.webview.postMessage({
          type: "response",
          text: `You asked: ${message.text}`,
        });
      }
    });
  }

  private getHtml(webview: vscode.Webview): string {
    const htmlPath = path.join(this.context.extensionPath, "media", "lumo.html");

    return fs.readFileSync(htmlPath, "utf8");
  }
}
