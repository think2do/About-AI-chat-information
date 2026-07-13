// Shared design tokens (Spec 016) — single source for the light "editorial + marigold" system.
// Values resolve to CSS variables defined in globals.css (:root = light). A future dark mode
// (separate Spec) adds a [data-theme="dark"] block there; components need no change (mode-aware).
// Source of truth for the raw values: design/tokens.json (spec: design/DESIGN.md).
//
// Yellow rule (DESIGN.md): brand yellow is ONLY a fill behind ink text (CTA, active pill,
// highlighter) — never text/icon/thin-border on light surfaces. Depth = 1px borders, not shadows.

export const color = {
  // Neutrals (warm) — carry ~95% of the UI
  canvas: "var(--canvas)",              // page background — never pure white
  surface: "var(--surface)",            // raised card/panel (white on the warm canvas)
  surfaceSubtle: "var(--surface-subtle)", // recessed inset — code/JSON/detail/input fills
  borderSubtle: "var(--border-subtle)", // faintest divider / hover wash
  border: "var(--border)",              // card outline, input border, nav separator
  borderStrong: "var(--border-strong)", // higher-emphasis structural line
  textPrimary: "var(--text-primary)",   // body & headings — warm near-black
  textSecondary: "var(--text-secondary)", // secondary text, inactive nav
  textTertiary: "var(--text-tertiary)", // metadata, caption, placeholder
  textDisabled: "var(--text-disabled)", // disabled / inactive

  // Brand — marigold yellow. FILL/highlight behind ink only.
  brandYellow: "var(--brand-yellow)",
  brandYellowStrong: "var(--brand-yellow-strong)", // hover / border on yellow elements
  brandYellowTint: "var(--brand-yellow-tint)",     // active-nav wash (~14% alpha)

  // Primary CTA (the logo move: yellow fill + ink text). Max one solid CTA per screen.
  ctaBg: "var(--cta-bg)",
  ctaText: "var(--cta-text)",
  ctaHover: "var(--cta-hover)",

  // The rare branded text link (deep amber, AA on cream). Default links = ink + underline.
  link: "var(--accent-link)",

  // Semantic — content only (category tags, code syntax, difficulty). NEVER on UI chrome.
  blue: "var(--semantic-blue)",
  purple: "var(--semantic-purple)",
  orange: "var(--semantic-orange)",
  red: "var(--semantic-red)",
  teal: "var(--semantic-teal)",
} as const;

export const mono = "JetBrains Mono, monospace";
export const sans = "Inter, sans-serif";

// 4px-based spacing + rounder light radii (see design/tokens.json).
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
export const radius = { xs: 4, sm: 6, md: 10, lg: 14, pill: 9999 } as const;

/** Recessed inset (code/JSON/detail/input) — surfaceSubtle + hairline, no shadow. */
export const panel = {
  background: color.surfaceSubtle,
  border: `1px solid ${color.borderSubtle}`,
  borderRadius: radius.md,
} as const;

/** Raised card (list/step cards) — white surface + hairline, no shadow. */
export const card = {
  background: color.surface,
  border: `1px solid ${color.border}`,
  borderRadius: radius.md,
} as const;

/** Small mono section label / eyebrow (e.g. "PARAMETERS"). */
export const sectionLabel = {
  fontSize: 11,
  letterSpacing: "0.06em",
  color: color.textTertiary,
  fontFamily: mono,
  textTransform: "uppercase" as const,
};

/**
 * A small rounded content tag/chip with a semantic accent.
 * Tint composed via color-mix so it works with CSS-variable colors (mode-aware).
 * Content contexts only — chips never carry brand yellow as text.
 */
export function chip(accent: string) {
  return {
    fontSize: 11,
    fontFamily: mono,
    padding: "2px 8px",
    borderRadius: radius.xs,
    color: accent,
    background: `color-mix(in srgb, ${accent} 12%, transparent)`,
    border: `1px solid color-mix(in srgb, ${accent} 30%, transparent)`,
    whiteSpace: "nowrap" as const,
  };
}

/** Active-nav / active-item wash: faint yellow fill behind ink (+ caller adds 2px left border). */
export const activeWash = {
  background: color.brandYellowTint,
  color: color.textPrimary,
} as const;

/** Column divider used between panes — hairline, background-diff does the rest. */
export const paneBorder = `1px solid ${color.borderSubtle}`;
