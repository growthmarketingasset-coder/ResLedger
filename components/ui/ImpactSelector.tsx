'use client'

import { IMPACT_CONFIG, IMPACT_LEVELS } from '@/lib/utils'

interface ImpactSelectorProps {
  value: string
  onChange: (v: string) => void
}

export default function ImpactSelector({ value, onChange }: ImpactSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {IMPACT_LEVELS.map(level => {
        const cfg = IMPACT_CONFIG[level]
        const active = value === level
        return (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
            style={{
              background: active ? cfg.bg : '#f8fafc',
              color: active ? cfg.color : '#94a3b8',
              border: `1.5px solid ${active ? cfg.border : '#e8edf2'}`,
              boxShadow: active ? `0 0 0 3px ${cfg.border}50` : 'none',
            }}
          >
            {cfg.label}
          </button>
        )
      })}
    </div>
  )
}
