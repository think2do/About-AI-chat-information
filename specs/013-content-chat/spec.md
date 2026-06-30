# Feature Specification: Chat Pipeline 阶段详情迁移（Chat Page）

**Feature Branch**: `013-content-chat` · **Created**: 2026-07-01 · **Status**: Draft · **Depends on**: `009-content-foundation`、`006-pipeline-visualization`

**Input**: 把 Chat 页 Pipeline **7 阶段的教学详情**迁到后端 SQLite，由 `/api/content/chat/pipeline` 提供；增强现有 `PipelineVisualization` 组件，使每个阶段可点击展开其详细教学说明（补齐旧版"7 个圆点无详情"的缺口）。

## 背景与范围界定（重要）

旧 `index.html` 的 Pipeline 含两类内容：
1. **运行时动态内容**（实际 System Prompt、实际 JSON 请求体、实际 token 着色、实时解码日志）——由用户当次对话**计算得出**，非"可入库的内容"。
2. **静态教学内容**——每个阶段"在做什么、为什么重要"的讲解。

本 Spec 只迁移 **(2) 静态教学内容**（7 阶段的 num/label/short/detail/color），这是"内容下沉 SQLite"程序的范畴。Spec 006 已实现的 7 阶段进度条（`PipelineVisualization.tsx`）与参数面板/指标组件保留；本 Spec 在其上**叠加 DB 驱动的阶段详情展开**。

**明确不在本 Spec 范围**（属计算型交互，非内容迁移，留作未来交互增强）：概率分布柱状图、滑块→JSON 字段联动高亮、逐条消息性能指标、CoT 开关。

## User Scenarios & Testing

### User Story 1 - 学生查看 Pipeline 各阶段的教学详情 (Priority: P1) 🎯 MVP

学生在 Chat 页看到 7 阶段进度条；点击任一阶段，展开该阶段的详细教学说明（这一步在做什么、为什么重要）。阶段文案由后端提供。

**Independent Test**: 启动前后端，进入 Chat 页 → 7 阶段圆点可点击 → 展开显示该阶段 detail 文案；内容来自 `/api/content/chat/pipeline` 网络请求，非前端硬编码。

**Acceptance Scenarios**:
1. **Given** seed 完成，**When** 进入 Chat 页，**Then** 显示 7 阶段进度条，标签与颜色正确。
2. **Given** 在 Chat 页，**When** 点击某阶段圆点/标签，**Then** 下方展开该阶段的 detail 教学说明；再次点击收起。
3. **Given** 后端不可用，**When** 进入 Chat 页，**Then** 进度条仍以内置兜底标签显示、聊天功能不受影响，控制台无未捕获错误。
4. **Given** 流式对话进行中，**When** 阶段推进，**Then** 进度条高亮当前阶段（沿用 006 行为）不被本功能破坏。

### User Story 2 - 维护者增改阶段文案 (Priority: P2)

维护者编辑 pipeline fixture 后导入即生效，不改前端；幂等 + 条数校验（7 阶段）。

## Requirements
- **FR-001**: 迁移 7 阶段教学内容为 fixtures（`module='chat'`、`item_type='pipeline-stage'`，含 num/label/short/detail/color），逐字段保真。
- **FR-002**: 提供只读公开 `GET /api/content/chat/pipeline`，返回 `{ module, stages[] }`，缓存提示。
- **FR-003**: `packages/shared` 定义 `PipelineStageContent` 与 `ChatPipelineResponse` 类型。
- **FR-004**: 增强 `PipelineVisualization`：从 API 取阶段文案、阶段可点击展开 detail；后端不可用时回退内置标签，**不破坏** 006 的进度高亮与聊天流式。
- **FR-005**: 导入幂等 + 条数断言（0 分类 / 7 条目）；不符显式失败回滚。
- **FR-006**: 复用 009 表与 seeder 核心；关注点分离；设计系统固定（`#00ffa0`、JetBrains Mono / Inter）。
- **FR-007**: 本 Spec MUST NOT 改动 Chat 聊天流式、会话保存等既有逻辑。

### Key Entities
- **Pipeline 阶段（Pipeline Stage）**：序号 num、标签 label、一句话 short、详细教学 detail、主题色 color。

## Success Criteria
- **SC-001**: Chat 页显示 7 阶段，点击展开的 detail 文案与 fixture 一致，且来自后端。
- **SC-002**: 后端不可用时聊天功能与进度条兜底显示均正常，无未捕获错误。
- **SC-003**: 维护者改一条阶段文案导入后刷新即见更新；重复导入无操作；条数≠7 显式失败。
- **SC-004**: 006 的进度高亮、流式对话、会话保存无回归；009/010/011/012 无回归。

## Assumptions
- 仅迁移静态阶段教学内容；运行时动态展示与概率/滑块/CoT 等计算型交互不在本 Spec（未来交互增强）。
- 阶段文案基于旧 `index.html` 阶段语义 + 标准 LLM 推理流程编写（教学用途）。
- 单一 `GET /api/content/chat/pipeline`；复用 009 表/seeder，不改核心。
