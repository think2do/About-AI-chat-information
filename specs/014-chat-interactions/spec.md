# Feature Specification: Chat 教学交互增强（Chat Interactions）

**Feature Branch**: `014-chat-interactions` · **Created**: 2026-07-01 · **Status**: Draft · **Depends on**: `002-chat-streaming-gateway`、`006-pipeline-visualization`、`013-content-chat`

**Input**: 实现 013 明确排除的 4 个 Chat 教学交互（旧 `index.html` 有、新版缺）：概率分布柱状图、滑块→JSON 请求体联动、逐条消息性能指标、CoT 思维链开关。这些是**运行时计算的前端交互**（非可入库内容），故独立成 spec，不涉及内容表/seeder。

## 背景与现状（核查）
- 现 `ModelParamsPanel.tsx` 已有**简化版**概率图（9 token、仅响应 temperature/top-p）；需升级到旧版保真度。
- 滑块→JSON 联动、逐条消息指标、CoT 三项**完全缺失**。
- 后端 `ModelParams.reasoning_enabled` 字段已存在但适配器未使用；`openrouter_adapter` 仅解析 `delta.content`。
- **隐患**：Chat 页当前以 `params: {}` 发请求——滑块参数根本没传到后端。本 Spec 顺带接通。

## User Scenarios & Testing

### User Story 1 - 学生通过参数面板理解采样机制 (Priority: P1) 🎯 MVP
学生拖动 temperature / top-p / frequency / presence 四个滑块，看到 **概率分布柱状图实时变化**（高温更平、top-p 截断、惩罚 token 标橙）；同时旁边的 **JSON 请求体** 中对应字段 **绿色闪烁** 提示"你改的就是这个字段"。

**Independent Test**: 进入 Chat 页 → 拖动各滑块 → 概率图柱子/截断随之变化、JSON 对应字段闪烁。纯前端可验证（无需真实 API）。

**Acceptance Scenarios**:
1. **Given** 参数面板，**When** 调高 temperature，**Then** 概率分布变平缓（柱子更接近）。
2. **Given** top-p < 1，**When** 调整，**Then** 超过累积阈值的 token 被截断（灰色/压窄）并有截断标记。
3. **Given** frequency/presence penalty > 0，**When** 调整，**Then** "已用" token 概率下降并以橙色标记。
4. **Given** 改动某滑块，**When** 同时看 JSON 请求体预览，**Then** 对应字段（如 `temperature`）绿色闪烁约 1.5s 后恢复。

### User Story 2 - 学生看到每条回复的真实性能 (Priority: P1)
每条 AI 回复下方显示该次请求的 **输出 token 数 · TPS · TTFT**，帮助直观感受速度。

**Independent Test**: 发一条消息 → 流式结束后该条回复下方出现「输出 N tok · TPS X · TTFT Yms」。

**Acceptance Scenarios**:
1. **Given** 流式回复中，**When** 首个 token 到达，**Then** TTFT = 发请求到首 token 的毫秒数被记录。
2. **Given** 回复完成，**When** 查看该条消息，**Then** 其下方显示输出 token、TPS、TTFT 三项指标。

### User Story 3 - 学生开启思维链观察推理过程 (Priority: P2)
学生打开「🧠 思维链」开关（仅 OpenRouter 有效）后发送消息，模型的推理过程以橙色「思维链」框单独显示在最终回答之上。

**Independent Test**: OpenRouter provider 下开启 CoT → 发消息 → 思维链内容以独立橙色框渲染，答案在其下方。

**Acceptance Scenarios**:
1. **Given** CoT 开关开启且 provider 为 OpenRouter，**When** 发请求，**Then** 请求体含 reasoning 参数。
2. **Given** 模型返回 reasoning，**When** 渲染，**Then** 思维链以橙色框显示、答案另起。
3. **Given** CoT 关闭或非 OpenRouter，**Then** 不发 reasoning、按普通回答渲染（不报错）。

### Edge Cases
- 滑块参数现已真正发往后端（修正 `params:{}`）。
- 概率图为**教学模拟**（非真实 logprobs），与旧版一致——需在 UI 标注「模拟」。
- 后端不返回 reasoning（非 OpenRouter / 关闭时）：前端正常渲染答案。
- 不破坏既有流式、会话保存、取消、错误处理。

## Requirements
- **FR-001**: 概率分布图 MUST 升级为：15 个预设 token、按 `logit/temperature` 缩放、对"已用"token 施 `-frequency*3 -presence*2` 惩罚、softmax、按概率排序、Top-P 累积截断（截断态灰/压窄 + 截断标记）、惩罚 token 橙色标记，并实时响应全部 4 个滑块。标注为「模拟」。
- **FR-002**: MUST 提供 JSON 请求体预览（`model` / `messages` 摘要 / `params` / `stream`），滑块改动时对应字段绿色闪烁约 1.5s。
- **FR-003**: 系统 MUST 在流式过程中测量 TTFT（发请求→首 delta）与 TPS（输出 token / 用时），并把 `{ttftMs, tps, outputTokens}` 关联到对应 AI 消息，于该条消息下方渲染。
- **FR-004**: MUST 提供 CoT 开关；开启且 provider 为 OpenRouter 时，请求 MUST 携带 reasoning 参数；模型返回的 reasoning 内容 MUST 与答案分离、以「思维链」样式单独渲染。
- **FR-005**: 前端 MUST 将 `modelParams`（含 reasoningEnabled）真正注入聊天请求（修正当前 `params:{}`）。
- **FR-006**: 后端 `openrouter_adapter` MUST 在 `reasoning_enabled` 时向 Provider 传 reasoning，并在流中捕获 `delta.reasoning` 作为 `reasoning` 事件输出；其余 Provider 不受影响。
- **FR-007**: 本 Spec MUST NOT 改动内容表/seeder/会话保存逻辑；API Key 零留存约束不变；设计系统固定。

### Key Entities
- **采样参数**：temperature / top_p / max_tokens / frequency_penalty / presence_penalty / reasoning_enabled。
- **消息指标**：ttftMs、tps、outputTokens（按条关联 AI 回复）。
- **流式事件**：新增 `reasoning` 事件（思维链增量）。

## Success Criteria
- **SC-001**: 拖动 4 个滑块,概率图与旧版行为一致(变平/截断/惩罚标记),JSON 对应字段闪烁。
- **SC-002**: 每条 AI 回复下方显示输出 token / TPS / TTFT 三项。
- **SC-003**: OpenRouter + CoT 开启时请求含 reasoning、思维链单独渲染;关闭/他 Provider 不报错。
- **SC-004**: 滑块参数真正到达后端(请求体非空 params)。
- **SC-005**: 前端 tsc 通过、后端 pytest 全绿(含新 adapter 测试)、009–013 与既有 Chat 流式/会话无回归,控制台零未捕获错误。

## Assumptions
- 概率图沿用旧版教学模拟公式(非真实 logprobs)。
- CoT 仅对 OpenRouter 生效(其 reasoning API);其他 Provider 开关无副作用。
- 指标客户端测量(TTFT/TPS);outputTokens 以 delta 计数近似。
- 纯交互功能,不入库;复用既有 Chat 流式管线与 SSE 事件机制。
