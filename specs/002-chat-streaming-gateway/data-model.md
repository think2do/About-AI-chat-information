# Data Model: Chat Streaming 网关

**Feature**: 002-chat-streaming-gateway | **Date**: 2026-06-30

## Entities

### 1. ChatStreamRequest（后端 Pydantic 模型）

前端发送到 `POST /api/chat/stream` 的请求体。

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| session_id | string | yes | 以 `anon_` 开头，长度 10-64 |
| provider | ProviderId | yes | openrouter\|aihubmix\|packy\|custom |
| base_url | str | yes | http:// 或 https:// URL |
| model | str | yes | 非空，长度 1-100 |
| api_key | str | yes | 非空，长度 1-256 |
| messages | list[ChatMessage] | yes | 至少 1 条 role=user 的消息 |
| params | ModelParams | yes | max_tokens 范围 1-4096 |
| stream | bool | yes (default true) | 必须为 true |

### 2. ChatStreamEvent（SSE 事件类型）

后端通过 SSE 流式返回的统一事件格式。每个事件是一个 JSON 行，前缀 `data: `。

| Event Type | Payload | 触发时机 |
|------------|---------|----------|
| `request_started` | `{ event: "request_started", request_id: str, timestamp: str }` | 请求开始处理时 |
| `delta` | `{ event: "delta", content: str, timestamp: str }` | 每收到一个 Provider delta chunk |
| `usage` | `{ event: "usage", prompt_tokens: int, completion_tokens: int, total_tokens: int }` | Provider 返回 usage 信息时（可选）|
| `completed` | `{ event: "completed", timestamp: str }` | 流式传输正常完成时 |
| `error` | `{ event: "error", code: str, message: str, request_id: str, retryable: bool, provider: str }` | 任何错误发生时 |
| `cancelled` | `{ event: "cancelled", request_id: str, timestamp: str, partial_content: str }` | 学生取消请求时 |

### 3. ApiError（统一错误码）

8 种错误码及其属性：

| Code | HTTP Status | Message (中文) | Retryable |
|------|-------------|----------------|-----------|
| VALIDATION_ERROR | 400 | 请求参数不合法 | false |
| MISSING_API_KEY | 400 | 请先配置 API Key | false |
| PROVIDER_AUTH_FAILED | 502 | Provider 认证失败，请检查你的 API Key | false |
| PROVIDER_RATE_LIMITED | 429 | 当前 Provider 请求过于频繁，请稍后重试 | true |
| PROVIDER_ERROR | 502 | Provider 服务错误，请稍后重试 | true |
| STREAM_INTERRUPTED | 502 | 流式传输中断，请检查网络或重试 | true |
| REQUEST_TIMEOUT | 504 | 请求超时，请稍后重试 | true |
| REQUEST_CANCELLED | 499 | 请求已取消 | false |

### 4. ProviderAdapter（后端策略接口）

抽象基类定义：

```python
class BaseProviderAdapter(ABC):
    @abstractmethod
    def build_request(self, req: ChatStreamRequest) -> httpx.Request:
        """将内部请求转换为 Provider 特定格式的 HTTP 请求"""
    
    @abstractmethod
    async def parse_stream(self, response: httpx.Response) -> AsyncIterator[ChatStreamEvent]:
        """将 Provider 的 SSE 响应解析为统一的 ChatStreamEvent 流"""
    
    @abstractmethod
    def normalize_error(self, response: httpx.Response, error_body: str) -> ApiError:
        """将 Provider 的错误响应归一化为统一的 ApiError"""
```

具体实现：
- `OpenRouterAdapter`: base_url = `https://openrouter.ai/api/v1/chat/completions`，OpenAI 兼容格式
- `AIHubMixAdapter`: base_url = `https://aihubmix.com/v1/chat/completions`，OpenAI 兼容格式
- `PackyAdapter`: base_url = `https://api.packy.top/v1/chat/completions`，OpenAI 兼容格式
- `CustomAdapter`: base_url 由前端传入，OpenAI 兼容格式
