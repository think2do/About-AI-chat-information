import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { VisualPlaceholder } from '@/components/site/VisualPlaceholder'
import { mediaImageURL } from '@/lib/media-url'

export default async function WorksPage() {
  const payload = await getPayload({ config })
  const [settings, works] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', overrideAccess: false }),
    payload.find({
      collection: 'works',
      depth: 1,
      limit: 40,
      overrideAccess: false,
      sort: 'sortOrder',
    }),
  ])

  return (
    <>
      <SiteHeader active="works" siteName={settings.siteName || undefined} />
      <main className="listing-page site-shell">
        <div className="page-heading">
          <span className="eyebrow">COMMUNITY WORKS</span>
          <h1>作品展示</h1>
          <p>汇集社区成员的 AI 产品、研究实验与创意项目。</p>
          <Link href="/admin/collections/works">在后台管理作品 →</Link>
        </div>
        <div className="work-grid">
          {works.docs.map((work, index) => (
            <article className="work-card large" key={work.id}>
              <VisualPlaceholder
                alt={work.title}
                label={`作品封面 0${index + 1}`}
                url={mediaImageURL(work.cover)}
              />
              <span className="outline-tag">{work.category}</span>
              <h2>{work.title}</h2>
              <p>{work.summary}</p>
              <div className="work-author">
                <span>创作者</span>
                <strong>{work.authorName}</strong>
              </div>
              {work.externalUrl ? (
                <a className="text-link" href={work.externalUrl} rel="noreferrer" target="_blank">
                  查看项目 →
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </main>
      <SiteFooter
        footerText={settings.footerText || undefined}
        siteName={settings.siteName || undefined}
      />
    </>
  )
}
