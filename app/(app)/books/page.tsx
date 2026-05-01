'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageShell from '@/components/layout/PageShell'
import DraggableGrid from '@/components/ui/DraggableGrid'
import FilterBar from '@/components/ui/FilterBar'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import SectionChart from '@/components/ui/SectionChart'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import BookForm from './BookForm'
import { BookOpen, Plus, MoreHorizontal, Trash2, Archive, Pin, Edit2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'
import toast from 'react-hot-toast'
import { formatRelative, IMPACT_CONFIG } from '@/lib/utils'

const STATUS_CFG: Record<string, { label: string; bg: string; color: string }> = {
  to_read:   { label: 'To Read',   bg: 'var(--bg-hover)',  color: 'var(--text-muted)' },
  reading:   { label: 'Reading',   bg: '#e0f2fe',          color: '#0369a1' },
  completed: { label: 'Completed', bg: '#ccfbf1',          color: '#065f46' },
  paused:    { label: 'Paused',    bg: '#fef3c7',          color: '#92400e' },
}

function BookCard({ item, onEdit, onPin, onArchive, onDelete, dragHandle }: {
  item: any; onEdit: () => void; onPin: () => void; onArchive: () => void; onDelete: () => void; dragHandle?: React.ReactNode
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const sc = STATUS_CFG[item.status] ?? STATUS_CFG.to_read
  const pct = item.total_pages && item.total_pages > 0
    ? Math.min(100, Math.round((item.current_page / item.total_pages) * 100)) : 0

  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <>
      <div
        onClick={e => { const t = e.target as HTMLElement; if (t.closest('button') || t.closest('[data-menu]') || t.closest('.drag-handle')) return; router.push(`/books/${item.id}`) }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group surface-card rounded-2xl relative overflow-hidden cursor-pointer transition-all duration-200"
        style={{ background: 'var(--bg-card)', border: `1px solid ${hovered ? 'var(--border-default)' : 'var(--border-subtle)'}`, boxShadow: hovered ? 'var(--shadow-hover)' : 'var(--shadow-card)', transform: hovered ? 'translateY(-2px)' : 'none' }}>
        {/* Blue top bar */}
        <div className="h-0.5" style={{ background: '#3b82f6', opacity: hovered ? 1 : 0.35 }} />
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              {dragHandle}
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
                style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
            </div>
            <div className="flex items-center gap-0.5 shrink-0" data-menu="true">
              <div className="relative" ref={menuRef}>
                <button onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  style={{ color: 'var(--text-muted)' }}>
                  <MoreHorizontal size={13} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-8 z-20 rounded-2xl py-1.5 w-40 animate-scale-in"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-drop)' }}>
                    {[
                      { icon: <Edit2 size={13}/>, label: 'Edit', action: () => { onEdit(); setMenuOpen(false) } },
                      { icon: <Pin size={13}/>, label: item.is_pinned ? 'Unpin' : 'Pin', action: () => { onPin(); setMenuOpen(false) } },
                      { icon: <Archive size={13}/>, label: 'Archive', action: () => { onArchive(); setMenuOpen(false) } },
                    ].map(({ icon, label, action }) => (
                      <button key={label} onClick={e => { e.stopPropagation(); action() }}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm font-semibold transition-all"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                        <span style={{ color: 'var(--text-muted)' }}>{icon}</span>{label}
                      </button>
                    ))}
                    <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 8px' }} />
                    <button onClick={e => { e.stopPropagation(); setMenuOpen(false); setConfirmOpen(true) }}
                      className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm font-semibold"
                      style={{ color: '#f43f5e' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.07)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <Trash2 size={13} />Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <h3 className="text-sm font-bold mb-0.5" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{item.title}</h3>
          {item.author && <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>by {item.author}</p>}

          {/* Progress bar */}
          {item.total_pages > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {item.current_page} / {item.total_pages} pages
                </span>
                <span className="text-xs font-extrabold tabular-nums"
                  style={{ color: pct === 100 ? '#059669' : 'var(--text-primary)' }}>
                  {pct}%
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: pct === 100 ? 'linear-gradient(90deg,#22c55e,#059669)' : 'linear-gradient(90deg,#3b82f6,#6366f1)' }} />
              </div>
            </div>
          )}

          <div className="pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-faint)' }}>{formatRelative(item.created_at)}</span>
          </div>
        </div>
      </div>
      <ConfirmDialog open={confirmOpen} title="Remove book?" message={`"${item.title}" will be deleted.`}
        confirmLabel="Delete" onConfirm={() => { setConfirmOpen(false); onDelete() }} onCancel={() => setConfirmOpen(false)} />
    </>
  )
}

