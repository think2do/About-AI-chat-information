import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { zh } from '@payloadcms/translations/languages/zh'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Activities } from './collections/Activities'
import { ActivityRegistrations } from './collections/ActivityRegistrations'
import { ContentCategories } from './collections/ContentCategories'
import { ContentItems } from './collections/ContentItems'
import { ContentModules } from './collections/ContentModules'
import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { Works } from './collections/Works'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const isProduction = process.env.NODE_ENV === 'production'
const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3020'
const mediaPrefix = 'media'

function readEnvironment(name: string, localFallback: string) {
  const value = process.env[name]?.trim()
  if (value) return value

  if (isProduction) {
    throw new Error(`生产环境缺少必填环境变量：${name}`)
  }

  return localFallback
}

const databaseURL = readEnvironment(
  'DATABASE_URL',
  'postgresql://payload_local:payload_local_dev_password@127.0.0.1:5432/payload_local',
)
const payloadSecret = readEnvironment('PAYLOAD_SECRET', 'local-development-only-change-me')
const s3Bucket = readEnvironment('S3_BUCKET', 'payload-media')
const s3Region = readEnvironment('S3_REGION', 'us-east-1')
const s3Endpoint = readEnvironment('S3_ENDPOINT', 'http://127.0.0.1:9000')
const s3AccessKeyID = readEnvironment('S3_ACCESS_KEY_ID', 'minioadmin')
const s3SecretAccessKey = readEnvironment('S3_SECRET_ACCESS_KEY', 'minioadmin')
const s3PublicURL = readEnvironment('S3_PUBLIC_URL', '').replace(/\/+$/, '')
const allowedOrigins = Array.from(
  new Set([serverURL, 'http://localhost:3020', 'http://127.0.0.1:3020']),
)

function encodeObjectPath(...parts: Array<string | undefined>) {
  return parts
    .flatMap((part) => part?.split('/').filter(Boolean) || [])
    .map((part) => encodeURIComponent(part))
    .join('/')
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      title: '且曼教学内容工作台',
      description: 'Payload CMS 真实体验实例',
    },
  },
  collections: [
    Users,
    Activities,
    ActivityRegistrations,
    Works,
    ContentModules,
    ContentCategories,
    ContentItems,
    Media,
  ],
  cors: allowedOrigins,
  csrf: allowedOrigins,
  db: postgresAdapter({
    idType: 'uuid',
    pool: {
      connectionString: databaseURL,
      // Vercel serverless functions share Supabase's transaction pooler. Keep each
      // function instance small so concurrent cold starts do not exhaust the pool.
      max: 3,
    },
    push: false,
  }),
  editor: lexicalEditor(),
  i18n: {
    fallbackLanguage: 'zh',
    supportedLanguages: { zh },
  },
  globals: [SiteSettings],
  plugins: [
    s3Storage({
      bucket: s3Bucket,
      collections: {
        media: {
          prefix: mediaPrefix,
          ...(s3PublicURL
            ? {
                generateFileURL: ({ filename, prefix }: { filename: string; prefix?: string }) =>
                  `${s3PublicURL}/${encodeObjectPath(prefix || mediaPrefix, filename)}`,
              }
            : {}),
        },
      },
      config: {
        credentials: {
          accessKeyId: s3AccessKeyID,
          secretAccessKey: s3SecretAccessKey,
        },
        endpoint: s3Endpoint,
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
        region: s3Region,
      },
    }),
  ],
  secret: payloadSecret,
  serverURL,
  sharp,
  telemetry: false,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
})
