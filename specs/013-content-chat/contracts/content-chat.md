# API Contract: `GET /api/content/chat/pipeline`

只读公开。`Cache-Control: public, max-age=300`。

**200**：
```json
{
  "module": "chat",
  "stages": [
    {"num":"1","label":"上下文组装","short":"messages[] 数组拼接","detail":"把 System Prompt…","color":"#58a6ff"}
  ]
}
```
- `stages` 7 项，按 sort_order。
- 空库 → `{"module":"chat","stages":[]}`。
- 异常 → 500 `{"detail":"内容服务暂时不可用"}`。

## 类型（packages/shared/src/content.ts）
```ts
export interface PipelineStageContent { num: string; label: string; short: string; detail: string; color: string; }
export interface ChatPipelineResponse { module: "chat"; stages: PipelineStageContent[]; }
```

## 契约测试要点（test_content_chat.py）
- `GET /chat/pipeline` → 200；`len(stages)==7`；首阶段 label 含"上下文组装"；各阶段 num/label/short/detail/color 非空；缓存头。
- 空库 → stages == []。
- seeder：chat 0 分类 / 7 条目；篡改条数→SeedError。
