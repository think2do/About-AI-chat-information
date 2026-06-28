# LLM 机制可视化教学工具

> 面向开发者和技术爱好者的交互式 AI 教学网站。通过可视化动画、逐步演示和真实 API 对接，帮助理解大语言模型的运行机制。

更新日期：2026-06-27

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

几乎为零 —— 仅域名 + 静态托管费用。用户 AI 对话通过自己的 OpenRouter API Key 调用，费用自担（每次约 $0.001–0.01）。演示模式完全免费。

---

## 二、功能模块

项目共 6 个页面文件 + 1 个共享导航组件 + 1 个框架运行时。

| 页面 | 文件 | 说明 |
|------|------|------|
| Chat / Playground | `index.html` | 对话 + 7 阶段管道可视化 + 参数调节 + Token 概率分布 + 真实 API 对接 |
| 实验室 | `Lab.dc.html` | 5 个子模块：训练对比、函数调用链路、白盒分词实验、模型推理全过程、RAG 检索增强 |
| Claude Code | `Code.dc.html` | 5 个子模块：终端模拟器、Agent 循环解析、52 个工具目录、26 个命令目录、隐藏功能 |
| 黑话词典 | `Jargon.dc.html` | 37 个 AI 术语，5 个分类，支持树形浏览和关联跳转 |
| 求职 | `Job.dc.html` | 12 道面试题，6 个分类标签（前端/算法/系统设计/计算机基础/行为面试），含参考回答和解析要点 |
| 共享导航 | `Nav.dc.html` | 左侧导航栏 + 全局设置弹窗（API Key） |

### Chat / Playground

`index.html` — 主入口，三栏布局（导航 | 主面板 | 右侧参数面板）。

**7 阶段管道可视化：**

| 阶段 | 图标 | 内容 |
|------|------|------|
| 1 | `[ ]` | 上下文组装 — 构建 messages 数组 |
| 2 | `{ }` | 请求编码 — 序列化为 JSON |
| 3 | `#` | 分词预处理 — Tokenizer 分词 |
| 4 | `⇢` | API 调度 & 模型画像 — 展示模型架构参数 |
| 5 | `◈` | Transformer 模型推理 — 前向传播示意 |
| 6 | `↻` | 自回归解码 — 逐 token 循环生成 |
| 7 | `✓` | 响应完成 & 指标 — TPS、延迟、费用统计 |

**支持的模型（11 个）：**

| 模型 | 层数 | 维度 | 注意力头 | 上下文 | 架构 |
|------|------|------|----------|--------|------|
| gpt-4o | ~120 | — | — | 128K | MoE |
| gpt-4o-mini | ~80 | — | — | 128K | Dense |
| claude-sonnet-4 | — | — | — | 200K | Dense |
| claude-3-5-haiku | — | — | — | 200K | Dense |
| gemini-2.5-flash | — | — | — | 1M | MoE |
| deepseek-chat-v3 | 61 | 7168 | 128 | 131K | MoE |
| deepseek-r1 | 61 | 7168 | 128 | 131K | MoE |
| llama-3.3-70b | 80 | 8192 | 64 | 131K | Dense (GQA) |
| qwen3-235b | 94 | 16384 | 128 | 131K | MoE |
| demo/gpt-4o | 120 | — | — | 128K | 模拟 |
| demo/claude | 96 | — | — | 200K | 模拟 |

**功能开关：** `🔧 工具调用` · `🧠 思维链` · `🔍 联网`

**可调参数（5 个滑块）：** Temperature (0–2)、Top-P (0.01–1)、Max Tokens (16–4096)、Frequency Penalty (0–2)、Presence Penalty (0–2)

**其他特性：** 系统提示词编辑、Token 概率分布可视化、对话轮数/上下文占用统计、输入/输出 Token 计数、TPS 与 TTFT 指标、费用估算（真实 API 用 $，演示模式用 ¥）

### 实验室

