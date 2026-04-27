'use client'

import SectionChart from '@/components/ui/SectionChart'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageShell from '@/components/layout/PageShell'
import EntryCard from '@/components/entries/EntryCard'
import DraggableGrid from '@/components/ui/DraggableGrid'
import FilterBar from '@/components/ui/FilterBar'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import IdeaForm from './IdeaForm'
import { Lightbulb, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { IDEA_STATUSES } from '@/lib/utils'

export default function IdeasPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [industryFilter, setIndustryFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [tags, setTags] = useState<any[]>([])
  const supabase = createClient()

  const fetchItems = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    let q = supabase.from('ideas').select('*').eq('user_id', user.id).eq('is_archived', false)
      .order('is_pinned', { ascending: false }).order('created_at', { ascending: false })
    if (industryFilter) q = q.eq('industry', industryFilter)
    if (statusFilter) q = q.eq('status', statusFilter)
    const { data } = await q
    const ids = data?.map(d => d.id) ?? []
    let tagsMap: Record<string, any[]> = {}
    if (ids.length > 0) {
      const { data: et } = await supabase.from('entry_tags').select('entry_id, tags(id, name, color)')
        .eq('entry_type', 'idea').in('entry_id', ids)
      et?.forEach((e: any) => { if (!tagsMap[e.entry_id]) tagsMap[e.entry_id] = []; if (e.tags) tagsMap[e.entry_id].push(e.tags) })
    }
    let results = (data ?? []).map(d => ({ ...d, tags: tagsMap[d.id] ?? [] }))
    if (search) { const s = search.toLowerCase(); results = results.filter(r => r.title.toLowerCase().includes(s) || r.description?.toLowerCase().includes(s)) }
    if (tagFilter) results = results.filter(r => r.tags.some((t: any) => t.id === tagFilter))
    setItems(results); setLoading(false)
  }, [search, industryFilter, tagFilter, statusFilter])

  useEffect(() => { fetchItems() }, [fetchItems])
  useEffect(() => { supabase.from('tags').select('*').order('name').then(({ data }) => { if (data) setTags(data) }) }, [])

  const handlePin = async (id: string, current: boolean) => {
    await supabase.from('ideas').update({ is_pinned: !current }).eq('id', id)
    fetchItems(); toast.success(current ? 'Unpinned' : 'Pinned!')
  }
  const handleArchive = async (id: string) => {
    await supabase.from('ideas').update({ is_archived: true }).eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id)); toast.success('Archived')
  }
  const handleDelete = async (id: string) => {
    await supabase.from('ideas').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id)); toast.success('Deleted')
  }

  const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
    raw:        { bg: '#f8fafc', color: 'var(--text-secondary)' },
    exploring:  { bg: '#eff6ff', color: '#1d4ed8' },
    validating: { bg: '#f0fdf4', color: '#15803d' },
    shelved:    { bg: '#fff7ed', color: '#c2410c' },
  }

  const statusExtras = (
    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '13px', padding: '8px 12px', outline: 'none', fontFamily: 'inherit', fontWeight: '500', cursor: 'pointer' }}>
      <option value="">All statuses</option>
      {IDEA_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
    </select>
  )


  const openEdit = async (item: any) => {
    const { data: et } = await supabase.from('entry_tags').select('tag_id').eq('entry_type', 'idea').eq('entry_id', item.id)
    setEditItem({ ...item, tagIds: et?.map((e: any) => e.tag_id) ?? [] })
  }
  return (
    <PageShell title="Ideas Vault" description="Raw ideas, concepts, and hypotheses"
      action={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={15} /> New Idea</button>}
    >
      <SectionChart tableName="ideas" color="#f43f5e" label="ideas" />

      <div className="mt-5">
        <FilterBar search={search} onSearchChange={setSearch} industryFilter={industryFilter} onIndustryChange={setIndustryFilter}
          tagFilter={tagFilter} onTagChange={setTagFilter} tags={tags} extras={statusExtras} />
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <div key={i} className="rounded-2xl animate-pulse h-36" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }} />)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={Lightbulb} title="No ideas yet" description="Capture raw ideas before they slip away."
          action={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={15} />Add Idea</button>} />
      ) : (
        <DraggableGrid
          items={items}
          onReorder={setItems}
          keyExtractor={item => item.id}
          className="stagger"
          renderItem={(item, dragHandle) => {
            const ss = STATUS_STYLES[item.status] ?? { bg: 'var(--bg-hover)', color: 'var(--text-secondary)' }
            return (
              <EntryCard id={item.id} title={item.title} description={item.description}
                entryType="idea" isPinned={item.is_pinned} createdAt={item.created_at}
                tags={item.tags} href={`/ideas/${item.id}`}
                dragHandle={dragHandle}
                onEdit={() => openEdit(item)}
                onPin={() => handlePin(item.id, item.is_pinned)}
                onArchive={() => handleArchive(item.id)}
                onDelete={() => setPendingDelete(item.id)}
                extra={
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize" style={{ background: ss.bg, color: ss.color }}>{item.status}</span>
                    {item.industry && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>{item.industry}</span>}
                  </div>
                }
              />
            )
          }}
        />
      )}
      {editItem && (
        <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Idea">
          <IdeaForm initial={{ id: editItem.id, title: editItem.title, description: editItem.description ?? '', status: editItem.status, industry: editItem.industry ?? '', potential: editItem.potential ?? '', impact_level: editItem.impact_level ?? 'medium', action_plan: editItem.action_plan ?? '', review_date: editItem.review_date ?? '', tagIds: editItem.tagIds ?? [] }} onSuccess={() => { setEditItem(null); fetchItems() }} onCancel={() => setEditItem(null)} />
        </Modal>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Idea">
        <IdeaForm onSuccess={() => { setModalOpen(false); fetchItems() }} onCancel={() => setModalOpen(false)} />
      </Modal>
    
      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete idea?"
        message="This entry will be permanently deleted. This cannot be undone."
        confirmLabel="Delete permanently"
        onConfirm={() => { if (pendingDelete) handleDelete(pendingDelete); setPendingDelete(null) }}
        onCancel={() => setPendingDelete(null)}
      />
    </PageShell>
  )
}
