"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LabResponse, RagStep, InferStep } from "@teaching-tool/shared";

const TABS = [
  { id: "training", label: "训练对比", emoji: "🎓" },
  { id: "fc", label: "函数调用", emoji: "🔧" },
  { id: "whitebox", label: "分词对比", emoji: "🔬" },
  { id: "infer", label: "推理全过程", emoji: "⚙" },
  { id: "rag", label: "RAG 检索增强", emoji: "🔎" },
];

const mono = "JetBrains Mono, monospace";
const panel = { background: "#0a0e14", border: "1px solid #21262d", borderRadius: 8 } as const;
const card = { background: "#161b22", border: "1px solid #30363d", borderRadius: 8 } as const;

export default function LabPage() {
  const [data, setData] = useState<LabResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("training");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/content/lab");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: LabResponse = await res.json();
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

  const body = () => {
    if (loading) return <p style={{ color: "#484f58", fontFamily: mono, fontSize: 13 }}>正在加载…</p>;
    if (error) return <p style={{ color: "#ff6b6b", fontFamily: mono, fontSize: 13 }}>{error}</p>;
    if (!data) return null;
    switch (activeTab) {
      case "training": return <TrainingDemo data={data} />;
      case "fc": return <FunctionCallDemo data={data} />;
      case "whitebox": return <TokenizerDemo data={data} />;
      case "infer": return <StepDemo steps={data.inference} kind="infer" />;
      case "rag": return <StepDemo steps={data.rag} kind="rag" />;
      default: return null;
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 24px", borderBottom: "1px solid #21262d", background: "#0a0e14" }}>
        <h1 style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", fontFamily: mono }}>🧪 Lab / 交互实验室</h1>
      </div>
      <div style={{ display: "flex", borderBottom: "1px solid #21262d", background: "#0a0e14", overflowX: "auto" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "10px 16px", background: activeTab === t.id ? "rgba(0,255,160,0.06)" : "transparent",
            border: "none", borderBottom: activeTab === t.id ? "2px solid #00ffa0" : "2px solid transparent",
            color: activeTab === t.id ? "#00ffa0" : "#8b949e", fontSize: 12, fontFamily: mono,
            cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6,
          }}><span>{t.emoji}</span> {t.label}</button>
        ))}
      </div>
      <div style={{ flex: 1, padding: 24, overflow: "auto" }}>{body()}</div>
    </div>
  );
}

