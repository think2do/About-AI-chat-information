"""Custom Provider adapter — uses user-provided base_url, OpenAI-compatible format."""

import json
from typing import AsyncIterator

import httpx

from app.adapters.base import BaseProviderAdapter
from app.errors.codes import ErrorCode
from app.errors.normalization import normalize_provider_error
from app.models.request import ChatStreamRequest


class CustomAdapter(BaseProviderAdapter):
    """Adapter for custom OpenAI-compatible providers.

    Uses the base_url provided in the request (student-configured).
    """

    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")

    def build_request(self, req: ChatStreamRequest) -> httpx.Request:
        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {req.api_key}",
            "Content-Type": "application/json",
        }
        body = {
            "model": req.model,
            "messages": [m.model_dump() for m in req.messages],
            "temperature": req.params.temperature,
            "top_p": req.params.top_p,
            "max_tokens": req.params.max_tokens,
            "frequency_penalty": req.params.frequency_penalty,
            "presence_penalty": req.params.presence_penalty,
            "stream": True,
        }
        return httpx.Request(
            method="POST",
            url=url,
            headers=headers,
            content=json.dumps(body),
        )

    async def parse_stream(
        self, response: httpx.Response
    ) -> AsyncIterator[dict]:
        """Parse OpenAI-compatible SSE stream."""
        async for line in response.aiter_lines():
            if not line or not line.startswith("data: "):
                continue
            data_str = line[6:]
            if data_str == "[DONE]":
                yield {"event": "completed", "timestamp": self._now_iso()}
                return
            try:
                chunk = json.loads(data_str)
            except json.JSONDecodeError:
                continue
            choice = (chunk.get("choices") or [{}])[0]
            delta = choice.get("delta", {})
            content = delta.get("content", "")
            if content:
                yield {"event": "delta", "content": content, "timestamp": self._now_iso()}
            usage = chunk.get("usage")
            if usage:
                yield {
                    "event": "usage",
                    "prompt_tokens": usage.get("prompt_tokens", 0),
                    "completion_tokens": usage.get("completion_tokens", 0),
                    "total_tokens": usage.get("total_tokens", 0),
                }

    def normalize_error(
        self, response: httpx.Response | None, error_body: str
    ) -> ErrorCode:
        return normalize_provider_error(response, error_body)

    @staticmethod
    def _now_iso() -> str:
        from datetime import datetime, timezone
        return datetime.now(timezone.utc).isoformat()
