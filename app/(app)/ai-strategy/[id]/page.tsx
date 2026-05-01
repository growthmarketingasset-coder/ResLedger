'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/Modal'
import AIStrategyForm from '../AIStrategyForm'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import InternalLinkSelector from '@/components/entries/InternalLinkSelector'
import {
  ArrowLeft, Edit2, Pin, Archive, Trash2,
  Link2, CheckCircle2, ExternalLink, Calendar, Zap, Wrench, Target
} from 'lucide-react'
import Link from 'next/link'
import { formatDate, IMPACT_CONFIG, ENTRY_TYPE_COLORS, ENTRY_TYPE_LABELS, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  draft:     { bg: 'var(--bg-hover)', color: 'var(--text-secondary)',  border: 'var(--border-subtle)' },
  active:    { bg: '#f0fdf4',         color: '#15803d',                border: '#bbf7d0' },
  completed: { bg: '#eff6ff',         color: '#1d4ed8',                border: '#bfdbfe' },
  paused:    { bg: '#fffbeb',         color: '#b45309',                border: '#fde68a' },
}

function InfoBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 mb-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
      <h3 className="text-xs font-semibold uppercase tracking-widest mb-3"
        style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.08em' }}>
        {label}
      </h3>
      {children}
    </div>
  )
}

