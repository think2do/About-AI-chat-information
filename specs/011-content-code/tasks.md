# Tasks: Code 教学数据迁移

**Prerequisites**: 009 + 010 已合并。**Tests**: 契约 + seeder。

## Phase 1: Foundational
- [x] T001 [P] 提取 fixtures：自 `Code.dc.html` 平衡扫描提取，写 `apps/api/app/db/seeds/content/code/{tools,commands,tool_categories,command_categories,simulator,agent_loop,hidden}.json`，断言 52/95/8/5/11/11/8 且工具命令全有描述
- [x] T002 seeder 扩展 + Code loader：`seed_content.py` 把 count 断言改为按 module 统计全部条目（去 item_type 过滤，兼容多 item_type）；新增 `_load_code()`（读 code fixtures、tool/command 分类 + 5 类 item_type）并注册 `MODULE_REGISTRY['code']`（expected 13/177）
- [x] T003 [P] 共享类型：`packages/shared/src/content.ts` 新增 `CodeTool/CodeCommand/CodeToolCategory/CodeCommandCategory/SimStep/AgentStep/HiddenFeature/CodeResponse` + index 再导出
- [x] T004 [P] Pydantic 模型：`apps/api/app/models/content.py` 对应 Code* 模型

## Phase 2: US1 (P1) 🎯 MVP
- [x] T005 [US1] `content_service.get_code()`：分组装配 tools/commands（按分类 sort_order，组内 sort_order）+ simulator/agentLoop/hidden（按 sort_order）
- [x] T006 [US1] `routers/content.py` 新增 `GET /code`（Cache-Control，异常 500）
- [x] T007 [US1] 重构 `apps/web/src/app/code/page.tsx`：五 Tab 从 `/api/content/code` 拉取——工具网格(8 分类/52，🔒，点击详情)、命令网格(5 分类/95，点击详情)、模拟器(11 步终端+序列图，推进/重置)、Agent 循环(11 步)、隐藏功能(8)，含加载/空/错误态，设计系统不变
- [x] T008 [P] [US1] `apps/api/tests/test_content_code.py` 契约测试：tools 8/52、commands 5/95、sim 11、agent 11、hidden 8、isExp 正确、空库

## Phase 3: US2 (P2)
- [x] T009 [US2] seeder 测试：code 13/177、幂等无操作、篡改条数→SeedError 回滚

## Phase 4: Polish
- [x] T010 跑 quickstart（seed→curl→前端→pytest 全绿→tsc），回归 009/010/Chat

## Notes
唯一对共享 `seed_content.py` 的改动：count 断言去 item_type 过滤 + 注册 code loader；jargon/job 行为不变。
