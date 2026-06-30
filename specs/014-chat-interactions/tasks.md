# Tasks: Chat 交互增强

**Prerequisites**: 002/006/013 已合并。**Tests**: 后端 adapter 单测 + 前端 tsc + 手动 QA。

## Phase 1: Foundational（接通 + 类型）
- [x] T001 修正 `apps/web/src/app/page.tsx`：把 `modelParams`（temperature/topP/maxTokens/frequency/presence/reasoningEnabled）真正传入 `sendMessage`（现状传 `{}`）
- [x] T002 [P] `apps/web/src/lib/api.ts`：`params` 增加 `reasoning_enabled`
- [x] T003 [P] `packages/shared/src/events.ts`：新增 `ReasoningEvent` 并入 `ChatStreamEvent`；`DisplayMessage`/相关类型加 `ttftMs/tps/outputTokens/reasoning`（或在 page.tsx 本地类型）

## Phase 2: US1 概率图 + JSON 联动 (P1) 🎯 MVP
- [x] T004 [US1] `ModelParamsPanel.tsx` F1：概率图升级为旧 `_probDist` 保真（15 token + 4 滑块 + 惩罚 + Top-P 截断 + 橙标 + 「模拟」标注）
- [x] T005 [US1] `ModelParamsPanel.tsx` + `page.tsx` F2：JSON 请求体预览 + 改动字段绿色闪烁 ~1.5s（`changedParam` 1800ms 清除）

## Phase 3: US2 逐条指标 (P1)
- [x] T006 [US2] `page.tsx` F3：流式回调测 TTFT（发请求→首 delta）/ TPS（outTok/elapsed）/ outputTokens，完成后写入该条 assistant 消息
- [x] T007 [US2] `ChatArea.tsx`：AI 气泡下渲染「输出 N tok · TPS X · TTFT Yms」footer

## Phase 4: US3 CoT (P2)
- [x] T008 [US3] 后端 `openrouter_adapter.py`：`build_request` 加 `reasoning`（reasoning_enabled 时）；`parse_stream` 捕获 `delta.reasoning`→emit `reasoning` 事件
- [x] T009 [US3] 前端：`ModelParamsPanel.tsx` 加「🧠 思维链」开关（仅 OpenRouter 有效提示）；`page.tsx` 处理 `reasoning` 事件累积；`ChatArea.tsx` 思维链橙框渲染
- [x] T010 [P] [US3] `apps/api/tests/test_openrouter_reasoning.py`：build_request 开关含/不含 reasoning；parse_stream 产 reasoning/delta 事件

## Phase 5: Polish
- [x] T011 跑 quickstart：后端 `pytest tests/ -q` 全绿、前端 `npm run typecheck` 通过；手动 QA 4 功能；回归 009–013 与既有 Chat 流式/会话

## Notes
不碰内容表/seeder/会话保存；API Key 零留存不变；概率图为教学模拟。
