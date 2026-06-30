# API Contract: Job 题库

只读、公开。挂在 009 的 `content` router（`/api/content`）。

## `GET /api/content/jobs`

**Query**（均可选）：`category=<slug>`（architecture/...）、`difficulty=<困难|中等|简单>`。

**200**（`Cache-Control: public, max-age=300`）：
```json
{
  "module": "job",
  "total": 100,
  "all_tags": [
    {"key":"all","label":"全部","emoji":"📋","count":100},
    {"key":"architecture","label":"系统架构","emoji":"🏗️","count":16},
    {"key":"model-selection","label":"模型选型","emoji":"🧠","count":28},
    {"key":"evaluation","label":"评测指标","emoji":"📊","count":26},
    {"key":"project-challenges","label":"项目挑战","emoji":"💡","count":9},
    {"key":"product-strategy","label":"产品策略","emoji":"🎯","count":21}
  ],
  "items": [
    {"id":"sa01","title":"…","category":"architecture","tag":"系统架构","difficulty":"困难","company":"通用","tags":["数字人","系统架构","AIGC","视频生成"]}
  ]
}
```
- `total` 与 `all_tags` 计数**始终反映全量**（不随 query 过滤变化，供过滤栏显示固定计数）；`items` 反映过滤结果。
- `items` 为轻量字段（无 answer/code/keyPoints/related）。
- 空库 → `total:0, items:[], all_tags` 仍含 6 项但 count 为 0。

## `GET /api/content/jobs/{id}`

**200**：单题完整内容。
```json
{
  "id":"sa01","category":"architecture","tag":"系统架构","title":"…",
  "difficulty":"困难","company":"通用","tags":["…"],
  "answer":"…（保留换行）","code":"…|null","codeLabel":"…|null","codeLines":18,
  "keyPoints":["…"],"related":["…"]
}
```
**404**：`{"detail":"题目不存在"}`（id 未找到）。**500**：`{"detail":"内容服务暂时不可用"}`。

## 类型（packages/shared/src/content.ts）
```ts
export interface JobTag { key: string; label: string; emoji: string; count: number; }
export interface JobSummary { id: string; title: string; category: string; tag: string; difficulty: string; company: string; tags: string[]; }
export interface JobQuestion extends JobSummary {
  answer: string; code: string | null; codeLabel: string | null; codeLines: number | null;
  keyPoints: string[]; related: string[];
}
export interface JobListResponse { module: "job"; total: number; all_tags: JobTag[]; items: JobSummary[]; }
```

## 契约测试要点（apps/api/tests/test_content_jobs.py）
- `GET /jobs` → 200，`total==100`，`len(all_tags)==6`，`all_tags[0].key=='all' && count==100`，各分类 count 与数据一致（architecture 16…）；item 含轻字段、无 answer。
- `GET /jobs?category=architecture` → items 全为该分类、数量==16；`total` 仍 100。
- `GET /jobs?difficulty=困难` → items 全为困难。
- `GET /jobs/sa01` → 200，含 answer/keyPoints/related；带 code 的题 code 非空。
- `GET /jobs/zzz` → 404。
- 空库 → `total==0`。
- seeder：恰好 100 题 / 5 分类；篡改条数 → 失败。
