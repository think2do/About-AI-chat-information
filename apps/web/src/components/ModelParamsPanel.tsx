"use client";

import { useEffect, useRef, useState } from "react";
import { color, mono, sans, panel, sectionLabel } from "@/lib/theme";

interface ModelParams {
  temperature: number;
  topP: number;
  maxTokens: number;
  frequencyPenalty: number;
  presencePenalty: number;
  reasoningEnabled?: boolean;
}

interface ModelParamsPanelProps {
  params: ModelParams;
  onChange: (params: ModelParams) => void;
  systemPrompt: string;
  onSystemPromptChange: (v: string) => void;
  messageCount?: number;
}

const SLIDERS = [
  { key: "temperature" as const, label: "Temperature", range: [0, 2], step: 0.01, tip: "控制随机性。高→发散有创意；低→确定专注。" },
  { key: "topP" as const, label: "Top-P", range: [0, 1], step: 0.01, tip: "核采样截断阈值，过滤低概率候选 token。" },
  { key: "maxTokens" as const, label: "Max Tokens", range: [16, 4096], step: 16, tip: "本次生成的最大输出长度。" },
  { key: "frequencyPenalty" as const, label: "Frequency Penalty", range: [0, 2], step: 0.01, tip: "降低已出现 token 的重复概率。" },
  { key: "presencePenalty" as const, label: "Presence Penalty", range: [0, 2], step: 0.01, tip: "鼓励引入未出现过的新话题词汇。" },
];

const JSON_KEY: Record<string, string> = {
  temperature: "temperature", topP: "top_p", maxTokens: "max_tokens",
  frequencyPenalty: "frequency_penalty", presencePenalty: "presence_penalty",
};

const PROB_TOKENS = ["是", "一种", "架构", "模型", "深度学习", "Transformer", "神经网络", "它", "基于", "通过", "注意力", "由", "序列", "机制", "包含"];
const PROB_LOGITS = [5.8, 5.2, 4.6, 4.1, 3.7, 3.2, 2.9, 2.5, 2.2, 1.9, 1.6, 1.3, 1.0, 0.7, 0.4];
const PROB_USED = new Set(["是", "Transformer"]);

function probDist(T: number, topP: number, fP: number, pP: number) {
  const t = Math.max(T, 0.01);
  const sc = PROB_LOGITS.map((l, i) => {
    let s = l / t;
    if (PROB_USED.has(PROB_TOKENS[i])) { s -= fP * 3; s -= pP * 2; }
    return s;
  });
  const mx = Math.max(...sc);
  const ex = sc.map((l) => Math.exp(Math.min(l - mx, 30)));
  const sm = ex.reduce((a, b) => a + b, 0);
  const pr = ex.map((e) => e / sm);
  const items = PROB_TOKENS.map((tk, i) => ({ tk, prob: pr[i], used: PROB_USED.has(tk) })).sort((a, b) => b.prob - a.prob);
  const maxP = items[0].prob || 1;
  let cum = 0, firstCutDone = false;
  return items.map((item, i) => {
    const prev = cum; cum += item.prob;
    const cut = prev >= topP;
    const firstCut = !firstCutDone && cut; if (cut) firstCutDone = true;
    const bw = Math.round((item.prob / maxP) * 100);
    const background = cut ? color.border
      : item.used ? `linear-gradient(90deg,${color.orange},${color.red}66)`
      : i === 0 ? `linear-gradient(90deg,${color.green},#00c88888)`
      : `linear-gradient(90deg,${color.blue},#388bfd88)`;
    const tokenColor = cut ? color.textFaint : item.used ? color.orange : i === 0 ? color.green : color.textSecondary;
    return { token: item.tk, probText: (item.prob * 100).toFixed(1) + "%", tokenColor, width: cut ? Math.max(bw * 0.25, 2) : bw, background, firstCut, used: item.used };
  });
}

