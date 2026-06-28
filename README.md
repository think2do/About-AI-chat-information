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

### 运营成本

几乎为零 —— 仅域名 + 静态托管费用。用户 AI 对话需自行注册 OpenRouter 并配置 API Key，费用自担（每次约 $0.001–0.01）。

---

## 二、功能模块

项目共 5 个页面文件 + 1 个共享导航组件 + 1 个框架运行时。

| 页面 | 文件 | 说明 |
|------|------|------|
| Chat / Playground | `index.html` | 对话 + 7 阶段管道可视化 + 参数调节 + Token 概率分布 + 真实 API 对接 |
| 实验室 | `Lab.dc.html` | 5 个子模块：训练对比、函数调用链路、白盒分词实验、模型推理全过程、RAG 检索增强 |
| Claude Code | `Code.dc.html` | 5 个子模块：终端模拟器、Agent 循环解析、52 个工具目录、95 个命令目录、8 个隐藏功能 |
| 黑话词典 | `Jargon.dc.html` | 37 个 AI 术语，5 个分类，支持树形浏览和关联跳转 |
| 求职 | `Job.dc.html` | 13 道面试题，5 个分类标签（前端/算法/系统设计/计算机基础/行为面试），含参考回答和解析要点 |
| 共享导航 | `Nav.dc.html` | 左侧导航栏 + 全局设置弹窗（API Key 配置） |

### Chat / Playground

`index.html` — 主入口，三栏布局（导航 56px | 左：管道面板 | 右：对话面板 | 最右：参数面板 360px）。

**7 阶段管道可视化：**

| 阶段 | 图标 | 内容 |
|------|------|------|
| 1 | `[ ]` | 上下文组装 — 构建 messages 数组，展示 system/user/assistant 消息卡片 |
| 2 | `{ }` | 请求编码 — 序列化为 JSON 请求体，参数高亮联动 |
| 3 | `#` | 分词预处理 — Tokenizer 分词可视化，展示 token ID 与类型（中文/英文/数字/标点） |
| 4 | `⇢` | API 调度 & 模型画像 — 展示模型架构参数（层数/维度/注意力头/上下文/GQA/MoE） |
| 5 | `◈` | Transformer 模型推理 — 前向传播示意，逐层扫描动画 |
| 6 | `↻` | 自回归解码 — 逐 token 循环生成，实时展示每一步的输出 token 和上下文状态 |
| 7 | `✓` | 响应完成 & 指标 — TPS、TTFT、输入/输出 token、费用统计、上下文占用率 |

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

> 注：OpenAI 和 Anthropic 的模型架构参数未公开，表中为社区推测值。标注 "GQA n KV" 表示使用了分组查询注意力（Grouped Query Attention）。

**功能开关：**

| 开关 | 说明 |
|------|------|
| 🧠 思维链 | 启用后 API 请求携带 `reasoning: true`，模型输出思维链推理过程后再给出最终回答 |

**可调参数（5 个滑块）：**

| 参数 | 范围 | 步长 | 说明 |
|------|------|------|------|
| Temperature | 0–2 | 0.01 | 越高越随机发散，越低越确定专注 |
| Top-P | 0.01–1 | 0.01 | 核采样截断阈值，过滤低概率候选 token |
| Max Tokens | 16–4096 | 16 | 控制本次生成的最大输出长度 |
| Frequency Penalty | 0–2 | 0.01 | 降低已出现 token 的重复概率 |
| Presence Penalty | 0–2 | 0.01 | 鼓励引入话题中未出现过的词汇 |

**其他特性：** 系统提示词编辑、Token 概率分布可视化（随滑块动态变化）、对话轮数/上下文占用统计、输入/输出 Token 计数、TPS 与 TTFT 指标、费用估算（按模型实际定价计算，单位 $）

### 实验室

`Lab.dc.html` — 5 个子模块（Tab 切换）。

