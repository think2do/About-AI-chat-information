# Feature Specification: Chat Streaming 网关 (Chat Streaming Gateway)

**Feature Branch**: `002-chat-streaming-gateway`

**Created**: 2026-06-30

**Status**: Draft

**Input**: 实现 POST /api/chat/stream 最小闭环——前端发送聊天请求，后端统一转发到 LLM Provider 并以统一事件格式流式返回给浏览器。这是整个教学工具的核心功能。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 学生发送问题并看到流式回复 (Priority: P1)

作为一名学生用户，我希望在 Chat 页面输入问题后点击发送，看到 AI 的回复像打字一样逐字流式出现，就像现在静态 Demo 的体验一样。

**Why this priority**: 这是整个教学工具的核心价值——让学生亲手操作并实时观察 LLM 的生成过程。没有这个功能，其他教学模块都是空壳。

**Independent Test**: 打开 Chat 页面 → 输入一句测试问题 → 点击发送 → 观察 AI 回复逐字出现在页面上 → 回复完成后显示完整内容。

**Acceptance Scenarios**:

1. **Given** 学生已在设置中配置了可用的 API Key 和 Provider，**When** 学生在 Chat 页面输入问题并点击发送，**Then** AI 回复以流式方式逐字出现在聊天区域。
2. **Given** 学生发送了消息且流式回复正在进行中，**When** 流式传输正常完成，**Then** 完整的 AI 回复保留在聊天历史中。
3. **Given** 学生发送了消息且流式回复正在进行中，**When** 学生点击取消按钮，**Then** 流式传输立即停止，已收到的部分内容保留在聊天区。

---

### User Story 2 - Provider 错误友好提示 (Priority: P1)

作为一名学生用户，当我的 API Key 无效、余额不足、或 Provider 服务异常时，我希望看到清晰的中文错误提示，告诉我问题出在哪里以及可以怎么解决，而不是看不懂的英文错误码或技术堆栈。

**Why this priority**: 学生使用自己的 API Key，Key 相关问题是最常见的故障场景。如果错误提示不友好，学生会认为工具本身坏了。

**Independent Test**: 使用无效 API Key 发送消息 → 页面显示「Provider 认证失败，请检查你的 API Key」→ 修改为正确 Key 后重试成功。

**Acceptance Scenarios**:

1. **Given** 学生配置的 API Key 无效或被撤销，**When** 学生发送消息，**Then** 前端显示「Provider 认证失败，请检查你的 API Key」提示，并高亮设置入口。
2. **Given** Provider 返回 429 限流错误，**When** 学生发送消息，**Then** 前端显示「当前 Provider 请求过于频繁，请稍后重试」提示。
3. **Given** Provider 服务不可用（5xx 错误），**When** 学生发送消息，**Then** 前端显示「服务暂时不可用，请稍后重试」提示。

---

### User Story 3 - 支持多 Provider 切换 (Priority: P2)

作为一名学生用户，我希望能够在设置中选择不同的 LLM Provider（OpenRouter、AI HubMix、Packy API 或自定义端点），切换后发送消息时自动使用新的 Provider。

**Why this priority**: 当前静态 Demo 已支持多 Provider，重构后不能退步。但核心流式链路跑通是第一优先级。

**Independent Test**: 在设置中从 OpenRouter 切换到 AI HubMix → 输入消息发送 → AI 回复正常流式返回 → 确认请求发到了 AI HubMix。

**Acceptance Scenarios**:

1. **Given** 学生已在设置中保存了两个不同 Provider 的 Key，**When** 学生从 Provider A 切换到 Provider B 并发送消息，**Then** 请求使用 Provider B 的端点和 Key 发送。
2. **Given** 学生切换到自定义 Provider，**When** 学生填写自定义 baseUrl 和 model 并发送消息，**Then** 请求发往自定义端点。

---

### Edge Cases

