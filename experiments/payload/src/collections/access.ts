import type { Access } from 'payload'

export const anyone: Access = () => true

type AppUser = {
  accountStatus?: unknown
  id: number | string
  role?: unknown
}

export function isStaffUser(user: unknown): boolean {
  if (!user || typeof user !== 'object') return false
  const role = (user as AppUser).role
  return role === 'admin' || role === 'editor'
}

export function isActiveMemberUser(user: unknown): boolean {
  if (!user || typeof user !== 'object') return false
  const candidate = user as AppUser
  return candidate.role === 'member' && candidate.accountStatus === 'active'
}

export const authenticated: Access = ({ req }) => isStaffUser(req.user)

export const publishedOrAuthenticated: Access = ({ req }) =>
  isStaffUser(req.user) ? true : { _status: { equals: 'published' } }

export const activeMemberOnly: Access = ({ req }) => isActiveMemberUser(req.user)

export const userSelfOrStaff: Access = ({ req }) => {
  if (isStaffUser(req.user)) return true
  if (isActiveMemberUser(req.user) && req.user) return { id: { equals: req.user.id } }
  return false
}
