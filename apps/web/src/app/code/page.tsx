"use client";

import { useEffect, useState } from "react";
import type {
  CodeResponse,
  CodeTool,
  CodeCommand,
} from "@teaching-tool/shared";

const TABS = [
  { id: "tools", label: "工具系统", emoji: "🔨" },
  { id: "commands", label: "命令目录", emoji: "⌨" },
  { id: "simulator", label: "模拟器", emoji: "🖥" },
  { id: "agent-loop", label: "Agent 循环", emoji: "🔄" },
  { id: "hidden", label: "隐藏功能", emoji: "🥷" },
];

const mono = "JetBrains Mono, monospace";
const panel = { background: "#0a0e14", border: "1px solid #21262d", borderRadius: 8 } as const;

export default function CodePage() {
  const [data, setData] = useState<CodeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("tools");
  const [simStep, setSimStep] = useState(0);
  const [selectedTool, setSelectedTool] = useState<CodeTool | null>(null);
  const [selectedCmd, setSelectedCmd] = useState<CodeCommand | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/content/code");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: CodeResponse = await res.json();
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError("内容加载失败，请稍后重试");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const renderTools = () => {
    const cats = data?.tools.categories ?? [];
    return (
      <div>
        {selectedTool && (
          <div style={{ ...panel, padding: 16, marginBottom: 16, borderColor: "rgba(0,255,160,0.2)" }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{selectedTool.emoji}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", fontFamily: mono, marginBottom: 6 }}>
              {selectedTool.name} · {selectedTool.title}{selectedTool.isExp ? " 🔒" : ""}
            </div>
            <p style={{ fontSize: 12.5, color: "#c9d1d9", lineHeight: 1.7, marginBottom: 8 }}>{selectedTool.plain}</p>
            <div style={{ fontSize: 11, color: "#00ffa0", fontFamily: mono }}>示例：{selectedTool.example}</div>
          </div>
        )}
        {cats.map((cat) => (
          <div key={cat.slug} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, color: "#8b949e", fontFamily: mono, marginBottom: 8 }}>{cat.label} ({cat.count})</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {cat.tools.map((t) => (
                <button key={t.name} onClick={() => setSelectedTool(t)} style={{
                  fontSize: 11, fontFamily: mono, padding: "4px 10px", borderRadius: 4, cursor: "pointer",
                  background: selectedTool?.name === t.name ? "rgba(0,255,160,0.12)" : "#161b22",
                  border: selectedTool?.name === t.name ? "1px solid #00ffa0" : "1px solid #30363d",
                  color: selectedTool?.name === t.name ? "#00ffa0" : "#c9d1d9",
                }}>{t.emoji} {t.name}{t.isExp ? " 🔒" : ""}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCommands = () => {
    const cats = data?.commands.categories ?? [];
    return (
      <div>
        {selectedCmd && (
          <div style={{ ...panel, padding: 16, marginBottom: 16, borderColor: "rgba(88,166,255,0.25)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#79c0ff", fontFamily: mono, marginBottom: 6 }}>
              {selectedCmd.emoji} {selectedCmd.cmd} · {selectedCmd.title}{selectedCmd.isExp ? " 🔒" : ""}
            </div>
            <p style={{ fontSize: 12.5, color: "#c9d1d9", lineHeight: 1.7, marginBottom: 8 }}>{selectedCmd.plain}</p>
            <div style={{ fontSize: 11, color: "#58a6ff", fontFamily: mono }}>场景：{selectedCmd.example}</div>
          </div>
        )}
        {cats.map((cat) => (
          <div key={cat.slug} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, color: "#8b949e", fontFamily: mono, marginBottom: 8 }}>{cat.label} ({cat.count})</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {cat.commands.map((c) => (
                <button key={c.cmd} onClick={() => setSelectedCmd(c)} style={{
                  fontSize: 10.5, fontFamily: mono, padding: "3px 10px", borderRadius: 4, cursor: "pointer",
                  background: selectedCmd?.cmd === c.cmd ? "rgba(88,166,255,0.15)" : "#161b22",
                  border: selectedCmd?.cmd === c.cmd ? "2px solid #58a6ff" : "1px solid #30363d",
                  color: selectedCmd?.cmd === c.cmd ? "#79c0ff" : "#8b949e",
                }}>{c.cmd}{c.isExp ? " 🔒" : ""}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSimulator = () => {
    const steps = data?.simulator ?? [];
    const shown = steps.slice(0, simStep);
    const terminalLines = shown.flatMap((s) => s.terminal);
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <button
            onClick={() => setSimStep((s) => Math.min(s + 1, steps.length))}
            disabled={simStep >= steps.length}
            style={{
              padding: "6px 16px", borderRadius: 5, border: "none",
              background: simStep >= steps.length ? "#21262d" : "#00ffa0",
              color: simStep >= steps.length ? "#6e7681" : "#0d1117",
              fontFamily: mono, fontSize: 11, fontWeight: 700,
              cursor: simStep >= steps.length ? "not-allowed" : "pointer",
            }}
          >
            {simStep === 0 ? "▶ 开始演示" : simStep >= steps.length ? "✓ 演示完毕" : `▶ 下一步（${simStep}/${steps.length}）`}
          </button>
          <button onClick={() => setSimStep(0)} style={{ padding: "6px 12px", borderRadius: 5, border: "1px solid #30363d", background: "transparent", color: "#8b949e", fontFamily: mono, fontSize: 11, cursor: "pointer" }}>重置</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ ...panel, padding: 14, minHeight: 200 }}>
            <div style={{ fontSize: 10, color: "#484f58", fontFamily: mono, marginBottom: 8 }}>TERMINAL</div>
            {terminalLines.length === 0 && <div style={{ fontSize: 11, color: "#484f58", fontFamily: mono }}>点击「开始演示」逐步执行</div>}
            {terminalLines.map((line, i) => (
              <div key={i} style={{ fontSize: 11.5, color: "#c9d1d9", fontFamily: mono, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{line}</div>
            ))}
          </div>
          <div style={{ minHeight: 200 }}>
            <div style={{ fontSize: 10, color: "#484f58", fontFamily: mono, marginBottom: 8 }}>SEQUENCE</div>
            {shown.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, fontFamily: mono, color: s.seq.tagColor, background: s.seq.tagColor + "18", border: `1px solid ${s.seq.tagColor}44` }}>{String(i + 1).padStart(2, "0")}</span>
                <div style={{ flex: 1, ...panel, background: "#161b22", padding: "8px 10px" }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 9, color: s.seq.tagColor, border: `1px solid ${s.seq.tagColor}44`, borderRadius: 3, padding: "1px 6px", fontFamily: mono }}>{s.seq.tag}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: s.seq.tagColor, fontFamily: mono }}>{s.seq.title}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#8b949e", lineHeight: 1.6 }}>{s.seq.desc}</div>
                  {s.seq.code && <pre style={{ marginTop: 6, background: "#0d1117", borderRadius: 4, padding: "8px 10px", fontFamily: mono, fontSize: 10, color: s.seq.tagColor, whiteSpace: "pre-wrap", lineHeight: 1.5, border: "1px solid #21262d" }}>{s.seq.code}</pre>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAgentLoop = () => {
    const steps = data?.agentLoop ?? [];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {steps.map((s) => (
          <div key={s.num} style={{ display: "flex", gap: 10 }}>
            <span style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, fontFamily: mono, color: "#00ffa0", background: "rgba(0,255,160,0.08)", border: "1px solid rgba(0,255,160,0.25)" }}>{s.num}</span>
            <div style={{ flex: 1, ...panel, background: "#161b22", padding: "12px 14px" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#00ffa0", fontFamily: mono }}>{s.title}</span>
                <span style={{ fontSize: 9, color: "#484f58", background: "#21262d", padding: "1px 6px", borderRadius: 3, fontFamily: mono }}>{s.src}</span>
              </div>
              <div style={{ fontSize: 12, color: "#8b949e", lineHeight: 1.6 }}>{s.desc}</div>
              {s.code && <pre style={{ marginTop: 8, background: "#0d1117", borderRadius: 4, padding: "8px 10px", fontFamily: mono, fontSize: 10, color: "#7ee787", whiteSpace: "pre-wrap", lineHeight: 1.5, border: "1px solid #21262d" }}>{s.code}</pre>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderHidden = () => {
    const features = data?.hidden ?? [];
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
        {features.map((f) => (
          <div key={f.name} style={{ ...panel, background: "#161b22", padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#00ffa0", fontFamily: mono, marginBottom: 6 }}>{f.name}</div>
            <div style={{ fontSize: 11.5, color: "#8b949e", lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderBody = () => {
    if (loading) return <p style={{ color: "#484f58", fontFamily: mono, fontSize: 13 }}>正在加载…</p>;
    if (error) return <p style={{ color: "#ff6b6b", fontFamily: mono, fontSize: 13 }}>{error}</p>;
    switch (activeTab) {
      case "tools": return renderTools();
      case "commands": return renderCommands();
      case "simulator": return renderSimulator();
      case "agent-loop": return renderAgentLoop();
      case "hidden": return renderHidden();
      default: return null;
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 24px", borderBottom: "1px solid #21262d", background: "#0a0e14" }}>
        <h1 style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", fontFamily: mono }}>🦀 Code / Claude Code 教学</h1>
      </div>
      <div style={{ display: "flex", borderBottom: "1px solid #21262d", background: "#0a0e14", overflowX: "auto" }}>
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: "10px 16px", background: activeTab === tab.id ? "rgba(0,255,160,0.06)" : "transparent",
            border: "none", borderBottom: activeTab === tab.id ? "2px solid #00ffa0" : "2px solid transparent",
            color: activeTab === tab.id ? "#00ffa0" : "#8b949e", fontSize: 12, fontFamily: mono,
            cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6,
          }}><span>{tab.emoji}</span> {tab.label}</button>
        ))}
      </div>
      <div style={{ flex: 1, padding: 24, overflow: "auto" }}>{renderBody()}</div>
    </div>
  );
}
