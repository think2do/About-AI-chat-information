"use client";

import { useEffect, useRef, useState } from "react";

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
  collapsed?: boolean;
  messageCount?: number;
}

const mono = "JetBrains Mono, monospace";

const SLIDERS = [
  { key: "temperature" as const, label: "Temperature", range: [0, 2], step: 0.01, tip: "控制输出的随机性。值越高越有创意但可能跑偏；越低越确定但可能重复。" },
  { key: "topP" as const, label: "Top-P", range: [0, 1], step: 0.01, tip: "核采样：只从累积概率达到 P 的候选词中选。P=1 等价于不限制。" },
  { key: "maxTokens" as const, label: "Max Tokens", range: [16, 4096], step: 16, tip: "生成的最大 token 数。越大回复可越长，但费用更高。" },
  { key: "frequencyPenalty" as const, label: "Frequency Penalty", range: [0, 2], step: 0.01, tip: "对已出现 token 施加惩罚，越大越不易重复。" },
  { key: "presencePenalty" as const, label: "Presence Penalty", range: [0, 2], step: 0.01, tip: "对任何已出现 token 施加统一惩罚，鼓励引入新话题。" },
];

// param key → JSON field name (for slider→JSON flash linkage)
const JSON_KEY: Record<string, string> = {
  temperature: "temperature", topP: "top_p", maxTokens: "max_tokens",
  frequencyPenalty: "frequency_penalty", presencePenalty: "presence_penalty",
};

// Teaching simulation of next-token logits (NOT real logprobs) — same as old index.html.
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
    const background = cut ? "#30363d"
      : item.used ? "linear-gradient(90deg,#ffa657,#ff7b7266)"
      : i === 0 ? "linear-gradient(90deg,#00ffa0,#00c88888)"
      : "linear-gradient(90deg,#58a6ff,#388bfd88)";
    const tokenColor = cut ? "#484f58" : item.used ? "#ffa657" : i === 0 ? "#00ffa0" : "#c9d1d9";
    return {
      token: item.tk, probText: (item.prob * 100).toFixed(1) + "%", tokenColor,
      width: cut ? Math.max(bw * 0.25, 2) : bw, background, firstCut, used: item.used,
    };
  });
}

export default function ModelParamsPanel({ params, onChange, collapsed, messageCount = 0 }: ModelParamsPanelProps) {
  const [expanded, setExpanded] = useState(!collapsed);
  const [changedKey, setChangedKey] = useState<string | null>(null);
  const [model, setModel] = useState<string>("");
  const [provider, setProvider] = useState<string>("");
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

  // JSON request-body preview lines (for slider→JSON flash)
  const reqLines: { text: string; key?: string }[] = [
    { text: "{" },
    { text: `  "model": "${model || "<model>"}",` },
    { text: `  "messages": [ …${messageCount} 条… ],` },
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
    <div style={{ padding: "12px 16px", borderBottom: "1px solid #21262d" }}>
      <div onClick={() => setExpanded((e) => !e)} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 11, color: "#484f58", fontFamily: mono, marginBottom: expanded ? 10 : 0 }}>
        <span style={{ transition: "transform 0.2s", transform: expanded ? "rotate(90deg)" : "none" }}>▸</span>
        ⚙ 模型参数{!expanded && <span style={{ color: "#30363d" }}>（点击展开）</span>}
      </div>

      {expanded && (
        <>
          {SLIDERS.map((s) => (
            <div key={s.key} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: "#c9d1d9", fontFamily: mono }} title={s.tip}>{s.label}</span>
                <span style={{ fontSize: 11, color: "#00ffa0", fontFamily: mono }}>{params[s.key]}</span>
              </div>
              <input type="range" min={s.range[0]} max={s.range[1]} step={s.step}
                value={params[s.key] as number}
                onChange={(e) => change(s.key, parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#00ffa0", height: 4 }} />
            </div>
          ))}

          {/* CoT toggle */}
          <button onClick={() => onChange({ ...params, reasoningEnabled: !params.reasoningEnabled })}
            style={{
              display: "flex", alignItems: "center", gap: 6, marginTop: 4, marginBottom: 4, padding: "5px 10px",
              borderRadius: 5, cursor: "pointer", fontSize: 11, fontFamily: mono,
              background: params.reasoningEnabled ? "rgba(255,166,87,0.12)" : "transparent",
              border: params.reasoningEnabled ? "1px solid #ffa657" : "1px solid #30363d",
              color: params.reasoningEnabled ? "#ffa657" : "#8b949e",
            }}>
            🧠 思维链 {params.reasoningEnabled ? "ON" : "OFF"}
            <span style={{ fontSize: 9, color: "#484f58" }}>（仅 OpenRouter 有效）</span>
          </button>

          {/* Probability distribution (simulated) */}
          <div style={{ marginTop: 12, padding: "10px 12px", background: "#0a0e14", borderRadius: 6, border: "1px solid #21262d" }}>
            <div style={{ fontSize: 10, color: "#484f58", fontFamily: mono, marginBottom: 8 }}>
              下一 Token 概率分布（模拟 · T={params.temperature} · Top-P={params.topP}）
            </div>
            {bars.map((b, i) => (
              <div key={i}>
                {b.firstCut && <div style={{ height: 1, borderTop: "1px dashed #ffa657", margin: "4px 0", fontSize: 8, color: "#ffa657", fontFamily: mono }}>Top-P 截断线 ↑</div>}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <code style={{ width: 72, fontSize: 10, color: b.tokenColor, fontFamily: mono, textAlign: "right", flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {b.token}{b.used ? " ⟲" : ""}
                  </code>
                  <div style={{ flex: 1, height: 14, background: "#0d1117", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${b.width}%`, height: "100%", background: b.background, borderRadius: 3, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ width: 38, fontSize: 9, color: b.tokenColor, fontFamily: mono, textAlign: "right" }}>{b.probText}</span>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 6, fontSize: 9, color: "#484f58", fontFamily: mono }}>橙色 ⟲ = 已出现 token（受惩罚）· 灰色 = Top-P 截断外</div>
          </div>

          {/* JSON request-body preview with field flash */}
          <div style={{ marginTop: 12, padding: "10px 12px", background: "#0a0e14", borderRadius: 6, border: "1px solid #21262d" }}>
            <div style={{ fontSize: 10, color: "#484f58", fontFamily: mono, marginBottom: 6 }}>请求体预览（改动滑块看字段闪烁）</div>
            <pre style={{ margin: 0, fontFamily: mono, fontSize: 10.5, lineHeight: 1.6, color: "#8b949e", whiteSpace: "pre" }}>
              {reqLines.map((ln, i) => {
                const hl = ln.key && ln.key === changedKey;
                return (
                  <div key={i} style={{ background: hl ? "rgba(0,255,160,0.12)" : "transparent", color: hl ? "#00ffa0" : undefined, borderRadius: 3, transition: "background 0.3s, color 0.3s" }}>{ln.text}</div>
                );
              })}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
