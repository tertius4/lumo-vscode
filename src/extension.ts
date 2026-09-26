import * as vscode from "vscode";

import { LumoViewProvider } from "./ui/LumoViewProvider";
import { AuthProvider } from "./lumo/AuthProvider";

export function activate(context: vscode.ExtensionContext) {
  const authProvider = new AuthProvider(context);

  const provider = new LumoViewProvider(context, authProvider);

  context.subscriptions.push(vscode.window.registerWebviewViewProvider("lumo.chat", provider));

  const setTokenCommand = vscode.commands.registerCommand("lumo.setAccessToken", async () => {
    const token = await vscode.window.showInputBox({
      prompt: "Paste your Lumo access token",
      password: true,
      ignoreFocusOut: true,
    });

    if (!token) {
      return;
    }

    await authProvider.setAccessToken(token);

    vscode.window.showInformationMessage("Lumo access token saved.");
  });

  context.subscriptions.push(setTokenCommand);
}

export function deactivate() {}
