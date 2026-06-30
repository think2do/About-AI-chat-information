# Feature Specification: 教学内容页面迁移 (Content Pages Migration)

**Feature Branch**: `005-content-pages`

**Created**: 2026-06-30

**Status**: Draft

**Input**: 将现有静态 Demo 中 Lab、Code、Jargon、Job 四个教学页面的内容和交互迁移到 Next.js 前端，内容数据从页面逻辑中分离为 typed modules，为后续内容版本管理和教师后台预留 Content API。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 浏览实验室教学模块 (Priority: P1)

作为一名学生用户，我希望在 Lab 页面中通过 Tab 切换浏览 5 个子模块：训练对比、函数调用、白盒分词实验、模型推理全过程、RAG 检索增强。每个子模块的交互体验不低于当前静态 Demo。

**Why this priority**: Lab 是核心教学板块——5 个子模块覆盖了从 Tokenizer 到 RAG 的完整 LLM 知识链路。如果这些模块在新版中消失或退步，教学工具就失去了大部分价值。

**Independent Test**: 打开 Lab 页面 → 依次切换 5 个 Tab → 每个 Tab 内容正常显示 → 交互功能（训练对比输入发送、函数调用逐步点击、白盒实验模式切换、推理流程逐步推进、RAG 步骤推进）均正常工作。

**Acceptance Scenarios**:

1. **Given** 学生打开 Lab 页面，**When** 页面加载完成，**Then** 显示 5 个 Tab（训练对比、函数调用、白盒实验、推理全过程、RAG 检索增强），默认选中第一个 Tab。
2. **Given** 学生在「训练对比」Tab，**When** 学生输入问题并点击发送，**Then** 左右分栏同时展示基座模型（续写偏离）和 SFT 模型（精准跟随）的模拟流式输出。
3. **Given** 学生在「函数调用」Tab，**When** 学生点击逐步推进按钮，**Then** 依次展示 5 个步骤的详细内容和右侧 messages[] 数组演变。
4. **Given** 学生在「白盒实验」Tab，**When** 学生切换 3 种对比模式，**Then** 分词效率对比可视化实时更新。
5. **Given** 学生在「推理全过程」Tab，**When** 学生点击逐步推进，**Then** 10 个步骤依次展示，每步含代码示例。
6. **Given** 学生在「RAG 检索增强」Tab，**When** 学生点击逐步推进，**Then** 索引建立（4 步蓝色标记）和检索生成（6 步绿色标记）依次展示。

---

### User Story 2 - 浏览 Claude Code 教学模块 (Priority: P1)

作为一名学生用户，我希望在 Code 页面中浏览 Claude Code 的终端模拟器、Agent 循环解析、52 个工具目录、95 个命令目录和 8 个隐藏功能。

**Why this priority**: Code 页面是教学工具中最独特的内容之一——它解释了 AI 编程助手的工作原理，是很多开发者最感兴趣的部分。

**Independent Test**: 打开 Code 页面 → 依次切换 5 个 Tab → 终端模拟器完整演示 11 步流程 → Agent 循环展示 11 阶段源码路径 → 工具目录和命令目录支持点击查看详情 → 隐藏功能卡片正常展示。

**Acceptance Scenarios**:

1. **Given** 学生打开 Code 页面，**When** 页面加载完成，**Then** 显示 5 个 Tab（模拟器、Agent 循环、工具系统、命令目录、隐藏功能），默认选中「模拟器」。
2. **Given** 学生在「模拟器」Tab，**When** 学生点击运行，**Then** 终端窗口展示 11 步完整演示流程，右侧 Agent Loop 消息序列图同步更新。
3. **Given** 学生在「工具系统」Tab，**When** 学生点击某个工具名称，**Then** 底部弹出详情面板，显示 emoji、中文标题、通俗解释和使用示例。
4. **Given** 学生在「命令目录」Tab，**When** 学生点击某个命令名，**Then** 底部弹出详情面板，显示 emoji、中文标题、通俗解释和使用场景。

