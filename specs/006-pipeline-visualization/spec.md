# Feature Specification: Chat 管道可视化与参数面板 (Pipeline Visualization & Model Params)

**Feature Branch**: `006-pipeline-visualization`

**Created**: 2026-06-30

**Status**: Draft

**Input**: 迁移并增强当前静态 Demo 的 Chat 页核心教学体验——7 阶段管道可视化、5 个可调 LLM 参数滑块、实时性能指标面板（TTFT/TPS/Token/Cost）、自回归解码日志、Token 概率分布和思维链开关。这些是整个教学工具中「可视化 LLM 工作机制」的核心体现。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 观察 LLM 请求的完整生命周期 (Priority: P1)

作为一名学生用户，当我在 Chat 中发送一条消息后，我希望看到 AI 处理我请求的完整过程被划分为 7 个清晰的阶段，每个阶段以动画和可视化方式展示——从我的消息如何被组装、如何被编码、如何被模型处理，到最后如何生成回复。

**Why this priority**: 7 阶段管道是本教学工具的核心差异化功能——正是这些可视化让学生「看到」LLM 内部发生了什么，而不仅仅是得到一个答案。其他工具只告诉学生「这是 AI 的回复」，本工具告诉学生「AI 是怎么一步步得出这个回复的」。

**Independent Test**: 在 Chat 页面输入消息 → 点击发送 → 观察 7 个阶段依次激活（阶段 1 上下文组装 → 阶段 2 请求编码 → ... → 阶段 7 响应完成），每个阶段展示对应的可视化内容。

**Acceptance Scenarios**:

1. **Given** 学生点击发送按钮，**When** 请求生命周期开始，**Then** 阶段 1（上下文组装）立即激活，展示当前 messages 数组（system/user/assistant 消息卡片），每条消息显示字符数和估算 token 数。
2. **Given** 阶段 1 展示中，**When** 约 350ms 后，**Then** 自动进入阶段 2（请求编码），展示序列化后的 JSON 请求体，当前参数变更时对应字段高亮闪烁。
3. **Given** 阶段 2 展示中，**When** 约 700ms 后，**Then** 进入阶段 3（分词预处理），展示 token 可视化（token ID 和类型标注），含估算偏差提示。
4. **Given** 阶段 3 展示中，**When** 约 1050ms 后，**Then** 进入阶段 4（API 调度 & 模型画像），展示当前选中模型的架构参数（层数、隐藏维度、注意力头、上下文窗口、MoE/Dense 说明）。
5. **Given** 阶段 4 展示中，**When** 约 1550ms 后，**Then** 进入阶段 5（Transformer 推理），展示前向传播示意和逐层扫描动画。
6. **Given** 后端返回首个 token（SSE delta 事件），**When** 首个 token 到达，**Then** 立即从阶段 5 切换到阶段 6（自回归解码），开始逐 token 显示生成内容。
7. **Given** 后端发送 completed 事件，**When** 流式传输结束，**Then** 进入阶段 7（响应完成 & 指标），展示 TPS、TTFT、输入/输出 token 数、费用统计和上下文占用率。

---

### User Story 2 - 调节 LLM 参数观察效果变化 (Priority: P1)

作为一名学生用户，我希望通过滑块调节 Temperature、Top-P、Max Tokens、Frequency Penalty 和 Presence Penalty 这 5 个参数，并实时看到参数变化对 Token 概率分布的影响，这样我可以直观理解每个参数的作用。

**Why this priority**: 参数调节是「亲手操作」的核心——学生不只是被动看演示，而是通过自己调节参数来建立对 LLM 行为的直觉。这是本工具区别于教程文章的关键体验。

**Independent Test**: 拖动 Temperature 滑块从 0 → 2 → 观察右侧 Token 概率分布条形图实时变化 → Top-P 截断线随 Top-P 值变化而移动。

**Acceptance Scenarios**:

1. **Given** 学生对参数不熟悉，**When** 学生将鼠标悬停在 Temperature 滑块上，**Then** 显示 tooltip 说明该参数的作用和推荐范围。
2. **Given** 学生拖动 Temperature 滑块，**When** 值发生变化，**Then** Token 概率分布条形图实时更新，概率分布随温度升高而变得更加均匀。
3. **Given** 学生调节 Top-P 滑块，**When** 值发生变化，**Then** Top-P 截断线在概率分布图上实时移动，低于截断线的 token 区域灰度显示。
4. **Given** 学生调节 Frequency Penalty 和 Presence Penalty，**When** 值增大，**Then** 概率分布图中已出现 token 的概率降低（受惩罚项影响的可视化展示）。

---

### User Story 3 - 查看性能指标和费用 (Priority: P2)

