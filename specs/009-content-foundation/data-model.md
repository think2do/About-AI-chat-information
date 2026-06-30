# Data Model: 教学内容基础设施（Content Foundation）

## 概览

三张内容表，模块无关，以 `module` 维度区分。本 Spec 仅落地 `module='jargon'` 的数据，但表结构面向 010-013 通用设计。建表 SQL 以 `SCHEMA_SQL_CONTENT` 形式新增进 `apps/api/app/db/schema.py`，由 `init_db()` 与既有表一同 `CREATE TABLE IF NOT EXISTS`，**不改动** sessions/conversations/messages。

---

## 表 1：`content_categories`（分类树 / 侧边栏）

```sql
CREATE TABLE IF NOT EXISTS content_categories (
    category_id  TEXT PRIMARY KEY,           -- '<module>:<slug>'，如 'jargon:model-arch'
    module       TEXT NOT NULL,              -- 'jargon' | 'job' | 'code' | 'lab' | 'chat'
    slug         TEXT NOT NULL,              -- 模块内分类标识，如 'model-arch'
    label        TEXT NOT NULL,              -- 显示名，如 '模型架构'
    item_type    TEXT NOT NULL,              -- 该分类承载的条目类型，如 'term'
    sort_order   INTEGER NOT NULL DEFAULT 0, -- 分类显示顺序
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(module, slug, item_type)
);
```

## 表 2：`content_items`（通用内容条目）

```sql
CREATE TABLE IF NOT EXISTS content_items (
    item_id      TEXT PRIMARY KEY,           -- '<module>:<item_type>:<slug>'，如 'jargon:term:transformer'
    module       TEXT NOT NULL,
    item_type    TEXT NOT NULL,              -- 'term' | 'question' | 'tool' | 'command' | 'lab-step' | 'pipeline-stage'
    category_id  TEXT REFERENCES content_categories(category_id),
    slug         TEXT NOT NULL,              -- 模块内条目标识，如 'transformer'
    title        TEXT NOT NULL,              -- 列表展示标题（Jargon 用 cn）
    difficulty   TEXT,                       -- 提升列：Job 用；Jargon 为 NULL
    company      TEXT,                       -- 提升列：Job 用；Jargon 为 NULL
    sort_order   INTEGER NOT NULL DEFAULT 0, -- 分类内排序
    payload      TEXT NOT NULL,              -- JSON：该条目完整内容文档
    content_hash TEXT NOT NULL,              -- 规范化 payload 的 SHA-256，用于幂等
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(module, item_type, slug)
);

CREATE INDEX IF NOT EXISTS idx_content_items_module
    ON content_items(module, item_type, sort_order);
CREATE INDEX IF NOT EXISTS idx_content_items_category
    ON content_items(category_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_content_items_job_filter
    ON content_items(module, difficulty, company);   -- 为 010 Job 过滤预建
```

## 表 3：`content_meta`（模块级「页面形状」数据）

```sql
CREATE TABLE IF NOT EXISTS content_meta (
    module     TEXT NOT NULL,
    meta_key   TEXT NOT NULL,                -- 如 'all_tags' | 'tabs' | 'stage_order'
    payload    TEXT NOT NULL,               -- JSON
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (module, meta_key)
);
```

> 本 Spec（Jargon）**不使用** `content_meta`（分类顺序已由 `content_categories.sort_order` 表达）；建表以备 010+（Job `all_tags`、Lab tabs、Chat stage 排序）。

---

## 字段语义与校验规则

| 字段 | 规则 |
|------|------|
| `module` | 小写枚举，本 Spec 仅 `jargon`。 |
| `item_type` | 小写枚举，本 Spec 仅 `term`。 |
| `slug` | 模块内唯一、URL 安全（kebab-case）。Jargon 由英文名规范化：`Transformer`→`transformer`，`Chain of Thought`→`chain-of-thought`，`KV Cache`→`kv-cache`。 |
| `title` | 非空。Jargon = 中文名 `cn`。 |
| `sort_order` | 保留 fixtures 内数组顺序（从 0 递增）。 |
| `payload` | 合法 JSON、UTF-8、非空；结构由各 `item_type` 约定（见下）。 |
| `content_hash` | `sha256(canonical_json(payload + 关键提升字段))`；同内容跨平台稳定（键排序、无多余空白）。 |
| `category_id` | 必须指向同 `module` 下已存在的分类。 |

### Jargon `term` 的 `payload` 形状

```json
{
  "emoji": "🧱",
  "cn": "Transformer",
  "en": "Transformer",
  "plain": "一种完全基于注意力机制的神经网络架构……",
  "tech": "基于自注意力机制（Self-Attention）的 Seq2Seq 架构……"
}
```

> 与现有 `jargon/page.tsx` 的 term 对象**逐字段一致**（`emoji/cn/en/plain/tech`），确保零内容失真。`slug` 不在 payload 内（它是条目标识，由 `content_items.slug` 表达），但 API 响应会带上 `slug` 供前端 key/选中使用。

---

## 实体关系

```
content_categories (1) ──< (N) content_items
        │                          │
   module='jargon'            module='jargon', item_type='term'
   6 行分类                    36 行术语
```

## Jargon 迁移源 → fixtures 映射

现有 `jargon/page.tsx` 的 `CATEGORIES`（6 分类 / 36 词条）抬取为两份 fixtures：

**`seeds/content/jargon/categories.json`**（6 项）：

| label（页面 key） | slug | sort_order | 词条数 |
|------|------|-----------|------|
| 模型架构 | model-arch | 0 | 6 |
| 训练方法 | training | 1 | 7 |
| 推理技术 | inference | 2 | 6 |
| 性能评估 | evaluation | 3 | 6 |
| 部署优化 | deployment | 4 | 5 |
| 安全对齐 | safety | 5 | 6 |
| **合计** | | | **36** |

**`seeds/content/jargon/terms.json`**（36 项）：每项 `{ category_slug, slug, sort_order, emoji, cn, en, plain, tech }`；导入时 `title=cn`、`payload={emoji,cn,en,plain,tech}`、`item_id='jargon:term:'+slug`。

## 幂等与完整性

- **唯一键**：`UNIQUE(module,item_type,slug)` 保证重复导入不重复插入。
- **upsert**：`ON CONFLICT(module,item_type,slug) DO UPDATE` 仅在 `content_hash` 变化时写入，并刷新 `updated_at`。
- **条数断言**（seeder 内置）：导入后 `count(module='jargon', item_type='term') == 36`、`count(content_categories where module='jargon') == 6`；不符则**抛错回滚**，拒绝残缺数据。

## Postgres 演进备注（非本 Spec 实施）

`payload`/`content_meta.payload` → `jsonb`；`datetime('now')` 默认值 → `now()`；其余列与索引可平移。DB 方言相关 SQL 隔离在 `schema.py` 与 `content_service.py`，便于将来集中替换。
