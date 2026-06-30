"""SSE event serialization — encode ChatStreamEvent dicts to SSE wire format."""

import json


def sse_encode(event: dict) -> str:
    """Encode a ChatStreamEvent dict to an SSE data line.

    Format: "data: {json}\\n\\n"

    Args:
        event: A dict with at least an "event" key.

    Returns:
        The SSE-encoded string.
    """
    return f"data: {json.dumps(event, ensure_ascii=False)}\n\n"


def sse_done() -> str:
    """Return the SSE stream termination marker."""
    return "data: [DONE]\n\n"