---

### User Story 3 - 查阅黑话词典 (Priority: P2)

作为一名学生用户，我希望在 Jargon 页面中通过层级树浏览 43 个 AI 术语，点击任意词条查看通俗解释和技术解释，并能跳转到关联词条。

**Why this priority**: 黑话词典是教学工具的知识底座——学生在其他页面遇到不理解的术语时，可以随时来查阅。

**Independent Test**: 打开 Jargon 页面 → 左侧层级树展示 6 大分类 → 展开分类显示子节点 → 点击词条 → 右侧显示完整解释（emoji、中文名、英文名、通俗解释、技术解释、关联词条）。

**Acceptance Scenarios**:

1. **Given** 学生打开 Jargon 页面，**When** 页面加载完成，**Then** 左侧显示 6 大分类的层级树，右侧默认显示欢迎或使用说明。
2. **Given** 层级树中某分类有子节点，**When** 学生点击展开箭头，**Then** 子词条列表滑出显示，展开箭头旋转 90 度。
3. **Given** 学生点击某个词条，**When** 右侧面板渲染完成，**Then** 显示该词条的 emoji、中文名、英文名、通俗解释、技术解释和关联词条（可点击跳转）。

---

### User Story 4 - 浏览面试题库 (Priority: P2)

作为一名求职者用户，我希望在 Job 页面中按分类标签筛选 100 道 AI 面试题，查看题目、参考回答、代码示例和解析要点。

**Why this priority**: 面试题库帮助学生准备 AI 岗位面试，是教学工具的实用价值延伸。100 题内容较多，筛选和搜索是关键体验。

**Independent Test**: 打开 Job 页面 → 看到 5 个标签筛选栏 → 点击「模型选型」标签 → 题目列表仅显示该分类的 28 题 → 点击某题 → 右侧显示完整题目详情。

**Acceptance Scenarios**:

1. **Given** 学生打开 Job 页面，**When** 页面加载完成，**Then** 左侧显示 5 个标签筛选按钮（含题目数量）和题目列表，默认显示全部 100 题。
2. **Given** 学生点击分类标签「模型选型」，**When** 筛选生效，**Then** 题目列表仅显示该分类的 28 道题，标签按钮高亮选中态。
3. **Given** 学生点击某道题目，**When** 右侧面板渲染完成，**Then** 显示题目正文、难度徽章、来源公司、技术标签、参考回答（段落式）、代码块（含标题栏和行数）、解析要点列表和关联考察点。

---

### User Story 5 - 内容数据独立维护 (Priority: P3)

作为内容维护者（非程序员），我希望新增/修改黑话词条、面试题或工具目录时，只需编辑独立的数据文件，不需要修改页面逻辑代码。

**Why this priority**: 内容与逻辑分离是 Constitution 中「关注点分离」原则的要求，也是长期内容维护效率的保障。但迁移初期可以先迁移，再优化分离方式。

**Independent Test**: 在 `packages/content/` 中的面试题数据文件新增一道题 → 刷新 Job 页面 → 新题出现在列表中 → 不需要修改任何页面组件代码。

**Acceptance Scenarios**:

1. **Given** 面试题库数据存储在 typed content module 中，**When** 维护者在数据文件中新增一道题（含 id、tag、title、answer 等字段），**Then** Job 页面自动显示新题，无需修改 UI 代码。
2. **Given** 黑话词典数据来自 typed module，**When** 维护者新增一个词条并添加到分类树中，**Then** Jargon 页面自动显示新词条。

---

### Edge Cases

