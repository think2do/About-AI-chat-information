"use client";

import { useState } from "react";

const TABS = [
  { id: "training", label: "训练对比", emoji: "🏋️", desc: "基座模型 vs SFT 微调模型的续写差异对比" },
  { id: "function-call", label: "函数调用", emoji: "🔧", desc: "LLM 如何理解和调用外部工具/函数" },
  { id: "tokenizer", label: "白盒分词实验", emoji: "🔬", desc: "分词效率对比：3 种模式 × 中英混合文本" },
  { id: "inference", label: "推理全过程", emoji: "🧠", desc: "从输入到输出的 10 步推理流水线" },
  { id: "rag", label: "RAG 检索增强", emoji: "📚", desc: "索引建立（4步）→ 检索生成（6步）" },
];

const TAB_CONTENT: Record<string, React.FC> = {
  training: () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div style={{ background: "rgba(255,107,107,0.06)", border: "1px solid rgba(255,107,107,0.15)", borderRadius: 8, padding: 16 }}>
        <h3 style={{ fontSize: 13, color: "#ff6b6b", fontFamily: "JetBrains Mono, monospace", marginBottom: 8 }}>基座模型（续写偏离）</h3>
        <p style={{ fontSize: 12, color: "#8b949e", lineHeight: 1.6 }}>预训练模型只学会「续写文本」，没有学会「遵循指令」。输入一个问题，它可能续写出更多问题、回答问题后又反问。</p>
        <div style={{ marginTop: 12, padding: 10, background: "#0a0e14", borderRadius: 4 }}>
          <code style={{ fontSize: 11, color: "#c9d1d9", fontFamily: "JetBrains Mono, monospace" }}>{`> 什么是 Transformer？\n> 什么是 BERT？\n> 请在下方评论区留言...`}</code>
        </div>
      </div>
      <div style={{ background: "rgba(0,255,160,0.04)", border: "1px solid rgba(0,255,160,0.12)", borderRadius: 8, padding: 16 }}>
        <h3 style={{ fontSize: 13, color: "#00ffa0", fontFamily: "JetBrains Mono, monospace", marginBottom: 8 }}>SFT 模型（精准跟随）</h3>
        <p style={{ fontSize: 12, color: "#8b949e", lineHeight: 1.6 }}>经过监督微调后，模型学会了「听指令 → 给答案」的模式，输出直接、切题、不跑偏。</p>
        <div style={{ marginTop: 12, padding: 10, background: "#0a0e14", borderRadius: 4 }}>
          <code style={{ fontSize: 11, color: "#00ffa0", fontFamily: "JetBrains Mono, monospace" }}>Transformer 是一种基于自注意力机制的深度学习架构，由 Vaswani 等人在 2017 年提出...</code>
        </div>
      </div>
    </div>
  ),
  "function-call": () => (
    <div>
      <p style={{ fontSize: 12, color: "#8b949e", marginBottom: 16 }}>LLM 如何将自然语言指令转化为结构化函数调用</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {["用户输入", "意图识别", "函数匹配", "参数提取", "执行调用", "结果格式化"].map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#0a0e14", borderRadius: 6, border: "1px solid #21262d" }}>
            <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#00ffa0", color: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, fontFamily: "JetBrains Mono, monospace", flexShrink: 0 }}>{i + 1}</span>
            <span style={{ fontSize: 12, color: "#c9d1d9" }}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  ),
  tokenizer: () => (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[{ name: "BPE (GPT 系)", example: "Trans|former → 2 tokens", color: "#00ffa0" }, { name: "WordPiece (BERT)", example: "Trans|##former → 2 tokens", color: "#58a6ff" }, { name: "Unigram (多语言)", example: "Transformer → 1 token", color: "#ffa657" }].map((m) => (
          <div key={m.name} style={{ background: "#0a0e14", border: "1px solid #21262d", borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: m.color, fontFamily: "JetBrains Mono, monospace", marginBottom: 8 }}>{m.name}</div>
            <code style={{ fontSize: 11, color: "#8b949e", fontFamily: "JetBrains Mono, monospace" }}>{m.example}</code>
          </div>
        ))}
      </div>
      <div style={{ padding: 12, background: "rgba(0,255,160,0.04)", borderRadius: 6, fontSize: 11, color: "#8b949e" }}>⚠ 本实验为模拟计算。实际 token 数取决于具体模型的分词器实现。</div>
    </div>
  ),
  inference: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {["Tokenization", "Embedding", "Positional Encoding", "Self-Attention (Q·Kᵀ)", "Multi-Head Concat", "Feed-Forward (FFN)", "Add & LayerNorm", "Repeat × N Layers", "Final LayerNorm", "LM Head → Logits → Softmax → Token"].map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#0a0e14", borderRadius: 4, borderLeft: `3px solid ${i < 9 ? "#30363d" : "#00ffa0"}` }}>
          <span style={{ fontSize: 10, color: "#484f58", fontFamily: "JetBrains Mono, monospace", width: 20 }}>{(i + 1).toString().padStart(2, "0")}</span>
          <span style={{ fontSize: 12, color: "#c9d1d9", fontFamily: "JetBrains Mono, monospace" }}>{p}</span>
        </div>
      ))}
    </div>
  ),
  rag: () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div>
        <h3 style={{ fontSize: 13, color: "#58a6ff", fontFamily: "JetBrains Mono, monospace", marginBottom: 12 }}>📥 索引建立（4步）</h3>
        {["文档加载", "文本分割", "向量嵌入", "向量存储"].map((s, i) => (
          <div key={i} style={{ padding: "8px 12px", marginBottom: 6, background: "rgba(88,166,255,0.06)", borderRadius: 4, border: "1px solid rgba(88,166,255,0.1)", fontSize: 12, color: "#58a6ff", fontFamily: "JetBrains Mono, monospace" }}>{i + 1}. {s}</div>
        ))}
      </div>
      <div>
        <h3 style={{ fontSize: 13, color: "#00ffa0", fontFamily: "JetBrains Mono, monospace", marginBottom: 12 }}>📤 检索生成（6步）</h3>
        {["用户提问", "Query Embedding", "相似度检索 (Top-K)", "上下文拼接", "LLM 生成", "答案返回"].map((s, i) => (
          <div key={i} style={{ padding: "8px 12px", marginBottom: 6, background: "rgba(0,255,160,0.04)", borderRadius: 4, border: "1px solid rgba(0,255,160,0.08)", fontSize: 12, color: "#00ffa0", fontFamily: "JetBrains Mono, monospace" }}>{i + 1}. {s}</div>
        ))}
      </div>
    </div>
  ),
};

