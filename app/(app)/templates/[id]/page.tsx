'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import TemplateForm from '../TemplateForm'
import { ArrowLeft, Edit2, Pin, Archive, Trash2, Copy, ExternalLink, Link2 } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function TemplateDetailPage({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<any>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const fetchItem = async () => {
    const { data } = await supabase.from('templates').select('*').eq('id', params.id).single()
    if (!data) { router.push('/templates'); return }
    const { data: et } = await supabase.from('entry_tags').select('tags(id,name,color)')
      .eq('entry_type', 'template').eq('entry_id', params.id)
    const tags = et?.map((e: any) => e.tags).filter(Boolean) ?? []
    setItem({ ...data, tags })
    setLoading(false)
  }

  useEffect(() => { fetchItem() }, [params.id])

  const handlePin = async () => {
    await supabase.from('templates').update({ is_pinned: !item.is_pinned }).eq('id', params.id)
    fetchItem(); toast.success(item.is_pinned ? 'Unpinned' : 'Pinned!')
  }
  const handleCopyContent = () => {
    if (item?.content) { navigator.clipboard.writeText(item.content); toast.success('Copied!') }
  }
  const handleArchive = async () => {
    await supabase.from('templates').update({ is_archived: true }).eq('id', params.id)
    toast.success('Archived'); router.push('/templates')
  }
  const handleDelete = async () => {
    await supabase.from('templates').delete().eq('id', params.id)
    toast.success('Deleted'); router.push('/templates')
  }

  if (loading) return (
    <div className="detail-page">
      <div className="animate-pulse space-y-4">
        <div className="h-8 rounded-xl skeleton-pulse" style={{ background: 'var(--bg-hover)', width: '50%' }} />
        <div className="h-40 rounded-2xl skeleton-pulse" style={{ background: 'var(--bg-hover)' }} />
      </div>
    </div>
  )
  if (!item) return null

  return (
    <div className="detail-page animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2.5 mb-8">
        <Link href="/templates"
          className="inline-flex items-center p-2 rounded-xl transition-all"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <ArrowLeft size={14} />
        </Link>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Templates</span>
      </div>

      {/* Header card */}
      <div className="rounded-2xl p-6 mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: '#fef3c7', color: '#92400e' }}>Template</span>
              {item.category && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                  {item.category}
                </span>
              )}
              {item.is_pinned && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ background: '#fef3c7', color: '#92400e' }}><Pin size={11} /> Pinned</span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight mb-1"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
              {item.title}
            </h1>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{formatDate(item.created_at)}</p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            <button onClick={() => setEditOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
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

      {/* Description */}
      {item.description && (
        <div className="rounded-2xl p-5 mb-4" style={{ background: '#fef9ec', border: '1px solid #fde68a' }}>
          <p className="text-sm font-medium leading-relaxed" style={{ color: '#78350f' }}>{item.description}</p>
        </div>
      )}

      {/* Reference link — FIXED: now displayed */}
      {item.reference_url && (
        <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
          <h3 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.08em' }}>
            Reference Link
          </h3>
          <a
            href={item.reference_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full min-w-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-all group"
            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-focus)'; (e.currentTarget as HTMLElement).style.background = 'var(--green-50)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
          >
            <Link2 size={14} style={{ color: 'var(--green-600)', flexShrink: 0 }} />
            <span className="min-w-0 flex-1 overflow-hidden text-ellipsis break-all">{item.reference_url}</span>
            <ExternalLink size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </a>
        </div>
      )}

      {/* Content */}
      {item.content && (
        <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.08em' }}>
              Content
            </h3>
            <button onClick={handleCopyContent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{ background: 'var(--green-50)', color: 'var(--green-700)', border: '1px solid var(--green-100)' }}>
              <Copy size={12} /> Copy
            </button>
          </div>
          <pre className="text-sm whitespace-pre-wrap leading-relaxed font-mono overflow-x-auto"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
            {item.content}
          </pre>
        </div>
      )}

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {item.tags.map((tag: any) => (
            <span key={tag.id} className="badge"
              style={{ backgroundColor: tag.color + '20', color: tag.color }}>
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Template" size="lg">
        <TemplateForm
          initial={{
            id: item.id, title: item.title, description: item.description ?? '',
            content: item.content ?? '', category: item.category ?? '',
            reference_url: item.reference_url ?? '',
            action_plan: item.action_plan ?? '', impact_level: item.impact_level ?? 'medium',
            tagIds: item.tags.map((t: any) => t.id)
          }}
          onSuccess={() => { setEditOpen(false); fetchItem() }}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete template?"
        message={`"${item.title}" will be permanently deleted.`}
        confirmLabel="Delete permanently"
        onConfirm={() => { setConfirmOpen(false); handleDelete() }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}

