"use client";

import { useEffect, useState } from "react";
import type { JargonResponse, JargonTerm } from "@teaching-tool/shared";
import GradientText from "@/components/bits/GradientText";
import FadeIn from "@/components/bits/FadeIn";
import { color, mono, sans, paneBorder, radius } from "@/lib/theme";

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
    <div style={{ display: "flex", height: "100%", color: color.textSecondary, fontFamily: sans }}>
      <aside style={{ width: 280, minWidth: 280, height: "100vh", background: color.canvas, borderRight: paneBorder, overflow: "auto", padding: "16px 0" }}>
        <div style={{ padding: "0 16px 16px", borderBottom: paneBorder, marginBottom: 8 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: color.textPrimary, fontFamily: mono }}><GradientText>📖 黑话词典</GradientText></h2>
          <p style={{ fontSize: 11, color: color.textTertiary, marginTop: 4 }}>
            {loading ? "加载中…" : `${total} 个术语 · ${categories.length} 大分类`}
          </p>
        </div>
        {error && (
          <p style={{ padding: "8px 16px", fontSize: 12, color: color.red, fontFamily: mono }}>{error}</p>
        )}
        {!loading && !error && categories.length === 0 && (
          <p style={{ padding: "8px 16px", fontSize: 12, color: color.textTertiary, fontFamily: mono }}>暂无术语内容</p>
        )}
        {categories.map((cat) => {
          const expanded = expandedCat === cat.slug;
          return (
            <div key={cat.slug}>
              <button onClick={() => setExpandedCat(expanded ? null : cat.slug)} style={{
                width: "100%", padding: "8px 16px", background: "transparent", border: "none",
                color: expanded ? color.textPrimary : color.textSecondary, fontWeight: expanded ? 500 : 400, fontSize: 12,
                fontFamily: mono, cursor: "pointer", textAlign: "left",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: 10, transition: "transform 0.2s", transform: expanded ? "rotate(90deg)" : "none" }}>▶</span>
                {cat.label} ({cat.terms.length})
              </button>
              {expanded && cat.terms.map((t) => {
                const active = selectedSlug === t.slug;
                return (
                  <button key={t.slug} onClick={() => setSelectedSlug(t.slug)} style={{
                    width: "100%", padding: "6px 16px 6px 36px", background: active ? color.brandYellowTint : "transparent",
                    border: "none", borderLeft: active ? `2px solid ${color.brandYellow}` : "2px solid transparent",
                    color: active ? color.textPrimary : color.textSecondary, fontSize: 12, cursor: "pointer", textAlign: "left",
                  }}>{t.emoji} {t.cn}</button>
                );
              })}
            </div>
          );
        })}
      </aside>
      <main style={{ flex: 1, padding: 32, overflow: "auto", background: color.canvas }}>
        <FadeIn key={selectedSlug ?? "none"}>
        {term ? (
          <div>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{term.emoji}</div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: color.textPrimary, fontFamily: mono, marginBottom: 4 }}>{term.cn}</h1>
            <p style={{ fontSize: 12, color: color.textTertiary, fontFamily: mono, marginBottom: 24 }}>{term.en}</p>
            <div style={{ background: color.brandYellowTint, borderLeft: `2px solid ${color.brandYellow}`, borderRadius: radius.md, padding: 16, marginBottom: 16 }}>
              <h3 style={{ fontSize: 11, color: color.textPrimary, fontFamily: mono, marginBottom: 8 }}>通俗解释</h3>
              <p style={{ fontSize: 13, color: color.textSecondary, lineHeight: 1.7 }}>{term.plain}</p>
            </div>
            <div style={{ background: `color-mix(in srgb, ${color.blue} 8%, transparent)`, borderLeft: `2px solid ${color.blue}`, borderRadius: radius.md, padding: 16 }}>
              <h3 style={{ fontSize: 11, color: color.blue, fontFamily: mono, marginBottom: 8 }}>技术解释</h3>
              <p style={{ fontSize: 13, color: color.textSecondary, lineHeight: 1.7 }}>{term.tech}</p>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
            <p style={{ color: color.textTertiary, fontFamily: mono, fontSize: 13 }}>
              {loading ? "正在加载术语…" : error ? error : "从左侧选择一个术语查看详情"}
            </p>
          </div>
        )}
        </FadeIn>
      </main>
    </div>
  );
}
