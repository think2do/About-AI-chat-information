---
project: AI Teaching Tool — 浅色编辑式重设计
theme: light
industry: ai / education
brand_color: "#FEB70C"   # 马利筋黄，取自 旦曼学院 logo
fonts: [Inter, JetBrains Mono]
synthesized_from:
  - mintlify.com          # 结构 + 单一强调色纪律
  - developers.openai.com # 压缩灰阶字阶 + 无阴影发丝分层
  - perplexity.ai         # 暖奶白画布 + 暖中性文字层级
status: draft — 需要人工在 Figma 中落地并回评
---

# AI Teaching Tool · Design Spec（浅色编辑式）

> 这是一份**合成**的产品设计规范，供 Figma（Make / First Draft）与 AI 编码代理照此搭建。
> 三个参考各司其职（见 Reference Lock），**不是**任何单一站点的复制。原始来源见 `design/sources/*.md`。

## North Star

> **黑墨写在暖纸上，关键处压一抹马利筋黄。**
> 暖奶白画布上，墨色文字承担几乎全部表达；层次靠"表面明度 + 1px 发丝线"而非阴影；
> 唯一的品牌色是取自 logo 的马利筋黄 `#FEB70C`——它像**荧光笔/贴纸**一样**做填充与高亮**（黄底压黑字），
> 标示"此处可点击 / 已激活 / 正在运行"，**绝不**当浅底上的细文字或细图标。
> 技术质感靠 JetBrains Mono 的代码与数据标签保留——它是一个 AI/代码教学产品，不是营销页。

## Reference Lock（每个来源的边界职责）

| 来源 | 拥有的职责 | 明确不借的 |
|------|-----------|-----------|
| **Perplexity** | 暖奶白画布 `#FAF9F7`（永不纯白）、暖中性文字层级、侧栏靠定位分隔而非竖线 | 它的"全无彩色/pill 圆角/单字体"极端——我们保留绿强调、方正圆角、双字体 |
| **OpenAI Developers** | 压缩字阶（≤30px，层级靠字重+字距）、无阴影仅 1px 发丝、4px 基准、深色单一 CTA | 它偏冷的纯白与纯灰——我们用暖调 |
| **Mintlify** | 三栏文档骨架、"单色 + 一抹强调、强调色极克制"的用色纪律 | 它的绿强调色与"全 Inter 无 mono"——我们改用黄、并保留 mono |
| **旦曼学院 Logo** | 品牌主色马利筋黄 `#FEB70C` + "黄底黑字"的用色范式 | logo 的粗描边卡通字风——UI 不采用 |

## Decision Ledger

| 决策 | 来源 | 保留的角色规则 | 为什么 |
|------|------|--------------|--------|
| 暖奶白画布，永不纯白 | Perplexity | canvas 专用，卡片才升到纯白 | 对学生更亲和，不像诊所 |
| 品牌主色 = 马利筋黄 `#FEB70C` | 旦曼学院 Logo | 黄=填充/高亮，黑墨=文字/描边 | 延续品牌识别；黄底黑字对比强、可读 |
| 主 CTA = 黄底黑字（logo 招牌动作） | Logo + Perplexity（单一实心 CTA） | 每屏仅一个实心黄按钮 | 高能量又高对比，天然可读 |
| 黄绝不做浅底细文字/细图标 | 对比度 craft | 黄仅在"黑字之下"出现 | `#FEB70C` on 浅底 ≈ 1.5:1，不可读 |
| 压缩字阶，层级靠字重 | OpenAI-dev | 正文 ≤16，展示 ≤30(36 仅 hero) | 克制、编辑感、信息密度可控 |
| 无阴影，1px 发丝 + 表面明度分层 | 三者一致 | 卡片靠 border 而非 shadow | 根治旧版"深浅背景分不清" |
| 保留 JetBrains Mono 给代码/数据 | 产品改写 | mono 仅用于 code/data/label/eyebrow | AI 教学产品需要技术质感 |
| 蓝/紫/橙/红降级为"仅内容语义" | 产品改写 | 只用于分类标签/代码语法，绝不进 UI chrome | 维持单色+一黄的克制 |

---

## Colors

**中性（暖调）— 承担 95% 的界面**

