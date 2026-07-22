import config from '@payload-config'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { isActiveMemberUser } from '@/collections/access'
import { RegistrationCancelButton } from '@/components/site/RegistrationCancelButton'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: '个人中心 · About AI',
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default async function MePage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user || !isActiveMemberUser(user)) redirect('/auth?returnUrl=/me')

  const [settings, registrations] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', overrideAccess: false }),
    payload.find({
      collection: 'activity-registrations',
      depth: 1,
      limit: 100,
      overrideAccess: true,
      sort: '-registeredAt',
      where: { user: { equals: user.id } },
    }),
  ])

  return (
    <>
      <SiteHeader siteName={settings.siteName || undefined} />
      <main className="profile-page site-shell">
        <div className="page-heading profile-heading">
          <span className="eyebrow">MEMBER CENTER</span>
          <h1>个人中心</h1>
          <p>{user.name}，这里展示你的活动报名与作品投稿记录。</p>
        </div>

        <section className="profile-section">
          <div className="section-title-row">
            <h2>我的活动报名</h2>
            <Link href="/events">浏览热门活动 →</Link>
          </div>
          <div className="section-rule" />
          {registrations.docs.length ? (
            <div className="profile-list">
              {registrations.docs.map((registration) => {
                const activity =
                  typeof registration.activity === 'object' ? registration.activity : undefined
                return (
                  <article className="profile-record-card" key={registration.id}>
                    <span className="mini-label">参与活动</span>
                    <h3>{activity?.title || '活动记录'}</h3>
                    <p>{activity?.summary || '登录用户活动报名记录。'}</p>
                    <div className="profile-record-meta">
                      <span>
                        报名时间
                        <b>{formatDate(registration.registeredAt)}</b>
                      </span>
                      <span>
                        报名状态
                        <b>{registration.status === 'registered' ? '已报名' : '已取消'}</b>
                      </span>
                      <span>
                        报名联系人
                        <b>{registration.contactName}</b>
                      </span>
                    </div>
                    {registration.status === 'registered' ? (
                      <RegistrationCancelButton registrationID={registration.id} />
                    ) : null}
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="profile-empty">
              <p>你还没有报名活动。</p>
              <Link className="outline-button" href="/events">
                去看看热门活动
              </Link>
            </div>
          )}
        </section>

        <section className="profile-section">
          <div className="section-title-row">
            <h2>我的作品投稿</h2>
            <span className="mini-label">下一阶段开放</span>
          </div>
          <div className="section-rule" />
          <div className="profile-empty">
            <p>作品投稿将在下一阶段接入审核流程，当前不会展示虚构记录。</p>
            <Link className="outline-button" href="/works">
              浏览公开作品
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter
        footerText={settings.footerText || undefined}
        siteName={settings.siteName || undefined}
      />
    </>
  )
}
