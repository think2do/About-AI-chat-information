"""Contract + seeder tests for Lab content (Spec 012)."""

import asyncio

import pytest

from app.db import seed_content as sc
from app.db.seed_content import SeedError, seed_content


def test_lab_endpoint(seeded_client):
    r = seeded_client.get("/api/content/lab")
    assert r.status_code == 200
    d = r.json()
    assert d["module"] == "lab"
    assert len(d["functionCall"]) == 5
    assert len(d["inference"]) == 10
    assert len(d["rag"]) == 10
    assert len(d["tokenizer"]["modes"]) == 3
    assert len(d["tokenizer"]["quickref"]["cards"]) == 4
    assert "{q}" in d["training"]["baseTemplate"]
    assert d["training"]["sftAnswer"]
    assert d["rag"][0]["phase"]
    assert d["inference"][0]["num"] == "01"
    assert "max-age=300" in r.headers.get("cache-control", "")


def test_lab_empty_store(empty_client):
    r = empty_client.get("/api/content/lab")
    assert r.status_code == 200
    d = r.json()
    assert d["functionCall"] == []
    assert d["inference"] == []
    assert d["rag"] == []
    assert d["training"] is None
    assert d["tokenizer"] is None


def test_lab_seed_counts(empty_client):
    summary = asyncio.run(seed_content(module="lab"))
    assert summary["lab"]["categories"] == 0
    assert summary["lab"]["items"] == 25


def test_lab_seed_count_mismatch_fails(empty_client, monkeypatch):
    orig = sc.MODULE_REGISTRY["lab"]["loader"]

    def tampered():
        cats, items, meta = orig()
        return cats, items[:-1], meta

    monkeypatch.setitem(sc.MODULE_REGISTRY["lab"], "loader", tampered)
    with pytest.raises(SeedError):
        asyncio.run(seed_content(module="lab"))