`Lab.dc.html` — 5 个子模块（Tab 切换）。

| Tab | 内容 | 步骤 |
|------|------|------|
| ⚖ 训练对比 | 基座模型 vs SFT 指令微调模型，同问题对比 | 交互式 |
| 🔗 函数调用 | Function Calling 完整链路：tool_call → 执行 → 回填 → 回复 | 5 步 |
| 🔬 白盒实验 | Tokenizer 分词效率对比：早期 vs 现在、中文 vs 英文、国内 vs 国外 | 3 种模式 |
| ⚙ 模型推理全过程 | 从用户输入到模型回复的完整 10 步链路 | 10 步 |
| 🔎 RAG 检索增强 | 索引建立（4 步）+ 检索生成（6 步），含 RAG vs 无 RAG 对比 | 10 步 |

### Claude Code

`Code.dc.html` — 5 个子模块。

| Tab | 内容 |
|------|------|
| ⏵ 模拟器 | 终端模拟器（macOS 窗口风格）+ Agent Loop 消息序列图，11 步演示 |
| ↻ Agent 循环 | Claude Code 源码路径解析，从输入到响应的 11 个阶段（含源码文件引用） |
| 🔧 工具系统 | 52 个内置工具，按 8 个职能分类，点击查看详情 |
| / 命令目录 | 26 个 slash 命令，按 4 个职能分类，点击查看详情 |
| ✦ 隐藏功能 | 8 个实验性功能展示 |

### 黑话词典

`Jargon.dc.html` — 双栏布局（树形导航 + 详情面板）。

| 分类 | 词条数 |
|------|--------|
| 🧠 基础概念 | 8 |
| 📚 训练阶段 | 7 |
| 💬 推理与调用 | 8 |
| ◈ 架构 | 4 |
| 🚀 应用与职业 | 10 |
| **合计** | **37** |

每个词条含：中文名、英文名、通俗解释、技术解释、关联词条。其中 6 个标记为 🔥 2025 新概念。

### 求职

`Job.dc.html` — 面试题库，双栏布局（题目列表 + 详情面板），支持标签筛选。

| 分类 | 题目数 |
|------|--------|
| 🎨 前端开发 | 4 |
| 📐 算法 | 3 |
| 🏗️ 系统设计 | 2 |
| 💻 计算机基础 | 2 |
| 🤝 行为面试 | 2 |
| **合计** | **12** |

每道题含：难度徽章、公司来源、题目正文、参考回答、代码示例（如适用）、解析要点、关联考察点。

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
| 交互区背景（输入框、按钮悬停） | `#21262d` |
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

**Tab 按钮：** padding 5px 12px，border-radius 4px；激活态：border `#58a6ff` + background `rgba(88,166,255,0.12)` + color `#58a6ff`；未激活：border `#30363d` + transparent + `#6e7681`；字体 11px JetBrains Mono。

**主操作按钮（如「▶ 运行」）：** background `#00ffa0`，color `#0d1117`（确保对比度），font 12px 600 JetBrains Mono，border-radius 6px，padding 7px 14px。禁用态：background `#21262d` + color `#6e7681` + opacity 0.7。

**徽章 / 状态标签：** 9px JetBrains Mono，padding 1px 6px，border-radius 3px。PENDING：`#484f58`，ACTIVE：`#00ffa0` + blink 动画，DONE：`#7ee787`，NEW：`#ffa657`，LIVE：`#00ffa0`。

**卡片：** background `#161b22`，border 1px solid `#21262d`（普通）或 `rgba(0,255,160,0.2)`（强调），border-radius 6–8px，padding 10–16px。

**输入框：** background `#0d1117` 或 `#21262d`，border 1px solid `#30363d`，border-radius 6px，color `#e6edf3`，font 12–13px，outline none。

