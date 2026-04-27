'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import TagSelector from '@/components/entries/TagSelector'
import { INDUSTRIES, IMPACT_LEVELS, IMPACT_CONFIG } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Loader2, BookOpen } from 'lucide-react'

const STATUSES = [
  { value: 'to_read',   label: '📚 To Read',  color: 'var(--text-muted)', bg: 'var(--bg-hover)' },
  { value: 'reading',   label: '👁️ Reading',   color: '#0369a1', bg: '#e0f2fe' },
  { value: 'completed', label: '✅ Done',       color: '#065f46', bg: '#ccfbf1' },
  { value: 'paused',    label: '⏸️ Paused',    color: '#92400e', bg: '#fef3c7' },
]

export default function BookForm({ onSuccess, onCancel, initial }: {
  onSuccess: () => void; onCancel: () => void
  initial?: { id?: string; title?: string; author?: string; total_pages?: number; current_page?: number; status?: string; notes?: string; key_takeaways?: string; industry?: string; impact_level?: string; started_at?: string; tagIds?: string[] }
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [author, setAuthor] = useState(initial?.author ?? '')
  const [totalPages, setTotalPages] = useState(initial?.total_pages?.toString() ?? '')
  const [currentPage, setCurrentPage] = useState(initial?.current_page?.toString() ?? '0')
  const [status, setStatus] = useState(initial?.status ?? 'to_read')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [keyTakeaways, setKeyTakeaways] = useState(initial?.key_takeaways ?? '')
  const [industry, setIndustry] = useState(initial?.industry ?? '')
  const [impactLevel, setImpactLevel] = useState(initial?.impact_level ?? 'medium')
  const [startedAt, setStartedAt] = useState(initial?.started_at ?? '')
  const [tagIds, setTagIds] = useState<string[]>(initial?.tagIds ?? [])
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const pct = totalPages && parseInt(totalPages) > 0
    ? Math.round((parseInt(currentPage || '0') / parseInt(totalPages)) * 100)
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { toast.error('Title required'); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return
    const tp = parseInt(totalPages) || null
    const cp = parseInt(currentPage) || 0
    const payload: any = {
      user_id: user.id, title: title.trim(), author: author.trim() || null,
      total_pages: tp, current_page: cp, status,
      notes: notes.trim() || null, key_takeaways: keyTakeaways.trim() || null,
      industry: industry || null, impact_level: impactLevel,
      started_at: startedAt || null,
      completed_at: status === 'completed' ? new Date().toISOString().split('T')[0] : null,
      updated_at: new Date().toISOString(),
    }
    let entryId = initial?.id
    if (entryId) {
      const { error } = await supabase.from('books').update(payload).eq('id', entryId)
      if (error) { toast.error(error.message); setSaving(false); return }
    } else {
      const { data, error } = await supabase.from('books').insert(payload).select().single()
      if (error) { toast.error(error.message); setSaving(false); return }
      entryId = data.id
    }
    if (entryId) {
      await supabase.from('entry_tags').delete().eq('entry_type', 'book').eq('entry_id', entryId)
      if (tagIds.length > 0) await supabase.from('entry_tags').insert(tagIds.map(tag_id => ({ tag_id, entry_type: 'book', entry_id: entryId! })))
    }
    toast.success(initial?.id ? 'Updated!' : 'Book added!'); setSaving(false); onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><label className="form-label">Title *</label><input value={title} onChange={e => setTitle(e.target.value)} className="form-input" placeholder="Book title" required /></div>
      <div><label className="form-label">Author</label><input value={author} onChange={e => setAuthor(e.target.value)} className="form-input" placeholder="Author name" /></div>

      {/* Status buttons */}
      <div>
        <label className="form-label">Status</label>
        <div className="grid grid-cols-2 gap-2">
          {STATUSES.map(s => (
            <button key={s.value} type="button" onClick={() => setStatus(s.value)}
              className="px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-left"
              style={{
                background: status === s.value ? s.bg : 'var(--bg-card)',
                color: status === s.value ? s.color : 'var(--text-muted)',
                borderColor: status === s.value ? s.color + '60' : 'var(--border-default)',
                boxShadow: status === s.value ? `0 0 0 2px ${s.color}25` : 'none',
              }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Page progress */}
      <div>
        <label className="form-label">Reading Progress</label>
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Current page</label>
            <input value={currentPage} onChange={e => setCurrentPage(e.target.value)} className="form-input" type="number" min="0" placeholder="0" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Total pages</label>
            <input value={totalPages} onChange={e => setTotalPages(e.target.value)} className="form-input" type="number" min="1" placeholder="e.g. 320" />
          </div>
        </div>
        {/* Progress bar */}
        {totalPages && parseInt(totalPages) > 0 && (
          <div className="rounded-2xl p-3" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Progress</span>
              <span className="text-sm font-extrabold" style={{ color: pct === 100 ? '#059669' : 'var(--text-primary)' }}>{pct}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: pct === 100 ? 'linear-gradient(90deg,#22c55e,#059669)' : 'linear-gradient(90deg,#3b82f6,#6366f1)' }} />
            </div>
            <p className="text-xs font-semibold mt-1.5" style={{ color: 'var(--text-muted)' }}>
              {currentPage} of {totalPages} pages
              {pct === 100 && ' · 🎉 Completed!'}
            </p>
          </div>
        )}
      </div>

      <div><label className="form-label">Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} className="form-textarea" rows={3} placeholder="Your reading notes..." /></div>
      <div><label className="form-label">Key Takeaways</label><textarea value={keyTakeaways} onChange={e => setKeyTakeaways(e.target.value)} className="form-textarea" rows={2} placeholder="Main lessons learned..." /></div>

      <div className="grid grid-cols-2 gap-3">
        <div><label className="form-label">Industry</label>
          <select value={industry} onChange={e => setIndustry(e.target.value)} className="form-select">
            <option value="">None</option>{INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div><label className="form-label">Started</label>
          <input type="date" value={startedAt} onChange={e => setStartedAt(e.target.value)} className="form-input" />
        </div>
      </div>

      <div>
        <label className="form-label">Impact</label>
        <div className="grid grid-cols-4 gap-2">
          {IMPACT_LEVELS.map(level => { const cfg = IMPACT_CONFIG[level]; return (
            <button key={level} type="button" onClick={() => setImpactLevel(level)}
              className="px-2 py-2 rounded-xl text-xs font-bold border transition-all"
              style={{ background: impactLevel === level ? cfg.bg : 'var(--bg-card)', color: impactLevel === level ? cfg.color : 'var(--text-muted)', borderColor: impactLevel === level ? cfg.border : 'var(--border-default)', boxShadow: impactLevel === level ? `0 0 0 2px ${cfg.border}` : 'none' }}>
              {cfg.label}
            </button>
          )})}
        </div>
      </div>

      <div><label className="form-label">Tags</label><TagSelector selectedTagIds={tagIds} onChange={setTagIds} /></div>

      <div className="flex gap-2 pt-2 justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <BookOpen size={14} />}
          {initial?.id ? 'Update' : 'Add Book'}
        </button>
      </div>
    </form>
  )
}
