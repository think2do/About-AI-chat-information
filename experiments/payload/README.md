# Payload CMS 真实体验实例

独立运行的 Payload CMS 3.86 应用，使用 PostgreSQL 16、MinIO（S3 兼容对象存储）和当前项目的真实教学 fixtures。它不会替换现有前端、FastAPI、SQLite 内容服务或 Directus 实验。

## 本地基础设施

本机通过 Homebrew 运行两个后台服务：

- PostgreSQL 16：`127.0.0.1:5432`，Payload 数据库为 `payload_local`；
- MinIO：`127.0.0.1:9000`，Payload 存储桶为 `payload-media`。

首次安装或需要修复本地数据库、存储桶时运行：

```sh
brew services start postgresql@16
brew services start minio
cd experiments/payload
npm run env
npm run infra:setup
npm run db:bootstrap
```

`infra:setup` 是幂等的，重复运行不会重复创建数据库或存储桶。`db:bootstrap` 会先执行已提交的 migration，再显式导入一次演示数据；应用启动本身不会执行 migration 或 seed。

需要复验媒体闭环时运行：

```sh
npm run test:integration:media
```

该命令会使用临时数据完成管理员登录、PNG 上传、活动/作品关联、首页与列表页回显、Next Image 优化、PostgreSQL 记录和 MinIO 对象核对，再自动删除全部临时数据。

需要复验普通用户闭环时运行：

```sh
npm run test:integration:member
```

该命令会验证公开注册无法伪造管理员、普通用户 Cookie 会话、后台权限隔离、活动报名、重复报名保护、个人中心、取消报名与退出登录，并自动清理临时数据。

## 启动

```sh
cd experiments/payload
npm install --legacy-peer-deps
npm run env
npm run infra:setup
npm run db:bootstrap
npm run dev
```

- 体验首页：<http://localhost:3020>
- LLM 名词：<http://localhost:3020/learn>
- 求职面试：<http://localhost:3020/job>
- 热门活动：<http://localhost:3020/events>
- 作品展示：<http://localhost:3020/works>
- 联系我们：<http://localhost:3020/contact>
- 登录 / 注册：<http://localhost:3020/auth>
- 个人中心：<http://localhost:3020/me>
- Payload Admin：<http://localhost:3020/admin>
- REST 示例：<http://localhost:3020/api/content-items?limit=5&depth=1>
- GraphQL Playground：<http://localhost:3020/api/graphql-playground>

演示账号：

```text
后台管理员：
admin@example.com
Payload@123456

普通用户：
member@example.com
Member@123456
```

`db:bootstrap` 会把 `apps/api/app/db/seeds/content/` 的 fixtures 幂等导入 PostgreSQL。媒体文件通过 Payload 官方 S3 适配器写入 MinIO，`.env` 和构建缓存均已忽略。后续只改 schema 时运行 `npm run db:migrate`；只有明确需要补齐演示内容时才运行 `npm run db:seed`。

当前 `.env.example` 使用仅限本机开发的凭据，正式迁移云端时替换 `DATABASE_URL` 与 `S3_*` 环境变量即可，无需修改集合代码。

媒体库仅接受图片或 PDF，单个文件最大 **4 MB**，这是为了适配 Vercel 演示部署的请求体限制；需要上传更大素材时，应改为客户端直传对象存储后再保存媒体记录。

## 使用 Supabase 免费项目部署

Payload 可以同时使用 Supabase PostgreSQL 与 Storage。云端部署时不要运行仅供 Homebrew/MinIO 使用的 `npm run infra:setup`，改为在部署平台配置以下环境变量：

```dotenv
DATABASE_URL=postgresql://postgres.<project-ref>:<url-encoded-password>@<pooler-host>:6543/postgres?sslmode=require
PAYLOAD_SECRET=<long-random-secret>
NEXT_PUBLIC_SERVER_URL=https://<your-app-domain>
SEED_DEMO_CONTENT=0

S3_BUCKET=payload-media
S3_REGION=<project-region>
S3_ENDPOINT=https://<project-ref>.storage.supabase.co/storage/v1/s3
S3_ACCESS_KEY_ID=<server-side-s3-access-key-id>
S3_SECRET_ACCESS_KEY=<server-side-s3-secret-access-key>
S3_FORCE_PATH_STYLE=true
S3_PUBLIC_URL=https://<project-ref>.supabase.co/storage/v1/object/public/payload-media

# 只在可信管理环境中首次执行 npm run db:seed / db:bootstrap 时设置。
# 生产环境必须填写，密码至少 12 个字符，不要使用本地演示账号密码。
SEED_ADMIN_EMAIL=<admin-email>
SEED_ADMIN_PASSWORD=<strong-admin-password>
SEED_MEMBER_EMAIL=<member-email>
SEED_MEMBER_PASSWORD=<strong-member-password>
```

