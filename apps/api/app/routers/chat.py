"""POST /api/chat/stream — streaming chat endpoint.

Receives a ChatStreamRequest, delegates to ChatStreamService, and returns
an SSE StreamingResponse.
"""

import logging

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from app.models.request import ChatStreamRequest
from app.services.chat_stream_service import stream_chat

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/stream")
async def chat_stream(body: ChatStreamRequest, request: Request):
    """Stream a chat completion from the selected LLM Provider.

    Request body: ChatStreamRequest (provider, base_url, model, api_key,
    messages, params, stream)

    Returns: SSE stream with unified ChatStreamEvent format.

    Security: api_key is released from memory after the stream completes.
    """
    logger.info(
        "Chat stream request: session=%s provider=%s model=%s",
        body.session_id, body.provider.value, body.model,
    )

    return StreamingResponse(
        stream_chat(body),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Request-Id": f"req_{body.session_id}",
            "X-Accel-Buffering": "no",  # disable nginx buffering
        },
    )
