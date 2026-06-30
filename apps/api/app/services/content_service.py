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


def _job_summary(row) -> dict:
    payload = json.loads(row["payload"])
    return {
        "id": row["slug"],
        "title": row["title"],
        "category": row["category_id"].split(":", 1)[1],
        "tag": payload.get("tag", ""),
        "difficulty": row["difficulty"] or "",
        "company": row["company"] or "",
        "tags": payload.get("tags", []),
    }


async def list_jobs(category: str | None = None, difficulty: str | None = None) -> dict:
    """Job list (light fields) + all_tags with full counts. total/all_tags counts
    always reflect the full set; items reflect the filters."""
    async with get_db() as db:
        cur = await db.execute(
            "SELECT payload FROM content_meta WHERE module='job' AND meta_key='all_tags'"
        )
        meta_row = await cur.fetchone()
        raw_tags = json.loads(meta_row["payload"]) if meta_row else []

        cur = await db.execute(
            """SELECT category_id, COUNT(*) AS n
                 FROM content_items
                WHERE module='job' AND item_type='question'
                GROUP BY category_id"""
        )
        counts = {r["category_id"]: r["n"] for r in await cur.fetchall()}
        total = sum(counts.values())

        sql = (
            "SELECT slug, title, category_id, difficulty, company, payload "
            "FROM content_items WHERE module='job' AND item_type='question'"
        )
        params: list = []
        if category:
            sql += " AND category_id = ?"
            params.append(f"job:{category}")
        if difficulty:
            sql += " AND difficulty = ?"
            params.append(difficulty)
        sql += " ORDER BY sort_order"
        cur = await db.execute(sql, params)
        item_rows = await cur.fetchall()

    all_tags = []
    for tag in raw_tags:
        count = total if tag["key"] == "all" else counts.get(f"job:{tag['key']}", 0)
        all_tags.append({**tag, "count": count})

    return {
        "module": "job",
        "total": total,
        "all_tags": all_tags,
        "items": [_job_summary(r) for r in item_rows],
    }


async def get_job(job_id: str) -> dict | None:
    """Full question detail, or None if not found."""
    async with get_db() as db:
        cur = await db.execute(
            """SELECT slug, title, category_id, difficulty, company, payload
                 FROM content_items
                WHERE module='job' AND item_type='question' AND slug = ?""",
            (job_id,),
        )
        row = await cur.fetchone()

    if row is None:
        return None

    payload = json.loads(row["payload"])
    return {
        **_job_summary(row),
        "answer": payload.get("answer", ""),
        "code": payload.get("code"),
        "codeLabel": payload.get("codeLabel"),
        "codeLines": payload.get("codeLines"),
        "keyPoints": payload.get("keyPoints", []),
        "related": payload.get("related", []),
    }


async def get_code() -> dict:
    """Aggregate Code page data (tools/commands/simulator/agentLoop/hidden)."""
    async with get_db() as db:
        cur = await db.execute(
            """SELECT category_id, slug, label, item_type
                 FROM content_categories
                WHERE module='code'
                ORDER BY item_type, sort_order"""
        )
        cat_rows = await cur.fetchall()
        cur = await db.execute(
            """SELECT item_type, category_id, title, payload
                 FROM content_items
                WHERE module='code'
                ORDER BY item_type, sort_order"""
        )
        item_rows = await cur.fetchall()

    tools_by_cat: dict[str, list] = {}
    cmds_by_cat: dict[str, list] = {}
    simulator, agent_loop, hidden = [], [], []
    for row in item_rows:
        p = json.loads(row["payload"])
        it = row["item_type"]
        if it == "tool":
            tools_by_cat.setdefault(row["category_id"], []).append(
                {"name": p["name"], "emoji": p["emoji"], "title": row["title"],
                 "plain": p["plain"], "example": p["example"], "isExp": p["isExp"]}
            )
        elif it == "command":
            cmds_by_cat.setdefault(row["category_id"], []).append(
                {"cmd": p["cmd"], "emoji": p["emoji"], "title": row["title"],
                 "plain": p["plain"], "example": p["example"], "isExp": p["isExp"]}
            )
        elif it == "sim-step":
            simulator.append({"terminal": p["terminal"], "seq": p["seq"]})
        elif it == "agent-step":
            agent_loop.append({"num": p["num"], "title": p["title"], "src": p["src"],
                               "desc": p["desc"], "code": p["code"]})
        elif it == "hidden-feature":
            hidden.append({"name": p["name"], "desc": p["desc"]})

    tool_cats, cmd_cats = [], []
    for cat in cat_rows:
        if cat["item_type"] == "tool":
            tl = tools_by_cat.get(cat["category_id"], [])
            tool_cats.append({"slug": cat["slug"], "label": cat["label"], "count": len(tl), "tools": tl})
        elif cat["item_type"] == "command":
            cl = cmds_by_cat.get(cat["category_id"], [])
            cmd_cats.append({"slug": cat["slug"], "label": cat["label"], "count": len(cl), "commands": cl})

    return {
        "module": "code",
        "tools": {"categories": tool_cats},
        "commands": {"categories": cmd_cats},
        "simulator": simulator,
        "agentLoop": agent_loop,
        "hidden": hidden,
    }


async def get_lab() -> dict:
    """Aggregate Lab page data (training / functionCall / tokenizer / inference / rag)."""
    async with get_db() as db:
        cur = await db.execute(
            """SELECT item_type, payload FROM content_items
                WHERE module='lab' ORDER BY item_type, sort_order"""
        )
        item_rows = await cur.fetchall()
        cur = await db.execute(
            "SELECT meta_key, payload FROM content_meta WHERE module='lab'"
        )
        meta_rows = await cur.fetchall()

    fc, inference, rag = [], [], []
    for row in item_rows:
        p = json.loads(row["payload"])
        it = row["item_type"]
        if it == "fc-step":
            fc.append(p)
        elif it == "infer-step":
            inference.append(p)
        elif it == "rag-step":
            rag.append(p)

    meta = {r["meta_key"]: json.loads(r["payload"]) for r in meta_rows}
    return {
        "module": "lab",
        "training": meta.get("training"),
        "functionCall": fc,
        "tokenizer": meta.get("tokenizer"),
        "inference": inference,
        "rag": rag,
    }


async def get_chat_pipeline() -> dict:
    """The 7 pipeline-stage teaching cards (Spec 013)."""
    async with get_db() as db:
        cur = await db.execute(
            """SELECT payload FROM content_items
                WHERE module='chat' AND item_type='pipeline-stage'
                ORDER BY sort_order"""
        )
        rows = await cur.fetchall()
    stages = [json.loads(r["payload"]) for r in rows]
    return {"module": "chat", "stages": stages}
