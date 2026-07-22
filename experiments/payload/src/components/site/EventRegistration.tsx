'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'

type Member = {
  email?: string
  name?: string
  role?: 'admin' | 'editor' | 'member'
}

type Registration = {
  id: number | string
  status: 'cancelled' | 'registered'
}

export function EventRegistration({
  activityID,
  activitySlug,
  activityStatus,
  capacity,
  externalRegistrationUrl,
  participantCount,
  registrationMode,
}: {
  activityID: number | string
  activitySlug: string
  activityStatus: string
  capacity?: null | number
  externalRegistrationUrl?: null | string
  participantCount: number
  registrationMode: 'closed' | 'external' | 'internal'
}) {
  const router = useRouter()
  const [user, setUser] = useState<Member | null | undefined>(undefined)
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactMobile, setContactMobile] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    let active = true
    fetch('/api/users/me', { credentials: 'include' })
      .then(async (response) => (response.ok ? response.json() : null))
      .then(async (body) => {
        if (!active) return
        const sessionUser = (body?.user || null) as Member | null
        setUser(sessionUser)
        if (sessionUser?.role !== 'member') return
        setContactName(sessionUser.name || '')
        setContactEmail(sessionUser.email || '')
        const response = await fetch(
          `/api/member/registrations?activityId=${encodeURIComponent(String(activityID))}`,
          { credentials: 'include' },
        )
        if (!response.ok || !active) return
        const registrations = (await response.json()) as { docs?: Registration[] }
        setRegistration(registrations.docs?.[0] || null)
      })
      .catch(() => {
        if (active) setUser(null)
      })
    return () => {
      active = false
    }
  }, [activityID])

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setMessage('正在提交报名…')
    const response = await fetch('/api/member/registrations', {
      body: JSON.stringify({
        activityId: activityID,
        contactEmail,
        contactMobile,
        contactName,
        note,
      }),
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    const body = (await response.json().catch(() => null)) as
      | { doc?: Registration; message?: string }
      | null
    setSubmitting(false)
    setMessage(body?.message || (response.ok ? '报名成功。' : '报名失败，请稍后重试。'))
    if (response.ok && body?.doc) {
      setRegistration(body.doc)
      setShowForm(false)
      router.refresh()
    }
  }

  if (registration?.status === 'registered') {
    return (
      <div className="event-registration-result">
        <strong>已报名</strong>
        <Link href="/me">前往个人中心 →</Link>
      </div>
    )
  }

  if (registrationMode === 'external') {
    return externalRegistrationUrl ? (
      <a
        className="black-button event-register-button"
        href={externalRegistrationUrl}
        rel="noreferrer"
        target="_blank"
      >
        前往外部报名
      </a>
    ) : (
      <button className="outline-button event-register-button" disabled type="button">
        外部报名地址待补充
      </button>
    )
  }

  const open = activityStatus === 'registering' || activityStatus === 'open'
  const full = capacity ? participantCount >= capacity : false
  if (registrationMode === 'closed' || !open || full) {
    return (
      <button className="outline-button event-register-button" disabled type="button">
        {full ? '报名已满' : registrationMode === 'closed' ? '不开放报名' : '当前未开放报名'}
      </button>
    )
  }

  if (user === undefined) {
    return (
      <button className="outline-button event-register-button" disabled type="button">
        正在读取报名状态…
      </button>
    )
  }

  if (!user) {
    return (
      <Link
        className="black-button event-register-button"
        href={`/auth?returnUrl=${encodeURIComponent(`/events#${activitySlug}`)}`}
      >
        登录后报名
      </Link>
    )
  }

  if (user.role !== 'member') {
    return <p className="event-register-note">请退出后台账号后，使用普通用户账号报名。</p>
  }

  return (
    <div className="event-registration">
      {!showForm ? (
        <button
          className="black-button event-register-button"
          onClick={() => setShowForm(true)}
          type="button"
        >
          {registration?.status === 'cancelled' ? '重新报名' : '立即报名'}
        </button>
      ) : (
        <form className="event-registration-form" onSubmit={register}>
          <label>
            联系人姓名
            <input
              onChange={(event) => setContactName(event.target.value)}
              required
              value={contactName}
            />
          </label>
          <label>
            联系邮箱
            <input
              onChange={(event) => setContactEmail(event.target.value)}
              required
              type="email"
              value={contactEmail}
            />
          </label>
          <label>
            联系电话（选填）
            <input
              onChange={(event) => setContactMobile(event.target.value)}
              value={contactMobile}
            />
          </label>
          <label>
            备注（选填）
            <textarea maxLength={500} onChange={(event) => setNote(event.target.value)} value={note} />
          </label>
          <div className="event-registration-actions">
            <button className="black-button" disabled={submitting} type="submit">
              {submitting ? '提交中…' : '确认报名'}
            </button>
            <button className="outline-button" onClick={() => setShowForm(false)} type="button">
              取消
            </button>
          </div>
        </form>
      )}
      {message ? <p className="event-register-note">{message}</p> : null}
    </div>
  )
}
