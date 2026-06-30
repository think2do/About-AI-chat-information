"""Abstract base class for Provider adapters.

Each Provider (OpenRouter, AI HubMix, Packy, Custom) gets its own adapter
that implements the three core methods: build_request, parse_stream, normalize_error.
"""

from abc import ABC, abstractmethod
from typing import AsyncIterator

import httpx

from app.models.request import ChatStreamRequest
from app.errors.codes import ErrorCode


class BaseProviderAdapter(ABC):
    """Strategy interface for LLM Provider adapters.

    Each concrete adapter:
    1. build_request() — converts internal ChatStreamRequest to Provider HTTP request
    2. parse_stream() — parses Provider SSE response into unified ChatStreamEvent dicts
    3. normalize_error() — maps Provider error responses to unified ErrorCode
    """

    @abstractmethod
    def build_request(self, req: ChatStreamRequest) -> httpx.Request:
        """Build a Provider-specific HTTP request from the unified request.

        Args:
            req: The validated chat stream request.

        Returns:
            An httpx.Request ready to be sent.
        """
        ...

    @abstractmethod
    async def parse_stream(
        self, response: httpx.Response
    ) -> AsyncIterator[dict]:
        """Parse the Provider's SSE response stream into unified event dicts.

        Args:
            response: The httpx Response from the Provider (status 200).

        Yields:
            Dicts with at least an "event" key (request_started, delta, usage,
            completed).
        """
        ...

    @abstractmethod
    def normalize_error(
        self, response: httpx.Response | None, error_body: str
    ) -> ErrorCode:
        """Map a Provider error response to a unified error code.

        Args:
            response: The httpx Response (may be None for network errors).
            error_body: Raw error response body string.

        Returns:
            A unified ErrorCode.
        """
        ...
