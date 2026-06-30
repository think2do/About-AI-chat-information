# Implementation Plan: 匿名会话与对话保存 (Anonymous Session & Conversation)

**Branch**: `003-session-conversation` | **Date**: 2026-06-30 | **Spec**: [spec.md](./spec.md)

## Summary

实现匿名会话管理——前端自动生成 session_id，后端 SQLite 持久化 session/conversation/message 三张表，Chat 流完成后自动保存，提供对话列表/详情/删除 API。30 天惰性过期清理。

## Technical Context

**Language/Version**: TypeScript 5.x (frontend), Python 3.11+ (backend)

**Primary Dependencies**: FastAPI, SQLite (stdlib sqlite3 via aiosqlite), Pydantic

**Storage**: SQLite (`apps/api/data/teaching_tool.db`), 三张表: sessions, conversations, messages

**Testing**: `tsc --noEmit`, Python syntax check, quickstart manual validation

**Constraints**: session 数据完全隔离 (FR-009); 30 天惰性过期 (FR-005, FR-006); API Key 不入库 (Constitution)

## Constitution Check

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. 关注点分离 | ✅ PASS | 数据层（SQLite models）与服务层（ChatStreamService 集成）分离 |
| II. Spec 与文档规范 | ✅ PASS | 9 FRs 全部映射 |
| III. 第一性原理 | ✅ PASS | 仅引入 aiosqlite（Python 异步 SQLite 最小依赖） |
| IV. 测试覆盖 | ✅ PASS | quickstart 手动验证 + typecheck + syntax check |
| V. 过程可回溯 | ✅ PASS | plan/research/data-model/contracts/quickstart 留档 |

## Project Structure (incremental)

```text
apps/api/
  app/
    db/
      __init__.py
      schema.py          # CREATE TABLE statements
      connection.py      # async get_db() context manager
    models/
      session.py         # Session + Conversation + Message Pydantic/dataclass
    services/
      conversation_service.py  # CRUD operations
    routers/
      conversations.py   # GET /api/sessions/{id}/conversations, DELETE ...

apps/web/
  src/
    components/
      ConversationList.tsx   # Left sidebar: conversation list
      ConversationDetail.tsx # Chat history detail view
    app/
      page.tsx               # Update: integrate ConversationList sidebar

specs/003-session-conversation/
  contracts/
    conversations-api.md     # REST API contracts
```
