# Tasks: 深色主题 + 明暗切换

**Tests**: `tsc --noEmit` + 手动 QA（两 mode 走查 + FOUC/记忆/系统跟随）。纯前端。
**依赖顺序**: A→B→C 顺序；D 可并行；E 最后。

## A 深色 token
- [x] T001 `apps/web/src/app/globals.css`：新增 `[data-theme="dark"] { … }` 覆盖全部 token 变量（深色值见 plan）；`:root/[data-theme=light]` 加 `color-scheme: light`、dark 块加 `color-scheme: dark`。浅色值不改。

## B 无闪烁 + 切换逻辑
- [x] T002 新增 `apps/web/src/lib/theme-mode.ts`：`THEME_KEY="teaching_tool_theme"`、`applyTheme(t)`（写 `document.documentElement.dataset.theme`）、`resolveInitial()`（stored ?? prefers-color-scheme）、`getStored()`。
- [x] T003 `apps/web/src/app/layout.tsx`：`<html … data-theme="light" suppressHydrationWarning>`；首帧前内联脚本（读 localStorage / matchMedia → 设 dataset.theme）。

## C 切换控件
- [x] T004 `apps/web/src/components/NavSidebar.tsx`：PATHS 加 `sun`/`moon`；底部 spacer 后、⚙ 前加切换按钮（useState 初值 useEffect 从 dataset.theme 读；点击 toggle → applyTheme + localStorage + setState）；图标墨/次级色。

## D 资产 / 文档
- [x] T005 新增 `design/tokens.dark.json`（镜像 tokens.json 结构 + 深色值）；`design/DESIGN.md` 加「Dark mode」节。
- [x] T006 `CLAUDE.md` Conventions：「currently light only」→「light + dark，切换在导航底部，首次跟随系统」。

## E 收尾
- [ ] T007 `npm run typecheck` 通过；`npm run dev` 走查：切换即时生效、深色刷新无 FOUC、记住选择、清存储后首访跟随系统；两 mode 各走 5 页 + 设置弹窗对照 Figma；console 无报错。
- [ ] T008 `git merge --no-ff` 017→junxiang。

## Notes
无新增 npm 依赖；组件除 NavSidebar 外零改动（mode-aware `var()` 自动适配）。不改后端/内容/契约。无 constitution 变更。
