# 教学内容 fixtures（内容唯一来源）

本目录下的 JSON 是教学内容的**唯一可审查来源**（Spec 009）。运行时 SQLite `.db`
由这些 fixtures 经 seeder 生成，且**不纳入版本控制**。旧 `*.dc.html` / `Job.data.js`
仅作历史参考。

## 目录约定

```
seeds/content/<module>/*.json      # 每个模块一个子目录
  jargon/categories.json           # 分类（slug/label/item_type/sort_order）
  jargon/terms.json                # 条目（category_slug/slug/sort_order + 内容字段）
```

## 存储模型（module-generic）

所有模块共用三张表（见 `app/db/schema.py`）：

- `content_categories` —— 分类树/侧边栏
- `content_items` —— 列表型条目；过滤/排序字段（module/item_type/category/difficulty/company/sort_order）为真实列，其余整篇放 `payload`(JSON)
- `content_meta` —— 模块级「页面形状」数据（如 ALL_TAGS、Tab 描述、阶段排序）

seeder（`app/db/seed_content.py`）核心**不含任何模块特定逻辑**：它遍历
`MODULE_REGISTRY`，对每个模块调用其 loader，按 `UNIQUE(module,item_type,slug)`
+ `content_hash` 做幂等 upsert，并校验条数。

## 新增一个模块（010+ 的接入步骤）

1. 在 `seeds/content/<module>/` 放入该模块的 JSON fixtures。
2. 在 `seed_content.py` 写一个 `_load_<module>()` loader，返回 `(category_rows, item_rows)`；
   并在 `MODULE_REGISTRY` 注册（含 `item_type` 与 `expected_categories/expected_items` 校验值）。
3. 在 `content_service.py` 加该模块的读取方法，在 `routers/content.py` 加端点，
   在 `packages/shared/src/content.ts` 加对应类型。

**无需改动表结构或 seeder 核心**——这正是 009 基础设施的复用目标（spec US3）。

## 导入

```sh
cd apps/api
python -m app.db.seed_content            # 全部模块
python -m app.db.seed_content --module jargon
python -m app.db.seed_content --force    # 强制重写（即使未变更）
```

幂等：fixtures 未变即无操作。条数与各模块期望值不符时**显式失败并回滚**，不写残缺数据。
开发环境启动时也会自动 seed（除非 `SEED_CONTENT_ON_STARTUP=0`）。