- 面试题数据文件损坏（JSON 格式错误）时如何处理？——前端应显示「题库数据加载失败」占位界面，不白屏。
- 黑话词典分类树过深（超过 3 级）时如何处理？——当前数据最多 3 级，超过应截断或提示维护者。
- 工具目录中点击锁标记的「实验性工具」时如何处理？——详情面板正常显示，但带有红色警告标记。
- Lab 页面子模块之间切换时状态如何保留？——切换 Tab 不清除子模块的进度状态（如推理流程中的当前步骤）。
- Job 页面 100 道题一次性渲染的性能？——前端应确保首次渲染在 1 秒内完成。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统 MUST 将 Lab 页面的 5 个子模块（训练对比、函数调用、白盒实验、推理全过程、RAG 检索增强）完整迁移到 Next.js 前端，交互行为不低于当前静态 Demo。
- **FR-002**: 系统 MUST 将 Code 页面的 5 个子模块（模拟器、Agent 循环、工具系统、命令目录、隐藏功能）完整迁移，52 个工具和 95 个命令的详情面板可正常弹出。
- **FR-003**: 系统 MUST 将 Jargon 页面的 43 个 AI 术语和 6 大分类层级树完整迁移，支持展开/折叠、词条选中、关联跳转。
- **FR-004**: 系统 MUST 将 Job 页面的 100 道面试题和 5 个分类标签完整迁移，支持标签筛选和题目详情查看。
- **FR-005**: 所有教学内容数据（Lab 步骤、Code 工具/命令/隐藏功能、Jargon 词条/分类树、Job 题目/标签）MUST 从独立的数据模块中加载，不与 UI 组件逻辑耦合。
- **FR-006**: 数据模块 MUST 提供 TypeScript 类型定义，确保数据结构的类型安全。
- **FR-007**: 系统 MUST 预留 `GET /api/content/modules` 端点，返回所有教学模块的索引列表（id、title、route），为后续教师后台和远程内容管理预留。
- **FR-008**: 迁移后的页面 MUST 保持现有设计系统的暗色终端美学风格，色彩、字体、间距沿用现有规范。
- **FR-009**: 迁移后的页面 MUST 支持响应式布局，确保在最小宽度 1200px 的屏幕上内容不被截断。

### Key Entities

- **ContentModule**: 教学内容模块的元数据（module_id、title、version、route）。
- **LabContent**: Lab 页面的结构化内容（5 个子模块，每个含步骤数据、代码示例、描述文本）。
- **CodeToolContent**: Code 页面的工具目录数据（52 个工具，含 emoji、标题、解释、示例）。
- **JargonEntry**: 黑话词典词条（zh、en、emoji、plain、tech、related 字段）。
- **JobQuestion**: 面试题库题目（id、tag、title、difficulty、company、answer、code、keyPoints、related 字段）。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 迁移后的 4 个页面（Lab、Code、Jargon、Job）所有交互功能与当前静态 Demo 一致，手动回归测试无 P0 缺陷。
- **SC-002**: 内容数据与 UI 组件代码完全分离——修改数据文件后，100% 的情况下页面自动反映更新，无需修改 UI 代码。
- **SC-003**: 迁移后的页面首次加载时间不超过 3 秒（含数据解析）。
- **SC-004**: Jargon 页面层级树展开/折叠操作的响应延迟不超过 100 毫秒。
- **SC-005**: Job 页面在 100 道题全部显示的情况下，标签筛选切换的响应延迟不超过 150 毫秒。
- **SC-006**: TypeScript 类型覆盖率——所有 content modules 有对应的类型定义，编译零错误。

## Assumptions

- 迁移后的页面布局和视觉延续当前设计系统（暗色终端美学），不做重新设计。
- 旧静态 HTML/DC 文件在迁移期间保留在仓库中作为参考，完成验收后再决定是否删除。
- Lab 中的「训练对比」和「函数调用」模块在迁移后仍然是前端模拟演示（不调用真实 LLM API），与当前 Demo 行为一致。
- Code 页面的终端模拟器保持纯前端模拟，不连接真实 Claude Code 实例。
- 数据模块使用 TypeScript/JavaScript 文件格式（与当前 Job.data.js 模式一致），暂不引入数据库或 CMS。
- Job.data.js 约 277KB 大小在可接受范围内，无需拆分。未来超过 500 题再考虑按分类拆分。
