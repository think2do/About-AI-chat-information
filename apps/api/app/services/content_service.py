"""Content read service (Spec 009).

Reads teaching content from the content_* tables and shapes it for the API.
Read-only; the seeder is the only writer.
"""

import json

from app.db.connection import get_db


async def get_jargon() -> dict:
    """Return the Jargon module as a category-grouped tree (JargonResponse shape)."""
    async with get_db() as db:
        cur = await db.execute(
            """SELECT category_id, slug, label
                 FROM content_categories
                WHERE module = 'jargon' AND item_type = 'term'
                ORDER BY sort_order"""
        )
        cat_rows = await cur.fetchall()

        cur = await db.execute(
            """SELECT category_id, slug, payload
                 FROM content_items
                WHERE module = 'jargon' AND item_type = 'term'
                ORDER BY sort_order"""
        )
        item_rows = await cur.fetchall()

    terms_by_cat: dict[str, list] = {}
    for row in item_rows:
        term = json.loads(row["payload"])
        term["slug"] = row["slug"]
        terms_by_cat.setdefault(row["category_id"], []).append(term)

    categories = []
    total = 0
    for cat in cat_rows:
        terms = terms_by_cat.get(cat["category_id"], [])
        total += len(terms)
        categories.append({"slug": cat["slug"], "label": cat["label"], "terms": terms})

    return {"module": "jargon", "total": total, "categories": categories}