export default function LabPage() {
  const [activeTab, setActiveTab] = useState("training");
  const Content = TAB_CONTENT[activeTab];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: "Inter, sans-serif" }}>
      <div style={{ padding: "12px 24px", borderBottom: "1px solid #21262d", background: "#0a0e14" }}>
        <h1 style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", fontFamily: "JetBrains Mono, monospace" }}>🧪 Lab / 实验室</h1>
      </div>
      <div style={{ display: "flex", borderBottom: "1px solid #21262d", background: "#0a0e14", overflowX: "auto" }}>
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: "10px 16px", background: activeTab === tab.id ? "rgba(0,255,160,0.06)" : "transparent",
            border: "none", borderBottom: activeTab === tab.id ? "2px solid #00ffa0" : "2px solid transparent",
            color: activeTab === tab.id ? "#00ffa0" : "#8b949e", fontSize: 12, fontFamily: "JetBrains Mono, monospace",
            cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6,
          }}><span>{tab.emoji}</span> {tab.label}</button>
        ))}
      </div>
      <div style={{ flex: 1, padding: 24, overflow: "auto" }}>
        <p style={{ fontSize: 12, color: "#8b949e", marginBottom: 20 }}>{TABS.find((t) => t.id === activeTab)?.desc}</p>
        <Content />
      </div>
    </div>
  );
}
