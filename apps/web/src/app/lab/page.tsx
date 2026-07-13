"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LabResponse, RagStep, InferStep } from "@teaching-tool/shared";
import GradientText from "@/components/bits/GradientText";
import { color, mono, sans, panel, card } from "@/lib/theme";

const TABS = [
  { id: "training", label: "训练对比" },
  { id: "fc", label: "函数调用" },
  { id: "whitebox", label: "分词对比" },
  { id: "infer", label: "推理全过程" },
  { id: "rag", label: "RAG 检索增强" },
];

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
    if (loading) return <p style={{ color: color.textTertiary, fontFamily: mono, fontSize: 13 }}>正在加载…</p>;
    if (error) return <p style={{ color: color.red, fontFamily: mono, fontSize: 13 }}>{error}</p>;
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
      <div style={{ padding: "12px 24px", borderBottom: `1px solid ${color.borderSubtle}`, background: color.surface }}>
        <h1 style={{ fontSize: 13, fontWeight: 600, color: color.textPrimary, fontFamily: mono }}><GradientText>🧪 Lab / 交互实验室</GradientText></h1>
      </div>
      <div style={{ display: "flex", borderBottom: `1px solid ${color.borderSubtle}`, background: color.surface, overflowX: "auto" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "10px 16px", background: activeTab === t.id ? color.brandYellowTint : "transparent",
            border: "none", borderBottom: activeTab === t.id ? `2px solid ${color.brandYellow}` : "2px solid transparent",
            color: activeTab === t.id ? color.textPrimary : color.textSecondary, fontSize: 12, fontFamily: mono,
            fontWeight: activeTab === t.id ? 600 : 500,
            cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6,
          }}>{t.label}</button>
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

  if (!t) return <p style={{ color: color.textTertiary, fontFamily: mono }}>暂无数据</p>;
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="输入一个问题…" style={{
          flex: 1, padding: "8px 12px", background: color.surfaceSubtle, border: `1px solid ${color.border}`, borderRadius: 6,
          color: color.textPrimary, fontSize: 13, fontFamily: sans,
        }} onKeyDown={(e) => e.key === "Enter" && run()} />
        <button onClick={run} disabled={streaming} style={{
          padding: "8px 18px", borderRadius: 6, border: "none", background: streaming ? color.surfaceSubtle : color.ctaBg,
          color: streaming ? color.textDisabled : color.ctaText, fontFamily: mono, fontSize: 12, fontWeight: 600,
          cursor: streaming ? "not-allowed" : "pointer",
        }}>{streaming ? "生成中…" : "▶ 对比生成"}</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ ...card, padding: 16, minHeight: 160 }}>
          <div style={{ fontSize: 11, color: color.red, fontFamily: mono, marginBottom: 10 }}>🅱 基座模型（仅预训练 · 续写）</div>
          <p style={{ fontSize: 13, color: color.textSecondary, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{base}{streaming && <span style={{ color: color.red }}>▌</span>}</p>
        </div>
        <div style={{ ...card, padding: 16, minHeight: 160, borderColor: color.teal }}>
          <div style={{ fontSize: 11, color: color.teal, fontFamily: mono, marginBottom: 10 }}>✅ SFT 模型（指令微调 · 跟随）</div>
          <p style={{ fontSize: 13, color: color.textSecondary, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{sft}{streaming && <span style={{ color: color.teal }}>▌</span>}</p>
        </div>
      </div>
      <p style={{ fontSize: 11, color: color.textTertiary, marginTop: 14, lineHeight: 1.7 }}>
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
  const roleColors: Record<string, string> = { system: color.purple, user: color.blue, assistant: color.teal, tool: color.orange };

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
                <pre style={{ margin: 0, background: color.surfaceSubtle, borderRadius: 4, padding: "8px 10px", fontFamily: mono, fontSize: 10.5, color: color.blue, whiteSpace: "pre-wrap", lineHeight: 1.55, border: `1px solid ${color.borderSubtle}` }}>{JSON.stringify(s.jsonObj, null, 2)}</pre>
              ) : (
                <div style={{ fontFamily: mono, fontSize: 12, color: s.highlight ? color.orange : color.textSecondary, background: s.highlight ? `color-mix(in srgb, ${color.orange} 12%, transparent)` : color.surfaceSubtle, padding: "8px 10px", borderRadius: 4, border: s.highlight ? `1px solid color-mix(in srgb, ${color.orange} 30%, transparent)` : "none" }}>
                  {s.highlight && <div style={{ fontSize: 10, color: color.orange, marginBottom: 4 }}>⚡ 应用层代码执行，与模型无关</div>}
                  {s.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div style={{ ...panel, padding: 14, alignSelf: "start" }}>
        <div style={{ fontSize: 10, color: color.textTertiary, fontFamily: mono, marginBottom: 10 }}>messages[ ]</div>
        {messages.map((m, i) => (
          <div key={i} style={{ borderLeft: `2px solid ${roleColors[m.role]}`, paddingLeft: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 10.5, color: roleColors[m.role], fontFamily: mono }}>{m.role}</span>
            <div style={{ fontSize: 11, color: color.textSecondary, fontFamily: mono, lineHeight: 1.5 }}>{m.content.length > 36 ? m.content.slice(0, 36) + "…" : m.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TokenizerDemo({ data }: { data: LabResponse }) {
  const tok = data.tokenizer;
  const [mode, setMode] = useState(0);
  if (!tok) return <p style={{ color: color.textTertiary, fontFamily: mono }}>暂无数据</p>;
  const m = tok.modes[mode];
  return (
    <div style={{ display: "flex", gap: 20 }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {tok.modes.map((mm, i) => (
            <button key={mm.key} onClick={() => setMode(i)} style={{
              padding: "5px 14px", borderRadius: 5, fontSize: 11, fontFamily: mono, cursor: "pointer",
              background: mode === i ? color.brandYellowTint : color.surface,
              border: mode === i ? `1px solid ${color.brandYellow}` : `1px solid ${color.border}`,
              color: mode === i ? color.textPrimary : color.textSecondary,
            }}>{mm.label}</button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: color.textSecondary, fontFamily: mono, marginBottom: 16 }}>{m.intro}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {m.groups.map((g, gi) => (
            <div key={gi} style={{ ...card, padding: 16 }}>
              <div style={{ fontSize: 11, color: g.titleColor, fontFamily: mono, marginBottom: 12, fontWeight: 600 }}>{g.title}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {g.bars.map((b, bi) => (
                  <div key={bi}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: color.textSecondary }}>{b.label}</span>
                      <span style={{ fontSize: 11, color: b.valueColor, fontFamily: mono, fontWeight: 600 }}>{b.value}</span>
                    </div>
                    <div style={{ height: b.sample ? 28 : 8, background: color.surfaceSubtle, borderRadius: 4, overflow: "hidden", display: "flex", alignItems: "center" }}>
                      <div style={{ width: `${b.widthPct}%`, height: "100%", background: b.barColor, borderRadius: 4, display: "flex", alignItems: "center", padding: b.sample ? "0 8px" : 0 }}>
                        {b.sample && <span style={{ fontFamily: mono, fontSize: 10, color: b.valueColor }}>{b.sample}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ padding: "10px 12px", background: `color-mix(in srgb, ${m.note.color} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${m.note.color} 25%, transparent)`, borderRadius: 6, fontSize: 11, color: color.textSecondary, lineHeight: 1.6 }}>💡 {m.note.text}</div>
        </div>
      </div>
      <div style={{ width: 240, flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: color.orange, fontFamily: mono, marginBottom: 12, letterSpacing: "0.05em" }}>{tok.quickref.title}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tok.quickref.cards.map((c, i) => (
            <div key={i} style={{ ...card, padding: 10 }}>
              <div style={{ fontSize: 10, color: color.textTertiary, fontFamily: mono, marginBottom: 6 }}>{c.label}</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 11, color: c.zhColor }}>中文</span><span style={{ fontSize: 13, color: c.zhColor, fontFamily: mono, fontWeight: 600 }}>{c.zh}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}><span style={{ fontSize: 11, color: color.teal }}>英文</span><span style={{ fontSize: 13, color: color.teal, fontFamily: mono, fontWeight: 600 }}>{c.en}</span></div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 10, color: color.textTertiary, fontFamily: mono, lineHeight: 1.5 }}>{tok.quickref.footnote}</div>
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
          const accent = rag && i >= 4 ? color.teal : rag ? color.blue : color.teal;
          return (
            <div key={i}>
              {rag?.phase && (
                <div style={{ fontSize: 11, color: rag.phaseColor ?? accent, fontFamily: mono, fontWeight: 600, margin: "6px 0 8px" }}>― {rag.phase} ―</div>
              )}
              <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                <span style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, background: `color-mix(in srgb, ${accent} 12%, transparent)`, border: `1px solid ${accent}` }}>{s.icon}</span>
                <div style={{ flex: 1, ...card, padding: "14px 16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: accent, fontFamily: mono, marginBottom: 6 }}>{s.num} · {s.title}</div>
                  <div style={{ fontSize: 12, color: color.textSecondary, lineHeight: 1.7 }}>{s.desc}</div>
                  {s.code && <pre style={{ marginTop: 10, background: color.surfaceSubtle, borderRadius: 5, padding: "10px 12px", fontFamily: mono, fontSize: 10, color: color.textSecondary, whiteSpace: "pre-wrap", lineHeight: 1.6, border: `1px solid ${color.borderSubtle}`, overflowX: "auto" }}>{s.code}</pre>}
                </div>
              </div>
            </div>
          );
        })}
        {step === 0 && <p style={{ color: color.textTertiary, fontFamily: mono, fontSize: 12 }}>点击「开始演示」逐步查看。</p>}
      </div>
    </div>
  );
}

const btn = (disabled: boolean) => ({
  padding: "6px 16px", borderRadius: 5, border: "none",
  background: disabled ? color.surfaceSubtle : color.ctaBg, color: disabled ? color.textDisabled : color.ctaText,
  fontFamily: mono, fontSize: 11, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
} as const);

const resetBtn = {
  padding: "6px 12px", borderRadius: 5, border: `1px solid ${color.border}`, background: "transparent",
  color: color.textSecondary, fontFamily: mono, fontSize: 11, cursor: "pointer",
} as const;