| Tab | 内容 | 交互方式 |
|------|------|----------|
| ⚖ 训练对比 | 基座模型 vs SFT 指令微调模型，同问题对比，含逐字流式输出动画 | 输入问题后按回车，两侧同时流式生成 |
| 🔗 函数调用 | Function Calling 完整链路：用户消息 → tool_call → 应用层执行 → 结果回填 → 最终回复 | 5 步逐步推进，右侧实时显示 messages[] |
| 🔬 白盒实验 | Tokenizer 分词效率对比：3 种模式（早期 vs 现在 / 早期中文 vs 英文 / 现在中文 vs 英文），含可视化条形图 | 3 个模式按钮切换 |
| ⚙ 模型推理全过程 | 从用户输入到模型回复的完整 10 步链路，每步含代码示例 | 点击逐步推进，10 步完成 |
| 🔎 RAG 检索增强 | 索引建立（4 步）+ 检索生成（6 步），含 RAG vs 无 RAG 对比 | 点击逐步推进，10 步完成 |

### Claude Code

`Code.dc.html` — 5 个子模块。

| Tab | 内容 |
|------|------|
| ⏵ 模拟器 | 终端模拟器（macOS 窗口风格，含红黄绿按钮）+ Agent Loop 消息序列图，11 步逐步演示 |
| ↻ Agent 循环 | Claude Code 源码路径解析，从 Input → Message → History → System → API → Tokens → Tools? → Loop → Render → Hooks → Await 共 11 个阶段（含源码文件引用） |
| 🔧 工具系统 | 52 个内置工具，按 8 个职能分类（文件操作/代码执行/搜索&抓取/Agent&任务/规划模式/MCP/系统/实验性），点击工具名查看详细解释和示例 |
| / 命令目录 | 95 个 slash 命令，按 5 个职能分类（设置&配置/日常工作流/代码审查&Git/调试&诊断/高级&实验性），点击命令查看详细解释和使用场景 |
| ✦ 隐藏功能 | 8 个实验性功能展示（Buddy/Kairos/UltraPlan/Coordinator Mode/Bridge/Daemon Mode/UDS Inbox/Auto-Dream） |

**52 个工具按分类：**

| 分类 | 数量 | 示例 |
|------|------|------|
| 文件操作 | 6 | FileRead, FileEdit, FileWrite, Glob, Grep, NotebookEdit |
| 代码执行 | 3 | Bash, PowerShell, REPL |
| 搜索 & 抓取 | 4 | WebBrowser 🔒, WebFetch, WebSearch, ToolSearch |
| Agent & 任务 | 11 | Agent, SendMessage, TaskCreate, TaskGet, TaskList, TaskUpdate, TaskStop, TaskOutput, TeamCreate, TeamDelete, ListPeers 🔒 |
| 规划模式 | 5 | EnterPlanMode, ExitPlanMode, EnterWorktree, ExitWorktree, VerifyPlanExecution 🔒 |
| MCP | 4 | mcp, ListMcpResources, ReadMcpResource, McpAuth |
| 系统 | 11 | AskUserQuestion, TodoWrite, Skill, Config, RemoteTrigger 🔒, CronCreate 🔒, CronDelete 🔒, CronList 🔒, Snip 🔒, Workflow 🔒, TerminalCapture 🔒 |
| 实验性 | 8 | Sleep 🔒, SendUserMessage 🔒, StructuredOutput 🔒, LSP 🔒, SendUserFile 🔒, PushNotification 🔒, Monitor 🔒, SubscribePR 🔒 |

> 🔒 表示实验性/特性门控工具，需开启对应 Feature Flag 或环境变量才可使用。

**95 个命令按分类：**

| 分类 | 数量 | 示例 |
|------|------|------|
| 设置 & 配置 | 12 | /init, /login, /config, /permissions, /model, /theme, /doctor, /mcp, /hooks |
| 日常工作流 | 23 | /compact, /memory, /context, /plan, /resume, /clear, /fast, /effort, /skills, /tasks |
| 代码审查 & Git | 13 | /review, /commit, /commit-push-pr, /diff, /pr_comments, /branch, /security-review |
| 调试 & 诊断 | 23 | /status, /stats, /cost, /usage, /version, /think-back, /rewind, /ctx_viz, /debug-tool-call |
| 高级 & 实验性 | 24 | /advisor, /ultraplan, /remote-control, /teleport, /voice, /sandbox, /plugin, /ide |

