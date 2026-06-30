# Tasks: 前端视觉/布局重构

**Tests**: tsc + 手动 QA（视觉）。纯前端，不碰后端。

## A 共享基础
- [x] T001 `lib/theme.ts` 设计 token（色板/间距/字号/mono/卡片·面板·标签·chip 样式对象）+ `globals.css` keyframes（fade/slide/sweep）
- [x] T002 `components/bits/` 轻量动效（GradientText、CountUp、FadeIn；零依赖）
- [x] T003 `components/layout/ThreePane.tsx` 三栏外壳（左/中/右，可选右栏 + 窄屏收起）
- [x] T004 `NavSidebar.tsx` 精修（窄图标栏，选中/hover 统一，套 token）

## B Chat 四区
- [x] T005 `components/PipelineDetail.tsx`：逐阶段详情卡（Stage1-7，复用 messages/params/metrics + 013 文案，阶段进度）
- [x] T006 `ModelParamsPanel.tsx`：右栏化 + 顶部 System Prompt 编辑框 + 参数/概率图/JSON 套 token
- [x] T007 `app/page.tsx`：四区布局（导航|流程详情|对话|右栏），System Prompt 前置为 system 消息，顶部信息条/阶段进度；`ChatArea`/`PerformanceMetrics` 套 token

## C Lab/Code
- [x] T008 `app/code/page.tsx`：模拟器终端+序列图双栏、Tab 样式、工具/命令目录套 token
- [x] T009 `app/lab/page.tsx`：5 演示套 token、函数调用双栏、分词/速查精修

## D Jargon/Job
- [x] T010 `app/jargon/page.tsx` + `app/job/page.tsx`：套 token，树/列表 + 详情排版/关联chip/代码块对齐旧版

## E 收尾
- [x] T011 一致性走查 + 空/错误态 + 窄屏右栏收起 + `npm run typecheck` 通过；merge 015→junxiang

## Notes
React Bits 自实现轻量动效，禁 Three.js/粒子；不改后端/内容/会话；保留 #00ffa0 + JetBrains Mono/Inter。
