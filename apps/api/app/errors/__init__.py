"""Unified error codes and Chinese error messages for the Chat Streaming Gateway.

All Provider errors are normalized to one of these 8 codes.
"""

from enum import Enum


class ErrorCode(str, Enum):
    """Unified error codes for all chat streaming errors."""

    VALIDATION_ERROR = "VALIDATION_ERROR"
    MISSING_API_KEY = "MISSING_API_KEY"
    PROVIDER_AUTH_FAILED = "PROVIDER_AUTH_FAILED"
    PROVIDER_RATE_LIMITED = "PROVIDER_RATE_LIMITED"
    PROVIDER_ERROR = "PROVIDER_ERROR"
    STREAM_INTERRUPTED = "STREAM_INTERRUPTED"
    REQUEST_TIMEOUT = "REQUEST_TIMEOUT"
    REQUEST_CANCELLED = "REQUEST_CANCELLED"


# Chinese user-facing error messages
CHINESE_ERROR_MESSAGES: dict[ErrorCode, str] = {
    ErrorCode.VALIDATION_ERROR: "请求参数不合法",
    ErrorCode.MISSING_API_KEY: "请先配置 API Key",
    ErrorCode.PROVIDER_AUTH_FAILED: "Provider 认证失败，请检查你的 API Key",
    ErrorCode.PROVIDER_RATE_LIMITED: "当前 Provider 请求过于频繁，请稍后重试",
    ErrorCode.PROVIDER_ERROR: "Provider 服务错误，请稍后重试",
    ErrorCode.STREAM_INTERRUPTED: "流式传输中断，请检查网络或重试",
    ErrorCode.REQUEST_TIMEOUT: "请求超时，请稍后重试",
    ErrorCode.REQUEST_CANCELLED: "请求已取消",
}

# Which errors are retryable (show retry button on frontend)
RETRYABLE_ERRORS: set[ErrorCode] = {
    ErrorCode.PROVIDER_RATE_LIMITED,
    ErrorCode.PROVIDER_ERROR,
    ErrorCode.STREAM_INTERRUPTED,
    ErrorCode.REQUEST_TIMEOUT,
}

# HTTP status codes mapped to error codes
ERROR_HTTP_STATUS: dict[ErrorCode, int] = {
    ErrorCode.VALIDATION_ERROR: 400,
    ErrorCode.MISSING_API_KEY: 400,
    ErrorCode.PROVIDER_AUTH_FAILED: 502,
    ErrorCode.PROVIDER_RATE_LIMITED: 429,
    ErrorCode.PROVIDER_ERROR: 502,
    ErrorCode.STREAM_INTERRUPTED: 502,
    ErrorCode.REQUEST_TIMEOUT: 504,
    ErrorCode.REQUEST_CANCELLED: 499,
}
