"use client";

import { usePathname } from "next/navigation";

interface NavItem {
  emoji: string;
  label: string;
  href: string;
  id: string;
}

const NAV_ITEMS: NavItem[] = [
  { emoji: "💬", label: "Chat", href: "/", id: "chat" },
  { emoji: "🧪", label: "Lab", href: "/lab", id: "lab" },
  { emoji: "🦀", label: "Code", href: "/code", id: "code" },
  { emoji: "📖", label: "名词", href: "/jargon", id: "jargon" },
  { emoji: "💼", label: "求职", href: "/job", id: "job" },
];

export default function NavSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      style={{
        width: 56,
        minWidth: 56,
        height: "100vh",
        background: "#0a0e14",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 16,
        paddingBottom: 16,
        borderRight: "1px solid #21262d",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        return (
          <a
            key={item.id}
            href={item.href}
            style={{
              width: 56,
              height: 56,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              color: active ? "#00ffa0" : "#6e7681",
              background: active ? "rgba(0,255,160,0.06)" : "transparent",
              borderLeft: active ? "2px solid #00ffa0" : "2px solid transparent",
              fontSize: 9,
              fontFamily: "Inter, sans-serif",
              transition: "color 0.15s ease, background 0.15s ease",
            }}
          >
            <span style={{ fontSize: 17, marginBottom: 2 }}>{item.emoji}</span>
            {item.label}
          </a>
        );
      })}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Settings button — placeholder */}
      <button
        onClick={() => alert("设置面板将在 Spec 004 实现")}
        style={{
          width: 56,
          height: 56,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#6e7681",
          fontSize: 9,
          fontFamily: "Inter, sans-serif",
        }}
      >
        <span style={{ fontSize: 17, marginBottom: 2 }}>⚙</span>
        设置
      </button>
    </nav>
  );
}
