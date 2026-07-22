import type { ReactNode } from 'react'

import { TeachingNavSidebar } from '@/components/job/TeachingNavSidebar'

import './job.css'

export default function JobLayout({ children }: { children: ReactNode }) {
  return (
    <div className="job-experience">
      <TeachingNavSidebar />
      <main>{children}</main>
    </div>
  )
}