### 黑话词典

`Jargon.dc.html` — 双栏布局（左侧树形导航 + 右侧详情面板）。

| 分类 | 词条数 |
|------|--------|
| 🧠 基础概念 | 8 |
| 📚 训练阶段 | 7 |
| 💬 推理与调用 | 8 |
| ◈ 架构 | 4 |
| 🚀 应用与职业 | 10 |
| **合计** | **37** |

每个词条含：emoji 图标、中文名、英文名、通俗解释、技术解释、关联词条。其中 6 个标记为 🔥 2025 新概念（ContextRot / InferenceScaling / ReasoningModel / AgenticAI / ContextEngineering / AgentEngineering）。

### 求职

`Job.dc.html` — 面试题库，双栏布局（左侧题目列表 + 右侧详情面板），支持标签筛选。

| 分类 | 题目数 |
|------|--------|
| 🎨 前端开发 | 4 |
| 📐 算法 | 3 |
| 🏗️ 系统设计 | 2 |
| 💻 计算机基础 | 2 |
| 🤝 行为面试 | 2 |
| **合计** | **13** |

每道题含：难度徽章、公司来源、题目正文、参考回答（多段落）、代码示例（如适用，含行数和语言标签）、解析要点（要点列表）、关联考察点。

**题目明细：**

| # | 题目 | 难度 | 来源 |
|---|------|------|------|
| 1 | React 虚拟 DOM 的工作原理及性能优化 | 中等 | 字节跳动 |
| 2 | JavaScript 事件循环（Event Loop） | 中等 | 阿里巴巴 |
| 3 | 浏览器从输入 URL 到页面渲染的完整过程 | 中等 | 腾讯 |
| 4 | Vue 响应式原理及与 React 的根本区别 | 中等 | 美团 |
| 5 | 实现 LRU 缓存淘汰算法（O(1) 复杂度） | 中等 | 字节跳动 |
| 6 | 无序数组中找出第 K 大元素（优于 O(n log n)） | 中等 | 阿里巴巴 |
| 7 | 手写防抖（debounce）和节流（throttle）函数 | 简单 | 腾讯 |
| 8 | 设计一个短链接系统（支持高并发） | 困难 | 字节跳动 |
| 9 | 设计一个实时聊天系统（如微信/WhatsApp） | 困难 | 腾讯 |
| 10 | 进程与线程的区别，协程又是什么 | 中等 | 美团 |
| 11 | TCP 三次握手和四次挥手 | 中等 | 阿里巴巴 |
| 12 | 分享一个你解决过的技术难题（STAR 法则） | 中等 | 通用 |
| 13 | 与同事在技术方案上有分歧时怎么处理 | 简单 | 通用 |

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
| 红色错误 | `#ff7b72` | 错误状态、危险操作 |
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

**导航项：** 56×56px 固定；激活态：左侧 2px `#00ffa0` 竖线 + `rgba(0,255,160,0.06)` 背景 + `#00ffa0` 文字；未激活：`#6e7681`；图标 17px emoji，文字 9px Inter。

**导航项配置：**

| 页面 | emoji | 文字 |
|------|-------|------|
| Chat | 💬 | Chat |
| Lab | 🧪 | Lab |
| Code | 🦀 | Code |
| 黑话 | 📖 | 名词 |
| 求职 | 💼 | 求职 |

**Tab 按钮：** padding 5px 12px，border-radius 4px；激活态：border `#58a6ff` + background `rgba(88,166,255,0.12)` + color `#58a6ff`；未激活：border `#30363d` + transparent + `#6e7681`；字体 11px JetBrains Mono。

