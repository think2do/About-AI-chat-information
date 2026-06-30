# Implementation Plan: Chat Pipeline 阶段详情迁移

**Branch**: `013-content-chat` · **Date**: 2026-07-01 · **Spec**: [spec.md](./spec.md)

## Summary
迁移 7 阶段 pipeline 教学内容到 009 内容表，`GET /api/content/chat/pipeline` 提供，增强 `PipelineVisualization` 支持点击展开阶段详情（含后端不可用兜底）。复用 009，不改其核心；不动 Chat 流式逻辑。

## Technical Context
沿用 009 栈。数据：7 阶段 {num,label,short,detail,color}。范围限定为静态阶段教学内容；运行时动态展示与概率/滑块/CoT/逐条指标不在本 Spec。

## Constitution Check
| 原则 | 评估 |
|------|------|
| I 关注点分离 | ✅ 阶段文案入库、API 提供、组件渲染；进度高亮/流式等交互留前端 |
| II Spec 合规 | ✅ 复用 009、衔接 006；无新增宪法偏离；明确范围边界 |
| III YAGNI | ✅ 只迁可入库的静态内容；不重建计算型交互 |
| IV 测试 | ✅ 契约（7 阶段结构）+ seeder 条数断言 |
| V 可回溯 | ✅ 文档齐全；旧 index.html 保留；范围决策记录在案 |

## Project Structure
```text
apps/api/app/
├── db/seeds/content/chat/pipeline.json   # [新] 7 阶段
├── db/seed_content.py                    # [改] _load_chat + MODULE_REGISTRY['chat']
├── services/content_service.py           # [改] get_chat_pipeline()
├── routers/content.py                    # [改] GET /chat/pipeline
└── models/content.py                     # [改] PipelineStageContent/ChatPipelineResponse
apps/api/tests/test_content_chat.py       # [新]
apps/web/src/components/PipelineVisualization.tsx  # [改] 取 API + 点击展开 + 兜底
packages/shared/src/content.ts            # [改] 类型 + 再导出
```
**Structure Decision**: 纯增量。item_type='pipeline-stage'（7 条目）；无分类、无 meta。

## Complexity Tracking
无新增偏离。
