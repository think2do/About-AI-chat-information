import config from '@payload-config'
import { getPayload } from 'payload'

export type JobTag = {
  count: number
  emoji: string
  key: string
  label: string
}

export type JobSummary = {
  category: string
  company: string
  difficulty: string
  id: string
  tag: string
  tags: string[]
  title: string
}

export type JobQuestion = JobSummary & {
  answer: string
  code: string | null
  codeLabel: string | null
  codeLines: number | null
  keyPoints: string[]
  related: string[]
}

export type JobListResponse = {
  all_tags: JobTag[]
  items: JobSummary[]
  module: 'job'
  total: number
}

const CATEGORY_EMOJI: Record<string, string> = {
  all: '📋',
  architecture: '🏗️',
  'model-selection': '🧠',
  evaluation: '📊',
  'project-challenges': '💡',
  'product-strategy': '🎯',
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

function mapQuestion(item: {
  category?: { label?: string | null; slug?: string | null } | number | string | null
  company?: string | null
  difficulty?: string | null
  slug: string
  source?: unknown
  summary?: string | null
  tags?: { id?: string | null; tag: string }[] | null
  title: string
}): JobQuestion {
  const source = record(item.source)
  const category = typeof item.category === 'object' && item.category ? item.category : undefined
  const code = typeof source.code === 'string' && source.code ? source.code : null
  const sourceCodeLines = typeof source.codeLines === 'number' ? source.codeLines : null

  return {
    answer: typeof source.answer === 'string' ? source.answer : item.summary || '',
    category: category?.slug || '',
    code,
    codeLabel: typeof source.codeLabel === 'string' ? source.codeLabel : null,
    codeLines: code ? sourceCodeLines || code.split('\n').length : null,
    company: item.company || '通用',
    difficulty: item.difficulty || '中等',
    id: item.slug,
    keyPoints: strings(source.keyPoints),
    related: strings(source.related),
    tag:
      typeof source.tag === 'string'
        ? source.tag
        : category?.label || category?.slug || '',
    tags: (item.tags || []).map((tag) => tag.tag),
    title: item.title,
  }
}

async function getJobModuleID() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'content-modules',
    limit: 1,
    overrideAccess: false,
    where: { slug: { equals: 'job' } },
  })

  return { moduleID: result.docs[0]?.id, payload }
}

export async function getJobList(): Promise<JobListResponse> {
  const { moduleID, payload } = await getJobModuleID()
  if (!moduleID) {
    return { all_tags: [], items: [], module: 'job', total: 0 }
  }

  const [categoryResult, itemResult] = await Promise.all([
    payload.find({
      collection: 'content-categories',
      limit: 20,
      overrideAccess: false,
      sort: 'sortOrder',
      where: {
        and: [{ itemType: { equals: 'question' } }, { module: { equals: moduleID } }],
      },
    }),
    payload.find({
      collection: 'content-items',
      depth: 1,
      limit: 120,
      overrideAccess: false,
      sort: 'sortOrder',
      where: {
        and: [{ itemType: { equals: 'question' } }, { module: { equals: moduleID } }],
      },
    }),
  ])

  const questions = itemResult.docs.map(mapQuestion)
  const categoryCounts = new Map<string, number>()
  for (const question of questions) {
    categoryCounts.set(question.category, (categoryCounts.get(question.category) || 0) + 1)
  }

  const allTags: JobTag[] = [
    { count: questions.length, emoji: CATEGORY_EMOJI.all, key: 'all', label: '全部' },
    ...categoryResult.docs.map((category) => ({
      count: categoryCounts.get(category.slug) || 0,
      emoji: CATEGORY_EMOJI[category.slug] || '',
      key: category.slug,
      label: category.label,
    })),
  ]

  return {
    all_tags: allTags,
    items: questions.map(({ category, company, difficulty, id, tag, tags, title }) => ({
      category,
      company,
      difficulty,
      id,
      tag,
      tags,
      title,
    })),
    module: 'job',
    total: questions.length,
  }
}

export async function getJobQuestion(id: string): Promise<JobQuestion | null> {
  const { moduleID, payload } = await getJobModuleID()
  if (!moduleID) return null

  const result = await payload.find({
    collection: 'content-items',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    where: {
      and: [
        { itemType: { equals: 'question' } },
        { module: { equals: moduleID } },
        { slug: { equals: id } },
      ],
    },
  })

  return result.docs[0] ? mapQuestion(result.docs[0]) : null
}
