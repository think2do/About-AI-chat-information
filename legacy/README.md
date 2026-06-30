# legacy/ — 重构前的 DC 原型（已存档）

这里是项目**重构前**的第一版前端：一套基于自研 "DC" 框架的**纯静态 HTML** 原型（`support.js` 运行时 + `*.dc.html` 页面 + `Job.data.js` 数据）。

正式版已迁移为 monorepo（`apps/web` Next.js + `apps/api` FastAPI，内容入 SQLite）。本目录**仅作历史参考与新旧对照**，请勿用于新开发，也不要编辑（`support.js` 是生成产物）。

## 本地对照查看
```sh
cd legacy
python3 -m http.server 8090 --bind 127.0.0.1
# 打开 http://127.0.0.1:8090/index.html
```
> 必须用静态服务器打开（`file://` 下 `dc-import` 取不到兄弟 `.dc.html`）。页面间用普通 `<a href>` 跳转：Chat(index.html) / Lab / Code / Jargon(名词) / Job(求职)。需要联网（`support.js` 从 CDN 加载 React）。

## 文件
- `index.html` — Chat / Playground（唯一调用真实 LLM API 的页）
- `Lab.dc.html` / `Code.dc.html` / `Jargon.dc.html` / `Job.dc.html` — 四个教学页
- `Nav.dc.html` — 共享左侧导航
- `Job.data.js` — 旧面试题数据（`window.JOB_DATA`，已迁入 `apps/api/app/db/seeds/content/job/`）
- `support.js` — DC 框架运行时（生成文件）
- `styles.css` — 全局样式
