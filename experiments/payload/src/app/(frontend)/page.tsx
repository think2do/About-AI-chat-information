import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { VisualPlaceholder } from '@/components/site/VisualPlaceholder'
import { getActivityStatusLabel } from '@/lib/activity-status'
import { mediaImageURL } from '@/lib/media-url'

export default async function HomePage() {
  const payload = await getPayload({ config })
  const [settings, featuredActivities, featuredWorks, termCount, questionCount] = await Promise.all(
    [
      payload.findGlobal({ slug: 'site-settings', overrideAccess: false }),
      payload.find({
        collection: 'activities',
        depth: 1,
        limit: 1,
        overrideAccess: false,
        sort: 'sortOrder',
        where: { featured: { equals: true } },
      }),
      payload.find({
        collection: 'works',
        depth: 1,
        limit: 4,
        overrideAccess: false,
        sort: 'sortOrder',
        where: { featured: { equals: true } },
      }),
      payload.count({
        collection: 'content-items',
        overrideAccess: false,
        where: { itemType: { equals: 'term' } },
      }),
      payload.count({
        collection: 'content-items',
        overrideAccess: false,
        where: { itemType: { equals: 'question' } },
      }),
    ],
  )
  const activity = featuredActivities.docs[0]
  const siteName = settings.siteName || 'About AI'

  return (
    <>
      <SiteHeader active="home" siteName={siteName} />
      <main>
        <section className="homepage-hero site-shell">
          <div className="hero-copy">
            <div className="eyebrow">OPEN AI COMMUNITY · 2026</div>
            <h1>{settings.heroTitle || 'AI 探索者社区'}</h1>
            <h2>{settings.heroSlogan || '一起学习 AI，一起把灵感做成作品。'}</h2>
            <p>
              {settings.heroDescription || '面向 AI 学习者、产品人、设计师与开发者的开放社区。'}
            </p>
            <div className="hero-actions">
              <Link className="black-button" href="/learn">
                开始探索
              </Link>
              <Link className="text-link" href="/admin/globals/site-settings">
                在后台编辑这一屏 →
              </Link>
            </div>
          </div>
          <div className="hero-visual" aria-label="About AI 内容关系示意">
            <div className="visual-grid-lines" />
            <div className="visual-core">
              ABOUT
              <br />
              AI
            </div>
            <span className="visual-node node-a">LLM 名词</span>
            <span className="visual-node node-b">活动</span>
            <span className="visual-node node-c">作品</span>
            <span className="visual-node node-d">面试题</span>
          </div>
        </section>

        <section className="homepage-section site-shell">
          <div className="section-title-row">
            <h2>当期活动</h2>
            <Link href="/admin/collections/activities">后台管理活动 →</Link>
          </div>
          <div className="section-rule" />
          {activity ? (
            <article className="featured-activity">
              <VisualPlaceholder
                alt={activity.title}
                className="activity-cover"
                label="活动海报"
                url={mediaImageURL(activity.cover)}
              />
              <div className="activity-copy">
                <span className="outline-tag">{getActivityStatusLabel(activity.activityStatus)}</span>
                <h3>{activity.title}</h3>
                <p>{activity.summary}</p>
                <div className="activity-meta">
                  <span>参与人数</span>
                  <strong>{activity.participantCount}</strong>
                </div>
                <Link className="black-button" href={`/events#${activity.slug}`}>
                  了解活动
                </Link>
              </div>
            </article>
          ) : (
            <div className="empty-block">请在后台发布并勾选一个首页当期活动。</div>
          )}
        </section>

        <section className="homepage-section site-shell">
          <div className="section-title-row">
            <h2>LLM学习平台</h2>
            <Link className="outline-button" href="/learn">
              开始学习
            </Link>
          </div>
          <div className="section-rule" />
          <div className="learning-grid">
            <article className="learning-card disabled-card">
              <VisualPlaceholder alt="模型训练模拟平台" label="即将上线" />
              <span className="mini-label">COMING SOON</span>
              <h3>AI 模型训练模拟平台</h3>
              <p>用交互方式理解模型训练流程。</p>
            </article>
            <Link className="learning-card" href="/learn">
              <VisualPlaceholder alt="LLM 名词库" label={`${termCount.totalDocs} 个名词`} />
              <span className="mini-label">KNOWLEDGE</span>
              <h3>LLM名词库</h3>
              <p>从真实术语开始建立 AI 知识地图。</p>
            </Link>
            <Link className="learning-card" href="/job">
              <VisualPlaceholder alt="求职面试" label={`${questionCount.totalDocs} 道题目`} />
              <span className="mini-label">CAREER</span>
              <h3>求职专区</h3>
              <p>整理面试问题、回答结构与求职方法。</p>
            </Link>
          </div>
        </section>

        <section className="homepage-section site-shell">
          <div className="section-title-row">
            <h2>作品精选</h2>
            <Link href="/admin/collections/works">后台管理作品 →</Link>
          </div>
          <div className="section-rule" />
          <div className="work-grid compact-work-grid">
            {featuredWorks.docs.map((work, index) => (
              <Link className="work-card" href="/works" key={work.id}>
                <VisualPlaceholder
                  alt={work.title}
                  label={`作品封面 0${index + 1}`}
                  url={mediaImageURL(work.cover)}
                />
                <span className="mini-label">{work.category}</span>
                <h3>{work.title}</h3>
                <p>{work.authorName}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="homepage-section account-section site-shell">
          <div className="section-title-row">
            <h2>登录 / 注册</h2>
          </div>
          <div className="section-rule" />
          <div className="account-entry">
            <div>
              <h3>登录后报名活动并管理个人记录</h3>
              <p>
                普通用户登录后可以报名活动，并在个人中心查看报名状态与后续作品审核记录。
              </p>
              <Link className="outline-button" href="/auth">
                前往登录 / 注册 →
              </Link>
            </div>
            <div className="account-preview">
              <span>PAYLOAD</span>
              <b>内容发布</b>
              <i>→</i>
              <span>WEBSITE</span>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter footerText={settings.footerText || undefined} siteName={siteName} />
    </>
  )
}
