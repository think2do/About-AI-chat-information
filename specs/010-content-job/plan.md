# Implementation Plan: 求职面试题库迁移（Job Question Bank）

**Branch**: `010-content-job` | **Date**: 2026-07-01 | **Spec**: [spec.md](./spec.md)

## Summary

把旧 `Job.data.js` 扁平化后的 **100 道题** 迁入 009 已建的内容表，新增 Job loader、`/api/content/jobs`（列表轻字段 + 过滤 + `all_tags` 计数）与 `/api/content/jobs/{id}`（详情），前端 Job 页改为 API 驱动并替换 20 题占位。**复用 009 基础设施，不改其表结构与 seeder 核心**。

## Technical Context

**沿用 009**：Python 3.13 / FastAPI / aiosqlite / SQLite；Next.js 15 / React；`@teaching-tool/shared` 类型；客户端 fetch；pytest。新增仅为「Job loader + 2 端点 + 类型 + 前端页 + fixtures」。

**数据事实**：扁平化 `QUESTIONS`（3 个嵌套数组）→ 精确 100 题；5 分类；难度 困难15/中等83/简单2；14 题带 code；100 题均有 keyPoints/related。

## Constitution Check

| 原则 | 评估 |
|------|------|
| I. 关注点分离 | ✅ 数据入库、API 提供、前端渲染；过滤/难度配色等展示逻辑留前端 |
| II. Spec 合规 | ✅ 依赖并复用 009；沿用同一宪法偏离记录，无新增偏离 |
| III. YAGNI | ✅ 复用既有表与 seeder；列表轻字段 + 详情按 id；100 行数据过滤可在 SQL 完成，不引入分页 |
| IV. 测试 | ✅ 契约测试（列表/详情/过滤/空）+ seeder 条数断言（100/5） |
| V. 可回溯 | ✅ spec/plan/data-model/contracts/quickstart；fixtures 为内容源；旧 Job.data.js 保留 |

无新增宪法偏离（内容入 DB 的总偏离已在 009 记录）。

## Project Structure

```text
apps/api/app/
├── db/seeds/content/job/
│   ├── questions.json          # [新] 100 题（扁平化提取）
│   ├── categories.json         # [新] 5 分类
│   └── all_tags.json           # [新] 过滤栏标签（slug 键 + 中文 label + emoji）
├── db/seed_content.py          # [改] 注册 _load_job + MODULE_REGISTRY['job']（写 content_meta all_tags）
├── services/content_service.py # [改] list_jobs(category, difficulty) / get_job(id)
├── routers/content.py          # [改] GET /jobs, GET /jobs/{id}
└── models/content.py           # [改] JobSummary/JobQuestion/JobTag/JobListResponse

apps/api/tests/test_content_jobs.py   # [新] 契约 + seeder 测试

apps/web/src/app/job/page.tsx         # [改] 从 API 拉取列表/详情，真实分类+难度

packages/shared/src/content.ts        # [改] Job* 类型 + index 再导出
```

**Structure Decision**: 纯增量接入 009，不新建目录、不改表结构。分类 slug：系统架构=architecture、模型选型=model-selection、评测指标=evaluation、项目挑战=project-challenges、产品策略=product-strategy。详见 data-model.md。

## Complexity Tracking

无新增偏离（沿用 009 的「内容入 DB」决策与记录）。
