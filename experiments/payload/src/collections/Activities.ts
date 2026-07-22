import type { CollectionConfig } from 'payload'

import { activityStatusLabels } from '@/lib/activity-status'

import { authenticated, publishedOrAuthenticated } from './access'
import { ensureSingleFeaturedActivity } from './hooks/ensureSingleFeaturedActivity'

export const Activities: CollectionConfig = {
  slug: 'activities',
  labels: { singular: '活动', plural: '活动管理' },
  admin: {
    group: '官网管理',
    useAsTitle: 'title',
    defaultColumns: [
      'title',
      'activityStatus',
      'featured',
      'participantCount',
      '_status',
      'updatedAt',
    ],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedOrAuthenticated,
    update: authenticated,
  },
  hooks: {
    beforeChange: [ensureSingleFeaturedActivity],
  },
  fields: [
    { name: 'title', type: 'text', label: '活动名称', required: true },
    { name: 'slug', type: 'text', label: '活动标识', required: true, unique: true, index: true },
    {
      name: 'summary',
      type: 'textarea',
      label: '活动简介',
      required: true,
    },
    {
      name: 'rules',
      type: 'textarea',
      label: '活动规则',
      required: true,
    },
    {
      name: 'activityStatus',
      type: 'select',
      label: '活动状态',
      required: true,
      defaultValue: 'upcoming',
      options: Object.entries(activityStatusLabels).map(([value, label]) => ({ label, value })),
      admin: {
        description: '前台状态文案将根据这里的选项自动显示，无需重复填写。',
        width: '50%',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'registrationMode',
          type: 'select',
          label: '报名方式',
          required: true,
          defaultValue: 'internal',
          options: [
            { label: '站内报名', value: 'internal' },
            { label: '外部报名', value: 'external' },
            { label: '不开放报名', value: 'closed' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'capacity',
          type: 'number',
          label: '报名人数上限',
          min: 1,
          admin: {
            description: '留空表示不限制人数。',
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'externalRegistrationUrl',
      type: 'text',
      label: '外部报名地址',
      admin: {
        condition: (_, siblingData) => siblingData.registrationMode === 'external',
      },
    },
    {
      name: 'statusText',
      type: 'text',
      label: '历史状态说明',
      admin: { hidden: true },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'participantCount',
          type: 'number',
          label: '参与人数',
          defaultValue: 0,
          min: 0,
          required: true,
          admin: { width: '33%' },
        },
        {
          name: 'featured',
          type: 'checkbox',
          label: '设为首页当期活动',
          defaultValue: false,
          admin: {
            description: '发布后将自动取消其他活动的首页当期标记，全站只保留一个。',
            width: '33%',
          },
        },
        {
          name: 'sortOrder',
          type: 'number',
          label: '活动列表排序',
          defaultValue: 0,
          min: 0,
          required: true,
          index: true,
          admin: {
            description: '仅控制活动列表顺序，数字越小越靠前。',
            width: '33%',
          },
        },
      ],
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: '活动海报',
      filterOptions: {
        mimeType: { contains: 'image/' },
      },
    },
  ],
  defaultSort: 'sortOrder',
  versions: { drafts: true, maxPerDoc: 20 },
}
