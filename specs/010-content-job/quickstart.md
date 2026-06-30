# Quickstart: 验证 010 Job 题库

## 1. 导入
```sh
cd apps/api
python -m app.db.seed_content --module job
```
预期：`seeded job: 5 categories, 100 items (...)`；重复运行为 `unchanged`。

## 2. API
```sh
python -m uvicorn app.main:app --port 8000 &
curl -s localhost:8000/api/content/jobs | python -c "import sys,json;d=json.load(sys.stdin);print('total',d['total'],'tags',len(d['all_tags']),'arch',[t['count'] for t in d['all_tags'] if t['key']=='architecture'])"
curl -s "localhost:8000/api/content/jobs?category=architecture" | python -c "import sys,json;d=json.load(sys.stdin);print('arch items',len(d['items']))"
curl -s localhost:8000/api/content/jobs/sa01 | python -c "import sys,json;d=json.load(sys.stdin);print('answer?',bool(d['answer']),'keyPoints',len(d['keyPoints']))"
```
预期：`total 100 tags 6 arch [16]`；`arch items 16`；`answer? True keyPoints 5`。

## 3. 前端
```sh
cd apps/web && npm run dev   # /job
```
预期：列表 100 题、过滤栏「全部+5 分类」带计数；点题显示真实答案/要点/关联，带 code 的题显示代码块；空/错误态正常；设计系统一致。

## 4. 测试
```sh
cd apps/api && python -m pytest tests/test_content_jobs.py -q
```

## 5. 回归
Jargon 页（009）与 Chat 会话功能正常。

## 验收对照
SC-001（100 题+计数）→2/3；SC-002（逐字一致）→2/3；SC-003（分类过滤）→2/3；SC-004（导入幂等/条数）→1/4；SC-005（交互/设计）→3；SC-006（无回归）→5。
