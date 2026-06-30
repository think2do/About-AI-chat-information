"use client";

import { useEffect, useMemo, useState } from "react";
import type { JobListResponse, JobQuestion } from "@teaching-tool/shared";
import GradientText from "@/components/bits/GradientText";
import FadeIn from "@/components/bits/FadeIn";

const DIFFICULTY_COLORS: Record<string, string> = {
  "简单": "#00ffa0",
  "中等": "#ffa657",
  "困难": "#ff6b6b",
};

const mono = "JetBrains Mono, monospace";

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

  return (
    <div style={{ display: "flex", height: "100%", color: "#c9d1d9", fontFamily: "Inter, sans-serif" }}>
      <aside style={{ width: 320, minWidth: 320, height: "100vh", background: "#0a0e14", borderRight: "1px solid #21262d", overflow: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #21262d" }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", fontFamily: mono }}><GradientText>💼 求职题库</GradientText></h2>
          <p style={{ fontSize: 11, color: "#484f58", marginTop: 4 }}>
            {loading ? "加载中…" : `${data?.total ?? 0} 道面试题 · ${Math.max(allTags.length - 1, 0)} 个分类`}
          </p>
        </div>
        {error && <p style={{ padding: "10px 16px", fontSize: 12, color: "#ff6b6b", fontFamily: mono }}>{error}</p>}
        <div style={{ padding: "10px 16px", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {allTags.map((tag) => (
            <button key={tag.key} onClick={() => setActiveCategory(tag.key)} style={{
              padding: "4px 10px", borderRadius: 4, fontSize: 11,
              background: activeCategory === tag.key ? "rgba(0,255,160,0.1)" : "transparent",
              border: activeCategory === tag.key ? "1px solid rgba(0,255,160,0.3)" : "1px solid #21262d",
              color: activeCategory === tag.key ? "#00ffa0" : "#8b949e",
              fontFamily: mono, cursor: "pointer",
            }}>{tag.emoji} {tag.label} ({tag.count})</button>
          ))}
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          {!loading && !error && items.length === 0 && (
            <p style={{ padding: "10px 16px", fontSize: 12, color: "#484f58", fontFamily: mono }}>暂无题目</p>
          )}
          {items.map((q) => (
            <button key={q.id} onClick={() => setSelectedId(q.id)} style={{
              width: "100%", padding: "10px 16px", background: selectedId === q.id ? "rgba(0,255,160,0.06)" : "transparent",
              border: "none", borderLeft: selectedId === q.id ? "3px solid #00ffa0" : "3px solid transparent",
              color: selectedId === q.id ? "#e6edf3" : "#c9d1d9", fontSize: 12, cursor: "pointer", textAlign: "left",
              fontFamily: "Inter, sans-serif", lineHeight: 1.5,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: "rgba(255,165,87,0.15)", color: DIFFICULTY_COLORS[q.difficulty] ?? "#8b949e", fontFamily: mono }}>{q.difficulty}</span>
                <span style={{ fontSize: 10, color: "#484f58", fontFamily: mono }}>{q.company}</span>
              </div>
              {q.title}
            </button>
          ))}
        </div>
      </aside>
      <main style={{ flex: 1, padding: 32, overflow: "auto" }}>
        <FadeIn key={selectedId ?? "none"}>
        {detailLoading ? (
          <div style={{ textAlign: "center", paddingTop: 80, color: "#484f58", fontFamily: mono, fontSize: 13 }}>正在加载题目…</div>
        ) : detail ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(255,165,87,0.15)", color: DIFFICULTY_COLORS[detail.difficulty] ?? "#8b949e", fontFamily: mono }}>{detail.difficulty}</span>
              <span style={{ fontSize: 11, color: "#484f58", fontFamily: mono }}>来源: {detail.company}</span>
            </div>
            <h1 style={{ fontSize: 17, fontWeight: 600, color: "#e6edf3", fontFamily: mono, marginBottom: 12, lineHeight: 1.6 }}>{detail.title}</h1>
            {detail.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
                {detail.tags.map((t) => (
                  <span key={t} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3, background: "rgba(88,166,255,0.1)", color: "#58a6ff", fontFamily: mono }}>{t}</span>
                ))}
              </div>
            )}

            <div style={{ background: "#0a0e14", border: "1px solid #21262d", borderRadius: 8, padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontSize: 11, color: "#00ffa0", fontFamily: mono, marginBottom: 12 }}>参考回答</h3>
              <p style={{ fontSize: 13, color: "#c9d1d9", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{detail.answer}</p>
            </div>

            {detail.code && (
              <div style={{ background: "#0a0e14", border: "1px solid #21262d", borderRadius: 8, padding: 20, marginBottom: 16 }}>
                <h3 style={{ fontSize: 11, color: "#ffa657", fontFamily: mono, marginBottom: 12 }}>
                  {detail.codeLabel || "代码示例"}{detail.codeLines ? ` · ${detail.codeLines} 行` : ""}
                </h3>
                <pre style={{ fontSize: 12.5, color: "#c9d1d9", lineHeight: 1.6, fontFamily: mono, overflow: "auto", margin: 0, whiteSpace: "pre" }}>{detail.code}</pre>
              </div>
            )}

            {detail.keyPoints.length > 0 && (
              <div style={{ background: "#0a0e14", border: "1px solid #21262d", borderRadius: 8, padding: 20, marginBottom: 16 }}>
                <h3 style={{ fontSize: 11, color: "#58a6ff", fontFamily: mono, marginBottom: 12 }}>解析要点</h3>
                <ul style={{ fontSize: 13, color: "#8b949e", lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
                  {detail.keyPoints.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            )}

            {detail.related.length > 0 && (
              <div style={{ background: "#0a0e14", border: "1px solid #21262d", borderRadius: 8, padding: 20 }}>
                <h3 style={{ fontSize: 11, color: "#bc8cff", fontFamily: mono, marginBottom: 12 }}>关联考察点</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {detail.related.map((r, i) => (
                    <span key={i} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 4, background: "rgba(188,140,255,0.08)", border: "1px solid rgba(188,140,255,0.2)", color: "#bc8cff", fontFamily: mono }}>{r}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💼</div>
            <p style={{ color: "#484f58", fontFamily: mono, fontSize: 13 }}>
              {loading ? "正在加载题库…" : error ? error : "选择一个分类标签，点击题目查看详情"}
            </p>
          </div>
        )}
        </FadeIn>
      </main>
    </div>
  );
}
