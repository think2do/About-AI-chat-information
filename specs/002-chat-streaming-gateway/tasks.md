# Tasks: Chat Streaming 网关 (Chat Streaming Gateway)

**Input**: Design documents from `/specs/002-chat-streaming-gateway/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Not explicitly requested — 本阶段以 TypeScript 编译 + Python 语法检查 + quickstart 手动验证为质量门。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install backend dependencies and prepare shared types

- [ ] T001 Add httpx dependency to apps/api/requirements.txt and pyproject.toml
- [ ] T002 [P] Update ChatStreamEvent types in packages/shared/src/events.ts — add payload types for request_started, delta, usage, completed, error, cancelled events
- [ ] T003 [P] Add ChatStreamRequest interface to packages/shared/src/chat.ts — include session_id, provider, base_url, model, api_key, messages, params, stream fields

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create error codes module in apps/api/app/errors/codes.py — define 8 ErrorCode enum values + CHINESE_ERROR_MESSAGES dict + retryable mapping
- [ ] T005 [P] Create error normalization module in apps/api/app/errors/normalization.py — normalize_provider_error() function that maps Provider HTTP errors to unified error codes
- [ ] T006 Create SSE event serializer in apps/api/app/models/events.py — sse_encode(event: dict) -> str for "data: {json}\n\n" format
- [ ] T007 [P] Create ChatStreamRequest Pydantic model in apps/api/app/models/request.py — with all validation rules (session_id prefix, provider enum, URL validation, messages list, max_tokens range)
- [ ] T008 Create BaseProviderAdapter abstract class in apps/api/app/adapters/base.py — define build_request(), parse_stream(), normalize_error() interface
- [ ] T009 Create apps/api/app/services/__init__.py and apps/api/app/adapters/__init__.py

**Checkpoint**: Foundation ready — all shared backend modules in place. User story implementation can now begin.

---

## Phase 3: User Story 1 - 学生发送问题并看到流式回复 (Priority: P1) 🎯 MVP

**Goal**: 实现 POST /api/chat/stream 最小闭环——前端发送请求，后端通过 ProviderAdapter 转发，以 SSE 流式返回，前端实时逐字渲染。

**Independent Test**: 打开 Chat 页面 → 配置 API Key → 输入问题 → 点击发送 → AI 回复逐字出现 → 完成后显示完整内容

### Implementation for User Story 1

- [ ] T010 [US1] Implement ChatStreamService in apps/api/app/services/chat_stream_service.py — orchestrates: validate request → select adapter → build & send request → stream parse → cleanup (API Key release)
- [ ] T011 [US1] Implement OpenRouterAdapter in apps/api/app/adapters/openrouter_adapter.py — extend BaseProviderAdapter for OpenRouter (OpenAI-compatible format)
- [ ] T012 [US1] Implement POST /api/chat/stream endpoint in apps/api/app/routers/chat.py — FastAPI StreamingResponse with async generator, inject ChatStreamService, handle CancelledError
- [ ] T013 [US1] Register chat router in apps/api/app/main.py — app.include_router(chat.router)
- [ ] T014 [US1] Create SSE client library in apps/web/src/lib/sse-client.ts — streamChat(request) function using fetch + ReadableStream + AbortController
- [ ] T015 [US1] Create Chat API wrapper in apps/web/src/lib/api.ts — sendMessage() function that calls POST /api/chat/stream with settings from localStorage
- [ ] T016 [P] [US1] Create ChatArea component in apps/web/src/components/ChatArea.tsx — message list (user + assistant bubbles), streaming content append, auto-scroll
- [ ] T017 [P] [US1] Create ChatInput component in apps/web/src/components/ChatInput.tsx — textarea + send button (disabled during streaming) + cancel button (visible during streaming)
- [ ] T018 [US1] Update Chat page in apps/web/src/app/page.tsx — integrate ChatArea + ChatInput + useChat hook for state management

**Checkpoint**: 核心流式聊天链路可独立测试——学生可发送消息并看到逐字回复

---

## Phase 4: User Story 2 - Provider 错误友好提示 (Priority: P1)

**Goal**: 所有 Provider 错误以统一中文消息在前端展示，API Key 零泄露

**Independent Test**: 使用无效 API Key 发送 → 显示「Provider 认证失败，请检查你的 API Key」→ 修正后重试成功

### Implementation for User Story 2

- [ ] T019 [US2] Implement error normalization logic in apps/api/app/adapters/openrouter_adapter.py — add normalize_error() that detects 401/429/5xx and maps to unified codes
- [ ] T020 [US2] Integrate error normalization into ChatStreamService in apps/api/app/services/chat_stream_service.py — catch httpx errors + Provider errors → emit error SSE event with sanitized message (no API Key)
- [ ] T021 [P] [US2] Create ErrorBubble component in apps/web/src/components/ErrorBubble.tsx — display error message with retryable flag (retry button if retryable), highlight settings link for auth errors
- [ ] T022 [US2] Add frontend API Key check in apps/web/src/lib/api.ts — before sending request, check if API Key is configured; if not, show error without making network request
- [ ] T023 [US2] Add error handling to SSE client in apps/web/src/lib/sse-client.ts — parse error events from SSE stream, throw typed errors
- [ ] T024 [US2] Integrate ErrorBubble into Chat page in apps/web/src/app/page.tsx — show errors in chat area

**Checkpoint**: 所有错误以中文展示，API Key 不出现在任何日志/错误中

---

## Phase 5: User Story 3 - 支持多 Provider 切换 (Priority: P2)

**Goal**: 支持 OpenRouter、AI HubMix、Packy API、自定义 四种 Provider，前端切换后请求自动路由到对应 Provider

**Independent Test**: 从 OpenRouter 切换到 AI HubMix → 发送消息 → AI 回复正常返回 → 确认请求发到了 AI HubMix

### Implementation for User Story 3

- [ ] T025 [P] [US3] Implement AIHubMixAdapter in apps/api/app/adapters/aihubmix_adapter.py — extend BaseProviderAdapter, map AI HubMix specific behavior
- [ ] T026 [P] [US3] Implement PackyAdapter in apps/api/app/adapters/packy_adapter.py — extend BaseProviderAdapter, map Packy API specific behavior
- [ ] T027 [P] [US3] Implement CustomAdapter in apps/api/app/adapters/custom_adapter.py — extend BaseProviderAdapter, use frontend-provided base_url
- [ ] T028 [US3] Implement adapter factory in apps/api/app/adapters/__init__.py — get_adapter(provider: str, base_url: str) -> BaseProviderAdapter function
- [ ] T029 [US3] Update ChatStreamService to use adapter factory in apps/api/app/services/chat_stream_service.py — select adapter based on provider field from request
- [ ] T030 [US3] Add adapter-specific error normalization for AIHubMix/Packy/Custom — if APIs diverge from OpenAI-compatible error format

**Checkpoint**: 4 种 Provider 全部可切换使用，各自请求正确路由

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation, edge case hardening, and verification

- [ ] T031 Verify API Key sanitization — audit all log statements and error paths in apps/api/app/ ensure no api_key field is printed
- [ ] T032 [P] Add backend request timeout (120s) in apps/api/app/services/chat_stream_service.py — httpx timeout config + REQUEST_TIMEOUT error emission
- [ ] T033 [P] Add message length validation (>100k chars rejection) in apps/api/app/models/request.py
- [ ] T034 Run TypeScript typecheck — cd apps/web && npx tsc --noEmit (zero errors)
- [ ] T035 Run Python syntax check — python3 -m py_compile for all .py files in apps/api/app/
- [ ] T036 Validate against quickstart.md — execute all VS-1 through VS-7 manual test scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) — core streaming MVP
- **User Story 2 (Phase 4)**: Depends on US1 (Phase 3) — error normalization integrates into existing stream flow
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) — can run in parallel with US2, adds adapters to existing BaseProviderAdapter
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — No dependencies on other stories. MVP.
- **User Story 2 (P1)**: Depends on US1 — adds error handling to existing stream flow
- **User Story 3 (P2)**: Can start after Foundational — only needs BaseProviderAdapter, not full US1 completion. Can run parallel with US1/US2.

### Within Each User Story

- Backend models/adapters before service layer
- Service layer before router/endpoint
- Backend endpoint before frontend SSE client
- Frontend SSE client before UI components
- Core implementation before error handling

### Parallel Opportunities

- T002, T003 can run in parallel (different shared type files)
- T004, T005 can run in parallel (different error modules)
- T016, T017 can run in parallel (different React components)
- T025, T026, T027 can run in parallel (different adapter files)
- T032, T033 can run in parallel (different concerns)

---

## Parallel Example: User Story 3

```bash
# Launch all adapters together:
Task: "Implement AIHubMixAdapter in apps/api/app/adapters/aihubmix_adapter.py"
Task: "Implement PackyAdapter in apps/api/app/adapters/packy_adapter.py"
Task: "Implement CustomAdapter in apps/api/app/adapters/custom_adapter.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup → shared types + httpx dependency
2. Complete Phase 2: Foundational → error codes, BaseAdapter, SSE serializer, Pydantic models
3. Complete Phase 3: User Story 1 → streaming chat endpoint + frontend UI
4. **STOP and VALIDATE**: Test VS-1 (normal streaming) and VS-2 (cancel)
5. This is the MVP — a working streaming chat tool!

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test streaming → MVP! 🎯
3. Add US2 → Test error handling → Production-ready errors
4. Add US3 → Test multi-provider → Full provider support
5. Polish → Type check + validation → Ready for merge

---

## Notes

- API Key MUST be released after each request — verify in code review
- All error messages MUST be Chinese and user-friendly — no technical stack traces exposed
- SSE event format MUST follow contracts/chat-streaming-api.md exactly
- ProviderAdapter base class defines the contract — all adapters MUST implement all 3 methods
- Frontend AbortController MUST clean up on component unmount
