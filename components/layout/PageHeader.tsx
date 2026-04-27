import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8 pb-6" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <div>
        <h1 className="text-xl font-bold tracking-tight mb-0.5" style={{ color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
          {title}
        </h1>
        {description && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
