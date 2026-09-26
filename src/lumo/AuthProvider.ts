import * as vscode from "vscode";

const ACCESS_TOKEN_KEY = "lumo.accessToken";

export class AuthProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  async getHeaders(): Promise<Record<string, string>> {
    const accessToken = await this.getAccessToken();

    return {
      "Cookie": `Session-Id=${accessToken}; Domain=proton.me; Path=/; HttpOnly; SameSite=None; Secure`,
    };
  }

  async setAccessToken(accessToken: string): Promise<void> {
    await this.context.secrets.store(ACCESS_TOKEN_KEY, accessToken);
  }

  async getAccessToken(): Promise<string> {
    const accessToken = await this.context.secrets.get(ACCESS_TOKEN_KEY);

    if (!accessToken) {
      throw new Error("No Lumo access token configured. " + 'Run "Lumo: Set Access Token" first.');
    }

    return accessToken;
  }
}
