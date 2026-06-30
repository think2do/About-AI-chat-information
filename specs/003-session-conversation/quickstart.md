# Quickstart: 匿名会话与对话保存 验证指南

**Feature**: 003-session-conversation | **Date**: 2026-06-30

## 前置条件

1. `docker-compose up -d` 启动前后端
2. 打开 http://localhost:3000

## 验证场景

### VS-1: 首次访问自动生成 session_id (SC-001)

**步骤**:
1. 打开新浏览器或无痕窗口
2. 访问 http://localhost:3000
3. 打开 DevTools → Application → Local Storage

**预期**: localStorage 中存在 `teaching_tool_session_id`，值为 `anon_` 开头，刷新后不变

### VS-2: Chat 完成后对话自动保存 (SC-002)

**步骤**:
1. 配置 API Key → 发送一条 Chat 消息
2. 等待流式回复完成
3. 查看左侧对话列表

**预期**: < 1 秒内新对话出现在列表中，标题为第一条消息的前 50 字符

### VS-3: 删除对话 (SC-003)

**步骤**:
1. 在对话列表中点击某条对话的删除按钮
2. 确认删除

**预期**: 对话 < 1 秒内从列表中消失，刷新后不再出现

### VS-4: 多轮对话追加

**步骤**:
1. 选中一条已有对话 → 继续发送新消息
2. 等待回复完成

**预期**: 新消息追加到同一对话中，消息顺序正确

### VS-5: Session 数据隔离 (SC-005)

**步骤**:
1. 用两个不同浏览器各发起 1 次 Chat
2. 在浏览器 A 中查看对话列表

**预期**: 浏览器 A 只能看到自己 session 的对话，看不到浏览器 B 的

### VS-6: 过期对话过滤 (SC-004)

**步骤**:
1. 手动将某条对话的 expires_at 改为过去时间（SQLite CLI）
2. 查看对话列表

**预期**: 该对话不再出现在列表中

## 质量门

- [ ] TypeScript 编译零错误
- [ ] Python 语法检查通过
- [ ] VS-1 至 VS-6 全部通过
- [ ] 跨 session 数据隔离验证
