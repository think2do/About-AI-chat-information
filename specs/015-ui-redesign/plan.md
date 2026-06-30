# Implementation Plan: 前端视觉/布局重构

**Branch**: `015-ui-redesign` · **Date**: 2026-07-01 · **Spec**: [spec.md](./spec.md)

纯前端重构，详见审定的程序计划 `~/.claude/plans/handover-md-session-memoized-toast.md`。

## Constitution Check
| 原则 | 评估 |
|------|------|
| I 关注点分离 | ✅ 仅前端呈现层；不碰后端/数据 |
| II Spec 合规 | ✅ 015 spec；不改契约 |
| III YAGNI | ✅ 自实现轻量动效，禁 Three.js；复用既有数据/组件 |
| IV 测试 | ✅ tsc + 手动 QA（视觉重构以人工走查为主） |
| V 可回溯 | ✅ 文档 + 旧版 :8090 对照 |

## 阶段
A 共享基础（theme token / ThreePane / NavSidebar / bits）→ B Chat 四区 → C Lab/Code 双栏 → D Jargon/Job 打磨 → E 一致性走查 + 验证 + merge。

## 关键文件
新增 `lib/theme.ts`、`components/layout/ThreePane.tsx`、`components/PipelineDetail.tsx`、`components/bits/*`；改 `globals.css`、`NavSidebar.tsx`、`app/page.tsx` + Chat 组件、`app/{lab,code,jargon,job}/page.tsx`。不动后端/fixtures/shared 类型。

## 依赖
React Bits 动效自实现（零依赖 CSS/JS），不 `npm i` 重特效库。
