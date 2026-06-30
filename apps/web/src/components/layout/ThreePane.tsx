"use client";

// Shared 3-column shell (Spec 015): optional left rail / center / optional right rail.
// Each rail has a fixed width + divider + own scroll; center flexes.
import type { CSSProperties, ReactNode } from "react";
import { color, paneBorder } from "@/lib/theme";

interface ThreePaneProps {
  left?: ReactNode;
  leftWidth?: number;
  right?: ReactNode;
  rightWidth?: number;
  children: ReactNode; // center
  centerStyle?: CSSProperties;
}

const railBase: CSSProperties = {
  height: "100%",
  overflow: "auto",
  background: color.bgSecondary,
  flexShrink: 0,
};

export default function ThreePane({
  left,
  leftWidth = 300,
  right,
  rightWidth = 320,
  children,
  centerStyle,
}: ThreePaneProps) {
  return (
    <div style={{ display: "flex", height: "100%", minWidth: 0, color: color.textSecondary }}>
      {left != null && (
        <aside style={{ ...railBase, width: leftWidth, minWidth: leftWidth, borderRight: paneBorder }}>
          {left}
        </aside>
      )}
      <main style={{ flex: 1, minWidth: 0, height: "100%", overflow: "auto", ...centerStyle }}>
        {children}
      </main>
      {right != null && (
        <aside style={{ ...railBase, width: rightWidth, minWidth: rightWidth, borderLeft: paneBorder }}>
          {right}
        </aside>
      )}
    </div>
  );
}
