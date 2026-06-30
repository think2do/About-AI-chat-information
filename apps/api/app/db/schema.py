"""Database schema — create tables for sessions, conversations, messages."""

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
    user_agent_hash TEXT,
    ip_hash TEXT
);

CREATE TABLE IF NOT EXISTS conversations (
    conversation_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(session_id),
    title TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_conversations_session
    ON conversations(session_id, deleted_at, expires_at);

CREATE TABLE IF NOT EXISTS messages (
    message_id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(conversation_id),
    role TEXT NOT NULL CHECK(role IN ('system', 'user', 'assistant')),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    token_estimate INTEGER
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation
    ON messages(conversation_id, created_at);
"""


# --- Teaching content (Spec 009) -------------------------------------------
# Module-agnostic content store, keyed by (module, item_type, slug).
# Filter/sort fields are promoted to real columns; the full typed document
# lives in `payload` (JSON-as-TEXT, → Postgres jsonb later). Does NOT touch the
# sessions/conversations/messages tables above.
SCHEMA_SQL_CONTENT = """
CREATE TABLE IF NOT EXISTS content_categories (
    category_id  TEXT PRIMARY KEY,
    module       TEXT NOT NULL,
    slug         TEXT NOT NULL,
    label        TEXT NOT NULL,
    item_type    TEXT NOT NULL,
    sort_order   INTEGER NOT NULL DEFAULT 0,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(module, slug, item_type)
);

CREATE TABLE IF NOT EXISTS content_items (
    item_id      TEXT PRIMARY KEY,
    module       TEXT NOT NULL,
    item_type    TEXT NOT NULL,
    category_id  TEXT REFERENCES content_categories(category_id),
    slug         TEXT NOT NULL,
    title        TEXT NOT NULL,
    difficulty   TEXT,
    company      TEXT,
    sort_order   INTEGER NOT NULL DEFAULT 0,
    payload      TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(module, item_type, slug)
);

CREATE INDEX IF NOT EXISTS idx_content_items_module
    ON content_items(module, item_type, sort_order);
CREATE INDEX IF NOT EXISTS idx_content_items_category
    ON content_items(category_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_content_items_job_filter
    ON content_items(module, difficulty, company);

CREATE TABLE IF NOT EXISTS content_meta (
    module     TEXT NOT NULL,
    meta_key   TEXT NOT NULL,
    payload    TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (module, meta_key)
);
"""
