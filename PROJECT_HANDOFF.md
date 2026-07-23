# About AI Payload 项目交接总览

> 最后更新：2026-07-23（Asia/Shanghai）  
> 适用仓库：`/Users/shixuan/qieman_project/project_0713_web`  
> 当前部署分支：`sites-deploy`  
> Payload 应用功能基线（创建本交接文件前）：`ba52811098558a9771ffe4597f89dcb40c02f647`  
> 线上地址：<https://about-ai-cms.vercel.app>

## 0. 新接手的 GPT 先读这里

1. 当前真正部署给团队体验的是 `experiments/payload/`，不是根仓库的 `apps/web` + `apps/api`。
2. 当前线上版本已经能用：官网、名词学习、求职题库、活动展示与报名、作品展示、联系我们、普通用户登录/注册、个人中心和 Payload Admin 均已上线。
3. 本项目首版边界是 **Payload + PostgreSQL + Next.js + TypeScript + S3**，只做官网内容、活动发布与报名、后台管理和基础登录，不要擅自扩成完整教育平台。
4. 云端使用 Vercel + Supabase PostgreSQL + Supabase Storage S3，固定域名为 <https://about-ai-cms.vercel.app>。
5. 所有生产密码、S3 密钥和 Payload Secret 都不在本文件中，凭据只在 Vercel 加密环境变量与 macOS Keychain 中保存。
6. 当前仓库有其他模块的未提交改动，**禁止执行 `git add .`、`git reset --hard` 或覆盖式清理**；只能暂存明确需要提交的文件。
7. 与用户沟通时默认使用简体中文，并且用户要求项目相关回复的每一句都带“诗轩”。

## 1. 产品目标与范围

### 1.1 一句话定位

About AI 是面向 AI 小白、学习者、极客和行业从业者的社区型综合 AI 官网，承载学习内容、求职题库、社区活动、作品展示和开源共建入口。

### 1.2 首版明确包含

- 统一品牌官网与可后台维护的首页内容。
- LLM 名词学习与求职面试题库。
- 活动发布、活动展示、站内报名、取消报名与个人报名记录。
- 公开作品展示。
- 联系我们、Github 共建信息与二维码入口。
- Payload Admin 内容管理。
- 管理员、编辑、普通用户角色与基础邮箱密码登录/注册。
- PostgreSQL 持久化和 S3 兼容媒体存储。

### 1.3 首版明确不包含或尚未实现

- 不做完整教育平台。
- “AI 模型训练模拟平台”只展示“即将上线”，不建业务功能。
- 普通用户作品投稿、附件上传、管理员审核和审核结果尚未实现。
- 普通用户邮箱验证、忘记密码、重设密码尚未做成完整前台流程。
- 独立活动详情路由、作品详情路由和作品投稿路由尚未实现；当前活动详情/报名在 `/events` 页面内完成。
- Payload 子项目目前没有 `/lab` 和 `/code` 页面，教学侧边栏中的相应链接会进入 404。
- Chat 教学页未迁入 Payload 子项目，教学侧边栏的 Chat 链接当前回到官网首页 `/`。
- PRD 提到的私密 `submission-files` 存储尚未建立；当前只有公开 `media` bucket。

## 2. 需求和视觉真相来源

### 2.1 PRD

- 本机文件：`/Users/shixuan/Downloads/AI综合平台官网-PRD-v1.0.md`
- 版本：v1.0
- 日期：2026-07-19
- 注意：PRD 描述了更完整的后续能力，当前实现应以本文件的“已上线/未实现”状态为准。

### 2.2 Figma

