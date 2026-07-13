"use client";

import { useEffect, useMemo, useState } from "react";
import type { JobListResponse, JobQuestion } from "@teaching-tool/shared";
import GradientText from "@/components/bits/GradientText";
import FadeIn from "@/components/bits/FadeIn";
import { color, mono, sans, chip, paneBorder, radius } from "@/lib/theme";

const DIFFICULTY_COLORS: Record<string, string> = {
  "简单": color.teal,
  "中等": color.orange,
  "困难": color.red,
};

export default function JobPage() {
  const [data, setData] = useState<JobListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<JobQuestion | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/content/jobs");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: JobListResponse = await res.json();
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError("题库加载失败，请稍后重试");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/content/jobs/${selectedId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: JobQuestion = await res.json();
        if (!cancelled) setDetail(json);
      } catch {
        if (!cancelled) setDetail(null);
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const allTags = data?.all_tags ?? [];
  const items = useMemo(() => {
    const all = data?.items ?? [];
    return activeCategory === "all" ? all : all.filter((q) => q.category === activeCategory);
  }, [data, activeCategory]);

  const difficultyChip = (difficulty: string, fontSize: number, padding: string) => {
    const c = DIFFICULTY_COLORS[difficulty] ?? color.textTertiary;
    return {
      fontSize,
      padding,
      borderRadius: radius.xs,
      background: `color-mix(in srgb, ${c} 14%, transparent)`,
      color: c,
      fontFamily: mono,
    };
  };

  return (
    <div style={{ display: "flex", height: "100%", color: color.textSecondary, fontFamily: sans }}>
      <aside style={{ width: 320, minWidth: 320, height: "100vh", background: color.canvas, borderRight: paneBorder, overflow: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px", borderBottom: paneBorder }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: color.textPrimary, fontFamily: mono }}><GradientText>💼 求职题库</GradientText></h2>
          <p style={{ fontSize: 11, color: color.textTertiary, marginTop: 4 }}>
            {loading ? "加载中…" : `${data?.total ?? 0} 道面试题 · ${Math.max(allTags.length - 1, 0)} 个分类`}
          </p>
        </div>
        {error && <p style={{ padding: "10px 16px", fontSize: 12, color: color.red, fontFamily: mono }}>{error}</p>}
        <div style={{ padding: "10px 16px", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {allTags.map((tag) => {
            const active = activeCategory === tag.key;
            return (
              <button key={tag.key} onClick={() => setActiveCategory(tag.key)} style={{
                padding: "4px 10px", borderRadius: radius.xs, fontSize: 11,
                background: active ? color.brandYellow : color.surface,
                border: active ? `1px solid ${color.brandYellow}` : `1px solid ${color.border}`,
                color: active ? color.textPrimary : color.textSecondary,
                fontFamily: mono, cursor: "pointer",
              }}>{tag.label} ({tag.count})</button>
            );
          })}
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          {!loading && !error && items.length === 0 && (
            <p style={{ padding: "10px 16px", fontSize: 12, color: color.textTertiary, fontFamily: mono }}>暂无题目</p>
          )}
          {items.map((q) => {
            const active = selectedId === q.id;
            return (
              <button key={q.id} onClick={() => setSelectedId(q.id)} style={{
                width: "100%", padding: "10px 16px", background: active ? color.brandYellowTint : "transparent",
                border: "none", borderLeft: active ? `2px solid ${color.brandYellow}` : "2px solid transparent",
                color: active ? color.textPrimary : color.textSecondary, fontSize: 12, cursor: "pointer", textAlign: "left",
                fontFamily: sans, lineHeight: 1.5,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ ...difficultyChip(q.difficulty, 10, "1px 6px") }}>{q.difficulty}</span>
                  <span style={{ fontSize: 10, color: color.textTertiary, fontFamily: mono }}>{q.company}</span>
                </div>
                {q.title}
              </button>
            );
          })}
        </div>
      </aside>
      <main style={{ flex: 1, padding: 32, overflow: "auto", background: color.canvas }}>
        <FadeIn key={selectedId ?? "none"}>
        {detailLoading ? (
          <div style={{ textAlign: "center", paddingTop: 80, color: color.textTertiary, fontFamily: mono, fontSize: 13 }}>正在加载题目…</div>
        ) : detail ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <span style={{ ...difficultyChip(detail.difficulty, 11, "2px 8px") }}>{detail.difficulty}</span>
              <span style={{ fontSize: 11, color: color.textTertiary, fontFamily: mono }}>来源: {detail.company}</span>
            </div>
            <h1 style={{ fontSize: 17, fontWeight: 600, color: color.textPrimary, fontFamily: mono, marginBottom: 12, lineHeight: 1.6 }}>{detail.title}</h1>
            {detail.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
                {detail.tags.map((t) => (
                  <span key={t} style={{ ...chip(color.blue) }}>{t}</span>
                ))}
              </div>
            )}

            <div style={{ background: color.brandYellowTint, borderLeft: `2px solid ${color.brandYellow}`, borderRadius: radius.md, padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontSize: 11, color: color.textPrimary, fontFamily: mono, marginBottom: 12 }}>参考回答</h3>
              <p style={{ fontSize: 13, color: color.textSecondary, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{detail.answer}</p>
            </div>

            {detail.code && (
              <div style={{ background: color.surfaceSubtle, border: `1px solid ${color.borderSubtle}`, borderRadius: radius.md, padding: 20, marginBottom: 16 }}>
                <h3 style={{ fontSize: 11, color: color.orange, fontFamily: mono, marginBottom: 12 }}>
                  {detail.codeLabel || "代码示例"}{detail.codeLines ? ` · ${detail.codeLines} 行` : ""}
                </h3>
                <pre style={{ fontSize: 12.5, color: color.textSecondary, lineHeight: 1.6, fontFamily: mono, overflow: "auto", margin: 0, whiteSpace: "pre" }}>{detail.code}</pre>
              </div>
            )}

            {detail.keyPoints.length > 0 && (
              <div style={{ background: `color-mix(in srgb, ${color.blue} 8%, transparent)`, borderLeft: `2px solid ${color.blue}`, borderRadius: radius.md, padding: 20, marginBottom: 16 }}>
                <h3 style={{ fontSize: 11, color: color.blue, fontFamily: mono, marginBottom: 12 }}>解析要点</h3>
                <ul style={{ fontSize: 13, color: color.textSecondary, lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
                  {detail.keyPoints.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            )}

            {detail.related.length > 0 && (
              <div style={{ background: color.surface, border: `1px solid ${color.border}`, borderRadius: radius.md, padding: 20 }}>
                <h3 style={{ fontSize: 11, color: color.purple, fontFamily: mono, marginBottom: 12 }}>关联考察点</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {detail.related.map((r, i) => (
                    <span key={i} style={{ ...chip(color.purple) }}>{r}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💼</div>
            <p style={{ color: color.textTertiary, fontFamily: mono, fontSize: 13 }}>
              {loading ? "正在加载题库…" : error ? error : "选择一个分类标签，点击题目查看详情"}
            </p>
          </div>
        )}
        </FadeIn>
      </main>
    </div>
  );
}
