# Feature Specification: Lab 交互演示迁移（Lab Page）

**Feature Branch**: `012-content-lab` · **Created**: 2026-07-01 · **Status**: Draft · **Depends on**: `009-content-foundation`

**Input**: 把旧 `Lab.dc.html` 的 5 个交互演示**数据**迁到 SQLite，前端用 React 重建动画/交互。5 个 Tab：训练对比（基座 vs SFT 流式）、函数调用（5 步）、分词对比（3 模式柱状图）、推理全过程（10 步）、RAG（10 步）。

## 背景与数据事实（核查）
- `fcStepData` 5 步、`INFER_STEPS` 10 步、`RAG_STEPS` 10 步（含 phase 标记）——纯 JS 数据。
- 训练对比：`baseTemplate`（含 `{q}` 占位，演示"续写偏离"）+ `sftAnswer`（固定，演示指令跟随）。
- 分词对比：3 模式（早期vs现在 / 早期中vs英 / 现在中vs英）柱状对比 + 右侧"TOKEN 效率速查"4 卡——原在模板标记中，已结构化。
- 新版 `apps/web/src/app/lab/page.tsx` 5 Tab 内容浅。

**数据 vs 逻辑边界**：入库的是步骤文本/模板/对比数值；流式打字、分步推进、模式切换等**动画交互留前端**。

## User Scenarios & Testing

### User Story 1 - 学生体验 5 个交互演示 (Priority: P1) 🎯 MVP
学生在 Lab 页 5 个 Tab：输入问题看基座 vs SFT 流式对比；分步查看函数调用 5 步与 messages；切换 3 种分词模式看柱状对比；分步查看推理 10 步与 RAG 10 步。数据由后端提供。

**Independent Test**: 启动前后端，访问 Lab → 函数调用 5 步、推理 10 步、RAG 10 步分步可推进/重置；分词 3 模式可切换且柱状/数值正确；训练对比可流式；内容来自 `/api/content/lab`。

**Acceptance Scenarios**:
1. **Given** seed 完成，**When** 函数调用 Tab 分步推进，**Then** 依次显示 5 步（含 tool_call JSON、应用层执行高亮、最终回答）与 messages 演进。
2. **Given** 推理 / RAG Tab，**When** 分步推进，**Then** 分别 10 步，RAG 含"建立索引/检索生成"两阶段标记；可重置。
3. **Given** 分词 Tab，**When** 切换 3 模式，**Then** 柱状对比与说明随之变化，右侧速查表显示 4 卡倍率。
4. **Given** 训练对比 Tab，**When** 输入问题并触发，**Then** 左栏基座续写偏离、右栏 SFT 正确回答，流式打字。
5. **Given** 后端不可用/空，**Then** 友好空/错误态，控制台无未捕获错误。

### User Story 2 - 维护者增改演示数据 (Priority: P2)
编辑 Lab fixtures 后导入即生效，不改前端；幂等 + 条数校验（fc5/infer10/rag10=25 条目）。

## Requirements
- **FR-001**: 迁移为 Lab fixtures（`module='lab'`）：`fc-step`(5)/`infer-step`(10)/`rag-step`(10) 为条目；`training`/`tokenizer` 为模块级元数据（content_meta），逐字段保真（含代码/换行/phase）。
- **FR-002**: 提供只读公开 `GET /api/content/lab`，返回 `{ training, functionCall[], tokenizer, inference[], rag[] }`，缓存提示。
- **FR-003**: `packages/shared` 定义 Lab 类型（FcStep/InferStep/RagStep/TokenizerData/TrainingData/LabResponse）。
- **FR-004**: Lab 页改为从 API 拉取并用 React 重建 5 个演示的交互/动画；数据不再硬编码。
- **FR-005**: 导入幂等 + 条数断言（0 分类 / 25 条目 + 2 meta）；不符显式失败回滚。
- **FR-006**: 复用 009 表与 seeder 核心，仅新增 Lab loader + 端点 + 类型；关注点分离；设计系统固定。

### Key Entities
- **演示步骤**：函数调用/推理/RAG 的有序步骤（图标、标题、说明、代码、阶段）。
- **训练模板**：baseTemplate（{q} 占位）、sftAnswer。
- **分词数据**：3 模式（各含柱状组与说明）+ 速查表。

## Success Criteria
- **SC-001**: Lab 5 Tab 全部由后端数据驱动；函数调用 5 步、推理 10 步、RAG 10 步、分词 3 模式、训练对比流式均正常。
- **SC-002**: 步骤/模板/分词数值与旧 `Lab.dc.html` 一致。
- **SC-003**: 维护者改一条导入后刷新即见更新；重复导入无操作；条数不符显式失败。
- **SC-004**: 5 Tab 交互（分步/重置/模式切换/流式/空错误态）正常，控制台零未捕获错误，设计系统一致。
- **SC-005**: Chat/会话、009/010/011 无回归。

## Assumptions
- 迁移源旧 `Lab.dc.html`，保留参考。分词数据原在模板标记中，已结构化为 fixtures。
- 训练对比的 base/sft 为演示用 canned 文本（base 用 {q}，sft 固定讲 Transformer）。
- 单一 `GET /api/content/lab` 一次返回全部；复用 009 表/seeder，不改核心。
