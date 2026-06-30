// Shared design tokens (Spec 015) — single source for the dark terminal aesthetic.
// Use these instead of scattering hex/spacing literals across pages.

export const color = {
  bgPage: "#0d1117",
  bgSecondary: "#0a0e14",
  bgCard: "#161b22",
  bgInput: "#21262d",
  border: "#30363d",
  borderSubtle: "#21262d",
  textPrimary: "#e6edf3",
  textSecondary: "#c9d1d9",
  textTertiary: "#8b949e",
  textDisabled: "#6e7681",
  textFaint: "#484f58",
  green: "#00ffa0",
  blue: "#58a6ff",
  purple: "#d2a8ff",
  orange: "#ffa657",
  red: "#ff7b72",
  success: "#7ee787",
} as const;

export const mono = "JetBrains Mono, monospace";
export const sans = "Inter, sans-serif";

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
export const radius = { sm: 4, md: 6, lg: 8 } as const;

/** A recessed panel (darker than page) — used for code/JSON/detail blocks. */
export const panel = {
  background: color.bgSecondary,
  border: `1px solid ${color.borderSubtle}`,
  borderRadius: radius.lg,
} as const;

/** A raised card (lighter than page) — used for list/step cards. */
export const card = {
  background: color.bgCard,
  border: `1px solid ${color.border}`,
  borderRadius: radius.lg,
} as const;

/** Small monospace section label (e.g. "PARAMETERS", "SYSTEM PROMPT"). */
export const sectionLabel = {
  fontSize: 10,
  letterSpacing: "0.08em",
  color: color.textFaint,
  fontFamily: mono,
  textTransform: "uppercase" as const,
};

/** A small rounded tag/chip with an accent color. */
export function chip(accent: string) {
  return {
    fontSize: 10,
    fontFamily: mono,
    padding: "2px 8px",
    borderRadius: radius.sm,
    color: accent,
    background: accent + "14",
    border: `1px solid ${accent}33`,
    whiteSpace: "nowrap" as const,
  };
}

/** Column divider used between the three panes. */
export const paneBorder = `1px solid ${color.borderSubtle}`;
