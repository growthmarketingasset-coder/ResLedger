interface StatsCardProps {
  label: string
  value: number
  icon: React.ReactNode
  gradient?: string
}

export default function StatsCard({ label, value, icon, gradient }: StatsCardProps) {
  return (
    <div
      className="interactive-card relative rounded-2xl p-3 sm:p-3.5 flex h-[112px] sm:h-[124px] flex-col items-center text-center transition-all duration-150 cursor-pointer overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center mb-2 shrink-0"
        style={{ background: gradient || 'var(--grad-accent-soft)', border: '1px solid rgba(124,108,242,0.16)' }}
      >
        {icon}
      </div>
      <p
        className="text-base sm:text-lg font-extrabold tabular-nums leading-none mb-1"
        style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}
      >
        {value}
      </p>
      <p
        className="line-clamp-2 min-h-[1.75rem] text-[11px] sm:text-xs font-semibold leading-tight"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </p>
    </div>
  )
}
