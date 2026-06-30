# Feature Specification: Claude Code 教学数据迁移（Code Page）

**Feature Branch**: `011-content-code`

**Created**: 2026-07-01

**Status**: Draft

**Depends on**: `009-content-foundation`（复用内容表/seeder/API/类型基础设施）

**Input**: 把旧 `Code.dc.html` 的 Claude Code 教学数据迁移到后端 SQLite：**52 个工具**（8 分类）、**95 个命令**（5 分类）、**11 步模拟器演示**、**11 步 Agent 循环走读**、**8 个隐藏功能**。前端 Code 页改为从 API 拉取，替换当前 8 工具 / 8 命令的占位实现。

## 背景与数据事实

旧 `Code.dc.html` 内联数据（已核查）：
- `TOOL_DESCS` 52 项 `{emoji,title,plain,example}` + `TOOL_CATS` 8 分类（`tools[]` + `exp[]` 实验性标记）；52 工具全部有描述。
- `CMD_DESCS` 95 项 + `CMD_CATS` 5 分类；95 命令全部有描述。
- `SIM_STEPS` 11 步 `{terminal[], seq{tag,tagColor,title,desc,code}}`（双栏：终端 + 序列图）。
- `agentLoopSteps` 11 步 `{num,title,src,desc,code}`（源码走读）。
- `hiddenFeatures` 8 项 `{name,desc}`。

新版 `apps/web/src/app/code/page.tsx` 仅 8 工具 / 8 命令 / 简化模拟器，严重缩水。

## User Scenarios & Testing

### User Story 1 - 学生查阅完整 Claude Code 教学内容 (Priority: P1) 🎯 MVP

学生打开「Code」页，5 个 Tab：模拟器（11 步分步演示）、Agent 循环（11 步源码走读）、工具系统（52 工具按 8 分类，点击看详情）、命令目录（95 命令按 5 分类，点击看详情）、隐藏功能（8 项）。内容由后端提供。

**Independent Test**: 启动前后端，访问 Code 页 → 工具 Tab 显示 52 工具/8 分类、命令 Tab 95 命令/5 分类、模拟器可分步推进 11 步、Agent 循环 11 步、隐藏功能 8 项；内容来自 `/api/content/code` 网络请求。

**Acceptance Scenarios**:
1. **Given** 内容已 seed，**When** 访问 Code 页工具 Tab，**Then** 显示 8 分类共 52 工具，实验性工具带 🔒 标记；点击某工具显示 emoji/标题/通俗说明/示例。
2. **Given** 命令 Tab，**When** 查看，**Then** 显示 5 分类共 95 命令；点击显示详情。
3. **Given** 模拟器 Tab，**When** 逐步推进，**Then** 终端与序列图按 11 步演进；可重置。
4. **Given** Agent 循环 / 隐藏功能 Tab，**Then** 分别显示 11 步走读 / 8 个功能卡片。
5. **Given** 后端不可用或空，**When** 访问，**Then** 友好空/错误态，控制台无未捕获错误。

### User Story 2 - 维护者增改条目 (Priority: P2)

维护者编辑 Code fixtures 后运行导入即生效，不改前端；导入幂等、含条数校验（52/95/11/11/8、13 分类）。

**Independent Test**: 改一条工具说明 → 导入 → 刷新见更新；重复导入无操作；条数不符 → 显式失败。

### Edge Cases
- 实验性标记：`exp[]` 中的工具/命令在前端带 🔒；存于条目 payload 的 `isExp`。
- 模拟器步骤含多行终端文本与代码（含特殊字符/转义）：迁移保真。
- 复用 009 内容表，不触碰用户会话表与 API Key 路径。

## Requirements

- **FR-001**: 迁移为 Code fixtures（`module='code'`），含 item_type：`tool`(52)/`command`(95)/`sim-step`(11)/`agent-step`(11)/`hidden-feature`(8)，逐字段保真。
- **FR-002**: 8 个工具分类 + 5 个命令分类写入内容分类（13 行），保留顺序。
- **FR-003**: 工具/命令条目记录其 `isExp`（实验性）标记于 payload。
- **FR-004**: 提供只读公开接口 `GET /api/content/code`，一次返回 `{ tools:{categories[]}, commands:{categories[]}, simulator[], agentLoop[], hidden[] }`，供前端 5 Tab 客户端切换。
- **FR-005**: 列表/分组接口返回缓存提示（近静态）。
- **FR-006**: `packages/shared` 定义 Code 相关类型（CodeTool/CodeCommand/CodeCategory/SimStep/AgentStep/HiddenFeature/CodeResponse）。
- **FR-007**: Code 页改为从 API 拉取并渲染五个 Tab；分步/选中等交互保留前端，数据不再硬编码。
- **FR-008**: 导入幂等 + 条数断言（52/95/11/11/8、13 分类），不符显式失败回滚。
- **FR-009**: 复用 009 表与 seeder 核心，仅新增 Code loader + 端点 + 类型，不改 009 核心。
- **FR-010**: 关注点分离；设计系统固定（`#00ffa0`、JetBrains Mono / Inter）。

### Key Entities
- **工具/命令（Tool/Command）**：emoji、标题、通俗说明、示例、所属分类、是否实验性、原始名（如 `FileRead`、`/init`）。
- **分类（Category）**：8 工具分类 + 5 命令分类，含计数。
- **模拟器步骤 / Agent 步骤 / 隐藏功能**：有序步骤与卡片数据。

## Success Criteria
- **SC-001**: Code 页工具 Tab 显示恰 52 工具 / 8 分类、命令 Tab 95 命令 / 5 分类，均来自后端。
- **SC-002**: 模拟器 11 步、Agent 循环 11 步、隐藏功能 8 项内容与旧 `Code.dc.html` 一致。
- **SC-003**: 实验性工具/命令带 🔒 标记，点击条目显示详情。
- **SC-004**: 维护者改一条导入后刷新即见更新；重复导入无操作；条数不符显式失败。
- **SC-005**: 五 Tab 切换、模拟器分步/重置、详情选中、空/错误态正常，控制台零未捕获错误。
- **SC-006**: 既有 Chat/会话、009 Jargon、010 Job 无回归。

## Assumptions
- 迁移源为旧 `Code.dc.html` 内联数据，旧文件保留参考。
- 工具 slug = 工具名（如 `FileRead`、`mcp`，模块内唯一）；命令 slug = 去掉前导斜杠（`/init`→`init`，`/commit-push-pr`→`commit-push-pr`）。
- 单一 `GET /api/content/code` 一次返回全部（数据量适中，前端 Tab 客户端切换）。
- 复用 009 `content_items`/`content_categories` 与 seeder MODULE_REGISTRY；不改其核心。