export default function AIStrategyDetailPage({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<any>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const fetchItem = async () => {
    const { data } = await supabase.from('ai_strategies').select('*').eq('id', params.id).single()
    if (!data) { router.push('/ai-strategy'); return }

    const { data: et } = await supabase.from('entry_tags')
      .select('tags(id,name,color)').eq('entry_type', 'ai_strategy').eq('entry_id', params.id)
    const tags = et?.map((e: any) => e.tags).filter(Boolean) ?? []

    const { data: linkData } = await supabase.from('internal_links')
      .select('*').eq('source_type', 'ai_strategy').eq('source_id', params.id)
    const links: any[] = []
    if (linkData) {
      for (const link of linkData) {
        const { data: target } = await supabase.from(link.target_type + 's').select('id, title').eq('id', link.target_id).single()
        if (target) links.push({ id: target.id, title: target.title, type: link.target_type })
      }
    }

    // Parse supporting links
    let supportingLinks: string[] = []
    if (data.supporting_links) {
      try { supportingLinks = JSON.parse(data.supporting_links) }
      catch { supportingLinks = data.supporting_links.split('\n').filter(Boolean) }
    }

    setItem({ ...data, tags, links, supportingLinksArray: supportingLinks })
    setLoading(false)
  }

  useEffect(() => { fetchItem() }, [params.id])

  const handlePin = async () => {
    await supabase.from('ai_strategies').update({ is_pinned: !item.is_pinned }).eq('id', params.id)
    fetchItem(); toast.success(item.is_pinned ? 'Unpinned' : 'Pinned!')
  }
  const handleArchive = async () => {
    await supabase.from('ai_strategies').update({ is_archived: true }).eq('id', params.id)
    toast.success('Archived'); router.push('/ai-strategy')
  }
  const handleDelete = async () => {
    await supabase.from('ai_strategies').delete().eq('id', params.id)
    toast.success('Deleted'); router.push('/ai-strategy')
  }
  const handleLinksChange = async (newLinks: any[]) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('internal_links').delete().eq('source_type', 'ai_strategy').eq('source_id', params.id)
    if (newLinks.length > 0) {
      await supabase.from('internal_links').insert(
        newLinks.map(l => ({ user_id: user.id, source_type: 'ai_strategy', source_id: params.id, target_type: l.type, target_id: l.id }))
      )
    }
    setItem((prev: any) => prev ? { ...prev, links: newLinks } : prev)
  }

  if (loading) return (
    <div className="detail-page">
      <div className="animate-pulse space-y-4">
        <div className="h-8 rounded-xl" style={{ background: 'var(--bg-hover)' }} />
        <div className="h-40 rounded-2xl" style={{ background: 'var(--bg-hover)' }} />
        <div className="h-24 rounded-2xl" style={{ background: 'var(--bg-hover)' }} />
      </div>
    </div>
  )
  if (!item) return null

  const ss = STATUS_STYLES[item.status] ?? STATUS_STYLES.draft
  const ic = IMPACT_CONFIG[item.impact_level]

  return (
    <div className="detail-page animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2.5 mb-8">
        <Link href="/ai-strategy"
          className="inline-flex items-center p-2 rounded-xl transition-all"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <ArrowLeft size={14} />
        </Link>
        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>AI Strategy</span>
      </div>

      {/* Title block */}
      <div className="rounded-2xl p-6 mb-5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: '#fdf4ff', color: '#7e22ce' }}>
                AI Strategy
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
                {item.status}
              </span>
              {item.is_pinned && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: '#fffbeb', color: '#b45309' }}>
                  Pinned
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-1"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
              {item.title}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{formatDate(item.created_at)}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => setEditOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
              <Edit2 size={13} /> Edit
            </button>
            <button onClick={handlePin}
              className="p-2 rounded-xl transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
              <Pin size={13} />
            </button>
            <button onClick={handleArchive}
              className="p-2 rounded-xl transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
              <Archive size={13} />
            </button>
            <button onClick={() => setConfirmOpen(true)}
              className="p-2 rounded-xl transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid #fecdd3', color: '#ef4444' }}>
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Meta badges */}
      <div className="flex flex-wrap gap-2.5 mb-5">
        {ic && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: ic.bg, border: `1px solid ${ic.border}` }}>
            <Zap size={13} style={{ color: ic.color }} />
            <span className="text-xs font-semibold" style={{ color: ic.color }}>{ic.label}</span>
          </div>
        )}
        {item.review_date && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Review: {item.review_date}
            </span>
          </div>
        )}
        {item.industry && (
          <div className="px-4 py-2.5 rounded-xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{item.industry}</span>
          </div>
        )}
      </div>

      {/* Content sections */}
      {item.objective && (
        <InfoBlock label="Objective">
          <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {item.objective}
          </p>
        </InfoBlock>
      )}

      {item.approach && (
        <InfoBlock label="Approach / Method">
          <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {item.approach}
          </p>
        </InfoBlock>
      )}

      {item.tools_used && (
        <InfoBlock label="Tools Used">
          <div className="flex flex-wrap gap-2">
            {item.tools_used.split(',').map((tool: string) => tool.trim()).filter(Boolean).map((tool: string) => (
              <span key={tool} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{ background: '#fdf4ff', color: '#7e22ce', border: '1px solid #e9d5ff' }}>
                <Wrench size={11} />
                {tool}
              </span>
            ))}
          </div>
        </InfoBlock>
      )}

      {item.outcome && (
        <InfoBlock label="Outcome / Results">
          <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {item.outcome}
          </p>
        </InfoBlock>
      )}

      {item.action_plan && (
        <div className="rounded-2xl p-5 mb-4"
          style={{ background: 'var(--green-muted)', border: '1px solid var(--green-pale)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: '#15803d', fontSize: '10px', letterSpacing: '0.08em' }}>
            What to DO with this
          </h3>
          <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: '#15803d' }}>
            {item.action_plan}
          </p>
        </div>
      )}

      {/* Supporting Links */}
      {item.supportingLinksArray.length > 0 && (
        <InfoBlock label="Supporting Links">
          <div className="space-y-2">
            {item.supportingLinksArray.map((link: string, i: number) => (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all group"
                style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)'}
              >
                <Link2 size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <span className="text-sm truncate flex-1 group-hover:text-green-600 transition-colors"
                  style={{ color: 'var(--text-primary)' }}>
                  {link}
                </span>
                <ExternalLink size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              </a>
            ))}
          </div>
        </InfoBlock>
      )}

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {item.tags.map((tag: any) => (
            <span key={tag.id} className="badge"
              style={{ backgroundColor: tag.color + '20', color: tag.color }}>
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Internal Links */}
      <div className="rounded-2xl p-5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Link2 size={14} style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.08em' }}>
            Linked Entries
          </h3>
        </div>
        <InternalLinkSelector
          currentId={params.id} currentType="ai_strategy"
          links={item.links} onChange={handleLinksChange}
        />
        {item.links.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.links.map((link: any) => (
              <Link
                key={`${link.type}-${link.id}`}
                href={`/${link.type}s/${link.id}`}
                className={cn('badge', ENTRY_TYPE_COLORS[link.type])}
              >
                {ENTRY_TYPE_LABELS[link.type]}: {link.title}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit AI Strategy" size="lg">
        <AIStrategyForm
          initial={{
            id: item.id, title: item.title, objective: item.objective ?? '',
            approach: item.approach ?? '', tools_used: item.tools_used ?? '',
            outcome: item.outcome ?? '', status: item.status,
            impact_level: item.impact_level ?? 'medium', industry: item.industry ?? '',
            action_plan: item.action_plan ?? '', review_date: item.review_date ?? '',
            supporting_links: item.supporting_links ?? '',
            tagIds: item.tags.map((t: any) => t.id),
          }}
          onSuccess={() => { setEditOpen(false); fetchItem() }}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete AI Strategy?"
        message={`"${item.title}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete permanently"
        onConfirm={() => { setConfirmOpen(false); handleDelete() }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}

