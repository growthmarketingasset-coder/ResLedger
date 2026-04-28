'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageShell from '@/components/layout/PageShell'
import FilterBar from '@/components/ui/FilterBar'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import ResourceForm from './ResourceForm'
import SectionChart from '@/components/ui/SectionChart'
import ServiceIcon from '@/components/ui/ServiceIcon'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { Link2, Plus, ExternalLink, Pin, Archive, Trash2, MoreHorizontal, Edit2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { RESOURCE_TYPES, IMPACT_CONFIG, formatRelative } from '@/lib/utils'
import DraggableGrid from '@/components/ui/DraggableGrid'

// ── Resource Card ─────────────────────────────────────────────────────────────
function ResourceCard({
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
    router.push(`/resources/${item.id}`)
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
          <ServiceIcon url={item.url} title={item.title} size={36} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                {item.resource_type}
              </span>
              {item.is_pinned && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#fffbeb', color: '#b45309' }}>
                  Pinned
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold truncate group-hover:text-green-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
              {item.title}
            </h3>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 shrink-0" data-menu="true">
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer"
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
          <span className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>{formatRelative(item.created_at)}</span>
          <Link2 size={11} style={{ color: 'var(--text-faint)' }} />
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete resource?"
        message={`"${item.title}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete permanently"
        onConfirm={() => { setConfirmOpen(false); onDeleteConfirmed() }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [industryFilter, setIndustryFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [tags, setTags] = useState<any[]>([])
  const supabase = createClient()

  const fetchResources = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    let q = supabase.from('resources').select('*').eq('user_id', user.id).eq('is_archived', false)
      .order('is_pinned', { ascending: false }).order('created_at', { ascending: false })
    if (industryFilter) q = q.eq('industry', industryFilter)
    if (typeFilter) q = q.eq('resource_type', typeFilter)
    const { data } = await q
    const ids = data?.map(d => d.id) ?? []
    let tagsMap: Record<string, any[]> = {}
    if (ids.length > 0) {
      const { data: et } = await supabase.from('entry_tags').select('entry_id, tags(id,name,color)')
        .eq('entry_type', 'resource').in('entry_id', ids)
      et?.forEach((e: any) => { if (!tagsMap[e.entry_id]) tagsMap[e.entry_id] = []; if (e.tags) tagsMap[e.entry_id].push(e.tags) })
    }
    let results = (data ?? []).map(d => ({ ...d, tags: tagsMap[d.id] ?? [] }))
    if (search) { const s = search.toLowerCase(); results = results.filter(r => r.title.toLowerCase().includes(s) || r.description?.toLowerCase().includes(s)) }
    if (tagFilter) results = results.filter(r => r.tags.some((t: any) => t.id === tagFilter))
    setResources(results)
    setLoading(false)
  }, [search, industryFilter, tagFilter, typeFilter])

  useEffect(() => { fetchResources() }, [fetchResources])
  useEffect(() => {
    supabase.from('tags').select('*').order('name').then(({ data }) => { if (data) setTags(data) })
  }, [])

  const handlePin = async (id: string, current: boolean) => {
    await supabase.from('resources').update({ is_pinned: !current }).eq('id', id)
    fetchResources(); toast.success(current ? 'Unpinned' : 'Pinned!')
  }
  const handleArchive = async (id: string) => {
    await supabase.from('resources').update({ is_archived: true }).eq('id', id)
    setResources(prev => prev.filter(r => r.id !== id)); toast.success('Archived')
  }
  const handleDelete = async (id: string) => {
    await supabase.from('resources').delete().eq('id', id)
    setResources(prev => prev.filter(r => r.id !== id)); toast.success('Deleted')
  }
  const openEdit = async (item: any) => {
    const { data: et } = await supabase.from('entry_tags').select('tag_id')
      .eq('entry_type', 'resource').eq('entry_id', item.id)
    setEditItem({ ...item, tagIds: et?.map((e: any) => e.tag_id) ?? [] })
  }

  const typeExtras = (
    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '13px', padding: '8px 12px', outline: 'none', fontFamily: 'inherit', fontWeight: '500', cursor: 'pointer' }}>
      <option value="">All types</option>
      {RESOURCE_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
    </select>
  )

  return (
    <PageShell
      title="Resources"
      description={`${resources.length} saved links, docs & articles`}
      action={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={15} /> New Resource</button>}
    >
      <SectionChart tableName="resources" color="#8b5cf6" label="resources" />

      <div className="mt-5">
        <FilterBar search={search} onSearchChange={setSearch} industryFilter={industryFilter}
          onIndustryChange={setIndustryFilter} tagFilter={tagFilter} onTagChange={setTagFilter}
          tags={tags} extras={typeExtras} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 stagger">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="rounded-2xl animate-pulse h-40" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }} />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <EmptyState icon={Link2} title="No resources yet"
          description="Save links, docs, and articles you want to reference later."
          action={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={15} />Add Resource</button>} />
      ) : (
        <DraggableGrid
          items={resources}
          onReorder={setResources}
          keyExtractor={item => item.id}
          className="stagger"
          renderItem={(r, dragHandle) => (
            <ResourceCard item={r} dragHandle={dragHandle}
              onPin={() => handlePin(r.id, r.is_pinned)}
              onArchive={() => handleArchive(r.id)}
              onDeleteConfirmed={() => handleDelete(r.id)}
              onEdit={() => openEdit(r)}
            />
          )}
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Resource">
        <ResourceForm onSuccess={() => { setModalOpen(false); fetchResources() }} onCancel={() => setModalOpen(false)} />
      </Modal>

      {editItem && (
        <Modal open={true} onClose={() => setEditItem(null)} title="Edit Resource">
          <ResourceForm
            initial={{
              id: editItem.id, title: editItem.title, url: editItem.url ?? '',
              description: editItem.description ?? '', resource_type: editItem.resource_type,
              industry: editItem.industry ?? '', impact_level: editItem.impact_level ?? 'medium',
              action_plan: editItem.action_plan ?? '', review_date: editItem.review_date ?? '',
              tagIds: editItem.tagIds ?? [],
            }}
            onSuccess={() => { setEditItem(null); fetchResources() }}
            onCancel={() => setEditItem(null)}
          />
        </Modal>
      )}
    </PageShell>
  )
}
