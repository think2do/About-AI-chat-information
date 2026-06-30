"use client";

import { useEffect, useState } from "react";
import type { JargonResponse, JargonTerm } from "@teaching-tool/shared";
import GradientText from "@/components/bits/GradientText";
import FadeIn from "@/components/bits/FadeIn";

export default function JargonPage() {
  const [data, setData] = useState<JargonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/content/jargon");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: JargonResponse = await res.json();
        if (cancelled) return;
        setData(json);
        setExpandedCat(json.categories[0]?.slug ?? null);
      } catch {
        if (!cancelled) setError("内容加载失败，请稍后重试");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = data?.categories ?? [];
  const total = data?.total ?? 0;

  const findTerm = (slug: string): JargonTerm | null => {
    for (const cat of categories) {
      const t = cat.terms.find((t) => t.slug === slug);
      if (t) return t;
    }
    return null;
  };
  const term = selectedSlug ? findTerm(selectedSlug) : null;

  return (
    <div style={{ display: "flex", height: "100%", color: "#c9d1d9", fontFamily: "Inter, sans-serif" }}>
      <aside style={{ width: 280, minWidth: 280, height: "100vh", background: "#0a0e14", borderRight: "1px solid #21262d", overflow: "auto", padding: "16px 0" }}>
        <div style={{ padding: "0 16px 16px", borderBottom: "1px solid #21262d", marginBottom: 8 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", fontFamily: "JetBrains Mono, monospace" }}><GradientText>📖 黑话词典</GradientText></h2>
          <p style={{ fontSize: 11, color: "#484f58", marginTop: 4 }}>
            {loading ? "加载中…" : `${total} 个术语 · ${categories.length} 大分类`}
          </p>
        </div>
        {error && (
          <p style={{ padding: "8px 16px", fontSize: 12, color: "#ff6b6b", fontFamily: "JetBrains Mono, monospace" }}>{error}</p>
        )}
        {!loading && !error && categories.length === 0 && (
          <p style={{ padding: "8px 16px", fontSize: 12, color: "#484f58", fontFamily: "JetBrains Mono, monospace" }}>暂无术语内容</p>
        )}
        {categories.map((cat) => (
          <div key={cat.slug}>
            <button onClick={() => setExpandedCat(expandedCat === cat.slug ? null : cat.slug)} style={{
              width: "100%", padding: "8px 16px", background: "transparent", border: "none",
              color: expandedCat === cat.slug ? "#00ffa0" : "#8b949e", fontSize: 12,
              fontFamily: "JetBrains Mono, monospace", cursor: "pointer", textAlign: "left",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 10, transition: "transform 0.2s", transform: expandedCat === cat.slug ? "rotate(90deg)" : "none" }}>▶</span>
              {cat.label} ({cat.terms.length})
            </button>
            {expandedCat === cat.slug && cat.terms.map((t) => (
              <button key={t.slug} onClick={() => setSelectedSlug(t.slug)} style={{
                width: "100%", padding: "6px 16px 6px 36px", background: selectedSlug === t.slug ? "rgba(0,255,160,0.06)" : "transparent",
                border: "none", borderLeft: selectedSlug === t.slug ? "3px solid #00ffa0" : "3px solid transparent",
                color: selectedSlug === t.slug ? "#e6edf3" : "#8b949e", fontSize: 12, cursor: "pointer", textAlign: "left",
              }}>{t.emoji} {t.cn}</button>
            ))}
          </div>
        ))}
      </aside>
      <main style={{ flex: 1, padding: 32, overflow: "auto" }}>
        <FadeIn key={selectedSlug ?? "none"}>
        {term ? (
          <div>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{term.emoji}</div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: "#e6edf3", fontFamily: "JetBrains Mono, monospace", marginBottom: 4 }}>{term.cn}</h1>
            <p style={{ fontSize: 12, color: "#484f58", fontFamily: "JetBrains Mono, monospace", marginBottom: 24 }}>{term.en}</p>
            <div style={{ background: "rgba(0,255,160,0.04)", border: "1px solid rgba(0,255,160,0.1)", borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <h3 style={{ fontSize: 11, color: "#00ffa0", fontFamily: "JetBrains Mono, monospace", marginBottom: 8 }}>通俗解释</h3>
              <p style={{ fontSize: 13, color: "#c9d1d9", lineHeight: 1.7 }}>{term.plain}</p>
            </div>
            <div style={{ background: "#0a0e14", border: "1px solid #21262d", borderRadius: 8, padding: 16 }}>
              <h3 style={{ fontSize: 11, color: "#58a6ff", fontFamily: "JetBrains Mono, monospace", marginBottom: 8 }}>技术解释</h3>
              <p style={{ fontSize: 13, color: "#8b949e", lineHeight: 1.7 }}>{term.tech}</p>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
            <p style={{ color: "#484f58", fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}>
              {loading ? "正在加载术语…" : error ? error : "从左侧选择一个术语查看详情"}
            </p>
          </div>
        )}
        </FadeIn>
      </main>
    </div>
  );
}
