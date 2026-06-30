"""Contract + seeder tests for Code content (Spec 011)."""

import asyncio

import pytest

from app.db import seed_content as sc
from app.db.seed_content import SeedError, seed_content


def test_code_endpoint(seeded_client):
    r = seeded_client.get("/api/content/code")
    assert r.status_code == 200
    d = r.json()
    assert d["module"] == "code"

    tcats = d["tools"]["categories"]
    assert len(tcats) == 8
    assert sum(c["count"] for c in tcats) == 52
    assert sum(len(c["tools"]) for c in tcats) == 52

    ccats = d["commands"]["categories"]
    assert len(ccats) == 5
    assert sum(c["count"] for c in ccats) == 95

    assert len(d["simulator"]) == 11
    assert len(d["agentLoop"]) == 11
    assert len(d["hidden"]) == 8

    tools = {t["name"]: t for c in tcats for t in c["tools"]}
    assert tools["Sleep"]["isExp"] is True
    assert tools["FileRead"]["isExp"] is False
    assert tools["FileRead"]["title"] and tools["FileRead"]["plain"]

    # simulator/agent shape
    assert d["agentLoop"][0]["num"] == "1"
    assert d["simulator"][0]["seq"]["title"]

    assert "max-age=300" in r.headers.get("cache-control", "")


def test_code_empty_store(empty_client):
    r = empty_client.get("/api/content/code")
    assert r.status_code == 200
    d = r.json()
    assert d["tools"]["categories"] == []
    assert d["commands"]["categories"] == []
    assert d["simulator"] == []
    assert d["hidden"] == []


def test_code_seed_counts(empty_client):
    summary = asyncio.run(seed_content(module="code"))
    assert summary["code"]["categories"] == 13
    assert summary["code"]["items"] == 177


def test_code_seed_count_mismatch_fails(empty_client, monkeypatch):
    orig = sc.MODULE_REGISTRY["code"]["loader"]

    def tampered():
        cats, items, meta = orig()
        return cats, items[:-1], meta

    monkeypatch.setitem(sc.MODULE_REGISTRY["code"], "loader", tampered)
    with pytest.raises(SeedError):
        asyncio.run(seed_content(module="code"))