- [About AI 网站｜黑白线框原型](https://www.figma.com/design/aNldKq1oWVuj3pUvYCLBme/About-AI-%E7%BD%91%E7%AB%99%EF%BD%9C%E9%BB%91%E7%99%BD%E7%BA%BF%E6%A1%86%E5%8E%9F%E5%9E%8B?node-id=0-1)
- Figma 主要是前端页面和交互参考，后台字段由 Payload 数据模型承接。
- `/learn` 与 `/job` 被要求严格对齐参考页面的布局、内容、明暗主题和响应式行为。

### 2.3 `/learn` 与 `/job` 的参考站

- 名词参考：<https://ai-teaching-lab-shixuan.lxkgpt2026.chatgpt.site/jargon>
- 求职参考：<https://ai-teaching-lab-shixuan.lxkgpt2026.chatgpt.site/job>
- 本地/线上实现路由分别统一为 `/learn` 与 `/job`。
- 设计验证说明：`experiments/payload/design-qa.md`
- 设计证据目录：`experiments/payload/design-evidence/`、`experiments/payload/design-qa-assets/`
- 上述设计 QA 资料当前仍未提交到 Git，只有本机工作区可见。

## 3. 仓库定位与模块边界

```text
project_0713_web/
├── apps/web/                    # 原 Next.js 教学工具，不是当前 Payload 线上站
├── apps/api/                    # 原 FastAPI 服务，不是当前 Payload 线上站
├── packages/                    # 原共享包
├── specs/                       # 原教学工具规格
├── legacy/                      # 历史原型
├── experiments/directus/        # 独立 Directus 实验，与本任务无关
├── experiments/payload/         # 当前 About AI 线上应用
└── PROJECT_HANDOFF.md           # 本交接文件
```

`experiments/payload/` 是一套独立的 Payload + Next.js 全栈应用，不替换原 `apps/web`、FastAPI、SQLite 内容服务或其他 CMS 实验。

根目录 `README.md`、`docs/deployment/` 和 `specs/001-*` 至 `specs/017-*` 主要描述原始教学工具，不是当前 Payload 云端部署说明；Payload 任务优先以本文件和 `experiments/payload/README.md` 为准。

关键入口：

- `experiments/payload/src/payload.config.ts`：Payload、PostgreSQL、S3、CORS、Admin 总配置。
- `experiments/payload/src/collections/`：所有 Collection。
- `experiments/payload/src/globals/SiteSettings.ts`：官网全局配置。
- `experiments/payload/src/app/(frontend)/`：官网和普通用户页面/API。
- `experiments/payload/src/app/(payload)/`：Payload Admin、REST 和 GraphQL。
- `experiments/payload/src/seed/index.ts`：幂等初始化数据。
- `experiments/payload/src/seed/fixtures/`：内置教学内容数据。
- `experiments/payload/src/migrations/`：数据库 migration。
- `experiments/payload/scripts/`：本地基础设施、seed 和集成验证脚本。
- `experiments/payload/src/payload-types.ts`：Payload 自动生成类型。

## 4. 当前技术栈

| 层 | 当前实现 |
|---|---|
| 应用框架 | Next.js `16.2.6`，App Router，生产构建使用 Webpack |
| CMS/后端 | Payload CMS `3.86.0` |
| UI | React / React DOM `19.2.6` |
| 语言 | TypeScript `5.7.3`，`strict: true` |
| 数据库 | PostgreSQL 16，`@payloadcms/db-postgres`，UUID 主键 |
| 云数据库 | Supabase PostgreSQL Transaction Pooler |
| 对象存储 | `@payloadcms/storage-s3`，Supabase Storage S3 协议 |
| 富文本 | Payload Lexical |
| 图片处理 | Sharp `0.34.5` |
| 部署 | Vercel |

关键配置约束：

- Payload 数据库 `push: false`，schema 只能通过 migration 更新。
- Vercel Serverless 单实例数据库连接池 `max: 3`。
- S3 文件前缀统一为 `media/`。
- Payload telemetry 已关闭。
- 生产缺少数据库、Payload Secret 或任意必需 S3 变量时直接失败，不回退本地默认值。

## 5. 线上资源

### 5.1 Vercel

| 项目 | 值 |
|---|---|
| 固定域名 | <https://about-ai-cms.vercel.app> |
| 项目名 | `about-ai-cms` |
| 项目 ID | `prj_ezfPcQNOwADSVF2SdHGo9trWH7G5` |
| 组织 ID | `team_xwKfSt7JXH8OlKFqLw4irgA2` |
| 团队标识 | `shixuans-projects-c8990064` |
| 最新生产部署 ID | `dpl_D1gVLxW7HLnqLvqEwr7KgkqN2ggG` |
| 最新部署 URL | `https://about-ai-6q4xjeysz-shixuans-projects-c8990064.vercel.app` |
| 状态 | `READY / production` |
| Root Directory | `experiments/payload` |

本次上线通过 Vercel CLI 手动发布，不要假设 `git push` 一定会自动上线。

Vercel 当前使用 Node `24.x`，而 `package.json` 的 engines 范围会允许未来大版本自动升级；正式长期运行前建议固定经过验证的 Node LTS（优先 Node 22）并重新验证构建。

### 5.2 Supabase PostgreSQL

| 项目 | 值 |
|---|---|
| 项目名 | `about-ai-cms` |
| Project ref | `ddbyaevtvkuhizzbtwfi` |
| Region | `ca-central-1` |
| 公共项目 URL | `https://ddbyaevtvkuhizzbtwfi.supabase.co` |
| 生产数据库角色 | `payload_app` |
| 连接方式 | Transaction Pooler，端口 `6543` |

Vercel 使用专用数据库角色，不使用默认 `postgres` 账号承载日常应用流量。

生产连接串形态如下，交接文件中不得填入真实密码：

```text
postgresql://payload_app.ddbyaevtvkuhizzbtwfi:<PASSWORD>@<SUPABASE_POOLER_HOST>:6543/postgres?sslmode=require&uselibpqcompat=true
```

### 5.3 Supabase Storage / S3

| 项目 | 值 |
|---|---|
| S3 endpoint | `https://ddbyaevtvkuhizzbtwfi.storage.supabase.co/storage/v1/s3` |
| Bucket | `payload-media` |
| Bucket 可见性 | Public |
| Region | `ca-central-1` |
| 对象前缀 | `media/` |
| 公共 URL 前缀 | `https://ddbyaevtvkuhizzbtwfi.supabase.co/storage/v1/object/public/payload-media` |
| 当前密钥标签 | `payload-vercel-2026-07-23` |
| 旧密钥 | `payload-vercel`，已撤销 |

当前 bucket 是公开读取，只适合官网图片/PDF，不要在其中存储私密投稿附件、身份证明或任何敏感资料。

## 6. 账号与秘密的安全交接

### 6.1 已存在的演示账号

| 用途 | 邮箱 | 密码位置 |
|---|---|---|
| Payload 管理员 | `admin@about-ai.team` | macOS Keychain 服务 `codex-about-ai-cms-admin` |
| 普通用户 | `member@about-ai.team` | macOS Keychain 服务 `codex-about-ai-cms-member` |

`/auth` 会从生产 `SEED_MEMBER_*` 环境变量预填普通用户演示账号，这只适合当前团队体验；转正式生产前必须移除密码预填。

### 6.2 Keychain 索引

| 用途 | Keychain account | Keychain service |
|---|---|---|
| Supabase 默认数据库密码 | `postgres.ddbyaevtvkuhizzbtwfi` | `codex-about-ai-cms-db` |
| Payload 专用数据库角色密码 | `payload_app.ddbyaevtvkuhizzbtwfi` | `codex-about-ai-cms-role` |
| S3 Access Key ID | `ddbyaevtvkuhizzbtwfi` | `codex-about-ai-cms-s3-access` |
| S3 Secret Access Key | `ddbyaevtvkuhizzbtwfi` | `codex-about-ai-cms-s3-secret` |
| 演示管理员密码 | `admin@about-ai.team` | `codex-about-ai-cms-admin` |
| 演示普通用户密码 | `member@about-ai.team` | `codex-about-ai-cms-member` |

只在可信本机终端需要时读取，例如：

```sh
security find-generic-password -a admin@about-ai.team -s codex-about-ai-cms-admin -w
security find-generic-password -a member@about-ai.team -s codex-about-ai-cms-member -w
```

不要把命令输出复制到 Git、日志、截图、PR、公开聊天或本文件。

### 6.3 Vercel 已配置的环境变量名称

生产运行必需：

```text
DATABASE_URL
PAYLOAD_SECRET
NEXT_PUBLIC_SERVER_URL
S3_BUCKET
S3_REGION
S3_ENDPOINT
S3_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY
S3_FORCE_PATH_STYLE
S3_PUBLIC_URL
```

初始化账号/内容：

```text
SEED_DEMO_CONTENT
SEED_ADMIN_EMAIL
SEED_ADMIN_PASSWORD
SEED_MEMBER_EMAIL
SEED_MEMBER_PASSWORD
```

生产常态保持 `SEED_DEMO_CONTENT=0`。

## 7. 当前前台路由

| 路由 | 状态与用途 |
|---|---|
| `/` | 官网首页，读取官网设置、当期活动、精选作品和内容计数 |
| `/learn` | LLM 名词学习，Payload/PostgreSQL 数据驱动 |
| `/job` | 求职题库，100 道题和详情 |
| `/events` | 活动列表、站内报名入口 |
| `/works` | 已发布作品列表 |
| `/contact` | 联系我们完整长页面 |
| `/auth` | 普通用户登录/注册 |
| `/login` | 永久重定向到 `/auth` |
| `/me` | 普通用户个人中心，未登录跳转 `/auth?returnUrl=/me` |
| `/interviews` | 永久重定向到 `/job` |
| `/admin` | Payload Admin |
| `/api/graphql-playground` | GraphQL Playground |
| `/my-route` | 运行状态和教学条目数量的简单接口 |

## 8. Payload 数据模型与后台控制范围

### 8.1 `users`

- 字段：邮箱、密码、姓名、角色、账号状态、暂停原因、最后登录时间。
- 角色：`admin`、`editor`、`member`。
- 状态：`active`、`suspended`。
- `admin` 和 `editor` 可以进入后台并维护内容。
- 公开注册强制写成 `member + active`，不能通过请求伪造管理员。
- 公开注册密码至少 8 位。
- 最多连续失败 5 次，锁定 10 分钟。
- Token 有效期 7 天并启用服务端 session。
- 普通用户只能读写自己，staff 可以管理所有用户。

### 8.2 `activities`

- 字段：名称、slug、简介、规则、活动状态、报名方式、容量、外部报名地址、参与人数、首页当期活动、排序、海报。
- 活动状态：报名中、进行中、即将开始、长期开放、已结束。
- 报名方式：站内报名、外部报名、不开放报名。
- 活动排序 `min: 0`，数字越小越靠前。
- “首页当期活动”和“排序”不冲突：前者决定首页展示哪一场，后者决定列表顺序。
- 发布并勾选首页当期活动时，Hook 自动取消其他已发布活动的标记，全站只保留一个。
- 前台状态说明由 `activityStatus` 自动生成；旧 `statusText` 字段已隐藏，仅用于历史兼容。
- 支持草稿与最多 20 个版本。

当前参与人数是存储字段，普通用户通过专用报名 API 报名/取消时会同步增减；若管理员手动改数或绕过专用 API 直接创建报名记录，数字可能发生漂移。

### 8.3 `activity-registrations`

- 字段：活动、用户、联系人姓名、邮箱、电话、备注、报名状态、报名时间、取消时间。
- `activity + user` 唯一，防止重复报名。
- 状态：`registered`、`cancelled`。
- 普通用户只能看自己的记录，staff 可以查看全部。

### 8.4 `works`

- 字段：标题、slug、分类、简介、作者、项目链接、首页精选、排序、封面。
- 支持草稿与最多 20 个版本。
- 当前仅是管理员维护的公开作品，普通用户投稿/审核未实现。

### 8.5 教学内容三层模型

```text
content-modules
  └── content-categories
        └── content-items
```

`content-modules`：模块名称、slug、说明、主题色、排序；目前有 Chat、Lab、Code、Jargon、Job 五个模块。

`content-categories`：所属模块、分类名称、slug、内容类型、唯一导入标识 `sourceKey`、排序。

`content-items`：模块、分类、标题、slug、类型、摘要、难度、公司/场景、标签、Lexical 编辑备注、原始 fixture JSON、`sourceKey`、排序。

`content-items.source` 保存完整 fixture JSON，复杂的名词解释、答案、代码、步骤等仍主要从该字段读取；修改前需理解对应前端解析逻辑。

### 8.6 `media`

- 公开可读，只有 staff 可以上传、修改和删除。
- 只接受图片与 PDF。
- 单文件上限 4 MB，以适配 Vercel 演示部署限制。
- 活动海报、作品封面、二维码关系字段只允许选择图片。

### 8.7 Global `site-settings`

后台路径：`官网设置`。

可控制：

- 网站名称、首页主标题、口号、简介。
- 联系我们眉标、标题、说明和使命文案。
- 三张介绍卡的编号、标题和说明。
- Github 小组标题、说明和共建仓库列表。
- 如何加入步骤。
- 二维码区文案、二维码加入步骤、二维码图片、标题与备注。
- 页脚文字和联系邮箱。

当前“介绍我们”的三张卡片是后台可维护的文字卡，不是三个独立图片上传字段；真正的图片上传字段目前只有社群二维码，如需三张实际图片必须扩展 schema。

## 9. 初始化数据基线

云端已完成 migration 和 seed，基线为：

| 数据 | 数量 |
|---|---:|
| 内容模块 | 5 |
| 内容分类 | 32 |
| 教学内容 | 347 |
| 活动 | 4 |
| 作品 | 4 |
| 初始用户 | 2 |

347 条教学内容组成：

- Jargon：36 个术语。
- Job：100 道题。
- Code：52 个工具、95 条命令、11 个终端步骤、11 个 Agent 步骤、8 个隐藏功能。
- Lab：2 个配置、5 个 Function Call 步骤、10 个推理步骤、10 个 RAG 步骤。
- Chat：7 个管道阶段。

PRD 曾写首批 43 个名词，但当前经过设计对齐并已上线的数据源是 36 个术语；后续若要达到 43 个，应通过后台或 fixture 明确补充，不能仅修改显示数字。

Seed 是幂等的：

- 模块、活动和作品按 slug 判断。
- 分类和内容按唯一 `sourceKey` 判断。
- 用户按邮箱判断。
- 重跑只补缺失项并发布已有草稿，不覆盖后台已经编辑的正文。
- 联系我们默认内容通过 `contactContentVersion` 增量补齐。
- 生产 seed 要求四个 `SEED_*` 账号变量齐全，密码至少 12 位。

## 10. API

### 10.1 自定义公开 API

- `GET /api/content/jobs`
- `GET /api/content/jobs/:id`

### 10.2 普通用户 API

- `GET /api/member/registrations`
- `POST /api/member/registrations`
- `POST /api/member/registrations/:id/cancel`

### 10.3 Payload 自动 API

- REST：`/api/<collection>`
- 用户登录：`POST /api/users/login`
- 用户注册：`POST /api/users`
- GraphQL：`/api/graphql`
- GraphQL Playground：`/api/graphql-playground`

## 11. 本地开发环境

### 11.1 当前本机状态（2026-07-23）

- Homebrew `postgresql@16` 已启动，监听 `127.0.0.1:5432`。
- Homebrew `minio` 已启动，API 监听 `127.0.0.1:9000`。
- Payload/Next 本地服务 `3020` 当前未运行。

### 11.2 首次或修复本地环境

```sh
brew services start postgresql@16
brew services start minio

cd /Users/shixuan/qieman_project/project_0713_web/experiments/payload
npm install --legacy-peer-deps
npm run env
npm run infra:setup
npm run db:bootstrap
npm run dev
```

本地入口：

- 官网：<http://127.0.0.1:3020>
- Admin：<http://127.0.0.1:3020/admin>
- PostgreSQL：`127.0.0.1:5432`，数据库 `payload_local`
- MinIO：`127.0.0.1:9000`，bucket `payload-media`

`npm run env` 不覆盖已有 `.env`，`npm run infra:setup` 是幂等操作。

### 11.3 常用命令

```sh
cd /Users/shixuan/qieman_project/project_0713_web/experiments/payload

npm run dev
npx tsc --noEmit
npm run lint
npm run build
npm run start
npm run generate:types
npm run generate:importmap

npm run db:migrate
npm run db:migrate:status
npm run db:seed
npm run db:bootstrap

npm run test:integration:member
npm run test:integration:media
```

`db:bootstrap = db:migrate + db:seed`。

本地 `.env` 的 `S3_PUBLIC_URL` 为空时，`NODE_ENV=production` 的普通 `npm run build` 会因生产必需变量校验失败；本次验证使用生产 Supabase 公共 URL 临时注入后构建通过。不要把真实秘密写进命令历史或仓库。

## 12. Migration、Seed 与发布流程

当前已提交 migration：

```text
20260722_164949_initial_schema
```

### 12.1 只改前端/文案后的生产发布

```sh
cd /Users/shixuan/qieman_project/project_0713_web/experiments/payload
npx tsc --noEmit
npx vercel --prod --yes
```

### 12.2 修改 Payload schema 后

1. 在本地更新 Collection/Global 配置。
2. 生成并检查 migration 与 `payload-types.ts`。
3. 只提交本次相关文件。
4. 在可信管理环境用生产数据库变量运行 `npm run db:migrate:status`。
5. 显式运行 `npm run db:migrate`。
6. 再运行 `npx vercel --prod --yes`。
7. 验证固定域名、Admin、登录和相关前台页面。

### 12.3 只有明确补内容时才 Seed

- 初次环境：`npm run db:bootstrap`。
- 已有生产库只补演示数据：`npm run db:seed`。
- 不要把 `db:bootstrap` 或 `db:seed` 放进 Vercel Build Command、Start Command 或函数初始化逻辑。
- 云端部署不要运行只面向 Homebrew/MinIO 的 `npm run infra:setup`。

## 13. 已完成的验证

### 13.1 线上页面

已实际读取并验证：

- `/`
- `/learn`
- `/job`
- `/events`
- `/works`
- `/contact`
- `/auth`
- `/me`
- `/admin`

### 13.2 登录

- 普通用户登录成功，并进入 `/me`。
- 管理员登录成功，并进入 Payload Admin。
- 最后一次部署修复了登录页仍预填旧本地演示账号的问题，现从生产 `SEED_MEMBER_*` 配置读取。

### 13.3 数据与媒体

- Supabase PostgreSQL migration 和 seed 成功。
- 新 S3 密钥完成真实 `PutObject -> HeadObject -> DeleteObject` 测试。
- S3 测试对象已清理。
- 旧失效 S3 密钥已撤销。
- 本地 TypeScript 检查通过。
- 注入完整生产必需变量后，本地生产构建通过。
- Vercel 最新生产部署状态为 `READY`。

### 13.4 设计 QA

`/learn` 与 `/job` 已覆盖桌面、移动、选中态、空状态、加载态、浅色和深色状态；当前 QA 记录中 P0/P1/P2 均为 0，最终结果为 passed。

## 14. 当前已知限制和风险

1. 这是团队体验版，不是生产 SLA 系统。
2. Supabase 免费项目长期无访问可能暂停。
3. Vercel Hobby 适合体验，不应直接视作正式生产容量保证。
4. Node 大版本未锁定，Vercel 当前使用 Node 24.x，建议固定 Node 22 LTS 后回归测试。
5. `payload-media` 是 public bucket，不适合私密用户文件。
6. 普通用户演示密码会预填到 `/auth`，正式开放前必须移除。
7. 普通用户作品投稿/审核、私密附件、邮箱验证与前台找回密码仍未实现。
8. `/lab`、`/code` 和 Chat 教学页面未迁入 Payload 子项目。
9. 活动参与人数是存储并增减的字段，不是每次从报名表实时聚合；绕过专用 API 会导致漂移。
10. `works`、内容模块、分类和条目的排序没有全部统一限制 `min: 0`，只有活动排序已经明确禁止负数。
11. 联系我们当前只有二维码是实际图片字段，三张介绍卡是文字卡。
12. 设计 QA 资料未提交，换机器或重新 clone 后不可见，除非后续明确加入 Git。
13. 根工作树有其他实验的未提交改动，任何批量暂存、清理或重置都可能破坏用户工作。
14. 真实社群二维码尚未上传时，`/contact` 会显示原型占位图。
15. `/learn` 当前单次最多读取 100 条内容，`/job` 当前单次最多读取 120 条内容；现有数据量安全，扩容后需要分页。
16. 活动报名的“创建记录 + 增加人数”不是数据库事务，高并发时仍可能超卖或产生人数漂移。
17. 普通注册没有邮箱验证、验证码、反机器人和注册限流，不适合直接公开推广。
18. GraphQL Playground 当前存在生产路由，正式公开上线前应评估关闭或限制访问。
19. 前台主要页面为动态渲染并会访问数据库，需要观察 Vercel 冷启动和 Supabase 免费额度。
20. 当前没有正式 SLA、自动备份、监控告警、完整 CI/CD 或自定义品牌域名。

## 15. Git 状态与关键历史

| 项目 | 值 |
|---|---|
| Remote | `https://github.com/CrazyGoudanli/About-AI-chat-information.git` |
| Branch | `sites-deploy` |
| Payload 应用功能基线 | `ba52811` |

本地分支当前没有设置 upstream，推送时使用 `git push origin sites-deploy`，或在明确需要时补设 upstream。

关键提交：

- `d4c0391 feat: 部署 About AI Payload 体验站`
- `0b61a03 fix: 内置云端初始化数据`
- `ba52811 fix: 同步云端演示账号配置`

继续工作前必须先执行：

```sh
cd /Users/shixuan/qieman_project/project_0713_web
git status --short
git branch --show-current
```

只暂存明确文件，例如：

```sh
git add -- PROJECT_HANDOFF.md
```

不要使用 `git add .`。

## 16. 新 GPT 接手检查清单

1. 阅读本文件和 `experiments/payload/README.md`。
2. 确认任务是否针对 `experiments/payload`，不要误改原 `apps/web` 或其他 CMS 实验。
3. 运行 `git status --short`，保护现有未提交文件。
4. 打开 <https://about-ai-cms.vercel.app> 确认线上仍可访问。
5. 如需登录，用 Keychain 获取演示凭据，不要从代码或聊天中寻找明文密码。
6. 如需改 schema，先设计 migration，不得打开 `push`。
7. 如需上传私密文件，先新建私有存储方案，不要复用 public `payload-media`。
8. 如需完善 PRD，优先顺序建议为：作品投稿审核 → 私密附件 → 邮箱验证/找回 → 活动详情 → 作品详情 → SEO。
9. 变更后至少运行 `npx tsc --noEmit` 和与改动面匹配的构建/集成测试。
10. 部署后验证固定域名，而不是只验证临时 Vercel URL。
11. 优先处理 `/lab`、`/code` 和 Chat 的侧边栏死链：隐藏、跳转原系统或正式接入三选一。
12. 上传正式社群二维码，并为 Supabase Database 与 Storage 建立可恢复的备份策略。
13. 团队体验结束后移除演示密码预填，并轮换演示账号与 S3 密钥。
14. 确认团队成员已经通过正式邀请获得 GitHub、Vercel 和 Supabase 的必要权限，不要共享个人登录态。

## 17. 不要做的事

- 不要把数据库密码、S3 Secret、Payload Secret 或账号密码写进本文件、Git 或日志。
- 不要使用 Supabase anon key 代替服务端 S3 Access Key。
- 不要在 Vercel build/start 中自动跑 migration 或 seed。
- 不要把 public bucket 当作私密投稿存储。
- 不要把 Payload 自动扩成完整教育平台，除非用户明确改变首版范围。
- 不要删除或覆盖根仓库其他模块的未提交内容。
