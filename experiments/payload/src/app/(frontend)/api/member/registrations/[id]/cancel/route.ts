import config from '@payload-config'
import { getPayload } from 'payload'

import { isActiveMemberUser } from '@/collections/access'
import { relationID } from '@/lib/relations'

export const dynamic = 'force-dynamic'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user || !isActiveMemberUser(user)) {
    return Response.json({ message: '请先登录普通用户账号。' }, { status: 401 })
  }

  const { id } = await context.params
  let registration
  try {
    registration = await payload.findByID({
      collection: 'activity-registrations',
      id,
      depth: 1,
      overrideAccess: true,
    })
  } catch {
    return Response.json({ message: '报名记录不存在。' }, { status: 404 })
  }

  if (relationID(registration.user) !== user.id) {
    return Response.json({ message: '报名记录不存在。' }, { status: 404 })
  }
  if (registration.status === 'cancelled') {
    return Response.json({ doc: registration, message: '报名已经取消。' })
  }

  const activityID = relationID(registration.activity)
  const updated = await payload.update({
    collection: 'activity-registrations',
    id: registration.id,
    data: { cancelledAt: new Date().toISOString(), status: 'cancelled' },
    depth: 1,
    overrideAccess: true,
  })

  if (activityID !== undefined) {
    const activity = await payload.findByID({
      collection: 'activities',
      id: activityID,
      depth: 0,
      overrideAccess: true,
    })
    await payload.update({
      collection: 'activities',
      id: activityID,
      data: { participantCount: Math.max(0, activity.participantCount - 1) },
      depth: 0,
      overrideAccess: true,
    })
  }

  return Response.json({ doc: updated, message: '报名已取消。' })
}
