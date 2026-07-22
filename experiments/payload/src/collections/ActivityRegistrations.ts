import type { CollectionConfig } from 'payload'

import { authenticated, isActiveMemberUser, isStaffUser } from './access'

export const ActivityRegistrations: CollectionConfig = {
  slug: 'activity-registrations',
  labels: { singular: '活动报名', plural: '活动报名' },
  admin: {
    group: '社区运营',
    useAsTitle: 'contactName',
    defaultColumns: ['activity', 'user', 'contactName', 'status', 'registeredAt'],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: ({ req }) => {
      if (isStaffUser(req.user)) return true
      if (isActiveMemberUser(req.user) && req.user) return { user: { equals: req.user.id } }
      return false
    },
    update: authenticated,
  },
  indexes: [{ fields: ['activity', 'user'], unique: true }],
  fields: [
    {
      name: 'activity',
      type: 'relationship',
      relationTo: 'activities',
      label: '活动',
      required: true,
      index: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      label: '报名用户',
      required: true,
      index: true,
    },
    { name: 'contactName', type: 'text', label: '联系人姓名', required: true },
    { name: 'contactEmail', type: 'email', label: '联系邮箱', required: true },
    { name: 'contactMobile', type: 'text', label: '联系电话' },
    { name: 'note', type: 'textarea', label: '报名备注', maxLength: 500 },
    {
      name: 'status',
      type: 'select',
      label: '报名状态',
      required: true,
      defaultValue: 'registered',
      options: [
        { label: '已报名', value: 'registered' },
        { label: '已取消', value: 'cancelled' },
      ],
      index: true,
    },
    {
      name: 'registeredAt',
      type: 'date',
      label: '报名时间',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
    { name: 'cancelledAt', type: 'date', label: '取消时间' },
  ],
  defaultSort: '-registeredAt',
}
