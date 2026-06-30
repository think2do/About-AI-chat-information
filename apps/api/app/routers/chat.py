"""POST /api/chat/stream — streaming chat endpoint with rate limiting."""

import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.models.events import sse_encode
from app.models.request import ChatStreamRequest
from app.services.chat_stream_service import stream_chat
from app.services.rate_limiter import check_rate_limit
from app.errors import ErrorCode, CHINESE_ERROR_MESSAGES, RETRYABLE_ERRORS

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/stream")
async def chat_stream(body: ChatStreamRequest):
    """Stream a chat completion from the selected LLM Provider.

    Rate limited: 10 requests per minute per session.
    """
    # Rate limit check
    if not check_rate_limit(body.session_id):
        logger.warning("Rate limited session: %s", body.session_id)
        raise HTTPException(
            status_code=429,
            detail={
                "event": "error",
                "code": ErrorCode.PROVIDER_RATE_LIMITED.value,
                "message": "请求过于频繁，请稍后重试",
                "retryable": True,
            },
        )

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
            "X-Accel-Buffering": "no",
        },
    )
