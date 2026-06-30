# Feature Specification: 前端视觉/布局重构（UI Redesign）

**Feature Branch**: `015-ui-redesign` · **Created**: 2026-07-01 · **Status**: Draft · **Depends on**: 005–014（页面与数据已就绪）

**Input**: 把旧版 DC 前端的「左导航 + 中主内容 + 右参数/详情」三栏密集终端风布局还原到新版 Next.js 前端，统一设计 token，五页一起；用少量轻量 React Bits 动效点缀。**纯前端视觉/布局重构，不改后端/内容数据/API。**

## 背景
新版功能完整（009–014）但视觉偏简陋；用户偏好旧版三栏密集布局与精致感。本 Spec 仅重构呈现层。

## User Scenarios

### US1 - 学生获得旧版那种密集、专业的三栏体验 (P1) 🎯
进入任意页，看到统一的左导航 + 主内容（+ 右栏参数/详情）布局，间距/字体/配色一致、终端深色风，Chat 还原旧版四区（流程详情 + 对话 + 参数）。

**Acceptance**:
1. 五页共用一致的设计 token（色板/间距/字号/卡片样式）与窄图标左导航。
2. Chat 还原四区：中左逐阶段流程详情卡、中对话、右栏 System Prompt + 参数 + 概率图 + JSON。
3. Code 模拟器还原终端+序列图双栏；Lab/Jargon/Job 还原密集列表/树 + 详情排版。
4. 少量 React Bits 动效（渐变标题/数字滚动/淡入）点缀，不喧宾夺主。
5. 既有功能（流式、过滤、分步、014 交互）行为不变；空/错误态正常；窄屏右栏可收起；console 无报错。

## Requirements
- **FR-001**: 抽取统一设计 token（`lib/theme.ts` + `globals.css` 变量/keyframes），替换各页散落内联字面量。
- **FR-002**: 提供三栏布局外壳与精修后的窄图标导航。
- **FR-003**: Chat 还原四区布局，含 System Prompt 编辑框（发送时前置 system 消息）、逐阶段流程详情卡（复用运行时数据 + 013 文案）。
- **FR-004**: Code/Lab/Jargon/Job 还原旧版密集布局与排版。
- **FR-005**: 引入少量轻量 React Bits 风格动效组件（零依赖/CSS 实现，禁用 Three.js/粒子）。
- **FR-006**: MUST NOT 改后端/内容 fixtures/会话逻辑；保留固定设计系统（`#00ffa0`、JetBrains Mono/Inter）；既有交互无回归。

## Success Criteria
- **SC-001**: 五页布局与视觉对齐旧版三栏密集风，token 统一。
- **SC-002**: Chat 四区齐全且 014 交互（概率图/JSON/逐条指标/思维链）正常。
- **SC-003**: 前端 `npm run typecheck` 通过；既有功能与后端无回归；console 无未捕获错误。

## Assumptions
- 纯前端；React Bits 取轻量动效（自实现，零新增重依赖）。
- System Prompt 作为前端 system 消息前置，无需改后端契约。
- 流程/概率为教学模拟，与旧版一致。
