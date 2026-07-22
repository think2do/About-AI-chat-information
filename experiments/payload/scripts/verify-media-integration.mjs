import 'dotenv/config'

import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3'
import pg from 'pg'

const { Client } = pg

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:3020'
const adminEmail = process.env.E2E_ADMIN_EMAIL || 'admin@example.com'
const adminPassword = process.env.E2E_ADMIN_PASSWORD || 'Payload@123456'
const marker = `media-e2e-${Date.now()}`
const filename = `${marker}.png`

let token
let activityID
let mediaID
let mediaKey
let workID
let databaseConnected = false

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function requestJSON(path, init = {}) {
  const response = await fetch(`${baseURL}${path}`, init)
  const text = await response.text()
  let body

  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }

  if (!response.ok) {
    const detail =
      body && typeof body === 'object'
        ? body.errors?.[0]?.message || body.message || body.detail
        : undefined
    throw new Error(
      `${init.method || 'GET'} ${path} 返回 ${response.status}${detail ? `：${detail}` : ''}`,
    )
  }

  return body
}

function authHeaders(extra = {}) {
  return { Authorization: `JWT ${token}`, ...extra }
}

function createS3Client() {
  return new S3Client({
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || 'minioadmin',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'minioadmin',
    },
    endpoint: process.env.S3_ENDPOINT || 'http://127.0.0.1:9000',
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
    region: process.env.S3_REGION || 'us-east-1',
  })
}

async function objectExists(s3, bucket, key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    return true
  } catch (error) {
    const status = error?.$metadata?.httpStatusCode
    if (status === 404 || error?.name === 'NotFound' || error?.name === 'NoSuchKey') return false
    throw error
  }
}

async function databaseCount(client, table, id) {
  const result = await client.query(`select count(*)::int as count from ${table} where id = $1`, [
    id,
  ])
  return result.rows[0]?.count ?? 0
}

