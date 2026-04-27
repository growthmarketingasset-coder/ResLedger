'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import ToolForm from '../ToolForm'
import FaviconImg from '@/components/ui/FaviconImg'
import { ArrowLeft, Edit2, Pin, Archive, Trash2, ExternalLink, Calendar, Zap } from 'lucide-react'
import Link from 'next/link'
import { formatDate, IMPACT_CONFIG } from '@/lib/utils'
import toast from 'react-hot-toast'

const PRICING_STYLES: Record<string, { bg: string; color: string }> = {
  free: { bg: '#f0fdf4', color: '#15803d' },
  paid: { bg: '#fff1f2', color: '#be123c' },
  freemium: { bg: '#eff6ff', color: '#1d4ed8' },
}

export default function ToolDetailPage({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<any>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const fetchItem = async () => {
    const { data } = await supabase.from('tools').select('*').eq('id', params.id).single()
    if (!data) { router.push('/tools'); return }
    const { data: et } = await supabase.from('entry_tags').select('tags(id,name,color)').eq('entry_type', 'tool').eq('entry_id', params.id)
    const tags = et?.map((e: any) => e.tags).filter(Boolean) ?? []
    setItem({ ...data, tags }); setLoading(false)
  }

  useEffect(() => { fetchItem() }, [params.id])

  const handlePin = async () => {
    await supabase.from('tools').update({ is_pinned: !item.is_pinned }).eq('id', params.id)
    fetchItem(); toast.success(item.is_pinned ? 'Unpinned' : 'Pinned!')
  }
  const handleArchive = async () => {
    await supabase.from('tools').update({ is_archived: true }).eq('id', params.id)
    toast.success('Archived'); router.push('/tools')
  }
  const handleDelete = async () => {
        await supabase.from('tools').delete().eq('id', params.id)
    toast.success('Deleted'); router.push('/tools')
  }

  if (loading) return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="animate-pulse space-y-4">
        <div className="h-20 rounded-2xl skeleton-pulse" style={{ background: 'var(--bg-hover)' }} />
        <div className="h-40 rounded-2xl skeleton-pulse" style={{ background: 'var(--bg-hover)' }} />
      </div>
    </div>
  )
  if (!item) return null

  const ps = PRICING_STYLES[item.pricing] ?? { bg: '#f8fafc', color: 'var(--text-secondary)' }
  const ic = IMPACT_CONFIG[item.impact_level]

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-2.5 mb-8">
        <Link href="/tools" className="inline-flex items-center p-2 rounded-xl transition-all duration-150"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <ArrowLeft size={14} />
        </Link>
        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Tools</span>
      </div>

      {/* Tool header with large favicon */}
      <div className="rounded-2xl p-6 mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="flex items-start gap-5">
          <FaviconImg url={item.url} size={56} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={{ background: ps.bg, color: ps.color }}>{item.pricing}</span>
                  {item.category && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'var(--bg-base)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>{item.category}</span>}
                  {item.is_pinned && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: '#fffbeb', color: '#b45309' }}>Pinned</span>}
                </div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>{item.title}</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{formatDate(item.created_at)}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => setEditOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}><Edit2 size={13} /> Edit</button>
                <button onClick={handlePin} className="p-2 rounded-xl transition-all duration-150" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}><Pin size={13} /></button>
                <button onClick={handleArchive} className="p-2 rounded-xl transition-all duration-150" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}><Archive size={13} /></button>
                <button onClick={() => setConfirmOpen(true)} className="p-2 rounded-xl transition-all duration-150" style={{ background: 'var(--bg-card)', border: '1px solid #fecdd3', color: '#ef4444' }}><Trash2 size={13} /></button>
              </div>
            </div>
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium transition-colors hover:text-green-600"
                style={{ color: '#3b82f6' }}>
                <ExternalLink size={12} />{item.url}
              </a>
            )}
          </div>
        </div>
      </div>

      {item.description && (
        <div className="rounded-2xl p-5 mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
        </div>
      )}

      {item.action_plan && (
        <div className="rounded-2xl p-5 mb-5" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#15803d', fontSize: '10px', letterSpacing: '0.08em' }}>What to DO with this</h3>
          <p className="text-sm whitespace-pre-wrap" style={{ color: '#15803d' }}>{item.action_plan}</p>
        </div>
      )}

      {/* Meta strip */}
      <div className="flex flex-wrap gap-3 mb-5">
        {ic && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: ic.bg, border: `1px solid ${ic.border}` }}>
            <Zap size={13} style={{ color: ic.color }} />
            <span className="text-xs font-semibold" style={{ color: ic.color }}>{ic.label}</span>
          </div>
        )}
        {item.review_date && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}>
            <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Review: {item.review_date}</span>
          </div>
        )}
        {item.industry && (
          <div className="px-4 py-2.5 rounded-xl" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{item.industry}</span>
          </div>
        )}
      </div>

      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag: any) => (
            <span key={tag.id} className="badge" style={{ backgroundColor: tag.color + '20', color: tag.color }}>{tag.name}</span>
          ))}
        </div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Tool">
        <ToolForm
          initial={{ id: item.id, title: item.title, url: item.url ?? '', description: item.description ?? '', category: item.category ?? '', pricing: item.pricing, impact_level: item.impact_level ?? 'medium', action_plan: item.action_plan ?? '', review_date: item.review_date ?? '', tagIds: item.tags.map((t: any) => t.id) }}
          onSuccess={() => { setEditOpen(false); fetchItem() }}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>
    </div>
  )
}
