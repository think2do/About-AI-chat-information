# Feature Specification: 错误处理与并发治理 (Error Handling & Rate Limiting)

**Feature Branch**: `007-error-rate-limit`

**Created**: 2026-06-30

**Status**: Draft

**Input**: 实现后端 RequestGuard 的完整参数校验、并发限流、超时控制、stream 中断处理和多学生并发不串扰。将各类异常统一映射为 10 种错误码，确保每个错误都能友好提示并指导学生下一步操作。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 请求被正确校验和拦截 (Priority: P1)

作为一名学生用户，当我发送的请求参数不合法时（如忘记粘贴 API Key、输入了无效的 Provider 名称、消息超过了最大长度），我希望在发送后立即看到一个清晰的中文错误提示，而不是一个看不懂的技术错误或者根本没有任何反应。

**Why this priority**: 这是防止学生「卡住」的第一道防线。学生在配置 Provider 时常犯各种错误——没填 Key、填错了 Key、忘了选 Model——如果这些错误不友好，学生会认为工具本身坏了。

**Independent Test**: 清空 API Key → 发送消息 → 看到「请先配置 API Key」提示 → 填写无效 Key 再发送 → 看到「Provider 认证失败」提示。

**Acceptance Scenarios**:

1. **Given** 学生未配置 API Key（字段为空），**When** 学生尝试发送消息，**Then** 前端立即显示错误提示「请先配置 API Key」，不发送请求到后端。
2. **Given** 学生提交的请求中缺少必填字段（如 model 为空），**When** 后端收到请求，**Then** 返回 `VALIDATION_ERROR` 错误和具体的字段缺失说明。
3. **Given** 学生的 API Key 被 Provider 拒绝（401），**When** 后端收到 Provider 的错误响应，**Then** 前端显示「Provider 认证失败，请检查你的 API Key」并高亮设置入口。
4. **Given** 学生输入了超过 50 条历史消息，**When** 后端收到请求，**Then** 返回 `VALIDATION_ERROR` 提示消息数量超限。

---

### User Story 2 - 多人同时使用互不干扰 (Priority: P1)

作为一名学生用户，当我与另外 20 个同学在课堂上同时使用教学工具时，各自的聊天内容不会串到别人的屏幕上——我看到的是我自己的问题和我自己的 AI 回复。

**Why this priority**: 这是课堂场景的核心保障。如果并发时 session 串扰，不只是体验问题，更可能造成隐私事故（A 学生看到 B 学生的对话内容）。

**Independent Test**: 用 3 个不同浏览器（不同 session_id）同时向 Chat API 发送不同内容的消息 → 确认每个浏览器只看到自己发送的问题和对应的回复。

**Acceptance Scenarios**:

1. **Given** 3 个不同的匿名 session 同时各自发起 Chat 请求，**When** 3 个流式响应同时返回，**Then** 每个 session 只收到自己的 conversation 的流式事件，不存在跨 session 的消息混合。
2. **Given** 同一 session 下有 3 条不同的对话（不同 conversation_id），**When** 学生分别发送消息，**Then** 每条消息正确归属到各自的 conversation 中。

---

### User Story 3 - 限流保护不被滥用 (Priority: P2)

作为一名学生用户（以及系统运维者），当我不小心快速连续点击发送按钮，或者某个恶意脚本在滥发请求时，系统应该拒绝过多的请求，并告诉我「请求太频繁了，请稍后重试」，这样既保护了教学工具不被刷垮，也保护了我的 API Key 不会因为恶意脚本而被 Provider 封禁。

**Why this priority**: 限流是在公网部署后的重要安全措施，但第一阶段用户量不大，可以在核心链路跑通后再完善。

**Independent Test**: 在 10 秒内连续发送 15 次请求（超过 10 req/min 限制）→ 后续请求被拒绝 → 显示「请求过于频繁」错误 → 等待 1 分钟后重试成功。

**Acceptance Scenarios**:

1. **Given** 学生在 1 分钟内发送了超过 10 次请求，**When** 第 11 次请求到达，**Then** 后端返回 `RATE_LIMITED` 错误，前端显示「请求过于频繁，请稍后重试」，不调用 Provider。
2. **Given** 限流窗口结束后（1 分钟后），**When** 学生再次发送请求，**Then** 请求正常处理，不再被限流。
3. **Given** 学生点击了「取消」按钮中断正在进行的流式传输，**When** 取消操作完成，**Then** 取消不计入限流计数（正常的使用不会因为取消操作而被限流）。

---

### User Story 4 - 超时和断流有明确提示 (Priority: P2)

作为一名学生用户，当 LLM Provider 响应过慢或者网络连接中断时，我不希望页面一直在转圈等待——我希望在一定时间后看到一个明确的提示，告诉我发生了什么，以及我可以怎么做（重试、换 Provider、或者等一会再试）。

**Why this priority**: 超时和断流是生产环境的常见场景。学生如果遇到「无响应」而不理解原因，会失去对工具的信任。

**Independent Test**: 模拟 Provider 响应超过 120 秒 → 前端显示「请求超时」错误 → 模拟网络中断 → 前端显示「连接中断」错误。

**Acceptance Scenarios**:

1. **Given** Provider 在 120 秒内没有返回任何数据，**When** 超时触发，**Then** 后端返回 `REQUEST_TIMEOUT` 错误事件，前端显示「请求超时，请稍后重试」。
2. **Given** 流式传输进行中但网络突然中断，**When** 连接断开，**Then** 前端检测到断流，显示「连接中断，请检查网络」提示。
3. **Given** Provider 返回 5xx 服务器错误，**When** 后端收到 Provider 的错误响应，**Then** 前端显示「Provider 服务暂时不可用，请稍后重试」，错误信息不包含原始技术堆栈。