**主操作按钮（如「▶ 运行」）：** background `#00ffa0`，color `#0d1117`（确保对比度），font 12px 600 JetBrains Mono，border-radius 6px，padding 7px 14px。禁用态：background `#21262d` + color `#6e7681` + opacity 0.7。

**徽章 / 状态标签：** 9px JetBrains Mono，padding 1px 6px，border-radius 3px。PENDING：`#484f58`，ACTIVE：`#00ffa0` + blink 动画，DONE：`#7ee787`，NEW：`#ffa657`，LIVE：`#00ffa0`。

**卡片：** background `#161b22`，border 1px solid `#21262d`（普通）或 `rgba(0,255,160,0.2)`（强调），border-radius 6–8px，padding 10–16px。

**输入框：** background `#0d1117` 或 `#21262d`，border 1px solid `#30363d`，border-radius 6px，color `#e6edf3`，font 12–13px，outline none。

**滑块 (range input)：** 轨道高度 3px，背景 `#30363d`；滑块 13px 圆形 `#00ffa0`，带外发光 `box-shadow: 0 0 0 3px rgba(0,255,160,0.15)`；hover 时发光增强。

**流程节点（Pipeline Dot）：** 28px 圆形；激活：border `#00ffa0` + background `rgba(0,255,160,0.15)` + box-shadow `0 0 10px rgba(0,255,160,0.3)`；完成：border `rgba(0,255,160,0.45)` + background `rgba(0,255,160,0.08)`；待定：border `#30363d` + background `#21262d`；连接线 width 2px，激活 `rgba(0,255,160,0.4)`，未激活 `#21262d`。

**步骤节点（Lab/Code 使用）：** 36px 圆形；激活：外发光 `0 0 12px` + 对应强调色背景；完成：对应强调色边框 + 浅色背景；待定：`#21262d` + `#30363d` 边框。

### 3.4 动效规范

| 动画 | 效果 | 用途 |
|------|------|------|
| `slideIn` | translateX 10px → 0，淡入 | 新增步骤、卡片出现 |
| `tokenAppear` | 下方缩放淡入 | Token 逐个出现 |
| `blink` | 透明度 1→0→1，1.06s step-end | 光标闪烁 |
| `tpsJump` | scale 1→1.14→1 | 数据更新跳动 |
| `hlFlash` | 背景高亮渐隐 | 参数变化高亮 |
| `layerSweep` | 水平扫描光 | Transformer 层动画 |
| `phaseGlow` | 外发光呼吸 | 阶段激活提示 |

**过渡时间：** 交互反馈 `0.15–0.2s`，状态变化 `0.3–0.4s`，数据更新 `0.5–0.6s`。所有 transition 加 `ease`（扫描动画除外）。不做纯装饰性动画，所有动画必须传递信息。

### 3.5 代码语法高亮

| 元素 | 颜色 |
|------|------|
| 字符串值 | `#a5d6ff` |
| 数字值 | `#79c0ff` |
| Boolean / null | `#ff7b72` |
| 对象 Key | `#7ee787` |
| 标点符号 | `#6e7681` |
| 缩进空白 | `#30363d` |
| 激活高亮行背景 | `rgba(0,255,160,0.1)` |

### 3.6 禁止事项

- ❌ 不使用渐变背景作为页面底色
- ❌ 不使用 emoji 作为装饰（功能性图标除外）
- ❌ 不引入圆角超过 8px 的大卡片
- ❌ 不使用阴影（`box-shadow`），发光效果除外
- ❌ 不使用 Inter 以外的无衬线字体
- ❌ 不在非代码区域用 JetBrains Mono 显示大段正文
- ❌ 不新增颜色，哪怕是现有色的轻微变体

---

## 四、技术架构

### 技术栈

- **纯前端静态应用**，无后端、无构建、无 npm 依赖
- 运行时框架：**DC（Design Component）**，基于 React 18.3.1 的自定义轻量框架
- 语言：原生 JavaScript（ES2020+），无 TypeScript，无 JSX
- 样式：纯 Inline Style（无 CSS 文件，`Job.dc.html` 和 `Nav.dc.html` 含少量 `<style>` 块用于动画定义和全局 reset）
- 字体：Google Fonts CDN（JetBrains Mono + Inter）
- 外部 API：OpenRouter（用户自行配置 Key）

