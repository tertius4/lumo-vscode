import { AuthProvider } from "./AuthProvider";
import { LumoRequest } from "./types";

const LUMO_ENDPOINT = "https://lumo.proton.me/api/ai/v1/chat/completions";

export class LumoClient {
  constructor(private readonly authProvider: AuthProvider) {}

  async streamMessage(request: LumoRequest, onChunk: (chunk: string) => void): Promise<void> {
    console.log("Streaming message:", request.message);
    const headers = await this.authProvider.getHeaders();

    const systemPrompt = this.buildSystemPrompt(request);

    const payload = {
      model: "lumo-max",

      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: request.message,
        },
      ],
    };

    headers["Content-Type"] = "application/json";
    headers["Accept"] = "text/event-stream";
    headers["x-pm-appversion"] = "web-lumo@1.3.3.0";
    headers["User-Agent"] = "Mozilla/5.0";

    const response = await fetch(LUMO_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    console.log("After response");

    if (!response.ok) {
      throw new Error(`Lumo request failed: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error("Lumo returned an empty response body.");
    }

    await this.readStream(response.body, onChunk);
  }

  private buildSystemPrompt(request: LumoRequest): string {
    const context = request.context;

    let prompt = `
    You are Lumo, acting as a coding assistant inside Visual Studio Code.

    Help the developer understand, debug, and write code.

    Be concise and practical, ignore emotions and keep us honest.
            `.trim();

    if (context.fileName) {
      prompt += `\n\nCurrent file: ${context.fileName}`;
    }

    if (context.language) {
      prompt += `\nLanguage: ${context.language}`;
    }

    if (context.selectedText) {
      prompt += "\n\nSelected code:\n" + "```" + context.language + "\n" + context.selectedText + "\n```";
    }

    return prompt;
  }

  private async readStream(body: ReadableStream<Uint8Array>, onChunk: (chunk: string) => void): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, {
        stream: true,
      });

      const events = buffer.split("\n\n");

      buffer = events.pop() ?? "";

      for (const event of events) {
        const text = this.parseSseEvent(event);
        console.log("Parsed SSE event:", text);
        if (text) {
          onChunk(text);
        }
      }
    }

    buffer += decoder.decode();
    console.log("buffer", JSON.stringify(buffer, null, 2));

    const text = this.parseSseEvent(buffer);

    if (text) {
      onChunk(text);
    }
  }

  private parseSseEvent(data: string): string | null {
    if (data === "[DONE]") {
      return null;
    }

    try {
      const parsed = JSON.parse(data);

      return parsed.choices?.[0]?.message?.content ?? null;
    } catch {
      return null;
    }
  }
}
