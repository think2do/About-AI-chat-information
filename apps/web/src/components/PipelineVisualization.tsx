"use client";

interface PipelineVisualizationProps {
  activePhase: number; // 0-7, 0 = idle, 1-7 = phases
  isStreaming: boolean;
}

const PHASES = [
  { label: "上下文组装", desc: "messages[] 数组拼接", color: "#58a6ff" },
  { label: "请求编码", desc: "JSON 序列化", color: "#ffa657" },
  { label: "分词预处理", desc: "Tokenization", color: "#ff6b6b" },
  { label: "API 调度 & 模型画像", desc: "Provider 路由", color: "#a371f7" },
  { label: "Transformer 推理", desc: "前向传播", color: "#00ffa0" },
  { label: "自回归解码", desc: "逐 token 生成", color: "#00ffa0" },
  { label: "响应完成 & 指标", desc: "汇总统计", color: "#e6edf3" },
];

export default function PipelineVisualization({ activePhase, isStreaming }: PipelineVisualizationProps) {
  return (
    <div style={{ padding: "12px 16px", borderBottom: "1px solid #21262d" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto" }}>
        {PHASES.map((phase, i) => {
          const phaseNum = i + 1;
          const isActive = activePhase >= phaseNum;
          const isCurrent = activePhase === phaseNum;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              {/* Connector line */}
              {i > 0 && (
                <div style={{
                  width: 20, height: 2,
                  background: isActive ? phase.color : "#21262d",
                  transition: "background 0.5s",
                  flexShrink: 0,
                }} />
              )}
              {/* Phase node */}
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                opacity: isActive ? 1 : 0.35,
                transition: "opacity 0.3s",
                cursor: "default",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: isCurrent && isStreaming ? "transparent" : isActive ? phase.color : "#21262d",
                  border: isCurrent && isStreaming ? `3px solid ${phase.color}` : "3px solid transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 600,
                  color: isActive ? "#0d1117" : "#484f58",
                  fontFamily: "JetBrains Mono, monospace",
                  animation: isCurrent && isStreaming ? "pulse 1.5s ease-in-out infinite" : "none",
                }}>
                  {phaseNum}
                </div>
                <div style={{
                  fontSize: 10, color: isActive ? phase.color : "#484f58",
                  fontFamily: "JetBrains Mono, monospace",
                  marginTop: 4, whiteSpace: "nowrap",
                  maxWidth: 80, textAlign: "center",
                }}>
                  {phase.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
