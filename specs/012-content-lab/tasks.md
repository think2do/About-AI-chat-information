# Tasks: Lab 交互演示迁移

**Prerequisites**: 009/010/011 已合并。**Tests**: 契约 + seeder。

## Phase 1: Foundational
- [x] T001 [P] fixtures（已提取/已编写）：`apps/api/app/db/seeds/content/lab/{function_call,inference,rag,training,tokenizer}.json`，断言 fc5/infer10/rag10、modes3/cards4
- [x] T002 seeder：`_load_lab()`（fc/infer/rag → 25 条目，training/tokenizer → content_meta）+ 注册 `MODULE_REGISTRY['lab']`（expected 0/25）
- [x] T003 [P] 共享类型：`content.ts` 新增 Lab*（FcStep/InferStep/RagStep/Tokenizer*/TrainingData/LabResponse）+ index 再导出
- [x] T004 [P] Pydantic 模型：`models/content.py` 对应 Lab* 模型

## Phase 2: US1 (P1) 🎯 MVP
- [x] T005 [US1] `content_service.get_lab()`：装配 training/functionCall/tokenizer/inference/rag（条目按 sort_order，meta 解析）
- [x] T006 [US1] `routers/content.py` 新增 `GET /lab`（缓存头，异常 500）
- [x] T007 [US1] 重构 `apps/web/src/app/lab/page.tsx`：5 Tab 从 `/api/content/lab`——训练对比(输入+双栏流式)、函数调用(5 步分步+messages)、分词(3 模式柱状+速查)、推理(10 步)、RAG(10 步两阶段)，加载/空/错误态，设计系统不变
- [x] T008 [P] [US1] `apps/api/tests/test_content_lab.py` 契约测试：fc5/infer10/rag10/modes3/cards4、baseTemplate 含 {q}、rag phase、空库

## Phase 3: US2 (P2)
- [x] T009 [US2] seeder 测试：lab 0/25、幂等无操作、篡改条数→SeedError 回滚

## Phase 4: Polish
- [x] T010 quickstart（seed→curl→前端→pytest 全绿→tsc），回归 009/010/011/Chat

## Notes
唯一共享文件改动：新增 lab loader；不改既有模块行为。
