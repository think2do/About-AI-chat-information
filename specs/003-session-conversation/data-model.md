# Data Model: 匿名会话与对话保存

**Feature**: 003-session-conversation | **Date**: 2026-06-30

## Database Schema (SQLite)

### Table: sessions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| session_id | TEXT | PRIMARY KEY | 前端生成的 anon_ UUID |
| created_at | TEXT | NOT NULL, DEFAULT (datetime('now')) | 首次访问时间 |
| last_seen_at | TEXT | NOT NULL, DEFAULT (datetime('now')) | 最近活动时间 |
| user_agent_hash | TEXT | | UA 的 SHA256 前 16 字符 |
| ip_hash | TEXT | | IP 的 SHA256 前 16 字符 |

### Table: conversations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| conversation_id | TEXT | PRIMARY KEY | UUID |
| session_id | TEXT | NOT NULL, FK→sessions | 所属匿名 session |
| title | TEXT | NOT NULL | 第一条 user 消息前 50 字符 |
| created_at | TEXT | NOT NULL, DEFAULT (datetime('now')) | |
| updated_at | TEXT | NOT NULL, DEFAULT (datetime('now')) | 最后一条消息时间 |
| expires_at | TEXT | NOT NULL | created_at + 30 天 |
| deleted_at | TEXT | | 软删除标记 |

### Table: messages

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| message_id | TEXT | PRIMARY KEY | UUID |
| conversation_id | TEXT | NOT NULL, FK→conversations | 所属对话 |
| role | TEXT | NOT NULL | system/user/assistant |
| content | TEXT | NOT NULL | 消息正文 |
| created_at | TEXT | NOT NULL, DEFAULT (datetime('now')) | |
| token_estimate | INTEGER | | 估算 token 数 |

### Indexes

```sql
CREATE INDEX idx_conversations_session ON conversations(session_id, deleted_at, expires_at);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
```

## API Entities

### ConversationListItem (GET response item)

```json
{
  "conversation_id": "conv_abc123",
  "title": "什么是 Transformer？",
  "created_at": "2026-06-30T12:00:00Z",
  "updated_at": "2026-06-30T12:05:00Z",
  "expires_at": "2026-07-30T12:00:00Z",
  "message_count": 4
}
```

### ConversationDetail (GET single conversation response)

```json
{
  "conversation_id": "conv_abc123",
  "session_id": "anon_abc123def456",
  "title": "什么是 Transformer？",
  "created_at": "...",
  "updated_at": "...",
  "expires_at": "...",
  "messages": [
    { "message_id": "msg_001", "role": "user", "content": "什么是 Transformer？", "created_at": "..." },
    { "message_id": "msg_002", "role": "assistant", "content": "Transformer 是...", "created_at": "..." }
  ]
}
```
