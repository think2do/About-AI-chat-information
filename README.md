# LLM 机制可视化教学工具 (AI Teaching Tool)

> 面向开发者和技术爱好者的交互式 AI 教学网站。通过可视化动画、逐步演示和真实 API 对接，帮助理解大语言模型的运行机制。

## 项目结构

```text
apps/
  web/          # Next.js + React + TypeScript 前端
  api/          # FastAPI + Python 后端

packages/
  shared/       # 前后端共享类型定义
  content/      # 教学内容模块（Lab/Code/Jargon/Job）
```

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
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**前端：**

```sh
cd apps/web
npm install
npm run dev
```

## API 端点

| Method | Path | 说明 |
|--------|------|------|
| GET | /health | 健康检查 |

## 技术栈

- **前端**: Next.js 15 + React 19 + TypeScript
- **后端**: FastAPI + Python 3.11+
- **部署**: Docker Compose

## 开发状态

当前为工程骨架阶段（Spec 001）。后续 Spec 将逐步实现 Chat streaming、匿名会话、管道可视化等功能。

详见 [specs/001-project-scaffold/](specs/001-project-scaffold/) 的完整设计文档。
