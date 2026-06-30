"use client";

import { useEffect, useState } from "react";
import type { PipelineStageContent, ChatPipelineResponse } from "@teaching-tool/shared";

interface PipelineVisualizationProps {
  activePhase: number; // 0-7, 0 = idle, 1-7 = phases
  isStreaming: boolean;
}

// Built-in fallback labels (used when the content API is unavailable so the
// Chat page keeps working). DB-served stages add the `detail` teaching text.
const FALLBACK: { label: string; short: string; color: string; detail: string }[] = [
  { label: "上下文组装", short: "messages[] 数组拼接", color: "#58a6ff", detail: "" },
  { label: "请求编码", short: "JSON 序列化", color: "#ffa657", detail: "" },
  { label: "分词预处理", short: "Tokenization", color: "#ff6b6b", detail: "" },
  { label: "API 调度 & 模型画像", short: "Provider 路由", color: "#a371f7", detail: "" },
  { label: "Transformer 推理", short: "前向传播", color: "#00ffa0", detail: "" },
  { label: "自回归解码", short: "逐 token 生成", color: "#00ffa0", detail: "" },
  { label: "响应完成 & 指标", short: "汇总统计", color: "#e6edf3", detail: "" },
];

export default function PipelineVisualization({ activePhase, isStreaming }: PipelineVisualizationProps) {
  const [stages, setStages] = useState<PipelineStageContent[] | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/content/chat/pipeline");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ChatPipelineResponse = await res.json();
        if (!cancelled && json.stages?.length) setStages(json.stages);
      } catch {
        /* keep fallback labels; chat stays functional */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const phases = stages
    ? stages.map((s) => ({ label: s.label, short: s.short, color: s.color, detail: s.detail }))
    : FALLBACK;
  const selectedStage = selected !== null ? phases[selected] : null;

  return (
    <div style={{ padding: "12px 16px", borderBottom: "1px solid #21262d" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto" }}>
        {phases.map((phase, i) => {
          const phaseNum = i + 1;
          const isActive = activePhase >= phaseNum;
          const isCurrent = activePhase === phaseNum;
          const isSelected = selected === i;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              {i > 0 && (
                <div style={{ width: 20, height: 2, background: isActive ? phase.color : "#21262d", transition: "background 0.5s", flexShrink: 0 }} />
              )}
              <div
                onClick={() => setSelected(isSelected ? null : i)}
                title={phase.short}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  opacity: isActive ? 1 : 0.45, transition: "opacity 0.3s", cursor: "pointer",
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: isCurrent && isStreaming ? "transparent" : isActive ? phase.color : "#21262d",
                  border: isSelected ? `3px solid ${phase.color}` : isCurrent && isStreaming ? `3px solid ${phase.color}` : "3px solid transparent",
                  boxShadow: isSelected ? `0 0 8px ${phase.color}` : "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 600, color: isActive ? "#0d1117" : "#484f58",
                  fontFamily: "JetBrains Mono, monospace",
                  animation: isCurrent && isStreaming ? "pulse 1.5s ease-in-out infinite" : "none",
                }}>
                  {phaseNum}
                </div>
                <div style={{ fontSize: 10, color: isActive || isSelected ? phase.color : "#484f58", fontFamily: "JetBrains Mono, monospace", marginTop: 4, whiteSpace: "nowrap", maxWidth: 80, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {phase.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedStage && (
        <div style={{ marginTop: 12, background: "#0a0e14", border: `1px solid ${selectedStage.color}33`, borderRadius: 8, padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: selectedStage.color, fontFamily: "JetBrains Mono, monospace" }}>
              阶段 {selected! + 1} · {selectedStage.label}
            </span>
            <span style={{ fontSize: 10, color: "#484f58", fontFamily: "JetBrains Mono, monospace" }}>{selectedStage.short}</span>
          </div>
          <p style={{ fontSize: 12.5, color: "#c9d1d9", lineHeight: 1.8, margin: 0 }}>
            {selectedStage.detail || "（该阶段详情需后端内容服务，请稍后重试）"}
          </p>
        </div>
      )}
    </div>
  );
}
