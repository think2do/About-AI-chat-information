# API Contract: `GET /api/content/code`

只读、公开。一次返回五类数据，供 Code 页 5 Tab 客户端切换。`Cache-Control: public, max-age=300`。

**200**：
```json
{
  "module": "code",
  "tools": {
    "categories": [
      {"slug":"file","label":"文件操作","count":6,
       "tools":[{"name":"FileRead","emoji":"📖","title":"读取文件","plain":"…","example":"…","isExp":false}]}
    ]
  },
  "commands": {
    "categories": [
      {"slug":"setup","label":"设置 & 配置","count":12,
       "commands":[{"cmd":"/init","emoji":"🚀","title":"初始化项目","plain":"…","example":"…","isExp":false}]}
    ]
  },
  "simulator": [
    {"terminal":["$ claude","…"],"seq":{"tag":"用户","tagColor":"#7ee787","title":"…","desc":"…","code":null}}
  ],
  "agentLoop": [
    {"num":"1","title":"Input","src":"src/input.ts","desc":"…","code":"…"}
  ],
  "hidden": [{"name":"Buddy","desc":"…"}]
}
```
- tools 跨分类共 52、commands 共 95、simulator 11、agentLoop 11、hidden 8。
- 分类按 sort_order，组内条目按 sort_order。
- 空库 → 各集合为空数组（categories: []）。
- 异常 → 500 `{"detail":"内容服务暂时不可用"}`。

## 类型（packages/shared/src/content.ts）
```ts
export interface CodeTool { name: string; emoji: string; title: string; plain: string; example: string; isExp: boolean; }
export interface CodeCommand { cmd: string; emoji: string; title: string; plain: string; example: string; isExp: boolean; }
export interface CodeToolCategory { slug: string; label: string; count: number; tools: CodeTool[]; }
export interface CodeCommandCategory { slug: string; label: string; count: number; commands: CodeCommand[]; }
export interface SimStep { terminal: string[]; seq: { tag: string; tagColor: string; title: string; desc: string; code: string | null }; }
export interface AgentStep { num: string; title: string; src: string; desc: string; code: string | null; }
export interface HiddenFeature { name: string; desc: string; }
export interface CodeResponse {
  module: "code";
  tools: { categories: CodeToolCategory[] };
  commands: { categories: CodeCommandCategory[] };
  simulator: SimStep[];
  agentLoop: AgentStep[];
  hidden: HiddenFeature[];
}
```

## 契约测试要点（apps/api/tests/test_content_code.py）
- `GET /code` → 200；tools 分类 8 且工具合计 52；commands 分类 5 合计 95；simulator 11；agentLoop 11；hidden 8。
- 某实验性工具（如 `Sleep`）`isExp==true`；非实验（`FileRead`）false。
- 缓存头存在；空库 → 各 categories/数组为空。
- seeder：code 13 分类 / 177 条目；篡改条数 → SeedError。
