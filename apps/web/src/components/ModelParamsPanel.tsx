"use client";

interface ModelParams {
  temperature: number;
  topP: number;
  maxTokens: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

interface ModelParamsPanelProps {
  params: ModelParams;
  onChange: (params: ModelParams) => void;
  collapsed?: boolean;
}

const SLIDERS = [
  {
    key: "temperature" as const, label: "Temperature", range: [0, 2], step: 0.01, default: 0.7,
    tip: "控制输出的随机性。值越高，输出越有创意但可能跑偏；值越低，输出越确定但可能重复。",
  },
  {
    key: "topP" as const, label: "Top-P", range: [0, 1], step: 0.01, default: 1.0,
    tip: "核采样（Nucleus Sampling）：只从累积概率达到 P 的候选词中选。P=1 等价于不限制。",
  },
  {
    key: "maxTokens" as const, label: "Max Tokens", range: [16, 4096], step: 16, default: 2048,
    tip: "生成的最大 token 数。值越大，回复可以越长，但费用也越高。",
  },
  {
    key: "frequencyPenalty" as const, label: "Frequency Penalty", range: [0, 2], step: 0.01, default: 0,
    tip: "对已出现 token 施加惩罚，值越大越不容易重复。用于减少 AI「复读机」现象。",
  },
  {
    key: "presencePenalty" as const, label: "Presence Penalty", range: [0, 2], step: 0.01, default: 0,
    tip: "对任何已出现过的 token 施加统一惩罚，鼓励模型引入新话题。",
  },
];

export default function ModelParamsPanel({ params, onChange, collapsed }: ModelParamsPanelProps) {
  if (collapsed) return null;

  // Simulated token probability distribution (visual only, no real logprobs)
  const TokenDist = () => {
    const temp = params.temperature;
    const tokens = ["Trans", "former", "是", "一种", "基于", "自注意", "力", "的", "架构"];
    const probs = tokens.map((_, i) => {
      const raw = Math.exp(-i * 0.5 / Math.max(temp, 0.1));
      return raw;
    });
    const sum = probs.reduce((a, b) => a + b, 0);
    const normalized = probs.map((p) => p / sum);

    let cumProb = 0;
    const barItems = tokens.map((t, i) => {
      const prob = normalized[i];
      cumProb += prob;
      const isInTopP = cumProb - prob < params.topP;
      return { token: t, prob, isInTopP };
    });

    return (
      <div style={{ marginTop: 16, padding: "10px 12px", background: "#0a0e14", borderRadius: 6, border: "1px solid #21262d" }}>
        <div style={{ fontSize: 10, color: "#484f58", fontFamily: "JetBrains Mono, monospace", marginBottom: 8 }}>
          Token 概率分布（模拟 · Temperature={params.temperature} · Top-P={params.topP}）
        </div>
        {barItems.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <code style={{ width: 72, fontSize: 10, color: "#8b949e", fontFamily: "JetBrains Mono, monospace", textAlign: "right", flexShrink: 0 }}>
              {item.token}
            </code>
            <div style={{ flex: 1, height: 14, background: "#0d1117", borderRadius: 3, overflow: "hidden", position: "relative" }}>
              <div style={{
                width: `${item.prob * 100}%`, height: "100%",
                background: item.isInTopP ? "#00ffa0" : "#30363d",
                opacity: item.isInTopP ? 0.8 : 0.3,
                borderRadius: 3, transition: "width 0.3s, background 0.3s",
              }} />
            </div>
            <span style={{ width: 36, fontSize: 9, color: item.isInTopP ? "#00ffa0" : "#484f58", fontFamily: "JetBrains Mono, monospace", textAlign: "right" }}>
              {(item.prob * 100).toFixed(1)}%
            </span>
          </div>
        ))}
        <div style={{ marginTop: 6, height: 1, background: "#ffa657", position: "relative" }}>
          <div style={{ position: "absolute", left: `${params.topP * 100}%`, top: -3, width: 6, height: 6, borderRadius: "50%", background: "#ffa657" }} />
          <span style={{ position: "absolute", left: `${Math.min(params.topP * 100, 90)}%`, top: 4, fontSize: 8, color: "#ffa657", fontFamily: "JetBrains Mono, monospace", whiteSpace: "nowrap" }}>
            Top-P 截断线
          </span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "12px 16px", borderBottom: "1px solid #21262d" }}>
      <div style={{ fontSize: 11, color: "#484f58", fontFamily: "JetBrains Mono, monospace", marginBottom: 10 }}>
        ⚙ 模型参数
      </div>
      {SLIDERS.map((slider) => (
        <div key={slider.key} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
            <span style={{ fontSize: 11, color: "#c9d1d9", fontFamily: "JetBrains Mono, monospace" }} title={slider.tip}>
              {slider.label}
            </span>
            <span style={{ fontSize: 11, color: "#00ffa0", fontFamily: "JetBrains Mono, monospace" }}>
              {params[slider.key]}
            </span>
          </div>
          <input
            type="range"
            min={slider.range[0]}
            max={slider.range[1]}
            step={slider.step}
            value={params[slider.key]}
            onChange={(e) => onChange({ ...params, [slider.key]: parseFloat(e.target.value) })}
            style={{ width: "100%", accentColor: "#00ffa0", height: 4 }}
          />
        </div>
      ))}
      <TokenDist />
    </div>
  );
}