async function cleanup() {
  if (!token) return

  if (workID) {
    try {
      await requestJSON(`/api/works/${workID}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
    } catch (error) {
      console.warn(`清理测试作品失败：${error.message}`)
    }
  }

  if (activityID) {
    try {
      await requestJSON(`/api/activities/${activityID}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
    } catch (error) {
      console.warn(`清理测试活动失败：${error.message}`)
    }
  }

  if (mediaID) {
    try {
      await requestJSON(`/api/media/${mediaID}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
    } catch (error) {
      console.warn(`清理测试媒体失败：${error.message}`)
    }
  }
}

const s3 = createS3Client()
const bucket = process.env.S3_BUCKET || 'payload-media'
const database = new Client({ connectionString: process.env.DATABASE_URL })

try {
  const login = await requestJSON('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  })
  token = login.token
  assert(token, '管理员登录成功，但响应中没有 JWT token')

  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64',
  )
  const form = new FormData()
  form.append('file', new Blob([png], { type: 'image/png' }), filename)
  form.append(
    '_payload',
    JSON.stringify({
      alt: `联调验证图片 ${marker}`,
      caption: 'PostgreSQL + S3 兼容对象存储自动联调验证',
    }),
  )

  const mediaResponse = await requestJSON('/api/media', {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  })
  const media = mediaResponse.doc
  mediaID = media?.id
  assert(mediaID, '媒体上传成功，但响应中没有媒体 ID')
  assert(media?.filename, '媒体上传成功，但响应中没有文件名')
  assert(media?.url, '媒体上传成功，但响应中没有访问 URL')
  if (process.env.S3_PUBLIC_URL) {
    assert(
      media.url.startsWith(`${process.env.S3_PUBLIC_URL.replace(/\/+$/, '')}/`),
      '媒体 URL 没有使用配置的 S3_PUBLIC_URL',
    )
  }
  mediaKey = [media.prefix, media.filename].filter(Boolean).join('/')

  await database.connect()
  databaseConnected = true
  assert((await databaseCount(database, 'media', mediaID)) === 1, 'PostgreSQL 中未找到新媒体记录')
  assert(await objectExists(s3, bucket, mediaKey), 'S3 兼容对象存储中未找到上传后的对象')

  const workResponse = await requestJSON('/api/works', {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      _status: 'published',
      authorName: 'Codex E2E',
      category: '联调验证',
      cover: mediaID,
      featured: true,
      slug: marker,
      sortOrder: -999999,
      summary: '用于验证 Payload、PostgreSQL、S3 兼容对象存储与 Next.js 前台回显的临时作品。',
      title: `媒体联调验证 ${marker}`,
    }),
  })
  const work = workResponse.doc
  workID = work?.id
  assert(workID, '作品创建成功，但响应中没有作品 ID')
  assert((await databaseCount(database, 'works', workID)) === 1, 'PostgreSQL 中未找到新作品记录')

  const activityResponse = await requestJSON('/api/activities', {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      _status: 'published',
      activityStatus: 'registering',
      cover: mediaID,
      featured: false,
      participantCount: 1,
      rules: '完成一次真实上传、绑定、回显和删除验证。',
      slug: `${marker}-activity`,
      sortOrder: 999999,
      summary: '用于验证活动海报在首页和活动列表页的真实回显。',
      title: `活动媒体联调验证 ${marker}`,
    }),
  })
  const activity = activityResponse.doc
  activityID = activity?.id
  assert(activityID, '活动创建成功，但响应中没有活动 ID')
  assert(
    (await databaseCount(database, 'activities', activityID)) === 1,
    'PostgreSQL 中未找到新活动记录',
  )

  const populatedWork = await requestJSON(`/api/works/${workID}?depth=1`)
  assert(populatedWork.cover?.id === mediaID, '作品接口没有正确展开媒体关系')
  assert(populatedWork.cover?.url === media.url, '作品接口中的媒体 URL 与上传结果不一致')

  const populatedActivity = await requestJSON(`/api/activities/${activityID}?depth=1`)
  assert(populatedActivity.cover?.id === mediaID, '活动接口没有正确展开媒体关系')
  assert(populatedActivity.cover?.url === media.url, '活动接口中的媒体 URL 与上传结果不一致')

  const fileURL = new URL(media.url, baseURL).toString()
  const fileResponse = await fetch(fileURL)
  assert(fileResponse.ok, `媒体文件访问失败：${fileResponse.status}`)
  assert(
    fileResponse.headers.get('content-type')?.includes('image/png'),
    '媒体文件类型不是 image/png',
  )

  const parsedFileURL = new URL(fileURL)
  const baseOrigin = new URL(baseURL).origin
  const isPayloadProxy = parsedFileURL.pathname.startsWith('/api/media/file/')
  const imageSourceURL =
    isPayloadProxy || parsedFileURL.origin === baseOrigin
      ? `${parsedFileURL.pathname}${parsedFileURL.search}`
      : parsedFileURL.toString()
  const optimizedImageResponse = await fetch(
    `${baseURL}/_next/image?url=${encodeURIComponent(imageSourceURL)}&w=640&q=75`,
  )
  assert(optimizedImageResponse.ok, `Next Image 优化请求失败：${optimizedImageResponse.status}`)
  assert(
    optimizedImageResponse.headers.get('content-type')?.startsWith('image/'),
    'Next Image 优化响应不是图片',
  )

  const worksPage = await fetch(`${baseURL}/works`)
  const worksHTML = await worksPage.text()
  assert(worksPage.ok, `作品前台返回 ${worksPage.status}`)
  assert(worksHTML.includes(work.title), '作品前台没有渲染新作品标题')
  assert(worksHTML.includes(media.filename), '作品前台没有渲染新作品封面 URL')

  const eventsPage = await fetch(`${baseURL}/events`)
  const eventsHTML = await eventsPage.text()
  assert(eventsPage.ok, `活动前台返回 ${eventsPage.status}`)
  assert(eventsHTML.includes(activity.title), '活动前台没有渲染新活动标题')
  assert(eventsHTML.includes(media.filename), '活动前台没有渲染新活动海报 URL')

  const homePage = await fetch(`${baseURL}/`)
  const homeHTML = await homePage.text()
  assert(homePage.ok, `首页返回 ${homePage.status}`)
  assert(homeHTML.includes(work.title), '首页没有渲染精选作品')
  assert(homeHTML.includes(media.filename), '首页没有渲染对象存储媒体 URL')

  await requestJSON(`/api/works/${workID}`, { method: 'DELETE', headers: authHeaders() })
  workID = undefined
  assert(
    (await databaseCount(database, 'works', work.id)) === 0,
    '删除后 PostgreSQL 仍保留测试作品',
  )

  await requestJSON(`/api/activities/${activityID}`, { method: 'DELETE', headers: authHeaders() })
  const deletedActivityID = activityID
  activityID = undefined
  assert(
    (await databaseCount(database, 'activities', deletedActivityID)) === 0,
    '删除后 PostgreSQL 仍保留测试活动',
  )
  await requestJSON(`/api/media/${mediaID}`, { method: 'DELETE', headers: authHeaders() })
  const deletedMediaID = mediaID
  mediaID = undefined
  assert(
    (await databaseCount(database, 'media', deletedMediaID)) === 0,
    '删除后 PostgreSQL 仍保留测试媒体',
  )
  assert(!(await objectExists(s3, bucket, mediaKey)), '删除后对象存储仍保留测试对象')

  console.log(
    JSON.stringify(
      {
        cleanup: 'passed',
        database: 'passed',
        frontendRender: 'passed',
        mediaAccess: 'passed',
        nextImageOptimization: 'passed',
        objectStorage: 'passed',
        payloadAuth: 'passed',
        uploadAndRelation: 'passed',
      },
      null,
      2,
    ),
  )
} catch (error) {
  await cleanup()
  throw error
} finally {
  if (databaseConnected) await database.end().catch(() => undefined)
}
