from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint for service monitoring and Docker healthcheck."""
    return {
        "status": "ok",
        "service": "teaching-tool-api",
        "version": "0.1.0",
    }
