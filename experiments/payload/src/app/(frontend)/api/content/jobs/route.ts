import { NextResponse } from 'next/server'

import { getJobList } from '@/lib/job-content'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await getJobList())
}
