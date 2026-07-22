import { NextResponse } from 'next/server'

import { getJobQuestion } from '@/lib/job-content'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const question = await getJobQuestion(id)

  if (!question) {
    return NextResponse.json({ detail: '题目不存在' }, { status: 404 })
  }

  return NextResponse.json(question)
}