- 网络中断时流式传输如何处理？——前端应检测连接中断并显示「连接中断，请检查网络」提示，而非无限等待。
- Provider 返回非 SSE 格式的响应时如何处理？——后端应检测不合规响应并返回 `STREAM_INTERRUPTED` 错误事件。
- 学生在前一次流式回复还未完成时再次点击发送怎么办？——前端应禁用发送按钮直到当前流完成或取消。
- 学生输入超长消息（超过 10 万字符）怎么办？——后端应拒绝并返回 `VALIDATION_ERROR`。
- Provider 流式响应中没有返回 `usage` 信息怎么处理？——前端 metrics 面板显示「用量未返回」，不影响主流程。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统 MUST 提供 `POST /api/chat/stream` 端点，接收包含 session_id、provider、base_url、model、api_key、messages、params 的 JSON 请求体。
- **FR-002**: 后端 MUST 根据请求中的 provider 字段选择对应的 ProviderAdapter 构建请求，并将请求转发到正确的 Provider 端点。
- **FR-003**: 后端 MUST 以统一事件格式（SSE）流式返回 Provider 的回复，事件类型包括 request_started、delta、usage、completed、error、cancelled。
- **FR-004**: 后端 MUST 在请求完成后立即释放（不保存）学生传来的 API Key，不得将其写入数据库、日志、错误响应或任何持久化存储。
- **FR-005**: 后端 MUST 对每个 Chat 请求生成全局唯一的 request_id，并在事件流中随 request_started 和 error 事件返回。
- **FR-006**: 后端 MUST 对 Provider 返回的错误进行归一化处理，映射为统一的错误码（VALIDATION_ERROR、MISSING_API_KEY、PROVIDER_AUTH_FAILED、PROVIDER_RATE_LIMITED、PROVIDER_ERROR、STREAM_INTERRUPTED、REQUEST_TIMEOUT、REQUEST_CANCELLED），并附带中文错误消息。
- **FR-007**: 前端 MUST 在收到 stream events 时实时更新聊天区域的显示内容，逐字追加 AI 回复文本。
- **FR-008**: 前端 MUST 提供发送按钮和取消按钮，允许学生取消进行中的流式请求。
- **FR-009**: 前端 MUST 在发送请求前校验 API Key 是否已配置，未配置时显示红色错误提示而不发送请求。
- **FR-010**: 后端 MUST 校验请求参数合法性：provider 为允许值、base_url 为 http/https URL、model 非空、api_key 非空、messages 至少包含一条 user 消息、params.max_tokens 在 1-4096 范围内。

### Key Entities

- **ChatStreamRequest**: 前端发送的聊天请求（session_id、provider、base_url、model、api_key、messages、params、stream）。
- **ChatStreamEvent**: 后端统一的流式事件类型（request_started、delta、usage、metrics、completed、error、cancelled），每种事件携带不同的 payload。
- **ProviderAdapter**: 后端 Provider 抽象，负责将统一的内部请求转换为特定 Provider 的 HTTP 请求格式，以及将 Provider 的响应/错误归一化。
- **ApiError**: 统一错误结构（code、message、request_id、retryable、provider、status）。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 学生从点击发送到看到首个字符出现（TTFT）的时间，减去 Provider 自身耗时后，后端转发延迟不超过 200 毫秒。
- **SC-002**: 学生在一次完整聊天流程中（输入问题→发送→看到完整回复），不需要理解任何 Provider 特定的错误格式——所有错误以统一的中文友好提示呈现。
- **SC-003**: 学生切换 Provider 后发送消息，系统在 5 秒内完成切换并开始收到流式回复。
- **SC-004**: 后端日志中不出现任何 API Key 明文或可还原的 API Key 信息。
- **SC-005**: 使用无效 API Key 发送请求时，前端在 2 秒内显示清晰的错误提示。
- **SC-006**: 20 个学生同时发送 Chat 请求时，各自的流式回复不互相串扰——每个学生只看到自己的回复内容。

## Assumptions

- 前端仍然沿用 API Key 存储在浏览器 localStorage 的模式（与当前静态 Demo 一致），不做改变。
- Provider 的 baseUrl 必须是前端可访问的地址（不要求后端代理网络），后端直接访问 Provider。
- 第一阶段先实现 HTTP SSE 流式传输，不引入 WebSocket。
- Provider 均兼容 OpenAI-compatible `/chat/completions` 格式。
- 消息格式遵循 OpenAI 标准：role 为 system/user/assistant，content 为文本字符串。
- 单次请求超时时间默认 120 秒（与 Production Refactor Plan §6.5 一致）。
- 本 Spec 仅关注单次请求的流式链路，不涉及对话历史保存（由 Spec 3 负责）。
- 本 Spec 不包含 7 阶段 Pipeline 可视化（由 Spec 6 负责）——前端仅需基础聊天区域 + 流式文字显示。
