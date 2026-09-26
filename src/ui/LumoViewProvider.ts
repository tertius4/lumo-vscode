import { ContextProvider } from "../context/ContextProvider";
import { AuthProvider } from "../lumo/AuthProvider";
import { LumoClient } from "../lumo/LumoClient";

import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class LumoViewProvider implements vscode.WebviewViewProvider {
  private readonly contextProvider: ContextProvider;
  private readonly authProvider: AuthProvider;
  private readonly lumoClient: LumoClient;

  public static readonly viewType = "lumo.chat";
  constructor(
    private readonly context: vscode.ExtensionContext,
    authProvider: AuthProvider,
  ) {
    this.contextProvider = new ContextProvider();
    this.authProvider = authProvider;
    this.lumoClient = new LumoClient(this.authProvider);
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, "media")],
    };

    webviewView.webview.html = this.getHtml(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message: { type: string; text: string }) => {
      console.log("Message received from Webview:", message);
      if (message.type !== "sendMessage") {
        return;
      }

      try {
        const context = this.contextProvider.getCurrentContext();

        const request = {
          message: message.text,
          context,
        };

        await this.lumoClient.streamMessage(request, (chunk) => {
          webviewView.webview.postMessage({
            type: "chunk",
            text: chunk,
          });
        });

        webviewView.webview.postMessage({
          type: "complete",
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error sending message to Lumo:", error);
        webviewView.webview.postMessage({
          type: "error",
          text: errorMessage,
        });
      }
    });
  }

  private getHtml(webview: vscode.Webview): string {
    const htmlPath = path.join(this.context.extensionPath, "media", "lumo.html");

    let html = fs.readFileSync(htmlPath, "utf8");

    const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "media", "lumo.css"));

    const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "media", "lumo.js"));

    html = html.replace("{{CSS_URI}}", cssUri.toString());

    html = html.replace("{{JS_URI}}", jsUri.toString());

    return html;
  }
}
