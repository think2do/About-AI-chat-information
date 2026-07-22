import 'dotenv/config'

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:3020'
const marker = `member-e2e-${Date.now()}`

let adminToken
let activityID
let registrationID
let temporaryUserID

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function request(path, init = {}) {
  const response = await fetch(`${baseURL}${path}`, init)
  const text = await response.text()
  let body
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }
  return { body, response }
}

function adminHeaders(extra = {}) {
  return { Authorization: `JWT ${adminToken}`, ...extra }
}

function browserHeaders(cookie, extra = {}) {
  return {
    Cookie: cookie,
    Origin: new URL(baseURL).origin,
    'Sec-Fetch-Site': 'same-origin',
    ...extra,
  }
}

async function cleanup() {
  if (!adminToken) return
  if (registrationID) {
    await request(`/api/activity-registrations/${registrationID}`, {
      headers: adminHeaders(),
      method: 'DELETE',
    }).catch(() => undefined)
  }
  if (activityID) {
    await request(`/api/activities/${activityID}`, {
      headers: adminHeaders(),
      method: 'DELETE',
    }).catch(() => undefined)
  }
  if (temporaryUserID) {
    await request(`/api/users/${temporaryUserID}`, {
      headers: adminHeaders(),
      method: 'DELETE',
    }).catch(() => undefined)
  }
}

try {
  const adminLogin = await request('/api/users/login', {
    body: JSON.stringify({ email: 'admin@example.com', password: 'Payload@123456' }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  assert(adminLogin.response.ok, `管理员登录失败：${adminLogin.response.status}`)
  adminToken = adminLogin.body?.token
  assert(adminToken, '管理员登录响应缺少 token')

  const injectedRegistration = await request('/api/users', {
    body: JSON.stringify({
      accountStatus: 'suspended',
      email: `${marker}@example.com`,
      name: '越权注册验证',
      password: 'Member@123456',
      role: 'admin',
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  assert(injectedRegistration.response.status === 201, '普通用户注册接口未成功创建账号')
  temporaryUserID = injectedRegistration.body?.doc?.id
  assert(temporaryUserID, '注册响应缺少用户 ID')
  assert(injectedRegistration.body.doc.role === 'member', '普通注册可以伪造管理员角色')
  assert(injectedRegistration.body.doc.accountStatus === 'active', '普通注册可以伪造暂停状态')

  const memberLogin = await request('/api/users/login', {
    body: JSON.stringify({ email: 'member@example.com', password: 'Member@123456' }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  assert(memberLogin.response.ok, `普通用户登录失败：${memberLogin.response.status}`)
  assert(memberLogin.body?.user?.role === 'member', '测试账号不是普通用户角色')
  const memberToken = memberLogin.body?.token
  const memberCookie = (
    typeof memberLogin.response.headers.getSetCookie === 'function'
      ? memberLogin.response.headers.getSetCookie()[0]
      : memberLogin.response.headers.get('set-cookie')
  )?.split(';')[0]
  assert(memberToken, '普通用户登录响应缺少 token')
  assert(memberCookie, '普通用户登录未设置 HttpOnly Cookie')

  const me = await request('/api/users/me', { headers: browserHeaders(memberCookie) })
  assert(me.response.ok && me.body?.user?.email === 'member@example.com', 'Cookie 会话读取失败')

  const activityResponse = await request('/api/activities', {
    body: JSON.stringify({
      _status: 'published',
      activityStatus: 'registering',
      featured: false,
      participantCount: 0,
      registrationMode: 'internal',
      rules: '用于验证普通用户报名、取消和权限隔离。',
      slug: marker,
      sortOrder: 999999,
      summary: '普通用户认证与活动报名自动联调临时数据。',
      title: `普通用户联调 ${marker}`,
    }),
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    method: 'POST',
  })
  assert(activityResponse.response.status === 201, '管理员无法创建联调活动')
  activityID = activityResponse.body?.doc?.id
  assert(activityID, '联调活动响应缺少 ID')

  const forbiddenUpdate = await request(`/api/activities/${activityID}`, {
    body: JSON.stringify({ title: '不应被普通用户修改' }),
    headers: { Authorization: `JWT ${memberToken}`, 'Content-Type': 'application/json' },
    method: 'PATCH',
  })
  assert(forbiddenUpdate.response.status === 403, '普通用户可以修改官网活动内容')

  const registration = await request('/api/member/registrations', {
    body: JSON.stringify({
      activityId: activityID,
      contactEmail: 'member@example.com',
      contactMobile: '13800000000',
      contactName: '诗轩体验用户',
      note: '自动联调报名记录',
    }),
    headers: browserHeaders(memberCookie, { 'Content-Type': 'application/json' }),
    method: 'POST',
  })
  assert(registration.response.status === 201, `活动报名失败：${registration.response.status}`)
  registrationID = registration.body?.doc?.id
  assert(registrationID, '活动报名响应缺少 ID')

  const duplicate = await request('/api/member/registrations', {
    body: JSON.stringify({
      activityId: activityID,
      contactEmail: 'member@example.com',
      contactName: '诗轩体验用户',
    }),
    headers: browserHeaders(memberCookie, { 'Content-Type': 'application/json' }),
    method: 'POST',
  })
  assert(duplicate.response.ok, '重复报名没有返回现有记录')
  assert(duplicate.body?.doc?.id === registrationID, '重复报名创建了第二条记录')

  const memberCenter = await request('/me', { headers: browserHeaders(memberCookie) })
  assert(memberCenter.response.ok, '登录后无法访问个人中心')
  assert(memberCenter.body.includes(`普通用户联调 ${marker}`), '个人中心没有展示本人报名记录')

  const cancel = await request(`/api/member/registrations/${registrationID}/cancel`, {
    headers: browserHeaders(memberCookie),
    method: 'POST',
  })
  assert(cancel.response.ok && cancel.body?.doc?.status === 'cancelled', '取消报名失败')

  const logout = await request('/api/users/logout', {
    headers: browserHeaders(memberCookie),
    method: 'POST',
  })
  assert(logout.response.ok, '退出登录失败')
  const expiredCookie = (
    typeof logout.response.headers.getSetCookie === 'function'
      ? logout.response.headers.getSetCookie()[0]
      : logout.response.headers.get('set-cookie')
  )?.split(';')[0]
  const meAfterLogout = await request('/api/users/me', {
    headers: browserHeaders(expiredCookie || ''),
  })
  assert(!meAfterLogout.body?.user, '退出登录后会话仍然有效')

  console.log(
    JSON.stringify(
      {
        activityRegistration: 'passed',
        duplicateProtection: 'passed',
        logout: 'passed',
        memberLogin: 'passed',
        memberProfile: 'passed',
        privilegeIsolation: 'passed',
        publicRegistrationRoleGuard: 'passed',
      },
      null,
      2,
    ),
  )
} catch (error) {
  throw error
} finally {
  await cleanup()
}
