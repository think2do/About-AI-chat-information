# LLM 机制可视化教学工具 (AI Teaching Tool)

> 面向开发者和技术爱好者的交互式 AI 教学网站。通过可视化动画、逐步演示和真实 API 对接，帮助理解大语言模型的运行机制。

## 项目结构

```text
apps/
  web/          # Next.js + React + TypeScript 前端
  api/          # FastAPI + Python 后端
    app/db/seeds/content/   # 教学内容 JSON fixtures（内容唯一来源）

packages/
  shared/       # 前后端共享类型定义
  content/      # 已归档：教学内容改由后端 SQLite + JSON fixtures 提供（见 specs/009）

specs/          # Spec Kit 规范（每个功能一个 NNN-name/，含 spec/plan/tasks/...）
docs/           # 架构与部署文档
legacy/         # 重构前的 DC 静态原型（已存档，仅作历史/对照，勿编辑；见 legacy/README.md）
```

> **教学内容架构**：Lab / Code / Jargon / Job / Chat 的教学内容存放在后端 SQLite，
> 由 `apps/api/app/db/seeds/content/**/*.json`（git 内唯一来源）经 seeder 导入，
> 通过 `/api/content/*` 暴露给前端拉取渲染。运行时 `.db` 文件不入版本库。

## 快速启动

### 前提条件

- Node.js 22+
- Python 3.11+
- Docker Desktop（可选）

### Docker Compose 一键启动

```sh
docker compose up -d
```

启动后：
- 前端：http://localhost:3000
- 后端 API：http://localhost:8000
- 健康检查：http://localhost:8000/health

### 手动启动

**后端：**

```sh
cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m app.db.seed_content        # 导入教学内容（幂等；dev 启动也会自动 seed）
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

> 内容来自 JSON fixtures，可重复运行 seeder；`SEED_CONTENT_ON_STARTUP=0` 可关闭启动自动导入。
> 后端测试：`python -m pytest tests/ -q`。

**前端：**

```sh
cd apps/web
npm install
npm run dev
```

## API 端点

| Method | Path | 说明 |
|--------|------|------|
| GET | /health | 健康检查（含 DB 状态） |
| POST | /api/chat/stream | SSE 流式聊天（Provider 转发） |
| GET/DELETE | /api/sessions/{id}/conversations[/{cid}] | 匿名会话与对话 CRUD |
| GET | /api/content/jargon | 名词术语（分组树） |
| GET | /api/content/jobs · /jobs/{id} | 面试题列表（过滤）/ 详情 |
| GET | /api/content/code | Code 教学（工具/命令/模拟器/Agent/隐藏） |
| GET | /api/content/lab | Lab 5 演示数据 |
| GET | /api/content/chat/pipeline | Chat 7 阶段 pipeline 教学详情 |

## 技术栈

- **前端**: Next.js 15 + React + TypeScript（页面通过 `/api/*` 代理调用后端）
- **后端**: FastAPI + Python 3.13；SQLite（开发）/ PostgreSQL（生产）
- **内容**: 教学内容入 SQLite，JSON fixtures 为来源，`/api/content/*` 提供
- **部署**: Docker Compose

## 开发状态

- 001–008：工程骨架 / Chat streaming / 匿名会话 / Provider 设置 / 内容页框架 / 管道可视化 / 限流 / 部署 ✅
- **009–013：教学内容迁移到 SQLite** ✅（Jargon 36 词条 / Job 100 题 / Code 52 工具+95 命令 / Lab 5 演示 / Chat 7 阶段 pipeline）
- 014：Chat 交互增强（概率分布图 / 滑块联动 / 逐条指标 / 思维链）进行中

各阶段设计文档见 [specs/](specs/)。
