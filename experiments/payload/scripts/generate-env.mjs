import { randomBytes } from 'node:crypto'
import { existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const envPath = resolve(process.cwd(), '.env')

if (existsSync(envPath)) {
  console.log('.env 已存在，未覆盖。')
  process.exit(0)
}

const secret = randomBytes(32).toString('hex')
const contents = [
  'DATABASE_URL=postgresql://payload_local:payload_local_dev_password@127.0.0.1:5432/payload_local',
  `PAYLOAD_SECRET=${secret}`,
  'SEED_DEMO_CONTENT=0',
  'NEXT_PUBLIC_SERVER_URL=http://localhost:3020',
  'S3_BUCKET=payload-media',
  'S3_REGION=us-east-1',
  'S3_ENDPOINT=http://127.0.0.1:9000',
  'S3_ACCESS_KEY_ID=minioadmin',
  'S3_SECRET_ACCESS_KEY=minioadmin',
  'S3_FORCE_PATH_STYLE=true',
  'S3_PUBLIC_URL=',
  '',
].join('\n')

writeFileSync(envPath, contents, { mode: 0o600 })
console.log('已生成本地 .env（随机 Payload secret，文件已被 gitignore）。')
