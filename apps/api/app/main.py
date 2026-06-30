import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import health, chat, conversations, content
from app.db.connection import get_db, init_db

logger = logging.getLogger(__name__)


def _truthy(value: str) -> bool:
    return value.strip().lower() not in ("", "0", "false", "no", "off")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database schema on startup; optionally seed teaching content.

    Content seeding is idempotent. It runs unless SEED_CONTENT_ON_STARTUP is set
    to a falsy value (prod deployments set it off and run the CLI explicitly).
    """
    async with get_db() as db:
        await init_db(db)

    if _truthy(os.environ.get("SEED_CONTENT_ON_STARTUP", "1")):
        try:
            from app.db.seed_content import seed_content

            summary = await seed_content()
            logger.info("content seeded on startup: %s", summary)
        except Exception:
            logger.exception("content seed on startup failed (continuing)")

    yield


app = FastAPI(
    title="AI Teaching Tool API",
    version="0.1.0",
    docs_url=None,
    redoc_url=None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(chat.router)
app.include_router(conversations.router)
app.include_router(content.router)
