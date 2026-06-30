# Quickstart: 验证 011 Code

## 1. 导入
```sh
cd apps/api && python -m app.db.seed_content --module code
```
预期：`seeded code: 13 categories, 177 items (...)`；重复为 unchanged。

## 2. API
```sh
python -m uvicorn app.main:app --port 8000 &
curl -s localhost:8000/api/content/code | python -c "import sys,json;d=json.load(sys.stdin);t=d['tools']['categories'];c=d['commands']['categories'];print('toolcats',len(t),'tools',sum(x['count'] for x in t),'cmdcats',len(c),'cmds',sum(x['count'] for x in c),'sim',len(d['simulator']),'agent',len(d['agentLoop']),'hidden',len(d['hidden']))"
```
预期：`toolcats 8 tools 52 cmdcats 5 cmds 95 sim 11 agent 11 hidden 8`。

## 3. 前端
```sh
cd apps/web && npm run dev   # /code
```
预期：五 Tab；工具 52/8 分类、命令 95/5 分类、实验性带 🔒、点击看详情；模拟器分步推进 11 步并可重置；Agent 循环 11 步；隐藏功能 8 项；空/错误态正常；设计系统一致。

## 4. 测试 & 回归
```sh
cd apps/api && python -m pytest tests/ -q   # 全绿，含 009/010 无回归
cd apps/web && npm run typecheck
```
