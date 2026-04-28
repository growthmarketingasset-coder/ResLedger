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
import WorkshopVideoForm from './WorkshopVideoForm'
import { PlayCircle, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { IMPACT_CONFIG } from '@/lib/utils'

export default function WorkshopVideosPage() {
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
    let q = supabase.from('workshop_videos').select('*').eq('user_id', user.id).eq('is_archived', false)
      .order('is_pinned', { ascending: false }).order('course_name').order('module_number')
    const { data } = await q
    const ids = data?.map(d => d.id) ?? []
    let tagsMap: Record<string, any[]> = {}
    if (ids.length > 0) {
      const { data: et } = await supabase.from('entry_tags').select('entry_id, tags(id,name,color)').eq('entry_type', 'workshop_video').in('entry_id', ids)
      et?.forEach((e: any) => { if (!tagsMap[e.entry_id]) tagsMap[e.entry_id] = []; if (e.tags) tagsMap[e.entry_id].push(e.tags) })
    }
    let results = (data ?? []).map(d => ({ ...d, tags: tagsMap[d.id] ?? [] }))
    if (search) { const s = search.toLowerCase(); results = results.filter(r => r.title.toLowerCase().includes(s) || r.course_name?.toLowerCase().includes(s)) }
    if (tagFilter) results = results.filter(r => r.tags.some((t: any) => t.id === tagFilter))
    setItems(results); setLoading(false)
  }, [search, tagFilter])

  useEffect(() => { fetchItems() }, [fetchItems])
  useEffect(() => { supabase.from('tags').select('*').order('name').then(({ data }) => { if (data) setTags(data) }) }, [])

  const handlePin = async (id: string, current: boolean) => { await supabase.from('workshop_videos').update({ is_pinned: !current }).eq('id', id); fetchItems(); toast.success(current ? 'Unpinned' : 'Pinned!') }
  const handleArchive = async (id: string) => { await supabase.from('workshop_videos').update({ is_archived: true }).eq('id', id); setItems(prev => prev.filter(i => i.id !== id)); toast.success('Archived') }
  const handleDelete = async (id: string) => { await supabase.from('workshop_videos').delete().eq('id', id); setItems(prev => prev.filter(i => i.id !== id)); toast.success('Deleted') }
  const openEdit = async (item: any) => {
    const { data: et } = await supabase.from('entry_tags').select('tag_id').eq('entry_type', 'workshop_video').eq('entry_id', item.id)
    setEditItem({ ...item, tagIds: et?.map((e: any) => e.tag_id) ?? [] })
  }

  const courses = [...new Set(items.map(i => i.course_name || 'Uncategorized'))]

  const VideoCard = (item: any, dragHandle: React.ReactNode) => {
    const ic = IMPACT_CONFIG[item.impact_level]
    return (
      <EntryCard id={item.id} title={item.title} description={item.description || item.notes}
        entryType="workshop_video" isPinned={item.is_pinned} createdAt={item.created_at}
        tags={item.tags} href={`/workshop-videos/${item.id}`} url={item.url}
        dragHandle={dragHandle}
        onEdit={() => openEdit(item)} onPin={() => handlePin(item.id, item.is_pinned)}
        onArchive={() => handleArchive(item.id)} onDelete={() => setPendingDelete(item.id)}
        extra={
          <div className="flex flex-wrap gap-1.5">
            {item.course_name && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#e0f2fe', color: '#075985' }}>{item.course_name}</span>}
            {item.module_number && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>M{item.module_number}</span>}
            {item.is_watched && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#d1fae5', color: '#065f46' }}>✓ Watched</span>}
            {ic && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: ic.bg, color: ic.color }}>{ic.label}</span>}
          </div>
        }
      />
    )
  }

  return (
    <PageShell title="Workshop Videos" description="Module library — organise your learning videos"
      action={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={15} /> Add Video</button>}>
      <SectionChart tableName="workshop_videos" color="#0ea5e9" label="videos" />
      <div className="mt-5">
        <FilterBar search={search} onSearchChange={setSearch} industryFilter={industryFilter}
          onIndustryChange={setIndustryFilter} tagFilter={tagFilter} onTagChange={setTagFilter} tags={tags} />
      </div>
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 stagger">
          {[1,2,3,4].map(i => <div key={i} className="rounded-2xl animate-pulse h-36" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }} />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={PlayCircle} title="No workshop videos yet" description="Start storing your course modules and video lessons here."
          action={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={15} />Add Video</button>} />
      ) : search || tagFilter ? (
        <DraggableGrid items={items} onReorder={setItems} keyExtractor={item => item.id} className="stagger"
          renderItem={(item, dragHandle) => VideoCard(item, dragHandle)} />
      ) : (
        <div className="space-y-8">
          {courses.map(course => {
            const courseItems = items.filter(i => (i.course_name || 'Uncategorized') === course)
            return (
              <div key={course}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#e0f2fe', border: '1px solid #bae6fd' }}>
                    <PlayCircle size={17} style={{ color: '#0369a1' }} />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{course}</h2>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{courseItems.length} video{courseItems.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <DraggableGrid
                  items={courseItems}
                  onReorder={newOrder => {
                    const other = items.filter(i => (i.course_name || 'Uncategorized') !== course)
                    setItems([...other, ...newOrder])
                  }}
                  keyExtractor={item => item.id}
                  className="stagger"
                  renderItem={(item, dragHandle) => VideoCard(item, dragHandle)}
                />
              </div>
            )
          })}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Workshop Video">
        <WorkshopVideoForm onSuccess={() => { setModalOpen(false); fetchItems() }} onCancel={() => setModalOpen(false)} />
      </Modal>
      {editItem && (
        <Modal open={true} onClose={() => setEditItem(null)} title="Edit Workshop Video">
          <WorkshopVideoForm initial={{ ...editItem }} onSuccess={() => { setEditItem(null); fetchItems() }} onCancel={() => setEditItem(null)} />
        </Modal>
      )}
      <ConfirmDialog open={!!pendingDelete} title="Delete video?" message="This video will be permanently deleted."
        confirmLabel="Delete permanently"
        onConfirm={() => { if (pendingDelete) handleDelete(pendingDelete); setPendingDelete(null) }}
        onCancel={() => setPendingDelete(null)} />
    </PageShell>
  )
}
