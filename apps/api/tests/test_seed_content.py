"""Seeder tests (Spec 009) — counts, idempotency, integrity assertion."""

import asyncio

import pytest

from app.db import seed_content as sc
from app.db.connection import get_db
from app.db.seed_content import SeedError, seed_content


async def _count_terms() -> int:
    async with get_db() as db:
        cur = await db.execute(
            "SELECT COUNT(*) AS n FROM content_items WHERE module='jargon' AND item_type='term'"
        )
        return (await cur.fetchone())["n"]


def test_seed_counts(empty_client):
    summary = asyncio.run(seed_content())
    assert summary["jargon"]["categories"] == 6
    assert summary["jargon"]["items"] == 36
    assert summary["jargon"]["inserted"] == 36
    assert asyncio.run(_count_terms()) == 36


def test_seed_is_idempotent(empty_client):
    asyncio.run(seed_content())
    summary = asyncio.run(seed_content())
    assert summary["jargon"]["inserted"] == 0
    assert summary["jargon"]["updated"] == 0
    assert summary["jargon"]["unchanged"] == 36
    assert asyncio.run(_count_terms()) == 36


def test_seed_count_mismatch_fails(empty_client, monkeypatch):
    orig_loader = sc.MODULE_REGISTRY["jargon"]["loader"]

    def tampered():
        cats, items, meta = orig_loader()
        return cats, items[:-1], meta  # drop one term -> 35, expected 36

    monkeypatch.setitem(sc.MODULE_REGISTRY["jargon"], "loader", tampered)

    with pytest.raises(SeedError):
        asyncio.run(seed_content())

    # nothing committed on failure
    assert asyncio.run(_count_terms()) == 0
