"use client";

import { useState } from "react";

const TABS = [
  { id: "simulator", label: "模拟器", emoji: "🖥" },
  { id: "agent-loop", label: "Agent 循环", emoji: "🔄" },
  { id: "tools", label: "工具系统", emoji: "🔨" },
  { id: "commands", label: "命令目录", emoji: "⌨" },
  { id: "hidden", label: "隐藏功能", emoji: "🥷" },
];

const CONTENT: Record<string, React.FC> = {
  simulator: () => (
    <div>
      <p style={{ fontSize: 12, color: "#8b949e", marginBottom: 16 }}>终端模拟器 — Claude Code 的 11 步完整演示流程</p>
      <div style={{ background: "#0a0e14", border: "1px solid #21262d", borderRadius: 8, padding: 16, fontFamily: "JetBrains Mono, monospace", fontSize: 11 }}>
        {["$ claude 'What is Transformer?'", "> Analyzing codebase...", "> Reading relevant files...", "> Searching for patterns...", "> Building context map...", "> Evaluating approach...", "> Generating response...", "> Verifying accuracy...", "> Formatting output...", "> Response ready ✓", "> Tokens: 1,234 | Time: 2.3s"].map((line, i) => (
          <div key={i} style={{ padding: "3px 0", color: i === 0 ? "#00ffa0" : i === 9 ? "#ffa657" : "#8b949e" }}>
            <span style={{ color: "#484f58", marginRight: 8 }}>[{String(i + 1).padStart(2, "0")}]</span>
            {line}
          </div>
        ))}
      </div>
    </div>
  ),
  "agent-loop": () => (
    <div>
      <p style={{ fontSize: 12, color: "#8b949e", marginBottom: 16 }}>Agent 循环 — 11 阶段源码路径解析</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {["User Input → CLI Entry", "Context Assembly → File Discovery", "Tool Selection → Best Match", "Permission Check → User Approval", "Execution → Subprocess / API", "Output Parsing → Structured Data", "Self-Correction → Retry Logic", "Result Formatting → Markdown", "User Feedback Loop → Iterate", "Session Memory → Context Cache", "Response Complete → Cleanup"].map((s, i) => (
          <div key={i} style={{ padding: "8px 12px", background: "#0a0e14", borderRadius: 4, border: "1px solid #21262d", display: "flex", gap: 10 }}>
            <span style={{ fontSize: 10, color: "#00ffa0", fontFamily: "JetBrains Mono, monospace", flexShrink: 0 }}>Phase {i}</span>
            <span style={{ fontSize: 12, color: "#c9d1d9" }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  ),
  tools: () => {
    const tools = [
      { emoji: "📖", name: "Read", desc: "读取文件内容，支持分页和语法高亮" },
      { emoji: "✏️", name: "Write/Edit", desc: "创建新文件或精确编辑已有文件" },
      { emoji: "🔍", name: "Grep/Search", desc: "全局搜索代码模式和文件内容" },
      { emoji: "▶️", name: "Bash", desc: "执行 Shell 命令并获取输出" },
      { emoji: "🌐", name: "WebFetch/Search", desc: "抓取网页或搜索互联网信息" },
      { emoji: "📋", name: "Task/Todo", desc: "创建和管理任务列表" },
      { emoji: "🤖", name: "Agent", desc: "启动子 Agent 处理复杂子任务" },
      { emoji: "📸", name: "Screenshot", desc: "捕获终端或浏览器截图" },
    ];
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {tools.map((t) => (
          <div key={t.name} style={{ padding: "12px 14px", background: "#0a0e14", borderRadius: 6, border: "1px solid #21262d" }}>
            <div style={{ fontSize: 16, marginBottom: 6 }}>{t.emoji}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#e6edf3", fontFamily: "JetBrains Mono, monospace", marginBottom: 4 }}>{t.name}</div>
            <div style={{ fontSize: 11, color: "#8b949e" }}>{t.desc}</div>
          </div>
        ))}
      </div>
    );
  },
  commands: () => {
    const cmds = [
      { cmd: "/help", desc: "查看帮助和可用命令列表" },
      { cmd: "/clear", desc: "清空当前对话上下文" },
      { cmd: "/compact", desc: "压缩对话历史以节省 token" },
      { cmd: "/init", desc: "初始化项目 CLAUDE.md 指导文件" },
      { cmd: "/doctor", desc: "诊断环境和配置问题" },
      { cmd: "/pr-comment", desc: "对 PR 生成 Code Review 评论" },
      { cmd: "/review", desc: "代码审查当前更改" },
      { cmd: "/add-dir", desc: "添加工作目录到上下文" },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {cmds.map((c) => (
          <div key={c.cmd} style={{ display: "flex", gap: 12, padding: "10px 14px", background: "#0a0e14", borderRadius: 6, border: "1px solid #21262d" }}>
            <code style={{ fontSize: 12, color: "#00ffa0", fontFamily: "JetBrains Mono, monospace", flexShrink: 0, minWidth: 140 }}>{c.cmd}</code>
            <span style={{ fontSize: 12, color: "#8b949e" }}>{c.desc}</span>
          </div>
        ))}
      </div>
    );
  },
  hidden: () => {
    const features = ["🐛 Bug Hunter Mode", "🎭 Persona Switching", "🔗 Multi-File Edit", "🔄 Auto-Compile Fix", "📊 Token Usage Stats", "🧪 Experimental Features", "⚡ Turbo Mode", "🔐 Secrets Detection"];
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {features.map((f) => (
          <div key={f} style={{ padding: 14, background: "#0a0e14", borderRadius: 8, border: "1px solid #21262d", textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{f.slice(0, 2)}</div>
            <div style={{ fontSize: 11, color: "#c9d1d9", fontFamily: "JetBrains Mono, monospace" }}>{f.slice(2)}</div>
          </div>
        ))}
      </div>
    );
  },
};

export default function CodePage() {
  const [activeTab, setActiveTab] = useState("simulator");
  const Content = CONTENT[activeTab];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 24px", borderBottom: "1px solid #21262d", background: "#0a0e14" }}>
        <h1 style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", fontFamily: "JetBrains Mono, monospace" }}>🦀 Code / Claude Code 教学</h1>
      </div>
      <div style={{ display: "flex", borderBottom: "1px solid #21262d", background: "#0a0e14", overflowX: "auto" }}>
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: "10px 16px", background: activeTab === tab.id ? "rgba(0,255,160,0.06)" : "transparent",
            border: "none", borderBottom: activeTab === tab.id ? "2px solid #00ffa0" : "2px solid transparent",
            color: activeTab === tab.id ? "#00ffa0" : "#8b949e", fontSize: 12, fontFamily: "JetBrains Mono, monospace",
            cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6,
          }}><span>{tab.emoji}</span> {tab.label}</button>
        ))}
      </div>
      <div style={{ flex: 1, padding: 24, overflow: "auto" }}><Content /></div>
    </div>
  );
}
