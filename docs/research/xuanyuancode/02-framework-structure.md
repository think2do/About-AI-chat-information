# 02 · 技术框架与页面结构

> 拆解「用什么技术栈、页面怎么渲染、路由怎么组织、模板如何复用」。证据来自 HTML `<head>`、`/_next/` 产物路径、CSS 与三方脚本引用。

## 1. 技术栈（Tech Stack）

| 层 | 技术 | 证据 |
| --- | --- | --- |
| 框架 | **Next.js**（App Router） | `/_next/static/chunks/app/layout-*.js`、`app/page-*.js`、`main-app-*.js`；`data-precedence="next"` |
| 渲染 | **SSR / 服务端渲染**（首屏 HTML 含完整正文） | `curl` 直接拿到全部文案与内联样式，无需执行 JS |
| 语言 | React + TypeScript（推断，Next 默认） | chunk 命名与结构 |
| 样式 | **Tailwind CSS** + CSS 自定义属性（设计 token） | 产物 CSS `*,:after,:before{--tw-border-spacing-x:0…}`；HTML 中 `border-2`/`rounded-full`/`grid-cols-3` 等原子类高频出现 |
| 语法高亮 | **highlight.js**（GitHub Dark 主题） | CSS `.hljs{color:#c9d1d9;background:#0d1117}` |
| 字体 | 自托管 `AlimamaShuHeiTi` + Google Fonts（Noto Sans/Serif SC） | `@font-face src:/font/AlimamaShuHeiTi-Bold.woff2`；`@import fonts.googleapis.com/css2?family=Noto+Serif+SC…&Noto+Sans+SC` |
| 分析/广告 | **百度统计** + **Google AdSense** | `hm.baidu.com/hm.js?…`；`pagead2.googlesyndication.com/…?client=ca-pub-5639745717417263` |
| 部署线索 | 疑似 Vercel（作者文章提及 Vercel 账单） | 内容旁证，非强证据 |

## 2. 渲染与性能策略

- **首屏 SSR**：所有列表/卡片内容在 HTML 里就位，利于 SEO（对内容站至关重要）与首屏可见。
- **图片预加载**：`<head>` 里对首屏关键图 `<link rel="preload" as="image">`（`hero-illustration.png`、各课程封面 `ai-llm-cover.png`/`claude-code-cover.png`…），减少 Hero 与首屏卡片的图片闪烁。
- **脚本 `async` 加载**：Next 的 chunk 全部 `async`，AdSense/百度统计 `preload as=script`，不阻塞渲染。
- **字体 `font-display:swap`**：`AlimamaShuHeiTi` 用 swap，避免展示字体阻塞文字绘制（先用 sans-serif 兜底再替换）。
- **CSS 拆分**：三个 CSS 产物各司其职——① 主题+字体 `@import`（`1b376b853b14fa6f.css`）、② highlight.js 主题（`5eacd01f773eed7f.css`）、③ Tailwind 原子类产物（`c79187aad0bf5400.css`，~195KB）。

## 3. 路由清单（App Router）

| 路由 | 说明 |
| --- | --- |
| `/` | 首页 |
| `/ai-learning` | AI 学习中心（课程索引） |
| `/ai-llm` | 大模型课程学习页 |
| `/learn-claude-code` | Claude Code 教程 |
| `/ai-programming`、`/ai-programming/tutorials` | AI 编程基础（互动 + 图文两模式） |
| `/articles` | 博客列表 |
| `/articles?category={ai\|network-security\|operate-system\|reverse-engineering\|…}` | 分类过滤（query 参数，非独立路由段） |
| `/articles/{uuid}` | 文章详情（UUID 作为 slug） |
| `/tools` | 工具索引 |
| `/easytshark`、`/svganimate` | 单品工具落地页 |
| `/knowledge-planet` | 知识星球转化页 |

文章用 **UUID 作 slug**（如 `/articles/f17f7a01-3c6e-409f-98bd-708b75f401da`），说明内容存于数据库/CMS，按主键路由，而非文件名式的语义 slug。

## 4. 页面模板归纳（5 类）

尽管风格统一，页面按功能分为 5 类模板。三个共享外壳：**深色固定顶栏**（见 03 篇）+ **奶油底内容区** + **统一页脚**。

### A. 着陆页（Landing）—— 仅 `/`
- 唯一带**整屏黄色 Hero** 的页面（`#FAC94A` 满铺 + 太空插画 + 数据条悬浮白卡）。
- 之下是 5 个「区块头药丸 + 卡片网格」的聚合板块，每块是对应子页面的「精选前 N + 查看全部」入口。

### B. 索引/网格页（Index/Grid）—— `/ai-learning`、`/tools`
- 一个**页头带说明**（如「适合新手的AI学习教程」）+ 单一大网格。
- `/ai-learning` 的卡片带 `01~06` 序号 → 传达「有序路径」；`/tools` 分「原创/精选」两组。

### C. 课程学习页 —— `/ai-llm`、`/learn-claude-code`、`/ai-programming`
- 内容最重（`/ai-llm` HTML 达 141KB），含章节列表 / 交互可视化容器 / 图文正文。
- 是「免费课程」的实际承载页，也是引流到星球专属课的场所。

### D. 列表 + 详情页 —— `/articles`（列表）、`/articles/{uuid}`（详情）
- **列表**：统计头（`8 分类 / 73 文章`）+ 双排序视图 + 分类分组目录。
- **详情**：左侧常驻「博客目录」分类侧栏（跨文章复用），右侧图文正文 + highlight.js 代码块，顶部「返回博客」。

### E. 产品页（Product）—— `/easytshark`、`/svganimate`
- 标准软件落地页骨架：**Hero(版本号+slogan) → 多平台下载 CTA + 开源徽标 → 数据(下载量/协议数) → 更新日志(时间线) → 功能网格 → 产品优势 → 适用场景 → 社区**。
- 与内容页最大差异：以「下载/使用转化」为目标，CTA 密度最高。

### F. 转化页（Conversion）—— `/knowledge-planet`
- 权益清单 → 数据社会证明 → 「加入方式 / 价格 / 权益」三栏 → 专属课程详情卡（课时、更新节奏、亮点）。
- 唯一集中展示**价格锚点**（¥299/年）的页面。

## 5. 复用与一致性的工程手法

- **组件级复用**：顶栏、页脚、卡片、区块头药丸、状态角标（`免费`/`星球专属`）、CTA 药丸在所有页面像素级一致 → 说明是同一套 React 组件 + 设计 token 驱动，而非逐页手写。
- **token 驱动主题**：颜色/字体/间距走 CSS 自定义属性（`--paper`/`--ink`/`--accent`/`--mono`…，见 03 篇），主题 CSS 里甚至存在**两套暖调 token 预设**，为「换肤」预留了能力。
- **内容与展示分离**：文章用 UUID 路由 + 数据库存储，课程/工具用结构化元数据（学员数、版本号、下载量），页面只负责渲染 → 内容可频繁更新而不动版式。这一点与本项目 `teaching_tool`「JSON fixtures 为内容单一真源、页面只 fetch 渲染」的理念一致。
