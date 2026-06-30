# Data Model: 工程骨架共享类型

**Feature**: 001-project-scaffold | **Date**: 2026-06-30

本阶段无数据库实体。定义以下共享 TypeScript 类型，位于 `packages/shared/src/`。

## Entity Definitions

### ProviderId

```ts
type ProviderId = "openrouter" | "aihubmix" | "packy" | "custom";
```

**Source**: spec FR-004, Production Refactor Plan §5.3

### ProviderConfig

```ts
interface ProviderConfig {
  provider: ProviderId;
  label: string;
  baseUrl: string;
  model: string;
  apiKey: string; // only stored in browser localStorage
}
```

**Fields**:
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| provider | ProviderId | yes | Provider 标识符 |
| label | string | yes | 显示名称 |
| baseUrl | string | yes | API 端点基础 URL |
| model | string | yes | 模型标识符 |
| apiKey | string | yes | 仅浏览器 localStorage，不入库 |

### ModelParams

```ts
interface ModelParams {
  temperature: number;    // 0-2, step 0.01, default 1
  topP: number;           // 0.01-1, step 0.01, default 1
  maxTokens: number;      // 16-4096, step 16, default 1024
  frequencyPenalty: number; // 0-2, step 0.01, default 0
  presencePenalty: number;  // 0-2, step 0.01, default 0
  reasoningEnabled?: boolean; // optional, default false
}
```

**Validation**: 范围由滑块 UI 控制，后端二次校验。

### ChatMessage

```ts
interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  createdAt?: string;
  tokenEstimate?: number;
}
```

### ChatMetrics

```ts
interface ChatMetrics {
  requestId?: string;
  ttftMs?: number;
  tps?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  costUsd?: number;
}
```

### PipelineState

```ts
interface PipelineState {
  phase: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  status: "idle" | "running" | "completed" | "error" | "cancelled";
  activeRequestId?: string;
}
```

### ChatStreamEvent

```ts
type ChatStreamEvent =
  | { type: "request_started"; request_id: string; conversation_id: string }
  | { type: "phase"; phase: number; label: string }
  | { type: "delta"; content: string }
  | { type: "usage"; input_tokens?: number; output_tokens?: number; total_tokens?: number }
  | { type: "metrics"; ttft_ms?: number; latency_ms?: number; tps?: number }
  | { type: "completed"; assistant_message_id: string }
  | { type: "error"; error: ApiError }
  | { type: "cancelled"; request_id: string };
```

### ApiError

```ts
interface ApiError {
  code: string;
  message: string;
  request_id?: string;
  retryable: boolean;
  provider?: string;
  status?: number;
}
```

## Entity Relationships

```
ProviderConfig ───────> ProviderId (enum)
ChatMessage  ─────────> ChatMetrics (1 message → 1 metrics)
PipelineState ────────> activeRequestId (string)
ChatStreamEvent ──────> ApiError (error variant only)
```

## State Transitions

### PipelineState

```
idle → running → completed
              → error
              → cancelled
```

### ChatStreamEvent Sequence (happy path)

```
request_started → phase* → delta* → usage? → metrics? → completed
```

## Storage

本阶段无持久化存储。所有类型仅为前端运行时使用和后端请求校验。
