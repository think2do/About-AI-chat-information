# AI Teaching Tool — Deployment Guide

## 环境要求

- Docker 24+ & Docker Compose v2
- 或: Node.js 20+, Python 3.11+

## 快速启动（Docker Compose）

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env 填写你的配置

# 2. 启动所有服务
docker-compose up -d

# 3. 验证
curl http://localhost:8000/health
# → {"status":"ok","service":"teaching-tool-api","version":"0.1.0","database":"ok"}

# 4. 打开浏览器
open http://localhost:3000
```

## 手动启动（开发模式）

```bash
# 后端
cd apps/api
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 前端
cd apps/web
npm install
npm run dev
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `API_PORT` | 8000 | 后端端口 |
| `WEB_PORT` | 3000 | 前端端口 |
| `DATABASE_URL` | `sqlite:///data/teaching_tool.db` | SQLite 或 PostgreSQL URL |
| `DB_USER` | teaching_tool | PostgreSQL 用户 |
| `DB_PASSWORD` | teaching_tool | PostgreSQL 密码 |
| `DB_NAME` | teaching_tool | PostgreSQL 数据库名 |
| `NEXT_PUBLIC_API_URL` | http://localhost:8000 | 前端连接的后端地址 |

## 数据库迁移（SQLite → PostgreSQL）

```bash
# 1. 准备 PostgreSQL
docker-compose up -d db

# 2. 执行迁移
docker-compose exec db psql -U teaching_tool -d teaching_tool -f /app/db/migrate_to_pg.sql

# 3. 更新环境变量
echo "DATABASE_URL=postgresql://teaching_tool:teaching_tool@db:5432/teaching_tool" >> .env

# 4. 重启服务
docker-compose restart api
```

## 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f api

# 重启单个服务
docker-compose restart web

# 停止所有服务
docker-compose down

# 清理数据（慎用）
docker-compose down -v
```

## 停止与更新

```bash
# 停止
docker-compose down

# 更新到最新代码
git pull
docker-compose build --no-cache
docker-compose up -d
```
