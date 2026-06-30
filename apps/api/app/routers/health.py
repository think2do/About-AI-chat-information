"""Health check endpoint with optional database connectivity check."""

import logging

from fastapi import APIRouter

from app.db.connection import get_db

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check with service status, version, and DB connectivity."""
    db_status = "ok"
    try:
        async with get_db() as db:
            await db.execute("SELECT 1")
    except Exception as e:
        logger.warning("Health check: DB unavailable — %s", e)
        db_status = "unavailable"

    return {
        "status": "ok",
        "service": "teaching-tool-api",
        "version": "0.1.0",
        "database": db_status,
    }
