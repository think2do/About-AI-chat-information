/** A single chat message in a conversation. */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  createdAt?: string;
  tokenEstimate?: number;
}

/** LLM model parameters configurable by the student. */
export interface ModelParams {
  temperature: number; // 0–2, step 0.01, default 1
  topP: number; // 0.01–1, step 0.01, default 1
  maxTokens: number; // 16–4096, step 16, default 1024
  frequencyPenalty: number; // 0–2, step 0.01, default 0
  presencePenalty: number; // 0–2, step 0.01, default 0
  reasoningEnabled?: boolean; // default false
}

/** Performance metrics for a completed chat request. */
export interface ChatMetrics {
  requestId?: string;
  ttftMs?: number; // Time To First Token (milliseconds)
  tps?: number; // Tokens Per Second
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  costUsd?: number;
}
