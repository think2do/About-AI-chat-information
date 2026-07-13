# Feature Specification: 浅色 + 马利筋黄 设计系统落地（Light + Yellow Redesign）

**Feature Branch**: `016-light-yellow-redesign` · **Created**: 2026-07-13 · **Status**: Draft · **Depends on**: 015（页面结构已就绪） · **Supersedes**: 015-ui-redesign（FR-006 固定暗色设计系统锁）

**Input**: 把已在 Figma 确认的「暖奶白画布 `#FAF9F7` + 唯一主色马利筋黄 `#FEB70C`」浅色编辑式设计，落到运行的前端应用，退休当前蓝绿终端风 `#00ffa0`。范围：Chat / Lab / Code / 名词 / 求职 五页 + 全部共享组件 + 全局壳。做法：彻底 token 化，以 `design/tokens.json` 为单一来源，token 经 CSS 变量注入、mode-aware（本 Spec 只落浅色 mode，深色为后续 Spec 预留架构）。**纯前端呈现层重构，不改后端 / 内容数据 / API 契约。**

## 取代说明（Supersedes 015-ui-redesign 的 FR-006）

- Spec 015 的 **FR-006** 规定「保留固定设计系统（`#00ffa0`、JetBrains Mono/Inter，暗色终端）」。
- 该锁与 constitution **v1.1.0** 新增的「Design System Constraints」章节（浅色编辑式 + 马利筋黄，退休 `#00ffa0`）冲突。
- 依 constitution **原则 II（先改 Spec 后改代码）** 与新章节，本 Spec 正式**取代 015 FR-006 的设计系统锁**；015 的其余成果（三栏结构外壳、Chat 四区、五页内容还原、克制动效）**继续有效**，本 Spec 只替换其视觉皮肤与 token 架构。
- 依据：constitution v1.1.0 §Design System Constraints；Figma 稿 file `2dDovqwKhLNSGRUNpyoqc3`（5 页已审确认）。

## 背景

015 交付了完整的**暗色三栏结构**，功能齐全但方向已变更。用户在 Figma 中确认新方向为**浅色编辑式**（暖奶白 + 马利筋黄）。本 Spec 仅重构呈现层的视觉皮肤与设计 token 架构——结构、后端、内容数据一律不动。当前 `theme.ts` 几乎未被采用（仅 4 文件 import），设计值以 ~314 处硬编码 hex + ~50 处 `rgba()` 散落在 14+ 文件，且 `globals.css` 有一套重复 token；本 Spec 一并收敛。

## User Scenarios

### US1 - 学生看到统一的浅色 + 黄界面（P1）🎯

进入任意页，看到暖奶白画布 + 马利筋黄强调的一致设计；五页视觉统一、与 Figma 稿一致；既有交互不变。

**Acceptance**:
1. 五页（Chat / Lab / Code / 名词 / 求职）+ SettingsModal 全部浅色化，与 Figma 稿一致（画布 `#FAF9F7`、卡片白、1px 边框分层、无暗色残留）。
2. 黄仅作填充 / 高亮：主 CTA 黄底黑字、active pill = `yellowTint` 底 + 左 2px 黄条、荧光笔标记；**无黄色文字 / 图标 / 描边**；每屏 ≤1 个实心黄 CTA。
3. 导航图标为细线矢量（非 emoji）；内容页标题为静态墨色（无绿蓝渐变）；tab / 筛选等 chrome 无 emoji。
4. 语义色仅进内容：难度 简单=teal / 中等=orange / 困难=red；jargon 通俗解释=黄强调块、技术解释=蓝块；标签 chip 走 `semantic.*` tint。
5. 既有交互（流式、过滤、分步、014 概率图 / JSON / 逐条指标 / 思维链、会话增删）行为不变；空 / 错误态正常；窄屏侧栏可收起；console 无报错。

### US2 - 设计值单一来源、主题可演进（P2）

所有设计值走 token 层，为后续深色 mode 预留架构。

**Acceptance**:
1. `lib/theme.ts` + `globals.css` CSS 变量为唯一 token 源，值来自 `design/tokens.json`；组件不再散落硬编码 hex（注释外全站 grep 暗色 hex = 0）。
2. token 经 CSS 变量注入、`<html data-theme="light">` 挂载；将来新增一段 `[data-theme="dark"]` 即可扩展深色，组件零改动（**本 Spec 不实现深色**）。

