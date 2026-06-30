# Implementation Plan: 教学内容基础设施（Content Foundation）

**Branch**: `009-content-foundation` | **Date**: 2026-06-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-content-foundation/spec.md`

## Summary

把教学内容从前端硬编码常量下沉到后端 SQLite，由只读 `/api/content` 提供、前端拉取渲染，并以 **Jargon 名词页**作为打通「DB → API → 前端」的端到端样板切片。本 Spec 交付可被 010-013 复用的基础设施：通用内容存储模型（3 张表）、幂等 seeder（JSON fixtures 为源）、内容读取 API、`packages/shared` 共享类型，以及把 `.db` 移出版本控制。取代 `005-content-pages`。

技术路径（已由 roadmap 与 spec Clarifications 锁定，无遗留 NEEDS CLARIFICATION）：
- **存储**：混合模型 —— 通用 `content_items` 表（过滤列提升 + JSON `payload`）+ `content_categories` + `content_meta`，对齐既有 `schema.py` 的 `CREATE TABLE IF NOT EXISTS` 风格并入 `init_db()`。
- **导入**：`apps/api/app/db/seeds/content/<module>/*.json` 为唯一内容源；`seed_content.py` 基于 `UNIQUE` + `content_hash` 做幂等 upsert，含条数断言；CLI 主路径 + 受 env 开关的启动自动 seed。
- **API**：新增 `routers/content.py`(`/api/content`) + `services/content_service.py`，沿用 `conversations.py`/`conversation_service.py` 分层；本 Spec 实现 `GET /api/content/jargon`。
- **前端**：名词页改为从 `/api/content/jargon` 拉取（客户端 fetch，复用既有 `/api/*` 代理），交互逻辑保留前端。
- **类型**：`packages/shared/src/content.ts` 定义 `JargonTerm` 及响应信封，前后端契约。

## Technical Context

**Language/Version**: Python 3.13（后端）、TypeScript 5 / Next.js 15 + React 18.3（前端）

**Primary Dependencies**: FastAPI、aiosqlite、Pydantic、httpx（后端）；Next.js App Router、React（前端）；`@teaching-tool/shared`（共享类型，已 `transpilePackages`）

**Storage**: SQLite（aiosqlite，开发库 `apps/api/data/teaching_tool.db`）；内容源为 git 内 JSON fixtures，`.db` 为生成产物不入库。生产演进路径 PostgreSQL（不在本 Spec 实施）

**Testing**: pytest（后端）——当前仓库无测试基建；本 Spec 引入最小后端测试：seeder 条数断言（运行时）+ 1 个 `/api/content/jargon` 契约/集成测试（Mock/真实 SQLite）。前端沿用手动 QA（浏览器 console）

**Target Platform**: Linux/macOS 服务端（后端 Docker 化）；现代浏览器（前端）

**Project Type**: Web 应用（monorepo：`apps/web` + `apps/api` + `packages/shared`）

**Performance Goals**: 内容近乎静态；`GET /api/content/jargon` 单次返回全量分组树（43 词条，数 KB 级），`Cache-Control: public, max-age=300`。非性能敏感路径

**Constraints**: 关注点分离（前端不直连 DB、后端不含 UI 逻辑）；不改动既有 sessions/conversations/messages；幂等导入；设计系统固定（`#00ffa0`、JetBrains Mono/Inter）

**Scale/Scope**: 本 Spec 仅 Jargon（43 词条 / 6 分类）；存储模型需可承载后续 ~100 题 / 52 工具 / 95 命令 / Lab·Chat 步骤（万级以下，无需分页/分片）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 评估 | 结论 |
|------|------|------|
| **I. 关注点分离** | 内容入数据层、经后端 API 暴露、前端只渲染；交互逻辑留前端，不入库（FR-019/020）。 | ✅ 强化合规 |
| **II. Spec 合规** | 顶部显式 supersede 005；与 Constitution「typed content modules」(Deployment §11 / line 199) 存在表述偏离，见下方 Complexity Tracking + 后续 constitution 更新建议。 | ⚠️ 已记录偏离，Owner 已决策 |
| **III. 第一性原理 / YAGNI** | 混合表（不过度规范化）；不加 version/status/locale 列；前端选客户端 fetch（最简、与既有 chat 页一致），RSC 列为未来优化。 | ✅ 合规 |
| **IV. 测试覆盖** | 早期阶段「先实现后补测试」允许；本 Spec 仍引入 seeder 条数断言 + 1 个端点契约测试，建立后端 pytest 基建。 | ✅ 合规（最小测试基建） |
| **V. 可回溯** | spec/plan/research/data-model/contracts/quickstart 齐全；fixtures 入 git 作内容源；建议补 1 条 ADR 记录「内容入 DB」决策并更新 constitution。 | ✅ 合规 |

**Gate 结论**：通过。唯一偏离（II）为 Owner 明确决策的「内容从 packages/content typed modules → DB」，已在 Complexity Tracking 记录，并建议以 constitution PATCH 同步措辞。

## Project Structure

### Documentation (this feature)

```text
specs/009-content-foundation/
├── plan.md              # 本文件
├── research.md          # Phase 0：技术决策与备选对比
├── data-model.md        # Phase 1：3 张表 schema + Jargon payload 形状
├── quickstart.md        # Phase 1：端到端验证步骤
├── contracts/
│   └── content-jargon.md # Phase 1：GET /api/content/jargon 契约
├── checklists/
│   └── requirements.md  # spec 质量检查（已存在）
└── tasks.md             # Phase 2（由 /speckit-tasks 生成）
```

### Source Code (repository root)

```text
apps/api/                              # FastAPI 后端
├── app/
│   ├── main.py                        # [改] 注册 content router；lifespan 内受控自动 seed
│   ├── db/
│   │   ├── schema.py                  # [改] 新增 SCHEMA_SQL_CONTENT 并入建表
│   │   ├── connection.py              # [改] init_db 执行内容建表（不动既有表）
│   │   ├── seed_content.py            # [新] 幂等 seeder（CLI + 函数）
│   │   └── seeds/content/
│   │       └── jargon/
│   │           ├── categories.json    # [新] 6 个分类
│   │           └── terms.json         # [新] 43 词条（由现有 page.tsx 抬取）
│   ├── routers/
│   │   └── content.py                 # [新] /api/content/jargon
│   ├── services/
│   │   └── content_service.py         # [新] 内容读取 DB 访问
│   └── models/
│       └── content.py                 # [新] Pydantic 响应模型
└── tests/
    └── test_content_jargon.py         # [新] 端点契约 + seeder 条数断言

apps/web/                              # Next.js 前端
└── src/app/jargon/
    ├── page.tsx                       # [改] 改为从 /api/content/jargon 拉取
    └── (内联 CATEGORIES 常量移除，迁往后端 fixtures)

packages/shared/src/
├── content.ts                         # [新] JargonTerm / 分组响应信封类型
└── index.ts                           # [改] 再导出 content 类型

根目录
├── .gitignore                         # [改] 忽略 apps/api/data/*.db
└── packages/content/README.md         # [改] 标注「已归档，不再使用」
```

**Structure Decision**: 沿用既有 monorepo Web 结构。后端在 `apps/api/app` 下按既有 `db / routers / services / models` 分层新增内容相关文件，**不新建顶层目录**；前端仅改造 `jargon/page.tsx`；类型集中在 `packages/shared`。该结构最小化新增面、复用既有模式（`conversations` 三件套），符合 YAGNI。

## Complexity Tracking

> 记录与 Constitution 表述存在偏离、但经 Owner 决策保留的项。

| 偏离项 | 为何需要 | 被否决的更简单/原方案及原因 |
|--------|----------|------------------------------|
| 教学内容存入 **SQLite**（而非 Constitution Deployment §11 / line 199 描述的 `packages/content` typed modules） | Owner 明确决策「要有数据库的版本」；Principle I 要求持久化属数据层；Tech Stack 已显式允许 SQLite/Postgres；内容与代码解耦、统一由 API 提供，利于后续 010-013 复用与未来内容管理 | 原「前端 typed content modules」方案被否：内容仍耦合在前端构建物、无法跨端复用、与「数据层持久化」原则相悖。建议后续以 constitution PATCH 将 line 199 / §11「Typed content modules」措辞更新为「DB-backed content + JSON fixtures」，并补 1 条 ADR |
| 引入后端 **pytest** 基建（仓库此前零测试） | Principle IV 要求至少明确测试策略；seeder 数据完整性与端点契约需自动化兜底 | 「纯手动 QA」被否：内容数据完整性（条数、字段）靠手测易漏，且为 010-013 大批量数据搬运建立可复用的校验基线 |
