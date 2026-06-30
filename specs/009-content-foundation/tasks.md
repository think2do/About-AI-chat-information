# Tasks: 教学内容基础设施（Content Foundation）

**Input**: Design documents from `/specs/009-content-foundation/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/content-jargon.md ✅

**Tests**: 按 plan.md §D8 仅引入**指定的最小测试集**——1 个端点契约测试 + seeder 条数断言。不做全量 TDD。

**Organization**: 按用户故事分组。US1（名词页可见切片，MVP）/ US2（维护者导入工作流）/ US3（基础设施复用）。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、无未完成依赖）
- **[Story]**: US1 / US2 / US3；Setup、Foundational、Polish 阶段无 Story 标签
- 每个任务含确切文件路径

## Path Conventions

Monorepo Web 结构：后端 `apps/api/app/`、测试 `apps/api/tests/`、前端 `apps/web/src/`、共享类型 `packages/shared/src/`（取自 plan.md「Source Code」）。

---

## Phase 1: Setup（共享基建）

**Purpose**: 版本控制卫生与测试脚手架

- [x] T001 [P] 在根 `.gitignore` 增加 `apps/api/data/*.db`，并执行 `git rm --cached apps/api/data/teaching_tool.db`（保留本地文件），使运行时 SQLite 不再被跟踪（research D6 / Clarifications）
- [x] T002 [P] 建立后端测试脚手架：创建 `apps/api/tests/__init__.py` 与 `apps/api/tests/conftest.py`（提供 FastAPI `TestClient` + 临时 SQLite fixture），并在 `apps/api/requirements.txt`（或等价依赖清单）加入 `pytest`
- [x] T003 [P] 在 `packages/content/README.md` 顶部标注「已归档，不再使用——教学内容改由后端 SQLite + JSON fixtures 提供（见 specs/009-content-foundation）」，目录与代码保持原样（Clarifications）

---

## Phase 2: Foundational（阻塞所有用户故事）

**Purpose**: 内容存储模型、共享契约类型、Jargon 数据与核心导入函数——US1/US2 都依赖

**⚠️ CRITICAL**: 本阶段完成前，任何用户故事不能开工

- [x] T004 在 `apps/api/app/db/schema.py` 新增 `SCHEMA_SQL_CONTENT`：`content_categories` / `content_items` / `content_meta` 三表 + 三个索引，全部 `CREATE TABLE IF NOT EXISTS`，**不改动** sessions/conversations/messages（data-model.md 表 1-3）
- [x] T005 在 `apps/api/app/db/connection.py` 的 `init_db()` 中执行 `SCHEMA_SQL_CONTENT`（与既有 `SCHEMA_SQL` 一同建表），确保启动幂等且不影响既有表（depends T004）
- [x] T006 [P] 在 `packages/shared/src/content.ts` 定义 `JargonTerm` / `JargonCategory` / `JargonResponse`，并在 `packages/shared/src/index.ts` 再导出（contracts/content-jargon.md 类型契约）
- [x] T007 [P] 在 `apps/api/app/models/content.py` 定义对应 Pydantic 响应模型 `JargonTerm` / `JargonCategory` / `JargonResponse`，字段与 T006 的 TS 类型逐字段一致
- [x] T008 [P] 从 `apps/web/src/app/jargon/page.tsx` 的 `CATEGORIES` 抬取数据，生成 `apps/api/app/db/seeds/content/jargon/categories.json`（6 分类，含 slug/label/sort_order，见 data-model.md 映射表）与 `apps/api/app/db/seeds/content/jargon/terms.json`（36 词条，含 category_slug/slug/sort_order/emoji/cn/en/plain/tech），内容逐字段零失真
- [x] T009 在 `apps/api/app/db/seed_content.py` 实现**核心幂等导入函数** `seed_content(db, module=None, force=False)`：以**模块注册表**（非 jargon 硬编码）遍历 fixtures，规范化 JSON 计算 `content_hash`，`ON CONFLICT(module,item_type,slug) DO UPDATE`（仅 hash 变化时写）；导入后执行**条数断言**（jargon: 6 分类 / 36 词条），不符则抛错回滚（depends T004, T005, T008；data-model.md「幂等与完整性」、research D2）

**Checkpoint**: 基础就绪——内容表可建、Jargon 数据可入库、类型契约就位

---

## Phase 3: User Story 1 - 学生看到后端提供的术语内容 (Priority: P1) 🎯 MVP

**Goal**: 名词页内容由 `/api/content/jargon` 提供并渲染，交互保留前端，计数动态

**Independent Test**: seed 后启动前后端，访问 `/jargon` → 36 词条 / 6 分类、通俗+技术解释、占位/空/错误态正常，Network 面板可见对 API 的请求，内容非前端内联（quickstart 步骤 2-3）

### Implementation for User Story 1

- [x] T010 [P] [US1] 在 `apps/api/app/services/content_service.py` 实现 `get_jargon(db)`：查询 `content_categories` + `content_items`（module='jargon'），组装为按 `sort_order` 升序的分组树并附 `total`，沿用 `conversation_service.py` 的 `get_db()` 访问模式（depends T004；contracts 响应结构）
- [x] T011 [US1] 在 `apps/api/app/routers/content.py` 新建 `APIRouter(prefix="/api/content")`，实现 `GET /jargon`：调用 `get_jargon`，返回 `JargonResponse`，设置 `Cache-Control: public, max-age=300`，空库返回 `total=0/categories=[]`，异常走 `try/except → HTTPException`（沿用 `conversations.py` 模式）（depends T007, T010）
- [x] T012 [US1] 在 `apps/api/app/main.py` 注册 `content.router`（与 health/chat/conversations 并列）（depends T011）
- [x] T013 [US1] 重构 `apps/web/src/app/jargon/page.tsx`：移除内联 `CATEGORIES`，改 `useEffect` 内 `fetch('/api/content/jargon')`（消费 `@teaching-tool/shared` 的 `JargonResponse` 类型）；副标题词条数**动态计算**（不再硬编码 43）；新增加载 / 空 / 错误状态；保留分类展开折叠与术语选中交互、设计系统不变（research D5；spec FR-016/018）
- [x] T014 [P] [US1] 在 `apps/api/tests/test_content_jargon.py` 编写契约测试：`GET /api/content/jargon` → 200，`module=='jargon'`、`total==36`、`len(categories)==6`、首类 `slug=='model-arch'`、各 term 含 `slug/emoji/cn/en/plain/tech` 且非空；空库场景 → `total==0`（depends T011；contracts「契约测试」）

**Checkpoint**: MVP 完成——名词页端到端由后端驱动，可独立演示

---

## Phase 4: User Story 2 - 维护者改数据并导入即更新 (Priority: P1)

**Goal**: 通过编辑 fixtures + 运行导入命令更新内容，全程不改前端代码；导入幂等、含条数校验

**Independent Test**: 改 `terms.json` 一字段 → 跑导入 → 刷新页面见更新；再跑一次为无操作；删一条 + `--force` → 显式失败报条数不符（quickstart 步骤 1）

### Implementation for User Story 2

- [x] T015 [US2] 在 `apps/api/app/db/seed_content.py` 增加 CLI 入口（`if __name__ == "__main__"` + `argparse`），支持 `python -m app.db.seed_content [--module <m>] [--force]`，打印导入摘要（如 `seeded jargon: 6 categories, 36 terms` / `unchanged`）（depends T009；research D4）
- [x] T016 [US2] 在 `apps/api/app/main.py` 的 lifespan 中，于 `init_db` 之后**受环境变量 `SEED_CONTENT_ON_STARTUP` 控制**地调用 `seed_content`（dev 默认开、prod 关）（depends T009；research D4）
- [x] T017 [US2] 完善 `seed_content.py` 的幂等与 force 语义：未变更条目 `--force` 时强制重写、变更条目按 hash 增量更新、`updated_at` 刷新；并确保条数断言失败时事务回滚不留残缺数据（depends T009；spec FR-007/010）
- [x] T018 [P] [US2] 在 `apps/api/tests/test_seed_content.py` 编写 seeder 测试：首次导入后库内计数正确；数据未变重复导入为无操作（无新增/无报错）；篡改 fixtures 使条数不符时导入抛错（depends T015, T017）

**Checkpoint**: 维护者工作流可用——内容与代码解耦、导入安全可重复

---

## Phase 5: User Story 3 - 后续模块复用同一套基础设施 (Priority: P2)

**Goal**: 010-013 仅通过「加 fixtures + 加 service 方法 + 加端点」即可接入，无需改存储模型/导入器核心

**Independent Test**: 审阅 `seed_content.py` 的模块注册表与表结构为 module-generic；按文档可描述出接入一个新模块的步骤而不触碰核心（spec US3 验收）

### Implementation for User Story 3

- [x] T019 [US3] 创建 `apps/api/app/db/seeds/content/README.md`：说明 fixtures 目录约定、`content_items`/`content_categories`/`content_meta` 的 module-generic 用法，以及「新增一个模块」的步骤（加 `seeds/content/<module>/*.json` → 注册到 `seed_content` 的 MODULE 注册表 → 加 service 方法与端点），并确认 T009 的注册表实现未对 jargon 硬编码（depends T009）

**Checkpoint**: 基础设施复用路径文档化、已验证 module-generic

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: 端到端验证与回归

- [x] T020 按 `specs/009-content-foundation/quickstart.md` 跑完整验证（seed → curl → 页面 → pytest → git 卫生），逐条核对 Success Criteria
- [x] T021 回归确认：Chat 页发消息、查看历史对话正常，`sessions/conversations/messages` 表与行为未受内容表新增影响（spec SC-007）
- [x] T022 [P] 运行 JS 语法/类型与后端 import 自检：前端 `npm run build`（或 lint/tsc）通过、后端 `python -c "import app.main"` 无误

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (P1)**：无依赖，可立即开始
- **Foundational (P2)**：依赖 Setup；**阻塞**所有用户故事
- **US1 (P3)**：依赖 Foundational（尤其 T009 已能向库内灌入 Jargon 数据）
- **US2 (P4)**：依赖 Foundational（围绕 T009 核心函数补 CLI/启动/幂等/测试）
- **US3 (P5)**：依赖 Foundational（T009 的注册表）
- **Polish (P6)**：依赖 US1+US2（US3 可选）完成

### Story 关系

- US1 与 US2 均建立在 Foundational 之上；US1 是用户可见 MVP，US2 是维护者工作流。两者文件基本不重叠（US1 改 service/router/main/前端；US2 改 seed_content/main-lifespan/测试），**main.py 两处改动需注意先后**（T012 注册路由、T016 加 startup seed，建议顺序执行以免冲突）。
- US3 仅新增文档 + 复核，几乎不与他者冲突。

### 关键路径

`T004 → T005 → T009 → (T010 → T011 → T012 → T013)` 为最短可演示链（MVP）。

---

## Parallel Opportunities

- **Setup**：T001 / T002 / T003 全部 [P] 并行
- **Foundational**：T006 / T007 / T008 [P] 并行（T004→T005 串行在前，T009 收口）
- **US1**：T010 与 T014 可与前端 T013 并行推进（T011/T012 串行）
- **US2**：T018 测试可与文档 T019 并行

### Parallel Example: Foundational

```bash
# T004→T005 完成后，下列可并行：
Task: "shared 类型 packages/shared/src/content.ts + index.ts 再导出"   # T006
Task: "Pydantic 模型 apps/api/app/models/content.py"                  # T007
Task: "Jargon fixtures categories.json + terms.json"                  # T008
```

---

## Implementation Strategy

### MVP First（US1）

1. Phase 1 Setup → 2. Phase 2 Foundational（**关键**）→ 3. Phase 3 US1 → **STOP & VALIDATE**：名词页端到端可用即达成 MVP，可演示。

### Incremental Delivery

Foundational → **US1（MVP，名词页可见）** → US2（导入工作流可用）→ US3（复用文档）→ Polish（回归 + quickstart）。每步不破坏前一步。

---

## Notes

- 测试仅 plan §D8 指定的两项（T014 契约 / T018 seeder），非全量 TDD。
- `[P]` = 不同文件、无未完成依赖；`main.py` 的 T012 与 T016 不并行。
- 每个任务或逻辑组完成后提交；建议在 US1 完成（MVP）处打 checkpoint。
- 守住边界：内容数据入库，交互逻辑留前端；不触碰用户会话/对话表与 API Key 路径。
