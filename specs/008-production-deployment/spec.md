# Feature Specification: 生产部署与环境配置 (Production Deployment)

**Feature Branch**: `008-production-deployment`

**Created**: 2026-06-30

**Status**: Draft

**Input**: 将完成迁移的 AI 教学工具打包为可一键部署的生产就绪系统——Docker Compose 统一编排前后端服务、环境变量管理配置与密钥、健康检查与监控端点、数据库搬迁（SQLite → PostgreSQL）和完整的验收测试清单。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 一键启动完整教学工具 (Priority: P1)

作为运维者，我希望在新服务器上只需执行一条命令就能启动整个教学工具（前端 + 后端 + 数据库），不需要分别配置三个服务、手动处理端口冲突和网络互通。

**Why this priority**: 部署复杂度直接决定项目能否上线。如果部署要 30 个步骤，每次更新都是噩梦。

**Independent Test**: 在干净环境中克隆仓库 → 配置 `.env` 文件 → 执行 `docker-compose up` → 浏览器访问前端 → Chat 功能正常流式响应。

**Acceptance Scenarios**:

1. **Given** 服务器已安装 Docker 和 Docker Compose，**When** 运维者在项目根目录执行 `docker-compose up -d`，**Then** 前端服务、后端 API 服务和数据库服务全部启动，3 分钟内所有健康检查通过。
2. **Given** 全部服务正常运行，**When** 运维者访问前端页面，**Then** 页面正常加载，Chat 功能可发送消息并收到流式回复。
3. **Given** 运维者修改了 `.env` 中的数据库密码或端口配置，**When** 重启服务，**Then** 服务使用新配置启动。

---

### User Story 2 - 前后端独立部署与扩容 (Priority: P2)

作为运维者，当教学工具访问量增长时，我希望前端和后端可以独立部署和扩容——我可以把前端放到 CDN 上，后端增加多个实例，而不用重新打包整个应用。

**Why this priority**: 独立部署是 Constitution 中「关注点分离」原则在运维层面的实现。但第一阶段用户量不大，可以先用简单模式。

**Independent Test**: 只启动后端服务 → 前端通过环境变量指向该后端地址 → Chat 功能正常工作 → 然后切换后端实例，前端无需重新构建。

**Acceptance Scenarios**:

1. **Given** 前端构建产物部署在静态托管（如 Vercel 或 Nginx），**When** 前端通过环境变量 `NEXT_PUBLIC_API_URL` 指向独立部署的后端地址，**Then** Chat 请求正确发送到远程后端，流式回复正常显示。
2. **Given** 后端需要扩容为 2 个实例，**When** 运维者在负载均衡器后启动第二个后端容器，**Then** 两个实例均可正常处理请求，session 数据不丢失（通过共享数据库）。

---

### User Story 3 - 验收测试清单 (Priority: P2)

作为项目 Owner，在上线前我希望通过一份完整的验收测试清单来确认所有功能都正常工作——从前端页面可访问、到 Chat 流式功能、到并发安全和数据过期清理。

**Why this priority**: 本项目的测试策略是分层级的（Constitution Principle IV），验收清单是 Live 环境测试的具体体现。

**Independent Test**: 按照验收清单逐项执行测试 → 所有必选项通过 → 记录测试结果和时间。

**Acceptance Scenarios**:

1. **Given** 生产环境已部署，**When** 运维者按验收清单执行前端验收（5 页可访问、设置持久化、匿名 session、Chat 流式、Pipeline 可视化、内容迁移），**Then** 全部 6 项前端验收通过。
2. **Given** 生产环境已部署，**When** 运维者执行后端验收（Health check、Chat streaming、Key 安全、对话保存、30 天过期、错误归一、删除对话），**Then** 全部 7 项后端验收通过。
3. **Given** 生产环境已部署，**When** 运维者执行并发验收（20-50 并发不串扰、多轮对话正确归属、取消释放连接、断流友好提示、限流触发），**Then** 全部 5 项并发验收通过。

---

### Edge Cases

