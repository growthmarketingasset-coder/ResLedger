import type { LucideIcon } from 'lucide-react'

interface SectionCardHeaderProps {
  icon: LucideIcon
  title: string
  extra?: React.ReactNode
}

export default function SectionCardHeader({ icon: Icon, title, extra }: SectionCardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: 'var(--accent-soft)' }}>
          <Icon size={14} style={{ color: 'var(--accent-500)' }} />
        </div>
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      </div>
      {extra}
    </div>
  )
}

