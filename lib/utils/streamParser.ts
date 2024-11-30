import { ChatResponse } from "ollama";

export interface StreamParserOptions {
  format: "openai" | "ollama";
  debug?: boolean; // Optional debug flag for logging
}

export type OnParseCallback = (data: ChatResponse) => void;
export type OnFinishCallback = (finalContent?: string) => void;
export type OnErrorCallback = (error: unknown) => void;

export class StreamParser {
  private decoder = new TextDecoder();
  private accumulatedContent = "";
  private buffer = "";
  private onParse: OnParseCallback;
  private onFinish: OnFinishCallback;
  private onError: OnErrorCallback;
  private format: "openai" | "ollama";
  private debug: boolean;

  constructor(
    options: StreamParserOptions,
    onParse: OnParseCallback,
    onFinish: OnFinishCallback,
    onError: OnErrorCallback
  ) {
    this.format = options.format;
    this.debug = options.debug || false; // Enable debug logging if passed
    this.onParse = onParse;
    this.onFinish = onFinish;
    this.onError = onError;
  }

  async parse(stream: ReadableStream<Uint8Array>) {
    const reader = stream.getReader();

    try {
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          this.buffer += this.decoder.decode(value, { stream: true });
          if (this.debug) console.log("Buffer:", this.buffer);

          // Parse based on format
          if (this.format === "openai") {
            this.buffer = this.parseOpenAIStream(this.buffer);
            if (this.debug) console.log("OpenAI Buffer:", this.buffer);
          } else if (this.format === "ollama") {
            this.buffer = this.parseOllamaStream(this.buffer);
            if (this.debug) console.log("Ollama Buffer:", this.buffer);
          }
        }
      }

      // Handle any remaining buffer
      if (this.buffer.length > 0) {
        if (this.format === "openai") {
          this.parseOpenAIStream(this.buffer, true);
          if (this.debug) console.log("OpenAI Remaining Buffer:", this.buffer);
        } else if (this.format === "ollama") {
          this.parseOllamaStream(this.buffer, true);
          if (this.debug) console.log("Ollama Remaining Buffer:", this.buffer);
        }
      }

      // Finish with accumulated content
      this.onFinish(this.accumulatedContent);
    } catch (error) {
      this.onError(error);
    }
  }

  private parseOpenAIStream(buffer: string, isFinal: boolean = false): string {
    const lines = buffer.split("\n");
    if (this.debug) console.log("OpenAI-lines:", lines);
    const incompleteLine = isFinal ? "" : lines.pop() || "";

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue; // Skip empty lines

      if (trimmedLine === "data: [DONE]") {
        this.onFinish(this.accumulatedContent);
        return "";
      }

      if (trimmedLine.startsWith("data: ")) {
        const jsonStr = trimmedLine.substring("data: ".length);
        try {
          const parsed = JSON.parse(jsonStr);
          const contentDelta = parsed.choices?.[0]?.delta?.content;

          // Accumulate content if available
          if (contentDelta) {
            this.accumulatedContent += contentDelta;
          }

          // Pass parsed data back to the callback
          this.onParse(parsed);
        } catch (error: unknown) {
          console.error("Error parsing JSON from OpenAI:", error);
          this.onError(`OpenAI JSON parsing error: ${error}`);
        }
      }
    }

    return incompleteLine;
  }

  private parseOllamaStream(buffer: string, isFinal: boolean = false): string {
    const lines = buffer.split("\n");
    if (this.debug) console.log("Ollama-lines:", lines);
    const incompleteLine = isFinal ? "" : lines.pop() || "";

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue; // Skip empty lines

      try {
        const parsed = JSON.parse(trimmedLine);

        // Pass parsed data back to the callback
        this.onParse(parsed);
      } catch (error: unknown) {
        console.error("Error parsing JSON from Ollama:", error);
        this.onError(`Ollama JSON parsing error: ${error}`);
      }
    }

    return incompleteLine;
  }
}
