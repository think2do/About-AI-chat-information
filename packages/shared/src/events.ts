/** Unified API error structure. All backend errors use this format. */
export interface ApiError {
  code: string;
  message: string;
  request_id?: string;
  retryable: boolean;
  provider?: string;
  status?: number;
}

/** Unified streaming event types sent from backend to frontend. */
export type ChatStreamEvent =
  | { type: "request_started"; request_id: string; conversation_id: string }
  | { type: "phase"; phase: number; label: string }
  | { type: "delta"; content: string }
  | { type: "usage"; input_tokens?: number; output_tokens?: number; total_tokens?: number }
  | { type: "metrics"; ttft_ms?: number; latency_ms?: number; tps?: number }
  | { type: "completed"; assistant_message_id: string }
  | { type: "error"; error: ApiError }
  | { type: "cancelled"; request_id: string };
