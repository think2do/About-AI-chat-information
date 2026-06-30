# API Contract: POST /api/chat/stream

**Feature**: 002-chat-streaming-gateway | **Version**: 0.1.0

## Request

```
POST /api/chat/stream
Content-Type: application/json
```

### Request Body

```json
{
  "session_id": "anon_a1b2c3d4e5",
  "provider": "openrouter",
  "base_url": "https://openrouter.ai/api/v1",
  "model": "openai/gpt-4o",
  "api_key": "sk-or-v1-...",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "什么是 Transformer？" }
  ],
  "params": {
    "temperature": 0.7,
    "top_p": 1.0,
    "max_tokens": 2048,
    "frequency_penalty": 0,
    "presence_penalty": 0
  },
  "stream": true
}
```

### Validation Rules

| Field | Rule |
|-------|------|
| session_id | 必填，以 `anon_` 开头，10-64 字符 |
| provider | 必填，枚举值: `openrouter`, `aihubmix`, `packy`, `custom` |
| base_url | 必填，合法的 http/https URL |
| model | 必填，非空，最长 100 字符 |
| api_key | 必填，非空，最长 256 字符 |
| messages | 必填，至少 1 条，每条含 role (system/user/assistant) 和 content (string) |
| params.max_tokens | 必填，范围 1-4096 |
| params.temperature | 可选，范围 0-2，默认 0.7 |
| params.top_p | 可选，范围 0-1，默认 1.0 |
| stream | 必填，必须为 true |

## Response

### Success (SSE Stream)

```
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
X-Request-Id: req_a1b2c3d4e5f6

data: {"event":"request_started","request_id":"req_a1b2c3d4e5f6","timestamp":"2026-06-30T12:00:00.000Z"}

data: {"event":"delta","content":"Trans","timestamp":"2026-06-30T12:00:01.234Z"}

data: {"event":"delta","content":"former","timestamp":"2026-06-30T12:00:01.289Z"}

data: {"event":"delta","content":" 是","timestamp":"2026-06-30T12:00:01.345Z"}

data: {"event":"usage","prompt_tokens":42,"completion_tokens":156,"total_tokens":198}

data: {"event":"completed","timestamp":"2026-06-30T12:00:05.678Z"}
```

### Error (Non-streaming)

当错误发生在流式传输开始之前（如参数校验失败），返回普通 JSON：

```json
{
  "event": "error",
  "code": "VALIDATION_ERROR",
  "message": "model 字段不能为空",
  "request_id": "req_a1b2c3d4e5f6",
  "retryable": false,
  "provider": null
}
```

HTTP Status: 400

### Error (In-stream)

当错误发生在流式传输过程中（如 Provider 返回错误），在 SSE 流中返回 error 事件：

```
data: {"event":"error","code":"PROVIDER_AUTH_FAILED","message":"Provider 认证失败，请检查你的 API Key","request_id":"req_a1b2c3d4e5f6","retryable":false,"provider":"openrouter"}
```

### Cancelled

```
data: {"event":"cancelled","request_id":"req_a1b2c3d4e5f6","timestamp":"2026-06-30T12:00:03.000Z","partial_content":"Trans"}
```

## Security

- API Key 仅在本次请求的内存中持有，请求完成后立即释放
- API Key 不得出现在日志、错误响应 body、或任何持久化存储中
- 错误日志中需脱敏处理：移除 Authorization header、api_key 字段
- X-Request-Id 响应头用于追踪，不包含敏感信息
