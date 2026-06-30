# Research: 工程骨架技术选型确认

**Feature**: 001-project-scaffold | **Date**: 2026-06-30

## Decisions

### 1. Next.js App Router vs Pages Router

**Decision**: App Router

**Rationale**: Next.js 15 默认推荐 App Router，基于 React Server Components 架构，适合本项目的多页面教学站点布局。Pages Router 已进入维护模式。

**Alternatives considered**: Pages Router — 更成熟但非 Next.js 未来方向，排除。

### 2. FastAPI + Uvicorn vs Other Python Frameworks

**Decision**: FastAPI + Uvicorn

**Rationale**: Constitution Technology Stack Constraints 已确定。FastAPI 原生支持 async/await 和 streaming response，Uvicorn 是标准 ASGI server。

**Alternatives considered**: Django + DRF — 太重，不需要 ORM 和 admin；Flask + extensions — async 支持不原生。排除。

### 3. npm Workspaces vs pnpm Workspaces vs Turborepo

**Decision**: npm Workspaces（第一阶段）

**Rationale**: 零额外工具依赖，Next.js 和 `packages/shared/` 之间的引用用 npm workspaces 即可解决。后期复杂度上升可迁移到 Turborepo。

**Alternatives considered**: Turborepo — 功能强但引入额外工具，违反 Principle III（第一性原理）；pnpm — 需要额外安装，当前 Node.js 内置 npm 已够用。

### 4. 共享类型定义格式

**Decision**: TypeScript `.ts` 文件 + `package.json` exports

**Rationale**: 前后端同仓库下，`packages/shared/` 作为 npm workspace，前端直接 import；后端可手动参考或后续通过工具转换为 Python types。

**Alternatives considered**: OpenAPI/JSON Schema 生成 — 骨架阶段过度工程化；Protobuf — 不需要跨语言 RPC。

### 5. Docker Compose 编排方式

**Decision**: 单文件 `docker-compose.yml`，web 和 api 各自有 Dockerfile

**Rationale**: 最小化——开发环境只需 web + api 两个服务。数据库在后续 Spec 引入。

**Alternatives considered**: 多 compose 文件（dev/prod 分离）— 第一阶段仅 dev 环境，不需要。

## No Open Questions

所有技术选型已在 Constitution 和 Production Refactor Plan 中预先确定，本阶段无 NEEDS CLARIFICATION 项。
