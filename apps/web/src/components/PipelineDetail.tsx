"use client";

// Rich per-stage pipeline panel (Spec 015) — restores the old index.html left column:
// 7 stage cards with status + teaching text (from /api/content/chat/pipeline) + dynamic
// runtime content (context cards, request JSON, token coloring, decode log, metrics).
import { useEffect, useState } from "react";
import type { ChatPipelineResponse, PipelineStageContent } from "@teaching-tool/shared";
import { color, mono, panel, card, sectionLabel, chip } from "@/lib/theme";
import CountUp from "@/components/bits/CountUp";

interface Msg { role: string; content: string }

interface PipelineDetailProps {
  activePhase: number; // 0 idle, 1-7
  isStreaming: boolean;
  messages: Msg[];
  systemPrompt: string;
  params: { temperature: number; topP: number; maxTokens: number; frequencyPenalty: number; presencePenalty: number; reasoningEnabled?: boolean };
  provider: string;
  model: string;
  metrics: { ttftMs?: number; tps?: number; inputTokens?: number; outputTokens?: number; totalTokens?: number };
}

const FALLBACK_LABELS = ["上下文组装", "请求编码", "分词预处理", "API 调度 & 模型画像", "Transformer 推理", "自回归解码", "响应完成 & 指标"];
const STAGE_COLORS = [color.blue, color.orange, color.red, color.purple, color.green, color.green, color.textPrimary];

const estTokens = (s: string) => Math.max(1, Math.round(s.length * 0.6));

function charType(ch: string): keyof typeof TOKEN_COLORS {
  if (/\s/.test(ch)) return "space";
  if (/[一-鿿]/.test(ch)) return "cjk";
  if (/[0-9]/.test(ch)) return "num";
  if (/[a-zA-Z]/.test(ch)) return "latin";
  return "punct";
}
const TOKEN_COLORS = { cjk: color.blue, latin: color.orange, num: color.success, punct: color.purple, space: color.textFaint };