| Token | Hex | 角色 |
|-------|-----|------|
| `canvas` | `#FAF9F7` | 页面画布（**永不用 `#FFFFFF`**） |
| `surface` | `#FFFFFF` | 升起的卡片/面板（相对暖画布形成温柔分离） |
| `surfaceSubtle` | `#F3F1EC` | 凹陷的内嵌区（代码块、详情面板、输入底） |
| `borderSubtle` | `#ECEAE3` | 最弱分隔线、hover 微洗 |
| `border` | `#DEDBD2` | 卡片描边、输入边框、导航分隔 |
| `borderStrong` | `#CBC7BC` | 需要更明确的结构线 |
| `text.primary` | `#23211C` | 正文/标题（暖墨，非纯黑） |
| `text.secondary` | `#57544B` | 次要文字、导航未选中 |
| `text.tertiary` | `#86827A` | 元数据、caption、占位 |
| `text.disabled` | `#ABA79C` | 禁用/失活 |

**品牌黄（唯一主色 = 马利筋黄，只做填充/高亮，上压黑字）**

| Token | Hex | 角色 |
|-------|-----|------|
| `brand.yellow` | `#FEB70C` | 主行动按钮/active pill/高亮标记/标签的**填充**（其上永远是黑墨字） |
| `brand.yellowStrong` | `#E0A200` | 黄色元素的 hover / 描边 |
| `brand.yellowTint` | `#FEB70C24` | active 导航项的极淡黄底（~14% 透明） |
| `accent.link` | `#8A5A00` | 少数"品牌感"文字链接（深琥珀，浅底达 AA）；默认链接用墨色+下划线 |

**CTA（logo 招牌：黄底黑字）— 每屏最多一个实心**

| Token | Hex | 角色 |
|-------|-----|------|
| `cta.bg` | `#FEB70C` | 主行动按钮填充（黄） |
| `cta.text` | `#1A1813` | 按钮上的黑墨字 |
| `cta.hover` | `#E0A200` | 按钮 hover |

> ⚠️ **黄的用法铁律**：`#FEB70C` 在浅底上做文字/细图标对比度约 1.5:1，不可读。
> 黄**只能是"黑字之下的填充/高亮"**——想要"黄色的文字链接"时，改用 `accent.link` 深琥珀，或墨色+下划线。图标一律用墨色，不用黄。

**语义色（仅限内容：分类标签 / 代码语法高亮，绝不进 UI chrome）**

| Token | Hex |
|-------|-----|
| `semantic.blue` | `#2563EB` |
| `semantic.purple` | `#7C3AED` |
| `semantic.orange` | `#B45309` |
| `semantic.red` | `#DC2626` |
| `semantic.teal` | `#0F766E` |

## Typography

- **字体**：`Inter`（正文/UI）、`JetBrains Mono`（代码/数据/标签/eyebrow）。
- **字重只用 3 档**：400 正文 · 500 中等/active · 600 标题（**不用 700**）。
- **压缩字阶**，层级靠字重+字距，不靠字号膨胀。

| 样式 | 字体 | 字号 | 字重 | 行高 | 字距 |
|------|------|------|------|------|------|
| `display`（仅页面 hero） | Inter | 36 | 600 | 1.2 | -0.02em |
| `h1` | Inter | 30 | 600 | 1.25 | -0.02em |
| `h2` | Inter | 24 | 600 | 1.3 | -0.015em |
| `h3` | Inter | 18 | 600 | 1.4 | -0.01em |
| `body`（阅读正文） | Inter | 16 | 400 | 1.65 | -0.006em |
| `bodyUI`（界面文字） | Inter | 14 | 400 | 1.5 | -0.004em |
| `small` | Inter | 13 | 400 | 1.5 | 0 |
| `caption` | Inter | 12 | 400 | 1.4 | 0 |
| `eyebrow`（小节标签） | JetBrains Mono | 12 | 500 | 1 | +0.06em, UPPERCASE |
| `code` | JetBrains Mono | 13 | 400 | 1.6 | 0 |

## Spacing / Radius / Elevation

- **间距基准 4px**：`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80`。元素间 16 / 卡片内边距 24 / 区块间 64–80。
- **圆角**：`xs 4`（标签）· `sm 6`（按钮/输入）· `md 10`（卡片）· `lg 14`（搜索框/模态）· `pill 9999`（仅小型 chip）。
- **阴影（极克制）**：默认无阴影，深度来自表面明度 + 1px 发丝线；
  卡片可选 `0 1px 2px rgba(35,33,28,0.05)`；模态/浮层 `0 8px 30px rgba(35,33,28,0.12)`。

## Layout（Mintlify 式三栏 —— 内容页骨架）

