'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, BookOpen, Link2, FileText, Wrench,
  Lightbulb, Brain, PlayCircle, BookMarked, ChevronDown
} from 'lucide-react'

const SECTIONS = [
  { href: '/learnings', label: 'Learning', icon: BookOpen, color: '#d7d2ff', bg: 'rgba(124,108,242,0.10)' },
  { href: '/resources', label: 'Resource', icon: Link2, color: '#f3f1ff', bg: 'rgba(124,108,242,0.14)' },
  { href: '/templates', label: 'Template', icon: FileText, color: '#c7c0ff', bg: 'rgba(124,108,242,0.08)' },
  { href: '/tools', label: 'Tool', icon: Wrench, color: '#d7d2ff', bg: 'rgba(124,108,242,0.10)' },
  { href: '/ideas', label: 'Idea', icon: Lightbulb, color: '#c7c0ff', bg: 'rgba(124,108,242,0.08)' },
  { href: '/ai-strategy', label: 'AI Strategy', icon: Brain, color: '#f3f1ff', bg: 'rgba(124,108,242,0.16)' },
  { href: '/workshop-videos', label: 'Workshop Video', icon: PlayCircle, color: '#d7d2ff', bg: 'rgba(124,108,242,0.10)' },
  { href: '/case-studies', label: 'Case Study', icon: BookMarked, color: '#c7c0ff', bg: 'rgba(124,108,242,0.08)' },
]

export default function QuickAddButton() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (href: string) => {
    setOpen(false)
    sessionStorage.setItem('autoOpenModal', '1')
    router.push(href)
  }

  return (
    <div className="relative w-full sm:w-auto" ref={ref}>
      <button onClick={() => setOpen(!open)} className="btn-primary gap-2 sm:w-auto">
        <Plus size={15} />
        Add Entry
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 top-12 z-50 w-full rounded-2xl py-2 animate-fade-in sm:left-auto sm:right-0 sm:w-56"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-drop)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] px-4 pb-2 pt-1" style={{ color: 'var(--text-faint)', fontSize: '10px' }}>
            What are you adding?
          </p>
          {SECTIONS.map(({ href, label, icon: Icon, color, bg }) => (
            <button
              key={href}
              onClick={() => handleSelect(href)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium transition-all"
              style={{ color: 'var(--text-primary)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg, border: '1px solid rgba(124,108,242,0.12)' }}>
                <Icon size={14} style={{ color }} />
              </span>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
