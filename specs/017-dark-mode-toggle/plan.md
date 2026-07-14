# Implementation Plan: 深色主题 + 明暗切换

**Branch**: `017-dark-mode-toggle` · **Date**: 2026-07-14 · **Spec**: [spec.md](./spec.md)

纯前端；详见审定的程序计划 `~/.config/ai-launcher/claude-home/plans/spec-16-precious-babbage.md`（已更新为 017）。视觉基准：Figma file `2dDovqwKhLNSGRUNpyoqc3` 深色帧。深色值源：`design/tokens.dark.json`。

## Constitution Check
| 原则 / 章节 | 评估 |
|------|------|
| I 关注点分离 | ✅ 仅前端呈现层；不碰后端/数据/契约/packages |
| II Spec 合规 | ✅ 017 spec；无 spec 冲突；**无需 amend constitution**（v1.1.0 已涵盖深色 mode 扩展） |
| III YAGNI | ✅ 复用 016 的 mode-aware 架构，仅加 CSS 覆盖块 + 一个切换控件；不做自定义主题 |
| IV 测试 | ✅ tsc + 手动 QA（两 mode 走查 + FOUC 检查）；前端无 test runner |
| V 可回溯 | ✅ design/tokens.dark.json + DESIGN.md 记录深色值；spec/plan/tasks 齐全 |
| §Design System Constraints (v1.1.0) | ✅ 深色沿用马利筋黄、黄仅作填充/高亮；token 仍单一来源、mode-aware（本 Spec 即其兑现） |

无 Complexity Tracking 违规项。

## 阶段
- **A 深色 token**：`globals.css` 加 `[data-theme="dark"]` 覆盖块 + `color-scheme`（浅色 :root 不动）。
- **B 无闪烁 + 切换逻辑**：`lib/theme-mode.ts`（key/apply/resolve）；`layout.tsx` 首帧前内联脚本 + `suppressHydrationWarning`。
- **C 切换控件**：`NavSidebar` 底部加 ☀/🌙 按钮（复用 Icon/PATHS + itemStyle）。
- **D 资产/文档**：`design/tokens.dark.json`、`DESIGN.md`「Dark mode」节、`CLAUDE.md` Conventions。
- **E 收尾**：typecheck + 两 mode 走查 + FOUC/记忆/系统跟随验证 → merge。

## 关键文件
- `apps/web/src/app/globals.css`（+`[data-theme="dark"]`、`color-scheme`）
- `apps/web/src/app/layout.tsx`（内联无闪烁脚本、`suppressHydrationWarning`）
- `apps/web/src/components/NavSidebar.tsx`（切换按钮 + sun/moon 图标）
- `apps/web/src/lib/theme-mode.ts`（新增）
- `design/tokens.dark.json`（新增）、`design/DESIGN.md`、`CLAUDE.md`
- 不动其余组件/页面（`var()` 自动适配）、后端、fixtures。

## 深色值（globals.css `[data-theme="dark"]`）
canvas `#1b1813` · surface `#24211a` · surface-subtle `#14120d` · border-subtle `#2e2a22` · border `#3a352b` · border-strong `#4a4437` · text `#f2eee4/#b8b1a2/#857e70/#5c564a` · brand-yellow `#feb70c` · brand-yellow-strong `#ffc533` · brand-yellow-tint `rgba(254,183,12,0.16)` · cta-bg `#feb70c` · cta-text `#1a1813` · cta-hover `#ffc533` · accent-link `#e6b24d` · semantic `#6ba5ff/#b79cff/#e8974a/#ff6b6b/#3bb6a6`。

## 依赖
无新增 npm 依赖；图标内联 SVG（sun/moon）。无 research/data-model/contracts（呈现层）。
