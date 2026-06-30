"""Pytest fixtures — isolated temp SQLite + FastAPI TestClient.

Each test gets a fresh temp DB via monkeypatching ``app.db.connection.DB_PATH``
(``get_db()`` reads that module global on every call, so patching it redirects
all connections to the temp file). ``seeded_client`` runs the content seeder;
``empty_client`` only creates tables.
"""

import asyncio

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def _temp_db(monkeypatch, tmp_path):
    monkeypatch.setattr("app.db.connection.DB_PATH", str(tmp_path / "test.db"))


async def _setup(seed: bool):
    from app.db.connection import get_db, init_db

    async with get_db() as db:
        await init_db(db)
    if seed:
        from app.db.seed_content import seed_content

        await seed_content()


@pytest.fixture
def seeded_client(_temp_db):
    from app.main import app

    asyncio.run(_setup(seed=True))
    return TestClient(app)


@pytest.fixture
def empty_client(_temp_db):
    from app.main import app

    asyncio.run(_setup(seed=False))
    return TestClient(app)
