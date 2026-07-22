import { getPayload } from 'payload'

import config from '../src/payload.config'
import { seedExperience, validateSeedCredentials } from '../src/seed'

if (process.env.SEED_DEMO_CONTENT !== '1') {
  throw new Error('已拒绝导入演示数据：请通过 npm run db:seed 显式执行一次性 seed。')
}

validateSeedCredentials()

const payload = await getPayload({ config })

try {
  await seedExperience(payload)
} finally {
  await payload.destroy()
}