export default function ModelParamsPanel({ params, onChange, systemPrompt, onSystemPromptChange, messageCount = 0 }: ModelParamsPanelProps) {
  const [changedKey, setChangedKey] = useState<string | null>(null);
  const [model, setModel] = useState("");
  const [provider, setProvider] = useState("");
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("llm_viz_settings");
      if (raw) {
        const s = JSON.parse(raw);
        const p = s.activeProvider || "openrouter";
        setProvider(p);
        setModel(s.providers?.[p]?.model || s.model || "");
      }
    } catch { /* ignore */ }
  }, []);
  useEffect(() => () => { if (flashTimer.current) clearTimeout(flashTimer.current); }, []);

  const change = (key: keyof ModelParams, value: number) => {
    onChange({ ...params, [key]: value });
    setChangedKey(JSON_KEY[key] ?? null);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setChangedKey(null), 1500);
  };

  const bars = probDist(params.temperature, params.topP, params.frequencyPenalty, params.presencePenalty);
  const reqLines: { text: string; key?: string }[] = [
    { text: "{" },
    { text: `  "model": "${model || "<model>"}",` },
    { text: `  "messages": [ …${messageCount + (systemPrompt ? 1 : 0)} 条… ],` },
    { text: `  "temperature": ${params.temperature},`, key: "temperature" },
    { text: `  "top_p": ${params.topP},`, key: "top_p" },
    { text: `  "max_tokens": ${params.maxTokens},`, key: "max_tokens" },
    { text: `  "frequency_penalty": ${params.frequencyPenalty},`, key: "frequency_penalty" },
    { text: `  "presence_penalty": ${params.presencePenalty},`, key: "presence_penalty" },
    ...(params.reasoningEnabled && provider === "openrouter" ? [{ text: `  "reasoning": { "effort": "medium" },` }] : []),
    { text: `  "stream": true` },
    { text: "}" },
  ];

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 18 }}>
      {/* System prompt */}
      <div>
        <div style={{ ...sectionLabel, marginBottom: 8 }}>System Prompt</div>
        <textarea
          value={systemPrompt}
          onChange={(e) => onSystemPromptChange(e.target.value)}
          placeholder="你是一个专业的 AI 技术助手…"
          rows={4}
          style={{ width: "100%", resize: "vertical", padding: "8px 10px", background: color.bgSecondary, border: `1px solid ${color.border}`, borderRadius: 6, color: color.textSecondary, fontSize: 12, fontFamily: sans, lineHeight: 1.6 }}
        />
      </div>

      {/* Parameters */}
      <div>
        <div style={{ ...sectionLabel, marginBottom: 10 }}>Parameters</div>
        {SLIDERS.map((s) => (
          <div key={s.key} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
              <span style={{ fontSize: 11, color: color.textPrimary, fontFamily: mono }}>{s.label}</span>
              <span style={{ fontSize: 11, color: color.green, fontFamily: mono }}>{s.key === "maxTokens" ? params.maxTokens : Number(params[s.key]).toFixed(2)}</span>
            </div>
            <input type="range" min={s.range[0]} max={s.range[1]} step={s.step} value={params[s.key] as number}
              onChange={(e) => change(s.key, parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: color.green, height: 4 }} />
            <div style={{ fontSize: 9.5, color: color.textFaint, marginTop: 2 }}>{s.tip}</div>
          </div>
        ))}
        <button onClick={() => onChange({ ...params, reasoningEnabled: !params.reasoningEnabled })}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 5, cursor: "pointer", fontSize: 11, fontFamily: mono,
            background: params.reasoningEnabled ? "rgba(255,166,87,0.12)" : "transparent",
            border: `1px solid ${params.reasoningEnabled ? color.orange : color.border}`,
            color: params.reasoningEnabled ? color.orange : color.textTertiary }}>
          🧠 思维链 {params.reasoningEnabled ? "ON" : "OFF"}<span style={{ fontSize: 9, color: color.textFaint }}>（仅 OpenRouter）</span>
        </button>
      </div>

      {/* Probability distribution */}
      <div>
        <div style={{ ...sectionLabel, marginBottom: 4 }}>下一 Token 候选概率分布</div>
        <div style={{ fontSize: 9.5, color: color.textFaint, fontFamily: mono, marginBottom: 8 }}>拖动 Temperature / Top-P 滑块查看变化（模拟）</div>
        {bars.map((b, i) => (
          <div key={i}>
            {b.firstCut && <div style={{ borderTop: `1px dashed ${color.orange}`, margin: "4px 0", fontSize: 8, color: color.orange, fontFamily: mono }}>Top-P 截断 ↑</div>}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <code style={{ width: 64, fontSize: 10, color: b.tokenColor, fontFamily: mono, textAlign: "right", flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.token}{b.used ? "⟲" : ""}</code>
              <div style={{ flex: 1, height: 13, background: color.bgPage, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${b.width}%`, height: "100%", background: b.background, borderRadius: 3, transition: "width 0.3s" }} />
              </div>
              <span style={{ width: 38, fontSize: 9, color: b.tokenColor, fontFamily: mono, textAlign: "right" }}>{b.probText}</span>
            </div>
          </div>
        ))}
        <div style={{ fontSize: 9, color: color.textFaint, fontFamily: mono, marginTop: 6, display: "flex", gap: 10 }}>
          <span style={{ color: color.green }}>● 候选采样</span><span style={{ color: color.textFaint }}>● Top-P 截断</span><span style={{ color: color.orange }}>● 惩罚项影响</span>
        </div>
      </div>

      {/* Request body preview (slider flash) */}
      <div>
        <div style={{ ...sectionLabel, marginBottom: 6 }}>请求体（改滑块看字段闪烁）</div>
        <pre style={{ ...panel, padding: "8px 10px", margin: 0, fontFamily: mono, fontSize: 10, lineHeight: 1.6, color: color.textTertiary, whiteSpace: "pre" }}>
          {reqLines.map((ln, i) => {
            const hl = ln.key && ln.key === changedKey;
            return <div key={i} style={{ background: hl ? "rgba(0,255,160,0.12)" : "transparent", color: hl ? color.green : undefined, borderRadius: 3, transition: "background 0.3s, color 0.3s" }}>{ln.text}</div>;
          })}
        </pre>
      </div>
    </div>
  );
}