**流程节点（Pipeline Dot）：** 28–36px 圆形；激活：border `#00ffa0` + background `rgba(0,255,160,0.15)` + box-shadow `0 0 10px rgba(0,255,160,0.3)`；完成：border `rgba(0,255,160,0.45)` + background `rgba(0,255,160,0.08)`；待定：border `#30363d` + background `#21262d`；连接线 width 2px，激活 `rgba(0,255,160,0.4)`，未激活 `#21262d`。

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
- 样式：纯 Inline Style（无 CSS 文件）
- 字体：Google Fonts CDN（JetBrains Mono + Inter）
- 外部 API：OpenRouter（用户自行配置 Key，可选）

### 4.1 文件结构

```
/
├── index.html          # Chat/Playground 主入口（标准 HTML，内嵌 DC）
├── Lab.dc.html         # 实验室（5 个子 Tab）
├── Code.dc.html        # Claude Code 页（5 个子 Tab）
├── Jargon.dc.html      # 黑话词典（37 个词条）
├── Job.dc.html         # 面试题库（12 道题）
├── Nav.dc.html         # 共享导航组件（所有页面引用，勿删）
├── support.js          # DC 框架运行时（自动生成，勿修改）
└── README.md           # 本文档
```

| 文件 | 类型 | 说明 |
|------|------|------|
| `*.dc.html` | DC 组件页面 | 直接在浏览器打开，DC 框架自动渲染 |
| `index.html` | 标准 HTML 入口 | 通过 `<script type="text/x-dc">` 嵌入 DC 逻辑 |
| `support.js` | 框架运行时 | 由 `dc-runtime/src/*.ts` 构建生成，**禁止手动修改** |

**核心文件（不可删除）：** 上表除 README.md 外的全部 7 个文件。`Nav.dc.html` 删除会导致所有页面导航消失，`support.js` 删除会导致白屏。

### 4.2 DC 框架

#### 组件结构

每个 `.dc.html` 文件由两部分组成：

```html
<!-- 模板：<x-dc> 标签内，支持 {{ }}、sc-if、sc-for、dc-import -->
<x-dc>
  <helmet><!-- 字体引入 --></helmet>
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
| `style="{{ styleObj }}"` | 样式绑定 | 必须是 JS 对象（camelCase），从 renderVals 返回 |
| `<sc-if value="{{ bool }}">` | 条件渲染 | 必须加 `hint-placeholder-val` |
| `<sc-for list="{{ arr }}" as="item">` | 列表渲染 | 必须加 `hint-placeholder-count` |
| `<dc-import name="Nav">` | 引入子组件 | 必须加 `hint-size` |

#### 逻辑类 API

```js
class Component extends DCLogic {
  state = { ... };

  // 生命周期
  componentDidMount()    // DOM 挂载后
  componentWillUnmount() // 销毁前（清定时器！）

  // 核心方法
  setState(updater)      // 触发重新渲染
  this.props.xxx         // 读取父组件 prop
  this.forceUpdate()     // 强制刷新

  // 必须实现
  renderVals()           // 返回模板所需的所有值
}
```

### 4.3 页面通信

**导航：** 标准 `<a href>` 超链接，无 SPA 路由，每次跳转完整加载。

**全局状态：** 仅用户设置跨页共享，存储在 `localStorage['llm_viz_settings']`：

```js
{ selectedProvider: 'OpenRouter', apiKey: 'sk-or-...', baseUrl: '...' }
```

- **写入：** Nav 设置弹窗保存时写入
- **读取：** index.html 在 `componentDidMount` 读取
- **同步：** `window.addEventListener('storage', ...)` 实现跨 Tab 实时同步

**Nav 导航项与 active 值对应：**

| 导航项 | 文件 | active 值 |
|--------|------|-----------|
| 💬 Chat | `index.html` | `chat` |
| 🧪 Lab | `Lab.dc.html` | `lab` |
| ⌨ Code | `Code.dc.html` | `code` |
| 🔤 黑话 | `Jargon.dc.html` | `jargon` |
| 💼 求职 | `Job.dc.html` | `job` |

### 4.4 API 集成

仅在 `index.html`（Chat 页）中使用。

**流程：** 读取 localStorage API Key → 有 Key 走真实 OpenRouter SSE 流 → 无 Key 走本地演示数据。

```
端点：POST https://openrouter.ai/api/v1/chat/completions
Headers：Authorization: Bearer {apiKey}
         HTTP-Referer: https://llm-viz.app
         X-Title: LLM Mechanism Viz
