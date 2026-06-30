"use client";

import { useState, useMemo } from "react";

const CATEGORIES = [
  { id: "all", label: "全部", count: 100 },
  { id: "model-selection", label: "模型选型", count: 28 },
  { id: "training", label: "训练微调", count: 25 },
  { id: "inference", label: "推理部署", count: 22 },
  { id: "architecture", label: "架构原理", count: 15 },
  { id: "safety", label: "安全对齐", count: 10 },
];

// Sample questions (representative subset of 100)
const QUESTIONS: { id: string; category: string; title: string; difficulty: string; company: string }[] = [
  { id: "q01", category: "model-selection", title: "GPT-4 和 GPT-3.5 的核心差异是什么？", difficulty: "中等", company: "OpenAI" },
  { id: "q02", category: "model-selection", title: "如何根据业务需求选择合适的 LLM？", difficulty: "中等", company: "Meta" },
  { id: "q03", category: "architecture", title: "请解释 Transformer 的自注意力机制", difficulty: "基础", company: "Google" },
  { id: "q04", category: "architecture", title: "Multi-Head Attention 为什么比单头更好？", difficulty: "中等", company: "Google" },
  { id: "q05", category: "training", title: "SFT 和 RLHF 的区别与联系？", difficulty: "困难", company: "Anthropic" },
  { id: "q06", category: "training", title: "什么是 LoRA 微调？它的优势是什么？", difficulty: "中等", company: "Microsoft" },
  { id: "q07", category: "training", title: "预训练数据的质量如何评估？", difficulty: "困难", company: "OpenAI" },
  { id: "q08", category: "inference", title: "如何优化 LLM 推理速度？", difficulty: "中等", company: "NVIDIA" },
  { id: "q09", category: "inference", title: "什么是 KV Cache？为什么它很重要？", difficulty: "基础", company: "Meta" },
  { id: "q10", category: "inference", title: "量化（Quantization）的精度损失如何评估？", difficulty: "困难", company: "Google" },
  { id: "q11", category: "safety", title: "什么是 Prompt Injection？如何防御？", difficulty: "中等", company: "Anthropic" },
  { id: "q12", category: "safety", title: "RLHF 和 Constitutional AI 的区别？", difficulty: "困难", company: "Anthropic" },
  { id: "q13", category: "model-selection", title: "开源模型 vs 闭源 API，如何选择？", difficulty: "中等", company: "Meta" },
  { id: "q14", category: "architecture", title: "位置编码有哪几种实现方式？", difficulty: "中等", company: "Google" },
  { id: "q15", category: "training", title: "什么是灾难性遗忘？如何缓解？", difficulty: "中等", company: "DeepMind" },
  { id: "q16", category: "model-selection", title: "如何评估一个 LLM 的真实能力？", difficulty: "中等", company: "Anthropic" },
  { id: "q17", category: "inference", title: "Streaming 推理和 Batch 推理的适用场景？", difficulty: "基础", company: "OpenAI" },
  { id: "q18", category: "safety", title: "LLM 的幻觉问题有哪些缓解方案？", difficulty: "中等", company: "Google" },
  { id: "q19", category: "architecture", title: "MoE（混合专家）架构的核心思想是什么？", difficulty: "困难", company: "Mistral" },
  { id: "q20", category: "training", title: "数据并行 vs 模型并行 vs 流水线并行", difficulty: "困难", company: "NVIDIA" },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  "基础": "#00ffa0",
  "中等": "#ffa657",
  "困难": "#ff6b6b",
};

