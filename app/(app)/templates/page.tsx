'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageShell from '@/components/layout/PageShell'
import FilterBar from '@/components/ui/FilterBar'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import TemplateForm from './TemplateForm'
import SectionChart from '@/components/ui/SectionChart'
import ServiceIcon from '@/components/ui/ServiceIcon'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { FileText, Plus, Pin, Archive, Trash2, MoreHorizontal, Copy, ExternalLink, Edit2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { IMPACT_CONFIG, formatRelative } from '@/lib/utils'
import DraggableGrid from '@/components/ui/DraggableGrid'

// ── Template Card ─────────────────────────────────────────────────────────────
function TemplateCard({
  item, onPin, onArchive, onDeleteConfirmed, onEdit, dragHandle
}: {
  item: any
  onPin: () => void
  onArchive: () => void
  onDeleteConfirmed: () => void
  onEdit: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('a') || target.closest('[data-menu]')) return
    router.push(`/templates/${item.id}`)
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (item.content) {
      navigator.clipboard.writeText(item.content)
      toast.success('Copied to clipboard!')
    }
  }

  const ic = IMPACT_CONFIG[item.impact_level]
  const tags: any[] = item.tags || []

  return (
    <>
      <div
        onClick={handleCardClick}
        className="group rounded-2xl p-5 transition-all duration-200 cursor-pointer"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'var(--shadow-hover)'; el.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'var(--shadow-card)'; el.style.transform = 'translateY(0)' }}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {dragHandle}
          <ServiceIcon url={item.reference_url || null} title={item.title} size={36} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              {item.category && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(124,108,242,0.10)', color: 'var(--accent-400)' }}>
                  {item.category}
                </span>
              )}
              {item.is_pinned && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(124,108,242,0.12)', color: 'var(--accent-400)' }}>
                  Pinned
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold truncate transition-colors group-hover:text-[var(--accent-400)]" style={{ color: 'var(--text-primary)' }}>
              {item.title}
            </h3>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 shrink-0" data-menu="true">
            {item.content && (
              <button onClick={handleCopy}
                className="p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100" style={{ color: 'var(--text-muted)' }}
                title="Copy content"
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <Copy size={13} />
              </button>
            )}
            {item.reference_url && (
              <a href={item.reference_url} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100" style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <ExternalLink size={13} />
              </a>
            )}
            <div className="relative" ref={menuRef}>
              <button
                onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
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
                    <button key={label}
                      onClick={e => { e.stopPropagation(); action() }}
                      className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <span style={{ color: 'var(--text-muted)' }}>{icon}</span>{label}
                    </button>
                  ))}
                  <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />
                  <button
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); setConfirmOpen(true) }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm" style={{ color: '#ef4444' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fff1f2'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {item.description && (
          <p className="text-xs line-clamp-2 leading-relaxed mb-2.5" style={{ color: 'var(--text-muted)' }}>
            {item.description}
          </p>
        )}

        {ic && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold mb-2.5"
            style={{ background: ic.bg, color: ic.color, border: `1px solid ${ic.border}` }}>
            {ic.label}
          </span>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 3).map((tag: any) => (
              <span key={tag.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: tag.color + '18', color: tag.color, border: `1px solid ${tag.color}25` }}>
                {tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <span className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>
            {formatRelative(item.created_at)}
          </span>
          {item.content && (
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {item.content.split('\n').length} lines
            </span>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete template?"
        message={`"${item.title}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete permanently"
        onConfirm={() => { setConfirmOpen(false); onDeleteConfirmed() }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TemplatesPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [industryFilter, setIndustryFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [tags, setTags] = useState<any[]>([])
  const supabase = createClient()

  const fetchItems = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('templates').select('*').eq('user_id', user.id).eq('is_archived', false)
      .order('is_pinned', { ascending: false }).order('created_at', { ascending: false })
    const ids = data?.map(d => d.id) ?? []
    let tagsMap: Record<string, any[]> = {}
    if (ids.length > 0) {
      const { data: et } = await supabase.from('entry_tags').select('entry_id, tags(id,name,color)')
        .eq('entry_type', 'template').in('entry_id', ids)
      et?.forEach((e: any) => { if (!tagsMap[e.entry_id]) tagsMap[e.entry_id] = []; if (e.tags) tagsMap[e.entry_id].push(e.tags) })
    }
    let results = (data ?? []).map(d => ({ ...d, tags: tagsMap[d.id] ?? [] }))
    if (search) { const s = search.toLowerCase(); results = results.filter(r => r.title.toLowerCase().includes(s) || r.description?.toLowerCase().includes(s)) }
    if (tagFilter) results = results.filter(r => r.tags.some((t: any) => t.id === tagFilter))
    setItems(results)
    setLoading(false)
  }, [search, tagFilter])

  useEffect(() => { fetchItems() }, [fetchItems])
  useEffect(() => {
    supabase.from('tags').select('*').order('name').then(({ data }) => { if (data) setTags(data) })
  }, [])

  const handlePin = async (id: string, current: boolean) => {
    await supabase.from('templates').update({ is_pinned: !current }).eq('id', id)
    fetchItems(); toast.success(current ? 'Unpinned' : 'Pinned!')
  }
  const handleArchive = async (id: string) => {
    await supabase.from('templates').update({ is_archived: true }).eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id)); toast.success('Archived')
  }
  const handleDelete = async (id: string) => {
    await supabase.from('templates').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id)); toast.success('Deleted')
  }
  const openEdit = async (item: any) => {
    const { data: et } = await supabase.from('entry_tags').select('tag_id')
      .eq('entry_type', 'template').eq('entry_id', item.id)
    setEditItem({ ...item, tagIds: et?.map((e: any) => e.tag_id) ?? [] })
  }

  return (
    <PageShell
      title="Templates"
      description="Reusable frameworks and structures"
      action={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={15} /> New Template</button>}
    >
      <SectionChart tableName="templates" color="#f59e0b" label="templates" />

      <div className="mt-5">
        <FilterBar search={search} onSearchChange={setSearch} industryFilter={industryFilter}
          onIndustryChange={setIndustryFilter} tagFilter={tagFilter} onTagChange={setTagFilter} tags={tags} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="rounded-2xl animate-pulse h-40" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={FileText} title="No templates yet"
          description="Create reusable templates for repeatable work."
          action={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={15} />Add Template</button>} />
      ) : (
        <DraggableGrid
          items={items}
          onReorder={setItems}
          keyExtractor={item => item.id}
          className="stagger"
          renderItem={(item, dragHandle) => (
            <TemplateCard item={item} dragHandle={dragHandle}
              onPin={() => handlePin(item.id, item.is_pinned)}
              onArchive={() => handleArchive(item.id)}
              onDeleteConfirmed={() => handleDelete(item.id)}
              onEdit={() => openEdit(item)}
            />
          )}
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Template" size="lg">
        <TemplateForm onSuccess={() => { setModalOpen(false); fetchItems() }} onCancel={() => setModalOpen(false)} />
      </Modal>

      {editItem && (
        <Modal open={true} onClose={() => setEditItem(null)} title="Edit Template" size="lg">
          <TemplateForm
            initial={{
              id: editItem.id, title: editItem.title, description: editItem.description ?? '',
              content: editItem.content ?? '', category: editItem.category ?? '',
              reference_url: editItem.reference_url ?? '', action_plan: editItem.action_plan ?? '',
              impact_level: editItem.impact_level ?? 'medium', tagIds: editItem.tagIds ?? [],
            }}
            onSuccess={() => { setEditItem(null); fetchItems() }}
            onCancel={() => setEditItem(null)}
          />
        </Modal>
      )}
    </PageShell>
  )
}
