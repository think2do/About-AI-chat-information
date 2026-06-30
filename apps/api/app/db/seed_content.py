"""Idempotent teaching-content seeder (Spec 009).

Source of truth = JSON fixtures under ``seeds/content/<module>/``. Re-running is
safe: unchanged items are skipped via ``content_hash``; only changed items are
updated. A fixture/DB count mismatch (e.g. a botched extraction) fails loudly
and rolls back rather than writing partial data.

Usage (CLI, primary path):
    python -m app.db.seed_content [--module jargon] [--force]

Also called from the app lifespan when SEED_CONTENT_ON_STARTUP is truthy.
"""

import argparse
import asyncio
import hashlib
import json
from pathlib import Path

from app.db.connection import get_db

SEEDS_DIR = Path(__file__).parent / "seeds" / "content"

# Fields that, when changed, should trigger an update (drive content_hash).
_HASH_FIELDS = ("payload", "title", "category_id", "sort_order", "difficulty", "company")


class SeedError(RuntimeError):
    """Raised on fixture/DB integrity problems; aborts the seed without commit."""


def _hash(obj: dict) -> str:
    return hashlib.sha256(
        json.dumps(obj, sort_keys=True, ensure_ascii=False).encode("utf-8")
    ).hexdigest()


def _read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


# --- Module loaders ---------------------------------------------------------
# A loader returns (category_rows, item_rows). Adding a new module = drop its
# fixtures under seeds/content/<module>/ + register a loader below. The seeder
# core is module-agnostic (no per-module logic).

def _load_jargon():
    base = SEEDS_DIR / "jargon"
    categories = _read_json(base / "categories.json")
    terms = _read_json(base / "terms.json")

    cat_rows = [
        {
            "category_id": f"jargon:{c['slug']}",
            "module": "jargon",
            "slug": c["slug"],
            "label": c["label"],
            "item_type": c["item_type"],
            "sort_order": c["sort_order"],
        }
        for c in categories
    ]
    item_rows = [
        {
            "item_id": f"jargon:term:{t['slug']}",
            "module": "jargon",
            "item_type": "term",
            "category_id": f"jargon:{t['category_slug']}",
            "slug": t["slug"],
            "title": t["cn"],
            "difficulty": None,
            "company": None,
            "sort_order": t["sort_order"],
            "payload": {
                "emoji": t["emoji"],
                "cn": t["cn"],
                "en": t["en"],
                "plain": t["plain"],
                "tech": t["tech"],
            },
        }
        for t in terms
    ]
    return cat_rows, item_rows, []


def _load_job():
    base = SEEDS_DIR / "job"
    categories = _read_json(base / "categories.json")
    questions = _read_json(base / "questions.json")
    all_tags = _read_json(base / "all_tags.json")

    cat_rows = [
        {
            "category_id": f"job:{c['slug']}",
            "module": "job",
            "slug": c["slug"],
            "label": c["label"],
            "item_type": c["item_type"],
            "sort_order": c["sort_order"],
        }
        for c in categories
    ]
    item_rows = [
        {
            "item_id": f"job:question:{q['id']}",
            "module": "job",
            "item_type": "question",
            "category_id": f"job:{q['category_slug']}",
            "slug": q["id"],
            "title": q["title"],
            "difficulty": q["difficulty"],
            "company": q["company"],
            "sort_order": q["sort_order"],
            "payload": {
                "tag": q["tag"],
                "tags": q["tags"],
                "answer": q["answer"],
                "code": q["code"],
                "codeLabel": q["codeLabel"],
                "codeLines": q["codeLines"],
                "keyPoints": q["keyPoints"],
                "related": q["related"],
            },
        }
        for q in questions
    ]
    meta_rows = [{"module": "job", "meta_key": "all_tags", "payload": all_tags}]
    return cat_rows, item_rows, meta_rows


