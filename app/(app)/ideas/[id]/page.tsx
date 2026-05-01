'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import IdeaForm from '../IdeaForm'
import InternalLinkSelector from '@/components/entries/InternalLinkSelector'
import { ArrowLeft, Edit2, Pin, Archive, Trash2, Link2, Zap, Calendar } from 'lucide-react'
import Link from 'next/link'
import { formatDate, IMPACT_CONFIG } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  raw:        { bg: 'var(--bg-hover)', color: 'var(--text-secondary)', border: 'var(--border-subtle)' },
  exploring:  { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' },
  validating: { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0' },
  shelved:    { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
}

export default function IdeaDetailPage({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<any>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const fetchItem = async () => {
    const { data } = await supabase.from('ideas').select('*').eq('id', params.id).single()
    if (!data) { router.push('/ideas'); return }
    const { data: et } = await supabase.from('entry_tags').select('tags(id,name,color)')
      .eq('entry_type', 'idea').eq('entry_id', params.id)
    const tags = et?.map((e: any) => e.tags).filter(Boolean) ?? []
    const { data: linkData } = await supabase.from('internal_links')
      .select('*').eq('source_type', 'idea').eq('source_id', params.id)
    const links: any[] = []
    if (linkData) {
      for (const l of linkData) {
        const tableMap: Record<string,string> = { learning:'learnings',resource:'resources',template:'templates',tool:'tools',ai_strategy:'ai_strategies' }
        const table = tableMap[l.target_type]
        if (table) {
          const { data: target } = await supabase.from(table).select('id,title').eq('id', l.target_id).single()
          if (target) links.push({ id: target.id, title: target.title, type: l.target_type })
        }
      }
    }
    setItem({ ...data, tags, links })
    setLoading(false)
  }

  useEffect(() => { fetchItem() }, [params.id])

  const handlePin = async () => { await supabase.from('ideas').update({ is_pinned: !item.is_pinned }).eq('id', params.id); fetchItem(); toast.success(item.is_pinned ? 'Unpinned' : 'Pinned!') }
  const handleArchive = async () => { await supabase.from('ideas').update({ is_archived: true }).eq('id', params.id); toast.success('Archived'); router.push('/ideas') }
  const handleDelete = async () => { await supabase.from('ideas').delete().eq('id', params.id); toast.success('Deleted'); router.push('/ideas') }
  const handleLinksChange = async (newLinks: any[]) => {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return
    await supabase.from('internal_links').delete().eq('source_type', 'idea').eq('source_id', params.id)
    if (newLinks.length > 0) await supabase.from('internal_links').insert(newLinks.map(l => ({ user_id: user.id, source_type: 'idea', source_id: params.id, target_type: l.type, target_id: l.id })))
    setItem((p: any) => p ? { ...p, links: newLinks } : p)
  }

  if (loading) return (
    <div className="detail-page">
      <div className="space-y-4">
        <div className="h-8 rounded-xl skeleton-pulse" style={{ background: 'var(--bg-hover)', width: '50%' }} />
        <div className="h-40 rounded-2xl skeleton-pulse" style={{ background: 'var(--bg-hover)' }} />
      </div>
    </div>
  )
  if (!item) return null

  const ss = STATUS_STYLES[item.status] ?? STATUS_STYLES.raw
  const ic = IMPACT_CONFIG[item.impact_level]

  return (
    <div className="detail-page animate-fade-in">
      <div className="flex items-center gap-2.5 mb-8">
        <Link href="/ideas" className="inline-flex items-center p-2 rounded-xl transition-all"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <ArrowLeft size={14} />
        </Link>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Ideas Vault</span>
      </div>

      {/* Header */}
      <div className="rounded-2xl p-6 mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="badge capitalize" style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
                {item.status}
              </span>
              {item.industry && <span className="badge" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>{item.industry}</span>}
              {item.is_pinned && <span className="badge inline-flex items-center gap-1" style={{ background: '#fef3c7', color: '#92400e' }}><Pin size={11} />Pinned</span>}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>{item.title}</h1>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{formatDate(item.created_at)}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => setEditOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}><Edit2 size={13} /> Edit</button>
            <button onClick={handlePin} className="p-2 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}><Pin size={13} /></button>
            <button onClick={handleArchive} className="p-2 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}><Archive size={13} /></button>
            <button onClick={() => setConfirmOpen(true)} className="p-2 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e' }}><Trash2 size={13} /></button>
          </div>
        </div>
      </div>

      {/* Meta */}
      {ic && (
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: ic.bg, border: `1px solid ${ic.border}` }}>
            <Zap size={13} style={{ color: ic.color }} />
            <span className="text-xs font-bold" style={{ color: ic.color }}>{ic.label}</span>
          </div>
          {item.review_date && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Review: {item.review_date}</span>
            </div>
          )}
        </div>
      )}

      {item.description && (
        <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
          <h3 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.08em' }}>Description</h3>
          <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
        </div>
      )}
      {item.potential && (
        <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
          <h3 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.08em' }}>Potential</h3>
          <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.potential}</p>
        </div>
      )}
      {item.action_plan && (
        <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--green-muted)', border: '1px solid var(--green-pale)' }}>
          <h3 className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: 'var(--green-700)', fontSize: '10px', letterSpacing: '0.08em' }}>Next Steps</h3>
          <p className="text-sm whitespace-pre-wrap font-medium" style={{ color: 'var(--green-800)' }}>{item.action_plan}</p>
        </div>
      )}

      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {item.tags.map((tag: any) => (
            <span key={tag.id} className="badge" style={{ backgroundColor: tag.color + '22', color: tag.color }}>{tag.name}</span>
          ))}
        </div>
      )}

      <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Link2 size={14} style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.08em' }}>Linked Entries</h3>
        </div>
        <InternalLinkSelector currentId={params.id} currentType="idea" links={item.links || []} onChange={handleLinksChange} />
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Idea">
        <IdeaForm
          initial={{ id: item.id, title: item.title, description: item.description ?? '', status: item.status, industry: item.industry ?? '', potential: item.potential ?? '', impact_level: item.impact_level ?? 'medium', action_plan: item.action_plan ?? '', review_date: item.review_date ?? '', tagIds: item.tags.map((t: any) => t.id) }}
          onSuccess={() => { setEditOpen(false); fetchItem() }} onCancel={() => setEditOpen(false)} />
      </Modal>
      <ConfirmDialog open={confirmOpen} title="Delete idea?" message={`"${item.title}" will be permanently deleted.`}
        confirmLabel="Delete permanently" onConfirm={() => { setConfirmOpen(false); handleDelete() }} onCancel={() => setConfirmOpen(false)} />
    </div>
  )
}

