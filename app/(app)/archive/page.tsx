'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageShell from '@/components/layout/PageShell'
import EmptyState from '@/components/ui/EmptyState'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EntryCard from '@/components/entries/EntryCard'
import { Archive, Search, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { ENTRY_TYPE_LABELS } from '@/lib/utils'

const TABLES = [
  { key: 'learnings', type: 'learning' },
  { key: 'resources', type: 'resource' },
  { key: 'templates', type: 'template' },
  { key: 'tools', type: 'tool' },
  { key: 'ideas', type: 'idea' },
] as const

export default function ArchivePage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const supabase = createClient()

  const fetchItems = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const allItems: any[] = []

    for (const { key, type } of TABLES) {
      if (typeFilter && typeFilter !== type) continue
      const { data } = await supabase
        .from(key)
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .eq('is_archived', true)
        .order('updated_at', { ascending: false })
      if (data) allItems.push(...data.map(d => ({ ...d, entryType: type, tableKey: key })))
    }

    let results = allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    if (search) {
      const s = search.toLowerCase()
      results = results.filter(r => r.title.toLowerCase().includes(s))
    }
    setItems(results)
    setLoading(false)
  }, [search, typeFilter])

  useEffect(() => { fetchItems() }, [fetchItems])

  const handleRestore = async (id: string, tableKey: string) => {
    await supabase.from(tableKey).update({ is_archived: false }).eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
    toast.success('Restored!')
  }

  const handleDelete = async (id: string, tableKey: string) => {
        await supabase.from(tableKey).delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
    toast.success('Permanently deleted')
  }

  return (
    <PageShell
      title="Archive"
      description={`${items.length} archived item${items.length !== 1 ? 's' : ''}`}
    >
      <div className="flex items-center gap-2 mb-5 p-3 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search archived items..." 
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border transition-all duration-150"
            style={{ background: 'var(--bg-base)', borderColor: 'transparent', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit' }}
            onFocus={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#86efac'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.12)' }}
            onBlur={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>
        <div style={{ width: '1px', height: '20px', background: '#e8edf2', flexShrink: 0 }} />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '13px', padding: '8px 12px', outline: 'none', fontFamily: 'inherit', fontWeight: '500', cursor: 'pointer' }}>
          <option value="">All types</option>
          {TABLES.map(t => <option key={t.type} value={t.type}>{ENTRY_TYPE_LABELS[t.type]}</option>)}
        </select>
        {(search || typeFilter) && (
          <button onClick={() => { setSearch(''); setTypeFilter('') }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3' }}>
            <X size={11} /> Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="rounded-2xl animate-pulse h-20" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }} />)}</div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="Archive is empty"
          description="Items you archive will appear here. You can restore them any time."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <EntryCard
              key={`${item.entryType}-${item.id}`}
              id={item.id}
              title={item.title}
              entryType={item.entryType}
              isPinned={false}
              isArchived={true}
              createdAt={item.created_at}
              href={`/${item.tableKey}/${item.id}`}
              onRestore={() => handleRestore(item.id, item.tableKey)}
              onDelete={() => handleDelete(item.id, item.tableKey)}
            />
          ))}
        </div>
      )}
    </PageShell>
  )
}
