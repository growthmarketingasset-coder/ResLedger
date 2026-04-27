import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <Icon size={28} style={{ color: 'var(--text-faint)' }} strokeWidth={1.5} />
      </div>
      <h3
        className="text-base font-extrabold mb-2"
        style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}
      >
        {title}
      </h3>
      <p
        className="text-sm font-medium max-w-xs leading-relaxed mb-6"
        style={{ color: 'var(--text-muted)' }}
      >
        {description}
      </p>
      {action}
    </div>
  )
}