### 4.1 文件结构

```
/
├── index.html          # Chat/Playground 主入口（标准 HTML，内嵌 DC 逻辑）
├── Lab.dc.html         # 实验室（5 个子 Tab）
├── Code.dc.html        # Claude Code 页（5 个子 Tab）
├── Jargon.dc.html      # 黑话词典（37 个词条）
├── Job.dc.html         # 面试题库（13 道题）
├── Nav.dc.html         # 共享导航组件（所有页面引用，勿删）
├── support.js          # DC 框架运行时（自动生成，禁止修改）
└── README.md           # 本文档
```

| 文件 | 类型 | 说明 |
|------|------|------|
| `*.dc.html` | DC 组件页面 | 直接在浏览器打开，DC 框架自动渲染 |
| `index.html` | 标准 HTML 入口 | 通过 `<script type="text/x-dc">` 嵌入 DC 逻辑，非 `.dc.html` 后缀 |
| `support.js` | 框架运行时 | 由 `dc-runtime/src/*.ts` 构建生成（`bun run build`），**禁止手动修改** |

**核心文件（不可删除）：** 上表除 README.md 外的全部 7 个文件。`Nav.dc.html` 删除会导致所有页面导航消失，`support.js` 删除会导致所有页面白屏。

### 4.2 DC 框架

#### 组件结构

每个 `.dc.html` 文件由两部分组成：

```html
<!-- 模板：<x-dc> 标签内，支持 {{ }}、sc-if、sc-for、dc-import -->
<x-dc>
  <helmet><!-- 字体引入、全局样式 --></helmet>
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
| `{{ val }}` | 插值，来自 renderVals() | 只能放变量路径，不能写表达式 |
| `onClick="{{ handler }}"` | 事件绑定 | 14 个标准事件自动映射（onclick→onClick 等） |
| `style="{{ styleObj }}"` | 样式绑定 | 必须是 JS 对象（camelCase），从 renderVals 返回；也支持纯字符串（自动转对象） |
| `<sc-if value="{{ bool }}">` | 条件渲染 | 必须加 `hint-placeholder-val` 属性，流式渲染时作为占位默认值 |
| `<sc-for list="{{ arr }}" as="item">` | 列表渲染 | 必须加 `hint-placeholder-count` 属性 |
| `<dc-import name="Nav">` | 引入同目录 .dc.html 子组件 | 必须加 `hint-size` 属性，如 `hint-size="56px,100%"` |
| `<helmet>` | 将内容注入 `<head>` | 支持 `<link>`、`<style>`、`<script>` 等标签，自动去重 |

#### 逻辑类 API

```js
class Component extends DCLogic {
  state = { ... };

  // 生命周期
  componentDidMount()       // DOM 挂载后
  componentDidUpdate(prev)  // props 更新后
  componentWillUnmount()    // 销毁前（务必清理定时器！）

  // 核心方法
  setState(updater)         // 触发重新渲染（支持函数式更新）
  this.props.xxx            // 读取父组件传入的 prop（Nav 使用 active="xxx"）
  this.forceUpdate()        // 强制刷新

