# Tasks: 工程骨架搭建 (Project Scaffold)

**Input**: Design documents from `/specs/001-project-scaffold/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: 本阶段无自动化测试框架。验收依赖 TypeScript 编译检查 + 手动 quickstart 验证。

**Organization**: 任务按用户故事分组，支持独立实现和测试。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 所属用户故事（US1/US2/US3）
- 描述中包含精确文件路径

## Path Conventions

- Monorepo: `apps/web/`, `apps/api/`, `packages/shared/`, `packages/content/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 创建 Monorepo 目录结构和包初始化

- [x] T001 Create top-level monorepo directory structure: `apps/web/`, `apps/api/`, `packages/shared/`, `packages/content/`
- [x] T002 [P] Initialize `packages/shared/package.json` with name `@teaching-tool/shared` and TypeScript config
- [x] T003 [P] Initialize `packages/content/package.json` with placeholder README in `packages/content/`
- [x] T004 Create root `.env.example` with placeholder entries for `API_PORT`, `WEB_PORT`, `NEXT_PUBLIC_API_URL`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 后端和前端的最小骨架，必须完成才能开始用户故事

**⚠️ CRITICAL**: User story 工作必须在此阶段完成后开始

- [x] T005 Initialize `apps/api/pyproject.toml` with FastAPI + Uvicorn dependencies, Python 3.11+
- [x] T006 Create `apps/api/requirements.txt` listing fastapi, uvicorn[standard]
- [x] T007 Create `apps/api/app/__init__.py` (empty file)
- [x] T008 Create `apps/api/app/main.py` — FastAPI app instance with CORS middleware, root path `/`, include health router
- [x] T009 Create `apps/api/app/routers/__init__.py` (empty file)
- [x] T010 Create `apps/api/app/routers/health.py` — `GET /health` returning `{"status":"ok","service":"teaching-tool-api","version":"0.1.0"}`
- [x] T011 Initialize `apps/web/package.json` with Next.js 15, React 19, TypeScript dependencies
- [x] T012 [P] Create `apps/web/tsconfig.json` with strict mode, path alias to `@teaching-tool/shared`
- [x] T013 [P] Create `apps/web/next.config.ts` with base config (no special features yet)
- [x] T014 [P] Create `apps/web/.env.example` with `NEXT_PUBLIC_API_URL=http://localhost:8000`
- [x] T014a [P] Create `apps/web/src/app/globals.css` — CSS reset, dark theme base variables (`#0d1117` bg, `#0a0e14` secondary, `#161b22` card, `#21262d` input, `#30363d` border; `#00ffa0` accent green, `#e6edf3`/`#c9d1d9`/`#8b949e` text hierarchy), custom scrollbar (5px, `#30363d` thumb), JetBrains Mono + Inter font-face imports from Google Fonts CDN

**Checkpoint**: `apps/api` 启动后 `/health` 返回 200；`apps/web` 可启动 dev server

---

## Phase 3: User Story 1 - 开发者启动开发环境 (Priority: P1) 🎯 MVP

**Goal**: 通过 Docker Compose 一键启动完整的前后端开发环境

**Independent Test**: `docker compose up -d` → `curl /health` 200 → 浏览器打开前端页面正常

### Implementation for User Story 1

- [x] T015 [US1] Create `apps/api/Dockerfile` — Python 3.11-slim base, install requirements, run uvicorn
- [x] T016 [P] [US1] Create `apps/web/Dockerfile` — Node 22 base, install deps, run `npm run dev`
- [x] T017 [US1] Create root `docker-compose.yml` — web (port 3000) + api (port 8000) services with healthcheck, volumes for hot reload
- [x] T018 [US1] Create root `README.md` — project overview, prerequisites, quickstart with docker compose, manual start instructions, project structure diagram

**Checkpoint**: `docker compose up -d` 后所有服务健康检查通过

---

## Phase 4: User Story 2 - 前后端类型契约共享 (Priority: P2)

**Goal**: `packages/shared/` 中定义所有共享 TypeScript 类型，前端可 import 使用

**Independent Test**: 前端 `import { ProviderConfig } from '@teaching-tool/shared'` 编译通过

### Implementation for User Story 2

- [x] T019 [P] [US2] Create `packages/shared/src/provider.ts` — `ProviderId` type and `ProviderConfig` interface per data-model.md
- [x] T020 [P] [US2] Create `packages/shared/src/chat.ts` — `ChatMessage`, `ModelParams`, `ChatMetrics` interfaces per data-model.md
- [x] T021 [P] [US2] Create `packages/shared/src/pipeline.ts` — `PipelineState` interface per data-model.md
- [x] T022 [P] [US2] Create `packages/shared/src/events.ts` — `ChatStreamEvent` union type and `ApiError` interface per data-model.md
- [x] T023 [US2] Create `packages/shared/src/index.ts` — re-export all types from provider.ts, chat.ts, pipeline.ts, events.ts
- [x] T024 [US2] Create `packages/shared/tsconfig.json` — declaration + emitDeclarationOnly config
- [x] T025 [US2] Verify: add a sample type import in `apps/web/src/app/layout.tsx` that references `@teaching-tool/shared`, confirm `tsc --noEmit` passes

