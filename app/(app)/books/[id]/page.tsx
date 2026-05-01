'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/Modal'
import BookForm from '../BookForm'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { ArrowLeft, Edit2, Trash2, Archive, Minus, Plus, Check, PartyPopper } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_CFG: Record<string, { label: string; bg: string; color: string }> = {
  to_read: { label: 'To Read', bg: 'var(--bg-hover)', color: 'var(--text-muted)' },
  reading: { label: 'Reading', bg: '#e0f2fe', color: '#0369a1' },
  completed: { label: 'Completed', bg: '#ccfbf1', color: '#065f46' },
  paused: { label: 'Paused', bg: '#fef3c7', color: '#92400e' },
}

export default function BookDetailPage({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<any>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updatingPage, setUpdatingPage] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const fetchItem = async () => {
    const { data } = await supabase.from('books').select('*').eq('id', params.id).single()
    if (!data) { router.push('/books'); return }
    setItem(data); setLoading(false)
  }

  useEffect(() => { fetchItem() }, [params.id])

  const adjustPage = async (delta: number) => {
    if (!item || updatingPage) return
    const newPage = Math.max(0, Math.min(item.total_pages || 9999, (item.current_page || 0) + delta))
    setUpdatingPage(true)
    const updates: any = { current_page: newPage, updated_at: new Date().toISOString() }
    if (newPage === item.total_pages && item.total_pages > 0) updates.status = 'completed'
    await supabase.from('books').update(updates).eq('id', params.id)
    setItem((p: any) => ({ ...p, ...updates }))
    setUpdatingPage(false)
  }

  const setExactPage = async (page: number) => {
    if (!item) return
    const clamped = Math.max(0, Math.min(item.total_pages || 9999, page))
    const updates: any = { current_page: clamped, updated_at: new Date().toISOString() }
    if (clamped === item.total_pages && item.total_pages > 0) updates.status = 'completed'
    await supabase.from('books').update(updates).eq('id', params.id)
    setItem((p: any) => ({ ...p, ...updates }))
  }

  const handleArchive = async () => { await supabase.from('books').update({ is_archived: true }).eq('id', params.id); toast.success('Archived'); router.push('/books') }
  const handleDelete = async () => { await supabase.from('books').delete().eq('id', params.id); toast.success('Deleted'); router.push('/books') }

  if (loading) return <div className="detail-page"><div className="animate-pulse space-y-4"><div className="h-32 rounded-2xl skeleton-pulse" style={{ background: 'var(--bg-hover)' }} /></div></div>
  if (!item) return null

  const pct = item.total_pages > 0 ? Math.min(100, Math.round((item.current_page / item.total_pages) * 100)) : 0
  const sc = STATUS_CFG[item.status] ?? STATUS_CFG.to_read

  return (
    <div className="detail-page animate-fade-in">
      <div className="flex items-center gap-2.5 mb-8">
        <Link href="/books" className="inline-flex items-center p-2 rounded-xl transition-all" style={{ color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}><ArrowLeft size={14} /></Link>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Books</span>
      </div>

      <div className="rounded-2xl p-6 mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
            </div>
            <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>{item.title}</h1>
            {item.author && <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>by {item.author}</p>}
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setEditOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}><Edit2 size={13} />Edit</button>
            <button onClick={handleArchive} className="p-2 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}><Archive size={13} /></button>
            <button onClick={() => setConfirmOpen(true)} className="p-2 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e' }}><Trash2 size={13} /></button>
          </div>
        </div>
      </div>

      {item.total_pages > 0 && (
        <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
          <h3 className="text-xs font-black uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.08em' }}>Reading Progress</h3>
          <div className="h-3 rounded-full overflow-hidden mb-3" style={{ background: 'var(--bg-hover)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: pct === 100 ? 'linear-gradient(90deg,#22c55e,#059669)' : 'linear-gradient(90deg,#3b82f6,#6366f1)' }} />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-extrabold tabular-nums" style={{ color: pct === 100 ? '#059669' : 'var(--text-primary)', letterSpacing: '-0.04em' }}>{pct}%</span>
            <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>{item.current_page} / {item.total_pages} pages</span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => adjustPage(-10)} className="p-2 rounded-xl font-bold text-xs transition-all" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>-10</button>
            <button onClick={() => adjustPage(-1)} className="p-2 rounded-xl transition-all" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}><Minus size={14} /></button>
            <input type="number" min="0" max={item.total_pages} value={item.current_page} onChange={e => setExactPage(parseInt(e.target.value) || 0)} className="form-input text-center font-extrabold text-lg w-24 tabular-nums" style={{ letterSpacing: '-0.03em' }} />
            <button onClick={() => adjustPage(1)} className="p-2 rounded-xl transition-all" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}><Plus size={14} /></button>
            <button onClick={() => adjustPage(10)} className="p-2 rounded-xl font-bold text-xs transition-all" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>+10</button>
            {item.total_pages > 0 && (
              <button onClick={() => setExactPage(item.total_pages)} className="px-3 py-2 rounded-xl text-xs font-bold ml-auto transition-all inline-flex items-center gap-1" style={{ background: '#ccfbf1', color: '#065f46', border: '1px solid #a7f3d0' }}>
                <Check size={12} />
                Done
              </button>
            )}
          </div>
          {pct === 100 && (
            <p className="text-sm font-bold mt-3 inline-flex w-full items-center justify-center gap-1.5" style={{ color: '#059669' }}>
              <PartyPopper size={14} />
              You finished this book!
            </p>
          )}
        </div>
      )}

      {item.notes && (
        <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
          <h3 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.08em' }}>Notes</h3>
          <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.notes}</p>
        </div>
      )}

      {item.key_takeaways && (
        <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--green-50)', border: '1px solid var(--green-100)' }}>
          <h3 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: 'var(--green-700)', fontSize: '10px', letterSpacing: '0.08em' }}>Key Takeaways</h3>
          <p className="text-sm whitespace-pre-wrap leading-relaxed font-medium" style={{ color: 'var(--green-800)' }}>{item.key_takeaways}</p>
        </div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Book">
        {editOpen && <BookForm initial={{ ...item }} onSuccess={() => { setEditOpen(false); fetchItem() }} onCancel={() => setEditOpen(false)} />}
      </Modal>
      <ConfirmDialog open={confirmOpen} title="Delete book?" message={`"${item.title}" will be permanently deleted.`}
        confirmLabel="Delete" onConfirm={() => { setConfirmOpen(false); handleDelete() }} onCancel={() => setConfirmOpen(false)} />
    </div>
  )
}

