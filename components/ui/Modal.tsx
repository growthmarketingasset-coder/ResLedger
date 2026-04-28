'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export default function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (open) {
      document.addEventListener('keydown', handler)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const maxW = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[size]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 animate-fade-in"
        style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />

      <div
        className={cn('relative flex w-full animate-scale-in flex-col sm:rounded-[24px]', maxW)}
        style={{
          background: 'var(--bg-card)',
          borderRadius: '24px 24px 0 0',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-modal)',
          maxHeight: 'min(88vh, 800px)',
        }}
      >
        <div
          className="flex shrink-0 items-center justify-between px-4 py-4 sm:px-6 sm:py-5"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <h2 className="text-base font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-xl border p-2 transition-all"
            style={{ color: 'var(--text-muted)', borderColor: 'var(--border-subtle)' }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'
            }}
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {children}
        </div>
      </div>
    </div>
  )
}