**Checkpoint**: TypeScript 编译零错误，共享类型包可被前端引用

---

## Phase 5: User Story 3 - 前端页面路由骨架 (Priority: P2)

**Goal**: 5 个页面路由 + AppShell 导航布局，暗色终端风格占位页

**Independent Test**: 浏览器逐一访问 `/`, `/lab`, `/code`, `/jargon`, `/job` 均返回 200

### Implementation for User Story 3

- [x] T026 [US3] Create `apps/web/src/components/NavSidebar.tsx` — 56px wide left sidebar with 5 nav items (Chat/Lab/Code/名词/求职, each with emoji icon + 9px Inter label) + ⚙ settings button at bottom; settings button onClick shows a placeholder toast/alert "设置面板将在 Spec 004 实现"; active item highlighted with green left border `#00ffa0` on `rgba(0,255,160,0.06)` background; inactive items `#6e7681`; sidebar background `#0a0e14`
- [x] T027 [US3] Create `apps/web/src/app/layout.tsx` — AppShell: import `globals.css`; flex row layout with NavSidebar + `<main>` content area; set page background `#0d1117`; wrap children in main container
- [x] T028 [P] [US3] Create `apps/web/src/app/page.tsx` — Chat placeholder page with title "Chat / Playground" and status text "Chat streaming gateway will be implemented in Spec 002"
- [x] T029 [P] [US3] Create `apps/web/src/app/lab/page.tsx` — Lab placeholder page with title "实验室" and sub-tab structure placeholder
- [x] T030 [P] [US3] Create `apps/web/src/app/code/page.tsx` — Code placeholder page with title "Claude Code" and sub-tab structure placeholder
- [x] T031 [P] [US3] Create `apps/web/src/app/jargon/page.tsx` — Jargon placeholder page with title "黑话词典" and tree + detail panel layout placeholder
- [x] T032 [P] [US3] Create `apps/web/src/app/job/page.tsx` — Job placeholder page with title "求职" and list + detail panel layout placeholder
- [x] T033 [US3] Create `apps/web/src/app/not-found.tsx` — 404 page with dark theme, "页面未找到" message, link back to home

**Checkpoint**: 全部 5 个路由可用，404 正常，导航栏 visual style 与当前 Demo 一致

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 最终验证和文档完善

- [x] T034 Run `tsc --noEmit` in `apps/web/` and fix any type errors
- [x] T035 Run `ruff check` (or `python -m py_compile`) in `apps/api/` and fix any errors
- [x] T036 Validate quickstart.md scenarios 1-5 pass on a clean checkout
- [x] T037 Verify docker compose up → health check → all 5 page routes → docker compose down cycle works end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — Docker Compose needs app skeletons
- **US2 (Phase 4)**: Depends on Foundational — needs package structure; can parallel with US1
- **US3 (Phase 5)**: Depends on Foundational — needs Next.js running; can parallel with US1/US2
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: After Foundational — independent of US2/US3 (just needs app skeletons)
- **US2 (P2)**: After Foundational — independent of US1/US3 (just needs package structure)
- **US3 (P2)**: After Foundational — independent of US1/US2 (just needs Next.js app)

### Within Each User Story

- Dockerfiles before docker-compose (US1)
- Individual type files before index.ts re-export (US2)
- Globals.css + NavSidebar before layout before pages (US3 — layout depends on sidebar + styles)

### Parallel Opportunities

- T002, T003 (Setup packages) can run in parallel
- T012, T013, T014 (Next.js config files) can run in parallel
- T015, T016 (Dockerfiles) can run in parallel
- T019-T022 (all shared type files) can run in parallel
- T028-T032 (all 5 page routes) can run in parallel
- **US1, US2, US3** can be worked on in parallel by different developers after Foundational phase

---

## Parallel Example: User Story 2

```bash
# Launch all type files together:
Task: "Create packages/shared/src/provider.ts"
Task: "Create packages/shared/src/chat.ts"
Task: "Create packages/shared/src/pipeline.ts"
Task: "Create packages/shared/src/events.ts"

# Then:
Task: "Create packages/shared/src/index.ts (re-export)"
```

## Parallel Example: User Story 3

```bash
# Launch all 5 page routes together:
Task: "Create apps/web/src/app/page.tsx (Chat)"
Task: "Create apps/web/src/app/lab/page.tsx"
Task: "Create apps/web/src/app/code/page.tsx"
Task: "Create apps/web/src/app/jargon/page.tsx"
Task: "Create apps/web/src/app/job/page.tsx"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 (Docker Compose + README)
4. **STOP and VALIDATE**: `docker compose up` → verify `/health` → verify frontend loads
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → skeleton running
2. Add US1 → Docker Compose one-command startup (MVP!)
3. Add US2 → shared types importable
4. Add US3 → 5 page routes with navigation
5. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
