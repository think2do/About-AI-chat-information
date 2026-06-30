"""Error normalization — map Provider-specific errors to unified error codes."""

import httpx
from app.errors import ErrorCode


def normalize_provider_error(
    response: httpx.Response | None,
    error_body: str = "",
) -> ErrorCode:
    """Normalize a Provider HTTP error to a unified error code.

    Args:
        response: The httpx Response object (may be None for network errors).
        error_body: The raw error response body string.

    Returns:
        A unified ErrorCode.
    """
    if response is None:
        return ErrorCode.STREAM_INTERRUPTED

    status = response.status_code

    if status == 401 or status == 403:
        return ErrorCode.PROVIDER_AUTH_FAILED
    if status == 429:
        return ErrorCode.PROVIDER_RATE_LIMITED
    if 500 <= status < 600:
        return ErrorCode.PROVIDER_ERROR

    # Default: treat any unrecognized error as provider error
    return ErrorCode.PROVIDER_ERROR


def normalize_http_error(exc: httpx.HTTPError) -> ErrorCode:
    """Normalize an httpx exception to a unified error code.

    Args:
        exc: The httpx exception.

    Returns:
        A unified ErrorCode.
    """
    if isinstance(exc, httpx.TimeoutException):
        return ErrorCode.REQUEST_TIMEOUT
    if isinstance(exc, httpx.NetworkError):
        return ErrorCode.STREAM_INTERRUPTED
    return ErrorCode.PROVIDER_ERROR