内容页（名词 / 面试题 / Agent / Code）：
```
┌───────┬──────────────────────┬──────────┐
│ 分类   │  正文列                │  页内 TOC │
│ 导航树 │  max 760px 阅读宽      │  / 元数据 │
│ (rail) │  顶部：搜索 + 面包屑    │  (可选)   │
└───────┴──────────────────────┴──────────┘
```
- 左侧分类导航树（可保留窄图标 rail + 展开的分类列表）。
- 中间正文列固定阅读宽 ~720–760px；不铺满，留白即节奏。
- 右侧页内目录/元数据（长文才出现，短页可省）。
- 侧栏与正文靠**定位与背景差**分隔，不加竖分隔线（Perplexity 规则）。

Chat 页：保留"演示 playground"三区结构，但整体换到浅色皮肤；"正在流式输出"用 `brand.yellow` 的脉冲圆点表达（点是填充，不是文字）。

## Components（关键规则）

- **主按钮**：`cta.bg` 黄填充 + `cta.text` 黑墨字（logo 招牌）；圆角 6；padding 10×20；每屏最多一个。
- **次按钮**：ghost，`text.primary` + 1px `border`，透明底，hover 洗 `borderSubtle`。
- **链接**：默认墨色 + hover 下划线；需要品牌感时用 `accent.link` 深琥珀（**不用黄**）。
- **卡片**：`surface` 白底 + 1px `border` + 圆角 10 + padding 24；无阴影（或最弱阴影）。
- **标签/分类 chip**：mono 12，圆角 4/6，用 `semantic.*` 的 8% tint 底 + 对应色文字（**仅内容语境**）。
- **active 导航项**：`brand.yellowTint` 淡黄底 + `text.primary` 墨字 + 左缘 2px `brand.yellow`；未选中项**不加**底色。
- **高亮标记**：像荧光笔一样给关键词加 `brand.yellow` 填充底 + 黑墨字（用于强调术语、命中搜索）。
- **代码块**：`surfaceSubtle` 底 + 1px `borderSubtle`，JetBrains Mono，语义色做语法高亮。

## Do

- 画布永远 `#FAF9F7`，卡片才用 `#FFFFFF`。
- 黄 `#FEB70C` 只做**填充/高亮**（其上压黑墨字）——CTA、active pill、荧光笔式高亮、标签。
- 深度只靠表面明度差 + 1px 发丝线；能用 border 就不用 shadow。
- 字重承担层级，字号保持压缩（正文 ≤16，标题 ≤30，hero 36 封顶）。
- 蓝/紫/橙/红只出现在**内容**里（标签、语法高亮）。

## Don't

- 不用纯白 `#FFFFFF` 当页面/大面积底色。
- **不把黄用作浅底上的文字或细图标**（对比度不足，不可读）；黄永远在黑字之下。
- 不给 UI 控件加彩色（chrome 保持单色 + 一黄）；黄之外不引入第二个品牌色。
- 不用重阴影堆叠层次；不用 700 字重。
- 不在侧栏与正文之间加竖分隔线。
- 不把 mono 用到正文散文（mono 仅限 code/data/label/eyebrow）。

---

## 如何喂给 Figma

1. **精确值走 `design/tokens.json`（DTCG 格式）** → 装 **Tokens Studio for Figma** 插件 → Import → 自动生成 Variables + 文字/颜色样式。
2. **品味与结构走本文件（DESIGN.md）** → 贴进 **Figma Make / First Draft** 的 prompt，配合 `design/sources/*.md` 与参考站截图，让 AI 按此生成页面/组件。
3. 落地状态：浅色已由 **Spec 016** 全站落地（constitution v1.1.0 §Design System Constraints 治理，退休旧暗色终端风）；深色由 **Spec 017** 落地。

## Dark mode（Spec 017）

深色是浅色之外的**第二个 mode**，不是新设计——**同一套马利筋黄 `#FEB70C`、同样的用色铁律**（黄仅作黑字之下的填充/高亮），只把中性与语义色换成暖色深版。精确值见 **`design/tokens.dark.json`**（与 `tokens.json` 的 `color` 组一一对应的深色覆盖）。

- 画布 `#1B1813`（暖近黑，非冷蓝黑终端）、卡片 `#24211A`、内嵌 `#14120D`；文字暖白 `#F2EEE4` → `#5C564A` 四层。
- 马利筋黄不变；hover 在深色下提亮到 `#FFC533`；文字链接用暖金 `#E6B24D`（深底可读）。
- 语义色为深色适当调亮：blue `#6BA5FF` / purple `#B79CFF` / orange `#E8974A` / red `#FF6B6B` / teal `#3BB6A6`（仍仅限内容）。
- 实现：`globals.css` 的 `[data-theme="dark"]` 覆盖块 + `<html data-theme>` 切换；组件因全走 `var()` 而零改动。切换开关在左侧导航底部，首次访问跟随系统 `prefers-color-scheme`。
