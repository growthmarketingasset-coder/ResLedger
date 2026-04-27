'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import TagSelector from '@/components/entries/TagSelector'
import { INDUSTRIES, IDEA_STATUSES, IMPACT_LEVELS, IMPACT_CONFIG } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

interface IdeaFormProps {
  onSuccess: () => void
  onCancel: () => void
  initial?: {
    id?: string; title?: string; description?: string; status?: string;
    industry?: string; potential?: string; impact_level?: string;
    action_plan?: string; review_date?: string; tagIds?: string[]
  }
}

export default function IdeaForm({ onSuccess, onCancel, initial }: IdeaFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [status, setStatus] = useState(initial?.status ?? 'raw')
  const [industry, setIndustry] = useState(initial?.industry ?? '')
  const [potential, setPotential] = useState(initial?.potential ?? '')
  const [impactLevel, setImpactLevel] = useState(initial?.impact_level ?? 'medium')
  const [actionPlan, setActionPlan] = useState(initial?.action_plan ?? '')
  const [reviewDate, setReviewDate] = useState(initial?.review_date ?? '')
  const [tagIds, setTagIds] = useState<string[]>(initial?.tagIds ?? [])
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const payload = {
      user_id: user.id, title: title.trim(),
      description: description.trim() || null, status,
      industry: industry || null, potential: potential.trim() || null,
      impact_level: impactLevel, action_plan: actionPlan.trim() || null,
      review_date: reviewDate || null, updated_at: new Date().toISOString(),
    }
    let entryId = initial?.id
    if (entryId) {
      const { error } = await supabase.from('ideas').update(payload).eq('id', entryId)
      if (error) { toast.error(error.message); setSaving(false); return }
    } else {
      const { data, error } = await supabase.from('ideas').insert(payload).select().single()
      if (error) { toast.error(error.message); setSaving(false); return }
      entryId = data.id
    }
    if (entryId) {
      await supabase.from('entry_tags').delete().eq('entry_type', 'idea').eq('entry_id', entryId)
      if (tagIds.length > 0) await supabase.from('entry_tags').insert(tagIds.map(tag_id => ({ tag_id, entry_type: 'idea', entry_id: entryId! })))
    }
    toast.success(initial?.id ? 'Updated!' : 'Idea saved!')
    setSaving(false); onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="form-label">Title *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} className="form-input" placeholder="What's the idea?" required />
      </div>
      <div>
        <label className="form-label">Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="form-textarea" rows={4} placeholder="Describe the idea, problem it solves, how it could work..." />
      </div>
      <div>
        <label className="form-label">Potential / Impact Narrative</label>
        <textarea value={potential} onChange={e => setPotential(e.target.value)} className="form-textarea" rows={2} placeholder="Why does this matter? What's the upside?" />
      </div>
      <div>
        <label className="form-label">What should I DO with this?</label>
        <textarea value={actionPlan} onChange={e => setActionPlan(e.target.value)} className="form-textarea" rows={2} placeholder="Next steps, how to validate or execute this idea..." />
      </div>

      {/* Impact level visual selector */}
      <div>
        <label className="form-label">Potential Impact</label>
        <div className="grid grid-cols-4 gap-2">
          {IMPACT_LEVELS.map(level => {
            const cfg = IMPACT_CONFIG[level]
            return (
              <button key={level} type="button" onClick={() => setImpactLevel(level)}
                className="px-2 py-2 rounded-xl text-xs font-semibold border transition-all text-center"
                style={{ background: impactLevel === level ? cfg.bg : 'white', color: impactLevel === level ? cfg.color : '#94a3b8', borderColor: impactLevel === level ? cfg.border : '#e8edf2', boxShadow: impactLevel === level ? `0 0 0 2px ${cfg.border}` : 'none' }}>
                {cfg.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="form-select">
            {IDEA_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Industry</label>
          <select value={industry} onChange={e => setIndustry(e.target.value)} className="form-select">
            <option value="">None</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Review Date</label>
          <input type="date" value={reviewDate} onChange={e => setReviewDate(e.target.value)} className="form-input" />
        </div>
        <div>
          <label className="form-label">Tags</label>
          <TagSelector selectedTagIds={tagIds} onChange={setTagIds} />
        </div>
      </div>

      <div className="flex gap-2 pt-2 justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving && <Loader2 size={15} className="animate-spin" />}
          {initial?.id ? 'Update' : 'Save Idea'}
        </button>
      </div>
    </form>
  )
}