作为一名学生用户，当一次 Chat 请求完成后，我希望看到这次请求的关键性能指标——首字延迟（TTFT）、生成速度（TPS）、输入输出 token 数量和费用估算，这样我可以了解不同模型和参数组合的成本与性能差异。

**Why this priority**: 成本和性能是 LLM 实际应用中的核心考量。学生在教学中建立「不同模型成本差异巨大」的直觉，对日后工作中的模型选型至关重要。

**Independent Test**: 完成一次 Chat → 阶段 7 面板显示 TTFT（ms）、TPS（tokens/sec）、输入/输出 token 数、总 token 数、费用（$）→ 切换不同模型重试 → 对比两次的费用差异。

**Acceptance Scenarios**:

1. **Given** 一次 Chat 请求正常完成，**When** 后端返回 usage 信息，**Then** 阶段 7 面板展示：TTFT（毫秒）、TPS、输入 token 数、输出 token 数、总 token 数、本次费用（美元，6 位小数）。
2. **Given** 学生在一次会话中进行了多轮对话，**When** 查看上下文占用率进度条，**Then** 进度条颜色随占用率变化：绿色（低占用）→ 橙色（中等占用）→ 红色（接近上限）。
3. **Given** 后端没有返回 usage 信息（某些 Provider 不提供），**When** 请求完成，**Then** 指标面板显示「用量未返回」，不影响其他指标展示。

---

### User Story 4 - 查看自回归解码过程 (Priority: P2)

作为一名学生用户，我希望在阶段 6（自回归解码）中看到一个实时滚动的日志面板，逐条显示每个生成的 token 和当前上下文长度，这样我可以直观感受 LLM「一个字一个字往外蹦」的生成方式。

**Why this priority**: 自回归解码是理解 LLM 工作原理的关键概念。相比阶段 7 的汇总指标，阶段 6 的逐 token 日志让学生看到生成过程的微观细节。

**Independent Test**: 发送消息 → 进入阶段 6 → 观察右侧日志面板逐条出现 token 记录（步骤编号、token 文本、context 长度）→ 新记录带滑入动画。

**Acceptance Scenarios**:

1. **Given** 流式回复正在进行（阶段 6），**When** 每个 delta token 到达，**Then** 右侧日志面板新增一条记录，包含步骤编号、token 文本和当前上下文长度，新条目带 slideIn 动画。
2. **Given** 流式回复正在进行，**When** 自回归解码生成了 20 个以上 token，**Then** 日志面板自动滚动到最新条目。

---

### User Story 5 - 使用思维链观察推理过程 (Priority: P3)

作为一名进阶学生用户，我希望在 Chat 中开启「思维链」开关后，看到模型在给出最终回答前的推理思考过程，用不同颜色区分思考内容和最终答案。

**Why this priority**: 思维链是 LLM 推理能力的核心机制，但它是进阶功能——初学者可能不需要，进阶用户会非常感兴趣。

**Independent Test**: 开启 🧠 思维链开关 → 发送一个需要推理的问题 → AI 回复中思维链部分以橙色边框和浅橙背景展示 → 最终答案以常规样式展示。

**Acceptance Scenarios**:

1. **Given** 学生开启了「🧠 思维链」开关，**When** 学生发送一个需要推理的问题，**Then** 回复中包含思维链部分（橙色 2px 左边框 + 浅橙背景 + JetBrains Mono 字体）和最终答案部分。
2. **Given** 学生未开启思维链开关，**When** 学生发送消息，**Then** 回复仅包含常规答案，不展示思维链样式。

---

### Edge Cases

