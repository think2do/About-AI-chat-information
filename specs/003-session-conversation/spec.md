# Feature Specification: 匿名会话与对话保存 (Anonymous Session & Conversation)

**Feature Branch**: `003-session-conversation`

**Created**: 2026-06-30

**Status**: Draft

**Input**: 实现匿名会话管理——学生无需注册登录即可使用教学工具，后端通过匿名 session_id 区分不同学生，自动保存完整对话记录供学习复盘，30 天后自动清理过期数据。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 首次访问自动获得匿名身份 (Priority: P1)

作为一名学生用户，我希望打开教学网站就能直接使用，不需要注册账号或填写个人信息。即使关闭浏览器后再次打开，我之前的学习记录也还在。

**Why this priority**: 零门槛访问是教学的核心理念——学生在课堂上只需打开浏览器就能开始学习，不应被注册流程打断。

**Independent Test**: 首次打开网站 → 浏览器 localStorage 中自动生成 session_id → 刷新页面后 session_id 保持不变 → 换一个浏览器打开，session_id 不同。

**Acceptance Scenarios**:

1. **Given** 学生首次访问教学网站，**When** 前端加载完成，**Then** 浏览器 localStorage 中自动生成一个以 `anon_` 开头的全局唯一 session_id。
2. **Given** 学生之前访问过教学网站（已有 session_id），**When** 学生再次打开网站（同一浏览器），**Then** 使用已有的 session_id，不生成新的。
3. **Given** 学生使用浏览器 A 访问过网站，**When** 学生用浏览器 B 打开网站，**Then** 浏览器 B 生成一个新的不同 session_id，两个浏览器互不影响。

---

### User Story 2 - 查看自己的学习对话历史 (Priority: P1)

作为一名学生用户，我希望在 Chat 页面看到我之前的所有对话记录，点击某条对话后可以继续查看完整内容，这样我可以回顾之前学过的内容。

**Why this priority**: 对话保存是"学习记录"的基础——学生在不同时间段的提问和 AI 回答都应该能被回溯，否则每次打开都是空白页。

**Independent Test**: 发起一次完整聊天 → 对话自动保存 → 刷新页面后在对话列表中看到刚才的对话 → 点击进入查看完整消息历史。

**Acceptance Scenarios**:

1. **Given** 学生完成了一次聊天（至少包含 1 条用户消息和 1 条 AI 回复），**When** 对话正常结束，**Then** 完整的用户消息和 AI 回复被保存，包括时间戳和对话标题。
2. **Given** 学生在过去 3 天内有 5 条对话记录，**When** 学生打开对话列表页面，**Then** 看到这 5 条对话按时间倒序排列，每条显示标题、创建时间和消息数量。
3. **Given** 对话列表中有多条记录，**When** 学生点击某条对话，**Then** 进入该对话详情，显示完整的用户消息和 AI 回复历史。

---

### User Story 3 - 删除不需要的对话 (Priority: P2)

作为一名学生用户，当我觉得某条对话没有保存价值或涉及隐私内容时，我希望能够删除它。

**Why this priority**: 虽然对话只保存在匿名 session 下，但学生应有权控制自己的数据。这是隐私设计的基本要求。

**Independent Test**: 在对话列表中点击删除某条对话 → 确认删除 → 对话从列表中消失 → 刷新后确认不再出现。

**Acceptance Scenarios**:

1. **Given** 学生某条对话已保存，**When** 学生点击该对话的删除按钮并确认，**Then** 该对话及其所有消息从系统中删除。
2. **Given** 学生已删除某条对话，**When** 学生刷新对话列表，**Then** 被删除的对话不再出现。

---

### User Story 4 - 旧对话自动过期清理 (Priority: P3)

作为系统运维者，我希望超过 30 天的旧对话能自动清理，避免数据库无限膨胀。对学生而言，超过 30 天没看的学习记录通常也不再需要。

**Why this priority**: 自动过期是运维保障而非用户直接感知的功能，但对系统长期健康运行至关重要。

