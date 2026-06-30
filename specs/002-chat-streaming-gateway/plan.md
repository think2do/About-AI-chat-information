# Implementation Plan: Chat Streaming 网关 (Chat Streaming Gateway)

**Branch**: `002-chat-streaming-gateway` | **Date**: 2026-06-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-chat-streaming-gateway/spec.md`

## Summary

实现 POST /api/chat/stream 最小闭环——前端发送聊天请求，后端通过 ProviderAdapter 统一转发到 LLM Provider，以 SSE 格式流式返回。核心交付：后端 ChatStreamService + ProviderAdapter 体系 + 8 种错误码归一化，前端 Chat 页面（消息输入、流式渲染、取消控制、错误展示）。

## Technical Context

**Language/Version**: TypeScript 5.x (frontend), Python 3.11+ (backend)

**Primary Dependencies**: Next.js 15 (App Router), React 19, FastAPI, Uvicorn, httpx (Python async HTTP with stream support)

**Storage**: N/A (本阶段无持久化——对话保存由 Spec 3 负责)

**Testing**: `tsc --noEmit` (前端类型检查), Python `py_compile` (后端语法), manual browser test per quickstart.md

**Target Platform**: Web (browser + server), Docker Compose 本地开发环境

**Performance Goals**: 后端转发延迟（TTFT overhead）< 200ms；20 并发无串扰；API Key 零泄露（日志/错误/响应中不可出现）

**Constraints**: API Key 不得持久化（Constitution Security & Privacy）；ProviderAdapter 隔离 Provider 差异；SSE 协议不可变；错误消息中文友好

**Scale/Scope**: 1 个 POST 端点 + 4 个 ProviderAdapter + 8 种错误码 + Chat 前端页面（约 500 行 tsx）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. 关注点分离 | ✅ PASS | 前端（Chat UI + SSE 消费）/ 后端（ProviderAdapter + 流式转发）/ 共享类型（ChatStreamEvent），三层边界清晰。ProviderAdapter 隔离各 Provider 差异 |
| II. Spec 与文档规范 | ✅ PASS | 基于已批准的 spec.md，FR-001~010 逐条对应设计决策 |
| III. 第一性原理 | ✅ PASS | 仅引入 httpx（Python 异步 HTTP 的合理依赖，用于 Provider 调用）。不引入 WebSocket、消息队列、缓存等当前不需要的组件 |
| IV. 测试覆盖 | ✅ PASS | 骨架阶段以类型检查 + 语法检查为质量门；quickstart.md 提供手动端到端验证场景；Spec 7 补充完整错误处理测试 |
| V. 过程可回溯 | ✅ PASS | plan.md + research.md + data-model.md + contracts/ + quickstart.md 全部留存 |

## Project Structure

### Documentation (this feature)

```text
specs/002-chat-streaming-gateway/
├── plan.md              # This file
├── research.md          # Phase 0: 技术选型确认
├── data-model.md        # Phase 1: 类型实体细化
├── quickstart.md        # Phase 1: 验证指南
├── contracts/           # Phase 1: API contracts
│   └── chat-streaming-api.md
└── tasks.md             # Phase 2: /speckit-tasks 生成
```

### Source Code (repository root — incremental changes)

```text
apps/api/
  app/
    services/
      __init__.py
      chat_stream_service.py    # ChatStreamService: 编排流式请求
    adapters/
      __init__.py
      base.py                   # ProviderAdapter 抽象基类
      openrouter_adapter.py     # OpenRouter 适配器
      aihubmix_adapter.py       # AI HubMix 适配器
      packy_adapter.py          # Packy API 适配器
      custom_adapter.py         # 自定义 Provider 适配器
    routers/
      chat.py                   # POST /api/chat/stream 端点
    models/
      __init__.py
      request.py                # ChatStreamRequest Pydantic 模型
      events.py                 # SSE 事件序列化工具
    errors/
      __init__.py
      codes.py                  # 8 种错误码枚举 + 中文消息映射
      normalization.py          # Provider 错误归一化函数
  requirements.txt              # 新增 httpx 依赖

apps/web/
  src/
    app/
      page.tsx                  # Chat 页面（替换占位符）
    components/
      ChatArea.tsx              # 聊天区域组件（消息列表 + 流式渲染）
      ChatInput.tsx             # 消息输入框 + 发送/取消按钮
      ErrorBubble.tsx           # 错误提示气泡组件
    lib/
      sse-client.ts             # 前端 SSE 流式消费（fetch + ReadableStream）
      api.ts                    # Chat API 请求封装

packages/shared/
  src/
    events.ts                   # 更新：ChatStreamEvent 类型细化（各 event payload）
    chat.ts                     # 更新：ChatStreamRequest 类型
```

**Structure Decision**: ProviderAdapter 采用策略模式——每个 Provider 一个 adapter 类继承 BaseProviderAdapter。错误归一化独立为 errors/ 模块。前端 SSE 消费封装在 lib/sse-client.ts 中。

## Complexity Tracking

> No violations — all Constitution checks passed without exceptions.
