# Feature Specification: Provider 设置与 API Key 安全 (Provider Settings & API Key Security)

**Feature Branch**: `004-provider-settings`

**Created**: 2026-06-30

**Status**: Draft

**Input**: 实现多 Provider 配置管理界面与 API Key 安全生命周期——学生在设置中配置 Provider、Base URL、Model 和 API Key，Key 仅保存在浏览器并在每次请求时临时传给后端，后端用完即释放，绝不持久化。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 配置自己的 API Key 和 Provider (Priority: P1)

作为一名学生用户，我希望在设置面板中选择 LLM Provider、填写 API Key 和 Base URL，配置保存后刷新页面不会丢失，这样我不用每次都重新输入。

**Why this priority**: 没有 API Key 就无法使用 Chat 功能。这是通往核心功能的大门。

**Independent Test**: 打开设置面板 → 选择 "OpenRouter" → 输入 API Key 和 Base URL → 点击保存 → 刷新页面 → 重新打开设置 → 确认之前填写的 Key 和配置还在。

**Acceptance Scenarios**:

1. **Given** 学生首次打开设置面板，**When** 面板显示四个 Provider 选项（OpenRouter、AI HubMix、Packy API、自定义），**Then** 学生可以选择任一 Provider 并填写对应的配置字段。
2. **Given** 学生填写了 OpenRouter 的 API Key、Base URL、Model 并点击保存，**When** 学生刷新页面后再次打开设置面板，**Then** 所有字段显示上次保存的值。
3. **Given** 学生从 OpenRouter 切换到 AI HubMix，**When** 学生在 AI HubMix 的字段中填写新的 Key，并保存，**Then** 两个 Provider 的配置互不覆盖——切回 OpenRouter 时仍看到之前保存的 Key。

---

### User Story 2 - 理解 API Key 的隐私边界 (Priority: P1)

作为一名关注隐私的学生用户，我希望在设置页清楚了解我的 API Key 会被如何使用：它是否会保存在服务器上？会不会被别人看到？

**Why this priority**: API Key 是学生的付费凭据。如果学生不理解 Key 的去向，会产生隐私焦虑，甚至不敢使用这个工具。

**Independent Test**: 打开设置面板 → 阅读隐私提示文字 → 确认文字说明了 Key 仅浏览器保存、后端临时转发、不保存到数据库。

**Acceptance Scenarios**:

1. **Given** 学生打开设置面板，**When** 学生在 API Key 输入框附近或保存按钮旁看到隐私提示，**Then** 提示内容明确包含：Key 仅保存在当前浏览器、发送时临时传给后端转发、后端不保存 Key、对话内容保存 30 天后过期。
2. **Given** 学生阅读了隐私提示，**When** 学生决定删除 API Key，**Then** 学生可以清空 Key 字段并保存，Key 从 localStorage 中移除。

---

### User Story 3 - 切换模型 (Priority: P2)

作为一名学生用户，当我想体验不同模型的效果差异时，我希望能方便地在已保存的 Provider 之间切换，并更换 Model ID。

**Why this priority**: 教学工具的核心价值之一是让学员对比不同模型的行为差异。多 Provider 支持是实现这一目标的前提。

**Independent Test**: 保存 OpenRouter + GPT-4o → 发送消息确认正常 → 切换到 DeepSeek Chat → 发送消息 → 确认回复来自 DeepSeek。

**Acceptance Scenarios**:

1. **Given** 学生已配置多个 Provider，**When** 学生在设置中从 Provider A 切换到 Provider B 并保存，**Then** 后续的 Chat 请求自动使用 Provider B 的 Key、Base URL 和 Model。
2. **Given** 学生选择了自定义 Provider，**When** 学生填入自定义 Base URL 和 Model ID，并保存，**Then** 后续的请求发往该自定义端点。

---

### Edge Cases

- API Key 输入框应使用 `type="password"` 或等效方式遮蔽显示，防止旁人窥屏。
- 学生粘贴的 API Key 前后包含空格或换行符——前端应自动 trim 处理。
- 保存的 API Key 格式明显不对（如只有几个字符）——前端不做格式校验（各 Provider Key 格式不同），交由后端在实际调用时返回错误。
- Base URL 末尾带或不带斜杠——前端应规范化处理，确保请求路径拼接正确。
- 学生在设置面板中切换到另一个 Provider 但没有保存——切换行为不应自动清空当前 Provider 的已填内容。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 前端 MUST 提供全局设置面板，支持选择 Provider（OpenRouter、AI HubMix、Packy API、自定义）并填写对应的 API Key、Base URL、Model ID。
- **FR-002**: 前端 MUST 将所有 Provider 配置（包括 API Key）保存到浏览器 localStorage 中的 `llm_viz_settings` key 下，刷新页面后不丢失。
- **FR-003**: 后端 MUST NOT 将 API Key 写入数据库、日志文件、错误响应或任何持久化存储。API Key 仅在单次请求的 FastAPI 内存变量中存在，请求完成后立即释放。
- **FR-004**: 前端 MUST 在设置面板和 API Key 输入区域旁展示隐私提示，内容为：「API Key 只保存在当前浏览器。发送消息时，Key 会临时传给本教学工具后端用于转发模型请求；后端不会保存 Key。对话内容会被保存用于学习记录和问题排查，默认 30 天后过期。」
- **FR-005**: 前端 MUST 在发送 Chat 请求时将当前选中的 Provider 配置（包括 API Key）临时传入请求体，请求完成后不保留在浏览器内存以外的地方。
- **FR-006**: 前端 MUST 支持 API Key 的清除功能——学生在设置中清空 Key 字段并保存后，localStorage 和 UI 中不再出现该 Key。
- **FR-007**: 前端 MUST 对旧版配置格式（如仅包含 `{ apiKey }` 的旧格式）进行兼容识别，自动迁移为 OpenRouter 配置。
- **FR-008**: 前端 MUST 对 API Key 输入框使用密码遮蔽模式。

### Key Entities

- **ProviderConfig**: 单个 Provider 的完整配置（provider ID、label、baseUrl、model、apiKey），保存在浏览器 localStorage。
- **SettingsPayload**: localStorage 中的完整配置结构，包含当前选中的 provider 和所有 providers 的配置集合。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 学生保存 Provider 配置后刷新页面，100% 的情况下配置不丢失。
- **SC-002**: 后端代码审查确认：0 处将 api_key 写入数据库的代码路径，0 处将 api_key 写入日志的代码路径。
- **SC-003**: 学生从打开设置面板到完成 Provider 切换并保存，耗时不超过 15 秒。
- **SC-004**: 隐私提示文字在设置面板中可见，学生无需滚动或点击「了解更多」即可读到完整提示。
- **SC-005**: 旧版 `{ apiKey }` 格式的配置在首次加载时自动迁移为 OpenRouter 配置，无需学生手动操作。

## Assumptions

- API Key 由学生自行在 Provider 网站上注册获取，本工具不代付模型费用。
- 各 Provider 的默认 Base URL 沿用当前静态 Demo 的值：OpenRouter 为 `https://openrouter.ai/api/v1`，AI HubMix 为 `https://aihubmix.com/v1`，Packy API 为 `https://www.packyapi.com/v1`。
- 自定义 Provider 的 Base URL 和 Model ID 必须是 OpenAI-compatible 格式。
- 设置面板在前端全局导航栏中通过「⚙ 设置」按钮触发（与当前 Demo 一致）。
- 本 Spec 不涉及服务器统一托管 API Key 模式（范围外，后续演进方向）。
