import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const GET = async () => {
  const payload = await getPayload({
    config: configPromise,
  })

  const { totalDocs } = await payload.count({
    collection: 'content-items',
    overrideAccess: true,
  })

  return Response.json({
    message: 'Payload CMS 体验实例运行正常。',
    contentItems: totalDocs,
  })
}
