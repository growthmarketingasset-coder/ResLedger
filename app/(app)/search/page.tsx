'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { BookOpen, Link2, FileText, Wrench, Lightbulb } from 'lucide-react'
import { ENTRY_TYPE_LABELS, INDUSTRIES, formatRelative } from '@/lib/utils'

const TYPE_ICONS: Record<string, React.ReactNode> = {
  learning: <BookOpen size={14} />,
  resource: <Link2 size={14} />,
  template: <FileText size={14} />,
  tool: <Wrench size={14} />,
  idea: <Lightbulb size={14} />,
}

const TABLES = [
  { key: 'learnings', type: 'learning', descField: 'summary' },
  { key: 'resources', type: 'resource', descField: 'description' },
  { key: 'templates', type: 'template', descField: 'description' },
  { key: 'tools', type: 'tool', descField: 'description' },
  { key: 'ideas', type: 'idea', descField: 'description' },
] as const

interface SearchResult {
  id: string
  title: string
  description: string | null
  entryType: string
  tableKey: string
  created_at: string
  industry: string | null
  tags: { id: string; name: string; color: string }[]
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [industryFilter, setIndustryFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [tags, setTags] = useState<{ id: string; name: string; color: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    inputRef.current?.focus()
    supabase.from('tags').select('*').order('name').then(({ data }) => { if (data) setTags(data) })
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const doSearch = useCallback(async () => {
    if (!query.trim() && !typeFilter && !industryFilter && !tagFilter) {
      setResults([])
      setSearched(false)
      return
    }
    setLoading(true)
    setSearched(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const allResults: SearchResult[] = []

    const tablesToSearch = typeFilter ? TABLES.filter(t => t.type === typeFilter) : TABLES

    for (const { key, type, descField } of tablesToSearch) {
      let q = supabase.from(key)
        .select(`id, title, ${descField}, created_at, ${key === 'learnings' || key === 'ideas' || key === 'resources' ? 'industry' : 'id'}`)
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .limit(20)

      if (query.trim()) q = (q as any).or(`title.ilike.%${query.trim()}%,${descField}.ilike.%${query.trim()}%`)
      if (industryFilter && (key === 'learnings' || key === 'ideas' || key === 'resources')) {
        q = (q as any).eq('industry', industryFilter)
      }

      const { data } = await q
      if (data) {
        allResults.push(...data.map((d: any) => ({
          id: d.id,
          title: d.title,
          description: d[descField] ?? null,
          entryType: type,
          tableKey: key,
          created_at: d.created_at,
          industry: d.industry ?? null,
          tags: [],
        })))
      }
    }

    const grouped: Record<string, string[]> = {}
    for (const r of allResults) {
      if (!grouped[r.entryType]) grouped[r.entryType] = []
      grouped[r.entryType].push(r.id)
    }

    const tagsMap: Record<string, { id: string; name: string; color: string }[]> = {}
    for (const [etype, ids] of Object.entries(grouped)) {
      const { data: et } = await supabase.from('entry_tags')
        .select('entry_id, tags(id, name, color)')
        .eq('entry_type', etype)
        .in('entry_id', ids)
      et?.forEach((e: any) => {
        if (!tagsMap[e.entry_id]) tagsMap[e.entry_id] = []
        if (e.tags) tagsMap[e.entry_id].push(e.tags)
      })
    }

    let finalResults = allResults.map(r => ({ ...r, tags: tagsMap[r.id] ?? [] }))
    if (tagFilter) finalResults = finalResults.filter(r => r.tags.some(t => t.id === tagFilter))

    finalResults.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setResults(finalResults)
    setLoading(false)
  }, [query, typeFilter, industryFilter, tagFilter])

  useEffect(() => {
    const timer = setTimeout(doSearch, 300)
    return () => clearTimeout(timer)
  }, [doSearch])

  const selectStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: '12px',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: '500',
    padding: '10px 12px',
    outline: 'none',
    fontFamily: 'inherit',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-xs)',
  } as React.CSSProperties

  const hasFilters = !!typeFilter || !!industryFilter || !!tagFilter

  return (
    <div className="flex flex-col min-h-full">
      <header
        className="sticky top-0 z-10 px-4 sm:px-6 py-4 sm:py-5"
        style={{ background: 'rgba(17,21,29,0.88)', backdropFilter: 'blur(14px)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
            <div>
              <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Search</h1>
              <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Search across learnings, resources, templates, tools, and ideas.
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: 'rgba(124,108,242,0.10)', color: 'var(--accent-400)' }}>
              Ctrl K
            </span>
          </div>

          <div className="relative mb-3">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search titles, descriptions, and sources"
              className="w-full pl-11 pr-12 py-3 sm:py-3.5 text-sm rounded-xl border transition-all duration-150"
              style={{
                background: 'var(--bg-card)',
                borderColor: query ? 'var(--border-focus)' : 'var(--border-subtle)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontFamily: 'inherit',
                boxShadow: query ? '0 0 0 3px rgba(124,108,242,0.12)' : 'var(--shadow-xs)',
              }}
            />
            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--border-subtle)', borderTopColor: 'var(--accent-500)' }} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={selectStyle}>
              <option value="">All types</option>
              {TABLES.map(t => <option key={t.type} value={t.type}>{ENTRY_TYPE_LABELS[t.type]}</option>)}
            </select>
            <select value={industryFilter} onChange={e => setIndustryFilter(e.target.value)} style={selectStyle}>
              <option value="">All industries</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            <select value={tagFilter} onChange={e => setTagFilter(e.target.value)} style={selectStyle}>
              <option value="">All tags</option>
              {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {hasFilters ? (
              <button
                onClick={() => { setTypeFilter(''); setIndustryFilter(''); setTagFilter('') }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'rgba(124,108,242,0.10)', color: 'var(--accent-400)', border: '1px solid rgba(124,108,242,0.14)' }}
              >
                Clear filters
              </button>
            ) : (
              <div className="hidden xl:block" />
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 sm:px-6 py-5 sm:py-6 max-w-5xl w-full mx-auto">
        {!searched && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'var(--accent-soft)', border: '1px solid rgba(124,108,242,0.14)' }}>
              <Search size={22} style={{ color: 'var(--accent-500)' }} />
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Search your knowledge base</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Start typing to search across all entry types.</p>
          </div>
        )}