### Edge Cases
- 窄屏右栏 / 侧栏可收起（沿用 015 行为）。
- 长文本 / 空数据 / 错误态在浅底下的对比度与可读性。
- 流式生成中管线 active 态、黄脉冲圆点在浅底清晰可见。
- 深浅背景「靠明度 + 1px 发丝线」分层，不得依赖阴影 / 发光。

## Requirements

- **FR-001**: 重写 `apps/web/src/lib/theme.ts` 为浅色 token（源自 `design/tokens.json`）：`canvas / surface / surfaceSubtle / border / borderSubtle / borderStrong / text.*`、`brand.yellow(/Strong/Tint)`、`cta.*`、`accent.link`、`semantic.{blue,purple,orange,red,teal}`；删 `textFaint`（→ tertiary）、加 `borderStrong`；退休 `green` / `success`。保留组件已用的导出名以减小改动面。
- **FR-002**: token 经 **CSS 变量**注入、**mode-aware**：`globals.css :root` 存浅色值，`<html data-theme="light">`；`body` 全局字体 mono→sans；链接改墨色 + 下划线 / `accent.link`；滚动条与 `@keyframes pulse`（绿色发光）改浅色 / 中性；预定义 tint token（`yellowTint` + 各 semantic tint），使 chip 不再用 JS 拼 alpha。
- **FR-003**: **彻底 token 化**——将 5 页 + 所有组件 + `layout.tsx` 的 ~314 硬编码 hex + ~50 `rgba()` 全部改走 token；注释外无残留暗色 hex。
- **FR-004**: 遵守**黄的用法铁律**（填充 / 高亮、黑字之下、每屏 ≤1 实心 CTA、绝不做文字 / 图标 / 描边）与**浅色规则**（1px 边框分层、无阴影 / 发光、`success`→teal、难度色映射）。
- **FR-005**: **组件专项**——导航 emoji → Lucide 细线矢量图标；内容页标题去 `GradientText` 绿蓝渐变（改静态墨色标题）；tab / 筛选去 chrome emoji；jargon 通俗=黄块 / 技术=蓝块；job 难度 chip 底色**随难度**（修既有「无论难度都固定 amber 底」的 bug）。
- **FR-006**: 删除死代码 `components/PipelineVisualization.tsx` 与 `components/PerformanceMetrics.tsx`（确认无 import；符合原则 III YAGNI）。
- **FR-007**: **MUST NOT** 改后端 / 内容 fixtures / 会话逻辑 / API 契约 / `packages`（原则 I）；既有交互无回归；本 Spec **不实现**深色 mode 与明暗切换开关（后续 Spec）。

## Success Criteria

- **SC-001**: 五页 + SettingsModal 浅色化，且与 Figma 稿（file `2dDovqwKhLNSGRUNpyoqc3`）视觉一致。
- **SC-002**: 全站注释外 grep 暗色 hex（`#0d1117` / `#00ffa0` / `#161b22` / `#0a0e14` / `#21262d` / `#30363d` / `rgba(0,255,160`）= 0；设计值统一走 token。
- **SC-003**: 前端 `npm run typecheck` 通过；014 / 013 等既有交互与后端无回归；console 无未捕获错误。
- **SC-004**: 规范抽查通过——无黄色文字 / 图标；每屏 ≤1 实心黄 CTA；黄底黑字对比度达标；分层靠边框非阴影。

## Assumptions

- 纯前端呈现层重构；不动后端 / 数据 / 契约 / `packages`。
- `design/tokens.json`（浅色）为设计值单一来源，`design/DESIGN.md` 为品味 / 结构规格；Figma file `2dDovqwKhLNSGRUNpyoqc3` 为视觉基准。
- 深色（偏黄）mode 与明暗切换为**后续 Spec**（先在 Figma 出深色稿）；本 Spec 只做 mode-aware 架构预留，默认 light。
- Lucide 风格图标以**内联 SVG 自实现**（零新增重依赖），与 015「自实现轻量动效」一致。
- 内容 fixtures 中的 emoji（术语 / 工具 / 分类 icon 等）属内容语境，予以保留；仅移除 UI **chrome** 中的 emoji（导航、tab、筛选）。
