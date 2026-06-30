# API Contract: `GET /api/content/lab`

只读公开，单次返回 5 演示数据。`Cache-Control: public, max-age=300`。

**200**：
```json
{
  "module":"lab",
  "training":{"defaultQuestion":"…","baseTemplate":"{q}好的，…","sftAnswer":"…"},
  "functionCall":[{"icon":"💬","label":"…","color":"#79c0ff","content":"…","jsonObj":null,"isCode":true,"highlight":false}],
  "tokenizer":{"modes":[{"key":"mode0","label":"…","intro":"…","groups":[{"title":"…","titleColor":"#ff7b72","bars":[{"label":"…","value":"…","valueColor":"#ff7b72","widthPct":100,"barColor":"#ff7b72","sample":null}]}],"note":{"text":"…","color":"#00ffa0"}}],"quickref":{"title":"…","cards":[{"label":"…","zh":"3.5×","zhColor":"#ff7b72","en":"1.0×"}],"footnote":"…"}},
  "inference":[{"num":"01","icon":"💬","title":"…","desc":"…","code":null}],
  "rag":[{"num":"01","icon":"📂","title":"…","desc":"…","code":"…","phase":"建立索引阶段","phaseColor":"#58a6ff"}]
}
```
- functionCall 5、inference 10、rag 10、tokenizer.modes 3、quickref.cards 4。
- 空库 → functionCall/inference/rag 为 []，training/tokenizer 为 null。
- 异常 → 500 `{"detail":"内容服务暂时不可用"}`。

## 类型（packages/shared/src/content.ts）
`FcStep`、`InferStep`、`RagStep`、`TokenizerBar/TokenizerGroup/TokenizerMode/TokenizerQuickCard/TokenizerData`、`TrainingData`、`LabResponse`。

## 契约测试要点（test_content_lab.py）
- `GET /lab` → 200；functionCall 5、inference 10、rag 10、tokenizer.modes 3、quickref.cards 4；training.baseTemplate 含 `{q}`；rag[0].phase 非空；缓存头。
- 空库 → 三数组空、training/tokenizer null。
- seeder：lab 0 分类 / 25 条目；篡改条数→SeedError。
