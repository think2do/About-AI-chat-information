# Research: 教学内容基础设施（Content Foundation）

Phase 0 技术决策。所有 spec 层面问题均无遗留 `NEEDS CLARIFICATION`（已由 spec Clarifications 解决）；本文件记录实现层面的选型与取舍。

---

## D1. 内容存储模型：混合（通用表 + 提升过滤列 + JSON payload）

**Decision**：三张表 —— `content_items`（通用条目，过滤/排序字段为真实列，其余整篇放 `payload TEXT`(JSON)）、`content_categories`（分类树）、`content_meta`（模块级「页面形状」JSON）。以 `module` 维度区分内容来源。

**Rationale**：
- 4 个模块形状差异大且含嵌套数组（Job 的 `keyPoints[]`/`related[]`、Lab 的步骤数组），且内容**永远整篇读取、从不按内层字段查询** → 整篇 JSON 最自然。
- 但确有少量需**过滤/排序**的字段（Job 的 tag/difficulty/company、各模块分类、模块内排序）→ 提升为真实列并建索引，避免对 JSON 做 `json_extract` 扫描。
- Postgres 友好：`payload TEXT` 未来一行改 `jsonb`；提升列原样可迁，避免 schema 重构。

**Alternatives considered**：
- *每模块强类型表 + 子表*（jargon_terms / job_questions / keyPoints 子表…）：6-10 张表 + join，对只读、整篇读取的目录是过度规范化，违反 YAGNI。否决。
- *纯 `type` + blob（无提升列）*：Job 列表过滤需对 JSON 求值，索引缺失，列表查询退化。否决。

---

## D2. 幂等导入：UNIQUE 约束 + content_hash + upsert

**Decision**：`UNIQUE(module, item_type, slug)`；seeder 计算每条 fixture 的内容指纹 `content_hash`，用 `INSERT ... ON CONFLICT(module,item_type,slug) DO UPDATE SET ... WHERE content_hash 变化`。重复导入数据未变即 no-op；改一条只更新一条。

**Rationale**：内容是 fixtures 驱动的可重复导入，需要重跑安全（CI/部署/本地）。指纹比「全量删表重插」更精细（保留 created_at、避免无谓写）。

**Alternatives considered**：
- *truncate + 全量重插*：简单但丢失 created_at、每次全写、与未来「人工编辑行」混用时危险。否决（为本 Spec 简单，但为 010+ 大数据与未来内容管理预留正确语义）。
- *仅靠 UNIQUE 忽略冲突（DO NOTHING）*：改了 fixture 不会更新，违反 US2。否决。

**Note**：`content_hash` 基于 fixture 的规范化 JSON（稳定键序）计算，确保同内容跨平台一致。

---

## D3. SQLite 中的 JSON：TEXT 列 + 应用层序列化

**Decision**：`payload` 用 `TEXT` 存 JSON 字符串，应用层（Python `json` / Pydantic）负责序列化与校验；读取时反序列化为响应模型。不依赖 SQLite 的 `json1` 查询函数（仅存取整篇）。

**Rationale**：本 Spec 与可见未来都整篇读取，无需库内 JSON 查询；TEXT 最大化 Postgres 迁移兼容性（迁移时改 `jsonb` 且应用层不变）。

**Alternatives considered**：用 SQLite `json()` 校验/索引 —— 当前无按内层字段查询需求，YAGNI。否决。

---

## D4. 导入触发：CLI 主路径 + env 开关的启动自动 seed

**Decision**：
- CLI 主路径：`python -m app.db.seed_content [--module <m>] [--force]`（供 CI / Docker entrypoint / 本地）。
- 启动自动 seed：`main.py` lifespan 内 `init_db` 之后，仅当环境变量 `SEED_CONTENT_ON_STARTUP` 为真时执行；开发默认开、生产默认关。

**Rationale**：开发期改 fixture 后希望重启即生效；生产启动需快且确定，由部署流程显式执行 CLI。两种触发共用同一幂等 `seed_content()` 函数。

**Alternatives considered**：仅启动 seed（无 CLI）—— 不利于 CI 校验与按需重灌；仅 CLI（无启动 seed）—— 本地体验差。两者择一均不如并存。

---

## D5. 前端获取策略：客户端 fetch（复用既有 `/api/*` 代理）

**Decision**：名词页保持客户端组件，`useEffect` 内 `fetch('/api/content/jargon')`，经 `next.config.ts` 既有 rewrite 代理到后端；加载/空/错误状态。交互（分类展开、术语选中、关联跳转）保留前端。

**Rationale**：
- 与既有 Chat 页（客户端 fetch / SSE）模式一致，**零新增基建**，风险最低，适合 canary。
- 内部教学工具，无 SEO 需求；客户端加载态可接受。
- RSC 服务端 fetch 需要「服务端可达的 API base URL」（dev 与 Docker 各异）这一额外配置，属未来优化非当前必需（YAGNI）。

**Alternatives considered**：
- *RSC Server Component 拉取 + client island*：SSR/缓存更优，但引入服务端 base-url 配置与新页面结构，对 canary 过重。记为**未来优化**，待内容页规模/SEO 需求出现再做。

**Trade-off 记录**：放弃首屏 SSR 内容，换取最小改动面与一致性；缓存仍由 API 的 `Cache-Control` + 浏览器承担。

---

## D6. `.db` 文件移出版本控制

**Decision**：`.gitignore` 增加 `apps/api/data/*.db`；`git rm --cached apps/api/data/teaching_tool.db`（保留本地文件）。fixtures(文本)为 git 内容唯一来源，`.db` 为生成产物。

**Rationale**：内容入库后 `.db` 会随每次 seed 变化产生二进制 diff 与合并冲突。源-产物分离是正确模型（见 spec Clarifications）。

**Alternatives considered**：继续跟踪 `.db` —— 二进制冲突、评审不可读、与「fixtures 为源」矛盾。否决。

---

## D7. 共享类型位置：`packages/shared/src/content.ts`

**Decision**：在已被 `transpilePackages` 的 `@teaching-tool/shared` 内新增 `content.ts`，定义 `JargonTerm`、`JargonCategory`、`JargonResponse` 等，并由 `index.ts` 再导出（与 `chat.ts`/`pipeline.ts` 一致）。后端 Pydantic 响应模型与之保持字段一致，作为跨层契约。

**Rationale**：单一类型源，前端直接消费；契约文档化满足 Principle V。`packages/content` 空壳与此无关，按 Owner 决策归档不动。

---

## D8. 测试基建（最小引入）

**Decision**：`apps/api/tests/test_content_jargon.py`：(1) seeder 跑通后断言库内 Jargon 条数 = fixtures 条数（与 seeder 内置断言互为印证）；(2) `GET /api/content/jargon` 返回 200、分组结构正确、词条总数正确、含必需字段。使用 FastAPI `TestClient` + 临时 SQLite。

**Rationale**：Principle IV 早期允许后补测试，但内容完整性（条数/字段）极适合自动化兜底，也为 010+ 大批量数据搬运建立可复用校验基线。

**Alternatives considered**：纯手动 QA —— 数据条数/字段漏检风险高。否决。
