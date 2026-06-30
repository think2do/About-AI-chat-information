# API Contract: `GET /api/content/jargon`

只读、公开（无需 session / 鉴权）。返回 Jargon 模块按分类分组的术语树。挂在新 router `apps/api/app/routers/content.py`（`prefix="/api/content"`），注册进 `apps/api/app/main.py`。

前端经既有 `next.config.ts` 的 `/api/*` rewrite 代理访问，开发期实际打到 `http://localhost:8000/api/content/jargon`。

---

## Request

```
GET /api/content/jargon
```

- 无查询参数（本 Spec）。
- 无请求体、无认证头。

## Response `200 OK`

**Headers**：`Content-Type: application/json`、`Cache-Control: public, max-age=300`

**Body**：

```json
{
  "module": "jargon",
  "total": 36,
  "categories": [
    {
      "slug": "model-arch",
      "label": "模型架构",
      "terms": [
        {
          "slug": "transformer",
          "emoji": "🧱",
          "cn": "Transformer",
          "en": "Transformer",
          "plain": "一种完全基于注意力机制的神经网络架构……",
          "tech": "基于自注意力机制（Self-Attention）的 Seq2Seq 架构……"
        }
      ]
    }
  ]
}
```

### 字段约定

| 字段 | 类型 | 说明 |
|------|------|------|
| `module` | string | 固定 `"jargon"` |
| `total` | integer | 术语总数（跨分类），前端用于动态计数 |
| `categories` | array | 按 `sort_order` 升序 |
| `categories[].slug` | string | 分类标识（kebab） |
| `categories[].label` | string | 分类显示名（中文） |
| `categories[].terms` | array | 该分类术语，按 `sort_order` 升序 |
| `terms[].slug` | string | 术语标识（kebab，模块内唯一），前端用作 key / 选中态 |
| `terms[].emoji` | string | |
| `terms[].cn` / `.en` | string | 中 / 英文名 |
| `terms[].plain` | string | 通俗解释 |
| `terms[].tech` | string | 技术解释 |

## Response `200 OK`（空内容）

内容未导入时返回空集合而非错误：

```json
{ "module": "jargon", "total": 0, "categories": [] }
```

前端据此渲染空状态。

## Response `500`（存储不可用）

```json
{ "detail": "内容服务暂时不可用" }
```

不泄露内部异常细节；前端展示友好错误态。沿用既有 `conversations.py` 的 `try/except → HTTPException` 模式与错误措辞风格。

---

## 后端类型（Pydantic，`apps/api/app/models/content.py`）

```text
JargonTerm     { slug, emoji, cn, en, plain, tech }
JargonCategory { slug, label, terms: JargonTerm[] }
JargonResponse { module: "jargon", total: int, categories: JargonCategory[] }
```

## 前端类型（`packages/shared/src/content.ts`，跨层契约）

```ts
export interface JargonTerm { slug: string; emoji: string; cn: string; en: string; plain: string; tech: string; }
export interface JargonCategory { slug: string; label: string; terms: JargonTerm[]; }
export interface JargonResponse { module: "jargon"; total: number; categories: JargonCategory[]; }
```

后端响应字段顺序/命名 MUST 与上述 TS 类型一致——这是前后端契约，任何一侧变更需同步另一侧并更新本文件。

## 契约测试（`apps/api/tests/test_content_jargon.py`）

- `GET /api/content/jargon` → `200`，`module=="jargon"`，`total==36`，`len(categories)==6`，各分类 `terms` 非空，逐项含 `slug/emoji/cn/en/plain/tech` 且非空。
- 分类按 `sort_order` 升序（第一类为 `model-arch`）。
- 空库场景 → `200` 且 `total==0, categories==[]`。
