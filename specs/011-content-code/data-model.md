# Data Model: Code 教学数据

复用 009 三表，`module='code'`，多 item_type。**无新建表**。

## item_types 与计数
| item_type | 数量 | payload |
|-----------|------|---------|
| tool | 52 | `{name, emoji, plain, example, isExp}` |
| command | 95 | `{cmd, emoji, plain, example, isExp}` |
| sim-step | 11 | `{terminal[], seq{tag,tagColor,title,desc,code}}` |
| agent-step | 11 | `{num,title,src,desc,code}` |
| hidden-feature | 8 | `{name, desc}` |

`content_items` 总计 **177**；`title` 列：tool/command 用其 `title`，sim/agent 用 step 标题，hidden 用 name。

## content_categories（13 行）
- 8 工具分类：`category_id='code:tool:'+slug`，`item_type='tool'`，label=中文分类名，sort_order 0..7。
  slug：文件操作=file、代码执行=exec、搜索 & 抓取=search、Agent & 任务=agent、规划模式=plan、MCP=mcp、系统=system、实验性=experimental。
- 5 命令分类：`category_id='code:command:'+slug`，`item_type='command'`，sort_order 0..4。
  slug：设置 & 配置=setup、日常工作流=workflow、代码审查 & Git=git、调试 & 诊断=debug、高级 & 实验性=advanced。

sim-step/agent-step/hidden-feature 无分类（category_id NULL），靠 sort_order 排序。

## slug
- tool：工具名原样（`FileRead`、`mcp`…，模块内唯一）。
- command：去前导斜杠（`/init`→`init`、`/pr_comments`→`pr_comments`）。
- sim/agent：`sim-{i}` / `agent-{i}`；hidden：`hidden-{i}`（i 为序号）。

## 提取（自 Code.dc.html）
字符串感知的平衡括号扫描提取 `TOOL_DESCS/TOOL_CATS/CMD_DESCS/CMD_CATS/SIM_STEPS/agentLoopSteps/hiddenFeatures`；`isExp` 来自对应 CAT 的 `exp[]`。代码/终端多行文本保真。

## seeder 变更（009 共享文件）
- loader 已是 3 元组（009/010）。Code loader 返回 13 分类 + 177 条目 + 空 meta。
- **count 断言去掉 item_type 过滤**（改为按 module 统计全部条目），以支持 code 的多 item_type；jargon/job 行为不变（其 module 全部条目即单一类型）。
- 注册 `MODULE_REGISTRY['code']`：expected_categories=13、expected_items=177。
