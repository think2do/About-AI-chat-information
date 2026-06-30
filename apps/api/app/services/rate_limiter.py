"""In-memory rate limiter — sliding window, per-session counters.

Production path: replace with Redis for multi-instance deployment.
"""

import time
from collections import defaultdict

# Rate limit config
RATE_LIMIT_WINDOW_SEC = 60  # 1 minute window
RATE_LIMIT_MAX_REQUESTS = 10  # max requests per window per session

# In-memory storage: { session_id: [timestamp, ...] }
_requests: dict[str, list[float]] = defaultdict(list)


def check_rate_limit(session_id: str) -> bool:
    """Check if a session is within rate limit.

    Returns True if allowed, False if rate limited.
    """
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW_SEC

    # Clean old entries
    timestamps = _requests[session_id]
    timestamps[:] = [t for t in timestamps if t > window_start]

    if len(timestamps) >= RATE_LIMIT_MAX_REQUESTS:
        return False  # Rate limited

    timestamps.append(now)
    return True  # Allowed


def get_remaining(session_id: str) -> int:
    """Return remaining requests in current window."""
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW_SEC
    timestamps = _requests[session_id]
    timestamps[:] = [t for t in timestamps if t > window_start]
    return max(0, RATE_LIMIT_MAX_REQUESTS - len(timestamps))


def cleanup_old_entries():
    """Remove entries older than 2x window (periodic cleanup)."""
    now = time.time()
    cutoff = now - (2 * RATE_LIMIT_WINDOW_SEC)
    to_delete = []
    for sid, timestamps in _requests.items():
        timestamps[:] = [t for t in timestamps if t > cutoff]
        if not timestamps:
            to_delete.append(sid)
    for sid in to_delete:
        del _requests[sid]
