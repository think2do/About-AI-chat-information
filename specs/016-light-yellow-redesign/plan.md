# Implementation Plan: 浅色 + 马利筋黄 设计系统落地

**Branch**: `016-light-yellow-redesign` · **Date**: 2026-07-13 · **Spec**: [spec.md](./spec.md)

纯前端呈现层重构；详见审定的程序计划 `~/.config/ai-launcher/claude-home/plans/spec-16-precious-babbage.md`。视觉基准：Figma file `2dDovqwKhLNSGRUNpyoqc3`（5 页已审）。设计值单一来源：`design/tokens.json`（规格 `design/DESIGN.md`）。

## Constitution Check
| 原则 / 章节 | 评估 |
|------|------|
| I 关注点分离 | ✅ 仅前端呈现层；不碰后端 / 内容 fixtures / 会话逻辑 / API 契约 / packages |
| II Spec 合规 | ✅ 016 spec；**正式取代 015 FR-006**（顶部 Supersedes + 取代说明）；无契约变更 |
| III YAGNI | ✅ token 收敛不新增抽象；图标内联 SVG 自实现（零新增依赖）；删死代码；深色 mode 延后（不提前构建） |
| IV 测试 | ✅ `tsc --noEmit` + 手动 QA（对照 Figma）+ grep 暗色 hex 断言；前端无 test runner，视觉重构以人工走查为主 |
| V 可回溯 | ✅ design/tokens.json + DESIGN.md + Figma file 为基准；spec/plan/tasks 齐全 |
| §Design System Constraints (v1.1.0) | ✅ 本 Spec 即该章节的落地：token 单一来源、黄仅作黑字之下填充/高亮、mode-aware（浅色首发） |

无 Complexity Tracking 违规项。

## 阶段
- **A 基座（先行）**：依 tokens.json 重写 `lib/theme.ts` 为浅色 token（CSS 变量 + mode-aware）；改 `globals.css`（:root 浅色、body 字体 mono→sans、链接、滚动条、绿光 pulse→中性、预定义 tint token）；`layout.tsx` 去硬编码底色 + `<html data-theme="light">`。
- **B 已消费 token 模块验证**：`app/page.tsx`(Chat)、`PipelineDetail`、`ModelParamsPanel`、`layout/ThreePane` 随基座自动翻，逐一走查修正（渐变 sweep / 概率条 / 字符高亮 / 序号徽标对比度）。
- **C 硬编码大页迁移**：`app/{lab,code,job,jargon,not-found}/page.tsx` 的 ~200 处 hex 全部改走 token。
- **D 组件迁移**：`NavSidebar`(emoji→线图标)、`ChatArea`、`ChatInput`、`ErrorBubble`、`ConversationList`、`SettingsModal`、`bits/GradientText`(去绿蓝渐变→静态墨色)。
- **E 死代码 + 专项**：删 `PipelineVisualization` / `PerformanceMetrics`；修 job 难度 chip 底色随难度；去 tab/筛选 chrome emoji；难度色 teal/orange/red；jargon 通俗黄/技术蓝。同步 `CLAUDE.md` Conventions「设计系统固定」措辞。
- **F 收尾**：一致性走查（对照 Figma）+ `npm run typecheck` + grep 暗色 hex 断言（注释外为 0）+ 规范抽查 → `git merge --no-ff` 回 `junxiang`。

## Token 映射（dark theme.ts → light tokens.json，摘要）
- 中性 ~1:1（改名 + 反转明暗直觉）：`bgPage→canvas`、`bgCard→surface`、`bgSecondary/bgInput→surfaceSubtle`、`border(Subtle)`同名、加 `borderStrong`、`text.*` 同层、删 `textFaint`(→tertiary)。
- 强调**非 1:1（换用法）**：`green#00ffa0`（原文字/描边/图标）→ `brand.yellow`（仅填充/高亮）；新增 `cta.*` / `accent.link` / `yellowTint`；`blue/purple/orange/red`→`semantic.*`（仅内容）；`success`→`semantic.teal`。
- 字体：`mono/sans` 同名；全局 body 默认 mono→sans。

## 关键文件
- **基座**：`apps/web/src/lib/theme.ts`、`apps/web/src/app/globals.css`、`apps/web/src/app/layout.tsx`
- **页面**：`apps/web/src/app/{page,lab/page,code/page,jargon/page,job/page,not-found}.tsx`
- **组件**：`apps/web/src/components/{NavSidebar,ChatArea,ChatInput,ErrorBubble,ConversationList,SettingsModal,ModelParamsPanel,PipelineDetail}.tsx`、`components/layout/ThreePane.tsx`、`components/bits/GradientText.tsx`
- **删除**：`components/PipelineVisualization.tsx`、`components/PerformanceMetrics.tsx`
- **文档**：`CLAUDE.md`（Conventions 措辞）；不动后端 / fixtures / shared 类型 / packages。

## 依赖
无新增 npm 依赖；Lucide 风格图标以内联 SVG 自实现（与 015「零依赖自实现」一致）。无需 research.md / data-model.md / contracts（呈现层重构，无数据模型或 API 契约变更）。
