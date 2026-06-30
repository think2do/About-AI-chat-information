"""Conversation service — session and conversation CRUD operations."""

import uuid
import logging
from datetime import datetime, timezone, timedelta

from app.db.connection import get_db

logger = logging.getLogger(__name__)

CONVERSATION_TTL_DAYS = 30


async def ensure_session(session_id: str) -> None:
    """Create or update a session record (idempotent)."""
    async with get_db() as db:
        await db.execute(
            """INSERT INTO sessions (session_id, last_seen_at)
               VALUES (?, datetime('now'))
               ON CONFLICT(session_id) DO UPDATE SET last_seen_at = datetime('now')""",
            (session_id,),
        )
        await db.commit()


async def save_conversation(
    session_id: str,
    conversation_id: str | None,
    messages: list[dict],
) -> dict:
    """Save messages to a conversation. Creates conversation if needed.

    Args:
        session_id: The anonymous session ID.
        conversation_id: Existing conversation ID, or None to create new.
        messages: List of {role, content} dicts to append.

    Returns:
        Dict with conversation_id, session_id, title, message_count.
    """
    async with get_db() as db:
        await ensure_session(session_id)

        now = datetime.now(timezone.utc).isoformat()
        expires = (datetime.now(timezone.utc) + timedelta(days=CONVERSATION_TTL_DAYS)).isoformat()

        if conversation_id:
            # Verify ownership
            cursor = await db.execute(
                "SELECT session_id FROM conversations WHERE conversation_id = ? AND deleted_at IS NULL",
                (conversation_id,),
            )
            row = await cursor.fetchone()
            if not row or row["session_id"] != session_id:
                raise PermissionError("Conversation does not belong to this session")
            # Update timestamp
            await db.execute(
                "UPDATE conversations SET updated_at = ? WHERE conversation_id = ?",
                (now, conversation_id),
            )
        else:
            # Create new conversation
            conversation_id = f"conv_{uuid.uuid4().hex[:12]}"
            # Title from first user message
            first_user_msg = next((m for m in messages if m.get("role") == "user"), None)
            title = (first_user_msg["content"][:50] if first_user_msg else "新对话")

            await db.execute(
                """INSERT INTO conversations (conversation_id, session_id, title, created_at, updated_at, expires_at)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (conversation_id, session_id, title, now, now, expires),
            )

        # Insert messages
        for msg in messages:
            msg_id = f"msg_{uuid.uuid4().hex[:12]}"
            await db.execute(
                """INSERT INTO messages (message_id, conversation_id, role, content, created_at)
                   VALUES (?, ?, ?, ?, ?)""",
                (msg_id, conversation_id, msg["role"], msg["content"], now),
            )

        await db.commit()

        # Count messages
        cursor = await db.execute(
            "SELECT COUNT(*) as cnt FROM messages WHERE conversation_id = ?",
            (conversation_id,),
        )
        count = (await cursor.fetchone())["cnt"]

        return {
            "conversation_id": conversation_id,
            "session_id": session_id,
            "title": title if not conversation_id else None,
            "message_count": count,
        }


async def list_conversations(session_id: str) -> list[dict]:
    """List non-expired, non-deleted conversations for a session."""
    await ensure_session(session_id)

    async with get_db() as db:
        cursor = await db.execute(
            """SELECT
                 c.conversation_id,
                 c.title,
                 c.created_at,
                 c.updated_at,
                 c.expires_at,
                 COUNT(m.message_id) as message_count
               FROM conversations c
               LEFT JOIN messages m ON c.conversation_id = m.conversation_id
               WHERE c.session_id = ?
                 AND c.deleted_at IS NULL
                 AND c.expires_at > datetime('now')
               GROUP BY c.conversation_id
               ORDER BY c.updated_at DESC""",
            (session_id,),
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def get_conversation(session_id: str, conversation_id: str) -> dict | None:
    """Get full conversation detail with messages. Returns None if not found."""
    async with get_db() as db:
        # Check ownership and not deleted/expired
        cursor = await db.execute(
            """SELECT session_id FROM conversations
               WHERE conversation_id = ? AND deleted_at IS NULL AND expires_at > datetime('now')""",
            (conversation_id,),
        )
        row = await cursor.fetchone()
        if not row:
            return None
        if row["session_id"] != session_id:
            raise PermissionError("Conversation does not belong to this session")

        # Get conversation info
        cursor = await db.execute(
            "SELECT * FROM conversations WHERE conversation_id = ?",
            (conversation_id,),
        )
        conv = dict(await cursor.fetchone())

        # Get messages
        cursor = await db.execute(
            "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
            (conversation_id,),
        )
        messages = [dict(row) for row in await cursor.fetchall()]

        conv["messages"] = messages
        return conv


async def delete_conversation(session_id: str, conversation_id: str) -> bool:
    """Soft-delete a conversation. Returns True if found and deleted."""
    async with get_db() as db:
        cursor = await db.execute(
            "SELECT session_id FROM conversations WHERE conversation_id = ? AND deleted_at IS NULL",
            (conversation_id,),
        )
        row = await cursor.fetchone()
        if not row:
            return False
        if row["session_id"] != session_id:
            raise PermissionError("Conversation does not belong to this session")

        await db.execute(
            "UPDATE conversations SET deleted_at = datetime('now') WHERE conversation_id = ?",
            (conversation_id,),
        )
        await db.commit()
        return True