  // 必须实现
  renderVals()              // 返回模板所需的所有值（与 props 合并后传给模板）
}
```

#### React 直接调用

模板中 `{{ }}` 的值可以是 React 元素（通过 `React.createElement` 创建），DC 框架会将其作为 React 子节点渲染。这使得复杂 UI（如 JSON 语法高亮、动态消息列表）可以直接在 `renderVals()` 中通过 `React.createElement` 构建。

### 4.3 页面通信

**导航：** 标准 `<a href>` 超链接，无 SPA 路由，每次跳转完整加载目标页面。

**全局状态：** 仅用户 API 设置跨页共享，存储在 `localStorage['llm_viz_settings']`：

```js
{ apiKey: 'sk-or-v1-...' }
```

- **写入：** Nav 设置弹窗保存时写入 localStorage
- **读取：** index.html 在 `componentDidMount` 中读取（同时也实时读取以支持免刷新）
- **跨 Tab 同步：** `window.addEventListener('storage', ...)` 实现

**Nav 导航项与 active 值对应：**

| 导航项 | 文件 | active prop |
|--------|------|-------------|
| 💬 Chat | `index.html` | `chat` |
| 🧪 Lab | `Lab.dc.html` | `lab` |
| 🦀 Code | `Code.dc.html` | `code` |
| 📖 名词 | `Jargon.dc.html` | `jargon` |
| 💼 求职 | `Job.dc.html` | `job` |

### 4.4 API 集成

仅在 `index.html`（Chat 页）中使用。用户需自行配置 OpenRouter API Key。

**流程：** 读取 localStorage API Key → 有 Key 走真实 OpenRouter SSE 流 → 无 Key 时 API 调用直接报错（页面显示错误信息）。

```
端点：POST https://openrouter.ai/api/v1/chat/completions
Headers：Authorization: Bearer {apiKey}
         HTTP-Referer: https://llm-viz.app
         X-Title: LLM Mechanism Viz
Body：model, messages, max_tokens, temperature, top_p, stream: true
      （启用思维链时附加 reasoning: true, reasoning_effort: 'medium'）