- `.env` 文件未配置或配置错误——服务应以明确的错误消息拒绝启动（而非静默失败或使用不安全默认值）。
- Docker 镜像构建缓存失效——构建脚本应有明确的版本标签策略，确保部署时拉取的是正确的镜像版本。
- 数据库迁移（SQLite → PostgreSQL）——第一阶段开发用 SQLite，部署时需将 schema 迁移到 PostgreSQL，迁移脚本应包含在部署流程中。
- 前端静态文件缓存策略——前端构建产物使用内容 hash 命名，确保新版本部署后用户不会加载到旧版本 JS/CSS。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统 MUST 提供 `docker-compose.yml` 文件，编排前端服务、后端服务和数据库服务（PostgreSQL），实现一键启动。
- **FR-002**: 系统 MUST 提供 `.env.example` 模板文件，列出所有必需的环境变量（数据库连接串、端口号、日志级别等）及其说明，不包含任何真实的密钥或密码。
- **FR-003**: 后端 MUST 从环境变量读取配置（数据库 URL、端口、日志级别、CORS 允许的来源等），不硬编码任何部署环境相关的值。
- **FR-004**: 前端 MUST 支持通过环境变量 `NEXT_PUBLIC_API_URL` 指定后端 API 地址，使其可以指向独立部署的后端服务。
- **FR-005**: 系统 MUST 提供数据库迁移脚本（从 SQLite schema 到 PostgreSQL schema），包含所有表、索引和约束的创建语句。
- **FR-006**: 系统 MUST 提供生产环境的健康检查端点（`GET /health`），返回服务状态、版本号和数据库连接状态。
- **FR-007**: 系统 MUST 提供完整的验收测试清单文档（`docs/deployment/acceptance-checklist.md`），覆盖前端、后端和并发三个维度的所有测试场景。
- **FR-008**: 前端构建产物 MUST 使用内容 hash 命名策略（文件名包含 hash），确保新版本部署后浏览器缓存自动失效。
- **FR-009**: 系统 MUST 在 `docker-compose.yml` 中为数据库服务配置持久化卷（volume），确保容器重启后数据不丢失。
- **FR-010**: 系统 MUST 提供部署文档（`docs/deployment/README.md`），包含环境要求、配置步骤、启动命令、常见问题排查和停止/更新流程。

### Key Entities

- **DockerComposeConfig**: 三个服务的编排定义（web、api、db），含端口映射、环境变量注入、数据卷挂载和健康检查配置。
- **EnvTemplate**: 环境变量清单（`.env.example`），每个变量的 key、说明、示例值和是否必需。
- **AcceptanceChecklist**: 验收测试清单（18 项测试场景，来自 Production Refactor Plan §12）。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 新运维者从克隆仓库到看到前端页面正常显示（含 Chat 流式功能可用），全过程不超过 15 分钟。
- **SC-002**: Docker Compose 一键启动命令在 3 分钟内完成所有服务的启动和健康检查。
- **SC-003**: 前端构建产物的文件命名包含内容 hash，浏览器在新版本部署后自动加载最新文件——验证方式：部署新版本后强制刷新页面，0 个 304 缓存命中请求。
- **SC-004**: 验收清单中的 18 项测试全部通过（前端 6 项 + 后端 7 项 + 并发 5 项）。
- **SC-005**: 数据库容器重启后，已保存的对话数据 100% 不丢失。
- **SC-006**: `.env.example` 不包含任何真实的 API Key、密码或其他敏感凭证。

## Assumptions

- 部署环境已安装 Docker 24+ 和 Docker Compose v2。
- 生产环境使用 PostgreSQL 15+（与开发环境的 SQLite 不同，但 schema 保持一致）。
- 前端静态托管（Vercel/Netlify/Nginx）不在 Docker Compose 编排范围内——Docker Compose 用于开发环境和自托管部署；前端独立部署时使用构建产物 + 环境变量。
- 第一阶段不引入 CI/CD 流水线——手动执行验收清单即可。CI/CD 在后续演进中引入。
- HTTPS 和域名配置由反向代理（如 Nginx、Caddy 或云服务商）处理，不在应用层面实现。
- 数据库备份方案（pg_dump 定时任务等）由运维侧自行配置，本文档仅提示建议方案。
