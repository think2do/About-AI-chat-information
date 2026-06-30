# Implementation Plan: Code 教学数据迁移

**Branch**: `011-content-code` | **Date**: 2026-07-01 | **Spec**: [spec.md](./spec.md)

## Summary
迁移 52 工具 / 95 命令 / 11 sim / 11 agent / 8 hidden 到 009 内容表，新增 Code loader、单一 `GET /api/content/code`（返回五类数据）、共享类型与 Code 页五 Tab 重建。复用 009，不改其表/seeder 核心。

## Technical Context
沿用 009 栈（FastAPI/aiosqlite/SQLite、Next.js、共享类型、客户端 fetch、pytest）。新增 Code loader + 1 端点 + 类型 + 前端页 + fixtures。**数据事实**：52/95/11/11/8 已核验，工具命令全有描述。

## Constitution Check
| 原则 | 评估 |
|------|------|
| I 关注点分离 | ✅ 数据入库、API 提供、前端渲染；模拟器分步/选中等交互留前端 |
| II Spec 合规 | ✅ 复用 009；无新增宪法偏离 |
| III YAGNI | ✅ 复用表/seeder；单一聚合端点（数据适中，避免 5 个端点）|
| IV 测试 | ✅ 契约（聚合端点结构+计数）+ seeder 条数断言 |
| V 可回溯 | ✅ spec/plan/data-model/contracts/quickstart；旧 Code.dc.html 保留 |

## Project Structure
```text
apps/api/app/
├── db/seeds/content/code/{tools,commands,simulator,agent_loop,hidden}.json  # [新]
├── db/seed_content.py            # [改] _load_code + MODULE_REGISTRY['code']
├── services/content_service.py   # [改] get_code()
├── routers/content.py            # [改] GET /code
└── models/content.py             # [改] Code* 模型
apps/api/tests/test_content_code.py  # [新]
apps/web/src/app/code/page.tsx       # [改] 五 Tab 从 API 拉取
packages/shared/src/content.ts       # [改] Code* 类型 + 再导出
```
**Structure Decision**: 纯增量接入 009。item_type：tool/command/sim-step/agent-step/hidden-feature；分类 13 行（8 工具+5 命令）。

## Complexity Tracking
无新增偏离（沿用 009 的内容入 DB 决策）。
