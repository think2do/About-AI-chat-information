# LLM 机制可视化教学工具

> 面向开发者和技术爱好者的交互式 AI 教学网站。通过可视化动画、逐步演示和真实 API 对接，帮助理解大语言模型的运行机制。

更新日期：2026-06-28

---

## 目录

- [一、项目概述](#一项目概述)
- [二、功能模块](#二功能模块)
  - [Chat / Playground](#chat--playground)
  - [实验室](#实验室)
  - [Claude Code](#claude-code)
  - [黑话词典](#黑话词典)
  - [求职](#求职)
- [三、设计规范](#三设计规范)
  - [3.1 色彩系统](#31-色彩系统)
  - [3.2 字体系统](#32-字体系统)
  - [3.3 组件规范](#33-组件规范)
  - [3.4 动效规范](#34-动效规范)
  - [3.5 代码语法高亮](#35-代码语法高亮)
  - [3.6 禁止事项](#36-禁止事项)
- [四、技术架构](#四技术架构)
  - [4.1 文件结构](#41-文件结构)
  - [4.2 DC 框架](#42-dc-框架)
  - [4.3 页面通信](#43-页面通信)
  - [4.4 API 集成](#44-api-集成)
- [五、开发指南](#五开发指南)
  - [5.1 新增页面](#51-新增页面)
  - [5.2 内容维护](#52-内容维护)
  - [5.3 部署](#53-部署)
  - [5.4 注意事项](#54-注意事项)
  - [5.5 协作规范](#55-协作规范)
- [六、迭代方向](#六迭代方向)
- [七、FAQ](#七faq)

---

## 一、项目概述

「LLM 机制可视化教学工具」是一个**纯前端静态网站**，无后端、无数据库、无构建工具。所有文件可直接在浏览器打开，也可部署到任何静态托管服务。

市面上关于 LLM 的教程要么太学术（数学公式堆砌），要么太浅（只告诉你怎么用 ChatGPT）。本工具填补中间地带：**给有技术背景但没有 AI 专业背景的人，提供一个可以亲手操作、实时看到效果的学习工具。**

### 目标用户

- 希望了解 LLM 内部机制的软件工程师
- 想学习 AI 应用开发的设计师和产品经理
- 高校计算机/AI 课程的辅助教学资源
- AI 领域求职者的面试准备工具

### 运营成本

几乎为零 —— 仅域名 + 静态托管费用。用户 AI 对话需自行注册 OpenRouter 并配置 API Key，费用自担（每次约 $0.001–0.01）。未配置 API Key 时 API 调用会直接报错。

---

## 二、功能模块

项目共 5 个页面文件 + 1 个共享导航组件 + 1 个框架运行时 + 1 个共享样式文件 + 1 个外部数据文件。

| 页面 | 文件 | 说明 |
|------|------|------|
| Chat / Playground | `index.html` | 对话 + 7 阶段管道可视化 + 5 参数调节 + Token 概率分布 + 真实 API 对接 |
| 实验室 | `Lab.dc.html` | 5 个子模块：训练对比、函数调用链路、白盒分词实验、模型推理全过程、RAG 检索增强 |
| Claude Code | `Code.dc.html` | 5 个子模块：终端模拟器、Agent 循环解析、52 个工具目录、95 个命令目录、8 个隐藏功能 |
| 黑话词典 | `Jargon.dc.html` | 43 个 AI 术语，6 大分类，支持层级树形展开和关联跳转 |
| 求职 | `Job.dc.html` | 100 道面试题，5 个分类标签（系统架构/模型选型/评测指标/项目挑战/产品策略），含参考回答和解析要点 |
| 共享样式 | `styles.css` | 全局 CSS：重置、滚动条、表单、滑块、关键帧动画 |
| 共享数据 | `Job.data.js` | 面试题库数据文件，独立维护，无需修改页面逻辑 |
| 共享导航 | `Nav.dc.html` | 左侧导航栏 + 全局设置弹窗（API Key 配置） |

### Chat / Playground

`index.html` — 主入口，四栏布局（导航 56px | 管道面板 | 对话面板 | 右侧参数面板 360px）。

**7 阶段管道可视化：**

| 阶段 | 图标 | 内容 |
|------|------|------|
| 1 | `[ ]` | 上下文组装 — 构建 messages 数组，展示 system/user/assistant 消息卡片，含字符数和估算 token 数 |
| 2 | `{ }` | 请求编码 — 序列化为 JSON 请求体，参数变更时高亮对应字段（hlFlash 动画） |
| 3 | `#` | 分词预处理 — Tokenizer 分词可视化，展示 token ID 与类型（中文/英文/数字/标点/空白），含估算偏差 |
| 4 | `⇢` | API 调度 & 模型画像 — 展示 6 项模型架构参数（架构/开发者/层数/隐藏维度/注意力头/上下文窗口）+ MoE/Dense 说明 |
| 5 | `◈` | Transformer 模型推理 — 前向传播示意，逐层扫描动画（layerSweep），层数依模型自动调整显示 |
| 6 | `↻` | 自回归解码 — 逐 token 循环生成，实时展示每一步的输出 token、context 状态，含滚动日志面板 |
| 7 | `✓` | 响应完成 & 指标 — TPS、TTFT、输入/输出 token、费用统计、上下文占用率进度条 |

**支持的模型（9 个，通过 OpenRouter）：**

| 模型 | 层数 | 隐藏维度 | 注意力头 | 上下文 | 架构 |
|------|------|----------|----------|--------|------|
| openai/gpt-4o | ~120 | 未公开 | 未公开 | 128K | MoE |
| openai/gpt-4o-mini | ~80 | 未公开 | 未公开 | 128K | Dense |
| anthropic/claude-sonnet-4 | 未公开 | 未公开 | 未公开 | 200K | Dense |
| anthropic/claude-3-5-haiku | 未公开 | 未公开 | 未公开 | 200K | Dense |
| google/gemini-2.5-flash | 未公开 | 未公开 | 未公开 | 1M | MoE |
| deepseek/deepseek-chat-v3-0324 | 61 | 7168 | 128 | 131K | MoE |
| deepseek/deepseek-r1 | 61 | 7168 | 128 | 131K | MoE |
| meta-llama/llama-3.3-70b-instruct | 80 | 8192 | 64 (GQA 8 KV) | 131K | Dense |
| qwen/qwen3-235b-a22b | 94 | 16384 | 128 (GQA 16 KV) | 131K | MoE |

> 注：OpenAI 和 Anthropic 的模型架构参数未公开，表中为社区推测值。"GQA n KV"表示使用了分组查询注意力。

**功能开关：**

| 开关 | 说明 |
|------|------|
| 🧠 思维链 | 启用后 API 请求携带 `reasoning: true, reasoning_effort: 'medium'`，模型输出思维链推理过程后给出最终回答 |

**可调参数（5 个滑块）：**

| 参数 | 范围 | 步长 | 说明 |
|------|------|------|------|
| Temperature | 0–2 | 0.01 | 越高越随机发散，越低越确定专注 |
| Top-P | 0.01–1 | 0.01 | 核采样截断阈值，过滤低概率候选 token |
| Max Tokens | 16–4096 | 16 | 控制本次生成的最大输出长度 |
| Frequency Penalty | 0–2 | 0.01 | 降低已出现 token 的重复概率 |
| Presence Penalty | 0–2 | 0.01 | 鼓励引入话题中未出现过的词汇 |

**其他特性：**

- 系统提示词编辑（可自定义 system prompt，默认："你是一个专业的 AI 技术助手，请用简洁清晰的中文回答问题。"）
- Token 概率分布可视化：15 个候选 token 的概率条形图，随 Temperature/Top-P/Frequency Penalty/Presence Penalty 滑块动态变化，Top-P 截断线和惩罚项影响实时可见
- 对话轮数/上下文占用统计（含进度条，颜色随占用率变化：绿→橙→红）
- 输入/输出 Token 计数、TPS（tokens/sec）与 TTFT（首字延迟 ms）指标
- 费用估算：按模型实际定价计算（单位 $），显示 6 位小数
- 自回归解码日志面板：步骤编号、token 文本、当前 context 长度，新条目 slideIn 动画
- 多轮对话支持：历史消息含角色标签（用户/AI 助手/AI 助手·思维链）、气泡样式、性能指标
- 对话气泡：用户消息右对齐（`#21262d` 背景），AI 消息左对齐（`#161b22` 背景）

---

### 实验室

`Lab.dc.html` — 5 个子模块（Tab 切换），强调色：蓝色 `#58a6ff`。

| Tab | 内容 | 交互方式 |
|------|------|----------|
| ⚖ 训练对比 | 基座模型 vs SFT 指令微调模型，同问题对比，含逐字流式输出动画。基座模型会"续写偏离"，SFT 模型精准跟随指令 | 输入问题后按回车或点击发送，两侧同时流式生成 |
| 🔗 函数调用 | Function Calling 完整 5 步链路：用户消息 → tool_call → 应用层执行 → 结果回填 → 最终回复 | 点击逐步推进，右侧 320px 面板实时显示 messages[] 数组 |
| 🔬 白盒实验 | Tokenizer 分词效率对比 3 种模式，右侧 280px 速查面板 | 3 个模式按钮切换，主品牌绿 `#00ffa0` 激活态 |
| ⚙ 模型推理全过程 | 从用户输入到模型回复的完整 10 步链路，每步含代码示例 | 点击逐步推进 |
| 🔎 RAG 检索增强 | 索引建立（4 步，蓝色阶段标记）+ 检索生成（6 步，绿色阶段标记），含 RAG vs 无 RAG 对比 | 点击逐步推进 |

**训练对比 Tab 细节：**

- 左右分栏：基座模型（橙色主题，标注"不推荐"）vs SFT 模型（绿色主题，标注"推荐"）
- 输入任意问题，按回车或点发送，两侧同时流式输出
- 基座模型模拟"续写偏离"行为（把问题当训练语料继续生成），SFT 模型精准跟随指令
- 底部固定分析卡片解释训练差异

**函数调用 Tab 细节：**

- 5 步逐步推进，每步含：圆形图标（含角色色标）、标题、内容卡片（代码块或 JSON 高亮）
- 步骤 3（应用层执行函数）使用橙色 `#ffa657` 强调背景，标注"⚡ 应用层代码执行，与模型无关"
- 右侧实时显示 messages[] 数组的演变过程（新增 tool/tool_result 角色的紫色标识）
- 完成后展示关键要点卡片

**白盒实验 Tab 细节：**

- 模式 0：早期模型（~2021）vs 现在模型（~2024+），以"你好"为例，横向条形图对比
- 模式 1：早期模型下中文 vs 英文的分词效率，彩色可视化块展示
- 模式 2：现在模型下中文 vs 英文的分词效率
- 右侧 280px 速查面板：4 个卡片（早期国外/早期国内/现在国外/现在国内），展示 token 倍率

**模型推理全过程 Tab 细节（10 步）：**

| 步骤 | 标题 | 说明 |
|------|------|------|
| 01 | 用户输入 | 用户在客户端输入消息 |
| 02 | 消息封装 messages[] | 拼装 system/user 消息 |
| 03 | API 请求 | HTTP POST 携带 model/temperature 等参数 |
| 04 | Tokenizer 分词 | 中文文本 → token ID 序列 |
| 05 | Embedding 映射 | Token ID → 高维浮点向量 |
| 06 | Transformer 前向传播 | N 层 Self-Attention + FFN |
| 07 | Logits 计算与 Softmax | 词表概率分布 |
| 08 | 采样解码（自回归循环） | 逐 token 循环采样 |
| 09 | 遇到终止条件 | EOS token 或 max_tokens 上限 |
| 10 | 返回响应 | JSON 响应 → 前端展示 |

**RAG Tab 细节（10 步）：**

| 阶段 | 步骤 | 标题 |
|------|------|------|
| 建立索引（蓝） | 01–04 | 原始文档导入 → 文档切割 → Embedding 向量化 → 向量存储入库 |
| 检索生成（绿） | 05–10 | 用户提问 → Query 向量化 → 向量检索+Rank 精排 → 构建增强 Prompt → 大模型推理生成 → 最终答案对比（RAG vs 无 RAG） |

---

### Claude Code

`Code.dc.html` — 5 个子模块。

**⏵ 模拟器 Tab：**

左半部分为 macOS 风格终端窗口（红黄绿三色按钮 + 标题栏 "claude — claude-code-simulator"），11 步逐步演示 Claude Code 的完整工作流；右半部分为 Agent Loop 消息序列图，每步用颜色标签区分角色：

| 标签颜色 | 角色 |
|----------|------|
| `#00ffa0` 绿色 | Claude Code（CC） |
| `#d2a8ff` 紫色 | LLM |
| `#ffa657` 橙色 | Tools |

演示场景："帮我找出项目里所有的 TODO 注释"，完整展示从用户输入 → 系统提示词注入 → 消息组装 → API 调用 → 模型推理 → tool_use 输出 → 工具执行 → 结果回填 → 第二轮 API 调用 → 渲染输出 → 等待下一条指令的 11 步循环。

**↻ Agent 循环 Tab：**

从键盘按下到渲染响应的源码级路径解析，11 个阶段，含源码文件引用：

| 阶段 | 标题 | 源码文件 |
|------|------|----------|
| 1 | Input | `src/input.ts` |
| 2 | Message | `src/messages.ts` |
| 3 | History | `src/history.ts` |
| 4 | System | `src/system.ts` |
| 5 | API | `src/api.ts` |
| 6 | Tokens | `src/tokens.ts` |
| 7 | Tools? | `src/tools.ts` |
| 8 | Loop | `src/loop.ts` |
| 9 | Render | `src/render.ts` |
| 10 | Hooks | `src/hooks.ts` |
| 11 | Await | `src/main.ts` |

每阶段含描述文本 + 代码示例，阶段编号用绿色圆形数字标识（`#00ffa0`）。

**🔧 工具系统 Tab：**

52 个内置工具，按 8 个职能分类。点击工具名在底部弹出详情面板，含 emoji、工具名、中文标题、通俗解释、使用示例。

| 分类 | 数量 | 工具列表 |
|------|------|----------|
| 文件操作 | 6 | FileRead, FileEdit, FileWrite, Glob, Grep, NotebookEdit |
| 代码执行 | 3 | Bash, PowerShell, REPL |
| 搜索 & 抓取 | 4 | WebBrowser 🔒, WebFetch, WebSearch, ToolSearch |
| Agent & 任务 | 11 | Agent, SendMessage, TaskCreate, TaskGet, TaskList, TaskUpdate, TaskStop, TaskOutput, TeamCreate, TeamDelete, ListPeers 🔒 |
| 规划模式 | 5 | EnterPlanMode, ExitPlanMode, EnterWorktree, ExitWorktree, VerifyPlanExecution 🔒 |
| MCP | 4 | mcp, ListMcpResources, ReadMcpResource, McpAuth |
| 系统 | 11 | AskUserQuestion, TodoWrite, Skill, Config, RemoteTrigger 🔒, CronCreate 🔒, CronDelete 🔒, CronList 🔒, Snip 🔒, Workflow 🔒, TerminalCapture 🔒 |
| 实验性 | 8 | Sleep 🔒, SendUserMessage 🔒, StructuredOutput 🔒, LSP 🔒, SendUserFile 🔒, PushNotification 🔒, Monitor 🔒, SubscribePR 🔒 |

> 🔒 = 实验性/特性门控工具，选中时边框和文字变为红色 `#ff7b72`。共 22 个实验性工具。

**/ 命令目录 Tab：**

95 个 slash 命令，按 5 个职能分类。点击命令名在底部弹出详情面板，含 emoji、命令名、中文标题、通俗解释、使用场景。

| 分类 | 数量 | 示例命令 |
|------|------|----------|
| 设置 & 配置 | 12 | /init, /login, /config, /permissions, /model, /theme, /doctor, /mcp, /hooks |
| 日常工作流 | 23 | /compact, /memory, /context, /plan, /resume, /clear, /fast, /effort, /skills, /tasks |
| 代码审查 & Git | 13 | /review, /commit, /commit-push-pr, /diff, /pr_comments, /branch, /security-review |
| 调试 & 诊断 | 23 | /status, /stats, /cost, /usage, /version, /think-back, /rewind, /ctx_viz, /debug-tool-call |
| 高级 & 实验性 | 24 | /advisor, /ultraplan, /remote-control, /teleport, /voice, /sandbox, /plugin, /ide |

**✦ 隐藏功能 Tab：**

8 个实验性功能卡片（2 列网格布局）：

| 功能 | 说明 |
|------|------|
| Buddy | 虚拟宠物，物种和稀有度由账号 ID 派生 |
| Kairos | 持久运行模式，会话间整合记忆，自主后台行动 |
| UltraPlan | Opus 级模型超长规划，最多 30 分钟执行窗口 |
| Coordinator Mode | 主 Agent 拆解任务，并行派遣多个工作 Agent |
| Bridge | 手机或浏览器远程控制 Claude Code |
| Daemon Mode | `--bg` 标志后台运行，tmux 管理持久会话 |
| UDS Inbox | Unix 域套接字实现多会话间通信协作 |
| Auto-Dream | 会话结束后自动回顾、整理学到的知识 |

---

### 黑话词典

`Jargon.dc.html` — 双栏布局（左侧 280px 层级树形导航 + 右侧详情面板）。

**6 大分类（层级树结构，支持分类/子组/词条三级展开）：**

| 分类 | 颜色 | 结构 |
|------|------|------|
| 1. 基础概念 | `#00ffa0` 绿 | 5 个词条：LLM, Token, Tokenizer, Embedding, ContextWindow |
| 2. 模型架构 | `#00ffa0` 绿 | 3 个节点：Transformer（含子词条 Attention）, MoE, Multimodal |
| 3. 训练流程 | `#00ffa0` 绿 | 3 个节点：Pretrain, FineTuning（含 SFT/LoRA）, Alignment（含 RLHF/DPO） |
| 4. 推理与使用 | `#00ffa0` 绿 | 4 个子组：解码参数 → 提示工程 → 工具与智能体 → 推理增强 |
| 5. 应用与工程 | `#00ffa0` 绿 | 4 个节点：RAG, VectorDB, 智能体（含 Agent/AgentLoop/MCP/AgenticAI）, 工程实践（含 ContextEngineering/PromptEngineering/AgentEngineering/Grounding） |
| 6. 局限与问题 | `#ffa657` 橙 | 2 个词条：Hallucination, ContextRot |

**数据统计：**

| 类型 | 数量 |
|------|------|
| 叶子词条（term） | 37 |
| 分组节点（group） | 6（解码参数 / 提示工程 / 工具与智能体 / 推理增强 / 智能体 / 工程实践） |
| **合计条目** | **43** |

**分组节点设计：**

6 个分组节点本身也是可查看的词条，既有展开/折叠功能（管理子节点），也可点击查看自身的解释内容。例如：
- "提示工程"分组：点击左侧 ▸/▾ 展开子节点（Prompt, SystemPrompt, ZeroFewShot, CoT），点击文字选中分组自身查看解释
- "工程实践"分组：展开含 ContextEngineering, PromptEngineering, AgentEngineering, Grounding 四个子词条

**6 个标记为 🔥 2025 新概念：** ContextRot / InferenceScaling / ReasoningModel / AgenticAI / ContextEngineering / AgentEngineering

**词条详情面板：** emoji 图标 + 中文名 + 英文名 + 通俗解释（14px Inter, #c9d1d9）+ 技术解释（12px Inter, #8b949e, 暗色卡片）+ 关联词条（可点击跳转，绿色边框胶囊按钮）

---

### 求职

`Job.dc.html` — 面试题库，双栏布局（左侧 320px 题目列表 + 右侧详情面板），支持标签筛选。

**数据文件分离：** 题目数据存储在 `Job.data.js` 中（`window.JOB_DATA = { QUESTIONS, ALL_TAGS }`），`Job.dc.html` 仅负责 UI 渲染，内容维护无需修改页面文件。

**100 道面试题，5 个分类标签：**

| 分类 | 题目数 | 说明 |
|------|--------|------|
| 🏗️ 系统架构 | 16 | 数字人系统、RAG 架构、产品视觉生成、博客自动化等系统级设计题 |
| 🧠 模型选型 | 28 | 模型对比、场景选型、成本分析、Token 效率、Fine-tuning 策略等 |
| 📊 评测指标 | 26 | 模型评测体系、benchmark 分析、A/B 测试、指标定义与归因 |
| 💡 项目挑战 | 9 | 技术难点攻坚、性能优化、数据治理、团队协作等实践题 |
| 🎯 产品策略 | 21 | 商业模式设计、定价策略、GTM（Go-to-Market）、竞争格局、客户成功 |
| **合计** | **100** | 题目来源：飞书表格「面试题库」 |

**题目 ID 命名规范：**

| 前缀 | 分类 | 编号范围 |
|------|------|----------|
| `sa` | 系统架构 | sa01–sa16 |
| `ms` | 模型选型 | ms01–ms28 |
| `ev` | 评测指标 | ev01–ev26 |
| `pc` | 项目挑战 | pc01–pc09 |
| `ps` | 产品策略 | ps01–ps21 |

**每道题包含：**

| 字段 | 说明 |
|------|------|
| `id` | 唯一标识符（如 `sa01`） |
| `tag` | 分类标签 |
| `title` | 题目正文 |
| `difficulty` | 难度：简单/中等/困难 |
| `company` | 题目来源公司 |
| `tags` | 技术标签数组（如 ['RAG','知识图谱','NLP']） |
| `answer` | 参考回答（多段落，`\n` 分隔） |
| `code` | 代码示例（可选，支持多行） |
| `codeLabel` | 代码块标题 |
| `codeLines` | 代码行数 |
| `keyPoints` | 解析要点数组 |
| `related` | 关联考察点数组 |

**UI 细节：**

- 顶部标签栏：横向滚动（`.tag-scroll` 自定义窄滚动条），每个标签显示 emoji + 名称 + 数量
- 标签选中态：绿色 `#00ffa0` 边框 + 浅绿背景
- 题目列表：左侧 2px 绿色竖线选中指示，编号+标题+难度+公司+✓ 标记
- 详情面板：难度徽章 + 公司名 + 技术标签 → 参考回答（段落式）→ 代码块（带标题栏和行数）→ 解析要点（橙色 `#ffa657` 主题）→ 关联考察点
- 代码块：`#161b22` 背景，`#21262d` 标题栏 + 行数显示，JetBrains Mono 等宽字体

---

## 三、设计规范

整体设计语言：**暗色终端美学**。三个关键词：**克制、精准、有质感**。所有视觉决策服务于「降低信息噪音、突出数据与交互、避免装饰性元素」。

### 3.1 色彩系统

所有颜色必须从以下调色板取用，禁止引入新颜色。

**背景色（由深到浅）：**

| 用途 | 色值 |
|------|------|
| 页面背景 | `#0d1117` |
| 次级背景（侧边栏、右面板） | `#0a0e14` |
| 卡片背景（内容卡片、代码块） | `#161b22` |
| 交互区背景（输入框、按钮） | `#21262d` |
| 分割线 / 边框 | `#30363d` |

**文字色（按信息层级）：**

| 用途 | 色值 |
|------|------|
| 主要文字（标题） | `#e6edf3` |
| 次要文字（正文） | `#c9d1d9` |
| 辅助文字（描述、注释） | `#8b949e` |
| 禁用 / 占位 | `#6e7681` |
| 极弱文字（Label、时间戳） | `#484f58` |

**功能色：**

| 用途 | 色值 | 说明 |
|------|------|------|
| **主品牌绿** | `#00ffa0` | 唯一主强调色，仅用于激活态、关键按钮、核心数据 |
| 蓝色信息 | `#58a6ff` / `#79c0ff` | 链接、数字、Tab 激活 |
| 紫色特殊 | `#d2a8ff` | LLM/模型相关元素 |
| 橙色警告 | `#ffa657` | 工具调用、费用、警示 |
| 红色错误 | `#ff7b72` | 错误状态、危险操作、实验性工具 |
| 成功绿 | `#7ee787` | 完成态、DONE 状态 |

**透明度叠加：** `{色值}08`（极弱）→ `{色值}15`（弱）→ `{色值}30`（中）→ `{色值}60`（强）

### 3.2 字体系统

仅使用两个字体，不得引入其他字体。

| 字体 | 用途 | 来源 |
|------|------|------|
| **JetBrains Mono** | 代码、数据、Label、标签、按钮、数字 | Google Fonts |
| **Inter** | 正文描述、说明性文字 | Google Fonts |

**字号规范：**

| 等级 | 大小 | 字重 | 字体 | 典型场景 |
|------|------|------|------|----------|
| 标题 L | 15–17px | 600 | JetBrains Mono | 模块标题 |
| 标题 M | 13px | 600 | JetBrains Mono | 卡片标题 |
| 正文 | 13–14px | 400 | Inter | 说明文字 |
| 正文小 | 12px | 400 | Inter | 补充说明 |
| Label | 9–10px | 400–500 | JetBrains Mono | 标签、徽章 |
| 微型 | 8–9px | 400 | JetBrains Mono | 时间戳、ID |

**排版原则：** Label 统一 `letter-spacing: 0.06–0.08em`；代码内容统一 JetBrains Mono；行高：正文 `1.6–1.7`，代码 `1.5–1.65`。

### 3.3 组件规范

**导航项：**

| 属性 | 值 |
|------|------|
| 尺寸 | 56×56px 固定 |
| 激活态 | 左侧 2px `#00ffa0` 竖线 + `rgba(0,255,160,0.06)` 背景 + `#00ffa0` 文字 |
| 未激活 | `#6e7681` 文字 + 透明背景 |
| 图标 | 17px emoji |
| 文字 | 9px Inter |
| 跳转方式 | 标准 `<a href>` 超链接 |

**导航项配置：**

| 页面 | emoji | 文字 | href |
|------|-------|------|------|
| Chat | 💬 | Chat | `./index.html` |
| Lab | 🧪 | Lab | `./Lab.dc.html` |
| Code | 🦀 | Code | `./Code.dc.html` |
| 黑话 | 📖 | 名词 | `./Jargon.dc.html` |
| 求职 | 💼 | 求职 | `./Job.dc.html` |
| 设置 | ⚙ | 设置 | 弹窗触发（非链接） |

**Tab 按钮：** padding 5px 12px，border-radius 4px；激活态：border `#58a6ff` + background `rgba(88,166,255,0.12)` + color `#58a6ff`；未激活：border `#30363d` + transparent + `#6e7681`；字体 11px JetBrains Mono；过渡 0.15s ease。

**主操作按钮（如「▶ 运行」）：**

| 状态 | 样式 |
|------|------|
| 正常 | background `#00ffa0`, color `#0d1117`, font 12px 600 JetBrains Mono, border-radius 6px, padding 7px 14px |
| 禁用 | background `#21262d`, color `#6e7681`, opacity 0.7, cursor not-allowed |

**徽章 / 状态标签：** 9px JetBrains Mono, padding 1px 6px, border-radius 3px。

| 状态 | 颜色 |
|------|------|
| PENDING | `#484f58` |
| ACTIVE | `#00ffa0` + blink 动画（1.5s ease infinite） |
| DONE | `#7ee787` |
| NEW | `#ffa657` |
| LIVE | `#00ffa0` |

**卡片：** background `#161b22`，border 1px solid `#21262d`（普通）或 `rgba(0,255,160,0.2)`（强调），border-radius 6–8px，padding 10–16px。

**输入框：** background `#0d1117` 或 `#21262d`，border 1px solid `#30363d`，border-radius 6px，color `#e6edf3`，font 12–13px，outline none，focus 时无额外 outline。

**滑块 (range input)：** 轨道高度 3px，背景 `#30363d`，border-radius 2px；滑块 thumb 13px 圆形 `#00ffa0`，外发光 `0 0 0 3px rgba(0,255,160,0.15)` + `0 0 8px rgba(0,255,160,0.35)`；hover 时外发光增强至 `0 0 0 5px rgba(0,255,160,0.22)` + `0 0 12px rgba(0,255,160,0.5)`。过渡 0.15s ease。

**流程节点（Pipeline Dot，Chat 页使用）：** 28px 圆形；激活：border `#00ffa0` + background `rgba(0,255,160,0.15)` + box-shadow `0 0 10px rgba(0,255,160,0.3)`；完成：border `rgba(0,255,160,0.45)` + background `rgba(0,255,160,0.08)`；待定：border `#30363d` + background `#21262d`；连接线 width 2px，min-height 40px，激活 `rgba(0,255,160,0.4)`，未激活 `#21262d`。过渡 all 0.4–0.5s ease。

**步骤节点（Lab/Code 页使用）：** 36px 圆形（Lab 推理/RAG）或 28px 圆形（Code Agent 循环）；激活：外发光 `0 0 12px` + 对应强调色背景；完成：对应强调色边框 + 浅色背景；待定：`#21262d` + `#30363d` 边框。

**消息气泡（Chat 页）：**

| 角色 | 背景 | 边框 | 圆角 | 对齐 |
|------|------|------|------|------|
| 用户 | `#21262d` | `#30363d` | 8px 8px 2px 8px | flex-end |
| AI 助手 | `#161b22` | `#21262d` | 2px 8px 8px 8px | flex-start |
| AI 助手·思维链 | `#161b22` | `rgba(255,166,87,0.2)` | 2px 8px 8px 8px | flex-start |

思维链思考部分使用 `#ffa657` 颜色，2px 橙色左边框 + `rgba(255,166,87,0.06)` 浅橙背景 + JetBrains Mono 字体。

**滚动条：** width 5px，track 透明，thumb `#30363d`（hover `#484f58`），border-radius 3px。

### 3.4 动效规范

所有关键帧动画定义在 `styles.css` 中：

| 动画 | 效果 | 用途 | 定义位置 |
|------|------|------|----------|
| `slideIn` | translateX 10px → 0，淡入 | 新增步骤、卡片出现 | styles.css |
| `tokenAppear` | translateY 4px → 0, scale 0.92 → 1 | Token 逐个出现 | styles.css |
| `blink` | 透明度 1→0→1，1.06s step-end | 光标闪烁 | styles.css |
| `tpsJump` | scale 1→1.14→1 | 数据更新跳动 | styles.css |
| `hlFlash` | 背景高亮 rgba(0,255,160,0.18) → 透明 | 参数变化高亮（1.5s ease） | styles.css |
| `layerSweep` | 水平扫描光 left -120% → +120% | Transformer 层动画（2s linear infinite） | styles.css |
| `phaseGlow` | box-shadow 呼吸 | 阶段激活提示 | styles.css |
| `fadeUp` | translateY 8px → 0，淡入 | Job 页详情面板出现 | styles.css |

**过渡时间：** 交互反馈 `0.15–0.2s`，状态变化 `0.3–0.4s`，数据更新 `0.5–0.6s`。所有 transition 加 `ease`（扫描动画除外）。不做纯装饰性动画，所有动画必须传递信息。

### 3.5 代码语法高亮

所有代码块的语法高亮通过 `React.createElement` 在 `_fmtJSON` / `_fmtMsgJSON` 方法中实现，使用以下颜色映射：

| 元素 | 颜色 |
|------|------|
| 字符串值 | `#a5d6ff` |
| 数字值 | `#79c0ff` |
| Boolean / null | `#ff7b72` |
| 对象 Key（"role"、"content"等） | `#7ee787` |
| 标点符号（: , { } [ ]） | `#6e7681` |
| 缩进空白 | `#30363d` |
| 激活高亮行背景 | `rgba(0,255,160,0.1)`（+ hlFlash 动画） |
| 消息数组 role 左边框 | `#d2a8ff`（system）, `#79c0ff`（user）, `#7ee787`（assistant）, `#ffa657`（tool） |

### 3.6 禁止事项

- ❌ 不使用渐变背景作为页面底色
- ❌ 不使用 emoji 作为装饰（功能性图标除外）
- ❌ 不引入圆角超过 8px 的大卡片（设置弹窗除外：10px）
- ❌ 不使用阴影（`box-shadow`），发光效果除外（流程节点、步骤节点、滑块 thumb、设置弹窗背景遮罩）
- ❌ 不使用 Inter 以外的无衬线字体
- ❌ 不在非代码区域用 JetBrains Mono 显示大段正文
- ❌ 不新增颜色，哪怕是现有色的轻微变体

---

## 四、技术架构

### 技术栈

- **纯前端静态应用**，无后端、无构建、无 npm 依赖
- 运行时框架：**DC（Design Component）**，基于 React 18.3.1 的自定义轻量框架
- 语言：原生 JavaScript（ES2020+），无 TypeScript，无 JSX
- 样式：Inline Style 为主（每页面模板中直接写 style 对象），提取公共样式到 `styles.css`（仅全局重置、滚动条、表单、keyframes、Job 页专用样式）
- 字体：Google Fonts CDN（JetBrains Mono + Inter）
- 外部 API：OpenRouter（用户自行配置 Key）
- 外部 React：通过 CDN 加载 `react@18.3.1` 和 `react-dom@18.3.1`（UMD 格式，subresource integrity 校验）

### 4.1 文件结构

```
/
├── index.html          # Chat/Playground 主入口（标准 HTML，内嵌 DC 逻辑）
├── Lab.dc.html         # 实验室（5 个子 Tab）
├── Code.dc.html        # Claude Code 页（5 个子 Tab）
├── Jargon.dc.html      # 黑话词典（43 个术语，6 分类层级树）
├── Job.dc.html         # 面试题库 UI（100 道题，数据从 Job.data.js 加载）
├── Job.data.js         # 面试题库数据文件（window.JOB_DATA，独立维护）
├── Nav.dc.html         # 共享导航组件（所有页面引用，勿删）
├── styles.css          # 共享全局样式（重置、滚动条、表单、keyframes）
├── support.js          # DC 框架运行时（自动生成，禁止修改）
└── README.md           # 本文档
```

| 文件 | 类型 | 说明 |
|------|------|------|
| `*.dc.html` | DC 组件页面 | 直接在浏览器打开，DC 框架自动渲染 |
| `index.html` | 标准 HTML 入口 | 通过 `<script type="text/x-dc">` 嵌入 DC 逻辑，非 `.dc.html` 后缀 |
| `Job.data.js` | 纯数据文件 | 暴露 `window.JOB_DATA`，`Job.dc.html` 通过 `<script src>` 加载 |
| `styles.css` | 共享样式 | 所有页面 `<helmet>` 中通过 `<link>` 引用，Nav.dc.html 也引用 |
| `support.js` | 框架运行时 | 由 `dc-runtime/src/*.ts` 构建生成（`bun run build`），**禁止手动修改** |

**核心文件（不可删除）：** 上表除 README.md 外的全部 9 个文件。`Nav.dc.html` 删除会导致所有页面导航消失，`support.js` 删除会导致所有页面白屏，`styles.css` 删除会导致全局样式丢失（滚动条、表单、动画失效）。

### 4.2 DC 框架

#### 框架运行原理

`support.js` 加载后：
1. 通过 CDN 加载 React 18.3.1 和 ReactDOM 18.3.1（带 SRI 校验）
2. 扫描页面中 `<x-dc>` 标签的内容作为模板
3. 扫描 `<script type="text/x-dc" data-dc-script>` 的内容作为逻辑类
4. 将 `<x-dc>` 替换为 `<div id="dc-root">`
5. 编译模板（解析 `{{ }}`、`sc-if`、`sc-for`、`dc-import` 等指令）为 React 渲染函数
6. eval 逻辑类代码（通过 `new Function()` 沙箱执行）
7. 实例化组件并渲染到 DOM
8. 对于 `dc-import` 引用的子组件，自动 fetch 同目录 `.dc.html` 文件并注册

#### 组件结构

每个 `.dc.html` 文件由两部分组成：

```html
<!-- 模板：<x-dc> 标签内，支持 {{ }}、sc-if、sc-for、dc-import -->
<x-dc>
  <helmet>
    <!-- 字体引入、全局样式、外部脚本 -->
    <link rel="stylesheet" href="styles.css">
  </helmet>
  <div> {{ greeting }} </div>
</x-dc>

<!-- 逻辑类：<script type="text/x-dc"> 内 -->
<script type="text/x-dc" data-dc-script>
class Component extends DCLogic {
  state = { count: 0 };
  renderVals() {
    return { greeting: 'Hello' };
  }
}
</script>
```

#### 模板语法

| 语法 | 说明 | 约束 |
|------|------|------|
| `{{ val }}` | 插值，来自 renderVals() 返回值或 props | 只能放变量路径，不能写表达式（如 `{{ a + b }}`） |
| `onClick="{{ handler }}"` | 事件绑定 | 14 个标准事件自动映射（onclick→onClick, onchange→onChange, onkeydown→onKeyDown 等） |
| `style="{{ styleObj }}"` | 样式绑定 | 必须是 JS 对象（camelCase），从 renderVals 返回；也支持纯字符串（自动转对象） |
| `<sc-if value="{{ bool }}">` | 条件渲染 | 必须加 `hint-placeholder-val` 属性，流式渲染时作为占位默认值 |
| `<sc-for list="{{ arr }}" as="item">` | 列表渲染 | 必须加 `hint-placeholder-count` 属性，as 指定迭代变量名；可通过 `$index` 访问索引 |
| `<dc-import name="Nav">` | 引入同目录 .dc.html 子组件 | 必须加 `hint-size` 属性（如 `hint-size="56px,100%"`）；支持通过 `active` 等属性传参 |
| `<helmet>` | 将内容注入 `<head>` | 支持 `<link>`、`<style>`、`<script>` 标签，自动去重（相同 key 不重复注入） |

#### 逻辑类 API

```js
class Component extends DCLogic {
  state = { ... };

  // 生命周期
  componentDidMount()          // DOM 挂载后（适合读取 localStorage、发起 fetch）
  componentDidUpdate(prevProps) // props 更新后
  componentWillUnmount()       // 销毁前（务必清理所有定时器！）

  // 核心方法
  setState(updater)            // 触发重新渲染（支持对象或函数式更新 (prevState) => newState）
  this.props.xxx               // 读取父组件传入的 prop（如 Nav 的 active="chat"）
  this.forceUpdate()           // 强制刷新（不修改 state 但需要重渲染时使用）

  // 必须实现
  renderVals()                 // 返回模板所需的所有值（与 props 合并后传给模板，props 优先）
}
```

#### React 直接调用

模板中 `{{ }}` 的值可以是 React 元素（通过 `React.createElement` 创建），DC 框架会将其作为 React 子节点渲染。这使得：
- JSON 语法高亮（`_fmtJSON`）通过逐行 `React.createElement` 实现颜色编码
- 消息数组可视化（`_fmtMsgJSON`）通过嵌套元素实现角色色标和缩进
- 复杂 UI 可以直接在 `renderVals()` 中动态构建

#### 外部脚本支持

DC 页面可通过在 `<head>` 中（非 `<helmet>` 内）添加 `<script>` 标签加载外部 JS 文件。这些脚本在 DC 框架初始化之前加载，其中的全局变量可在逻辑类的 `renderVals()` 中通过 `window.xxx` 访问。`Job.dc.html` 使用此机制加载 `Job.data.js`：

```html
<script src="./support.js"></script>
<script src="./Job.data.js"></script>  <!-- 暴露 window.JOB_DATA -->
```

### 4.3 页面通信

**导航：** 标准 `<a href>` 超链接，无 SPA 路由，每次跳转完整加载目标页面。

**全局状态：** 仅用户 API 设置跨页共享，存储在 `localStorage['llm_viz_settings']`：

```js
{
  provider: 'openrouter', // openrouter | aihubmix | packy | custom
  providers: {
    openrouter: { apiKey: 'sk-or-v1-...', baseUrl: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o' },
    aihubmix: { apiKey: '', baseUrl: 'https://aihubmix.com/v1', model: '' },
    packy: { apiKey: '', baseUrl: 'https://www.packyapi.com/v1', model: '' },
    custom: { apiKey: '', baseUrl: '', model: '' }
  }
}
```

- **写入：** Nav 设置弹窗点击「保存」时调用 `saveSettings()` → `localStorage.setItem`
- **读取：** index.html 在 `componentDidMount` 中读取；`handleRun` / `_streamReal` 中也实时读取（确保 Nav 保存后无需刷新页面）
- **旧配置兼容：** 若存在旧版 `{ apiKey }`，会自动迁移为 OpenRouter Key 使用

**Nav 导航项与 active prop 对应：**

| 导航项 | 文件 | active prop |
|--------|------|-------------|
| 💬 Chat | `index.html` | `chat` |
| 🧪 Lab | `Lab.dc.html` | `lab` |
| 🦀 Code | `Code.dc.html` | `code` |
| 📖 名词 | `Jargon.dc.html` | `jargon` |
| 💼 求职 | `Job.dc.html` | `job` |

### 4.4 API 集成

仅在 `index.html`（Chat 页）中使用。支持 OpenRouter、AI HubMix、Packy API 和任意 OpenAI-compatible 自定义端点。用户需自行配置对应 Provider 的 API Key、Base URL 和 Model ID。

**流程：**

```
用户点击「▶ 运行」
→ 阶段 1 立即显示（上下文组装）
→ 350ms 阶段 2（请求编码）
→ 700ms 阶段 3（分词预处理）
→ 1050ms 阶段 4（API 调度 & 模型画像）
→ 1550ms 阶段 5（Transformer 推理）+ 同时发起真实 API 请求
→ 首个 token 到达时切换到阶段 6（自回归解码）
→ 流结束时切换到阶段 7（响应完成 & 指标）
```

**API 详情：**

```
端点：POST {baseUrl}/chat/completions
Headers：
  Authorization: Bearer {apiKey}
  Content-Type: application/json
  HTTP-Referer: https://llm-viz.app  // 仅 OpenRouter
  X-Title: LLM Mechanism Viz         // 仅 OpenRouter
Body：
  {
    model, messages, max_tokens, temperature, top_p,
    frequency_penalty, presence_penalty,
    stream: true,
    ...(provider === 'openrouter' && cot ? { reasoning: true, reasoning_effort: 'medium' } : {})
  }
响应：SSE (text/event-stream)
  逐行解析 data: {...} JSON
  提取 delta.content → 累积 fullText → 更新 streamingText
  提取 usage → 更新输入/输出 token 计数
```

**Key 与模型要求：**

- API Key 不要求固定前缀，只要是所选 Provider 可用的 Bearer Token。
- OpenRouter 默认使用现有下拉模型 ID（如 `openai/gpt-4o`）。
- AI HubMix / Packy API / Custom 使用可编辑 Model ID；必须填写当前 Key 有权限访问的模型。
- Packy API 的默认 Base URL 为 `https://www.packyapi.com/v1`；AI HubMix 默认 Base URL 为 `https://aihubmix.com/v1`，均可在设置中覆盖。Packy 如需优化线路，可按官方文档改用 `https://api-slb.packyapi.com/v1`；AI HubMix 如遇主域名访问问题，可改用备用域名 `https://api.inferera.com/v1`。

**缺少 API Key / Base URL / Model ID 时：** 前端直接显示带 `❌` 前缀的错误气泡，不会发送无效请求。

**模型定价（$ / 1M tokens，代码中硬编码）：**

| 模型 | 输入价格 | 输出价格 |
|------|----------|----------|
| gpt-4o | $5.00 | $15.00 |
| gpt-4o-mini | $0.15 | $0.60 |
| claude-sonnet-4 | $3.00 | $15.00 |
| claude-3-5-haiku | $0.80 | $4.00 |
| gemini-2.5-flash | $0.15 | $0.60 |
| deepseek-chat-v3 | $0.27 | $1.10 |
| deepseek-r1 | $0.55 | $2.19 |
| llama-3.3-70b | $0.12 | $0.30 |
| qwen3-235b | $0.23 | $0.90 |

---

## 五、开发指南

### 5.1 新增页面

1. **创建 `.dc.html` 文件**（命名：英文大驼峰，如 `FineTuning.dc.html`），包含：
   - `<script src="./support.js"></script>` 在 `<head>` 中（非 helmet 内）
   - `<x-dc>` 模板（含 `<helmet>` 引入 `styles.css` 和 Google Fonts）
   - `<script type="text/x-dc" data-dc-script>` 逻辑类
2. **在 `Nav.dc.html` 注册导航项**：
   - 模板中加 `<a href="./FineTuning.dc.html">` 链接
   - `renderVals` 中加对应的 `NS('finetuning')` 导航样式
   - 更新 `data-props` 中 active 的 `options` 枚举
3. **无需构建**：直接在浏览器打开 `.dc.html` 即可预览
4. **选定强调色**：从已有蓝/紫/橙中选一个作为新功能区的次要强调色，不扩展全局调色板

### 5.2 内容维护

不同页面的内容维护方式和编辑文件：

| 维护内容 | 编辑文件 | 数据结构 | 字段 |
|----------|----------|----------|------|
| **黑话词典** | `Jargon.dc.html` | `JARGON_DATA` 对象 | `zh, en, emoji, plain, tech, related[], isNew` |
| **黑话分类树** | `Jargon.dc.html` | `JARGON_TREE` 数组 | `id, label, sub, color, children[]` |
| **面试题库** | `Job.data.js` | `QUESTIONS` 数组 | `id, tag, title, difficulty, company, tags[], answer, code, codeLabel, codeLines, keyPoints[], related[]` |
| **面试题分类** | `Job.data.js` | `ALL_TAGS` 数组 | `key, label, emoji` |
| **工具目录** | `Code.dc.html` | `TOOL_DESCS` 对象 | `emoji, title, plain, example` |
| **工具分类** | `Code.dc.html` | `TOOL_CATS` 数组 | `name, tools[], exp[]`（实验性工具加入 exp 列表） |
| **命令目录** | `Code.dc.html` | `CMD_DESCS` 对象 | `emoji, title, plain, example` |
| **命令分类** | `Code.dc.html` | `CMD_CATS` 数组 | `name, cmds[], exp[]`（实验性命令加入 exp 列表） |
| **隐藏功能** | `Code.dc.html` | `hiddenFeatures` 数组 | `name, desc` |
| **Lab 推理步骤** | `Lab.dc.html` | `INFER_STEPS` 数组 | `num, icon, title, desc, code` |
| **Lab RAG 步骤** | `Lab.dc.html` | `RAG_STEPS` 数组 | `num, icon, title, desc, code, phase, phaseColor` |
| **模型架构数据** | `index.html` | `_modelArch` 方法中的 `DB` 对象 | `layers, hidden, heads, kvHeads, ctxWindow, isMoE, arch, family` |
| **模型定价** | `index.html` | `renderVals` 中的 `prices` 对象 | 输入/输出价格数组 `[ip, op]`（$ / 1M tokens） |

**面试题库新增题目规范：**
- `id` 使用分类前缀 + 编号：`sa`（系统架构）、`ms`（模型选型）、`ev`（评测指标）、`pc`（项目挑战）、`ps`（产品策略）
- `tag` 必须与 `ALL_TAGS` 中的 key 匹配
- `answer` 字段支持 `\n` 换行，渲染时自动拆分为段落
- `keyPoints` 为字符串数组，渲染为橙色 `▸` 列表
- `related` 为字符串数组，渲染为标签胶囊

**黑话词典新增词条规范：**
- 叶子词条（term）：在 `JARGON_DATA` 中添加条目，在 `JARGON_TREE` 对应分类的 `children` 中添加 `{ type:'term', key:'YourKey' }`
- 分组节点（group）：在 `JARGON_DATA` 中添加条目（包含完整解释），在 `JARGON_TREE` 中添加 `{ type:'group', key:'YourGroupKey', children:[...] }`
- `related` 字段可引用其他词条 key 或分组 key（如 `'grp_prompteng'`）

### 5.3 部署

纯静态文件，直接上传到任意托管服务：

```
# Vercel / Netlify：拖拽文件夹即可
# Nginx：
server {
  root /var/www/llm-viz;
  index index.html;
  location / { try_files $uri $uri/ =404; }
}
```

无需 Node.js、无需构建、无需 package.json。所有 9 个文件（5 个页面文件 + Nav + styles.css + Job.data.js + support.js）必须同目录部署。

### 5.4 注意事项

1. **不要在模板 `{{ }}` 里写表达式**，会静默失败。所有计算放 `renderVals()`
2. **定时器必须在 `componentWillUnmount` 清理**，否则组件销毁后继续跑会导致 setState 报错。使用 `_timers` 数组统一管理
3. **async 方法可直接写在 class 里**，但不能将 await 结果直接写入模板，要通过 setState → renderVals 路径
4. **`sc-if` 和 `sc-for` 必须加 hint 属性**，否则流式渲染时布局抖动：
   - `sc-if` 加 `hint-placeholder-val="{{ true/false }}"`
   - `sc-for` 加 `hint-placeholder-count="预估数量"`
5. **不要修改 `support.js`**，该文件由 DC 框架自动管理，重新构建会覆盖
6. **`index.html` 不是 `.dc.html`**，它是标准 HTML 入口，通过 `<script type="text/x-dc">` 嵌入 DC 逻辑
7. **`Nav.dc.html` 中 `data-props` 属性**包含 active 的枚举定义 (`options: ["chat","lab","code","jargon"]`) 和默认值，新增页面时需更新
8. **`styles.css` 是共享样式**，所有页面 `<helmet>` 中引用。修改时注意全局影响——全局重置、滚动条、表单元素、range input、所有 keyframes 动画均在此定义
9. **`Job.data.js` 文件较大（~277KB，100 题）**，加载时存在网络开销。如未来扩展到 500+ 题，建议拆分为多个文件或考虑按需加载
10. **React 通过 CDN unpkg 加载**，首次访问需下载 ~140KB（gzip 后约 45KB），浏览器会缓存

### 5.5 协作规范

**分支策略：**
- `main` 分支为稳定版本
- 功能开发使用 feature 分支（如 `feat/new-page`, `feat/add-jargon-terms`）
- 内容更新（面试题、词条）可直接在 main 提交

**文件修改职责划分：**

| 角色 | 可修改文件 | 说明 |
|------|-----------|------|
| **内容贡献者** | `Jargon.dc.html`（数据部分）, `Job.data.js` | 新增词条、面试题 |
| **功能开发者** | `*.dc.html`（逻辑 + 模板）, `styles.css` | 新增页面、交互功能、样式 |
| **维护者** | 全部文件 | Review PR、版本管理 |
| **禁止手动修改** | `support.js` | 框架运行时，由 dc-runtime 构建 |

**PR Review 清单：**
- [ ] 新增 emoji 是否与上下文匹配（功能性图标）
- [ ] 是否新增了调色板外的颜色
- [ ] `dc-import` 是否包含 `hint-size` 属性
- [ ] `sc-if`/`sc-for` 是否包含 hint 属性
- [ ] 定时器是否在 `componentWillUnmount` 中清理
- [ ] 模板 `{{ }}` 中是否写了表达式（应放到 renderVals）
- [ ] `Job.data.js` 中新增题目的 id 是否符合命名规范

---

## 六、迭代方向

### 高优先级
1. **多轮对话优化** — 支持历史消息的可视化回放；当前多轮对话的历史消息可查看但无专门回放界面
2. **黑话词典持续扩充** — 当前 43 个条目（37 词条 + 6 分组），目标 100+
3. **移动端适配** — 当前为桌面端设计，最小宽度约 1200px，三/四栏布局在小屏幕上压缩严重

### 中优先级
4. **Lab 新增模块** — RLHF 训练可视化（Reward Model 打分 → PPO 优化）、MoE 路由机制演示（Router 网络可视化）
5. **多语言支持** — 目前全中文界面，可加英文版本（i18n 方案：数据层双份，UI 通过 renderVals 切换）
6. **用户进度记忆** — 记录 Lab 各模块的学习进度（localStorage），面试题的完成状态

### 低优先级
7. **内容分享** — 生成分享链接（URL hash 编码选中的词条/题目）
8. **暗/亮主题切换** — 当前仅有暗色主题，可加 GitHub 风格的亮色模式
9. **面试题库搜索** — 100 道题的手动浏览效率下降，加全文搜索

### 工期参考

| 类型 | 工时 | 示例 |
|------|------|------|
| 纯内容扩充（新增词条/面试题） | 0.5–1h/条 | 黑话词典、题库 |
| 数据重构（分类树调整） | 2–4h | 黑话词典树形层级改造 |
| 简单交互页（新增 Tab） | 4–8h | Lab 新增模块 |
| 数据文件分离 | 1–2h | Job.data.js 提取 |
| 带动画的可视化页（RAG 链路级） | 1–2 天 | 自定义流程演示 |
| 带真实 API 集成的功能页 | 2–3 天 | Chat 页 API 对接 |

---

## 七、FAQ

**Q：用户使用有费用吗？**
A：工具本身免费。真实 AI 对话需用户自行注册 OpenRouter 并充值（约 $0.001–0.01/次）。未配置 API Key 时 API 调用会失败，页面显示 "❌ API 错误 401" 或类似错误提示。

**Q：收集用户数据吗？**
A：不收集。纯静态网页，API Key 仅存用户浏览器 localStorage 中。

**Q：内容更新需要程序员吗？**
A：面试题库和黑话词典的内容更新只需编辑 `Job.data.js`（JavaScript 对象数组）或 `Jargon.dc.html`（JARGON_DATA 对象），门槛较低。但新增页面、修改交互逻辑需要前端开发能力。

**Q：可以嵌入到其他网站吗？**
A：技术上可通过 `<iframe>` 嵌入，但未做嵌入场景适配（导航链接使用完整 `./xxx.html` 路径）。

**Q：如何确认线上版本是最新的？**
A：查看部署平台最后部署时间。无服务端，不存在缓存穿透问题（静态文件可直接对比 hash）。

**Q：为什么有些页面加载时会短暂显示占位符（shimmer 动画）？**
A：DC 框架支持流式渲染。当 `dc-import` 引用的子组件（如 Nav）尚未完成 fetch 时，会显示带 shimmer 动画的占位符，加载完成后自动替换。这是框架正常行为。

**Q：support.js 从哪里来？**
A：由 DC 框架源码 `dc-runtime/src/*.ts` 经 `bun run build` 构建生成。该文件集成了 React CDN 加载、模板编译、表达式解析、组件生命周期管理、CSS in JS（pseudo class sheet）、helmet 管理、外部模块加载（x-import）等全部运行时能力，约 1600 行。

**Q：为什么 Job.data.js 这么大？**
A：包含 100 道完整面试题，每题含多段落参考回答、代码示例、解析要点（5 点左右）、关联考察点。平均每题约 2.7KB。未来题目数增长可考虑按分类拆分为多个数据文件。

**Q：如何参与贡献？**
A：参考 [五、开发指南](#五开发指南) 和 [5.5 协作规范](#55-协作规范)。内容贡献者可直接编辑 `Job.data.js` 或 `Jargon.dc.html` 的数据部分提交 PR；功能开发者建议先开 Issue 讨论方案再提交 PR。首次参与建议从新增面试题或黑话词条入手。
