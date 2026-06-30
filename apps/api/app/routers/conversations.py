"""Conversations API — session-based conversation CRUD."""

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.services.conversation_service import (
    list_conversations,
    get_conversation,
    delete_conversation,
    save_conversation,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/sessions", tags=["conversations"])


@router.get("/{session_id}/conversations")
async def get_conversations(session_id: str):
    """List all non-expired, non-deleted conversations for a session."""
    try:
        conversations = await list_conversations(session_id)
        return {"session_id": session_id, "conversations": conversations}
    except Exception as e:
        logger.exception("Failed to list conversations for session %s", session_id)
        raise HTTPException(status_code=500, detail="Failed to list conversations")


@router.get("/{session_id}/conversations/{conversation_id}")
async def get_conversation_detail(session_id: str, conversation_id: str):
    """Get full conversation detail with all messages."""
    try:
        conv = await get_conversation(session_id, conversation_id)
        if conv is None:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return conv
    except PermissionError:
        raise HTTPException(status_code=403, detail="Access denied")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to get conversation %s", conversation_id)
        raise HTTPException(status_code=500, detail="Failed to get conversation")


@router.delete("/{session_id}/conversations/{conversation_id}")
async def delete_conversation_endpoint(session_id: str, conversation_id: str):
    """Soft-delete a conversation."""
    try:
        deleted = await delete_conversation(session_id, conversation_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return {"conversation_id": conversation_id, "deleted": True}
    except PermissionError:
        raise HTTPException(status_code=403, detail="Access denied")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to delete conversation %s", conversation_id)
        raise HTTPException(status_code=500, detail="Failed to delete conversation")


@router.post("/{session_id}/conversations")
async def save_conversation_endpoint(session_id: str, body: dict):
    """Save messages to a conversation (internal — called after chat completes).

    Body: { conversation_id?: string, messages: [{role, content}] }
    """
    conversation_id = body.get("conversation_id")
    messages = body.get("messages", [])
    if not messages:
        raise HTTPException(status_code=400, detail="messages is required")

    try:
        result = await save_conversation(session_id, conversation_id, messages)
        return result
    except PermissionError:
        raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        logger.exception("Failed to save conversation for session %s", session_id)
        raise HTTPException(status_code=500, detail="Failed to save conversation")
