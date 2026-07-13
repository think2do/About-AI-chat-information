<!--
  Sync Impact Report
  ==================
  Version change: [UNVERSIONED] → 1.0.0 (initial ratification) → 1.0.1 (2026-07-01) → 1.1.0 (2026-07-13)

  1.1.0 amendment (MINOR — new section added):
  - 新增「Design System Constraints（设计系统约束）」章节，确立：设计 token 以
    design/tokens.json（W3C DTCG）为单一事实来源、design/DESIGN.md 为品味/结构规格；
    当前方向为浅色编辑式（暖奶白 #FAF9F7 + 马利筋黄 #FEB70C），退休原蓝绿终端风 #00ffa0；
    黄仅作黑字之下的填充/高亮；主题 mode-aware（浅色首发，深色为后续 Spec 的 mode 扩展）。
  - 调整 Deployment Standards 第一阶段范围表：原「视觉大改版」out-of-scope 与新章节冲突，
    改注为「基于 token 的浅色主题系统（Spec 016）属范围内；大规模 IA/功能重构仍在外」。
  - 依据本修订，Spec 016 取代 Spec 015 FR-006（固定暗色设计系统锁）。
  - Templates requiring updates:
    - .specify/templates/plan-template.md   ✅ aligned — Constitution Check 门禁天然覆盖新章节
    - .specify/templates/spec-template.md    ✅ aligned — 无结构性影响
    - .specify/templates/tasks-template.md   ✅ aligned — 无结构性影响
    - CLAUDE.md                              ⚠ pending — 由 Spec 016 更新 Conventions「设计系统固定」措辞

  1.0.1 amendment (PATCH — wording clarification):
  - 教学内容存储方案由「packages/content typed TS modules」更正为
    「DB-backed content（SQLite + JSON fixtures），经后端 /api/content/* 提供」，
    与 Spec 009（取代 005）落地的架构一致。仅措辞澄清，不改变任何 MUST 原则。

  Added sections:
  - I.   关注点分离 (Separation of Concerns)
  - II.  严格遵守 Spec 规定与文档规范 (Spec & Documentation Compliance)
  - III. 坚持第一性原理，从需求出发 (First Principles Thinking)
  - IV.  完善开发流程与测试覆盖 (Development Process & Test Coverage)
  - V.   确保过程可回溯 (Process Traceability)
  - Technology Stack Constraints
  - Security & Privacy Constraints
  - Deployment Standards
  - Governance

  Modified principles: N/A (initial version)

  Removed sections: N/A (initial version)

  Templates requiring updates:
  - .specify/templates/plan-template.md      ✅ aligned — "Constitution Check" gate supports Principle II
  - .specify/templates/spec-template.md       ✅ aligned — requirements & user scenarios support Principles II, III, IV
  - .specify/templates/tasks-template.md      ✅ aligned — testing tasks support Principle IV; phased structure supports Principle V
  - README.md                                 ✅ updated (2026-07-01) — monorepo + 内容入 SQLite 现状
  - CLAUDE.md                                 ✅ updated (2026-07-01) — monorepo + 内容入 SQLite 现状

  Follow-up TODOs: none — all placeholders resolved
-->
# LLM 机制可视化教学工具 (AI Teaching Tool) Constitution

## Core Principles

### I. 关注点分离 (Separation of Concerns)

系统 MUST 按职责划分为三层，各层边界清晰且不可跨层混淆：

- **前端体验层**：负责教学交互、UI 渲染、用户输入、本地状态管理。不得直接调用 LLM
  Provider API，不得直接操作数据库。
- **后端服务层**：负责请求治理、Provider 代理转发、流式响应、会话管理、限流与错误归一。
  不得持有前端 UI 状态，不得保存 API Key。
- **数据与运维层**：负责匿名会话、对话记录、请求日志、用量指标的持久化与过期清理。
  不得暴露原始敏感数据给上层。

各层内的模块 MUST 保持单一职责：Chat 模块只管对话、Pipeline 模块只管流程可视化、设置模块只管
Provider 配置。模块间通过明确的接口（typed contracts）通信。

**Rationale**: 当前静态 Demo 中职责混杂——同一页面同时负责 UI、课程内容、API 请求、流式解析和错误处理。
生产化重构的核心不是换框架，而是把系统职责拆开，让每一层可以被独立测试、独立部署、独立演进。

### II. 严格遵守 Spec 规定与文档规范 (Spec & Documentation Compliance)

在任何开发工作开始前，MUST 执行以下检查流程：

1. **Spec 冲突检查**：确认当前准备开发的内容是否与已有 Spec（`.specify/specs/` 目录下）存在冲突。
2. **先调整 Spec**：如果存在冲突，MUST 先更新 Spec 文档，确保 Spec 准确反映目标行为，
   然后再开始编码。
3. **Spec 引用**：所有功能开发工作 MUST 关联一个已批准的 Spec 文档。
4. **文档同步**：当实现过程中发现 Spec 遗漏或错误，MUST 回写更新 Spec，保持文档与代码的一致性。

Spec 文档是系统行为的权威来源（single source of truth），代码是 Spec 的忠实实现。

**Rationale**: 多人协作或长周期项目中，代码与文档容易发生漂移。强制「先改 Spec 再改代码」的流程
确保团队始终有一份可信任的系统行为描述，降低沟通成本和新成员上手门槛。

### III. 坚持第一性原理，从需求出发 (First Principles Thinking)

技术选型 MUST 遵循以下决策顺序：

1. **从实际业务需求出发**：先明确「要解决什么问题」、「用户需要什么体验」、
   「有哪些约束条件」，再选择技术方案。
2. **禁止技术炫耀**：不得为了使用某项技术而强行引入。每个技术依赖 MUST 有明确的业务理由。
3. **选型困难时向上确认**：当面临多个技术方案难以抉择时，第一选择是向项目 Owner
   确认核心需求与优先级，明确后再做技术决策，而非自行猜测或跟风业界潮流。
4. **保持简单（YAGNI）**：在满足当前需求的前提下，选择最简单的方案。
   不为未来可能的需求提前构建复杂抽象。

**Rationale**: AI/LLM 领域技术迭代极快，容易被新工具、新框架吸引而偏离实际需求。
坚持第一性原理确保每一项技术投入都服务于真实的教学目标，而非追逐技术潮流。

### IV. 完善开发流程与测试覆盖 (Development Process & Test Coverage)

测试策略 MUST 覆盖三个层级，从低到高逐步验证：

**(a) 分层测试覆盖：**

| 层级 | 范围 | 目的 | 执行频率 |
|------|------|------|----------|
| 单元测试 | 单个函数/方法/组件 | 验证逻辑正确性 | 每次提交 |
| Mock 全流程测试 | 模块间交互（Mock 外部依赖） | 验证集成契约 | 每次 PR |
| Live 环境测试 | 真实 Provider、真实数据库 | 验证端到端行为 | 发布前 / 定期 |

**(b) 项目后期 TDD（测试驱动开发）：**

当项目进入稳定迭代阶段后，MUST 遵循 TDD 原则：
- 先写测试，确认测试 FAIL
- 再写实现代码，直到测试 PASS
- 最后重构优化，保持测试 GREEN

项目早期（第一阶段迁移）可以先实现后补测试，但每个功能模块 MUST 在设计阶段就明确测试策略。

**Rationale**: 当前项目完全没有自动化测试，所有 QA 依赖手动打开浏览器查看 console。
引入分层测试体系后，每次变更都可以通过自动化验证，大幅降低回归风险。
TDD 在后期引入而非初期强制，是为了在架构稳定前保持开发灵活性。

### V. 确保过程可回溯 (Process Traceability)

每次迭代 MUST 遵循以下可追溯性要求：

1. **版本号**：每个发布版本 MUST 有明确的语义化版本号（MAJOR.MINOR.PATCH），
   并在 CHANGELOG 或对应 Spec 中记录变更内容。
2. **调研文档**：对于涉及新技术引入、架构调整、或外部依赖选型的决策，
   MUST 配套调研文档（放在 `docs/` 目录下），记录调研过程、候选方案对比和最终选择理由。
3. **决策文档**：对于修改 Constitution 原则、调整核心架构、或放弃某项重要功能的决定，
   MUST 配套决策记录（ADR 或同等形式），说明背景、选项、决策和后果。
4. **技术接口文档**：前后端之间的 API Contract、模块间的类型定义、数据模型的 Schema
   MUST 有文档化的约定（放在 `specs/` 或 `docs/architecture/` 目录下）。
5. **渐进迁移**：旧版文件在迁移完成前保留作为参考，不得直接删除。

整个思考和开发过程——从需求讨论、技术决策、到实现细节——都 MUST 可通过文档回溯。

**Rationale**: 教学工具项目涉及多人协作和长期维护，过程中会产生大量决策和知识。
可回溯性确保未来的维护者（包括半年后的自己）能理解当时的决策背景，
不会重蹈覆辙或做出矛盾决策。

---

## Technology Stack Constraints

以下技术栈约束来源于 Production Refactor Plan（`docs/architecture/production-refactor-plan.md` §4），
所有技术选型 MUST 在此约束范围内：

| 系统部分 | 约束技术 | 备选/演进路径 |
|----------|----------|---------------|
| 前端 App | Next.js + React + TypeScript | — |
| 后端 API | FastAPI + Python | — |
| LLM 调用 | 后端 ProviderAdapter（隔离 Provider 差异） | 前端不得直接调用 Provider API |
| 数据库 | 开发：SQLite；生产：PostgreSQL | — |
| 限流缓存 | 开发：内存限流；生产：Redis | — |
| 部署 | 前端：静态/Node 托管；后端：Docker | 前后端独立部署、独立扩容 |

**不可协商的约束：**
- 前端 MUST NOT 直接调用任何 LLM Provider API；所有 LLM 请求 MUST 经过后端 ProviderAdapter。
- API Key MUST NOT 写入服务端数据库、日志、错误响应或 telemetry（详见 Security & Privacy Constraints）。
- 旧静态 HTML/DC 文件在迁移完成前保留，不得删除（可追溯性要求）。

---

## Security & Privacy Constraints

以下安全与隐私约束来源于 Production Refactor Plan §8-9，所有代码 MUST 遵守：

**API Key 生命周期（零留存原则）：**

```
学生浏览器 localStorage → POST /api/chat/stream → FastAPI 内存变量
→ Provider Authorization Header → 请求完成后立即释放

禁止路径：↛ Database | ↛ Logs | ↛ Error responses | ↛ Telemetry
```

**数据边界：**
- 用户身份：仅使用匿名 `session_id`（`anon_` 前缀），不收集邮箱、手机号、姓名等 PII。
- IP 地址：仅保存 `ip_hash`，不保存原始 IP。
- User-Agent：仅保存 `user_agent_hash`，不保存完整 UA 字符串。
- 对话内容：完整保存，默认 30 天自动过期（`expires_at = created_at + 30 days`）。
- 学生可主动删除自己的匿名会话下的对话。
- Provider 错误信息在写入日志前 MUST 脱敏处理，移除所有认证相关的 header 和参数。

**禁止保存字段清单：**

| 禁止项 | 原因 |
|--------|------|
| `api_key` | 学生私密凭据 |
| `Authorization` header | 等同于 API Key |
| 完整 Provider 请求 headers | 可能包含认证信息 |
| 含 Key 的完整错误对象 | HTTP client 可能携带敏感上下文 |
| 原始 IP 地址 | 第一阶段仅保存 hash |

**前端隐私提示（MUST 在设置页面展示）：**

> API Key 只保存在当前浏览器。发送消息时，Key 会临时传给本教学工具后端用于转发模型请求；
> 后端不会保存 Key。对话内容会被保存用于学习记录和问题排查，默认 30 天后过期。

---

## Deployment Standards

以下部署规范来源于 Production Refactor Plan §2-3、§11：

**目录结构（Monorepo）：**

```text
apps/
  web/          # Next.js + React + TypeScript 前端
  api/          # FastAPI + Python 后端

packages/
  content/      # 已归档（不再使用）；教学内容改由 SQLite + JSON fixtures 提供（见 Spec 009）
  shared/       # API schema、Provider config、共享类型定义

apps/api/app/db/seeds/content/   # 教学内容 JSON fixtures（Lab/Code/Jargon/Job/Chat），内容唯一来源

docs/
  architecture/ # 架构文档与决策记录
```

**部署原则：**
- 前端与后端 MUST 可独立部署、独立扩容。
- 后端 MUST 以 Docker 容器化方式部署。
- 前端 MUST 可通过静态文件托管或 Node.js 运行时部署。
- 所有服务 MUST 暴露 `/health` 健康检查端点。
- 开发环境 MUST 可通过 `docker-compose` 一键启动完整服务链路。

**第一阶段迁移范围（来自 Production Refactor Plan §11）：**

| 范围内 | 范围外 |
|--------|--------|
| Chat、Lab、Code、Jargon、Job 五页迁移 | 账号登录系统 |
| FastAPI Chat streaming gateway | 教师后台 / 管理员 UI |
| 匿名 session + conversation 保存 | 服务器统一托管 API Key |
| DB-backed content（SQLite + JSON fixtures，经 /api/content/* 提供） | RAG 真实知识库 |
| 30 天数据过期 | 复杂权限系统 |
| API Key 浏览器保存、后端临时转发 | 大规模 IA / 功能重构 |

> 注（1.1.0 修订）：基于 token 的**浅色主题系统**（Spec 016，退休蓝绿终端风）现属第一阶段范围内，
> 由下方「Design System Constraints」章节治理；此处 out-of-scope 的「大规模 IA / 功能重构」指
> 信息架构或功能集的重构，与主题/视觉规范无关。

---

## Design System Constraints

以下设计系统约束确立项目的视觉规范与主题实现方式，所有前端呈现代码 MUST 遵守：

**单一事实来源：**
- 视觉设计 token（颜色 / 字体 / 字重 / 字号 / 间距 / 圆角 / 阴影）以 `design/tokens.json`
  （W3C DTCG 格式）为**单一事实来源**；`design/DESIGN.md` 为品味、结构与组件规则的规格文档。
- 前端 MUST 通过统一 token 层（`apps/web/src/lib/theme.ts` + `globals.css` CSS 变量）消费设计值，
  MUST NOT 在组件中散落硬编码色值 / 字号。

**当前设计方向（浅色编辑式）：**
- 画布为暖奶白 `#FAF9F7`（永不纯白），唯一主色为马利筋黄 `#FEB70C`（取自旦曼学院 logo）。
- 原「蓝绿终端风」主色 `#00ffa0` 及其暗色终端美学**予以退休**（superseded，见 Spec 016）。
- 字体仅 Inter（正文 / UI）与 JetBrains Mono（代码 / 数据 / 标签）。

**黄的用法铁律：**
- 马利筋黄 MUST 仅作「黑字之下的填充 / 高亮」——主 CTA（黄底黑字）、active pill（yellowTint 底）、
  荧光笔式高亮标记。
- 黄 MUST NOT 用作浅底上的文字、图标或细描边（对比度不足）。
- 每屏 MUST 最多一个实心黄 CTA。

**主题实现（mode-aware）：**
- 主题 MUST 实现为 mode-aware：token 经 CSS 变量注入，通过 `<html data-theme>` 切换 mode，
  组件不感知具体色值。
- 浅色（cream + yellow）为默认且首个落地 mode；深色 mode（同样以马利筋黄为主色）为后续 Spec 的
  扩展，MUST NOT 复活已退休的蓝绿美学。

**Rationale**: 旧版设计值散落在数百处硬编码 hex 中，主题无法整体演进且深浅背景难以区分。
将设计系统收敛到 token 单一来源，既保证视觉一致，又让主题（浅 / 深）成为可插拔的 mode，
符合关注点分离（原则 I）与可回溯（原则 V）。

---

## Governance

**Constitution 优先级**：本 Constitution 是项目的最高治理文件，所有 Spec、Plan、Tasks 和代码实现
MUST 遵守其原则和约束。当其他文档与本 Constitution 冲突时，以本 Constitution 为准。

**Amendment Procedure（修改流程）：**

1. 提出修改 PR，在 PR 描述中说明修改内容、理由和影响范围。
2. PR MUST 经项目 Owner Review 并批准后方可合并。
3. 修改合并后，`LAST_AMENDED_DATE` 更新为合并日期，`CONSTITUTION_VERSION` 按语义化版本规则递增。
4. 如果修改影响了已有 Spec 或模板，MUST 在同一个 PR 中同步更新。

**Versioning Policy：**
- **MAJOR**：原则的移除或重新定义（向后不兼容的治理变更）。
- **MINOR**：新增原则/章节，或实质性扩展已有指导内容。
- **PATCH**：措辞澄清、拼写修正、非语义性优化。

**Compliance Review：**
- 每个 PR MUST 在描述中说明本次变更涉及哪些 Constitution 原则，以及如何遵守。
- Spec 文件中的 "Constitution Check" 章节（plan-template.md）MUST 在每次 Plan 创建时逐条检查。
- 如果某条变更确实违反 Constitution 原则但无法避免，MUST 在 PR 中明确说明理由并在
  Complexity Tracking 中记录。

**Runtime Development Guidance：**
- `CLAUDE.md` — Agent 运行时指导（当前项目状态、命令、架构要点）。
- `AGENTS.md` — 人类贡献者协 conventions（分支策略、PR 规范、文件职责）。
- 以上文件是 Constitution 的运行时补充，不得与 Constitution 原则冲突。

---

**Version**: 1.1.0 | **Ratified**: 2026-06-27 | **Last Amended**: 2026-07-13
