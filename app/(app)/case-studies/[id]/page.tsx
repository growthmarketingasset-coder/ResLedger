'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/Modal'
import CaseStudyForm from '../CaseStudyForm'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { ArrowLeft, Edit2, Pin, Archive, Trash2, ExternalLink, Target, Wrench, Users, TrendingUp, Zap } from 'lucide-react'
import Link from 'next/link'
import { formatDate, IMPACT_CONFIG } from '@/lib/utils'
import toast from 'react-hot-toast'

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
      <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.08em' }}>{label}</h3>
      {children}
    </div>
  )
}

export default function CaseStudyDetailPage({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<any>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const fetchItem = async () => {
    const { data } = await supabase.from('case_studies').select('*').eq('id', params.id).single()
    if (!data) { router.push('/case-studies'); return }
    const { data: et } = await supabase.from('entry_tags').select('tags(id,name,color)').eq('entry_type', 'case_study').eq('entry_id', params.id)
    const tags = et?.map((e: any) => e.tags).filter(Boolean) ?? []
    setItem({ ...data, tags }); setLoading(false)
  }

  useEffect(() => { fetchItem() }, [params.id])

  const handlePin = async () => { await supabase.from('case_studies').update({ is_pinned: !item.is_pinned }).eq('id', params.id); fetchItem(); toast.success(item.is_pinned ? 'Unpinned' : 'Pinned!') }
  const handleArchive = async () => { await supabase.from('case_studies').update({ is_archived: true }).eq('id', params.id); toast.success('Archived'); router.push('/case-studies') }
  const handleDelete = async () => { await supabase.from('case_studies').delete().eq('id', params.id); toast.success('Deleted'); router.push('/case-studies') }

  if (loading) return <div className="detail-page"><div className="animate-pulse space-y-4"><div className="h-32 rounded-2xl" style={{ background: 'var(--bg-hover)' }} /></div></div>
  if (!item) return null

  const ic = IMPACT_CONFIG[item.impact_level]

  return (
    <div className="detail-page animate-fade-in">
      <div className="flex items-center gap-2.5 mb-8">
        <Link href="/case-studies" className="inline-flex items-center p-2 rounded-xl transition-all" style={{ color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}><ArrowLeft size={14} /></Link>
        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Case Studies</span>
      </div>

      {/* Header */}
      <div className="rounded-2xl p-6 mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: '#f0fdf4', color: '#065f46' }}>Case Study</span>
              {item.industry && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>{item.industry}</span>}
              {item.is_pinned && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: '#fffbeb', color: '#b45309' }}>Pinned</span>}
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>{item.title}</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{formatDate(item.created_at)}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => setEditOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}><Edit2 size={13} /> Edit</button>
            <button onClick={handlePin} className="p-2 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}><Pin size={13} /></button>
            <button onClick={handleArchive} className="p-2 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}><Archive size={13} /></button>
            <button onClick={() => setConfirmOpen(true)} className="p-2 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid #fecdd3', color: '#ef4444' }}><Trash2 size={13} /></button>
          </div>
        </div>
        {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 text-sm font-medium hover:text-green-600 transition-colors" style={{ color: '#3b82f6' }}><ExternalLink size={13} /> Reference Link</a>}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 mb-5">
        {ic && <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: ic.bg, border: `1px solid ${ic.border}` }}><Zap size={13} style={{ color: ic.color }} /><span className="text-xs font-semibold" style={{ color: ic.color }}>{ic.label}</span></div>}
        {item.client_context && <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}><Users size={13} style={{ color: 'var(--text-muted)' }} /><span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{item.client_context}</span></div>}
        {item.tools_used && <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}><Wrench size={13} style={{ color: 'var(--text-muted)' }} /><span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{item.tools_used}</span></div>}
      </div>

      {item.summary && <Section label="Summary"><p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.summary}</p></Section>}

      {/* Problem / Solution / Result — 3-step flow */}
      {(item.problem || item.solution || item.result) && (
        <div className="grid grid-cols-1 gap-3 mb-4">
          {item.problem && (
            <div className="rounded-2xl p-5" style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>
              <div className="flex items-center gap-2 mb-2"><Target size={14} style={{ color: '#be123c' }} /><span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#be123c', fontSize: '10px' }}>Problem / Challenge</span></div>
              <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: '#9f1239' }}>{item.problem}</p>
            </div>
          )}
          {item.solution && (
            <div className="rounded-2xl p-5" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <div className="flex items-center gap-2 mb-2"><TrendingUp size={14} style={{ color: '#1d4ed8' }} /><span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#1d4ed8', fontSize: '10px' }}>Solution / Approach</span></div>
              <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: '#1e40af' }}>{item.solution}</p>
            </div>
          )}
          {item.result && (
            <div className="rounded-2xl p-5" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div className="flex items-center gap-2 mb-2"><Zap size={14} style={{ color: '#15803d' }} /><span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#15803d', fontSize: '10px' }}>Results / Outcomes</span></div>
              <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: '#166534' }}>{item.result}</p>
            </div>
          )}
        </div>
      )}

      {item.action_plan && <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--green-muted)', border: '1px solid var(--green-pale)' }}><h3 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#15803d', fontSize: '10px' }}>What to DO with this</h3><p className="text-sm whitespace-pre-wrap" style={{ color: '#15803d' }}>{item.action_plan}</p></div>}

      {item.tags.length > 0 && <div className="flex flex-wrap gap-1.5 mt-4">{item.tags.map((tag: any) => <span key={tag.id} className="badge" style={{ backgroundColor: tag.color + '20', color: tag.color }}>{tag.name}</span>)}</div>}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Case Study" size="lg">
        {editOpen && <CaseStudyForm initial={{ ...item, tagIds: item.tags.map((t: any) => t.id) }} onSuccess={() => { setEditOpen(false); fetchItem() }} onCancel={() => setEditOpen(false)} />}
      </Modal>
      <ConfirmDialog open={confirmOpen} title="Delete case study?" message={`"${item.title}" will be permanently deleted.`} confirmLabel="Delete permanently" onConfirm={() => { setConfirmOpen(false); handleDelete() }} onCancel={() => setConfirmOpen(false)} />
    </div>
  )
}

