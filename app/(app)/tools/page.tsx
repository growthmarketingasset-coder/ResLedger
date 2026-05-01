'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageShell from '@/components/layout/PageShell'
import FilterBar from '@/components/ui/FilterBar'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import ToolForm from './ToolForm'
import FaviconImg from '@/components/ui/FaviconImg'
import SectionChart from '@/components/ui/SectionChart'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { Wrench, Plus, ExternalLink, Pin, Archive, Trash2, MoreHorizontal, Edit2 } from 'lucide-react'
import DraggableGrid from '@/components/ui/DraggableGrid'
import toast from 'react-hot-toast'
import { TOOL_PRICING, IMPACT_CONFIG, formatRelative } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const PRICING_STYLES: Record<string, { bg: string; color: string }> = {
  free:     { bg: '#f0fdf4', color: '#15803d' },
  paid:     { bg: '#fff1f2', color: '#be123c' },
  freemium: { bg: '#eff6ff', color: '#1d4ed8' },
}

function ToolCard({ item, onPin, onArchive, onDelete, onEdit, dragHandle }: {
  item: any; onPin: () => void; onArchive: () => void; onDelete: () => void; onEdit: () => void; dragHandle?: React.ReactNode
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('a') || target.closest('[data-menu]')) return
    router.push(`/tools/${item.id}`)
  }

  const ps = PRICING_STYLES[item.pricing] ?? { bg: 'var(--bg-hover)', color: 'var(--text-secondary)' }
  const ic = IMPACT_CONFIG[item.impact_level]

  return (
    <>
      <div onClick={handleCardClick} className="group surface-card rounded-2xl p-5 cursor-pointer"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}
      >

        <div className="flex items-start gap-3 mb-3">
          {dragHandle}
          <FaviconImg url={item.url} size={36} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize" style={{ background: ps.bg, color: ps.color }}>{item.pricing}</span>
              {item.is_pinned && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#fffbeb', color: '#b45309' }}>Pinned</span>}
            </div>
            <h3 className="text-sm font-semibold truncate transition-colors group-hover:text-[var(--accent-400)]" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
            {item.category && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.category}</p>}
          </div>
          <div className="flex items-center gap-0.5 shrink-0" data-menu="true">
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                className="p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100" style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <ExternalLink size={13} />
              </a>
            )}
            <div className="relative" ref={menuRef}>
              <button onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
                className="p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100" style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <MoreHorizontal size={13} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 z-20 rounded-xl py-1.5 w-40 animate-fade-in"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-dropdown)' }}>
                  {[
                    { icon: <Edit2 size={13} />, label: 'Edit', action: () => { onEdit(); setMenuOpen(false) } },
                    { icon: <Pin size={13} />, label: item.is_pinned ? 'Unpin' : 'Pin', action: () => { onPin(); setMenuOpen(false) } },
                    { icon: <Archive size={13} />, label: 'Archive', action: () => { onArchive(); setMenuOpen(false) } },
                  ].map(({ icon, label, action }) => (
                    <button key={label} onClick={e => { e.stopPropagation(); action() }}
                      className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm" style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <span style={{ color: 'var(--text-muted)' }}>{icon}</span>{label}
                    </button>
                  ))}
                  <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />
                  <button onClick={e => { e.stopPropagation(); setMenuOpen(false); setConfirmOpen(true) }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm" style={{ color: '#ef4444' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fff1f2'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <Trash2 size={13} />Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {item.description && <p className="text-xs line-clamp-2 leading-relaxed mb-2.5" style={{ color: 'var(--text-muted)' }}>{item.description}</p>}
        {ic && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold mb-2.5" style={{ background: ic.bg, color: ic.color, border: `1px solid ${ic.border}` }}>{ic.label}</span>}

        {item.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {item.tags.slice(0, 3).map((tag: any) => (
              <span key={tag.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: tag.color + '18', color: tag.color, border: `1px solid ${tag.color}25` }}>{tag.name}</span>
            ))}
          </div>
        )}

        <div className="pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <span className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>{formatRelative(item.created_at)}</span>
        </div>
      </div>
      <ConfirmDialog open={confirmOpen} title="Delete tool?" message={`"${item.title}" will be permanently deleted.`} confirmLabel="Delete permanently"
        onConfirm={() => { setConfirmOpen(false); onDelete() }} onCancel={() => setConfirmOpen(false)} />
    </>
  )
}

