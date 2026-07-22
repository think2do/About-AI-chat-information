import config from '@payload-config'
import { getPayload } from 'payload'

import { TeachingNavSidebar } from '@/components/job/TeachingNavSidebar'
import { TermsExplorer, type TermEntry } from '@/components/site/TermsExplorer'
import type { ContentCategory, ContentItem } from '@/payload-types'

import '../job/job.css'

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

export default async function LearnPage() {
  const payload = await getPayload({ config })
  const moduleResult = await payload.find({
    collection: 'content-modules',
    limit: 1,
    overrideAccess: false,
    where: {
      and: [{ slug: { equals: 'jargon' } }, { _status: { equals: 'published' } }],
    },
  })

  const moduleID = moduleResult.docs[0]?.id
  let categoryDocs: ContentCategory[] = []
  let itemDocs: ContentItem[] = []
  if (moduleID) {
    const [categoryResult, itemResult] = await Promise.all([
      payload.find({
        collection: 'content-categories',
        limit: 20,
        overrideAccess: false,
        sort: 'sortOrder',
        where: {
          and: [
            { itemType: { equals: 'term' } },
            { module: { equals: moduleID } },
            { _status: { equals: 'published' } },
          ],
        },
      }),
      payload.find({
        collection: 'content-items',
        depth: 1,
        limit: 100,
        overrideAccess: false,
        sort: 'sortOrder',
        where: {
          and: [
            { itemType: { equals: 'term' } },
            { module: { equals: moduleID } },
            { _status: { equals: 'published' } },
          ],
        },
      }),
    ])
    categoryDocs = categoryResult.docs
    itemDocs = itemResult.docs
  }

  const categorySlugByID = new Map(categoryDocs.map((category) => [category.id, category.slug]))
  const terms: TermEntry[] = itemDocs.map((item) => {
    const source = record(item.source)
    const categorySlug =
      item.category && typeof item.category === 'object'
        ? item.category.slug
        : typeof item.category === 'string'
          ? categorySlugByID.get(item.category) || ''
          : ''
    return {
      categorySlug:
        categorySlug || (typeof source.category_slug === 'string' ? source.category_slug : ''),
      emoji: typeof source.emoji === 'string' ? source.emoji : '📖',
      english: typeof source.en === 'string' ? source.en : item.tags?.[0]?.tag || '',
      id: item.id,
      plain: typeof source.plain === 'string' ? source.plain : item.summary || '',
      related: strings(source.related).length
        ? strings(source.related)
        : (item.tags || []).map((tag) => tag.tag),
      tech: typeof source.tech === 'string' ? source.tech : '',
      title: typeof source.cn === 'string' ? source.cn : item.title,
    }
  })
  const categoryTermCounts = new Map<string, number>()
  for (const term of terms) {
    categoryTermCounts.set(term.categorySlug, (categoryTermCounts.get(term.categorySlug) || 0) + 1)
  }
  const categories = categoryDocs.map((category) => ({
    label: category.label,
    slug: category.slug,
    terms: categoryTermCounts.get(category.slug) || 0,
  }))

  return (
    <div className="job-experience">
      <TeachingNavSidebar />
      <main>
        <TermsExplorer categories={categories} terms={terms} />
      </main>
    </div>
  )
}
