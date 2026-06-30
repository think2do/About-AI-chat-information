"""ChatStreamService — orchestrates a single streaming chat request.

Lifecycle:
1. Validate request (Pydantic)
2. Select ProviderAdapter
3. Build & send HTTP request to Provider
4. Stream-parse Provider response → SSE events
5. Cleanup (release api_key from memory)
"""

import asyncio
import logging
import uuid

import httpx

from app.adapters import get_adapter, BaseProviderAdapter
from app.errors import ErrorCode, CHINESE_ERROR_MESSAGES, RETRYABLE_ERRORS
from app.errors.normalization import normalize_http_error, normalize_provider_error
from app.models.events import sse_encode, sse_done
from app.models.request import ChatStreamRequest

logger = logging.getLogger(__name__)

# Default timeout for Provider HTTP calls (120s per Constitution constraints)
PROVIDER_TIMEOUT = httpx.Timeout(
    connect=10.0,
    read=120.0,
    write=10.0,
    pool=10.0,
)


def _build_error_event(
    code: ErrorCode,
    request_id: str,
    provider: str | None = None,
) -> dict:
    """Build a unified error SSE event dict."""
    return {
        "event": "error",
        "code": code.value,
        "message": CHINESE_ERROR_MESSAGES[code],
        "request_id": request_id,
        "retryable": code in RETRYABLE_ERRORS,
        "provider": provider,
    }


async def stream_chat(request: ChatStreamRequest) -> str:
    """Process a chat streaming request and yield SSE-encoded events.

    This is the main orchestrator. It is designed to be used as a FastAPI
    StreamingResponse generator.

    Args:
        request: The validated chat stream request.

    Yields:
        SSE-encoded strings (each line is "data: {json}\\n\\n").
    """
    request_id = f"req_{uuid.uuid4().hex[:12]}"
    adapter: BaseProviderAdapter | None = None
    api_key = request.api_key
    assistant_content = ""  # accumulate for auto-save
    stream_completed = False

    # Emit request_started event
    yield sse_encode({
        "event": "request_started",
        "request_id": request_id,
        "timestamp": _now_iso(),
    })

    try:
        adapter = get_adapter(request.provider, request.base_url)
        provider_req = adapter.build_request(request)
        async with httpx.AsyncClient(timeout=PROVIDER_TIMEOUT) as client:
            async with client.stream(
                method=provider_req.method,
                url=str(provider_req.url),
                headers=dict(provider_req.headers),
                content=provider_req.content,
            ) as response:
                if response.status_code != 200:
                    error_body = ""
                    try:
                        error_body = await response.aread()
                        error_body = error_body.decode("utf-8", errors="replace")[:500]
                    except Exception:
                        pass
                    code = adapter.normalize_error(response, error_body)
                    yield sse_encode(_build_error_event(code, request_id, request.provider.value))
                    return

                async for event in adapter.parse_stream(response):
                    if event.get("event") == "delta":
                        assistant_content += event.get("content", "")
                    yield sse_encode(event)

                stream_completed = True
                yield sse_done()

    except asyncio.CancelledError:
        yield sse_encode({
            "event": "cancelled",
            "request_id": request_id,
            "timestamp": _now_iso(),
            "partial_content": assistant_content,
        })
    except httpx.HTTPError as exc:
        code = normalize_http_error(exc)
        logger.warning("Provider HTTP error for request %s: %s", request_id, exc)
        yield sse_encode(_build_error_event(code, request_id, request.provider.value))
    except Exception as exc:
        logger.exception("Unexpected error in stream_chat for request %s", request_id)
        yield sse_encode(_build_error_event(
            ErrorCode.PROVIDER_ERROR, request_id, request.provider.value
        ))
    finally:
        # Auto-save conversation if stream completed or cancelled with partial content
        if stream_completed or assistant_content:
            try:
                from app.services.conversation_service import save_conversation
                messages_to_save = [
                    {"role": m.role, "content": m.content}
                    for m in request.messages
                    if m.role in ("user", "assistant")
                ]
                if assistant_content:
                    messages_to_save.append({"role": "assistant", "content": assistant_content})
                await save_conversation(
                    request.session_id,
                    request.conversation_id,
                    messages_to_save,
                )
                logger.info("Conversation saved for session %s", request.session_id)
            except Exception as save_err:
                logger.error("Failed to save conversation: %s", save_err)

        # CRITICAL: Release API Key from memory
        del api_key
        del request


def _now_iso() -> str:
    """Return current UTC timestamp in ISO format."""
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()
