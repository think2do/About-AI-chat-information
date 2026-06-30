# Feature Specification: 求职面试题库迁移（Job Question Bank）

**Feature Branch**: `010-content-job`

**Created**: 2026-07-01

**Status**: Draft

**Depends on**: `009-content-foundation`（复用其内容表 / seeder / API / 共享类型基础设施）

**Input**: 将旧 `Job.data.js` 的 100 道求职面试题迁移到后端 SQLite，由 `/api/content/jobs` 提供，前端 Job 页改为从 API 拉取（列表 + 详情 + 分类过滤），替换当前仅 20 题占位的实现。

---

## 背景与数据事实

旧 `Job.data.js`（`window.JOB_DATA`）含面试题与标签集合。**数据核查**：`QUESTIONS` 数组里有 3 个元素本身是**嵌套数组**（批量题被误塞为子数组），扁平化后为 **精确 100 道题**，ID 全唯一、无缺失字段。

- **分类（tag）**：5 类——系统架构(16)、模型选型(28)、评测指标(26)、项目挑战(9)、产品策略(21)，全部在 `ALL_TAGS` 内。
- **难度**：困难 15 / 中等 83 / 简单 2。
- **字段**：`id, tag, title, difficulty, company, tags[], answer, code?, codeLabel?, codeLines?, keyPoints[], related[]`；100 题均有 `keyPoints` 与 `related`，14 题带 `code`。
- **ALL_TAGS**：6 项（`all` + 5 类），用于过滤栏。

当前新版 `apps/web/src/app/job/page.tsx` 仅 20 道占位题且答案为通用模板（非真实答案），与旧库严重不符。

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 学生浏览并查看真实面试题 (Priority: P1) 🎯 MVP

学生打开「求职 / Job」页面，看到完整 100 道面试题列表（按分类组织、可按标签过滤）；点击某题，右侧展示该题的难度/公司标签、完整答案、代码示例（若有）、要点列表与关联考察点。内容由后端提供。

**Why this priority**: 这是用户可见的核心价值——把真实题库（含详细答案/代码/要点）替换掉占位内容。

**Independent Test**: 启动前后端，访问 Job 页 → 列表显示 100 题，分类过滤可用；点题 → 详情含真实 answer / keyPoints / related（带 code 的题显示代码块）。内容来自 `/api/content/jobs*` 网络请求，非前端内联。

**Acceptance Scenarios**:

1. **Given** 内容已 seed，**When** 访问 Job 页，**Then** 列表显示 100 题、过滤栏含「全部 + 5 分类」及各自计数。
2. **Given** 在 Job 页，**When** 选择某分类，**Then** 列表仅显示该分类题目；选「全部」恢复 100 题。
3. **Given** 在 Job 页，**When** 点击某题，**Then** 右侧显示难度、公司、完整答案、要点、关联；该题若有代码则显示带语言标签的代码块。
4. **Given** 后端不可用或内容为空，**When** 访问 Job 页，**Then** 显示友好空/错误态，不白屏、控制台无未捕获错误。

---

### User Story 2 - 维护者增改题目 (Priority: P2)

维护者编辑 Job 的数据文件（新增/修改一题）后运行导入命令，刷新页面即生效，不改前端代码；导入幂等、含条数校验（恰好 100 题）。

**Why this priority**: 延续 009 的「内容与代码解耦」工作流到题库，便于后续扩充题目。

**Independent Test**: 改 fixtures 一题字段 → 跑导入 → 刷新见更新；重复导入无操作；条数不符（≠100）→ 显式失败。

**Acceptance Scenarios**:

1. **Given** Job fixtures，**When** 首次导入，**Then** 库内恰好 100 题、5 分类、`all_tags` 元数据写入，条数断言通过。
2. **Given** 已导入，**When** 数据未变重复导入，**Then** 无操作、无重复。
3. **Given** fixtures 条数被改动为非 100，**When** 导入，**Then** 显式失败并回滚。

---

### Edge Cases

- **嵌套数组扁平化**：提取脚本 MUST 扁平化 `QUESTIONS` 中的子数组，得到精确 100 题。
- **可选字段**：`code/codeLabel/codeLines` 仅 14 题有；详情渲染 MUST 容忍缺省。
- **长答案/特殊字符**：`answer` 含换行与代码，迁移 MUST 保真（不丢换行、不转义错乱）。
- **空库 / 后端不可用**：列表与详情均返回/渲染友好空与错误态。
- **不影响用户数据**：复用 009 内容表，不触碰 sessions/conversations/messages 与 API Key 路径。

