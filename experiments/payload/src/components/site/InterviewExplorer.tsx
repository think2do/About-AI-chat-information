'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import type { ExplorerCategory } from './TermsExplorer'

export type InterviewEntry = {
  answer: string
  categorySlug: string
  company: string
  difficulty: string
  id: string
  keyPoints: string[]
  tags: string[]
  title: string
}

export function InterviewExplorer({
  categories,
  questions,
}: {
  categories: ExplorerCategory[]
  questions: InterviewEntry[]
}) {
  const [category, setCategory] = useState('all')
  const visible = useMemo(
    () =>
      category === 'all' ? questions : questions.filter((item) => item.categorySlug === category),
    [category, questions],
  )
  const [selectedID, setSelectedID] = useState(questions[0]?.id || '')
  const selected = visible.find((item) => item.id === selectedID) || visible[0]
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const question of questions) {
      counts.set(question.categorySlug, (counts.get(question.categorySlug) || 0) + 1)
    }
    return counts
  }, [questions])

  return (
    <>
      <div className="category-pills">
        <button
          className={category === 'all' ? 'active' : undefined}
          onClick={() => {
            setCategory('all')
            setSelectedID(questions[0]?.id || '')
          }}
          type="button"
        >
          全部（{questions.length}）
        </button>
        {categories.map((item) => (
          <button
            className={category === item.slug ? 'active' : undefined}
            key={item.slug}
            onClick={() => {
              setCategory(item.slug)
              setSelectedID(
                questions.find((question) => question.categorySlug === item.slug)?.id || '',
              )
            }}
            type="button"
          >
            {item.label}（{categoryCounts.get(item.slug) || 0}）
          </button>
        ))}
      </div>
      <div className="explorer-layout">
        <aside className="tool-rail">
          <span>学习工具</span>
          <small>功能直接可见</small>
          <Link href="/learn">LLM名词</Link>
          <b>求职面试</b>
        </aside>
        <section className="entry-list interview-list">
          <div className="entry-buttons">
            {visible.map((question) => (
              <button
                className={selected?.id === question.id ? 'active' : undefined}
                key={question.id}
                onClick={() => setSelectedID(question.id)}
                type="button"
              >
                <strong>
                  <em>
                    {String(questions.findIndex((item) => item.id === question.id) + 1).padStart(
                      2,
                      '0',
                    )}
                  </em>
                  {question.title}
                </strong>
                <span>
                  {question.difficulty} · {question.company}
                </span>
              </button>
            ))}
          </div>
        </section>
        <article className="entry-detail interview-detail">
          {selected ? (
            <>
              <div className="tag-row">
                <span>{selected.difficulty}</span>
                <span>{selected.company}</span>
                {selected.tags.slice(0, 4).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <h2>{selected.title}</h2>
              <hr />
              <h3>参考回答</h3>
              <div className="answer-copy">{selected.answer}</div>
              {selected.keyPoints.length ? <h3>解析要点</h3> : null}
              {selected.keyPoints.length ? (
                <ul className="key-points">
                  {selected.keyPoints.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : null}
        </article>
      </div>
    </>
  )
}
