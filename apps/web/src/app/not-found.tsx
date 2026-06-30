import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        color: "#c9d1d9",
        fontFamily: "Inter, sans-serif",
        gap: 16,
      }}
    >
      <span style={{ fontSize: 48, fontFamily: "JetBrains Mono, monospace", color: "#484f58" }}>
        404
      </span>
      <h1 style={{ fontSize: 17, fontWeight: 600, color: "#e6edf3" }}>
        页面未找到
      </h1>
      <Link
        href="/"
        style={{
          padding: "7px 14px",
          background: "#00ffa0",
          color: "#0d1117",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          fontFamily: "JetBrains Mono, monospace",
          textDecoration: "none",
        }}
      >
        返回首页
      </Link>
    </div>
  );
}
