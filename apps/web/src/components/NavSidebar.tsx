"use client";

import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { usePathname } from "next/navigation";
import SettingsModal from "./SettingsModal";
import { color, sans } from "@/lib/theme";
import { applyTheme, type ThemeMode } from "@/lib/theme-mode";

interface NavItem {
  icon: "chat" | "lab" | "code" | "book" | "job";
  label: string;
  href: string;
  id: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: "chat", label: "Chat", href: "/", id: "chat" },
  { icon: "lab", label: "Lab", href: "/lab", id: "lab" },
  { icon: "code", label: "Code", href: "/code", id: "code" },
  { icon: "book", label: "名词", href: "/jargon", id: "jargon" },
  { icon: "job", label: "求职", href: "/job", id: "job" },
];

// Lucide-style line icons (monochrome, stroke = currentColor). Yellow never touches icons.
const PATHS: Record<string, React.ReactNode> = {
  chat: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  lab: <><path d="M14.5 2v6.5l5 9A2 2 0 0 1 17.7 21H6.3a2 2 0 0 1-1.8-3.5l5-9V2" /><path d="M8.5 2h7" /><path d="M7 15h10" /></>,
  code: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>,
  book: <path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />,
  job: <><rect width="20" height="14" x="2" y="7" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>,
  moon: <path d="M12 3a6.4 6.4 0 0 0 9 9 9 9 0 1 1-9-9z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 3.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H8a1.65 1.65 0 0 0 1-1.51V2a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V8a1.65 1.65 0 0 0 1.51 1H22a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
};

function Icon({ name, stroke }: { name: string; stroke: string }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 3 }}>
      {PATHS[name]}
    </svg>
  );
}

export default function NavSidebar() {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("light");

  // Read the mode the pre-paint script already applied to <html>.
  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    setTheme(t === "dark" ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  };

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const itemStyle = (active: boolean): CSSProperties => ({
    width: 56,
    height: 48,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    color: active ? color.textPrimary : color.textTertiary,
    background: active ? color.brandYellowTint : "transparent",
    borderLeft: active ? `2px solid ${color.brandYellow}` : "2px solid transparent",
    borderRadius: 6,
    fontSize: 10,
    fontFamily: sans,
    transition: "color 0.15s ease, background 0.15s ease",
  });

  return (
    <>
      <nav
        style={{
          width: 56,
          minWidth: 56,
          height: "100vh",
          background: color.canvas,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          paddingTop: 14,
          paddingBottom: 14,
          borderRight: `1px solid ${color.borderSubtle}`,
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <a key={item.id} href={item.href} style={itemStyle(active)}>
              <Icon name={item.icon} stroke={active ? color.textPrimary : color.textSecondary} />
              {item.label}
            </a>
          );
        })}

        <div style={{ flex: 1 }} />

        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "切换到浅色" : "切换到深色"}
          style={{ ...itemStyle(false), border: "none", borderLeft: "2px solid transparent", background: "transparent", cursor: "pointer" }}
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} stroke={color.textSecondary} />
          {theme === "dark" ? "浅色" : "深色"}
        </button>

        <button onClick={() => setSettingsOpen(true)} style={{ ...itemStyle(false), border: "none", borderLeft: "2px solid transparent", background: "transparent", cursor: "pointer" }}>
          <Icon name="gear" stroke={color.textSecondary} />
          设置
        </button>
      </nav>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
