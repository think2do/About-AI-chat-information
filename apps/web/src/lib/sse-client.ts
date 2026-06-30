/** SSE streaming client — consumes POST /api/chat/stream via fetch + ReadableStream.

Usage:
  const reader = streamChat(request); // returns { reader, abort }
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    // value is a ChatStreamEvent
  }
*/

import type { ChatStreamEvent } from "@teaching-tool/shared";

export interface ChatStreamOptions {
  signal?: AbortSignal;
  onEvent?: (event: ChatStreamEvent) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export async function* streamChat(
  body: Record<string, unknown>,
  options: ChatStreamOptions = {},
): AsyncGenerator<ChatStreamEvent, void, undefined> {
  const { signal, onEvent, onError, onComplete } = options;

  let response: Response;
  try {
    response = await fetch("/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") {
      const cancelledEvent: ChatStreamEvent = {
        event: "cancelled",
        request_id: "",
        timestamp: new Date().toISOString(),
        partial_content: "",
      };
      onEvent?.(cancelledEvent);
      return;
    }
    const error = err instanceof Error ? err : new Error(String(err));
    onError?.(error);
    throw error;
  }

  if (!response.ok) {
    // Non-streaming error (e.g., validation error)
    try {
      const errorEvent = await response.json() as ChatStreamEvent;
      onEvent?.(errorEvent);
      if (errorEvent.event === "error") {
        throw new Error(errorEvent.message);
      }
    } catch (parseErr) {
      if (parseErr instanceof SyntaxError) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      throw parseErr;
    }
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Response body is not readable");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      // Keep last partial line in buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const dataStr = trimmed.slice(6); // strip "data: " prefix
        if (dataStr === "[DONE]") {
          onComplete?.();
          return;
        }

        try {
          const event = JSON.parse(dataStr) as ChatStreamEvent;
          onEvent?.(event);
          yield event;
        } catch {
          // Skip unparseable lines
        }
      }
    }
  } finally {
    reader.releaseLock();
    onComplete?.();
  }
}