export default function PipelineDetail({ activePhase, isStreaming, messages, systemPrompt, params, provider, model, metrics }: PipelineDetailProps) {
  const [stages, setStages] = useState<PipelineStageContent[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/content/chat/pipeline");
        if (!res.ok) throw new Error();
        const json: ChatPipelineResponse = await res.json();
        if (!cancelled && json.stages?.length) setStages(json.stages);
      } catch { /* fallback labels */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const label = (i: number) => stages?.[i]?.label ?? FALLBACK_LABELS[i];
  const detail = (i: number) => stages?.[i]?.detail ?? "";

  const userMsgs = messages.filter((m) => m.role !== "system");
  const lastUser = [...userMsgs].reverse().find((m) => m.role === "user")?.content ?? "";
  const lastAssistant = [...userMsgs].reverse().find((m) => m.role === "assistant");

  const reqPreview = {
    model: model || "<model>",
    messages: `[ …${(systemPrompt ? 1 : 0) + userMsgs.length} 条… ]`,
    temperature: params.temperature,
    top_p: params.topP,
    max_tokens: params.maxTokens,
    frequency_penalty: params.frequencyPenalty,
    presence_penalty: params.presencePenalty,
    ...(params.reasoningEnabled && provider === "openrouter" ? { reasoning: "{ effort: medium }" } : {}),
    stream: true,
  };

  const stageStatus = (n: number) => {
    if (activePhase >= n + 1) return { txt: "DONE", c: color.success };
    if (activePhase === n) return { txt: isStreaming ? "ACTIVE" : "DONE", c: STAGE_COLORS[n - 1] };
    return { txt: "PENDING", c: color.textFaint };
  };

  const Card = ({ i, children }: { i: number; children?: React.ReactNode }) => {
    const n = i + 1;
    const active = activePhase === n;
    const reached = activePhase >= n;
    const st = stageStatus(n);
    const accent = STAGE_COLORS[i];
    return (
      <div style={{ ...card, padding: "12px 14px", marginBottom: 12, opacity: reached || activePhase === 0 ? 1 : 0.5, borderColor: active ? accent + "55" : color.border }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: children ? 8 : 0 }}>
          <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, fontFamily: mono, color: reached ? "#0d1117" : color.textFaint, background: reached ? accent : color.bgInput }}>{n}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: reached ? accent : color.textTertiary, fontFamily: mono }}>{label(i)}</span>
          <span style={{ ...chip(st.c), marginLeft: "auto" }}>{st.txt}</span>
        </div>
        {detail(i) && <p style={{ fontSize: 11, color: color.textTertiary, lineHeight: 1.6, margin: "0 0 8px" }}>{detail(i)}</p>}
        {children}
      </div>
    );
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={sectionLabel}>运行流程可视化</span>
        <span style={{ fontSize: 10, color: color.textFaint, fontFamily: mono }}>阶段 {activePhase} / 7</span>
      </div>

      {/* Stage 1 — context assembly cards */}
      <Card i={0}>
        {systemPrompt && (
          <div style={{ ...panel, padding: "6px 10px", marginBottom: 6, borderColor: color.purple + "44" }}>
            <span style={chip(color.purple)}>SYSTEM</span>
            <div style={{ fontSize: 11, color: color.textSecondary, marginTop: 4 }}>{systemPrompt}</div>
            <div style={{ fontSize: 9, color: color.textFaint, fontFamily: mono, marginTop: 2 }}>{systemPrompt.length} 字符 · ~{estTokens(systemPrompt)} tokens</div>
          </div>
        )}
        {userMsgs.length === 0 && !systemPrompt && <div style={{ fontSize: 11, color: color.textFaint }}>发送消息后这里会显示组装的 messages[]</div>}
        {userMsgs.map((m, k) => (
          <div key={k} style={{ ...panel, padding: "6px 10px", marginBottom: 6, borderColor: (m.role === "user" ? color.blue : color.success) + "44" }}>
            <span style={chip(m.role === "user" ? color.blue : color.success)}>{m.role === "user" ? "用户" : "助手"}</span>
            <div style={{ fontSize: 11, color: color.textSecondary, marginTop: 4, maxHeight: 60, overflow: "hidden" }}>{m.content}</div>
            <div style={{ fontSize: 9, color: color.textFaint, fontFamily: mono, marginTop: 2 }}>{m.content.length} 字符 · ~{estTokens(m.content)} tokens</div>
          </div>
        ))}
      </Card>

      {/* Stage 2 — request JSON */}
      <Card i={1}>
        <pre style={{ ...panel, padding: "8px 10px", margin: 0, fontFamily: mono, fontSize: 10.5, lineHeight: 1.55, color: color.textTertiary, whiteSpace: "pre-wrap" }}>
{JSON.stringify(reqPreview, null, 2)}
        </pre>
      </Card>

      {/* Stage 3 — tokenization coloring */}
      <Card i={2}>
        {lastUser ? (
          <div style={{ ...panel, padding: "8px 10px", fontFamily: mono, fontSize: 12, lineHeight: 1.9 }}>
            {[...lastUser].slice(0, 80).map((ch, k) => (
              <span key={k} style={{ color: TOKEN_COLORS[charType(ch)], background: ch.trim() ? "rgba(255,255,255,0.03)" : "transparent", padding: "0 1px", borderRadius: 2 }}>{ch === " " ? "·" : ch}</span>
            ))}
            <div style={{ fontSize: 9, color: color.textFaint, marginTop: 6 }}>~{estTokens(lastUser)} tokens（中文蓝/英文橙/数字绿/标点紫）</div>
          </div>
        ) : <div style={{ fontSize: 11, color: color.textFaint }}>等待用户输入…</div>}
      </Card>

      {/* Stage 4 — model profile */}
      <Card i={3}>
        <div style={{ ...panel, padding: "8px 10px", fontFamily: mono, fontSize: 10.5, color: color.textTertiary }}>
          <div>provider: <span style={{ color: color.purple }}>{provider || "—"}</span></div>
          <div>model: <span style={{ color: color.green }}>{model || "—"}</span></div>
          <div style={{ color: color.textFaint, marginTop: 4 }}>不同模型的层数/隐藏维度/注意力头/上下文窗口各异；MoE 仅激活部分专家。</div>
        </div>
      </Card>

      {/* Stage 5 — transformer sweep */}
      <Card i={4}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[0, 1, 2, 3].map((r) => (
            <div key={r} style={{ height: 8, borderRadius: 3, background: color.bgInput, overflow: "hidden", position: "relative" }}>
              {activePhase >= 5 && <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: "40%", background: `linear-gradient(90deg, transparent, ${color.green}, transparent)`, animation: `sweep 1.4s ease-in-out ${r * 0.15}s infinite` }} />}
            </div>
          ))}
        </div>
      </Card>

      {/* Stage 6 — decode log */}
      <Card i={5}>
        <div style={{ ...panel, padding: "8px 10px", fontFamily: mono, fontSize: 10.5, color: color.textTertiary }}>
          已解码 <span style={{ color: color.green }}>{metrics.outputTokens ?? 0}</span> tokens
          {isStreaming && activePhase === 6 && <span style={{ color: color.green }}> ▌</span>}
          <div style={{ color: color.textFaint, marginTop: 2 }}>逐 token 自回归：每步预测下一个 token 概率分布并采样。</div>
        </div>
      </Card>

      {/* Stage 7 — metrics */}
      <Card i={6}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { k: "TPS", v: metrics.tps, c: color.green },
            { k: "TTFT", v: metrics.ttftMs, suffix: "ms", c: color.blue },
            { k: "输出 tok", v: metrics.outputTokens, c: color.orange },
            { k: "总 tok", v: metrics.totalTokens, c: color.purple },
          ].map((m) => (
            <div key={m.k} style={{ ...panel, padding: "8px 10px" }}>
              <div style={{ ...sectionLabel, fontSize: 9 }}>{m.k}</div>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: mono, color: m.v != null ? m.c : color.textFaint }}>
                {m.v != null ? <CountUp value={m.v} /> : "—"}{m.v != null && m.suffix ? m.suffix : ""}
              </div>
            </div>
          ))}
        </div>
        {lastAssistant?.content && activePhase >= 7 && <div style={{ fontSize: 9, color: color.textFaint, fontFamily: mono, marginTop: 6 }}>✓ 响应完成</div>}
      </Card>
    </div>
  );
}
