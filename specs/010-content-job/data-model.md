# Data Model: 求职面试题库（Job）

复用 009 的 `content_items` / `content_categories` / `content_meta` 三表，`module='job'`、`item_type='question'`。**无新建表**。

## 分类 slug 映射（tag → slug）

| 中文 tag | slug | sort_order |
|----------|------|-----------|
| 系统架构 | architecture | 1 |
| 模型选型 | model-selection | 2 |
| 评测指标 | evaluation | 3 |
| 项目挑战 | project-challenges | 4 |
| 产品策略 | product-strategy | 5 |

（`all` 不入 `content_categories`，仅存在于 `all_tags` 元数据，sort_order=0。）

## content_categories（5 行）
`category_id='job:'+slug`，`module='job'`，`item_type='question'`，`label`=中文 tag，`sort_order` 如上。

## content_meta（1 行）
`module='job'`，`meta_key='all_tags'`，`payload` = 过滤栏标签数组（**slug 键**）：
```json
[
  {"key":"all","label":"全部","emoji":"📋"},
  {"key":"architecture","label":"系统架构","emoji":"🏗️"},
  {"key":"model-selection","label":"模型选型","emoji":"🧠"},
  {"key":"evaluation","label":"评测指标","emoji":"📊"},
  {"key":"project-challenges","label":"项目挑战","emoji":"💡"},
  {"key":"product-strategy","label":"产品策略","emoji":"🎯"}
]
```
（计数不存库，由列表 API 实时 GROUP BY 计算。）

## content_items（100 行）
| 列 | 值 |
|----|----|
| item_id | `job:question:<id>`（如 `job:question:sa01`） |
| module / item_type | `job` / `question` |
| category_id | `job:`+对应 slug |
| slug | 题目 id（`sa01`、`ms11`…，全唯一） |
| title | 题目 `title` |
| difficulty | 提升列：困难/中等/简单 |
| company | 提升列：公司或「通用」 |
| sort_order | 扁平化后的全局序号（0..99） |
| payload(JSON) | `{ tag, tags[], answer, code?, codeLabel?, codeLines?, keyPoints[], related[] }` |

> `payload.tag` 保留中文 tag（详情展示用）；过滤靠 `category_id`（slug）与 `difficulty` 列。

## 提取（扁平化）规则
`QUESTIONS` 数组中：元素为对象→直接收；元素为**数组→展开**（旧数据 idx 26/27/28 是嵌套数组）。展开后断言总数=100、id 全唯一。`answer` 保留原始换行；`code/codeLabel/codeLines` 缺省时不写入 payload 对应键（或置 null）。

## 幂等与完整性
沿用 009 seeder：`UNIQUE(module,item_type,slug)` + `content_hash` upsert。Job 注册项期望值 `expected_categories=5`、`expected_items=100`；fixtures 或 DB 数量不符 → 显式失败回滚。`content_meta` 用 `INSERT ... ON CONFLICT(module,meta_key) DO UPDATE`。
