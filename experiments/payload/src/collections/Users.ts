import { APIError, type CollectionConfig } from 'payload'

import { anyone, authenticated, isStaffUser, userSelfOrStaff } from './access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: '用户', plural: '用户管理' },
  admin: {
    group: '系统',
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role', 'accountStatus', 'updatedAt'],
  },
  auth: {
    cookies: {
      sameSite: 'Lax',
      secure: (process.env.NEXT_PUBLIC_SERVER_URL || '').startsWith('https://'),
    },
    lockTime: 600000,
    maxLoginAttempts: 5,
    tokenExpiration: 604800,
    useSessions: true,
  },
  access: {
    admin: ({ req }) => isStaffUser(req.user),
    create: anyone,
    delete: authenticated,
    read: userSelfOrStaff,
    update: userSelfOrStaff,
  },
  hooks: {
    afterLogin: [
      async ({ req, user }) => {
        await req.payload.update({
          collection: 'users',
          data: { lastLoginAt: new Date().toISOString() },
          id: user.id,
          overrideAccess: true,
          req,
        })
      },
    ],
    beforeChange: [
      ({ data, operation, req }) => {
        const trustedUserCreate = req.context?.trustedUserCreate === true

        if (operation === 'create' && !isStaffUser(req.user) && !trustedUserCreate) {
          if (typeof data.password !== 'string' || data.password.length < 8) {
            throw new APIError('密码至少需要 8 位。', 400, null, true)
          }
          data.role = 'member'
          data.accountStatus = 'active'
        }
        return data
      },
    ],
    beforeLogin: [
      ({ user }) => {
        if (user.accountStatus === 'suspended') {
          throw new APIError('账号暂时无法使用，请联系管理员。', 403, null, true)
        }
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', label: '姓名', required: true },
    {
      name: 'role',
      type: 'select',
      label: '角色',
      required: true,
      defaultValue: 'member',
      options: [
        { label: '管理员', value: 'admin' },
        { label: '内容编辑', value: 'editor' },
        { label: '普通用户', value: 'member' },
      ],
      saveToJWT: true,
      access: {
        create: ({ req }) => isStaffUser(req.user),
        update: ({ req }) => isStaffUser(req.user),
      },
    },
    {
      name: 'accountStatus',
      type: 'select',
      label: '账号状态',
      required: true,
      defaultValue: 'active',
      options: [
        { label: '正常', value: 'active' },
        { label: '暂停', value: 'suspended' },
      ],
      saveToJWT: true,
      access: {
        create: ({ req }) => isStaffUser(req.user),
        update: ({ req }) => isStaffUser(req.user),
      },
    },
    {
      name: 'suspensionReason',
      type: 'textarea',
      label: '暂停原因',
      access: {
        create: ({ req }) => isStaffUser(req.user),
        read: ({ req }) => isStaffUser(req.user),
        update: ({ req }) => isStaffUser(req.user),
      },
      admin: {
        condition: (_, siblingData) => siblingData.accountStatus === 'suspended',
      },
    },
    {
      name: 'lastLoginAt',
      type: 'date',
      label: '最后登录时间',
      admin: { readOnly: true },
      access: {
        create: () => false,
        update: () => false,
      },
    },
  ],
}
