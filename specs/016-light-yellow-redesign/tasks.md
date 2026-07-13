# Tasks: 浅色 + 马利筋黄 设计系统落地

**Tests**: `tsc --noEmit` + 手动 QA（对照 Figma file `2dDovqwKhLNSGRUNpyoqc3`）+ grep 暗色 hex 断言。纯前端，不碰后端。
**依赖顺序**: A（基座）必须先完成；B/C/D 依赖 A，可并行推进；E 依赖 C/D；F 最后。

## A 基座（先行）
- [ ] T001 重写 `apps/web/src/lib/theme.ts`：浅色 token（源自 `design/tokens.json`），值引用 CSS 变量；保留组件已用导出名 + 新增 `borderStrong`/`brand.*`/`cta.*`/`accent.link`/`semantic.teal`；退休 `green`/`success`/`textFaint`(→tertiary)；`chip()` 改用预定义 tint token（不再 JS 拼 alpha）
- [ ] T002 `apps/web/src/app/globals.css`：`:root` 浅色 CSS 变量（含各 semantic tint）；`body` 背景→canvas、字体 mono→sans(Inter)；链接→墨色+下划线；滚动条浅色；`@keyframes pulse` 绿光→中性/黄描边；保留 fade/slide/sweep/shimmer
- [ ] T003 `apps/web/src/app/layout.tsx`：去 `<main>` 硬编码 `#0d1117`→token；`<html data-theme="light">`

## B 已消费 token 模块（随基座翻，走查修正）
- [ ] T004 `app/page.tsx`(Chat) + `components/layout/ThreePane.tsx`：验证套色；header / `headerBtn` 去绿 glow→token
- [ ] T005 `components/PipelineDetail.tsx`：sweep 渐变改克制；字符高亮 `rgba(255,255,255,.03)`→token；序号徽标黄底黑字对比；（可选）实现 Figma「可展开阶段详情」
- [ ] T006 `components/ModelParamsPanel.tsx`：概率条渐变→浅色对比填充；range `accentColor` 黄；改动行闪烁→`yellowTint`

## C 硬编码大页
- [ ] T007 `app/lab/page.tsx`：5 演示套 token；基座=red / SFT=teal 语义；tab 去 chrome emoji；分词/速查精修
- [ ] T008 `app/code/page.tsx`：工具/命令 pill、模拟器 TERMINAL 面板浅色化、tab 去 chrome emoji、agent-loop 徽标
- [ ] T009 `app/job/page.tsx`：难度色 简单=teal/中等=orange/困难=red + **chip 底色随难度（修 bug）**；筛选去 chrome emoji；标签 chip 蓝 / 关联考察点 紫
- [ ] T010 `app/jargon/page.tsx`：通俗解释=黄强调块 / 技术解释=蓝块；分类/术语 caret→chevron
- [ ] T011 `app/not-found.tsx`：套 token（CTA 黄底黑字）

## D 组件
- [ ] T012 `components/NavSidebar.tsx`：emoji→Lucide 内联 SVG 线图标；active=`yellowTint`+左 2px 黄；图标墨/次级色；套 token
- [ ] T013 `components/bits/GradientText.tsx`：去绿蓝 shimmer→静态墨色（或浅色安全默认）；内容页标题改用
- [ ] T014 `components/ChatArea.tsx`：用户气泡白卡+边框（不用绿字）、助手编辑式、流式圆点黄；套 token
- [ ] T015 `components/ChatInput.tsx` + `components/ErrorBubble.tsx`：套 token；发送=黄 CTA；危险=`semantic.red`（墨字）
- [ ] T016 `components/ConversationList.tsx`：套 token；active=`yellowTint`+左黄条；去绿 glow
- [ ] T017 `components/SettingsModal.tsx`：套 token；遮罩浅化；active provider=`yellowTint`；保存=黄 CTA；清除=red

## E 死代码 + 文档
- [ ] T018 删除 `components/PipelineVisualization.tsx` + `components/PerformanceMetrics.tsx`（确认无 import）
- [ ] T019 `CLAUDE.md` Conventions「Design system is fixed」措辞改为新浅色系统（token 单一来源、马利筋黄、退休 `#00ffa0`、mode-aware）

## F 收尾
- [ ] T020 一致性走查（对照 Figma 五页）+ 空/错误/窄屏态；grep 暗色/离群 hex 注释外=0——token 面板（`#0d1117`/`#00ffa0`/`#161b22`/`#0a0e14`/`#21262d`/`#30363d`/`rgba(0,255,160`）**及离群色**（第二红 `#ff6b6b`、语法蓝紫 `#79c0ff`/`#bc8cff`/`#a5d6ff`/`#a371f7`、alpha 一次性 `#388bfd88`/`#00c88888`，映射到 `semantic.*`）；`npm run typecheck` 通过；console 无报错
- [ ] T021 `git merge --no-ff` 016→junxiang

## Notes
无新增 npm 依赖；Lucide 图标内联 SVG 自实现。不改后端 / 内容 fixtures / 会话逻辑 / API 契约 / packages。**深色（偏黄）mode 与明暗切换开关为后续 Spec，本 Spec 只做 mode-aware 架构预留。**
