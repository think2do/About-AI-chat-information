import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from './access'

export const Works: CollectionConfig = {
  slug: 'works',
  labels: { singular: '作品', plural: '作品管理' },
  admin: {
    group: '官网管理',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'authorName', 'featured', '_status', 'updatedAt'],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedOrAuthenticated,
    update: authenticated,
  },
  fields: [
    { name: 'title', type: 'text', label: '作品名称', required: true },
    { name: 'slug', type: 'text', label: '作品标识', required: true, unique: true, index: true },
    { name: 'category', type: 'text', label: '作品分类', required: true },
    { name: 'summary', type: 'textarea', label: '作品简介', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'authorName',
          type: 'text',
          label: '作者',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'externalUrl',
          type: 'text',
          label: '项目链接',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'featured',
          type: 'checkbox',
          label: '首页精选',
          defaultValue: false,
          admin: { width: '50%' },
        },
        {
          name: 'sortOrder',
          type: 'number',
          label: '排序',
          defaultValue: 0,
          required: true,
          index: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: '作品封面',
      filterOptions: {
        mimeType: { contains: 'image/' },
      },
    },
  ],
  defaultSort: 'sortOrder',
  versions: { drafts: true, maxPerDoc: 20 },
}
