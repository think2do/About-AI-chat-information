"use client";

// Spec 016: the light "editorial" system uses static ink titles (no colored shimmer —
// yellow can't be text, and rainbow gradients conflict with the single-accent discipline).
// Kept as a component so callers don't change; `colors` is accepted but ignored.
import type { CSSProperties, ReactNode } from "react";
import { color } from "@/lib/theme";

interface GradientTextProps {
  children: ReactNode;
  colors?: string[]; // deprecated (ignored) — retained for call-site compatibility
  style?: CSSProperties;
}

export default function GradientText({ children, style }: GradientTextProps) {
  return (
    <span style={{ color: color.textPrimary, fontWeight: 600, letterSpacing: "-0.01em", ...style }}>
      {children}
    </span>
  );
}
