import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from './access'

export const ContentModules: CollectionConfig = {
  slug: 'content-modules',
  labels: {
    singular: '教学模块',
    plural: '教学模块',
  },
  admin: {
    group: '教学内容',
    useAsTitle: 'label',
    defaultColumns: ['label', 'slug', 'accentColor', '_status', 'updatedAt'],
    description: '管理 Chat、Lab、Code、Jargon、Job 五个内容域。',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedOrAuthenticated,
    update: authenticated,
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      label: '模块名称',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: '模块标识',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: '用于 API 查询的稳定标识，例如 jargon。',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: '模块说明',
      required: true,
    },
    {
      name: 'accentColor',
      type: 'text',
      label: '主题色',
      defaultValue: '#6c5ce7',
      required: true,
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: '排序',
      defaultValue: 0,
      required: true,
      index: true,
    },
  ],
  defaultSort: 'sortOrder',
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
}