def _load_code():
    base = SEEDS_DIR / "code"
    tool_cats = _read_json(base / "tool_categories.json")
    cmd_cats = _read_json(base / "command_categories.json")
    tools = _read_json(base / "tools.json")
    commands = _read_json(base / "commands.json")
    simulator = _read_json(base / "simulator.json")
    agent = _read_json(base / "agent_loop.json")
    hidden = _read_json(base / "hidden.json")

    cat_rows = [
        {
            "category_id": f"code:tool:{c['slug']}",
            "module": "code",
            "slug": c["slug"],
            "label": c["label"],
            "item_type": "tool",
            "sort_order": c["sort_order"],
        }
        for c in tool_cats
    ] + [
        {
            "category_id": f"code:command:{c['slug']}",
            "module": "code",
            "slug": c["slug"],
            "label": c["label"],
            "item_type": "command",
            "sort_order": c["sort_order"],
        }
        for c in cmd_cats
    ]

    def _item(item_type, slug, title, sort_order, payload, category_id=None):
        return {
            "item_id": f"code:{item_type}:{slug}",
            "module": "code",
            "item_type": item_type,
            "category_id": category_id,
            "slug": slug,
            "title": title,
            "difficulty": None,
            "company": None,
            "sort_order": sort_order,
            "payload": payload,
        }

    item_rows = []
    for t in tools:
        item_rows.append(_item(
            "tool", t["slug"], t["title"], t["sort_order"],
            {"name": t["name"], "emoji": t["emoji"], "plain": t["plain"], "example": t["example"], "isExp": t["isExp"]},
            category_id=f"code:tool:{t['category_slug']}",
        ))
    for c in commands:
        item_rows.append(_item(
            "command", c["slug"], c["title"], c["sort_order"],
            {"cmd": c["cmd"], "emoji": c["emoji"], "plain": c["plain"], "example": c["example"], "isExp": c["isExp"]},
            category_id=f"code:command:{c['category_slug']}",
        ))
    for s in simulator:
        item_rows.append(_item(
            "sim-step", s["slug"], s["seq"]["title"], s["sort_order"],
            {"terminal": s["terminal"], "seq": s["seq"]},
        ))
    for s in agent:
        item_rows.append(_item(
            "agent-step", s["slug"], s["title"], s["sort_order"],
            {"num": s["num"], "title": s["title"], "src": s["src"], "desc": s["desc"], "code": s["code"]},
        ))
    for f in hidden:
        item_rows.append(_item(
            "hidden-feature", f["slug"], f["name"], f["sort_order"],
            {"name": f["name"], "desc": f["desc"]},
        ))

    return cat_rows, item_rows, []


def _load_lab():
    base = SEEDS_DIR / "lab"
    fc = _read_json(base / "function_call.json")
    infer = _read_json(base / "inference.json")
    rag = _read_json(base / "rag.json")
    training = _read_json(base / "training.json")
    tokenizer = _read_json(base / "tokenizer.json")

    def _item(item_type, slug, title, sort_order, payload):
        return {
            "item_id": f"lab:{item_type}:{slug}",
            "module": "lab",
            "item_type": item_type,
            "category_id": None,
            "slug": slug,
            "title": title,
            "difficulty": None,
            "company": None,
            "sort_order": sort_order,
            "payload": payload,
        }

    item_rows = []
    for s in fc:
        item_rows.append(_item("fc-step", s["slug"], s["label"], s["sort_order"], {
            "icon": s["icon"], "label": s["label"], "color": s["color"],
            "content": s["content"], "jsonObj": s["jsonObj"], "isCode": s["isCode"], "highlight": s["highlight"],
        }))
    for s in infer:
        item_rows.append(_item("infer-step", s["slug"], s["title"], s["sort_order"], {
            "num": s["num"], "icon": s["icon"], "title": s["title"], "desc": s["desc"], "code": s["code"],
        }))
    for s in rag:
        item_rows.append(_item("rag-step", s["slug"], s["title"], s["sort_order"], {
            "num": s["num"], "icon": s["icon"], "title": s["title"], "desc": s["desc"],
            "code": s["code"], "phase": s["phase"], "phaseColor": s["phaseColor"],
        }))

    meta_rows = [
        {"module": "lab", "meta_key": "training", "payload": training},
        {"module": "lab", "meta_key": "tokenizer", "payload": tokenizer},
    ]
    return [], item_rows, meta_rows


MODULE_REGISTRY = {
    "jargon": {
        "loader": _load_jargon,
        "item_type": "term",
        "expected_categories": 6,
        "expected_items": 36,
    },
    "job": {
        "loader": _load_job,
        "item_type": "question",
        "expected_categories": 5,
        "expected_items": 100,
    },
    "code": {
        "loader": _load_code,
        "expected_categories": 13,
        "expected_items": 177,
    },
    "lab": {
        "loader": _load_lab,
        "expected_categories": 0,
        "expected_items": 25,
    },
}


