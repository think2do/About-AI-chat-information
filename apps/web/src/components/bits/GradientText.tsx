"use client";

// React Bits-style animated gradient text (zero-dep, CSS background-clip + shimmer).
import type { CSSProperties, ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  colors?: string[];
  style?: CSSProperties;
}

export default function GradientText({
  children,
  colors = ["#00ffa0", "#58a6ff", "#00ffa0"],
  style,
}: GradientTextProps) {
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`,
        backgroundSize: "200% auto",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        animation: "shimmer 4s linear infinite",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
