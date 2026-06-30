# Quickstart: 验证 009 Content Foundation（Jargon 端到端）

验证「DB → API → 前端」全链路：fixtures 导入 SQLite → `/api/content/jargon` 提供 → 名词页渲染。

## 前置

- 已切到分支 `009-content-foundation`，本 Spec 代码已实现。
- Python 依赖：`fastapi uvicorn aiosqlite pydantic httpx pytest`（pytest 仅测试用）。
- Node 依赖：`apps/web` 已 `npm install`。

## 1. 后端：导入内容（CLI 主路径）

```sh
cd apps/api
python -m app.db.seed_content --module jargon
```

**预期**：输出形如 `seeded jargon: 6 categories, 36 terms`；条数断言通过。再跑一次应为幂等无操作（`unchanged`），不报错、不重复。

> 故意把 `seeds/content/jargon/terms.json` 删掉一条再跑 `--force` 应**显式失败**并报告条数不符（验证 FR-010 / SC-004）。验证后恢复。

## 2. 后端：启动并 curl

```sh
cd apps/api
python -m uvicorn app.main:app --reload --port 8000
```

```sh
curl -s http://localhost:8000/api/content/jargon | python -m json.tool | head -40
curl -s http://localhost:8000/api/content/jargon | python -c "import sys,json;d=json.load(sys.stdin);print('total',d['total'],'cats',len(d['categories']))"
```

**预期**：`total 36 cats 6`；第一个分类 `slug=model-arch`；响应头含 `Cache-Control: public, max-age=300`（`curl -I` 或 `-D -` 查看）。

## 3. 前端：查看名词页

```sh
cd apps/web
npm run dev   # http://localhost:3000/jargon
```

**预期**：
- 左侧 6 个分类，可展开/折叠；副标题词条数为**动态**「36 个术语 · 6 大分类」（不再硬编码 43）。
- 点击术语 → 右侧显示通俗解释（绿框）+ 技术解释（蓝框）；未选择时显示占位提示。
- 浏览器 Network 面板可见对 `/api/content/jargon` 的请求；**关闭后端**后刷新 → 页面显示友好错误/空态，console 无未捕获异常。
- 视觉与改造前一致（`#00ffa0`、JetBrains Mono / Inter）。

## 4. 自动化测试

```sh
cd apps/api
python -m pytest tests/test_content_jargon.py -q
```

**预期**：端点契约测试 + seeder 条数断言全部通过。

## 5. 回归（不破坏既有功能）

- Chat 页（`/`）发送消息、查看历史对话正常 → 确认内容表新增未影响 sessions/conversations/messages。

## 6. 版本控制卫生

```sh
git status --short        # apps/api/data/*.db 不应出现在待提交列表
git check-ignore apps/api/data/teaching_tool.db   # 应命中 .gitignore
```

**预期**：`.db` 已被忽略且已 `git rm --cached`；提交内容仅含 fixtures(JSON)、后端代码、前端改造、共享类型。

---

## 验收对照（spec Success Criteria）

| 步骤 | 覆盖 |
|------|------|
| 1 | SC-003（幂等无操作）、SC-004（条数不符显式失败） |
| 2 | SC-001（36/6、内容来自后端）、FR-013（缓存头） |
| 3 | SC-001 / SC-005（交互、动态计数、错误态、设计系统） |
| 4 | FR-010 / 契约测试 |
| 5 | SC-007（无回归） |
| 6 | D6 / Clarifications（.db 不入库） |
