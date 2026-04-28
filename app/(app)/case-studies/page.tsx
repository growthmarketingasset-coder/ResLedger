'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageShell from '@/components/layout/PageShell'
import EntryCard from '@/components/entries/EntryCard'
import DraggableGrid from '@/components/ui/DraggableGrid'
import FilterBar from '@/components/ui/FilterBar'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import SectionChart from '@/components/ui/SectionChart'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import CaseStudyForm from './CaseStudyForm'
import { BookMarked, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { IMPACT_CONFIG } from '@/lib/utils'

export default function CaseStudiesPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [industryFilter, setIndustryFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [tags, setTags] = useState<any[]>([])
  const supabase = createClient()

  const fetchItems = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return
    let q = supabase.from('case_studies').select('*').eq('user_id', user.id).eq('is_archived', false)
      .order('is_pinned', { ascending: false }).order('created_at', { ascending: false })
    if (industryFilter) q = q.eq('industry', industryFilter)
    const { data } = await q
    const ids = data?.map(d => d.id) ?? []
    let tagsMap: Record<string, any[]> = {}
    if (ids.length > 0) {
      const { data: et } = await supabase.from('entry_tags').select('entry_id, tags(id,name,color)').eq('entry_type', 'case_study').in('entry_id', ids)
      et?.forEach((e: any) => { if (!tagsMap[e.entry_id]) tagsMap[e.entry_id] = []; if (e.tags) tagsMap[e.entry_id].push(e.tags) })
    }
    let results = (data ?? []).map(d => ({ ...d, tags: tagsMap[d.id] ?? [] }))
    if (search) { const s = search.toLowerCase(); results = results.filter(r => r.title.toLowerCase().includes(s) || r.summary?.toLowerCase().includes(s) || r.client_context?.toLowerCase().includes(s)) }
    if (tagFilter) results = results.filter(r => r.tags.some((t: any) => t.id === tagFilter))
    setItems(results); setLoading(false)
  }, [search, industryFilter, tagFilter])

  useEffect(() => { fetchItems() }, [fetchItems])
  useEffect(() => { supabase.from('tags').select('*').order('name').then(({ data }) => { if (data) setTags(data) }) }, [])

  const handlePin = async (id: string, current: boolean) => { await supabase.from('case_studies').update({ is_pinned: !current }).eq('id', id); fetchItems(); toast.success(current ? 'Unpinned' : 'Pinned!') }
  const handleArchive = async (id: string) => { await supabase.from('case_studies').update({ is_archived: true }).eq('id', id); setItems(prev => prev.filter(i => i.id !== id)); toast.success('Archived') }
  const handleDelete = async (id: string) => { await supabase.from('case_studies').delete().eq('id', id); setItems(prev => prev.filter(i => i.id !== id)); toast.success('Deleted') }
  const openEdit = async (item: any) => {
    const { data: et } = await supabase.from('entry_tags').select('tag_id').eq('entry_type', 'case_study').eq('entry_id', item.id)
    setEditItem({ ...item, tagIds: et?.map((e: any) => e.tag_id) ?? [] })
  }

  return (
    <PageShell title="Case Studies" description="Document and store case studies you've created or studied"
      action={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={15} /> New Case Study</button>}>

      <SectionChart tableName="case_studies" color="#10b981" label="case studies" />

      <div className="mt-5">
        <FilterBar search={search} onSearchChange={setSearch} industryFilter={industryFilter}
          onIndustryChange={setIndustryFilter} tagFilter={tagFilter} onTagChange={setTagFilter} tags={tags} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 stagger">
          {[1,2,3,4].map(i => <div key={i} className="rounded-2xl animate-pulse h-40" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }} />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={BookMarked} title="No case studies yet" description="Store case studies you've created or analysed — problems, solutions, and outcomes."
          action={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={15} />Add Case Study</button>} />
      ) : (
        <DraggableGrid
          items={items}
          onReorder={setItems}
          keyExtractor={item => item.id}
          className="stagger"
          renderItem={(item, dragHandle) => {
            const ic = IMPACT_CONFIG[item.impact_level]
            return (
              <EntryCard id={item.id} title={item.title} description={item.summary}
                entryType="case_study" isPinned={item.is_pinned} createdAt={item.created_at}
                tags={item.tags} href={`/case-studies/${item.id}`} url={item.url}
                dragHandle={dragHandle}
                onEdit={() => openEdit(item)} onPin={() => handlePin(item.id, item.is_pinned)}
                onArchive={() => handleArchive(item.id)} onDelete={() => setPendingDelete(item.id)}
                extra={
                  <div className="flex flex-wrap gap-1.5">
                    {item.industry && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#ccfbf1', color: '#134e4a' }}>{item.industry}</span>}
                    {ic && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: ic.bg, color: ic.color }}>{ic.label}</span>}
                    {item.client_context && <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{item.client_context}</span>}
                  </div>
                }
              />
            )
          }}
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Case Study" size="lg">
        <CaseStudyForm onSuccess={() => { setModalOpen(false); fetchItems() }} onCancel={() => setModalOpen(false)} />
      </Modal>
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Case Study" size="lg">
        {editItem && <CaseStudyForm initial={{ ...editItem }} onSuccess={() => { setEditItem(null); fetchItems() }} onCancel={() => setEditItem(null)} />}
      </Modal>
      <ConfirmDialog open={!!pendingDelete} title="Delete case study?"
        message="This case study will be permanently deleted."
        confirmLabel="Delete permanently"
        onConfirm={() => { if (pendingDelete) handleDelete(pendingDelete); setPendingDelete(null) }}
        onCancel={() => setPendingDelete(null)} />
    </PageShell>
  )
}
