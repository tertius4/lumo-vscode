import * as vscode from "vscode";
import { LumoViewProvider } from "./ui/LumoViewProvider";

export function activate(context: vscode.ExtensionContext) {
  const provider = new LumoViewProvider(context);

  context.subscriptions.push(vscode.window.registerWebviewViewProvider("lumo.chat", provider));
}

export function deactivate() {}
