export function SiteFooter({
  footerText = '© 2026 · 由 AI 创造者社区发起',
  siteName = 'About AI',
}: {
  footerText?: string
  siteName?: string
}) {
  return (
    <footer className="site-footer">
      <div className="site-shell footer-inner">
        <div className="wordmark muted-wordmark">{siteName}</div>
        <p>{footerText}</p>
      </div>
    </footer>
  )
}
