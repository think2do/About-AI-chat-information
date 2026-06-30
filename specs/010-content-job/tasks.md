# Tasks: 求职面试题库迁移（Job）

**Prerequisites**: 009 已合并（内容表/seeder/API/类型基础设施就绪）。**Tests**: 契约 + seeder（plan §IV）。

## Phase 1: Foundational（数据 + 后端类型）

- [ ] T001 扩展 seeder 支持 content_meta，并新增 Job loader：在 `apps/api/app/db/seed_content.py` 把 loader 契约改为返回 `(categories, items, meta)`（`_load_jargon` 返回空 meta），`_seed_module` upsert `content_meta`；新增 `_load_job()`（读 job fixtures、tag→slug 映射、写 all_tags meta）并注册 `MODULE_REGISTRY['job']`（expected 5/100）
- [ ] T002 [P] 提取 fixtures：从根 `Job.data.js` 扁平化 100 题 → `apps/api/app/db/seeds/content/job/{questions.json,categories.json,all_tags.json}`，断言 100 题 / id 唯一 / 5 分类
- [ ] T003 [P] 共享类型：`packages/shared/src/content.ts` 新增 `JobTag/JobSummary/JobQuestion/JobListResponse`，`index.ts` 再导出
- [ ] T004 [P] Pydantic 模型：`apps/api/app/models/content.py` 新增 `JobTag/JobSummary/JobQuestion/JobListResponse`

## Phase 2: User Story 1 - 浏览/查看题目 (P1) 🎯 MVP

- [ ] T005 [US1] `apps/api/app/services/content_service.py` 新增 `list_jobs(category, difficulty)`（返回 items 轻字段 + all_tags 含全量计数 + total）与 `get_job(id)`（完整 payload，未找到返回 None）
- [ ] T006 [US1] `apps/api/app/routers/content.py` 新增 `GET /jobs`（query: category/difficulty，Cache-Control）与 `GET /jobs/{id}`（404 题目不存在）
- [ ] T007 [US1] 重构 `apps/web/src/app/job/page.tsx`：列表/all_tags 从 `/api/content/jobs` 拉取、详情从 `/api/content/jobs/{id}` 拉取，真实 5 分类 + 难度配色（简单绿/中等橙/困难红），渲染 answer/code/keyPoints/related，含加载/空/错误态
- [ ] T008 [P] [US1] `apps/api/tests/test_content_jobs.py` 契约测试：列表 total100/all_tags 6/计数；`?category=architecture`→16 项；`?difficulty=困难`；详情 sa01 含 answer；404；空库 total0

## Phase 3: User Story 2 - 维护者导入 (P2)

- [ ] T009 [US2] 在 `test_content_jobs.py` 增 seeder 测试：seed 后 job 100 题/5 分类、content_meta all_tags 写入；幂等无操作；篡改 fixtures 条数→SeedError 回滚

## Phase 4: Polish

- [ ] T010 跑 `quickstart.md`（seed→curl→前端→pytest→回归 009/Chat），前端 `npm run typecheck`，后端 `pytest tests/ -q` 全绿

## Dependencies
Phase 1 阻塞其余；T002/T003/T004 可并行（T001 依赖 T002 的 fixtures 存在才能 seed，但代码可先写）。US1 依赖 Phase1；US2 测试依赖 T001。

## Notes
复用 009 表与 seeder 核心；唯一对共享文件 `seed_content.py` 的改动是「新增 meta 支持 + job loader」，不改既有 jargon 行为（jargon meta 为空）。
