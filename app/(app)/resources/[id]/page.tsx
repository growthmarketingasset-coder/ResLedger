'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import ResourceForm from '../ResourceForm'
import InternalLinkSelector from '@/components/entries/InternalLinkSelector'
import { ArrowLeft, Edit2, Pin, Archive, Trash2, ExternalLink, Link2 } from 'lucide-react'
import Link from 'next/link'
import { formatDate, ENTRY_TYPE_COLORS, ENTRY_TYPE_LABELS, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ResourceDetailPage({ params }: { params: { id: string } }) {
  const [resource, setResource] = useState<any>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const fetchResource = async () => {
    const { data } = await supabase.from('resources').select('*').eq('id', params.id).single()
    if (!data) { router.push('/resources'); return }
    const { data: entryTags } = await supabase.from('entry_tags')
      .select('tags(id, name, color)').eq('entry_type', 'resource').eq('entry_id', params.id)
    const tags = entryTags?.map((et: any) => et.tags).filter(Boolean) ?? []
    const { data: linkData } = await supabase.from('internal_links')
      .select('*').eq('source_type', 'resource').eq('source_id', params.id)
    const links: any[] = []
    if (linkData) {
      for (const link of linkData) {
        const { data: target } = await supabase
          .from(link.target_type + 's').select('id, title').eq('id', link.target_id).single()
        if (target) links.push({ id: target.id, title: target.title, type: link.target_type })
      }
    }
    setResource({ ...data, tags, links })
    setLoading(false)
  }

  useEffect(() => { fetchResource() }, [params.id])

  const handlePin = async () => {
    await supabase.from('resources').update({ is_pinned: !resource.is_pinned }).eq('id', params.id)
    fetchResource(); toast.success(resource.is_pinned ? 'Unpinned' : 'Pinned!')
  }

  const handleArchive = async () => {
    await supabase.from('resources').update({ is_archived: true }).eq('id', params.id)
    toast.success('Archived'); router.push('/resources')
  }

  const handleDelete = async () => {
        await supabase.from('resources').delete().eq('id', params.id)
    toast.success('Deleted'); router.push('/resources')
  }

  const handleLinksChange = async (newLinks: any[]) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('internal_links').delete().eq('source_type', 'resource').eq('source_id', params.id)
    if (newLinks.length > 0) {
      await supabase.from('internal_links').insert(
        newLinks.map(l => ({ user_id: user.id, source_type: 'resource', source_id: params.id, target_type: l.type, target_id: l.id }))
      )
    }
    setResource((prev: any) => prev ? { ...prev, links: newLinks } : prev)
  }

  if (loading) return (
    <div className="detail-page animate-fade-in">
      <div className="animate-pulse space-y-4">
        <div className="h-8 rounded-xl skeleton-pulse" style={{background:"var(--bg-hover)",width:"50%"}} />
        <div className="h-40 rounded-2xl skeleton-pulse" style={{background:"var(--bg-hover)"}} />
      </div>
    </div>
  )

  if (!resource) return null

  return (
    <div className="detail-page animate-fade-in">
      <div className="mb-6 flex items-center gap-2.5 sm:mb-8">
        <Link href="/resources" className="inline-flex items-center p-2 rounded-xl transition-all duration-150" style={{ color: "var(--text-muted)", background: 'var(--bg-card)', border: "1px solid var(--border-subtle)" }}><ArrowLeft size={14} /></Link>
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>Resources</span>
      </div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="badge bg-purple-50 text-purple-700">Resource</span>
            <span className="badge capitalize" style={{background:"var(--bg-hover)",color:"var(--text-muted)"}}>{resource.resource_type}</span>
            {resource.is_pinned && <span className="badge" style={{background:"#fef3c7",color:"#92400e"}}>Pinned</span>}
            {resource.industry && <span className="badge" style={{background:"var(--bg-hover)",color:"var(--text-secondary)"}}>{resource.industry}</span>}
          </div>
          <h1 className="text-[2rem] font-extrabold leading-[1.06] tracking-tight sm:text-2xl" style={{ color: "var(--text-primary)", letterSpacing: "-0.035em" }}>{resource.title}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{formatDate(resource.created_at)}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:justify-end">
          <button onClick={() => setEditOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150" style={{ background: 'var(--bg-card)', border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}><Edit2 size={13} /> Edit</button>
          <button onClick={handlePin} className="p-2 rounded-xl transition-all duration-150" style={{ background: 'var(--bg-card)', border: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}><Pin size={13} /></button>
          <button onClick={handleArchive} className="p-2 rounded-xl transition-all duration-150" style={{ background: 'var(--bg-card)', border: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}><Archive size={13} /></button>
          <button onClick={() => setConfirmOpen(true)} className="p-2 rounded-xl transition-all duration-150" style={{ background: 'var(--bg-card)', border: "1px solid #fecdd3", color: "#ef4444" }}><Trash2 size={13} /></button>
        </div>
      </div>

      {resource.url && (
        <div className="rounded-2xl p-5 mb-5" style={{ background: 'var(--bg-card)', border: "1px solid var(--border-subtle)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full min-w-0 items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium transition-all"
            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', color: '#3b82f6' }}
          >
            <ExternalLink size={14} className="mt-0.5 shrink-0" />
            <span className="min-w-0 flex-1 break-all leading-6">{resource.url}</span>
          </a>
        </div>
      )}

      {resource.description && (
        <div className="rounded-2xl p-5 mb-5" style={{ background: 'var(--bg-card)', border: "1px solid var(--border-subtle)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>{resource.description}</p>
        </div>
      )}

      {resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {resource.tags.map((tag: any) => (
            <span key={tag.id} className="badge"
              style={{ backgroundColor: tag.color + '20', color: tag.color }}>{tag.name}</span>
          ))}
        </div>
      )}

      <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: "1px solid var(--border-subtle)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Link2 size={14} style={{color:"var(--text-muted)"}} />
          <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)", fontSize: "10px", letterSpacing: "0.08em" }}>Linked Entries</h3>
        </div>
        <InternalLinkSelector currentId={params.id} currentType="resource" links={resource.links} onChange={handleLinksChange} />
        {resource.links.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {resource.links.map((link: any) => (
              <Link key={`${link.type}-${link.id}`} href={`/${link.type}s/${link.id}`}
                className={cn('badge', ENTRY_TYPE_COLORS[link.type])}>
                {ENTRY_TYPE_LABELS[link.type]}: {link.title}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Resource">
        <ResourceForm
          initial={{ id: resource.id, title: resource.title, url: resource.url ?? '', description: resource.description ?? '', resource_type: resource.resource_type, industry: resource.industry ?? '', tagIds: resource.tags.map((t: any) => t.id) }}
          onSuccess={() => { setEditOpen(false); fetchResource() }}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>
    </div>
  )
}

