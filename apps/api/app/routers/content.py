"""Content API (Spec 009) — read-only, public teaching content.

No session/auth: teaching content is public. The seeder is the only writer.
"""

import logging

from fastapi import APIRouter, HTTPException, Response

from app.models.content import JargonResponse
from app.services.content_service import get_jargon

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/content", tags=["content"])


@router.get("/jargon", response_model=JargonResponse)
async def jargon(response: Response):
    """Jargon terms grouped by category. Empty store returns total=0."""
    try:
        data = await get_jargon()
    except Exception:
        logger.exception("Failed to load jargon content")
        raise HTTPException(status_code=500, detail="内容服务暂时不可用")

    response.headers["Cache-Control"] = "public, max-age=300"
    return data
