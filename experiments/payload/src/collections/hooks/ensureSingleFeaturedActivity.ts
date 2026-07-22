import type { Activity } from '../../payload-types'
import type { CollectionBeforeChangeHook, Where } from 'payload'

const skipContextKey = 'skipFeaturedActivitySync'

export const ensureSingleFeaturedActivity: CollectionBeforeChangeHook<Activity> = async ({
  context,
  data,
  originalDoc,
  req,
}) => {
  const nextFeatured = data.featured ?? originalDoc?.featured
  const nextStatus = data._status ?? originalDoc?._status

  if (context[skipContextKey] || !nextFeatured || nextStatus !== 'published') {
    return data
  }

  const conditions: Where[] = [
    { featured: { equals: true } },
    { _status: { equals: 'published' } },
  ]
  if (originalDoc?.id) conditions.unshift({ id: { not_equals: originalDoc.id } })

  const result = await req.payload.update({
    collection: 'activities',
    context: { ...context, [skipContextKey]: true },
    data: { featured: false },
    depth: 0,
    draft: false,
    overrideAccess: true,
    req,
    where: {
      and: conditions,
    },
  })

  if (result.errors.length > 0) {
    throw new Error(`无法取消旧的首页当期活动：${result.errors[0].message}`)
  }

  return data
}
