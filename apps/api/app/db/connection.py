"""Database connection management — async SQLite via aiosqlite."""

import os
from contextlib import asynccontextmanager

import aiosqlite

from app.db.schema import SCHEMA_SQL, SCHEMA_SQL_CONTENT

DB_PATH = os.environ.get(
    "DATABASE_URL",
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "teaching_tool.db"),
)

# Normalize path (resolve relative to project)
if DB_PATH.startswith("sqlite:///"):
    DB_PATH = DB_PATH[len("sqlite:///"):]


def _ensure_db_dir() -> None:
    """Create the DB's parent directory if missing.

    The runtime .db is gitignored (content's source of truth is JSON fixtures),
    so the data/ directory is not guaranteed to exist on a fresh checkout.
    """
    parent = os.path.dirname(os.path.abspath(DB_PATH))
    if parent:
        os.makedirs(parent, exist_ok=True)


async def init_db(db: aiosqlite.Connection):
    """Initialize database schema (idempotent). Creates session/conversation
    tables and the Spec-009 teaching-content tables."""
    await db.executescript(SCHEMA_SQL)
    await db.executescript(SCHEMA_SQL_CONTENT)
    await db.commit()


@asynccontextmanager
async def get_db():
    """Async context manager for database connections.

    Usage:
        async with get_db() as db:
            cursor = await db.execute("SELECT ...")
    """
    _ensure_db_dir()
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode=WAL")
    await db.execute("PRAGMA foreign_keys=ON")
    try:
        yield db
    finally:
        await db.close()
