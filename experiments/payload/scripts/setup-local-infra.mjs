import 'dotenv/config'

import { CreateBucketCommand, HeadBucketCommand, S3Client } from '@aws-sdk/client-s3'
import pg from 'pg'

const { Client } = pg

const databaseURL = new URL(
  process.env.DATABASE_URL ||
    'postgresql://payload_local:payload_local_dev_password@127.0.0.1:5432/payload_local',
)

const databaseName = databaseURL.pathname.replace(/^\//, '')
const databaseUser = decodeURIComponent(databaseURL.username)
const databasePassword = decodeURIComponent(databaseURL.password)
const databaseHost = databaseURL.hostname
const databasePort = Number(databaseURL.port || 5432)

function quoteIdentifier(value) {
  return `"${value.replaceAll('"', '""')}"`
}

function quoteLiteral(value) {
  return `'${value.replaceAll("'", "''")}'`
}

async function setupPostgres() {
  const admin = new Client({
    database: process.env.PG_ADMIN_DATABASE || 'postgres',
    host: databaseHost,
    port: databasePort,
    user: process.env.PG_ADMIN_USER || process.env.USER,
  })

  await admin.connect()
  try {
    const role = await admin.query('select 1 from pg_roles where rolname = $1', [databaseUser])
    if (role.rowCount === 0) {
      await admin.query(
        `create role ${quoteIdentifier(databaseUser)} login password ${quoteLiteral(databasePassword)}`,
      )
      console.log(`已创建 PostgreSQL 用户：${databaseUser}`)
    } else {
      await admin.query(
        `alter role ${quoteIdentifier(databaseUser)} with login password ${quoteLiteral(databasePassword)}`,
      )
      console.log(`PostgreSQL 用户已就绪：${databaseUser}`)
    }

    const database = await admin.query('select 1 from pg_database where datname = $1', [
      databaseName,
    ])
    if (database.rowCount === 0) {
      await admin.query(
        `create database ${quoteIdentifier(databaseName)} owner ${quoteIdentifier(databaseUser)}`,
      )
      console.log(`已创建 PostgreSQL 数据库：${databaseName}`)
    } else {
      console.log(`PostgreSQL 数据库已就绪：${databaseName}`)
    }
  } finally {
    await admin.end()
  }
}

async function setupMinIO() {
  const bucket = process.env.S3_BUCKET || 'payload-media'
  const client = new S3Client({
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || 'minioadmin',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'minioadmin',
    },
    endpoint: process.env.S3_ENDPOINT || 'http://127.0.0.1:9000',
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
    region: process.env.S3_REGION || 'us-east-1',
  })

  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }))
    console.log(`MinIO 存储桶已就绪：${bucket}`)
  } catch {
    await client.send(new CreateBucketCommand({ Bucket: bucket }))
    console.log(`已创建 MinIO 存储桶：${bucket}`)
  }
}

await setupPostgres()
await setupMinIO()
console.log('Payload 本地 PostgreSQL + MinIO 基础设施已就绪。')
