export default function JargonPage() {
  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        color: "#c9d1d9",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Left sidebar placeholder */}
      <aside
        style={{
          width: 280,
          minWidth: 280,
          height: "100vh",
          background: "#0a0e14",
          borderRight: "1px solid #21262d",
          padding: 24,
        }}
      >
        <h2
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#e6edf3",
            fontFamily: "JetBrains Mono, monospace",
            marginBottom: 16,
          }}
        >
          📖 黑话词典
        </h2>
        <p style={{ fontSize: 12, color: "#8b949e" }}>
          43 个 AI 术语 · 6 大分类
        </p>
      </aside>

      {/* Detail panel placeholder */}
      <main style={{ flex: 1, padding: 48 }}>
        <h1
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: "#e6edf3",
            fontFamily: "JetBrains Mono, monospace",
            marginBottom: 12,
          }}
        >
          黑话词典
        </h1>
        <p style={{ fontSize: 13, color: "#8b949e" }}>
          黑话词典内容将在 Spec 005 中从静态 Demo 迁移。
        </p>
      </main>
    </div>
  );
}
