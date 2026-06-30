/** Unified streaming event types sent from backend to frontend via SSE. */

/** Emitted when request processing begins. */
export interface RequestStartedEvent {
  event: "request_started";
  request_id: string;
  timestamp: string;
}

/** Emitted for each text chunk from the LLM. */
export interface DeltaEvent {
  event: "delta";
  content: string;
  timestamp: string;
}

/** Emitted for each chain-of-thought (reasoning) chunk, when CoT is enabled. */
export interface ReasoningEvent {
  event: "reasoning";
  content: string;
  timestamp: string;
}

/** Emitted when Provider returns token usage info (optional — some Providers don't). */
export interface UsageEvent {
  event: "usage";
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

/** Emitted when streaming completes normally. */
export interface CompletedEvent {
  event: "completed";
  timestamp: string;
}

/** Emitted when an error occurs (before or during streaming). */
export interface ErrorEvent {
  event: "error";
  code: string;
  message: string;
  request_id: string;
  retryable: boolean;
  provider?: string;
}

/** Emitted when the student cancels a streaming request. */
export interface CancelledEvent {
  event: "cancelled";
  request_id: string;
  timestamp: string;
  partial_content: string;
}

/** Union type of all possible Chat Stream SSE events. */
export type ChatStreamEvent =
  | RequestStartedEvent
  | DeltaEvent
  | ReasoningEvent
  | UsageEvent
  | CompletedEvent
  | ErrorEvent
  | CancelledEvent;

/** Unified API error structure. All backend errors use this format. */
export interface ApiError {
  code: string;
  message: string;
  request_id?: string;
  retryable: boolean;
  provider?: string;
  status?: number;
}
