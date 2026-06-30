"""Contract + seeder tests for Job content (Spec 010)."""

import asyncio

import pytest

from app.db import seed_content as sc
from app.db.connection import get_db
from app.db.seed_content import SeedError, seed_content


def test_jobs_list(seeded_client):
    r = seeded_client.get("/api/content/jobs")
    assert r.status_code == 200
    d = r.json()
    assert d["module"] == "job"
    assert d["total"] == 100
    assert len(d["all_tags"]) == 6

    tags = {t["key"]: t["count"] for t in d["all_tags"]}
    assert tags["all"] == 100
    assert tags["architecture"] == 16
    assert tags["model-selection"] == 28
    assert tags["evaluation"] == 26

    assert len(d["items"]) == 100
    item = d["items"][0]
    assert set(item) == {"id", "title", "category", "tag", "difficulty", "company", "tags"}
    assert "answer" not in item  # light list only
    assert "max-age=300" in r.headers.get("cache-control", "")


def test_jobs_filter_category(seeded_client):
    r = seeded_client.get("/api/content/jobs?category=architecture")
    d = r.json()
    assert d["total"] == 100  # totals stay full regardless of filter
    assert len(d["items"]) == 16
    assert all(i["category"] == "architecture" for i in d["items"])


def test_jobs_filter_difficulty(seeded_client):
    r = seeded_client.get("/api/content/jobs", params={"difficulty": "困难"})
    d = r.json()
    assert d["items"]
    assert all(i["difficulty"] == "困难" for i in d["items"])


def test_job_detail(seeded_client):
    r = seeded_client.get("/api/content/jobs/sa01")
    assert r.status_code == 200
    d = r.json()
    assert d["id"] == "sa01"
    assert d["answer"]
    assert d["keyPoints"]
    assert d["related"]
    assert d["category"] == "architecture"


def test_job_detail_404(seeded_client):
    r = seeded_client.get("/api/content/jobs/zzz999")
    assert r.status_code == 404


def test_jobs_empty_store(empty_client):
    r = empty_client.get("/api/content/jobs")
    assert r.status_code == 200
    assert r.json()["total"] == 0


def test_job_seed_counts_and_meta(empty_client):
    summary = asyncio.run(seed_content(module="job"))
    assert summary["job"]["categories"] == 5
    assert summary["job"]["items"] == 100

    async def _meta_present() -> bool:
        async with get_db() as db:
            cur = await db.execute(
                "SELECT payload FROM content_meta WHERE module='job' AND meta_key='all_tags'"
            )
            return (await cur.fetchone()) is not None

    assert asyncio.run(_meta_present())


def test_job_seed_count_mismatch_fails(empty_client, monkeypatch):
    orig = sc.MODULE_REGISTRY["job"]["loader"]

    def tampered():
        cats, items, meta = orig()
        return cats, items[:-1], meta  # 99 != 100

    monkeypatch.setitem(sc.MODULE_REGISTRY["job"], "loader", tampered)
    with pytest.raises(SeedError):
        asyncio.run(seed_content(module="job"))