export default function BooksPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [industryFilter, setIndustryFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [tags, setTags] = useState<any[]>([])
  const supabase = createClient()

  const fetchItems = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return
    let q = supabase.from('books').select('*').eq('user_id', user.id).eq('is_archived', false)
      .order('is_pinned', { ascending: false }).order('created_at', { ascending: false })
    if (industryFilter) q = q.eq('industry', industryFilter)
    if (statusFilter) q = q.eq('status', statusFilter)
    const { data } = await q
    let results = data ?? []
    if (search) { const s = search.toLowerCase(); results = results.filter(r => r.title.toLowerCase().includes(s) || r.author?.toLowerCase().includes(s)) }
    setItems(results); setLoading(false)
  }, [search, industryFilter, tagFilter, statusFilter])

  useEffect(() => { fetchItems() }, [fetchItems])
  useEffect(() => { supabase.from('tags').select('*').order('name').then(({ data }) => { if (data) setTags(data) }) }, [])

  const handlePin = async (id: string, cur: boolean) => { await supabase.from('books').update({ is_pinned: !cur }).eq('id', id); fetchItems() }
  const handleArchive = async (id: string) => { await supabase.from('books').update({ is_archived: true }).eq('id', id); setItems(p => p.filter(i => i.id !== id)) }
  const handleDelete = async (id: string) => { await supabase.from('books').delete().eq('id', id); setItems(p => p.filter(i => i.id !== id)); toast.success('Removed') }
  const openEdit = async (item: any) => {
    const { data: et } = await supabase.from('entry_tags').select('tag_id').eq('entry_type', 'book').eq('entry_id', item.id)
    setEditItem({ ...item, tagIds: et?.map((e: any) => e.tag_id) ?? [] })
  }

  const statusExtras = (
    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', padding: '8px 12px', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
      <option value="">All statuses</option>
      {Object.entries(STATUS_CFG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
    </select>
  )

  const reading = items.filter(i => i.status === 'reading').length
  const completed = items.filter(i => i.status === 'completed').length

  return (
    <PageShell title="Books" description={`${items.length} books · ${reading} reading · ${completed} completed`}
      action={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={15} /> Add Book</button>}>
      <SectionChart tableName="books" color="#3b82f6" label="books" />
      <div className="mt-5">
        <FilterBar search={search} onSearchChange={setSearch} industryFilter={industryFilter}
          onIndustryChange={setIndustryFilter} tagFilter={tagFilter} onTagChange={setTagFilter}
          tags={tags} extras={statusExtras} />
      </div>
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 stagger">
          {[1,2,3,4].map(i => <div key={i} className="rounded-2xl animate-pulse h-40 skeleton-pulse" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }} />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={BookOpen} title="No books yet" description="Track what you're reading, your progress, and key takeaways."
          action={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={15} />Add Book</button>} />
      ) : (
        <DraggableGrid items={items} onReorder={setItems} keyExtractor={i => i.id} className="stagger"
          renderItem={(item, dragHandle) => (
            <BookCard item={item} dragHandle={dragHandle}
              onEdit={() => openEdit(item)} onPin={() => handlePin(item.id, item.is_pinned)}
              onArchive={() => handleArchive(item.id)} onDelete={() => setPendingDelete(item.id)} />
          )} />
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Book">
        <BookForm onSuccess={() => { setModalOpen(false); fetchItems() }} onCancel={() => setModalOpen(false)} />
      </Modal>
      {editItem && (
        <Modal open={true} onClose={() => setEditItem(null)} title="Edit Book">
          <BookForm initial={{ ...editItem }} onSuccess={() => { setEditItem(null); fetchItems() }} onCancel={() => setEditItem(null)} />
        </Modal>
      )}
      <ConfirmDialog open={!!pendingDelete} title="Delete book?" message="This book will be permanently deleted."
        confirmLabel="Delete" onConfirm={() => { if (pendingDelete) handleDelete(pendingDelete); setPendingDelete(null) }} onCancel={() => setPendingDelete(null)} />
    </PageShell>
  )
}
