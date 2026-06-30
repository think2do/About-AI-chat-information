"""Contract + seeder tests for Chat pipeline content (Spec 013)."""

import asyncio

import pytest

from app.db import seed_content as sc
from app.db.seed_content import SeedError, seed_content


def test_chat_pipeline_endpoint(seeded_client):
    r = seeded_client.get("/api/content/chat/pipeline")
    assert r.status_code == 200
    d = r.json()
    assert d["module"] == "chat"
    assert len(d["stages"]) == 7
    assert "上下文组装" in d["stages"][0]["label"]
    for s in d["stages"]:
        for f in ("num", "label", "short", "detail", "color"):
            assert s[f], f"stage missing {f}"
    assert "max-age=300" in r.headers.get("cache-control", "")


def test_chat_pipeline_empty_store(empty_client):
    r = empty_client.get("/api/content/chat/pipeline")
    assert r.status_code == 200
    assert r.json()["stages"] == []


def test_chat_seed_counts(empty_client):
    summary = asyncio.run(seed_content(module="chat"))
    assert summary["chat"]["categories"] == 0
    assert summary["chat"]["items"] == 7


def test_chat_seed_count_mismatch_fails(empty_client, monkeypatch):
    orig = sc.MODULE_REGISTRY["chat"]["loader"]

    def tampered():
        cats, items, meta = orig()
        return cats, items[:-1], meta

    monkeypatch.setitem(sc.MODULE_REGISTRY["chat"], "loader", tampered)
    with pytest.raises(SeedError):
        asyncio.run(seed_content(module="chat"))
