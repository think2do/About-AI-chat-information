"use client";

interface MetricsProps {
  ttftMs?: number;
  tps?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  costUsd?: number;
  show: boolean;
}

export default function PerformanceMetrics({ ttftMs, tps, inputTokens, outputTokens, totalTokens, costUsd, show }: MetricsProps) {
  if (!show) return null;

  return (
    <div style={{ padding: "12px 16px", borderTop: "1px solid #21262d", background: "#0a0e14" }}>
      <div style={{ fontSize: 11, color: "#484f58", fontFamily: "JetBrains Mono, monospace", marginBottom: 8 }}>
        📊 性能指标
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        <MetricItem label="TTFT" value={ttftMs != null ? `${ttftMs} ms` : "—"} />
        <MetricItem label="TPS" value={tps != null ? tps.toFixed(1) : "—"} />
        <MetricItem label="输入 Tokens" value={inputTokens != null ? String(inputTokens) : "—"} />
        <MetricItem label="输出 Tokens" value={outputTokens != null ? String(outputTokens) : "—"} />
        <MetricItem label="总 Tokens" value={totalTokens != null ? String(totalTokens) : "—"} />
        <MetricItem label="费用" value={costUsd != null ? `$${costUsd.toFixed(6)}` : "—"} highlight />
      </div>
    </div>
  );
}

function MetricItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ textAlign: "center", padding: "8px", background: "#0d1117", borderRadius: 4, border: "1px solid #21262d" }}>
      <div style={{ fontSize: 9, color: "#484f58", fontFamily: "JetBrains Mono, monospace", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: highlight ? "#00ffa0" : "#e6edf3", fontFamily: "JetBrains Mono, monospace" }}>
        {value}
      </div>
    </div>
  );
}
