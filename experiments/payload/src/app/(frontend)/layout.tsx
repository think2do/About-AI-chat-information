import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import './styles.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'About AI · AI 探索者社区',
  description: '一起学习 AI，一起把灵感做成作品。',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const themeInit = `!function(){try{var k='teaching_tool_theme',v=localStorage.getItem(k);if(v!=='light'&&v!=='dark'){v=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=v;}catch(e){}}()`

  return (
    <html data-theme="light" lang="zh-CN" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        {children}
      </body>
    </html>
  )
}
