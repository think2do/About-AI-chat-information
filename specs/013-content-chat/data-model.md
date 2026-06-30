# Data Model: Chat Pipeline

复用 009 三表，`module='chat'`。无新建表、无分类、无 meta。

## content_items（7）
| item_type | 数量 | payload |
|-----------|------|---------|
| pipeline-stage | 7 | `{num,label,short,detail,color}` |
slug：`stage-1`…`stage-7`；title 列用 label；sort_order 0..6。

## seeder
`_load_chat` 返回 `([], 7 条目, [])`；注册 `MODULE_REGISTRY['chat']`：expected_categories=0、expected_items=7。