响应：SSE (text/event-stream)，逐行解析 data: {...} JSON
```

**管道阶段时序：**

| 阶段 | 触发时机 | 延迟 |
|------|----------|------|
| 1 — 上下文组装 | 点击「▶ 运行」 | 立即 |
| 2 — 请求编码 JSON | 阶段 1 后 | 350ms |
| 3 — 分词预处理 | 阶段 2 后 | 700ms |
| 4 — API 调度 & 模型画像 | 阶段 3 后 | 1050ms |
| 5 — Transformer 推理 | 阶段 4 后 | 1550ms（同时发起真实 API 请求） |
| 6 — 自回归解码 | 首个 token 到达 | 取决于 API 响应时间 |
| 7 — 响应完成 & 指标 | 最后 token 到达 | 流结束 |

**模型定价（$ / 1M tokens）：**

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

1. **创建 `.dc.html` 文件**（命名：英文大驼峰，如 `FineTuning.dc.html`），包含 `<x-dc>` 模板和 `<script type="text/x-dc">` 逻辑类
2. **在 `Nav.dc.html` 注册**：模板中加 `<a>` 链接，`renderVals` 中加对应的 `NS('xxx')` 导航样式
3. **无需构建**：直接在浏览器打开 `.dc.html` 即可预览
4. **选定强调色**：从已有蓝/紫/橙中选一个作为新功能区的次要强调色，不扩展全局调色板

### 5.2 内容维护

**黑话词典（最高频操作）** — 编辑 `Jargon.dc.html`：

在 `JARGON_DATA` 对象中新增词条，包含 `zh`、`en`、`emoji`、`plain`、`tech`、`related`、`isNew` 字段，然后在 `JARGON_CATS` 中将 key 加入对应分类的 `items` 列表。

**工具/命令目录** — 编辑 `Code.dc.html`：

- 工具：在 `TOOL_DESCS` 中新增工具，包含 `emoji`、`title`、`plain`、`example`；在 `TOOL_CATS` 中将 key 加入对应分类的 `tools` 列表（实验性工具还需加入 `exp` 列表）
- 命令：在 `CMD_DESCS` 中新增命令，包含 `emoji`、`title`、`plain`、`example`；在 `CMD_CATS` 中将 key 加入对应分类的 `cmds` 列表（实验性命令还需加入 `exp` 列表）

**RAG/推理步骤** — 编辑 `Lab.dc.html` 中 `RAG_STEPS` 和 `INFER_STEPS` 数组。每步包含 `num`、`icon`、`title`、`desc`、`code` 字段。

**面试题库** — 编辑 `Job.dc.html` 中 `QUESTIONS` 数组。每题包含 `id`、`tag`、`title`、`difficulty`、`company`、`tags`、`answer`、`code`（可选）、`codeLabel`（可选）、`keyPoints`、`related`。

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

无需 Node.js、无需构建、无需 package.json。

### 5.4 注意事项

1. **不要在模板 `{{ }}` 里写表达式**，会静默失败。所有计算放 `renderVals()`
2. **定时器必须在 `componentWillUnmount` 清理**，否则组件销毁后继续跑会导致 setState 报错
3. **async 方法可直接写在 class 里**，但不能将 await 结果直接写入模板，要通过 setState → renderVals 路径
4. **`sc-if` 和 `sc-for` 必须加 hint 属性**，否则流式渲染时布局抖动：`sc-if` 加 `hint-placeholder-val`，`sc-for` 加 `hint-placeholder-count`
5. **不要修改 `support.js`**，该文件由 DC 框架自动管理，重新构建会覆盖
6. **`index.html` 不是 `.dc.html`**，它是标准 HTML 入口，通过 `<script type="text/x-dc">` 嵌入 DC 逻辑
7. **`Nav.dc.html` 中 `data-props` 属性**包含 active 的枚举定义和默认值，新增页面时需更新

---

## 六、迭代方向

### 高优先级
1. **多轮对话优化** — 支持历史消息的可视化回放，当前多轮对话的消息可查看但无专门回放界面
2. **黑话词典扩充** — 当前 37 个词条（基础概念 8 + 训练阶段 7 + 推理与调用 8 + 架构 4 + 应用与职业 10），目标 100+
3. **移动端适配** — 当前为桌面端设计，宽度 < 1200px 时布局压缩

### 中优先级
4. **Lab 新增模块** — RLHF 训练可视化、MoE 路由机制演示
5. **多语言支持** — 目前全中文界面，可加英文版本
6. **用户进度记忆** — 记录 Lab 各模块的学习进度

### 低优先级
7. **内容分享** — 生成分享链接
8. **暗/亮主题切换** — 当前仅有暗色主题

### 工期参考

| 类型 | 工时 |
|------|------|
| 纯内容页（词典扩充） | 2–4h |
| 简单交互页（新增 Tab） | 4–8h |
| 带动画的可视化页（RAG 链路） | 1–2 天 |
| 带真实 API 集成的功能页 | 2–3 天 |

---

## 七、FAQ

**Q：用户使用有费用吗？**
A：工具本身免费。真实 AI 对话需用户自行注册 OpenRouter 并充值（约 $0.001–0.01/次）。未配置 API Key 时 API 调用会失败，页面会显示错误提示。

**Q：收集用户数据吗？**
A：不收集。纯静态网页，API Key 仅存用户浏览器 localStorage 中。

**Q：内容更新需要程序员吗？**
A：需要。内容目前硬编码在各页面的 JS 对象中（如 `JARGON_DATA`、`QUESTIONS`、`TOOL_DESCS` 等）。若未来做成 CMS 可实现无代码更新。

**Q：可以嵌入到其他网站吗？**
A：技术上可通过 `<iframe>` 嵌入，但未做嵌入场景适配。

**Q：如何确认线上版本是最新的？**
A：查看部署平台最后部署时间。无服务端，不存在缓存穿透问题（静态文件可直接对比 hash）。

**Q：为什么有些页面加载时会短暂显示占位符？**
A：DC 框架支持流式渲染（HTML/JS streaming）。在同目录找不到对应 `.dc.html` 组件时，会显示带 shimmer 动画的占位符，随后异步拉取填充。这是框架正常行为。

**Q：support.js 从哪里来？**
A：由 DC 框架源码 `dc-runtime/src/*.ts` 经 `bun run build` 构建生成。该文件集成了 React 加载、模板编译、表达式解析、组件生命周期管理等全部运行时能力，约 1600 行。
