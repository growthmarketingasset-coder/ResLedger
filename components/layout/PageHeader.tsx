import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 border-b pb-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between sm:pb-6" style={{ borderBottomColor: 'var(--border-subtle)' }}>
      <div className="min-w-0">
        <h1 className="heading-tight mb-0.5 text-lg font-extrabold sm:text-xl" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h1>
        {description && (
          <p className="text-sm leading-6 font-medium" style={{ color: 'var(--text-muted)' }}>{description}</p>
        )}
      </div>
      {action && <div className="w-full sm:w-auto sm:shrink-0">{action}</div>}
    </div>
  )
}
