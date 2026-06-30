# Acceptance Checklist — AI Teaching Tool

**Version**: 0.1.0 | **Last Updated**: 2026-06-30

## 前端验收 (6 项)

- [ ] **F1**: 5 页面可访问 — `/` (Chat), `/lab`, `/code`, `/jargon`, `/job` 均正常加载
- [ ] **F2**: Chat 流式功能 — 配置 API Key 后发送消息，AI 回复逐字流式出现
- [ ] **F3**: 设置持久化 — 在设置中保存 Provider/Key/Model，刷新页面后配置不丢失
- [ ] **F4**: 匿名 Session — 首次访问自动生成 session_id，对话历史正确显示
- [ ] **F5**: Pipeline 可视化 — 发送消息后 7 阶段管道依次激活展示
- [ ] **F6**: 4 个教学页面内容完整 — Lab/Code/Jargon/Job 交互正常

## 后端验收 (7 项)

- [ ] **B1**: Health check — `GET /health` 返回 `{"status":"ok",...}`
- [ ] **B2**: Chat streaming — `POST /api/chat/stream` 正常流式返回
- [ ] **B3**: API Key 安全 — 后端日志/错误响应中无 API Key 明文
- [ ] **B4**: 对话保存 — Chat 完成后对话自动出现在列表中
- [ ] **B5**: 30 天过期 — 过期对话在列表中自动过滤
- [ ] **B6**: 错误归一化 — 无效 Key 返回中文友好提示
- [ ] **B7**: 删除对话 — DELETE 端点正常工作，跨 session 隔离

## 并发验收 (5 项)

- [ ] **C1**: 20 并发不串扰 — 不同 session 的回复互不交叉
- [ ] **C2**: 多轮对话归属 — 同一 conversation 消息顺序正确
- [ ] **C3**: 取消释放连接 — 点击取消后 SSE 连接正确关闭
- [ ] **C4**: 断流友好提示 — 网络中断后前端显示中文提示
- [ ] **C5**: 限流触发 — 超过 10 req/min 后返回 429

## 部署验收 (5 项)

- [ ] **D1**: Docker Compose 一键启动 — `docker-compose up -d` 三服务全部 healthy
- [ ] **D2**: 环境变量配置 — 修改 `.env` 后服务使用新配置
- [ ] **D3**: 数据持久化 — 容器重启后对话数据不丢失
- [ ] **D4**: 前端独立部署 — 通过 `NEXT_PUBLIC_API_URL` 指向远程后端
- [ ] **D5**: 健康检查 — 所有服务 health check 通过
