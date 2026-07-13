"use client";

import { useEffect, useState } from "react";
import type {
  CodeResponse,
  CodeTool,
  CodeCommand,
} from "@teaching-tool/shared";
import GradientText from "@/components/bits/GradientText";
import { color, mono, panel } from "@/lib/theme";

const TABS = [
  { id: "tools", label: "工具系统" },
  { id: "commands", label: "命令目录" },
  { id: "simulator", label: "模拟器" },
  { id: "agent-loop", label: "Agent 循环" },
  { id: "hidden", label: "隐藏功能" },
];

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
          <div style={{ ...panel, padding: 16, marginBottom: 16, borderColor: color.brandYellow }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{selectedTool.emoji}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: color.textPrimary, fontFamily: mono, marginBottom: 6 }}>
              {selectedTool.name} · {selectedTool.title}{selectedTool.isExp ? " 🔒" : ""}
            </div>
            <p style={{ fontSize: 12.5, color: color.textSecondary, lineHeight: 1.7, marginBottom: 8 }}>{selectedTool.plain}</p>
            <div style={{ fontSize: 11, color: color.textSecondary, fontFamily: mono }}>示例：{selectedTool.example}</div>
          </div>
        )}
        {cats.map((cat) => (
          <div key={cat.slug} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, color: color.textSecondary, fontFamily: mono, marginBottom: 8 }}>{cat.label} ({cat.count})</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {cat.tools.map((t) => (
                <button key={t.name} onClick={() => setSelectedTool(t)} style={{
                  fontSize: 11, fontFamily: mono, padding: "4px 10px", borderRadius: 4, cursor: "pointer",
                  background: selectedTool?.name === t.name ? color.brandYellowTint : color.surface,
                  border: selectedTool?.name === t.name ? `1px solid ${color.brandYellow}` : `1px solid ${color.border}`,
                  color: selectedTool?.name === t.name ? color.textPrimary : color.textSecondary,
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
          <div style={{ ...panel, padding: 16, marginBottom: 16, borderColor: color.brandYellow }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: color.textPrimary, fontFamily: mono, marginBottom: 6 }}>
              {selectedCmd.emoji} {selectedCmd.cmd} · {selectedCmd.title}{selectedCmd.isExp ? " 🔒" : ""}
            </div>
            <p style={{ fontSize: 12.5, color: color.textSecondary, lineHeight: 1.7, marginBottom: 8 }}>{selectedCmd.plain}</p>
            <div style={{ fontSize: 11, color: color.textSecondary, fontFamily: mono }}>场景：{selectedCmd.example}</div>
          </div>
        )}
        {cats.map((cat) => (
          <div key={cat.slug} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, color: color.textSecondary, fontFamily: mono, marginBottom: 8 }}>{cat.label} ({cat.count})</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {cat.commands.map((c) => (
                <button key={c.cmd} onClick={() => setSelectedCmd(c)} style={{
                  fontSize: 10.5, fontFamily: mono, padding: "3px 10px", borderRadius: 4, cursor: "pointer",
                  background: selectedCmd?.cmd === c.cmd ? color.brandYellowTint : color.surface,
                  border: selectedCmd?.cmd === c.cmd ? `1px solid ${color.brandYellow}` : `1px solid ${color.border}`,
                  color: selectedCmd?.cmd === c.cmd ? color.textPrimary : color.textSecondary,
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
              background: simStep >= steps.length ? color.surfaceSubtle : color.ctaBg,
              color: simStep >= steps.length ? color.textDisabled : color.ctaText,
              fontFamily: mono, fontSize: 11, fontWeight: 600,
              cursor: simStep >= steps.length ? "not-allowed" : "pointer",
            }}
          >
            {simStep === 0 ? "▶ 开始演示" : simStep >= steps.length ? "✓ 演示完毕" : `▶ 下一步（${simStep}/${steps.length}）`}
          </button>
          <button onClick={() => setSimStep(0)} style={{ padding: "6px 12px", borderRadius: 5, border: `1px solid ${color.border}`, background: "transparent", color: color.textSecondary, fontFamily: mono, fontSize: 11, cursor: "pointer" }}>重置</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ ...panel, padding: 14, minHeight: 200 }}>
            <div style={{ fontSize: 10, color: color.textTertiary, fontFamily: mono, marginBottom: 8 }}>TERMINAL</div>
            {terminalLines.length === 0 && <div style={{ fontSize: 11, color: color.textTertiary, fontFamily: mono }}>点击「开始演示」逐步执行</div>}
            {terminalLines.map((line, i) => (
              <div key={i} style={{ fontSize: 11.5, color: color.textSecondary, fontFamily: mono, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{line}</div>
            ))}
          </div>
          <div style={{ minHeight: 200 }}>
            <div style={{ fontSize: 10, color: color.textTertiary, fontFamily: mono, marginBottom: 8 }}>SEQUENCE</div>
            {shown.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, fontFamily: mono, color: s.seq.tagColor, background: s.seq.tagColor + "18", border: `1px solid ${s.seq.tagColor}44` }}>{String(i + 1).padStart(2, "0")}</span>
                <div style={{ flex: 1, ...panel, background: color.surface, padding: "8px 10px" }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 9, color: s.seq.tagColor, border: `1px solid ${s.seq.tagColor}44`, borderRadius: 3, padding: "1px 6px", fontFamily: mono }}>{s.seq.tag}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: s.seq.tagColor, fontFamily: mono }}>{s.seq.title}</span>
                  </div>
                  <div style={{ fontSize: 11, color: color.textSecondary, lineHeight: 1.6 }}>{s.seq.desc}</div>
                  {s.seq.code && <pre style={{ marginTop: 6, background: color.surfaceSubtle, borderRadius: 4, padding: "8px 10px", fontFamily: mono, fontSize: 10, color: s.seq.tagColor, whiteSpace: "pre-wrap", lineHeight: 1.5, border: `1px solid ${color.borderSubtle}` }}>{s.seq.code}</pre>}
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
            <span style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, fontFamily: mono, color: color.textPrimary, background: color.surfaceSubtle, border: `1px solid ${color.border}` }}>{s.num}</span>
            <div style={{ flex: 1, ...panel, background: color.surface, padding: "12px 14px" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: color.textPrimary, fontFamily: mono }}>{s.title}</span>
                <span style={{ fontSize: 9, color: color.textTertiary, background: color.surfaceSubtle, padding: "1px 6px", borderRadius: 3, fontFamily: mono }}>{s.src}</span>
              </div>
              <div style={{ fontSize: 12, color: color.textSecondary, lineHeight: 1.6 }}>{s.desc}</div>
              {s.code && <pre style={{ marginTop: 8, background: color.surfaceSubtle, borderRadius: 4, padding: "8px 10px", fontFamily: mono, fontSize: 10, color: color.textSecondary, whiteSpace: "pre-wrap", lineHeight: 1.5, border: `1px solid ${color.borderSubtle}` }}>{s.code}</pre>}
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
          <div key={f.name} style={{ ...panel, background: color.surface, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: color.textPrimary, fontFamily: mono, marginBottom: 6 }}>{f.name}</div>
            <div style={{ fontSize: 11.5, color: color.textSecondary, lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderBody = () => {
    if (loading) return <p style={{ color: color.textTertiary, fontFamily: mono, fontSize: 13 }}>正在加载…</p>;
    if (error) return <p style={{ color: color.red, fontFamily: mono, fontSize: 13 }}>{error}</p>;
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
      <div style={{ padding: "12px 24px", borderBottom: `1px solid ${color.borderSubtle}`, background: color.surface }}>
        <h1 style={{ fontSize: 13, fontWeight: 600, color: color.textPrimary, fontFamily: mono }}><GradientText>🦀 Code / Claude Code 教学</GradientText></h1>
      </div>
      <div style={{ display: "flex", borderBottom: `1px solid ${color.borderSubtle}`, background: color.surface, overflowX: "auto" }}>
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: "10px 16px", background: activeTab === tab.id ? color.brandYellowTint : "transparent",
            border: "none", borderBottom: activeTab === tab.id ? `2px solid ${color.brandYellow}` : "2px solid transparent",
            color: activeTab === tab.id ? color.textPrimary : color.textSecondary, fontSize: 12, fontFamily: mono,
            fontWeight: activeTab === tab.id ? 600 : 500,
            cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6,
          }}>{tab.label}</button>
        ))}
      </div>
      <div style={{ flex: 1, padding: 24, overflow: "auto" }}>{renderBody()}</div>
    </div>
  );
}
