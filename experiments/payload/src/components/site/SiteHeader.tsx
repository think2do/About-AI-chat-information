import Link from 'next/link'

import { AccountActions } from './AccountActions'

type NavKey = 'contact' | 'events' | 'home' | 'job' | 'learn' | 'works'

const navigation: { href: string; key: NavKey; label: string }[] = [
  { href: '/', key: 'home', label: '首页' },
  { href: '/learn', key: 'learn', label: 'LLM学习平台' },
  { href: '/events', key: 'events', label: '热门活动' },
  { href: '/works', key: 'works', label: '作品展示' },
  { href: '/contact', key: 'contact', label: '联系我们' },
]

export function SiteHeader({
  active,
  siteName = 'About AI',
}: {
  active?: NavKey
  siteName?: string
}) {
  return (
    <header className="site-header">
      <div className="site-shell header-inner">
        <Link className="wordmark" href="/" aria-label={`${siteName} 首页`}>
          {siteName}
        </Link>
        <nav className="primary-nav" aria-label="主导航">
          {navigation.map((item) => (
            <Link
              className={item.key === active ? 'active' : undefined}
              href={item.href}
              key={item.key}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <AccountActions />
      </div>
    </header>
  )
}
