import * as vscode from "vscode";

export interface CodeContext {
  fileName?: string;
  language?: string;
  selectedText?: string;
}

export class ContextProvider {
  getCurrentContext(): CodeContext {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return {};
    }

    const document = editor.document;
    const selection = editor.selection;

    return {
      fileName: vscode.workspace.asRelativePath(document.uri),
      language: document.languageId,
      selectedText: document.getText(selection),
    };
  }
}
