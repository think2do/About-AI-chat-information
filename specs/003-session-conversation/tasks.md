# Tasks: 匿名会话与对话保存 (Anonymous Session & Conversation)

**Input**: Design documents from `/specs/003-session-conversation/`

## Phase 1: Setup

- [ ] T001 Add aiosqlite dependency to apps/api/requirements.txt and pyproject.toml

## Phase 2: Foundational (Blocking)

- [ ] T002 Create DB schema in apps/api/app/db/schema.py — CREATE TABLE sessions, conversations, messages + indexes
- [ ] T003 [P] Create DB connection module in apps/api/app/db/connection.py — async get_db() context manager with aiosqlite
- [ ] T004 [P] Create apps/api/app/db/__init__.py

## Phase 3: User Story 1 - 首次访问自动获得匿名身份 (P1) 🎯 MVP

- [ ] T005 [US1] Implement session auto-create/update in apps/api/app/services/conversation_service.py — ensure_session() idempotent
- [ ] T006 [US1] Update frontend session_id generation in apps/web/src/lib/api.ts — already has getOrCreateSessionId(), verify it stores in localStorage with anon_ prefix
- [ ] T007 [US1] Add session middleware/startup — auto-create session record on first API call

## Phase 4: User Story 2 - 查看学习对话历史 (P1)

- [ ] T008 [US2] Implement conversation CRUD in apps/api/app/services/conversation_service.py — list_conversations(), get_conversation(), save_conversation()
- [ ] T009 [US2] Implement GET /api/sessions/{id}/conversations endpoint in apps/api/app/routers/conversations.py
- [ ] T010 [US2] Implement GET /api/sessions/{id}/conversations/{cid} endpoint in apps/api/app/routers/conversations.py
- [ ] T011 [US2] Register conversations router in apps/api/app/main.py
- [ ] T012 [US2] Integrate auto-save into ChatStreamService — after streaming completes, save user + assistant messages via conversation_service
- [ ] T013 [US2] Create ConversationList component in apps/web/src/components/ConversationList.tsx — sidebar with conversation items sorted by updated_at desc
- [ ] T014 [US2] Update Chat page in apps/web/src/app/page.tsx — add ConversationList sidebar, load conversations on mount, select conversation to view history

## Phase 5: User Story 3 - 删除不需要的对话 (P2)

- [ ] T015 [US3] Implement soft-delete in apps/api/app/services/conversation_service.py — delete_conversation() sets deleted_at
- [ ] T016 [US3] Implement DELETE endpoint in apps/api/app/routers/conversations.py
- [ ] T017 [US3] Add delete button to ConversationList — call DELETE API, remove from local state

## Phase 6: User Story 4 - 旧对话自动过期清理 (P3)

- [ ] T018 [US4] Implement expiry filter in conversation_service.py — WHERE expires_at > datetime('now') AND deleted_at IS NULL
- [ ] T019 [US4] Verify expired conversations don't appear in list_conversations() and get_conversation()

## Phase 7: Polish

- [ ] T020 Verify cross-session isolation — ensure all queries filter by session_id
- [ ] T021 TypeScript typecheck — cd apps/web && npx tsc --noEmit
- [ ] T022 Python syntax check — py_compile for all .py files
- [ ] T023 Validate against quickstart.md

## Dependencies

- US1 depends on Foundational (Phase 2)
- US2 depends on US1 (needs session to exist)
- US3 depends on US2 (delete from existing list)
- US4 depends on US2 (expiry filter on list/query)
- US1/US2 can partially overlap (T005-T007 and T008-T011 are independent backend tasks)
