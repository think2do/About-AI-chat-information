"use client";

// React Bits-style fade-up entrance (zero-dep, CSS keyframe).
import type { CSSProperties, ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delayMs?: number;
  durationMs?: number;
  style?: CSSProperties;
}

export default function FadeIn({ children, delayMs = 0, durationMs = 300, style }: FadeInProps) {
  return (
    <div
      style={{
        animation: `fadeUp ${durationMs}ms ease ${delayMs}ms both`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
