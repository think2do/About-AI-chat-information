export default function LabPage() {
  return (
    <div
      style={{
        padding: 48,
        color: "#c9d1d9",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: 17,
          fontWeight: 600,
          color: "#e6edf3",
          fontFamily: "JetBrains Mono, monospace",
          marginBottom: 12,
        }}
      >
        🧪 实验室
      </h1>
      <p style={{ fontSize: 13, color: "#8b949e" }}>
        实验室教学模块将在 Spec 005 中从静态 Demo 迁移。
      </p>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 24,
          flexWrap: "wrap",
        }}
      >
        {["训练对比", "函数调用", "白盒实验", "推理全过程", "RAG 检索增强"].map(
          (tab) => (
            <span
              key={tab}
              style={{
                padding: "5px 12px",
                borderRadius: 4,
                border: "1px solid #30363d",
                color: "#6e7681",
                fontSize: 11,
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {tab}
            </span>
          )
        )}
      </div>
    </div>
  );
}