准备步骤：

1. 在 Supabase 的 `Connect` 面板复制 PostgreSQL 连接串。Serverless 部署优先使用 Transaction pooler（端口 `6543`）；常驻 Node 服务可使用 Direct connection，IPv4 常驻环境可使用 Session pooler。
2. 在 Storage 中创建名为 `payload-media` 的 **public bucket**。`S3_PUBLIC_URL` 必须是包含 bucket 名的公开 URL 前缀；若 bucket 名不同，同时修改 `S3_BUCKET` 和 URL 末段。
3. 在 Storage 的 S3 配置页启用 S3 protocol，生成仅供服务端使用的 Access Key ID / Secret Access Key，并复制页面显示的 endpoint 与 region。不要使用 Supabase anon key 代替这组服务端 S3 密钥。
4. 将以上变量加入部署平台，不要写入或提交 `.env`。在首次部署前，从可信的管理环境使用同一组生产环境变量显式运行一次 `npm run db:bootstrap`；以后发布只在包含新 migration 时运行 `npm run db:migrate`。生产 seed 不再接受硬编码演示账号，必须提供四个 `SEED_*` 变量且两个密码均至少 12 个字符。

Payload 在本地和生产启动时都不会动态 push schema，也不会执行 seed。生产启动必须显式配置 `DATABASE_URL`、`PAYLOAD_SECRET`、全部 `S3_*` 连接变量与 `S3_PUBLIC_URL`，缺少任一项会立即失败而不是回退到本地 MinIO。`SEED_DEMO_CONTENT` 在示例和生产环境中保持为 `0`；只有显式运行 `npm run db:seed` 时，该命令才会为当前进程临时开启 seed。可用 `npm run db:migrate:status` 核对 migration 状态。不要把 `db:bootstrap` 放进 Vercel 的 Build Command、Start Command 或函数初始化逻辑。

配置 `S3_PUBLIC_URL` 后，Payload 返回的媒体字段会直接使用 Supabase CDN 公共地址，Next Image 仅放行这个 URL 前缀；不配置时继续使用原有的 Payload `/api/media/file/*` 代理，因而本地 MinIO 工作流不受影响。

## 已实现

- 中文 Admin、管理员登录与独立的普通用户登录 / 注册；
- 普通用户个人中心、活动报名、重复报名保护与取消报名；
- 管理员 / 编辑 / 普通用户三级角色和账号暂停、登录锁定、会话隔离；
- 与 Figma 长页面一致的“联系我们”，含使命、介绍卡、Github 小组、加入步骤和二维码；
- “联系我们”文案、仓库、步骤与二维码均可在 `官网设置 → 联系我们` 中维护；
- 按 Figma 黑白线框实现的响应式官网前端；
- `官网设置`、`活动管理`、`作品管理` 修改后直接反映到前台；
- `教学模块 → 内容分类 → 教学条目` 关系模型；
- 347 条真实教学内容和 32 个分类；
- 草稿、版本、筛选、关系字段、Tabs、数组和 JSON；
- Lexical 富文本、S3 兼容媒体上传（本地 MinIO、云端 Supabase Storage）；
- 活动与作品封面只允许选择图片，前台按配置使用 Payload 相对代理或对象存储公开 URL 回显；
- 可自动清理的 PostgreSQL + S3 兼容对象存储 + Next.js 媒体端到端联调；
- 自动生成的 REST、GraphQL 和 Local API；
- 可核对导入计数与体验路线的独立首页。

## 针对当前项目的优劣势

优势：TypeScript schema 可评审且能生成类型；与 Next.js 同栈；草稿、版本、权限、关系、媒体和富文本完整；Local API 读取链路短；React Admin 定制上限高。

劣势：不是零代码建模工具；自带后端会和 FastAPI 职责重叠；完整 Next.js 服务的安装和部署更重；直接接入当前 vinext / Cloudflare 主站会增加组合兼容风险；若长期把复杂内容都塞进 JSON，会损失字段级校验和查询价值。
