'use client'

import type { CSSProperties, ReactNode } from 'react'
import { useState } from 'react'

import { color, mono, paneBorder, radius, sans } from '../job/theme'

export type ExplorerCategory = {
  label: string
  slug: string
  terms: number
}

export type TermEntry = {
  categorySlug: string
  emoji: string
  english: string
  id: string
  plain: string
  related: string[]
  tech: string
  title: string
}

function FadeIn({ children }: { children: ReactNode }) {
  return <div style={{ animation: 'fadeUp 300ms ease both' }}>{children}</div>
}

function GradientText({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span
      style={{ color: color.textPrimary, fontWeight: 600, letterSpacing: '-0.01em', ...style }}
    >
      {children}
    </span>
  )
}

export function TermsExplorer({
  categories,
  terms,
}: {
  categories: ExplorerCategory[]
  terms: TermEntry[]
}) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    categories[0]?.slug ?? null,
  )
  const [selectedID, setSelectedID] = useState<string | null>(null)
  const selectedTerm = selectedID ? terms.find((term) => term.id === selectedID) ?? null : null

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        color: color.textSecondary,
        fontFamily: sans,
      }}
    >
      <aside
        style={{
          width: 280,
          minWidth: 280,
          height: '100vh',
          background: color.canvas,
          borderRight: paneBorder,
          overflow: 'auto',
          padding: '16px 0',
        }}
      >
        <div style={{ padding: '0 16px 16px', borderBottom: paneBorder, marginBottom: 8 }}>
          <h2
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: color.textPrimary,
              fontFamily: mono,
            }}
          >
            <GradientText>📖 黑话词典</GradientText>
          </h2>
          <p style={{ fontSize: 11, color: color.textTertiary, marginTop: 4 }}>
            {terms.length} 个术语 · {categories.length} 大分类
          </p>
        </div>

        {categories.length === 0 ? (
          <p style={{ padding: '8px 16px', fontSize: 12, color: color.textTertiary, fontFamily: mono }}>
            暂无术语内容
          </p>
        ) : null}

        {categories.map((category) => {
          const expanded = expandedCategory === category.slug
          const categoryTerms = terms.filter((term) => term.categorySlug === category.slug)

          return (
            <div key={category.slug}>
              <button
                aria-expanded={expanded}
                onClick={() => setExpandedCategory(expanded ? null : category.slug)}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: expanded ? color.textPrimary : color.textSecondary,
                  fontWeight: expanded ? 500 : 400,
                  fontSize: 12,
                  fontFamily: mono,
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                type="button"
              >
                <span
                  style={{
                    fontSize: 10,
                    transition: 'transform 0.2s',
                    transform: expanded ? 'rotate(90deg)' : 'none',
                  }}
                >
                  ▶
                </span>
                {category.label} ({category.terms})
              </button>

              {expanded
                ? categoryTerms.map((term) => {
                    const active = selectedID === term.id

                    return (
                      <button
                        key={term.id}
                        onClick={() => setSelectedID(term.id)}
                        style={{
                          width: '100%',
                          padding: '6px 16px 6px 36px',
                          background: active ? color.brandYellowTint : 'transparent',
                          border: 'none',
                          borderLeft: active
                            ? `2px solid ${color.brandYellow}`
                            : '2px solid transparent',
                          color: active ? color.textPrimary : color.textSecondary,
                          fontSize: 12,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                        type="button"
                      >
                        {term.emoji} {term.title}
                      </button>
                    )
                  })
                : null}
            </div>
          )
        })}
      </aside>

      <main style={{ flex: 1, padding: 32, overflow: 'auto', background: color.canvas }}>
        <FadeIn key={selectedID ?? 'none'}>
          {selectedTerm ? (
            <div>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{selectedTerm.emoji}</div>
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: color.textPrimary,
                  fontFamily: mono,
                  marginBottom: 4,
                }}
              >
                {selectedTerm.title}
              </h1>
              <p
                style={{
                  fontSize: 12,
                  color: color.textTertiary,
                  fontFamily: mono,
                  marginBottom: 24,
                }}
              >
                {selectedTerm.english}
              </p>
              <div
                style={{
                  background: color.brandYellowTint,
                  borderLeft: `2px solid ${color.brandYellow}`,
                  borderRadius: radius.md,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <h3
                  style={{
                    fontSize: 11,
                    color: color.textPrimary,
                    fontFamily: mono,
                    marginBottom: 8,
                  }}
                >
                  通俗解释
                </h3>
                <p style={{ fontSize: 13, color: color.textSecondary, lineHeight: 1.7 }}>
                  {selectedTerm.plain}
                </p>
              </div>
              <div
                style={{
                  background: `color-mix(in srgb, ${color.blue} 8%, transparent)`,
                  borderLeft: `2px solid ${color.blue}`,
                  borderRadius: radius.md,
                  padding: 16,
                }}
              >
                <h3
                  style={{ fontSize: 11, color: color.blue, fontFamily: mono, marginBottom: 8 }}
                >
                  技术解释
                </h3>
                <p style={{ fontSize: 13, color: color.textSecondary, lineHeight: 1.7 }}>
                  {selectedTerm.tech || selectedTerm.plain}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', paddingTop: 80 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
              <p style={{ color: color.textTertiary, fontFamily: mono, fontSize: 13 }}>
                从左侧选择一个术语查看详情
              </p>
            </div>
          )}
        </FadeIn>
      </main>
    </div>
  )
}
