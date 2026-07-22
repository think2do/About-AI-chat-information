import config from '@payload-config'
import { getPayload, type Where } from 'payload'

import { isActiveMemberUser } from '@/collections/access'

export const dynamic = 'force-dynamic'

function error(message: string, status: number) {
  return Response.json({ message }, { status })
}

function text(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

async function adjustParticipantCount(
  payload: Awaited<ReturnType<typeof getPayload>>,
  activityID: number | string,
  delta: number,
) {
  const activity = await payload.findByID({
    collection: 'activities',
    id: activityID,
    depth: 0,
    overrideAccess: true,
  })
  await payload.update({
    collection: 'activities',
    id: activityID,
    data: { participantCount: Math.max(0, activity.participantCount + delta) },
    depth: 0,
    overrideAccess: true,
  })
}

export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user || !isActiveMemberUser(user)) return error('请先登录普通用户账号。', 401)

  const activityID = new URL(request.url).searchParams.get('activityId')
  const where: Where = activityID
    ? {
        and: [
          { user: { equals: user.id } },
          { activity: { equals: activityID } },
        ],
      }
    : { user: { equals: user.id } }

  const registrations = await payload.find({
    collection: 'activity-registrations',
    depth: 1,
    limit: activityID ? 1 : 100,
    overrideAccess: true,
    sort: '-registeredAt',
    where,
  })
  return Response.json(registrations)
}

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user || !isActiveMemberUser(user)) return error('请先登录普通用户账号。', 401)

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return error('报名信息格式不正确。', 400)
  }

  const activityID = text(body.activityId, 80)
  const contactName = text(body.contactName, 80)
  const contactEmail = text(body.contactEmail, 160).toLowerCase()
  const contactMobile = text(body.contactMobile, 40)
  const note = text(body.note, 500)
  if (!activityID || !contactName || !/^\S+@\S+\.\S+$/.test(contactEmail)) {
    return error('请填写联系人姓名和有效联系邮箱。', 400)
  }

  let activity
  try {
    activity = await payload.findByID({
      collection: 'activities',
      id: activityID,
      depth: 0,
      overrideAccess: true,
    })
  } catch {
    return error('活动不存在。', 404)
  }

  if (activity._status !== 'published') return error('活动不存在。', 404)
  if (activity.registrationMode !== 'internal') return error('该活动不使用站内报名。', 409)
  if (activity.activityStatus !== 'registering' && activity.activityStatus !== 'open') {
    return error('该活动当前未开放报名。', 409)
  }

  const existing = await payload.find({
    collection: 'activity-registrations',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [{ activity: { equals: activity.id } }, { user: { equals: user.id } }],
    },
  })
  const previous = existing.docs[0]
  if (previous?.status === 'registered') {
    return Response.json({ doc: previous, message: '你已经报名该活动。' })
  }

  if (activity.capacity && activity.participantCount >= activity.capacity) {
    return error('活动报名人数已满。', 409)
  }

  const registrationData = {
    activity: activity.id,
    cancelledAt: null,
    contactEmail,
    contactMobile: contactMobile || null,
    contactName,
    note: note || null,
    registeredAt: new Date().toISOString(),
    status: 'registered' as const,
    user: user.id,
  }
  const registration = previous
    ? await payload.update({
        collection: 'activity-registrations',
        id: previous.id,
        data: registrationData,
        depth: 1,
        overrideAccess: true,
      })
    : await payload.create({
        collection: 'activity-registrations',
        data: registrationData,
        depth: 1,
        overrideAccess: true,
      })

  await adjustParticipantCount(payload, activity.id, 1)
  return Response.json({ doc: registration, message: '报名成功。' }, { status: previous ? 200 : 201 })
}
