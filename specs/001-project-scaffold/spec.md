# Feature Specification: 工程骨架搭建 (Project Scaffold)

**Feature Branch**: `001-project-scaffold`

**Created**: 2026-06-30

**Status**: Draft

**Input**: 创建 Next.js + React + TypeScript 前端与 FastAPI + Python 后端的 Monorepo 工程骨架，包含健康检查、共享类型定义、空页面路由和 Docker Compose 开发环境。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 开发者启动开发环境 (Priority: P1)

作为一名开发者，我希望通过一条命令就能在本地启动完整的前后端开发环境，这样我可以快速验证整个服务链路是否正常工作。

**Why this priority**: 这是所有后续开发的基础——没有可运行的骨架，其他功能都无法开始。

**Independent Test**: 执行 `docker-compose up` 后，浏览器能打开前端页面，`/health` 返回正常状态。

**Acceptance Scenarios**:

1. **Given** 项目仓库已克隆到本地，**When** 开发者在项目根目录执行启动命令，**Then** 前端服务在本地端口可访问，后端 API 服务在本地端口可访问。
2. **Given** 前后端服务均已启动，**When** 开发者访问 `GET /health`，**Then** 返回 `{"status": "ok", "service": "teaching-tool-api", "version": "0.1.0"}`。
3. **Given** 前端服务已启动，**When** 开发者在浏览器访问各个页面路由，**Then** 每个路由显示对应的占位页面（非 404 错误页）。

---

### User Story 2 - 前后端类型契约共享 (Priority: P2)

作为一名开发者，我希望前端和后端使用同一套 TypeScript 类型定义，这样我在修改 API 接口时不会因为前后端类型不一致而引入 bug。

**Why this priority**: 类型安全是工程质量的基础，但可以在骨架跑通后再完善。

**Independent Test**: 前端代码可以 import 来自 `packages/shared/` 的类型定义，后端也可以参考同一份 schema。

**Acceptance Scenarios**:

1. **Given** 共享类型包已定义，**When** 前端 import ProviderConfig 类型，**Then** 类型定义包含 provider、baseUrl、model、apiKey 字段。
2. **Given** 共享类型包已定义，**When** 前端 import ChatStreamEvent 联合类型，**Then** 类型定义包含 delta、usage、completed、error 等变体。

---

### User Story 3 - 前端页面路由骨架 (Priority: P2)

作为一名学生用户，我希望在浏览器中看到与当前静态 Demo 对应的五个教学页面（Chat、Lab、Code、Jargon、Job），即使是占位状态，也能确认导航结构是正确的。

**Why this priority**: 页面路由是前端开发的骨架，确认路由结构后各页面可并行开发。

**Independent Test**: 在浏览器地址栏直接输入各页面 URL，均能正常加载而非 404。

**Acceptance Scenarios**:

1. **Given** 前端服务已启动，**When** 用户访问 `/`（Chat 页），**Then** 页面正常加载（显示占位内容）。
2. **Given** 前端服务已启动，**When** 用户访问 `/lab`，**Then** 页面正常加载。
3. **Given** 前端服务已启动，**When** 用户访问 `/code`，**Then** 页面正常加载。
4. **Given** 前端服务已启动，**When** 用户访问 `/jargon`，**Then** 页面正常加载。
5. **Given** 前端服务已启动，**When** 用户访问 `/job`，**Then** 页面正常加载。

---

### Edge Cases

- 后端未启动时，前端页面应能优雅降级（显示后端不可用提示），而非白屏崩溃。
- 前端访问未定义的路由时应显示 404 页面，而非直接报错或重定向到首页。
- Docker 环境未安装时，应有手动启动前后端的说明文档。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统 MUST 提供可正常启动的 Next.js + React + TypeScript 前端工程（`apps/web/`）。
- **FR-002**: 系统 MUST 提供可正常启动的 FastAPI + Python 后端工程（`apps/api/`）。
- **FR-003**: 系统 MUST 提供 `GET /health` 端点，返回服务名称、状态和版本号。
- **FR-004**: 系统 MUST 在 `packages/shared/` 中定义前后端共享的 TypeScript 类型定义，包含 ProviderConfig、ModelParams、ChatMessage、ChatMetrics、PipelineState、ChatStreamEvent 和 ApiError。
- **FR-005**: 前端 MUST 拥有五个页面路由：`/`（Chat）、`/lab`、`/code`、`/jargon`、`/job`，每个路由展示占位页面。
- **FR-006**: 前端 MUST 拥有统一的应用外壳（AppShell），包含左侧导航栏和页面内容区域。
- **FR-007**: 前端导航栏 MUST 包含五个页面的导航入口以及设置入口。
- **FR-008**: 系统 MUST 提供 `packages/content/` 目录结构，为后续内容迁移预留位置。
- **FR-009**: 系统 MUST 提供 Docker Compose 配置文件，支持一键启动完整的开发环境。
- **FR-010**: 项目 MUST 包含 README 文档说明如何启动开发环境、项目结构概览和依赖安装步骤。

### Key Entities

- **AppShell**: 前端全局布局组件，包含导航栏、页面容器和主题上下文。
- **ProviderConfig**: 多 Provider 设置的类型定义（openrouter / aihubmix / packy / custom），包含 baseUrl、model、apiKey 字段。
- **ModelParams**: LLM 请求参数类型定义（temperature、topP、maxTokens、frequencyPenalty、presencePenalty）。
- **ChatStreamEvent**: 后端向前端推送的统一流式事件联合类型（request_started、delta、usage、metrics、completed、error、cancelled）。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 新开发者从克隆仓库到看见前端页面和后端 health check 返回正常状态，耗时不超过 10 分钟。
- **SC-002**: 所有 5 个页面路由均可正常访问（HTTP 200），无 404 错误。
- **SC-003**: `GET /health` 端点在服务启动后 1 秒内返回响应。
- **SC-004**: 前端 TypeScript 编译零错误，后端 Python 类型检查零错误。
- **SC-005**: Docker Compose 一键启动命令成功启动全部服务（前端 + 后端），无需额外的手动配置步骤。

## Assumptions

- 开发者已安装 Node.js 22+ 和 Python 3.11+。
- 开发者已安装 Docker Desktop（用于 Docker Compose 启动方式）。
- 前端使用 Next.js App Router（非 Pages Router），因为这是 Next.js 当前推荐的默认路由方案。
- 后端使用 FastAPI + Uvicorn，因为这是 Python 异步 Web 服务的主流组合。
- 共享类型定义使用 TypeScript（非 JSON Schema 或 OpenAPI），因为前端也需要这些类型，且可由后端参考生成 Python 类型。
- 占位页面使用暗色终端风格（延续当前设计系统），但具体视觉不做要求——本 Spec 只要求骨架跑通。
- 项目目录结构遵循 Production Refactor Plan §2.3 的约定：`apps/web/`、`apps/api/`、`packages/shared/`、`packages/content/`。
