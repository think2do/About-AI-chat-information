---
source_url: https://www.xuanyuancode.com/
site_name: 轩辕的编程宇宙 (Xuanyuan's Programming Universe)
extracted_at: 2026-07-13
theme: light (暖调奶油纸)
industry: 技术教育 / 个人 IP
style: neo-brutalism (新粗野主义)
purpose: 纯参考学习（客观记录，不落地代码，不复刻配色）
---

# 轩辕的编程宇宙 · 像素级拆解

> 一名技术博主（前百度 / 奇安信 / 360 高级研发工程师）的个人官网，用「奶油纸底 + 明黄 + 粗黑边 + 硬阴影」的新粗野主义风格，把课程、文章、视频、自研工具与付费社群（知识星球）串成一条**「免费内容引流 → 星球专属变现」**的漏斗。全站中文，Next.js + Tailwind 构建。

这是对本项目（`teaching_tool`）的一次**外部参考调研**：客观拆解它的内容架构、技术框架与 UI 设计，作为灵感库与设计参考。**本项目自身是固定的深色终端风（brand green `#00ffa0`），不复刻此站暖调**——本文档只记录「它怎么做的、为什么有效」，第 04 篇给出「哪些原则可迁移、哪些需谨慎」的边界。

## 一句话定位

个人技术 IP 官网 = 内容中枢（博客/课程/视频）+ 自研工具展示 + 付费社群转化，视觉上刻意采用高辨识度的暖调新粗野主义，与市面上千篇一律的深色 SaaS/AI 风拉开差距。

## 文件索引

| 文件 | 内容 |
| --- | --- |
| [`01-content-architecture.md`](./01-content-architecture.md) | **内容与信息架构** —— 定位与人设、导航 IA、首页区块逐块拆解（含文案逐字转录）、内容类型矩阵、免费→付费转化漏斗 |
| [`02-framework-structure.md`](./02-framework-structure.md) | **技术框架与页面结构** —— Next.js App Router / SSR / 字体与图片策略 / 三方脚本；路由清单；5 类页面模板归纳与差异 |
| [`03-ui-design-system.md`](./03-ui-design-system.md) | **UI 设计系统** —— neo-brutalism 拆解、完整设计 token（色板 / 排版 / 阴影 / 圆角 / 边框 / 间距 / 栅格）、组件规范、Do / Don't |
| [`04-first-principles.md`](./04-first-principles.md) | **第一性原理拆解** —— 为什么这些设计有效、可迁移原则、对 teaching_tool 的参考边界 |
| [`screenshots/`](./screenshots/) | 首页 / AI 学习 / EasyTshark 三张全页截图（1440px 宽，headless Chrome 抓取） |

## 站点地图 / 路由表

| 路由 | 页面 | 模板类型 |
| --- | --- | --- |
| `/` | 首页 | 着陆页（Landing） |
| `/ai-learning` | AI 学习中心（课程总览） | 索引页（Index/Grid） |
| `/ai-llm` | 大模型课程（从向量到 Transformer） | 课程详情/学习页 |
| `/learn-claude-code` | Claude Code 教程 | 课程详情/学习页 |
| `/ai-programming` · `/ai-programming/tutorials` | AI 编程基础（互动 + 图文） | 课程详情/学习页 |
| `/articles` · `/articles?category=…` | 博客列表（8 分类 / 73 篇） | 列表页（List） |
| `/articles/{uuid}` | 文章详情 | 详情页（Article） |
| `/tools` | 发现工具（工具包） | 索引页（Grid） |
| `/easytshark` · `/svganimate` | 单品工具落地页 | 产品页（Product） |
| `/knowledge-planet` | 知识星球（社群转化） | 转化页（Conversion） |

导航栏（7 项）：首页 · AI学习 · AI动画 · 博客 · 知识星球 · 工具包 · `加入星球`(主 CTA 药丸)。

## 抓取方法与说明

- **抓取时间**：2026-07-13。
- **方法**：`curl` 拉取首页与 7 个子页面的服务端渲染 HTML（该站首屏 SSR，正文可直接解析）；Python 剥标签提取文案与内联样式；下载 Tailwind 产物 CSS（`c79187aad0bf5400.css`）与主题 CSS（`1b376b853b14fa6f.css`）提取 `:root` 设计 token；headless Chrome（1440px 宽）截取全页图。
- **数据来源层级**：所有色值 / 阴影 / 字体均来自**源码精确提取**（CSS 自定义属性 + 内联 style + Tailwind 类频次统计），非目测；文案为**逐字转录**（保留中文原文）；视觉版式以截图 + 类名频次交叉印证。
- **准确性边界**：站点内容会更新（如文章数、下载量随时间变化），本文记录抓取时快照；主题 CSS 中存在两套暖调 token 预设，本文以**页面实际渲染生效的一套**（`--paper:#F5EDDB` / `--ink:#1C1C1C`）为准，另一套（`--paper:#FAF6EE` / `--ink:#1E2B38`）在 03 篇备注。