async def _seed_module(db, module: str, spec: dict, force: bool) -> dict:
    cat_rows, item_rows, meta_rows = spec["loader"]()

    # Fixture-level integrity check (catches deleted/duplicated fixtures
    # deterministically, independent of current DB state).
    if (
        len(cat_rows) != spec["expected_categories"]
        or len(item_rows) != spec["expected_items"]
    ):
        raise SeedError(
            f"{module} fixtures count mismatch: expected "
            f"{spec['expected_categories']} categories / {spec['expected_items']} items, "
            f"got {len(cat_rows)} / {len(item_rows)}"
        )

    for c in cat_rows:
        await db.execute(
            """INSERT INTO content_categories
                   (category_id, module, slug, label, item_type, sort_order)
               VALUES (:category_id, :module, :slug, :label, :item_type, :sort_order)
               ON CONFLICT(category_id) DO UPDATE SET
                   label = excluded.label,
                   item_type = excluded.item_type,
                   sort_order = excluded.sort_order""",
            c,
        )

    for m in meta_rows:
        await db.execute(
            """INSERT INTO content_meta (module, meta_key, payload)
               VALUES (:module, :meta_key, :payload)
               ON CONFLICT(module, meta_key) DO UPDATE SET
                   payload = excluded.payload,
                   updated_at = datetime('now')""",
            {
                "module": m["module"],
                "meta_key": m["meta_key"],
                "payload": json.dumps(m["payload"], ensure_ascii=False),
            },
        )

    inserted = updated = unchanged = 0
    for it in item_rows:
        content_hash = _hash({k: it[k] for k in _HASH_FIELDS})
        cur = await db.execute(
            "SELECT content_hash FROM content_items WHERE item_id = ?", (it["item_id"],)
        )
        row = await cur.fetchone()
        params = {
            **it,
            "payload": json.dumps(it["payload"], ensure_ascii=False),
            "content_hash": content_hash,
        }
        if row is None:
            await db.execute(
                """INSERT INTO content_items
                       (item_id, module, item_type, category_id, slug, title,
                        difficulty, company, sort_order, payload, content_hash)
                   VALUES (:item_id, :module, :item_type, :category_id, :slug, :title,
                           :difficulty, :company, :sort_order, :payload, :content_hash)""",
                params,
            )
            inserted += 1
        elif force or row["content_hash"] != content_hash:
            await db.execute(
                """UPDATE content_items SET
                       category_id = :category_id, title = :title,
                       difficulty = :difficulty, company = :company,
                       sort_order = :sort_order, payload = :payload,
                       content_hash = :content_hash, updated_at = datetime('now')
                   WHERE item_id = :item_id""",
                params,
            )
            updated += 1
        else:
            unchanged += 1

    # Post-write DB integrity check.
    cur = await db.execute(
        "SELECT COUNT(*) AS n FROM content_categories WHERE module = ?", (module,)
    )
    actual_cats = (await cur.fetchone())["n"]
    cur = await db.execute(
        "SELECT COUNT(*) AS n FROM content_items WHERE module = ?",
        (module,),
    )
    actual_items = (await cur.fetchone())["n"]
    if (
        actual_cats != spec["expected_categories"]
        or actual_items != spec["expected_items"]
    ):
        raise SeedError(
            f"{module} DB count mismatch after seed: expected "
            f"{spec['expected_categories']} / {spec['expected_items']}, "
            f"got {actual_cats} / {actual_items}"
        )

    return {
        "inserted": inserted,
        "updated": updated,
        "unchanged": unchanged,
        "categories": actual_cats,
        "items": actual_items,
    }


async def seed_content(module: str | None = None, force: bool = False) -> dict:
    """Seed one module (or all) idempotently. Commits only if every module
    passes its integrity checks; any SeedError aborts without committing."""
    modules = [module] if module else list(MODULE_REGISTRY)
    summary: dict = {}
    async with get_db() as db:
        for m in modules:
            if m not in MODULE_REGISTRY:
                raise SeedError(f"unknown module: {m}")
            summary[m] = await _seed_module(db, m, MODULE_REGISTRY[m], force)
        await db.commit()
    return summary


def _format_summary(summary: dict) -> str:
    lines = []
    for module, s in summary.items():
        changed = s["inserted"] or s["updated"]
        status = (
            f"{s['inserted']} inserted, {s['updated']} updated"
            if changed
            else "unchanged"
        )
        lines.append(
            f"seeded {module}: {s['categories']} categories, {s['items']} items ({status})"
        )
    return "\n".join(lines)


async def _cli_run(module: str | None, force: bool) -> dict:
    # Ensure schema exists so the CLI works on a fresh DB standalone.
    from app.db.connection import get_db, init_db

    async with get_db() as db:
        await init_db(db)
    return await seed_content(module=module, force=force)


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed teaching content into SQLite.")
    parser.add_argument(
        "--module",
        choices=sorted(MODULE_REGISTRY),
        help="Seed only this module (default: all).",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-write every item even if unchanged.",
    )
    args = parser.parse_args()
    summary = asyncio.run(_cli_run(args.module, args.force))
    print(_format_summary(summary))


if __name__ == "__main__":
    main()