        {searched && results.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <Search size={20} style={{ color: 'var(--text-faint)' }} />
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No results found</p>
            <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>Try broader keywords or remove one of the filters.</p>
          </div>
        )}

        {results.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold mb-4 uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted)' }}>
              {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-2.5">
              {results.map(result => {
                const TYPE_PILL: Record<string, { bg: string; text: string; dot: string }> = {
                  learning: { bg: 'rgba(124,108,242,0.10)', text: '#d7d2ff', dot: '#8f81f6' },
                  resource: { bg: 'rgba(124,108,242,0.14)', text: '#f3f1ff', dot: '#c2bbff' },
                  template: { bg: 'rgba(124,108,242,0.08)', text: '#c7c0ff', dot: '#7c6cf2' },
                  tool: { bg: 'rgba(124,108,242,0.10)', text: '#d7d2ff', dot: '#aaa1fb' },
                  idea: { bg: 'rgba(124,108,242,0.08)', text: '#c7c0ff', dot: '#9488f6' },
                }
                const pill = TYPE_PILL[result.entryType] || { bg: 'var(--bg-hover)', text: 'var(--text-secondary)', dot: 'var(--text-faint)' }

                return (
                  <Link key={`${result.entryType}-${result.id}`} href={`/${result.tableKey}/${result.id}`}>
                    <div
                      className="group rounded-2xl p-4 transition-all duration-150 cursor-pointer"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'var(--shadow-hover)'; el.style.borderColor = 'var(--border-default)'; el.style.transform = 'translateY(-1px)' }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'var(--shadow-sm)'; el.style.borderColor = 'var(--border-subtle)'; el.style.transform = 'translateY(0)' }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl shrink-0 mt-0.5" style={{ background: pill.bg, border: '1px solid rgba(124,108,242,0.12)' }}>
                          <span style={{ color: pill.dot }}>{TYPE_ICONS[result.entryType]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: pill.bg, color: pill.text }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: pill.dot }} />
                              {ENTRY_TYPE_LABELS[result.entryType]}
                            </span>
                            {result.industry && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                                {result.industry}
                              </span>
                            )}
                            <span className="text-xs sm:ml-auto" style={{ color: 'var(--text-muted)' }}>{formatRelative(result.created_at)}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold transition-colors line-clamp-2 sm:line-clamp-1 group-hover:text-[var(--accent-400)]" style={{ color: 'var(--text-primary)' }}>
                                {result.title}
                              </p>
                              {result.description && (
                                <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{result.description}</p>
                              )}
                              {result.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {result.tags.slice(0, 4).map(tag => (
                                    <span key={tag.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${tag.color}18`, color: tag.color, border: `1px solid ${tag.color}25` }}>
                                      {tag.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <ArrowRight size={14} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 hidden sm:block" style={{ color: 'var(--accent-500)' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
