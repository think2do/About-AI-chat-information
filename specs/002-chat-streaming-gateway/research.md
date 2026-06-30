# Research: Chat Streaming 网关 技术选型

**Feature**: 002-chat-streaming-gateway | **Date**: 2026-06-30

## 1. Python 异步 HTTP 客户端: httpx

**Decision**: 使用 `httpx` 作为后端调用 LLM Provider 的 HTTP 客户端。

**Rationale**:
- FastAPI 生态首选异步 HTTP 库，原生支持 `async/await`
- 内置 SSE 流式响应消费（`aiter_lines()` + `aiter_raw()`）
- 支持超时控制（connect/read/write/pool 四维超时）
- 与 Starlette/FastAPI 的 `StreamingResponse` 配合良好

**Alternatives considered**:
- `aiohttp`: 功能强大但 API 更复杂，依赖更重
- `requests` + 线程池: 同步阻塞式，不适合流式 SSE 场景
- `urllib3`: 过于底层，缺少流式消费便利方法

## 2. SSE 协议实现方式: FastAPI StreamingResponse

**Decision**: 后端使用 `fastapi.responses.StreamingResponse` + async generator 实现 SSE，前端使用 `fetch()` + `ReadableStream` + `getReader()` 消费 SSE。

**Rationale**:
- FastAPI 原生 `StreamingResponse` 支持 async generator，零额外依赖
- `fetch` API 是浏览器标准，无需引入 EventSource polyfill（`EventSource` 不支持 POST 请求和自定义 headers）
- `ReadableStream` 可以手动 cancel（调用 `reader.cancel()`），实现取消功能

**Alternatives considered**:
- `EventSource` API: 仅支持 GET 请求，无法传 JSON body，不适用
- `sse.js` 库: 社区库但功能与 fetch + ReadableStream 等价，不引入额外依赖
- WebSocket: 需要双向通信的场景才需要，本阶段仅需单向 SSE 流

## 3. ProviderAdapter 设计: 策略模式 + 抽象基类

**Decision**: 后端使用 `BaseProviderAdapter` 抽象基类 + 4 个具体实现（OpenRouter、AI HubMix、Packy、Custom）的策略模式。

**Rationale**:
- 每个 Provider 的 base URL、请求格式、错误响应格式不同，需要隔离
- 策略模式让添加新 Provider 只需新建一个 adapter 文件，不影响现有代码
- 基类定义统一接口：`build_request()` → `parse_stream()` → `normalize_error()`

**Alternatives considered**:
- if-else 分支在单一函数中: 违反关注点分离，Provider 增多后难以维护
- 前端直接调用各 Provider API: 违反 Constitution 约束（前端不得直接调 LLM API）

## 4. 错误归一化: 8 种错误码 + 中文消息表

**Decision**: 后端 errors/ 模块提供 8 种统一错误码，每个 ProviderAdapter 的 `normalize_error()` 方法将 Provider 特有错误格式映射到统一码。

**Rationale**:
- 来自 Production Refactor Plan §10.2 的 8 种错误码
- 中文消息表独立于 adapter，确保错误提示一致性
- 支持 retryable 标记，前端可据此决定是否提供「重试」按钮

## 5. 取消机制: AbortController + asyncio.CancelledError

**Decision**: 前端使用 `AbortController` 取消 fetch 请求，后端检测 `asyncio.CancelledError` 后发送 `cancelled` 事件并清理资源。

**Rationale**:
- `AbortController` 是浏览器标准 API，无需额外依赖
- 后端 async generator 在被取消时会抛出 `CancelledError`，可被捕获并做清理
- 取消后已收到的部分内容保留在聊天区（per spec acceptance scenario）
