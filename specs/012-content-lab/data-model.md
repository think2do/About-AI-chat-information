# Data Model: Lab

复用 009 三表，`module='lab'`。无新建表、无分类。

## content_items（25）
| item_type | 数量 | payload |
|-----------|------|---------|
| fc-step | 5 | `{icon,label,color,content,jsonObj,isCode,highlight}` |
| infer-step | 10 | `{num,icon,title,desc,code}` |
| rag-step | 10 | `{num,icon,title,desc,code,phase,phaseColor}` |
title 列：fc 用 label、infer/rag 用 title。slug：`fc-{i}`/`infer-{i}`/`rag-{i}`。

## content_meta（2）
- `(lab, training)` → `{defaultQuestion, baseTemplate(含 {q}), sftAnswer}`
- `(lab, tokenizer)` → `{modes:[{key,label,intro,groups:[{title,titleColor,bars:[{label,value,valueColor,widthPct,barColor,sample}]}],note}], quickref:{title,cards:[{label,zh,zhColor,en}],footnote}}`

## seeder
`_load_lab` 返回 `([], 25 条目, [training, tokenizer] meta)`；注册 `MODULE_REGISTRY['lab']`：expected_categories=0、expected_items=25。条数断言沿用按 module 统计。
