import Link from "next/link";
import { color, mono, sans, radius, space } from "@/lib/theme";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: color.canvas,
        color: color.textSecondary,
        fontFamily: sans,
        gap: space.lg,
      }}
    >
      <span style={{ fontSize: 48, fontFamily: mono, color: color.textTertiary }}>
        404
      </span>
      <h1 style={{ fontSize: 17, fontWeight: 600, color: color.textPrimary }}>
        页面未找到
      </h1>
      <Link
        href="/"
        style={{
          padding: "7px 14px",
          background: color.ctaBg,
          color: color.ctaText,
          borderRadius: radius.sm,
          fontSize: 12,
          fontWeight: 600,
          fontFamily: mono,
          textDecoration: "none",
        }}
      >
        返回首页
      </Link>
    </div>
  );
}