**Independent Test**: 创建一条对话 → 手动将过期时间设置为「已过期」→ 触发清理逻辑 → 该对话不再出现在列表和数据库中。

**Acceptance Scenarios**:

1. **Given** 一条对话的 `expires_at` 时间已过，**When** 系统执行过期清理（定时或惰性检查），**Then** 该对话及其消息被标记为已删除或物理删除。
2. **Given** 某条对话创建不到 30 天，**When** 学生查看对话列表，**Then** 该对话正常显示。

---

### Edge Cases

- 同一学生同时在两个浏览器标签页中用同一个 session_id 发消息——会话归属正确，对话内容不串扰。
- 数据库写入失败时如何处理？——流式回复仍正常返回，但前端显示「对话保存失败，刷新后可能看不到此次对话」警告。
- session_id 对应的会话在服务端不存在时怎么办？——后端自动创建新 session 记录（幂等处理）。
- 学生删除了某条对话后又发起了一条内容相同的新对话——这是两个独立的对话，各自有不同的 conversation_id。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统 MUST 在浏览器首次访问时自动生成一个以 `anon_` 开头的全局唯一 session_id，并保存在浏览器 localStorage 中。
- **FR-002**: 后端 MUST 提供 `GET /api/sessions/{session_id}/conversations` 端点，返回该匿名 session 下所有对话的列表（包括标题、创建时间、更新时间、过期时间、消息数量）。
- **FR-003**: 后端 MUST 提供 `DELETE /api/sessions/{session_id}/conversations/{conversation_id}` 端点，允许学生删除属于自己 session 的某条对话。
- **FR-004**: 后端 MUST 在每次 Chat 请求（POST /api/chat/stream）完成后，自动保存完整的用户消息和 AI 回复到对应的 conversation 中。
- **FR-005**: 每条新创建的 conversation MUST 自动设置 `expires_at` 字段为 `created_at + 30 天`。
- **FR-006**: 后端 MUST 在查询对话列表时仅返回尚未过期且未被删除的对话。
- **FR-007**: 后端 MUST 在 conversation 不存在时（首次聊天）自动创建新 conversation，并以用户第一条消息的前 50 个字符作为对话标题。
- **FR-008**: 后端 MUST 支持跨请求向同一 conversation 追加消息（多轮对话），保持消息的发送顺序。
- **FR-009**: 系统 MUST 确保不同 session_id 之间的对话数据完全隔离——一个 session 不能查看、访问或删除另一个 session 的对话。

### Key Entities

- **AnonymousSession**: 匿名学生会话记录（session_id、created_at、last_seen_at、user_agent_hash、ip_hash），不保存任何可识别的个人身份信息。
- **Conversation**: 一次或多次对话的容器（conversation_id、session_id、title、created_at、updated_at、expires_at、deleted_at）。
- **Message**: 单条聊天消息（message_id、conversation_id、role、content、created_at、token_estimate），role 为 system/user/assistant 之一。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 学生从打开网站首页到看到自己的对话列表（首次为空），耗时不超过 3 秒。
- **SC-002**: 一条新对话在 Chat 流式完成后 1 秒内出现在对话列表中。
- **SC-003**: 学生删除某条对话后，该对话在 1 秒内从列表中消失。
- **SC-004**: 30 天过期对话在过期后的首次查询时不再出现在列表中（惰性清理）。
- **SC-005**: 10 个不同的浏览器（10 个不同 session）各自发起聊天后，互相之间无法看到对方的对话记录。

## Assumptions

- session_id 由前端生成并管理，后端信任前端传来的 session_id（不验证其来源）。
- 对话标题自动从第一条用户消息截取，不做智能摘要（保持简单）。
- 过期对话采用「惰性清理」策略——查询时过滤，不强制定时物理删除（第一阶段先简单实现）。
- 后端使用 SQLite（开发阶段），数据结构不考虑分布式 session 同步。
- 本 Spec 不涉及教师后台查看所有学生对话（范围外，后续 Spec）。
- session_id 格式约定为 `anon_` + 随机字符串（如 `anon_01hxxabc...`）。
