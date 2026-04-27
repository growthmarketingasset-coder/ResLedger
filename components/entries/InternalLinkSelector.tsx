'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, X, Plus } from 'lucide-react'
import { ENTRY_TYPE_LABELS } from '@/lib/utils'

interface LinkedEntry { id: string; title: string; type: string }

interface InternalLinkSelectorProps {
  currentId: string
  currentType: string
  links: LinkedEntry[]
  onChange: (links: LinkedEntry[]) => void
}

const TABLES: Record<string, string> = {
  learning: 'learnings', resource: 'resources', template: 'templates',
  tool: 'tools', idea: 'ideas', ai_strategy: 'ai_strategies',
  workshop_video: 'workshop_videos', case_study: 'case_studies',
}

export default function InternalLinkSelector({ currentId, currentType, links, onChange }: InternalLinkSelectorProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LinkedEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const search = async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const linkedIds = links.map(l => l.id)
    const allResults: LinkedEntry[] = []
    await Promise.all(
      Object.entries(TABLES).map(async ([type, table]) => {
        if (type === currentType) return
        const { data } = await supabase.from(table).select('id, title')
          .eq('user_id', user.id).ilike('title', `%${q}%`).limit(3)
        data?.forEach(row => {
          if (row.id !== currentId && !linkedIds.includes(row.id)) {
            allResults.push({ id: row.id, title: row.title, type })
          }
        })
      })
    )
    setResults(allResults.slice(0, 8))
    setLoading(false)
  }

  const addLink = (entry: LinkedEntry) => {
    onChange([...links, entry])
    setQuery(''); setResults([]); setOpen(false)
  }
  const removeLink = (id: string) => onChange(links.filter(l => l.id !== id))

  return (
    <div>
      {/* Existing links */}
      {links.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {links.map(link => (
            <span key={`${link.type}-${link.id}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                {ENTRY_TYPE_LABELS[link.type] || link.type}
              </span>
              {link.title}
              <button onClick={() => removeLink(link.id)} className="hover:opacity-60 transition-opacity ml-0.5">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search box */}
      <div className="relative" ref={ref}>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all"
          style={{ background: 'var(--bg-input)', borderColor: open ? 'var(--border-focus)' : 'var(--border-default)', boxShadow: open ? '0 0 0 3px rgba(74,222,128,0.12)' : 'none' }}>
          <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            value={query}
            placeholder="Search to link an entry…"
            className="flex-1 text-sm font-medium bg-transparent outline-none"
            style={{ color: 'var(--text-primary)' }}
            onChange={e => { setQuery(e.target.value); search(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            onKeyDown={e => e.stopPropagation()}
          />
        </div>

        {open && (query || results.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl overflow-hidden animate-scale-in"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-drop)' }}>
            {loading && (
              <p className="text-xs text-center py-4 font-semibold" style={{ color: 'var(--text-muted)' }}>Searching…</p>
            )}
            {!loading && results.length === 0 && query && (
              <p className="text-xs text-center py-4 font-semibold" style={{ color: 'var(--text-muted)' }}>No entries found</p>
            )}
            {results.map(entry => (
              <button key={`${entry.type}-${entry.id}`}
                onClick={() => addLink(entry)}
                className="flex items-center gap-3 w-full px-3.5 py-2.5 text-left transition-all"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                  {ENTRY_TYPE_LABELS[entry.type] || entry.type}
                </span>
                <span className="text-sm font-medium truncate">{entry.title}</span>
                <Plus size={13} style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: 'auto' }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