export default function ToolsPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [industryFilter, setIndustryFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [pricingFilter, setPricingFilter] = useState('')
  const [tags, setTags] = useState<any[]>([])
  const supabase = createClient()

  const fetchItems = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return
    let q = supabase.from('tools').select('*').eq('user_id', user.id).eq('is_archived', false)
      .order('is_pinned', { ascending: false }).order('created_at', { ascending: false })
    if (pricingFilter) q = q.eq('pricing', pricingFilter)
    const { data } = await q
    const ids = data?.map(d => d.id) ?? []
    let tagsMap: Record<string, any[]> = {}
    if (ids.length > 0) {
      const { data: et } = await supabase.from('entry_tags').select('entry_id, tags(id,name,color)').eq('entry_type', 'tool').in('entry_id', ids)
      et?.forEach((e: any) => { if (!tagsMap[e.entry_id]) tagsMap[e.entry_id] = []; if (e.tags) tagsMap[e.entry_id].push(e.tags) })
    }
    let results = (data ?? []).map(d => ({ ...d, tags: tagsMap[d.id] ?? [] }))
    if (search) { const s = search.toLowerCase(); results = results.filter(r => r.title.toLowerCase().includes(s) || r.description?.toLowerCase().includes(s)) }
    if (tagFilter) results = results.filter(r => r.tags.some((t: any) => t.id === tagFilter))
    setItems(results); setLoading(false)
  }, [search, pricingFilter, tagFilter])

  useEffect(() => { fetchItems() }, [fetchItems])
  useEffect(() => { supabase.from('tags').select('*').order('name').then(({ data }) => { if (data) setTags(data) }) }, [])

  const handlePin = async (id: string, current: boolean) => { await supabase.from('tools').update({ is_pinned: !current }).eq('id', id); fetchItems(); toast.success(current ? 'Unpinned' : 'Pinned!') }
  const handleArchive = async (id: string) => { await supabase.from('tools').update({ is_archived: true }).eq('id', id); setItems(prev => prev.filter(i => i.id !== id)); toast.success('Archived') }
  const handleDelete = async (id: string) => { await supabase.from('tools').delete().eq('id', id); setItems(prev => prev.filter(i => i.id !== id)); toast.success('Deleted') }
  const openEdit = async (item: any) => {
    const { data: et } = await supabase.from('entry_tags').select('tag_id').eq('entry_type', 'tool').eq('entry_id', item.id)
    setEditItem({ ...item, tagIds: et?.map((e: any) => e.tag_id) ?? [] })
  }

  const pricingExtras = (
    <select value={pricingFilter} onChange={e => setPricingFilter(e.target.value)}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '13px', padding: '8px 12px', outline: 'none', fontFamily: 'inherit', fontWeight: '500', cursor: 'pointer' }}>
      <option value="">All pricing</option>
      {TOOL_PRICING.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
    </select>
  )

  return (
    <PageShell title="Tools" description="Software, apps, and utilities you use"
      action={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={15} /> New Tool</button>}>
      <SectionChart tableName="tools" color="#22c55e" label="tools" />
      <div className="mt-5">
        <FilterBar search={search} onSearchChange={setSearch} industryFilter={industryFilter} onIndustryChange={setIndustryFilter}
          tagFilter={tagFilter} onTagChange={setTagFilter} tags={tags} extras={pricingExtras} />
      </div>
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{[1,2,3,4,5,6].map(i => <div key={i} className="rounded-2xl animate-pulse h-40" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }} />)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={Wrench} title="No tools yet" description="Catalog the tools that make your work easier." action={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={15} />Add Tool</button>} />
      ) : (
        <DraggableGrid
          items={items}
          onReorder={setItems}
          keyExtractor={item => item.id}
          className="stagger"
          renderItem={(item, dragHandle) => (
            <ToolCard item={item} dragHandle={dragHandle}
              onPin={() => handlePin(item.id, item.is_pinned)}
              onArchive={() => handleArchive(item.id)}
              onDelete={() => handleDelete(item.id)}
              onEdit={() => openEdit(item)}
            />
          )}
        />
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Tool">
        <ToolForm onSuccess={() => { setModalOpen(false); fetchItems() }} onCancel={() => setModalOpen(false)} />
      </Modal>
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Tool">
        {editItem && <ToolForm initial={{ ...editItem }} onSuccess={() => { setEditItem(null); fetchItems() }} onCancel={() => setEditItem(null)} />}
      </Modal>
    </PageShell>
  )
}
