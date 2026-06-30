# Implementation Plan: Chat 交互增强

**Branch**: `014-chat-interactions` · **Date**: 2026-07-01 · **Spec**: [spec.md](./spec.md)

## Summary
实现 4 个 Chat 教学交互（概率图升级 / 滑块→JSON 联动 / 逐条消息指标 / CoT 思维链）。纯交互功能，主要前端，CoT 含少量后端（OpenRouter adapter + reasoning 事件）。先把 `modelParams` 接进请求。复用旧 `index.html` 的公式与做法。

## Technical Context
Next.js/React 前端、FastAPI 后端、`@teaching-tool/shared` 类型。不碰内容表/seeder/会话保存。后端 `ModelParams.reasoning_enabled` 已存在。

## Constitution Check
| 原则 | 评估 |
|------|------|
| I 关注点分离 | ✅ 交互/动画在前端；后端仅 adapter 透传 reasoning + 解析；不混入内容层 |
| II Spec 合规 | ✅ 衔接 002/006/013；明确不碰内容/会话 |
| III YAGNI | ✅ 概率图沿用教学模拟（不引真实 logprobs）；复用既有流式管线 |
| IV 测试 | ✅ 后端 adapter 单测（reasoning 进 body / parse reasoning 事件）；前端 tsc + 手动 QA |
| V 可回溯 | ✅ 文档齐全；旧 index.html 公式注明来源 |

无新增宪法偏离。API Key 零留存不变。

## 关键改动文件
**前端**
- `apps/web/src/components/ModelParamsPanel.tsx` — F1 概率图升级（15 token + 4 滑块 + 惩罚 + Top-P 截断 + 橙标 + 「模拟」标注）；F2 JSON 请求体预览 + 改动字段闪烁；F4 「🧠 思维链」开关。
- `apps/web/src/app/page.tsx` — F5 把 modelParams 注入 `sendMessage`；F3 测 TTFT/TPS/outTok 存入消息；F4 处理 `reasoning` 事件累积；F2 提供 `changedParam` 状态。
- `apps/web/src/components/ChatArea.tsx` — F3 逐条指标 footer；F4 思维链橙框渲染。`DisplayMessage` 加 `ttftMs/tps/outputTokens/reasoning`。
- `apps/web/src/lib/api.ts` — 发送 `reasoning_enabled`（已发其余 params）。
- `apps/web/src/lib/sse-client.ts` — 透传 `reasoning` 事件（已 yield 任意事件，确认即可）。

**后端**
- `apps/api/app/adapters/openrouter_adapter.py` — `build_request` 加 `reasoning`；`parse_stream` 捕获 `delta.reasoning` → emit `reasoning` 事件。
- `apps/api/app/models/events.py` — 确认 SSE 编码透传 `reasoning` 事件（按字典编码即可）。

**共享类型**
- `packages/shared/src/events.ts` — 新增 `ReasoningEvent` 并入 `ChatStreamEvent`。

**测试**
- `apps/api/tests/test_openrouter_reasoning.py` — build_request 开关含/不含 reasoning；parse_stream 对带 reasoning 的 chunk 产 reasoning 事件。

## 复用的旧版公式（来自 index.html）
- 概率图 `_probDist(T,topP,fP,pP)`：15 token + logits `lg[]`，`scaled=logit/T`，已用 token `-fP*3 -pP*2`，softmax，排序，Top-P 累积截断（截断压窄 ~25% + 标记），惩罚 token 橙色。
- 滑块联动：`changedParam` 置位 + 1800ms 清除；JSON 高亮匹配键（`hlFlash`）。
- 指标：`t0`→首 delta=TTFT；`outTok`=delta 计数；`TPS=outTok/elapsed`；存 `_ttft/_tps/_outTok`。
- CoT：OpenRouter 加 `reasoning`；返回首段为 thinking 橙框、其余为答案。

## Complexity Tracking
无新增偏离。