---

### Edge Cases

- 学生在限流恢复期限的最后几秒连续点击——每次点击应独立判断限流窗口，不应因为之前的请求刚被释放而误判。
- Provider 返回的错误格式与 OpenAI 标准完全不兼容——后端应有兜底归一化逻辑，将无法识别的错误映射为 `PROVIDER_ERROR` 并附带脱敏摘要。
- 学生在发送请求后、收到首个 token 前关闭了浏览器标签页——后端应能检测到客户端断开连接，释放上游 Provider 连接。
- 同一个 IP 下有 50 个学生在使用（学校 NAT 环境）——IP 限流阈值应足够宽松或在第一阶段关闭 IP 限流，仅启用 session 限流。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 后端 MUST 对每个进入 `/api/chat/stream` 的请求执行参数校验：session_id 必填、provider 为允许值、base_url 为 http/https URL、model 非空、api_key 非空、messages 至少包含一条 user 消息、params.max_tokens 在 1-4096 范围内。
- **FR-002**: 后端 MUST 将参数校验失败映射为 `VALIDATION_ERROR`（HTTP 400），并在响应中指明具体哪个字段校验失败。
- **FR-003**: 后端 MUST 支持按 session_id 进行请求频率限流，默认限制为每分钟 10 次请求。超出限制时返回 `RATE_LIMITED`（HTTP 429）。
- **FR-004**: 后端 MUST 为每个请求设置 120 秒超时时间。Provider 在超时时间内未返回任何数据时，返回 `REQUEST_TIMEOUT` 错误事件。
- **FR-005**: 后端 MUST 将 Provider 认证失败（401）映射为 `PROVIDER_AUTH_FAILED`，将 Provider 限流（429）映射为 `PROVIDER_RATE_LIMITED`，将 Provider 5xx 错误映射为 `PROVIDER_ERROR`。
- **FR-006**: 后端 MUST 在客户端断开连接时释放上游 Provider 连接，并记录 `REQUEST_CANCELLED` 事件。
- **FR-007**: 后端 MUST 在检测到上游流中断（SSE 格式错误或连接异常断开）时返回 `STREAM_INTERRUPTED` 错误事件。
- **FR-008**: 所有错误响应 MUST 遵循统一的 ApiError 结构（code、message、request_id、retryable、provider、status），其中 message 为中文友好提示。
- **FR-009**: 系统 MUST 确保并发请求之间的 session 隔离——不同 session_id 的请求在不同上下文中处理，绝不出现数据串扰。
- **FR-010**: 后端 MUST 在错误日志中脱敏处理 Provider 返回的原始错误信息，移除所有可能的认证凭证后再写入日志。
- **FR-011**: 前端 MUST 对 `RATE_LIMITED` 和 `PROVIDER_RATE_LIMITED` 两种可重试错误显示「稍后重试」提示和预计可重试时间。
- **FR-012**: 前端 MUST 在收到错误事件时停止该请求的流式 UI 更新，将已收到的不完整回复标记为「接收中断」，不追加到对话历史中。

### Key Entities

- **ApiError**: 统一错误结构（code、message、request_id、retryable、provider、status），所有错误均使用此格式。
- **ChatRequestLog**: 请求级日志（request_id、status、latency_ms、error_code、error_summary），不包含 API Key。
- **ErrorCode**: 10 种统一错误码枚举——VALIDATION_ERROR、MISSING_API_KEY、UNSUPPORTED_PROVIDER、RATE_LIMITED、PROVIDER_AUTH_FAILED、PROVIDER_RATE_LIMITED、PROVIDER_ERROR、STREAM_INTERRUPTED、REQUEST_TIMEOUT、REQUEST_CANCELLED。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 学生在遇到任何错误时（从发送请求到看到错误提示），端到端时间不超过 3 秒。
- **SC-002**: 20 个学生同时发送 Chat 请求时，0 例 session 间数据串扰（session A 看不到 session B 的回复）。
- **SC-003**: 限流触发后，被拒绝的请求在 10 毫秒内收到 `RATE_LIMITED` 响应——不被 Provider 实际调用，不浪费学生 API Key 的配额。
- **SC-004**: 所有 10 种错误码在对应场景下均能正确触发，错误消息为中文且可读性良好。
- **SC-005**: 后端错误日志中 0 处出现 API Key 明文或可还原的 API Key 信息。
- **SC-006**: 同一 session 在限流恢复后首次请求不再被拦截——限流窗口滑动正确。

## Assumptions

- 第一阶段限流使用内存实现（开发环境），生产环境再切换到 Redis。
- IP 限流在开发阶段默认关闭，因为本地开发和学校 NAT 环境会误伤正常用户。仅启用 session 级限流。
- 限流阈值（10 req/min/session）为初始默认值，后续可根据实际使用数据调整。
- Provider 的超时时间（120s）适用于绝大多数对话场景。超长推理模型（如 o1-preview 可能需要更长时间）在第一阶段不做特殊处理。
- 学生的 API Key 配额消耗由 Provider 侧管理，本工具不追踪 Provider 侧的配额余额。
- 错误脱敏策略：仅保存 error_code + error_summary（人工编写的简短描述），不保存 Provider 返回的原始 HTML/JSON 错误体。
