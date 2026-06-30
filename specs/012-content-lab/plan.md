# Implementation Plan: Lab 交互演示迁移

**Branch**: `012-content-lab` · **Date**: 2026-07-01 · **Spec**: [spec.md](./spec.md)

## Summary
迁移 5 个 Lab 演示数据到 009 内容表（fc5/infer10/rag10 条目 + training/tokenizer 两 meta），单一 `GET /api/content/lab` 返回全部，前端用 React 重建 5 个演示的动画/交互。复用 009，不改其核心。

## Technical Context
沿用 009 栈。数据事实：fc5/infer10/rag10 + 训练模板 + 分词 3 模式（已核验）。动画（流式打字、分步、模式切换）留前端。

## Constitution Check
| 原则 | 评估 |
|------|------|
| I 关注点分离 | ✅ 数据入库、API 提供、前端渲染；动画/交互逻辑留前端，不入库 |
| II Spec 合规 | ✅ 复用 009；无新增宪法偏离 |
| III YAGNI | ✅ 复用表/seeder；单一聚合端点；不引入动画引擎 |
| IV 测试 | ✅ 契约（结构+计数）+ seeder 条数断言 |
| V 可回溯 | ✅ 文档齐全；旧 Lab.dc.html 保留 |

## Project Structure
```text
apps/api/app/
├── db/seeds/content/lab/{function_call,inference,rag,training,tokenizer}.json  # [新]
├── db/seed_content.py            # [改] _load_lab + MODULE_REGISTRY['lab']
├── services/content_service.py   # [改] get_lab()
├── routers/content.py            # [改] GET /lab
└── models/content.py             # [改] Lab* 模型
apps/api/tests/test_content_lab.py # [新]
apps/web/src/app/lab/page.tsx      # [改] 5 Tab 从 API + React 动画重建
packages/shared/src/content.ts     # [改] Lab* 类型 + 再导出
```
**Structure Decision**: 纯增量。item_type：fc-step/infer-step/rag-step（25 条目）；training/tokenizer 入 content_meta；无分类（0）。

## Complexity Tracking
无新增偏离。
