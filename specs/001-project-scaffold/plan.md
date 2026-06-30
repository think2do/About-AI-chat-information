# Implementation Plan: 工程骨架搭建 (Project Scaffold)

**Branch**: `001-project-scaffold` | **Date**: 2026-06-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-project-scaffold/spec.md`

## Summary

搭建 Next.js + FastAPI Monorepo 工程骨架——前端 5 页面路由 + AppShell 导航布局，后端 `/health` 端点，`packages/shared/` 共享类型定义，Docker Compose 一键启动开发环境。零业务逻辑、零数据库，只确保骨架可以跑通。

## Technical Context

**Language/Version**: TypeScript 5.x (frontend), Python 3.11+ (backend)

**Primary Dependencies**: Next.js 15 (App Router), React 19, FastAPI, Uvicorn

**Storage**: N/A (本阶段无数据库)

**Testing**: `tsc --noEmit` (前端类型检查), `ruff check` (后端 lint)

**Target Platform**: Web (browser + server), Docker Compose 本地开发环境

**Project Type**: Web application (Monorepo: `apps/web/` + `apps/api/` + `packages/`)

**Performance Goals**: `GET /health` 响应 < 50ms, 前端 dev server 启动 < 10s, TypeScript 编译零错误

**Constraints**: 必须遵循 Constitution 中定义的 Monorepo 目录结构；暗色终端设计风格（前端占位页面）

**Scale/Scope**: 5 个前端页面路由 + 1 个后端端点 + 2 个 shared packages + Docker Compose

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. 关注点分离 | ✅ PASS | `apps/web/`(UI) / `apps/api/`(服务) / `packages/`(共享类型) 三层物理隔离 |
| II. Spec 与文档规范 | ✅ PASS | 本 Plan 基于已批准的 spec.md，所有设计决策引用 spec 中的 FR |
| III. 第一性原理 | ✅ PASS | 最小化引入——仅安装跑通骨架必需的 Next.js/FastAPI，无状态管理库、无 ORM、无额外抽象 |
| IV. 测试覆盖 | ✅ PASS | 骨架阶段：TypeScript 编译 + lint 为基础质量门；后续 Spec 补充分层测试 |
| V. 过程可回溯 | ✅ PASS | Plan、research、data-model、contracts 留档 |

## Project Structure

### Documentation (this feature)

```text
specs/001-project-scaffold/
├── plan.md              # This file
├── research.md          # Phase 0: 技术选型确认
├── data-model.md        # Phase 1: 共享类型实体
├── quickstart.md        # Phase 1: 验证指南
├── contracts/           # Phase 1: API contracts
│   └── health-api.md
└── tasks.md             # Phase 2: /speckit-tasks 生成
```

### Source Code (repository root)

```text
apps/
  web/                          # Next.js + React + TypeScript 前端
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx      # AppShell: 全局布局 + 导航
    │   │   ├── page.tsx        # / → Chat 占位页
    │   │   ├── lab/
    │   │   │   └── page.tsx    # /lab 占位页
    │   │   ├── code/
    │   │   │   └── page.tsx    # /code 占位页
    │   │   ├── jargon/
    │   │   │   └── page.tsx    # /jargon 占位页
    │   │   └── job/
    │   │       └── page.tsx    # /job 占位页
    │   └── components/
    │       └── NavSidebar.tsx  # 左侧导航栏组件
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    └── .env.example
  api/                          # FastAPI + Python 后端
    ├── app/
    │   ├── __init__.py
    │   ├── main.py             # FastAPI app + /health endpoint
    │   └── routers/
    │       └── health.py       # Health check router
    ├── requirements.txt
    ├── pyproject.toml
    └── .env.example

packages/
  shared/                       # 前后端共享类型
    ├── src/
    │   ├── index.ts            # 统一导出
    │   ├── provider.ts         # ProviderConfig, ProviderId
    │   ├── chat.ts             # ChatMessage, ModelParams, ChatMetrics
    │   ├── pipeline.ts         # PipelineState
    │   └── events.ts           # ChatStreamEvent, ApiError
    ├── package.json
    └── tsconfig.json
  content/                      # 教学内容预留位置
    ├── package.json
    └── README.md

docker-compose.yml              # 一键启动: web + api
.env.example                    # 根目录环境变量模板
README.md                       # 项目启动说明
```

**Structure Decision**: Monorepo Web application 结构——`apps/` 下分 `web/` 和 `api/`，`packages/` 下分 `shared/` 和 `content/`。此结构来自 Production Refactor Plan §2.3 并经 Constitution Deployment Standards 确认。

## Complexity Tracking

> No violations — all Constitution checks passed without exceptions.
