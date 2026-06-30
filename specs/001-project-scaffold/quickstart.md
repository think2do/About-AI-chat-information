# Quickstart: 工程骨架验证指南

**Feature**: 001-project-scaffold | **Date**: 2026-06-30

## Prerequisites

- Node.js 22+
- Python 3.11+
- Docker Desktop (optional, for Docker Compose mode)

## Validation Scenarios

### Scenario 1: 后端 Health Check

```sh
cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

**验证**:
```sh
curl -s http://127.0.0.1:8000/health
```

**期望输出**: `{"status":"ok","service":"teaching-tool-api","version":"0.1.0"}`

---

### Scenario 2: 前端 Dev Server + 页面路由

```sh
cd apps/web
npm install
npm run dev
```

**验证** (浏览器访问):
| URL | 期望 |
|-----|------|
| `http://localhost:3000/` | Chat 占位页 + 左侧导航栏 |
| `http://localhost:3000/lab` | Lab 占位页 |
| `http://localhost:3000/code` | Code 占位页 |
| `http://localhost:3000/jargon` | Jargon 占位页 |
| `http://localhost:3000/job` | Job 占位页 |
| `http://localhost:3000/nonexistent` | 404 页面 |

---

### Scenario 3: TypeScript 类型检查

```sh
cd apps/web
npx tsc --noEmit
```

**期望**: 零错误输出。

---

### Scenario 4: Docker Compose 一键启动

```sh
docker compose up -d
```

**验证**:
```sh
curl -s http://localhost:8000/health
# → {"status":"ok",...}

curl -s http://localhost:3000/ | head -5
# → HTML 内容（前端页面）
```

**清理**:
```sh
docker compose down
```

---

### Scenario 5: 共享类型可引用

```sh
cd apps/web
node -e "const p = require('@teaching-tool/shared'); console.log('OK')"
```

**期望**: 无模块找不到错误。（注：具体 import 方式取决于 packages/shared 的 package.json exports 配置）

---

## Success Criteria Mapping

| SC | 验证方式 |
|----|----------|
| SC-001 (10 分钟启动) | Scenario 4 Docker Compose 全程计时 |
| SC-002 (5 页面 200) | Scenario 2 逐一访问 |
| SC-003 (health < 1s) | `time curl /health` |
| SC-004 (编译零错误) | Scenario 3 `tsc --noEmit` |
| SC-005 (Docker 一键) | Scenario 4 `docker compose up -d` |
