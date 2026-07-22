'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function RegistrationCancelButton({ registrationID }: { registrationID: number | string }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function cancel() {
    if (!window.confirm('确认取消这次活动报名吗？')) return
    setSubmitting(true)
    setMessage('')
    const response = await fetch(`/api/member/registrations/${registrationID}/cancel`, {
      credentials: 'include',
      method: 'POST',
    })
    const body = (await response.json().catch(() => null)) as { message?: string } | null
    if (response.ok) {
      router.refresh()
      return
    }
    setSubmitting(false)
    setMessage(body?.message || '取消失败，请稍后重试。')
  }

  return (
    <div className="registration-cancel">
      <button className="outline-button" disabled={submitting} onClick={cancel} type="button">
        {submitting ? '取消中…' : '取消报名'}
      </button>
      {message ? <span>{message}</span> : null}
    </div>
  )
}
