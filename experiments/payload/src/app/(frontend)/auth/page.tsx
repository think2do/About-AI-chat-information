import config from '@payload-config'
import type { Metadata } from 'next'
import { getPayload } from 'payload'

import { LoginPanel } from '@/components/site/LoginPanel'
import { SiteHeader } from '@/components/site/SiteHeader'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: '登录 / 注册 · About AI',
}

function safeReturnUrl(value: string | string[] | undefined): string {
  const candidate = Array.isArray(value) ? value[0] : value
  return candidate?.startsWith('/') && !candidate.startsWith('//') ? candidate : '/me'
}

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ returnUrl?: string | string[] }>
}) {
  const payload = await getPayload({ config })
  const [settings, params] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', overrideAccess: false }),
    searchParams,
  ])
  return (
    <>
      <SiteHeader siteName={settings.siteName || undefined} />
      <main className="login-page">
        <LoginPanel
          demoEmail={process.env.SEED_MEMBER_EMAIL}
          demoPassword={process.env.SEED_MEMBER_PASSWORD}
          returnUrl={safeReturnUrl(params.returnUrl)}
        />
      </main>
    </>
  )
}