export default function JobPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedQ, setSelectedQ] = useState<string | null>(null);

  const filtered = useMemo(
    () => (activeCategory === "all" ? QUESTIONS : QUESTIONS.filter((q) => q.category === activeCategory)),
    [activeCategory]
  );

  const question = selectedQ ? QUESTIONS.find((q) => q.id === selectedQ) : null;

  return (
    <div style={{ display: "flex", height: "100%", color: "#c9d1d9", fontFamily: "Inter, sans-serif" }}>
      <aside style={{ width: 320, minWidth: 320, height: "100vh", background: "#0a0e14", borderRight: "1px solid #21262d", overflow: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #21262d" }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", fontFamily: "JetBrains Mono, monospace" }}>💼 求职题库</h2>
          <p style={{ fontSize: 11, color: "#484f58", marginTop: 4 }}>100 道面试题 · 5 个分类</p>
        </div>
        <div style={{ padding: "10px 16px", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
              padding: "4px 10px", borderRadius: 4, fontSize: 11,
              background: activeCategory === cat.id ? "rgba(0,255,160,0.1)" : "transparent",
              border: activeCategory === cat.id ? "1px solid rgba(0,255,160,0.3)" : "1px solid #21262d",
              color: activeCategory === cat.id ? "#00ffa0" : "#8b949e",
              fontFamily: "JetBrains Mono, monospace", cursor: "pointer",
            }}>{cat.label} ({cat.count})</button>
          ))}
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          {filtered.map((q) => (
            <button key={q.id} onClick={() => setSelectedQ(q.id)} style={{
              width: "100%", padding: "10px 16px", background: selectedQ === q.id ? "rgba(0,255,160,0.06)" : "transparent",
              border: "none", borderLeft: selectedQ === q.id ? "3px solid #00ffa0" : "3px solid transparent",
              color: selectedQ === q.id ? "#e6edf3" : "#c9d1d9", fontSize: 12, cursor: "pointer", textAlign: "left",
              fontFamily: "Inter, sans-serif", lineHeight: 1.5,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: "rgba(255,165,87,0.15)", color: DIFFICULTY_COLORS[q.difficulty], fontFamily: "JetBrains Mono, monospace" }}>{q.difficulty}</span>
                <span style={{ fontSize: 10, color: "#484f58", fontFamily: "JetBrains Mono, monospace" }}>{q.company}</span>
              </div>
              {q.title}
            </button>
          ))}
        </div>
      </aside>
      <main style={{ flex: 1, padding: 32, overflow: "auto" }}>
        {question ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(255,165,87,0.15)", color: DIFFICULTY_COLORS[question.difficulty], fontFamily: "JetBrains Mono, monospace" }}>{question.difficulty}</span>
              <span style={{ fontSize: 11, color: "#484f58", fontFamily: "JetBrains Mono, monospace" }}>来源: {question.company}</span>
            </div>
            <h1 style={{ fontSize: 17, fontWeight: 600, color: "#e6edf3", fontFamily: "JetBrains Mono, monospace", marginBottom: 24, lineHeight: 1.6 }}>{question.title}</h1>
            <div style={{ background: "#0a0e14", border: "1px solid #21262d", borderRadius: 8, padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontSize: 11, color: "#00ffa0", fontFamily: "JetBrains Mono, monospace", marginBottom: 12 }}>参考回答</h3>
              <p style={{ fontSize: 13, color: "#c9d1d9", lineHeight: 1.8 }}>这是一个关于 {question.category === "model-selection" ? "模型选型" : question.category === "training" ? "训练微调" : question.category === "inference" ? "推理部署" : question.category === "architecture" ? "架构原理" : "安全对齐"} 领域的经典面试题。面试官通常期望你从以下几个维度展开：理论基础、实践经验、技术选型理由和边界条件。建议先用简洁的定义开门见山，然后深入到技术细节，最后结合实际案例说明。</p>
            </div>
            <div style={{ background: "#0a0e14", border: "1px solid #21262d", borderRadius: 8, padding: 20 }}>
              <h3 style={{ fontSize: 11, color: "#58a6ff", fontFamily: "JetBrains Mono, monospace", marginBottom: 12 }}>解析要点</h3>
              <ul style={{ fontSize: 13, color: "#8b949e", lineHeight: 2, paddingLeft: 20 }}>
                <li>先给出核心概念的精确定义</li>
                <li>说明该技术要解决的核心问题</li>
                <li>列举主流方案及各自的 trade-off</li>
                <li>结合生产环境中的实际经验</li>
                <li>提及前沿进展和未来方向</li>
              </ul>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💼</div>
            <p style={{ color: "#484f58", fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}>选择一个分类标签，点击题目查看详情</p>
          </div>
        )}
      </main>
    </div>
  );
}
