# API Contract: Conversations API

**Feature**: 003-session-conversation | **Version**: 0.1.0

## GET /api/sessions/{session_id}/conversations

Return all non-expired, non-deleted conversations for an anonymous session.

**Response** (200):
```json
{
  "session_id": "anon_abc123def456",
  "conversations": [
    {
      "conversation_id": "conv_a1b2c3",
      "title": "什么是 Transformer？",
      "created_at": "2026-06-30T12:00:00Z",
      "updated_at": "2026-06-30T12:05:00Z",
      "expires_at": "2026-07-30T12:00:00Z",
      "message_count": 4
    }
  ]
}
```

**Response** (404): Session not found → auto-create (幂等)
```json
{ "session_id": "anon_abc123def456", "conversations": [] }
```

---

## GET /api/sessions/{session_id}/conversations/{conversation_id}

Return full conversation detail including all messages.

**Response** (200):
```json
{
  "conversation_id": "conv_a1b2c3",
  "session_id": "anon_abc123def456",
  "title": "什么是 Transformer？",
  "created_at": "2026-06-30T12:00:00Z",
  "messages": [
    { "message_id": "msg_001", "role": "user", "content": "什么是 Transformer？", "created_at": "..." },
    { "message_id": "msg_002", "role": "assistant", "content": "Transformer 是...", "created_at": "..." }
  ]
}
```

**Response** (403): conversation belongs to different session
**Response** (404): conversation not found

---

## DELETE /api/sessions/{session_id}/conversations/{conversation_id}

Soft-delete a conversation.

**Response** (200):
```json
{ "conversation_id": "conv_a1b2c3", "deleted": true }
```

**Response** (403): conversation belongs to different session
**Response** (404): conversation not found

---

## POST /api/sessions/{session_id}/conversations (internal — called by ChatStreamService)

Save a new conversation or append messages to an existing one after streaming completes.

**Request Body**:
```json
{
  "conversation_id": "conv_a1b2c3",
  "messages": [
    { "role": "user", "content": "什么是 Transformer？" },
    { "role": "assistant", "content": "Transformer 是..." }
  ]
}
```

**Response** (201/200):
```json
{
  "conversation_id": "conv_a1b2c3",
  "session_id": "anon_abc123def456",
  "title": "什么是 Transformer？",
  "message_count": 2
}
```

## Security

- All endpoints verify conversation belongs to session_id (FR-009: cross-session isolation)
- No API Key or PII in request/response
- Session auto-created on first access (idempotent)
