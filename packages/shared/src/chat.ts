/** A single chat message in a conversation. */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  createdAt?: string;
  tokenEstimate?: number;
}

/** LLM model parameters configurable by the student. */
export interface ModelParams {
  temperature: number; // 0–2, step 0.01, default 0.7
  topP: number; // 0–1, step 0.01, default 1
  maxTokens: number; // 1–4096, default 2048
  frequencyPenalty: number; // 0–2, step 0.01, default 0
  presencePenalty: number; // 0–2, step 0.01, default 0
  reasoningEnabled?: boolean; // default false
}

/** Request body for POST /api/chat/stream */
export interface ChatStreamRequest {
  session_id: string;
  provider: "openrouter" | "aihubmix" | "packy" | "custom";
  base_url: string;
  model: string;
  api_key: string;
  messages: ChatMessage[];
  params: ModelParams;
  stream: true;
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
