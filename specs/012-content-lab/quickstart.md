# Quickstart: 验证 012 Lab

## 1. 导入
```sh
cd apps/api && python -m app.db.seed_content --module lab
```
预期：`seeded lab: 0 categories, 25 items (...)`；重复为 unchanged。

## 2. API
```sh
python -m uvicorn app.main:app --port 8000 &
curl -s localhost:8000/api/content/lab | python -c "import sys,json;d=json.load(sys.stdin);print('fc',len(d['functionCall']),'infer',len(d['inference']),'rag',len(d['rag']),'modes',len(d['tokenizer']['modes']),'cards',len(d['tokenizer']['quickref']['cards']),'q?','{q}' in d['training']['baseTemplate'])"
```
预期：`fc 5 infer 10 rag 10 modes 3 cards 4 q? True`。

## 3. 前端
```sh
cd apps/web && npm run dev   # /lab
```
预期：5 Tab；函数调用分步 5、推理 10、RAG 10（两阶段）可推进/重置；分词 3 模式切换柱状对比 + 速查 4 卡；训练对比输入问题流式对比；空/错误态正常；设计系统一致。

## 4. 测试 & 回归
```sh
cd apps/api && python -m pytest tests/ -q
cd apps/web && npm run typecheck
```
回归：009/010/011 与 Chat 正常。
