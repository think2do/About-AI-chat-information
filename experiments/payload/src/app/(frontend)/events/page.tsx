import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { VisualPlaceholder } from '@/components/site/VisualPlaceholder'
import { EventRegistration } from '@/components/site/EventRegistration'
import { getActivityStatusLabel } from '@/lib/activity-status'
import { mediaImageURL } from '@/lib/media-url'

export default async function EventsPage() {
  const payload = await getPayload({ config })
  const [settings, activities] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', overrideAccess: false }),
    payload.find({
      collection: 'activities',
      depth: 1,
      limit: 30,
      overrideAccess: false,
      sort: 'sortOrder',
    }),
  ])

  return (
    <>
      <SiteHeader active="events" siteName={settings.siteName || undefined} />
      <main className="listing-page site-shell">
        <div className="page-heading">
          <span className="eyebrow">COMMUNITY EVENTS</span>
          <h1>热门活动</h1>
          <p>集中展示活动名称、参与规则与当前状态，后台发布后自动出现在这里。</p>
          <Link href="/admin/collections/activities">在后台发布活动 →</Link>
        </div>
        <div className="event-grid">
          {activities.docs.map((activity, index) => {
            const coverURL = mediaImageURL(activity.cover)

            return (
              <article className="event-card" id={activity.slug} key={activity.id}>
                {coverURL ? (
                  <VisualPlaceholder
                    alt={activity.title}
                    className="event-cover"
                    label="活动海报"
                    url={coverURL}
                  />
                ) : null}
                <span className="card-index">
                  {String(index + 1).padStart(2, '0')} / 热门活动
                </span>
                <h2>{activity.title}</h2>
                <h3>活动规则</h3>
                <p>{activity.rules}</p>
                <div className="event-status">
                  <span>活动状态</span>
                  <strong>{getActivityStatusLabel(activity.activityStatus)}</strong>
                </div>
                <div className="event-participants">
                  <span>当前参与</span>
                  <b>{activity.participantCount} 人</b>
                </div>
                <EventRegistration
                  activityID={activity.id}
                  activitySlug={activity.slug}
                  activityStatus={activity.activityStatus}
                  capacity={activity.capacity}
                  externalRegistrationUrl={activity.externalRegistrationUrl}
                  participantCount={activity.participantCount}
                  registrationMode={activity.registrationMode}
                />
              </article>
            )
          })}
        </div>
      </main>
      <SiteFooter
        footerText={settings.footerText || undefined}
        siteName={settings.siteName || undefined}
      />
    </>
  )
}
