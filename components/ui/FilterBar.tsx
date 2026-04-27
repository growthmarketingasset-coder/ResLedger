'use client'

import { Search, X } from 'lucide-react'
import { INDUSTRIES } from '@/lib/utils'

interface FilterBarProps {
  search: string; onSearchChange: (v: string) => void
  industryFilter: string; onIndustryChange: (v: string) => void
  tagFilter: string; onTagChange: (v: string) => void
  tags: { id: string; name: string; color: string }[]
  extras?: React.ReactNode
}

export default function FilterBar({
  search, onSearchChange, industryFilter, onIndustryChange,
  tagFilter, onTagChange, tags, extras
}: FilterBarProps) {
  const hasFilters = !!search || !!industryFilter || !!tagFilter

  const selectStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: '12px',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: '500',
    padding: '8px 12px',
    outline: 'none',
    fontFamily: 'inherit',
    cursor: 'pointer',
    letterSpacing: '-0.01em',
    boxShadow: 'var(--shadow-xs)',
  } as React.CSSProperties

  return (
    <div className="flex items-center gap-2.5 flex-wrap mb-5">
      <div className="relative flex-1 min-w-[220px] max-w-sm">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
        <input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search titles and descriptions"
          className="w-full pl-9 pr-10 py-2.5 text-sm font-medium rounded-xl border transition-all"
          style={{
            background: 'var(--bg-card)',
            borderColor: search ? 'var(--border-focus)' : 'var(--border-default)',
            color: 'var(--text-primary)',
            boxShadow: search ? '0 0 0 3px rgba(124,108,242,0.12)' : 'var(--shadow-xs)',
            letterSpacing: '-0.01em',
          }}
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md transition-all"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      <select value={industryFilter} onChange={e => onIndustryChange(e.target.value)} style={selectStyle}>
        <option value="">All industries</option>
        {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
      </select>

      {tags.length > 0 && (
        <select value={tagFilter} onChange={e => onTagChange(e.target.value)} style={selectStyle}>
          <option value="">All tags</option>
          {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      )}

      {extras}

      {hasFilters && (
        <button
          onClick={() => { onSearchChange(''); onIndustryChange(''); onTagChange('') }}
          className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all"
          style={{ background: 'rgba(124,108,242,0.10)', color: 'var(--accent-400)', border: '1px solid rgba(124,108,242,0.14)' }}
        >
          <X size={12} /> Clear
        </button>
      )}
    </div>
  )
}
