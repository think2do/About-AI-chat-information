"""Contract test for GET /api/content/jargon (Spec 009)."""


def test_jargon_endpoint_shape(seeded_client):
    r = seeded_client.get("/api/content/jargon")
    assert r.status_code == 200

    data = r.json()
    assert data["module"] == "jargon"
    assert data["total"] == 36
    assert len(data["categories"]) == 6
    assert data["categories"][0]["slug"] == "model-arch"

    for cat in data["categories"]:
        assert cat["slug"] and cat["label"]
        assert cat["terms"], f"category {cat['slug']} has no terms"
        for term in cat["terms"]:
            for field in ("slug", "emoji", "cn", "en", "plain", "tech"):
                assert term.get(field), f"term missing {field}: {term}"

    # term count across categories matches total
    assert sum(len(c["terms"]) for c in data["categories"]) == 36

    assert "max-age=300" in r.headers.get("cache-control", "")


def test_jargon_empty_store(empty_client):
    r = empty_client.get("/api/content/jargon")
    assert r.status_code == 200
    data = r.json()
    assert data["module"] == "jargon"
    assert data["total"] == 0
    assert data["categories"] == []
