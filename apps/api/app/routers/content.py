"""Content API (Spec 009) — read-only, public teaching content.

No session/auth: teaching content is public. The seeder is the only writer.
"""

import logging

from fastapi import APIRouter, HTTPException, Response

from app.models.content import (
    CodeResponse,
    JargonResponse,
    JobListResponse,
    JobQuestion,
)
from app.services.content_service import get_code, get_jargon, get_job, list_jobs

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


@router.get("/jobs", response_model=JobListResponse)
async def jobs(
    response: Response,
    category: str | None = None,
    difficulty: str | None = None,
):
    """Job questions (light list) + all_tags with full counts. Optional filters."""
    try:
        data = await list_jobs(category=category, difficulty=difficulty)
    except Exception:
        logger.exception("Failed to load jobs content")
        raise HTTPException(status_code=500, detail="内容服务暂时不可用")

    response.headers["Cache-Control"] = "public, max-age=300"
    return data


@router.get("/jobs/{job_id}", response_model=JobQuestion)
async def job_detail(job_id: str, response: Response):
    """Full detail for one question; 404 if not found."""
    try:
        data = await get_job(job_id)
    except Exception:
        logger.exception("Failed to load job %s", job_id)
        raise HTTPException(status_code=500, detail="内容服务暂时不可用")

    if data is None:
        raise HTTPException(status_code=404, detail="题目不存在")

    response.headers["Cache-Control"] = "public, max-age=300"
    return data


@router.get("/code", response_model=CodeResponse)
async def code(response: Response):
    """Aggregate Code page data: tools / commands / simulator / agentLoop / hidden."""
    try:
        data = await get_code()
    except Exception:
        logger.exception("Failed to load code content")
        raise HTTPException(status_code=500, detail="内容服务暂时不可用")

    response.headers["Cache-Control"] = "public, max-age=300"
    return data
