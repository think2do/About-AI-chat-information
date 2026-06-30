export default function JobPage() {
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
          width: 320,
          minWidth: 320,
          height: "100vh",
          background: "#0a0e14",
          borderRight: "1px solid #21262d",
          padding: 24,
          overflow: "auto",
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
          💼 求职
        </h2>
        <p style={{ fontSize: 12, color: "#8b949e" }}>
          100 道面试题 · 5 个分类
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
          求职题库
        </h1>
        <p style={{ fontSize: 13, color: "#8b949e" }}>
          面试题库将在 Spec 005 中从静态 Demo 迁移。
        </p>
      </main>
    </div>
  );
}
