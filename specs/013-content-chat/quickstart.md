# Quickstart: 验证 013 Chat Pipeline

## 1. 导入
```sh
cd apps/api && python -m app.db.seed_content --module chat
```
预期：`seeded chat: 0 categories, 7 items (...)`；重复为 unchanged。

## 2. API
```sh
python -m uvicorn app.main:app --port 8000 &
curl -s localhost:8000/api/content/chat/pipeline | python -c "import sys,json;d=json.load(sys.stdin);print('stages',len(d['stages']),'first',d['stages'][0]['label'],'detail?',bool(d['stages'][0]['detail']))"
```
预期：`stages 7 first 上下文组装 detail? True`。

## 3. 前端
```sh
cd apps/web && npm run dev   # /
```
预期：Chat 页 7 阶段进度条；点击阶段展开 detail 教学说明、再点收起；流式对话/会话保存正常；关闭后端后进度条仍兜底显示、聊天报错友好；设计系统一致。

## 4. 测试 & 回归
```sh
cd apps/api && python -m pytest tests/ -q
cd apps/web && npm run typecheck
```
回归：009/010/011/012 与 Chat 流式正常。