---

## Requirements *(mandatory)*

- **FR-001**: 系统 MUST 将旧 `Job.data.js` 扁平化后的 100 道题迁移为可审查的 Job fixtures（按 009 的 fixtures 约定，`module='job'`、`item_type='question'`），逐字段保真（含 `answer` 换行、`code`、`keyPoints`、`related`）。
- **FR-002**: 系统 MUST 将 5 个分类写入内容分类，并将 `ALL_TAGS`（含计数所需信息）作为模块级元数据存储，供前端过滤栏使用。
- **FR-003**: 题目的过滤/排序字段（分类、难度、公司）MUST 作为可检索结构化字段；其余完整内容（answer/code/keyPoints/related/tags 等）作为整体文档存储。
- **FR-004**: 系统 MUST 提供只读公开列表接口 `GET /api/content/jobs`，返回**轻量列表字段**（id、title、tag、difficulty、company、tags）+ `all_tags` + `total`，并支持按分类/难度过滤。
- **FR-005**: 系统 MUST 提供只读详情接口 `GET /api/content/jobs/{id}`，返回单题完整内容（含 answer/code/codeLabel/codeLines/keyPoints/related）。
- **FR-006**: 列表接口 SHOULD 返回与 009 一致的缓存提示（近静态内容）。
- **FR-007**: 系统 MUST 在 `packages/shared` 定义 Job 相关类型（列表摘要 `JobSummary`、详情 `JobQuestion`、`JobTag`、响应信封），作为前后端契约。
- **FR-008**: Job 页 MUST 改为从 API 获取数据并渲染：列表/过滤/选中/详情交互保留前端，**题库数据不再硬编码**；难度配色等纯展示逻辑保留前端。
- **FR-009**: 导入 MUST 幂等并含条数断言（恰好 100 题 / 5 分类）；不符显式失败回滚。
- **FR-010**: 复用 009 的存储模型与 seeder 核心，仅新增 Job loader + 端点 + 类型，MUST NOT 改动 009 表结构或 seeder 核心逻辑。
- **FR-011**: 前端 MUST NOT 直接访问数据库；后端 MUST NOT 承载 UI/动画逻辑（关注点分离）。
- **FR-012**: 设计系统保持固定（品牌绿 `#00ffa0`、JetBrains Mono / Inter）；难度标签沿用既有配色（困难红 / 中等橙 / 简单绿等既有约定）。

### Key Entities *(include if feature involves data)*

- **面试题（Job Question）**：id、所属分类 tag、标题、难度、公司、技能标签 tags[]、完整答案 answer、可选代码 code/codeLabel/codeLines、要点 keyPoints[]、关联考察点 related[]。
- **题库分类（Job Category）**：5 个 tag 分类（系统架构/模型选型/评测指标/项目挑战/产品策略），各含计数。
- **标签集合（ALL_TAGS）**：过滤栏用的标签列表（`all` + 5 类，含 emoji/label），作为模块级元数据。

## Success Criteria *(mandatory)*

- **SC-001**: Job 页列表显示恰好 **100 道真实题**，过滤栏含「全部 + 5 分类」且各计数与数据一致，全部来自后端。
- **SC-002**: 任选一题，详情展示的 answer/keyPoints/related 与旧 `Job.data.js` 对应题**逐字一致**；带 code 的题展示代码块。
- **SC-003**: 选择任一分类，列表只显示该分类题目，计数与该分类题数一致。
- **SC-004**: 维护者改一题并导入后，刷新 1 分钟内见更新，未改前端代码；重复导入无操作；条数≠100 时导入显式失败。
- **SC-005**: 列表/过滤/详情/空/错误态交互正常，控制台零未捕获错误，设计系统一致。
- **SC-006**: 既有 Chat/会话功能与 009 Jargon 页无回归。

## Assumptions

- 迁移源为旧 `Job.data.js` 扁平化后的 100 题；旧文件保留作历史参考（宪法可追溯要求）。
- 分类 slug 采用语义英文（architecture/model-selection/evaluation/project-challenges/product-strategy）。
- 列表轻字段 + 详情按 id 拉取（100 题、长答案，避免列表一次性传输全部正文）。
- 复用 009 的 `content_items`/`content_categories`/`content_meta` 与 seeder MODULE_REGISTRY 机制，不改其核心。
- `.db` 仍不入库（009 已建立），Job fixtures（文本）为内容源。