- 用户在流式回复进行中调节参数滑块——参数变更在下一次发送时生效，不影响当前流式传输。前端应显示提示「参数将在下次发送时生效」。
- 模型架构参数在数据源中为「未公开」——展示「未公开」标签而非空白或 0。
- 阶段 5（Transformer 推理）的层数根据模型动态调整——如果模型有 120 层，动画不应全部逐层展示，而是采样展示（如前 10 层 + 省略号 + 最后 5 层）。
- 多轮对话时，阶段 1 的 messages 数组包含历史消息，历史消息显示角色标签和时间戳。
- 费用为 0 时（某些 Provider 不返回 pricing 或模型在硬编码定价中找不到）——显示「--」而非 $0.000000。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 前端 MUST 实现 7 阶段管道可视化，每个阶段对应 Chat 请求生命周期的不同步骤，阶段状态包含 idle / active / completed。
- **FR-002**: 前端 MUST 在阶段之间使用连接线展示流程关系，当前激活阶段使用绿色外发光效果，已完成阶段使用弱绿色标记。
- **FR-003**: 前端 MUST 提供 5 个 LLM 参数滑块：Temperature（范围 0-2，步长 0.01）、Top-P（范围 0.01-1，步长 0.01）、Max Tokens（范围 16-4096，步长 16）、Frequency Penalty（范围 0-2，步长 0.01）、Presence Penalty（范围 0-2，步长 0.01）。
- **FR-004**: 前端 MUST 在参数滑块旁展示实时数值，并提供 tooltip 说明每个参数的作用。
- **FR-005**: 前端 MUST 在阶段 7 展示性能指标面板：TTFT（毫秒）、TPS（tokens/sec）、输入 token 数、输出 token 数、总 token 数、本次费用（美元，精确到 6 位小数）、上下文占用率（百分比进度条，颜色随占用率变化）。
- **FR-006**: 前端 MUST 在阶段 6 展示自回归解码日志面板，每条记录包含步骤编号、token 文本和当前 context 长度，新条目带 slideIn 动画，面板自动滚动。
- **FR-007**: 前端 MUST 在右侧参数面板底部展示 Token 概率分布可视化：15 个候选 token 的横向条形图，颜色表示概率高低，Top-P 截断线随参数动态移动。
- **FR-008**: 前端 MUST 提供「🧠 思维链」功能开关，开启后请求体携带 `reasoning: true` 参数（对支持 reasoning 的 Provider）。
- **FR-009**: 前端 MUST 在思维链模式下使用差异化样式展示思考过程（橙色 2px 左边框 + 浅橙背景 + JetBrains Mono 字体）。
- **FR-010**: 前端 MUST 支持系统提示词编辑功能——学生可自定义 system prompt 内容。
- **FR-011**: 前端 MUST 为新消息气泡提供滑入动画（slideIn），用户消息右对齐、AI 消息左对齐、思维链消息带橙色边框。
- **FR-012**: 前端 MUST 在多轮对话时维护对话历史，包含用户和 AI 消息的角色标签、气泡样式和性能指标。

### Key Entities

- **PipelineState**: 管道状态（当前阶段 0-7、状态 idle/running/completed/error/cancelled）。
- **ModelParams**: LLM 请求参数（temperature、topP、maxTokens、frequencyPenalty、presencePenalty、reasoningEnabled）。
- **ChatMetrics**: 性能指标（requestId、ttftMs、tps、inputTokens、outputTokens、totalTokens、costUsd）。
- **TokenProbability**: 候选 token 的概率信息（token 文本、概率值、是否在 Top-P 截断线以上）。
- **ModelArchInfo**: 模型架构信息展示（layers、hiddenDim、attentionHeads、contextWindow、isMoE、architecture）。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 7 个阶段的激活和切换过程顺畅无卡顿——从阶段 1 到阶段 7 的完整流程中，没有任何阶段切换出现超过 100 毫秒的 UI 阻塞。
- **SC-002**: 参数滑块拖动到概率分布图更新的端到端延迟不超过 50 毫秒（流畅的实时反馈体验）。
- **SC-003**: 阶段 6 自回归日志在 token 到达后 30 毫秒内完成 UI 更新和滚动。
- **SC-004**: 学生在完成一次完整 Chat 流程后，在阶段 7 面板中能在一眼内（5 秒内）获取所有关键指标：TTFT、TPS、token 用量和费用。
- **SC-005**: 多轮对话（10 轮以上）时页面不出现明显卡顿或内存泄漏——连续对话 10 轮后页面内存占用增幅不超过 50MB。
- **SC-006**: 所有可视化元素（阶段节点、概率分布图、连接线、消息气泡）沿用既有的暗色终端设计风格，无视觉风格断裂。

## Assumptions

- 7 阶段的时序动画在 Stream Events 到达前是模拟的（阶段 1-5 的延迟和内容基于前端预设逻辑），实际流式数据到达时切换到真实数据驱动模式。
- Token 概率分布为前端基于参数值（Temperature/Top-P/Penalty）的模拟计算，不依赖 Provider 返回实际 logprobs——因为大多数 Provider 不返回 logprobs。
- 模型架构参数在数据模块中维护一个硬编码数据库（与当前 Demo 一致），包含 9 个支持模型的信息。未公开的参数标记为「未公开」。
- 模型定价表在代码中硬编码（$ / 1M tokens），与当前 Demo 一致。新增模型时需同步更新定价表。
- 旧静态 Demo 中的「功能开关」（仅思维链一个）和「5 个滑块」设计直接延续，不做交互重设计。
- 暗色终端风格和所有动效规范（slideIn、tokenAppear、hlFlash、layerSweep、phaseGlow）沿用现有 styles.css 中的定义，迁移时样式逻辑转换为框架对应的实现方式。