Body：model, messages, max_tokens, temperature, top_p, stream: true
响应：SSE (text/event-stream)，逐行解析 data: {...} JSON
```

**管道时序：**
- 阶段 1（消息数组）→ 立即
- 阶段 2（Tokenizer）→ 500ms
- 阶段 3（Transformer）→ 1100ms
- 阶段 4（解码开始）→ 1600ms（真实）/ 2400ms（演示）
- 阶段 7（完成）→ 最后 token 到达

---

## 五、开发指南

### 5.1 新增页面

1. **创建 `.dc.html` 文件**（命名：英文大驼峰，如 `FineTuning.dc.html`），包含 `<x-dc>` 模板和 `<script type="text/x-dc">` 逻辑类
2. **在 `Nav.dc.html` 注册**：模板中加 `<a>` 链接，`renderVals` 中加 `navXxx: NS('xxx')`
3. **无需构建**：直接在浏览器打开 `.dc.html` 预览
4. **选定强调色**：从已有蓝/紫/橙中选一个作为新功能区的次要强调色，不扩展全局调色板

### 5.2 内容维护

**黑话词典（最高频操作）** — 编辑 `Jargon.dc.html`：

在 `JARGON_DATA` 对象中新增词条，包含 `zh`、`en`、`emoji`、`plain`、`tech`、`related`、`isNew` 字段，然后在 `JARGON_CATS` 中将 key 加入对应分类的 `items` 列表。

**工具/命令目录** — 编辑 `Code.dc.html` 中 `TOOL_DESCS` 和 `CMD_DESCS` 对象。

**RAG/推理步骤** — 编辑 `Lab.dc.html` 中 `RAG_STEPS` 和 `INFER_STEPS` 数组。

**面试题库** — 编辑 `Job.dc.html` 中 `QUESTIONS` 数组。

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
2. **定时器必须在 `componentWillUnmount` 清理**，否则销毁后继续跑导致 setState 报错
3. **async 方法可直接写在 class 里**，但不能将 await 结果直接写入模板，要通过 setState
4. **`sc-if` 和 `sc-for` 必须加 hint 属性**，否则流式渲染时布局抖动
5. **不要修改 `support.js`**，该文件由框架自动管理
6. **`index.html` 不是 `.dc.html`**，它是标准 HTML，通过 `<script type="text/x-dc">` 嵌入 DC 逻辑

---

## 六、迭代方向

### 高优先级
1. **多轮对话优化** — 支持历史消息的可视化回放
2. **黑话词典扩充** — 当前 37 个词条，目标 100+
3. **移动端适配** — 当前为桌面端设计，宽度 < 1200px 时布局压缩

### 中优先级
4. **Lab 新增模块** — RLHF 训练可视化、MoE 路由机制演示
5. **多语言支持** — 目前全中文，可加英文版本
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
A：工具本身免费。真实 AI 对话需用户自行注册 OpenRouter 并充值（约 $0.001–0.01/次）。演示模式完全免费。

**Q：收集用户数据吗？**
A：不收集。纯静态网页，API Key 仅存用户浏览器本地。

**Q：内容更新需要程序员吗？**
A：需要。内容目前硬编码在 JS 文件中。若未来做成 CMS 可实现无代码更新。

**Q：可以嵌入到其他网站吗？**
A：技术上可通过 `<iframe>` 嵌入，但未做嵌入场景适配。

**Q：如何确认线上版本是最新的？**
A：查看部署平台最后部署时间。无服务端，不存在缓存穿透问题。
