"""Database connection management — async SQLite via aiosqlite."""

import os
from contextlib import asynccontextmanager

import aiosqlite

from app.db.schema import SCHEMA_SQL

DB_PATH = os.environ.get(
    "DATABASE_URL",
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "teaching_tool.db"),
)

# Normalize path (resolve relative to project)
if DB_PATH.startswith("sqlite:///"):
    DB_PATH = DB_PATH[len("sqlite:///"):]


async def init_db(db: aiosqlite.Connection):
    """Initialize database schema (idempotent)."""
    await db.executescript(SCHEMA_SQL)
    await db.commit()


@asynccontextmanager
async def get_db():
    """Async context manager for database connections.

    Usage:
        async with get_db() as db:
            cursor = await db.execute("SELECT ...")
    """
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode=WAL")
    await db.execute("PRAGMA foreign_keys=ON")
    try:
        yield db
    finally:
        await db.close()
