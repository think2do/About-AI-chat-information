import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from './access'

export const ContentCategories: CollectionConfig = {
  slug: 'content-categories',
  labels: {
    singular: '内容分类',
    plural: '内容分类',
  },
  admin: {
    group: '教学内容',
    useAsTitle: 'label',
    defaultColumns: ['label', 'module', 'itemType', 'sortOrder', '_status'],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedOrAuthenticated,
    update: authenticated,
  },
  fields: [
    {
      name: 'module',
      type: 'relationship',
      label: '所属模块',
      relationTo: 'content-modules',
      required: true,
      index: true,
    },
    {
      name: 'label',
      type: 'text',
      label: '分类名称',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: '分类标识',
      required: true,
      index: true,
    },
    {
      name: 'itemType',
      type: 'text',
      label: '内容类型',
      required: true,
      index: true,
    },
    {
      name: 'sourceKey',
      type: 'text',
      label: '导入标识',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
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
