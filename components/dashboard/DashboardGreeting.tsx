'use client'

import { useEffect, useState } from 'react'
import QuickAddButton from '@/components/ui/QuickAddButton'
import { AlertTriangle } from 'lucide-react'

interface DashboardGreetingProps {
  emailName: string
  total: number
  notReviewedCount: number
}

export default function DashboardGreeting({ emailName, total, notReviewedCount }: DashboardGreetingProps) {
  const [greeting, setGreeting] = useState('Welcome')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
          {greeting}, <span className="capitalize">{emailName}</span>
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {total === 0
            ? 'Start building your knowledge base today.'
            : <>Your knowledge base has <strong style={{ color: 'var(--accent-500)' }}>{total} entries</strong></>
          }
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
        {notReviewedCount > 0 && (
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(124,108,242,0.12)', color: 'var(--accent-400)', border: '1px solid rgba(124,108,242,0.16)' }}
          >
            <AlertTriangle size={13} />
            {notReviewedCount} to review
          </div>
        )}
        <QuickAddButton />
      </div>
    </div>
  )
}
