# Quickstart: Chat Streaming 网关 验证指南

**Feature**: 002-chat-streaming-gateway | **Date**: 2026-06-30

## 前置条件

1. Docker Compose 环境已启动（`docker-compose up -d`），或手动启动前后端
2. 浏览器已打开 http://localhost:3000
3. 准备一个有效的 OpenRouter API Key（或其他 Provider 的 Key）

## 验证场景

### VS-1: 正常流式聊天 (映射 SC-001, SC-006)

**目的**: 验证核心流式链路——发送消息到看到逐字回复。

**步骤**:
1. 打开 Chat 页面 (http://localhost:3000)
2. 在设置中配置 OpenRouter API Key、Base URL、Model
3. 在输入框输入「什么是 Transformer？」
4. 点击发送按钮
5. 观察 AI 回复逐字出现在聊天区域

**预期结果**:
- 点击发送后 < 500ms 内看到第一个字出现（request_started 事件到首个 delta）
- 回复内容逐字追加，打字效果流畅
- 回复完成后显示完整内容
- 发送按钮在流式进行中处于禁用状态

**对应 Success Criteria**: SC-001, SC-006

### VS-2: 取消流式传输 (映射 US1 Acceptance Scenario 3)

**目的**: 验证取消功能——流式进行中点击取消能立即停止。

**步骤**:
1. 发送一条消息（建议选择长回复的问题）
2. 在流式回复进行中时点击「取消」按钮
3. 观察聊天区域

**预期结果**:
- 流式传输立即停止
- 已收到的部分内容保留在聊天区
- 发送按钮恢复可用

### VS-3: API Key 无效错误 (映射 SC-002, SC-005)

**目的**: 验证无效 Key 时的友好错误提示。

**步骤**:
1. 在设置中填写一个明显无效的 API Key（如 `sk-invalid-key`）
2. 发送消息
3. 观察错误提示

**预期结果**:
- < 2 秒内显示「Provider 认证失败，请检查你的 API Key」
- 错误提示高亮设置入口
- 不显示任何英文技术堆栈或原始错误码
- 浏览器控制台 Network 标签中，错误响应不含 API Key

**对应 Success Criteria**: SC-002, SC-005

### VS-4: 未配置 API Key 前端拦截 (映射 FR-009)

**目的**: 验证前端在发送前拦截无 Key 请求。

**步骤**:
1. 清空设置中的 API Key 字段并保存
2. 在 Chat 页面输入消息并点击发送

**预期结果**:
- 前端显示红色错误提示「请先配置 API Key」
- 浏览器 Network 标签中无请求发出

### VS-5: 多 Provider 切换 (映射 US3)

**目的**: 验证切换 Provider 后请求正确路由。

**步骤**:
1. 配置两个不同 Provider 的 Key
2. 从 Provider A 切换到 Provider B 并保存
3. 发送消息
4. 观察后端日志（开发模式下可查看）确认请求发到了 Provider B

**预期结果**:
- AI 回复正常流式返回
- 5 秒内完成切换并开始收到流式回复（SC-003）

### VS-6: API Key 零泄露检查 (映射 SC-004, FR-004)

**目的**: 验证 API Key 不在任何持久化位置出现。

**步骤**:
1. 发送一次正常的 Chat 请求
2. 检查后端日志输出（stdout/stderr）
3. 检查浏览器 Console 输出
4. 检查 error 事件响应内容

**预期结果**:
- 后端日志中不出现 API Key 明文
- 错误响应 body 中不包含 API Key
- 浏览器 Console 不输出 API Key

**对应 Success Criteria**: SC-004

### VS-7: 超长消息拒绝 (映射 Edge Case)

**目的**: 验证后端拒绝超过 10 万字符的消息。

**步骤**:
1. 构建一条超过 10 万字符的消息（可在 Console 中执行）
2. 发送请求

**预期结果**:
- 后端返回 `VALIDATION_ERROR`
- 前端显示中文错误提示

## 质量门

- [ ] TypeScript 编译零错误 (`cd apps/web && npx tsc --noEmit`)
- [ ] Python 语法检查通过 (`python3 -m py_compile apps/api/app/**/*.py`)
- [ ] VS-1 至 VS-7 全部通过
- [ ] API Key 在日志/错误响应中零出现
- [ ] 20 并发无串扰（可选，spec 7 会完善）
