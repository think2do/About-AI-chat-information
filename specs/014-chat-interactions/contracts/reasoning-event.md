# Contract: reasoning SSE 事件 + CoT 请求

## 新增 SSE 事件 `reasoning`
后端在 OpenRouter 流中遇到 `choices[0].delta.reasoning` 时产出：
```json
{ "event": "reasoning", "content": "模型的思维链增量…", "timestamp": "..." }
```
- 与 `delta`（答案增量）并列、可交替出现。
- 前端累积到当前 assistant 消息的 `reasoning` 字段，单独渲染。

### 类型（packages/shared/src/events.ts）
```ts
export interface ReasoningEvent { event: "reasoning"; content: string; timestamp: string; }
// 并入：export type ChatStreamEvent = ... | ReasoningEvent;
```

## CoT 请求（openrouter_adapter.build_request）
`req.params.reasoning_enabled === true` 时，请求体追加：
```json
"reasoning": { "effort": "medium" }
```
其余 Provider / 关闭时不加。

## 请求 params（修正 params:{}）
前端 `api.ts` 发送的 `params` 始终包含：
```json
{ "temperature":0.7, "top_p":1.0, "max_tokens":2048,
  "frequency_penalty":0, "presence_penalty":0, "reasoning_enabled":false }
```

## 逐条消息指标（前端测量，不入 API 契约）
`DisplayMessage`（assistant）携带 `{ ttftMs?, tps?, outputTokens?, reasoning? }`，由 `page.tsx` 流式回调填充。

## 后端测试要点（test_openrouter_reasoning.py）
- `build_request`：`reasoning_enabled=True` → body 含 `reasoning={"effort":"medium"}`；`False` → 不含。
- `parse_stream`：喂入含 `delta.reasoning` 的 chunk → 产出 `event=="reasoning"` 且 content 正确；含 `delta.content` 的 chunk → 仍产出 `delta`。
