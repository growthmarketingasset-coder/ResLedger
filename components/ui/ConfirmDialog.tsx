'use client'

import { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title?: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open, title = 'Are you sure?', message, confirmLabel = 'Delete',
  danger = true, onConfirm, onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter') onConfirm()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onConfirm, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fade-in"
        style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(8px)' }}
        onClick={onCancel} />
      <div className="relative w-full max-w-sm animate-scale-in rounded-2xl p-6"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-modal)' }}>
        <button onClick={onCancel} className="absolute top-4 right-4 p-1.5 rounded-xl transition-all"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
          <X size={14} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: danger ? 'rgba(244,63,94,0.1)' : 'var(--green-50)' }}>
          <AlertTriangle size={22} style={{ color: danger ? '#f43f5e' : '#16a34a' }} />
        </div>
        <h3 className="text-base font-extrabold mb-2" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{title}</h3>
        <p className="text-sm font-medium mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{message}</p>
        <div className="flex gap-2.5">
          <button onClick={onCancel} className="flex-1 btn-secondary justify-center">Cancel</button>
          <button onClick={onConfirm}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-extrabold rounded-xl transition-all"
            style={{
              background: danger ? 'linear-gradient(135deg,#f43f5e,#e11d48)' : 'var(--btn-primary-bg)',
              color: 'white',
              boxShadow: danger ? '0 2px 8px rgba(244,63,94,0.3)' : '0 2px 8px rgba(22,163,74,0.3)',
            }}>
            {confirmLabel}
          </button>
        </div>
        <p className="text-xs text-center mt-3" style={{ color: 'var(--text-faint)' }}>
          <kbd className="px-1.5 py-0.5 rounded font-mono text-xs" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>Enter</kbd>{' '}
          to confirm ·{' '}
          <kbd className="px-1.5 py-0.5 rounded font-mono text-xs" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>Esc</kbd>{' '}
          to cancel
        </p>
      </div>
    </div>
  )
}
