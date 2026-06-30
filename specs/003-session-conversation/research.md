# Research: 匿名会话与对话保存 技术选型

**Feature**: 003-session-conversation | **Date**: 2026-06-30

## 1. 数据库: SQLite + aiosqlite

**Decision**: 使用 SQLite + `aiosqlite` 作为异步数据库驱动。

**Rationale**:
- Constitution 规定开发阶段使用 SQLite，生产阶段迁移到 PostgreSQL
- `aiosqlite` 是 Python 异步 SQLite 的标准方案，与 FastAPI async 兼容
- 无需外部服务，`docker-compose` 中无需新增容器
- sqlite3 是 Python stdlib，aiosqlite 是轻量 wrapper（~50KB）

**Alternatives considered**:
- `databases` 库 + `sqlalchemy`: 功能更强但依赖重，第一阶段的简单 schema 不需要
- 原始 `sqlite3` 同步 + `run_in_executor`: 可行但代码更繁琐

## 2. Schema 设计: 三表 + 软删除 + 惰性过期

**Decision**: sessions/conversations/messages 三表设计。conversations 支持软删除（deleted_at）和惰性过期（expires_at 查询过滤），不做定时物理删除。

**Rationale**:
- 三表归一化：session 记录访问元数据，conversation 是对话容器，message 是单条消息
- 软删除：避免误删无法恢复，deleted_at 标记而非物理删除
- 惰性过期：查询时 WHERE expires_at > datetime('now') AND deleted_at IS NULL，简单可靠

**Alternatives considered**:
- 单表嵌套 JSON：查询和隔离复杂
- 定时清理 cron：第一阶段引入外部调度器过度设计

## 3. 对话标题生成: 第一条 user 消息前 50 字符

**Decision**: 自动截取第一条 user message 的前 50 字符作为 conversation title。

**Rationale**:
- 不需要额外 NLP/LLM 调用（无额外成本）
- 对教学场景足够——学生通常用中文问题开头
- 50 字符在 UI 中显示友好

## 4. 前端 session_id 生成: crypto.randomUUID()

**Decision**: 前端使用 `crypto.randomUUID()` 生成 `anon_<uuid>` 格式的 session_id，保存在 localStorage。

**Rationale**:
- 浏览器原生 API，无依赖
- 128 位随机性，碰撞概率可忽略
- 与 Spec 002 的 api.ts 中 getOrCreateSessionId() 一致
