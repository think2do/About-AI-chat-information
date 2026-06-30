"""OpenRouter adapter CoT/reasoning tests (Spec 014)."""

import asyncio
import json

from app.adapters.openrouter_adapter import OpenRouterAdapter
from app.models.request import ChatMessage, ChatStreamRequest, ModelParams, ProviderId


def _req(reasoning: bool) -> ChatStreamRequest:
    return ChatStreamRequest(
        session_id="anon_1234567890",
        provider=ProviderId.OPENROUTER,
        base_url="https://openrouter.ai/api/v1",
        model="openai/gpt-4o",
        api_key="sk-test",
        messages=[ChatMessage(role="user", content="hi")],
        params=ModelParams(reasoning_enabled=reasoning),
    )


def test_build_request_includes_reasoning_when_enabled():
    adapter = OpenRouterAdapter("https://openrouter.ai/api/v1")
    body = json.loads(adapter.build_request(_req(True)).content)
    assert body["reasoning"] == {"effort": "medium"}


def test_build_request_omits_reasoning_when_disabled():
    adapter = OpenRouterAdapter("https://openrouter.ai/api/v1")
    body = json.loads(adapter.build_request(_req(False)).content)
    assert "reasoning" not in body


class _FakeResponse:
    def __init__(self, lines):
        self._lines = lines

    async def aiter_lines(self):
        for line in self._lines:
            yield line


def test_parse_stream_emits_reasoning_and_delta():
    adapter = OpenRouterAdapter("https://openrouter.ai/api/v1")
    lines = [
        "data: " + json.dumps({"choices": [{"delta": {"reasoning": "让我想想…"}}]}),
        "data: " + json.dumps({"choices": [{"delta": {"content": "答案"}}]}),
        "data: [DONE]",
    ]

    async def run():
        return [ev async for ev in adapter.parse_stream(_FakeResponse(lines))]

    events = asyncio.run(run())
    kinds = [e["event"] for e in events]
    assert "reasoning" in kinds
    assert "delta" in kinds
    reasoning_ev = next(e for e in events if e["event"] == "reasoning")
    assert reasoning_ev["content"] == "让我想想…"
    delta_ev = next(e for e in events if e["event"] == "delta")
    assert delta_ev["content"] == "答案"
