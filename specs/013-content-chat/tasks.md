# Tasks: Chat Pipeline 阶段详情迁移

**Prerequisites**: 009-012 已合并。**Tests**: 契约 + seeder。

## Phase 1: Foundational
- [ ] T001 [P] fixture（已编写）：`apps/api/app/db/seeds/content/chat/pipeline.json`（7 阶段），断言 7 条
- [ ] T002 seeder：`_load_chat()`（7 → pipeline-stage 条目）+ 注册 `MODULE_REGISTRY['chat']`（expected 0/7）
- [ ] T003 [P] 共享类型：`content.ts` 新增 `PipelineStageContent/ChatPipelineResponse` + index 再导出
- [ ] T004 [P] Pydantic：`models/content.py` 新增 `PipelineStageContent/ChatPipelineResponse`

## Phase 2: US1 (P1) 🎯 MVP
- [ ] T005 [US1] `content_service.get_chat_pipeline()`：返回 7 阶段（按 sort_order）
- [ ] T006 [US1] `routers/content.py` 新增 `GET /chat/pipeline`（缓存头，异常 500）
- [ ] T007 [US1] 增强 `apps/web/src/components/PipelineVisualization.tsx`：fetch `/api/content/chat/pipeline`，阶段可点击展开 detail，后端失败回退内置标签；不破坏 activePhase 高亮与流式
- [ ] T008 [P] [US1] `apps/api/tests/test_content_chat.py` 契约测试：stages 7、首阶段 label、字段非空、空库、缓存头

## Phase 3: US2 (P2)
- [ ] T009 [US2] seeder 测试：chat 0/7、幂等无操作、篡改条数→SeedError 回滚

## Phase 4: Polish
- [ ] T010 quickstart（seed→curl→前端→pytest 全绿→tsc），回归 009-012 与 Chat 流式

## Notes
唯一共享文件改动：新增 chat loader；前端只改 PipelineVisualization，不动 Chat 流式/会话逻辑。
