from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import health, chat, conversations
from app.db.connection import get_db, init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database schema on startup."""
    async with get_db() as db:
        await init_db(db)
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
