'use client'

import { Pin, Archive, ExternalLink, MoreHorizontal, Trash2, RotateCcw, Edit2 } from 'lucide-react'
import { formatRelative, ENTRY_TYPE_LABELS } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

interface EntryCardProps {
  id: string; title: string; description?: string | null; entryType: string
  isPinned: boolean; isArchived?: boolean; createdAt: string
  tags?: { id: string; name: string; color: string }[]
  href: string; url?: string | null
  onPin?: () => void; onArchive?: () => void; onDelete?: () => void
  onRestore?: () => void; onEdit?: () => void
  extra?: React.ReactNode
  dragHandle?: React.ReactNode
}

const TYPE_CONFIG: Record<string, { bg: string; text: string; dot: string; glow: string }> = {
  learning: { bg: 'rgba(124,108,242,0.10)', text: '#d7d2ff', dot: '#8f81f6', glow: 'rgba(124,108,242,0.10)' },
  resource: { bg: 'rgba(124,108,242,0.14)', text: '#f3f1ff', dot: '#c2bbff', glow: 'rgba(124,108,242,0.12)' },
  template: { bg: 'rgba(124,108,242,0.08)', text: '#c7c0ff', dot: '#7c6cf2', glow: 'rgba(124,108,242,0.08)' },
  tool: { bg: 'rgba(124,108,242,0.10)', text: '#d7d2ff', dot: '#aaa1fb', glow: 'rgba(124,108,242,0.10)' },
  idea: { bg: 'rgba(124,108,242,0.08)', text: '#c7c0ff', dot: '#9488f6', glow: 'rgba(124,108,242,0.08)' },
  ai_strategy: { bg: 'rgba(124,108,242,0.16)', text: '#f3f1ff', dot: '#f3f1ff', glow: 'rgba(124,108,242,0.12)' },
  workshop_video: { bg: 'rgba(124,108,242,0.10)', text: '#d7d2ff', dot: '#aaa1fb', glow: 'rgba(124,108,242,0.08)' },
  case_study: { bg: 'rgba(124,108,242,0.08)', text: '#c7c0ff', dot: '#8f81f6', glow: 'rgba(124,108,242,0.08)' },
}

export default function EntryCard({
  id, title, description, entryType, isPinned, isArchived = false,
  createdAt, tags = [], href, url, onPin, onArchive, onDelete, onRestore, onEdit,
  extra, dragHandle
}: EntryCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const cfg = TYPE_CONFIG[entryType] || { bg: 'var(--bg-hover)', text: 'var(--text-secondary)', dot: 'var(--text-muted)', glow: 'transparent' }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('a') || target.closest('[data-menu]') || target.closest('.drag-handle')) return
    router.push(href)
  }

  return (
    <>
      <div
        onClick={handleCardClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group interactive-card animate-slide-in rounded-2xl relative overflow-hidden cursor-pointer transition-all duration-200 touch-manipulation"
        style={{
          background: 'var(--bg-card)',
          border: `1px solid ${hovered ? 'var(--border-default)' : 'var(--border-subtle)'}`,
          boxShadow: hovered ? 'var(--shadow-hover)' : 'var(--shadow-card)',
          transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        }}
      >
        <div className="h-0.5 w-full" style={{ background: cfg.dot, opacity: hovered ? 1 : 0.4, transition: 'opacity 0.2s' }} />

        <div className="p-4 sm:p-5 h-[240px] sm:h-[252px] flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
              {dragHandle}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0" style={{ background: cfg.bg, color: cfg.text }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
                {ENTRY_TYPE_LABELS[entryType] || entryType}
              </span>
              {isPinned && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shrink-0" style={{ background: 'rgba(124,108,242,0.12)', color: 'var(--accent-400)' }}>
                  Pinned
                </span>
              )}
            </div>

            <div className="flex items-center gap-0.5 shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity" data-menu="true">
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="p-1.5 rounded-lg transition-all"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <ExternalLink size={12} />
                </a>
              )}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
                  className="p-1.5 rounded-lg transition-all"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <MoreHorizontal size={13} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-8 z-20 rounded-2xl py-1.5 w-44 animate-scale-in" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-drop)' }}>
                    {onEdit && <MenuBtn icon={<Edit2 size={13} />} label="Edit" onClick={() => { onEdit(); setMenuOpen(false) }} />}
                    {!isArchived && onPin && <MenuBtn icon={<Pin size={13} />} label={isPinned ? 'Unpin' : 'Pin'} onClick={() => { onPin(); setMenuOpen(false) }} />}
                    {!isArchived && onArchive && <MenuBtn icon={<Archive size={13} />} label="Archive" onClick={() => { onArchive(); setMenuOpen(false) }} />}
                    {isArchived && onRestore && <MenuBtn icon={<RotateCcw size={13} />} label="Restore" onClick={() => { onRestore(); setMenuOpen(false) }} />}
                    {onDelete && (
                      <>
                        <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 8px' }} />
                        <MenuBtn icon={<Trash2 size={13} />} label="Delete" onClick={() => { setMenuOpen(false); setConfirmOpen(true) }} danger />
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <h3 className="text-sm font-semibold leading-snug mb-1.5" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {title}
          </h3>

          {description && (
            <p className="text-xs leading-relaxed mb-3 line-clamp-3" style={{ color: 'var(--text-muted)' }}>
              {description}
            </p>
          )}
          {extra && <div className="mb-3 line-clamp-2">{extra}</div>}

          <div className="mt-auto">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3 max-h-[44px] overflow-hidden">
              {tags.slice(0, 3).map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color, border: `1px solid ${tag.color}25` }}
                >
                  {tag.name}
                </span>
              ))}
              {tags.length > 3 && <span className="text-xs font-semibold" style={{ color: 'var(--text-faint)' }}>+{tags.length - 3}</span>}
              </div>
            )}

            <div className="pt-3 flex items-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-faint)' }}>{formatRelative(createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-200" style={{ background: `radial-gradient(circle at 50% 0%, ${cfg.glow} 0%, transparent 65%)`, opacity: hovered ? 1 : 0 }} />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete entry?"
        message={`"${title}" will be permanently deleted.`}
        confirmLabel="Delete permanently"
        onConfirm={() => { setConfirmOpen(false); onDelete?.() }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}

function MenuBtn({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick() }}
      className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm font-semibold transition-all"
      style={{ color: danger ? '#f1b4c6' : 'var(--text-secondary)' }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = danger ? 'rgba(241,180,198,0.08)' : 'var(--bg-hover)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
    >
      <span style={{ color: danger ? '#f1b4c6' : 'var(--text-muted)' }}>{icon}</span>
      {label}
    </button>
  )
}
