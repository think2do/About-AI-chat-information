# Research: Job 题库迁移

技术决策基本继承 009（存储模型、幂等 seeder、JSON-TEXT、客户端 fetch、`.db` 不入库、共享类型）。本模块新增决策：

## D1. 嵌套数组扁平化
旧 `Job.data.js` 的 `QUESTIONS` 含 3 个**嵌套数组**元素（批量题被误塞为子数组），扁平化后精确 100 题。提取脚本对数组元素 `push(...e)`，对象元素直接收，并断言总数 100 / id 唯一。**Decision**：扁平化为唯一来源，旧文件保留参考。

## D2. 列表轻字段 + 详情按 id
列表只返回 id/title/category/tag/difficulty/company/tags（无正文），详情按 id 返回完整内容。**Rationale**：100 题、长答案，避免列表传输全部正文。备选「列表即全量」被否（载荷大、与 009 FR-012 不一致）。

## D3. 过滤计数固定、items 随过滤变化
`all_tags` 的 count 与 `total` 始终反映全量（过滤栏显示固定计数），`items` 反映 query 过滤结果。**Rationale**：符合旧版过滤栏交互（标签上显示总计数，不随选择跳动）。

## D4. all_tags 用 slug 键
把旧 ALL_TAGS 的中文 key 映射为英文 slug（与 category slug 一致），label 保留中文。**Rationale**：前端过滤 key 与 URL/分类 slug 统一，避免中文 key 在过滤逻辑里流转。

## D5. 难度配色（前端）
真实难度为 困难/中等/简单（旧占位页误用「基础」）。前端配色：简单=`#00ffa0`、中等=`#ffa657`、困难=`#ff6b6b`。展示逻辑留前端。
