import type { CollectionConfig } from 'payload'

import { anyone, authenticated } from './access'

const MAX_DEMO_MEDIA_SIZE_BYTES = 4 * 1024 * 1024

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: '媒体文件', plural: '媒体库' },
  admin: { group: '内容工作台', useAsTitle: 'alt' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    beforeChange: [
      ({ req }) => {
        if (req.file && req.file.size > MAX_DEMO_MEDIA_SIZE_BYTES) {
          throw new Error('媒体文件不能超过 4 MB；演示部署请先压缩图片或 PDF 后再上传。')
        }
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: '替代文本',
      required: true,
      admin: { description: '仅支持图片或 PDF，单个文件最大 4 MB。' },
    },
    { name: 'caption', type: 'textarea', label: '说明' },
  ],
  upload: {
    mimeTypes: ['image/*', 'application/pdf'],
    staticDir: 'media',
  },
}
