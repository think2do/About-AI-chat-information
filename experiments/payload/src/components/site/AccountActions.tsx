'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type SessionUser = {
  name?: string
  role?: 'admin' | 'editor' | 'member'
}

export function AccountActions() {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/users/me', { credentials: 'include' })
      .then(async (response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (active) setUser(body?.user || null)
      })
      .catch(() => {
        if (active) setUser(null)
      })
    return () => {
      active = false
    }
  }, [])

  async function logout() {
    setLoggingOut(true)
    const response = await fetch('/api/users/logout', {
      credentials: 'include',
      method: 'POST',
    })
    if (response.ok) window.location.href = '/'
    else setLoggingOut(false)
  }

  if (user?.role === 'member') {
    return (
      <div className="header-account-actions">
        <Link className="black-button header-login" href="/me">
          个人中心
        </Link>
        <button className="header-logout" disabled={loggingOut} onClick={logout} type="button">
          {loggingOut ? '退出中…' : '退出登录'}
        </button>
      </div>
    )
  }

  if (user?.role === 'admin' || user?.role === 'editor') {
    return (
      <div className="header-account-actions">
        <Link className="black-button header-login" href="/admin">
          进入后台
        </Link>
        <button className="header-logout" disabled={loggingOut} onClick={logout} type="button">
          {loggingOut ? '退出中…' : '退出登录'}
        </button>
      </div>
    )
  }

  return (
    <Link className="black-button header-login" href="/auth">
      {user === undefined ? '账号' : '登录 / 注册'}
    </Link>
  )
}
