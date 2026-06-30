"""ChatStreamRequest and validation — Pydantic models for POST /api/chat/stream."""

import re
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class ProviderId(str, Enum):
    OPENROUTER = "openrouter"
    AIHUBMIX = "aihubmix"
    PACKY = "packy"
    CUSTOM = "custom"


class ChatMessage(BaseModel):
    role: str = Field(..., pattern=r"^(system|user|assistant)$")
    content: str = Field(..., min_length=1)


class ModelParams(BaseModel):
    temperature: float = Field(default=0.7, ge=0, le=2)
    top_p: float = Field(default=1.0, ge=0, le=1)
    max_tokens: int = Field(default=2048, ge=1, le=4096)
    frequency_penalty: float = Field(default=0, ge=0, le=2)
    presence_penalty: float = Field(default=0, ge=0, le=2)
    reasoning_enabled: Optional[bool] = Field(default=False)


class ChatStreamRequest(BaseModel):
    session_id: str = Field(..., min_length=10, max_length=64)
    provider: ProviderId
    base_url: str = Field(..., min_length=1)
    model: str = Field(..., min_length=1, max_length=100)
    api_key: str = Field(..., min_length=1, max_length=256)
    messages: list[ChatMessage] = Field(..., min_length=1)
    params: ModelParams = Field(default_factory=ModelParams)
    stream: bool = Field(default=True)
    conversation_id: str | None = Field(default=None)

    @field_validator("session_id")
    @classmethod
    def session_id_must_have_anon_prefix(cls, v: str) -> str:
        if not v.startswith("anon_"):
            raise ValueError("session_id must start with 'anon_'")
        return v

    @field_validator("base_url")
    @classmethod
    def base_url_must_be_valid(cls, v: str) -> str:
        if not re.match(r"^https?://", v):
            raise ValueError("base_url must start with http:// or https://")
        return v

    @field_validator("messages")
    @classmethod
    def must_have_user_message(cls, v: list[ChatMessage]) -> list[ChatMessage]:
        if not any(m.role == "user" for m in v):
            raise ValueError("messages must contain at least one user message")
        return v

    @field_validator("stream")
    @classmethod
    def stream_must_be_true(cls, v: bool) -> bool:
        if not v:
            raise ValueError("stream must be true for /api/chat/stream")
        return v

    @field_validator("messages")
    @classmethod
    def messages_not_too_long(cls, v: list[ChatMessage]) -> list[ChatMessage]:
        total_chars = sum(len(m.content) for m in v)
        if total_chars > 100_000:
            raise ValueError(
                f"messages total content length ({total_chars}) exceeds 100,000 characters"
            )
        if len(v) > 50:
            raise ValueError("messages count ({len(v)}) exceeds 50 messages")
        return v
