'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import LearningForm from '../LearningForm'
import InternalLinkSelector from '@/components/entries/InternalLinkSelector'
import { ArrowLeft, Edit2, Pin, Archive, Trash2, Link2, ExternalLink, Calendar, Zap } from 'lucide-react'
import Link from 'next/link'
import { formatDate, IMPACT_CONFIG, ENTRY_TYPE_LABELS, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function LearningDetailPage({ params }: { params: { id: string } }) {
  const [learning, setLearning] = useState<any>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const fetchLearning = async () => {
    const { data } = await supabase.from('learnings').select('*').eq('id', params.id).single()
    if (!data) { router.push('/learnings'); return }
    const { data: et } = await supabase.from('entry_tags').select('tags(id,name,color)')
      .eq('entry_type', 'learning').eq('entry_id', params.id)
    const tags = et?.map((e: any) => e.tags).filter(Boolean) ?? []
    const { data: linkData } = await supabase.from('internal_links')
      .select('*').eq('source_type', 'learning').eq('source_id', params.id)
    const links: any[] = []
    if (linkData) {
      for (const l of linkData) {
        const tableMap: Record<string,string> = { resource:'resources',template:'templates',tool:'tools',idea:'ideas',ai_strategy:'ai_strategies' }
        const table = tableMap[l.target_type]
        if (table) {
          const { data: target } = await supabase.from(table).select('id,title').eq('id', l.target_id).single()
          if (target) links.push({ id: target.id, title: target.title, type: l.target_type })
        }
      }
    }
    setLearning({ ...data, tags, links })
    setLoading(false)
  }

  useEffect(() => { fetchLearning() }, [params.id])

  const handlePin = async () => {
    await supabase.from('learnings').update({ is_pinned: !learning.is_pinned }).eq('id', params.id)
    fetchLearning(); toast.success(learning.is_pinned ? 'Unpinned' : 'Pinned!')
  }
  const handleArchive = async () => {
    await supabase.from('learnings').update({ is_archived: true }).eq('id', params.id)
    toast.success('Archived'); router.push('/learnings')
  }
  const handleDelete = async () => {
    await supabase.from('learnings').delete().eq('id', params.id)
    toast.success('Deleted'); router.push('/learnings')
  }
  const handleLinksChange = async (newLinks: any[]) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('internal_links').delete().eq('source_type', 'learning').eq('source_id', params.id)
    if (newLinks.length > 0) {
      await supabase.from('internal_links').insert(
        newLinks.map(l => ({ user_id: user.id, source_type: 'learning', source_id: params.id, target_type: l.type, target_id: l.id }))
      )
    }
    setLearning((prev: any) => prev ? { ...prev, links: newLinks } : prev)
  }

  if (loading) return (
    <div className="detail-page">
      <div className="animate-pulse space-y-4">
        <div className="h-8 rounded-xl skeleton-pulse" style={{ background: 'var(--bg-hover)', width: '50%' }} />
        <div className="h-4 rounded-xl skeleton-pulse" style={{ background: 'var(--bg-hover)', width: '75%' }} />
        <div className="h-40 rounded-2xl skeleton-pulse" style={{ background: 'var(--bg-hover)' }} />
      </div>
    </div>
  )
  if (!learning) return null

  const ic = IMPACT_CONFIG[learning.impact_level]

  return (
    <div className="detail-page animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2.5 mb-8">
        <Link href="/learnings"
          className="inline-flex items-center p-2 rounded-xl transition-all"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <ArrowLeft size={14} />
        </Link>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Learnings</span>
      </div>

      {/* Header */}
      <div className="rounded-2xl p-6 mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: '#dbeafe', color: '#1e40af' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#3b82f6' }} /> Learning
              </span>
              {learning.is_pinned && <span className="badge inline-flex items-center gap-1" style={{ background: '#fef3c7', color: '#92400e' }}><Pin size={11} />Pinned</span>}
              {learning.industry && <span className="badge" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>{learning.industry}</span>}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
              {learning.title}
            </h1>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{formatDate(learning.created_at)}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => setEditOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
              <Edit2 size={13} /> Edit
            </button>
            <button onClick={handlePin} className="p-2 rounded-xl transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
              <Pin size={13} />
            </button>
            <button onClick={handleArchive} className="p-2 rounded-xl transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
              <Archive size={13} />
            </button>
            <button onClick={() => setConfirmOpen(true)} className="p-2 rounded-xl transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e' }}>
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-3 mb-5">
        {ic && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: ic.bg, border: `1px solid ${ic.border}` }}>
            <Zap size={13} style={{ color: ic.color }} />
            <span className="text-xs font-bold" style={{ color: ic.color }}>{ic.label}</span>
          </div>
        )}
        {learning.source && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Source:</span>
            <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{learning.source}</span>
          </div>
        )}
        {learning.review_date && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Review: {learning.review_date}</span>
          </div>
        )}
      </div>

      {/* Content sections */}
      {learning.summary && (
        <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
          <h3 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.08em' }}>Summary</h3>
          <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--text-secondary)' }}>{learning.summary}</p>
        </div>
      )}
      {learning.details && (
        <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
          <h3 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.08em' }}>Full Notes</h3>
          <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{learning.details}</p>
        </div>
      )}
      {learning.action_plan && (
        <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--green-muted)', border: '1px solid var(--green-pale)' }}>
          <h3 className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: 'var(--green-700)', fontSize: '10px', letterSpacing: '0.08em' }}>What to DO with this</h3>
          <p className="text-sm whitespace-pre-wrap font-medium" style={{ color: 'var(--green-800)' }}>{learning.action_plan}</p>
        </div>
      )}

      {/* Tags */}
      {learning.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {learning.tags.map((tag: any) => (
            <span key={tag.id} className="badge" style={{ backgroundColor: tag.color + '22', color: tag.color }}>
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Linked entries */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Link2 size={14} style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.08em' }}>
            Linked Entries
          </h3>
        </div>
        <InternalLinkSelector
          currentId={params.id} currentType="learning"
          links={learning.links || []} onChange={handleLinksChange}
        />
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Learning">
        <LearningForm
          initial={{ id: learning.id, title: learning.title, summary: learning.summary ?? '', details: learning.details ?? '', source: learning.source ?? '', industry: learning.industry ?? '', impact_level: learning.impact_level ?? 'medium', action_plan: learning.action_plan ?? '', review_date: learning.review_date ?? '', tagIds: learning.tags.map((t: any) => t.id) }}
          onSuccess={() => { setEditOpen(false); fetchLearning() }}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete learning?"
        message={`"${learning.title}" will be permanently deleted.`}
        confirmLabel="Delete permanently"
        onConfirm={() => { setConfirmOpen(false); handleDelete() }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}

