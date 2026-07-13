# Feature Specification: 深色（暖色偏黄）主题 + 明暗切换

**Feature Branch**: `017-dark-mode-toggle` · **Created**: 2026-07-14 · **Status**: Draft · **Depends on**: 016（浅色 mode-aware token 架构已就绪）

**Input**: 把已在 Figma 确认的深色（暖色偏黄，同用马利筋黄 `#FEB70C`）方案落到代码，作为 016 浅色之外的第二个 mode；并加一个明暗切换开关。开关放**左侧导航底部**（☀/🌙，在 ⚙ 上方）；首次访问**跟随系统** `prefers-color-scheme`，手动切换后记住用户选择（localStorage）。纯前端；因 token 层已 mode-aware，组件基本零改动。

## 背景

016 把浅色设计系统全站 token 化并做成 mode-aware：`globals.css :root` 存浅色 CSS 变量，组件全部 `var(--…)` 消费，`layout.tsx` 已挂 `<html data-theme="light">`。深色 Figma 稿已确认（file `2dDovqwKhLNSGRUNpyoqc3` 第二行帧）。本 Spec 落地深色 mode + 切换，兑现 constitution v1.1.0 §Design System Constraints「深色为后续 Spec 的 mode 扩展」的承诺。**无需 amend constitution。**

## User Scenarios

### US1 - 用户按偏好在浅/深间切换并被记住（P1）🎯

用户点导航底部的切换按钮即可在浅色/深色间切换；刷新或重开后保持上次选择；从未选过时跟随操作系统深浅。

**Acceptance**:
1. 左侧导航底部（⚙ 上方）有一个切换按钮：浅色时显示 🌙、深色时显示 ☀；点击即时切换整站 mode。
2. 切换后写入 `localStorage['teaching_tool_theme']`；刷新页面保持该 mode。
3. 首次访问（无存储值）跟随系统 `prefers-color-scheme`；之后手动选择优先。
4. **深色下刷新不闪浅色**（无 FOUC）：主题在首帧绘制前就已应用。

### US2 - 深色两套皮肤都与 Figma 一致、无回归（P1）

浅色行为与 016 完全不变；深色为暖色偏黄，五页 + 组件在深色下视觉与 Figma 深色帧一致。

**Acceptance**:
1. 深色调色板取自 design/tokens.dark.json（canvas `#1b1813`、surface `#24211a`、ink `#f2eee4`、马利筋黄不变 …）；`[data-theme="dark"]` 覆盖全部 token 变量。
2. 组件零结构改动，仅靠 CSS 变量切换即适配（`var()` + `color-mix`）。
3. 两套 mode 下既有交互（流式、过滤、分步、014、会话增删、设置弹窗）行为不变；console 无报错。
4. 黄仍只作填充/高亮（含深色）；切换控件本身用墨/次级色，不用黄；每屏 ≤1 实心黄 CTA。

### Edge Cases
- 无 `localStorage` / 隐私模式：回退到系统偏好或浅色，不报错。
- SSR 默认 `light` 与客户端脚本设置的 mode 不一致 → `<html suppressHydrationWarning>` 消除告警。
- 深色下对比度：文字/黄底黑字/语义色须达可读（AA 目标）。

## Requirements

- **FR-001**: `globals.css` 新增 `[data-theme="dark"]` 块，覆盖全部 ~20 个 token CSS 变量为深色值（source: `design/tokens.dark.json`）；两个块各加 `color-scheme: light|dark;`。浅色 `:root` 值不变。
- **FR-002**: 无闪烁初始化——`layout.tsx` 注入首帧前执行的内联脚本：读 `localStorage['teaching_tool_theme']`，无值则 `matchMedia('(prefers-color-scheme: dark)')`，写入 `document.documentElement.dataset.theme`；`<html>` 加 `suppressHydrationWarning`，保留 `data-theme="light"` 作 SSR 默认。
- **FR-003**: 切换控件——在 `NavSidebar` 底部（⚙ 上方）加按钮，点击切换 mode 并持久化到 localStorage + 更新 `<html data-theme>`；图标 ☀/🌙 为墨/次级色。
- **FR-004**: 抽 `lib/theme-mode.ts`（`THEME_KEY`、`applyTheme`、`resolveInitial`）供 React 侧复用。
- **FR-005**: 新增 `design/tokens.dark.json`（镜像 tokens.json、深色值）；`DESIGN.md` 加「Dark mode」节；`CLAUDE.md` Conventions 更新为「light + dark，切换在导航底部，首次跟随系统」。
- **FR-006**: MUST NOT 改任何页面结构/内容、其余组件、后端、fixtures、契约；浅色 mode 无任何回归。

## Success Criteria

- **SC-001**: 一键在导航底部切换浅/深，整站即时生效；`localStorage` 记住选择，刷新/重开保持。
- **SC-002**: 深色下刷新**无浅色闪烁**（FOUC）；清空存储后首访跟随系统深浅。
- **SC-003**: `npm run typecheck` 通过；两套 mode 下 5 页 + 设置弹窗与 Figma 帧一致、既有交互无回归、console 无报错。
- **SC-004**: 深色对比度抽查达标；切换控件与页面用色遵守黄的铁律。

## Assumptions

- 纯前端；token 层已 mode-aware，深色为纯 CSS-变量覆盖 + 一个切换控件，组件零结构改动。
- `design/tokens.dark.json` 为深色设计值来源；Figma file `2dDovqwKhLNSGRUNpyoqc3` 深色帧为视觉基准。
- 仅浅/深两套 mode；不做自定义主题；`prefers-reduced-motion` 等其它偏好不在本 Spec。
- 无需 amend constitution（v1.1.0 已涵盖）。
