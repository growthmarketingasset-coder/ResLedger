import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  dense?: boolean
}

export default function EmptyState({ icon: Icon, title, description, action, dense = false }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center animate-fade-in ${dense ? 'py-8' : 'py-20'}`}>
      <div
        className={`${dense ? 'w-12 h-12 mb-3' : 'w-16 h-16 mb-5'} rounded-2xl flex items-center justify-center`}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <Icon size={dense ? 20 : 28} style={{ color: 'var(--text-faint)' }} strokeWidth={1.5} />
      </div>
      <h3
        className={`${dense ? 'text-sm mb-1' : 'text-base mb-2'} font-extrabold`}
        style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}
      >
        {title}
      </h3>
      <p
        className={`${dense ? 'text-xs mb-3' : 'text-sm mb-6'} font-medium max-w-xs leading-relaxed`}
        style={{ color: 'var(--text-muted)' }}
      >
        {description}
      </p>
      {action}
    </div>
  )
}
