'use client'

import { FormEvent, useState } from 'react'

type Mode = 'login' | 'register'

function responseMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback
  const record = body as { errors?: Array<{ message?: string }>; message?: string }
  return record.errors?.[0]?.message || record.message || fallback
}

type LoginPanelProps = {
  demoEmail?: string
  demoPassword?: string
  returnUrl?: string
}

export function LoginPanel({
  demoEmail = 'member@example.com',
  demoPassword = 'Member@123456',
  returnUrl = '/me',
}: LoginPanelProps) {
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState(demoEmail)
  const [password, setPassword] = useState(demoPassword)
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [message, setMessage] = useState('使用普通用户测试账号，可体验登录、活动报名和个人中心。')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (mode === 'register' && password !== passwordConfirm) {
      setMessage('两次输入的密码不一致。')
      return
    }
    if (mode === 'register' && !accepted) {
      setMessage('请先确认同意账号使用规则。')
      return
    }
    setSubmitting(true)
    setMessage(mode === 'login' ? '正在登录…' : '正在创建账号…')
    const response = await fetch(mode === 'login' ? '/api/users/login' : '/api/users', {
      body: JSON.stringify(mode === 'login' ? { email, password } : { email, name, password }),
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    const body = (await response.json().catch(() => null)) as
      | { user?: { role?: string } }
      | null
    if (response.ok) {
      if (mode === 'register') {
        setMode('login')
        setPasswordConfirm('')
        setAccepted(false)
        setSubmitting(false)
        setMessage('注册成功，请使用刚才的邮箱和密码登录。')
        return
      }
      window.location.href = body?.user?.role === 'member' ? returnUrl : '/admin'
      return
    }
    setSubmitting(false)
    setMessage(responseMessage(body, mode === 'login' ? '登录失败，请检查邮箱和密码。' : '注册失败，请稍后重试。'))
  }

  return (
    <form className="login-panel" onSubmit={submit}>
      <h1>登录 / 注册</h1>
      <p aria-live="polite">{message}</p>
      <div className="login-tabs">
        <button
          className={mode === 'login' ? 'active' : undefined}
          onClick={() => setMode('login')}
          type="button"
        >
          登录
        </button>
        <button
          className={mode === 'register' ? 'active' : undefined}
          onClick={() => {
            setMode('register')
            setEmail('')
            setPassword('')
            setMessage('注册普通用户账号后，可以报名活动并查看个人记录。')
          }}
          type="button"
        >
          注册
        </button>
      </div>
      {mode === 'register' ? (
        <label>
          姓名
          <input
            autoComplete="name"
            onChange={(event) => setName(event.target.value)}
            required
            type="text"
            value={name}
          />
        </label>
      ) : null}
      <label>
        邮箱
        <input
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>
      <label>
        密码
        <input
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </label>
      {mode === 'register' ? (
        <>
          <label>
            确认密码
            <input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              required
              type="password"
              value={passwordConfirm}
            />
          </label>
          <label className="login-consent">
            <input
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              type="checkbox"
            />
            <span>我同意仅将账号用于活动报名和个人记录管理。</span>
          </label>
        </>
      ) : null}
      <button className="black-button" disabled={submitting} type="submit">
        {submitting
          ? mode === 'login'
            ? '登录中…'
            : '注册中…'
          : mode === 'login'
            ? '登录并进入个人中心'
            : '创建普通用户账号'}
      </button>
    </form>
  )
}