function TrainingDemo({ data }: { data: LabResponse }) {
  const t = data.training;
  const [q, setQ] = useState(t?.defaultQuestion ?? "");
  const [base, setBase] = useState("");
  const [sft, setSft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const run = () => {
    if (!t || !q.trim()) return;
    if (timer.current) clearTimeout(timer.current);
    const baseAns = t.baseTemplate.split("{q}").join(q);
    const sftAns = t.sftAnswer;
    setBase(""); setSft(""); setStreaming(true);
    let i = 0, j = 0;
    const tick = () => {
      i = Math.min(i + 3, baseAns.length); j = Math.min(j + 2, sftAns.length);
      setBase(baseAns.slice(0, i)); setSft(sftAns.slice(0, j));
      if (i < baseAns.length || j < sftAns.length) timer.current = setTimeout(tick, 38);
      else setStreaming(false);
    };
    timer.current = setTimeout(tick, 80);
  };

  if (!t) return <p style={{ color: "#484f58", fontFamily: mono }}>暂无数据</p>;
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="输入一个问题…" style={{
          flex: 1, padding: "8px 12px", background: "#0a0e14", border: "1px solid #30363d", borderRadius: 6,
          color: "#c9d1d9", fontSize: 13, fontFamily: "Inter, sans-serif",
        }} onKeyDown={(e) => e.key === "Enter" && run()} />
        <button onClick={run} disabled={streaming} style={{
          padding: "8px 18px", borderRadius: 6, border: "none", background: streaming ? "#21262d" : "#00ffa0",
          color: streaming ? "#6e7681" : "#0d1117", fontFamily: mono, fontSize: 12, fontWeight: 700,
          cursor: streaming ? "not-allowed" : "pointer",
        }}>{streaming ? "生成中…" : "▶ 对比生成"}</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ ...card, padding: 16, minHeight: 160 }}>
          <div style={{ fontSize: 11, color: "#ff7b72", fontFamily: mono, marginBottom: 10 }}>🅱 基座模型（仅预训练 · 续写）</div>
          <p style={{ fontSize: 13, color: "#c9d1d9", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{base}{streaming && <span style={{ color: "#ff7b72" }}>▌</span>}</p>
        </div>
        <div style={{ ...card, padding: 16, minHeight: 160, borderColor: "rgba(0,255,160,0.2)" }}>
          <div style={{ fontSize: 11, color: "#00ffa0", fontFamily: mono, marginBottom: 10 }}>✅ SFT 模型（指令微调 · 跟随）</div>
          <p style={{ fontSize: 13, color: "#c9d1d9", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{sft}{streaming && <span style={{ color: "#00ffa0" }}>▌</span>}</p>
        </div>
      </div>
      <p style={{ fontSize: 11, color: "#484f58", marginTop: 14, lineHeight: 1.7 }}>
        基座模型把问题当成训练语料继续「续写」，而 SFT 模型学会了「听懂指令并回答」——这是指令微调的核心价值。
      </p>
    </div>
  );
}

function FunctionCallDemo({ data }: { data: LabResponse }) {
  const steps = data.functionCall;
  const [step, setStep] = useState(0);
  const shown = steps.slice(0, step + 1);

  const messages = useMemo(() => {
    const m: { role: string; content: string }[] = [
      { role: "system", content: "你是一个助手，可以调用工具获取天气信息。" },
      { role: "user", content: "上海今天天气怎么样？" },
    ];
    if (step >= 1) m.push({ role: "assistant", content: "[tool_call: get_weather]" });
    if (step >= 3) m.push({ role: "tool", content: '{"temp":28,"weather":"晴转多云"}' });
    if (step >= 4) m.push({ role: "assistant", content: "上海今天晴转多云，气温 28°C…" });
    return m;
  }, [step]);
  const roleColors: Record<string, string> = { system: "#d2a8ff", user: "#79c0ff", assistant: "#7ee787", tool: "#ffa657" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
      <div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <button onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))} disabled={step >= steps.length - 1} style={btn(step >= steps.length - 1)}>
            {step >= steps.length - 1 ? "✓ 完成" : `▶ 下一步（${step + 1}/${steps.length}）`}
          </button>
          <button onClick={() => setStep(0)} style={resetBtn}>↺ 重置</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {shown.map((s, i) => (
            <div key={i} style={{ ...card, padding: "10px 12px", borderColor: s.color + "22" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, background: s.color + "15", border: `1px solid ${s.color}44` }}>{s.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: s.color, fontFamily: mono }}>{s.label}</span>
              </div>
              {s.jsonObj ? (
                <pre style={{ margin: 0, background: "#0d1117", borderRadius: 4, padding: "8px 10px", fontFamily: mono, fontSize: 10.5, color: "#a5d6ff", whiteSpace: "pre-wrap", lineHeight: 1.55, border: "1px solid #21262d" }}>{JSON.stringify(s.jsonObj, null, 2)}</pre>
              ) : (
                <div style={{ fontFamily: mono, fontSize: 12, color: s.highlight ? "#ffa657" : "#c9d1d9", background: s.highlight ? "rgba(255,166,87,0.06)" : "#0a0e14", padding: "8px 10px", borderRadius: 4, border: s.highlight ? "1px solid rgba(255,166,87,0.2)" : "none" }}>
                  {s.highlight && <div style={{ fontSize: 10, color: "#ffa657", marginBottom: 4 }}>⚡ 应用层代码执行，与模型无关</div>}
                  {s.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div style={{ ...panel, padding: 14, alignSelf: "start" }}>
        <div style={{ fontSize: 10, color: "#484f58", fontFamily: mono, marginBottom: 10 }}>messages[ ]</div>
        {messages.map((m, i) => (
          <div key={i} style={{ borderLeft: `2px solid ${roleColors[m.role]}`, paddingLeft: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 10.5, color: roleColors[m.role], fontFamily: mono }}>{m.role}</span>
            <div style={{ fontSize: 11, color: "#a5d6ff", fontFamily: mono, lineHeight: 1.5 }}>{m.content.length > 36 ? m.content.slice(0, 36) + "…" : m.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TokenizerDemo({ data }: { data: LabResponse }) {
  const tok = data.tokenizer;
  const [mode, setMode] = useState(0);
  if (!tok) return <p style={{ color: "#484f58", fontFamily: mono }}>暂无数据</p>;
  const m = tok.modes[mode];
  return (
    <div style={{ display: "flex", gap: 20 }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {tok.modes.map((mm, i) => (
            <button key={mm.key} onClick={() => setMode(i)} style={{
              padding: "5px 14px", borderRadius: 5, fontSize: 11, fontFamily: mono, cursor: "pointer",
              background: mode === i ? "rgba(0,255,160,0.1)" : "transparent",
              border: mode === i ? "1px solid #00ffa0" : "1px solid #30363d",
              color: mode === i ? "#00ffa0" : "#6e7681",
            }}>{mm.label}</button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "#6e7681", fontFamily: mono, marginBottom: 16 }}>{m.intro}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {m.groups.map((g, gi) => (
            <div key={gi} style={{ ...card, padding: 16 }}>
              <div style={{ fontSize: 11, color: g.titleColor, fontFamily: mono, marginBottom: 12, fontWeight: 600 }}>{g.title}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {g.bars.map((b, bi) => (
                  <div key={bi}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: "#c9d1d9" }}>{b.label}</span>
                      <span style={{ fontSize: 11, color: b.valueColor, fontFamily: mono, fontWeight: 600 }}>{b.value}</span>
                    </div>
                    <div style={{ height: b.sample ? 28 : 8, background: "#21262d", borderRadius: 4, overflow: "hidden", display: "flex", alignItems: "center" }}>
                      <div style={{ width: `${b.widthPct}%`, height: "100%", background: b.barColor, borderRadius: 4, display: "flex", alignItems: "center", padding: b.sample ? "0 8px" : 0 }}>
                        {b.sample && <span style={{ fontFamily: mono, fontSize: 10, color: b.valueColor }}>{b.sample}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ padding: "10px 12px", background: m.note.color + "0d", border: `1px solid ${m.note.color}26`, borderRadius: 6, fontSize: 11, color: "#8b949e", lineHeight: 1.6 }}>💡 {m.note.text}</div>
        </div>
      </div>
      <div style={{ width: 240, flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: "#ffa657", fontFamily: mono, marginBottom: 12, letterSpacing: "0.05em" }}>{tok.quickref.title}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tok.quickref.cards.map((c, i) => (
            <div key={i} style={{ ...card, padding: 10 }}>
              <div style={{ fontSize: 10, color: "#484f58", fontFamily: mono, marginBottom: 6 }}>{c.label}</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 11, color: c.zhColor }}>中文</span><span style={{ fontSize: 13, color: c.zhColor, fontFamily: mono, fontWeight: 700 }}>{c.zh}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}><span style={{ fontSize: 11, color: "#7ee787" }}>英文</span><span style={{ fontSize: 13, color: "#7ee787", fontFamily: mono, fontWeight: 700 }}>{c.en}</span></div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 10, color: "#484f58", fontFamily: mono, lineHeight: 1.5 }}>{tok.quickref.footnote}</div>
      </div>
    </div>
  );
}

function StepDemo({ steps, kind }: { steps: (InferStep | RagStep)[]; kind: "infer" | "rag" }) {
  const [step, setStep] = useState(0);
  const shown = steps.slice(0, step);
  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button onClick={() => setStep((s) => Math.min(s + 1, steps.length))} disabled={step >= steps.length} style={btn(step >= steps.length)}>
          {step === 0 ? "▶ 开始演示" : step >= steps.length ? "✓ 演示完毕" : `▶ 下一步（${step}/${steps.length}）`}
        </button>
        <button onClick={() => setStep(0)} style={resetBtn}>↺ 重置</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {shown.map((s, i) => {
          const rag = kind === "rag" ? (s as RagStep) : null;
          const accent = rag && i >= 4 ? "#00ffa0" : rag ? "#58a6ff" : "#00ffa0";
          return (
            <div key={i}>
              {rag?.phase && (
                <div style={{ fontSize: 11, color: rag.phaseColor ?? accent, fontFamily: mono, fontWeight: 600, margin: "6px 0 8px" }}>― {rag.phase} ―</div>
              )}
              <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                <span style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, background: accent + "1a", border: `2px solid ${accent}` }}>{s.icon}</span>
                <div style={{ flex: 1, ...card, padding: "14px 16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: accent, fontFamily: mono, marginBottom: 6 }}>{s.num} · {s.title}</div>
                  <div style={{ fontSize: 12, color: "#8b949e", lineHeight: 1.7 }}>{s.desc}</div>
                  {s.code && <pre style={{ marginTop: 10, background: "#0d1117", borderRadius: 5, padding: "10px 12px", fontFamily: mono, fontSize: 10, color: "#7ee787", whiteSpace: "pre-wrap", lineHeight: 1.6, border: "1px solid #21262d", overflowX: "auto" }}>{s.code}</pre>}
                </div>
              </div>
            </div>
          );
        })}
        {step === 0 && <p style={{ color: "#484f58", fontFamily: mono, fontSize: 12 }}>点击「开始演示」逐步查看。</p>}
      </div>
    </div>
  );
}

const btn = (disabled: boolean) => ({
  padding: "6px 16px", borderRadius: 5, border: "none",
  background: disabled ? "#21262d" : "#00ffa0", color: disabled ? "#6e7681" : "#0d1117",
  fontFamily: mono, fontSize: 11, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
} as const);

const resetBtn = {
  padding: "6px 12px", borderRadius: 5, border: "1px solid #30363d", background: "transparent",
  color: "#8b949e", fontFamily: mono, fontSize: 11, cursor: "pointer",
} as const;
