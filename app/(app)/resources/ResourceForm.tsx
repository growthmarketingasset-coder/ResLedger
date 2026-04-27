'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import TagSelector from '@/components/entries/TagSelector'
import { INDUSTRIES, RESOURCE_TYPES, IMPACT_LEVELS, IMPACT_CONFIG } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

interface ResourceFormProps {
  onSuccess: () => void
  onCancel: () => void
  initial?: {
    id?: string; title?: string; url?: string; description?: string;
    resource_type?: string; industry?: string; impact_level?: string;
    action_plan?: string; review_date?: string; tagIds?: string[]
  }
}

export default function ResourceForm({ onSuccess, onCancel, initial }: ResourceFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [url, setUrl] = useState(initial?.url ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [resourceType, setResourceType] = useState(initial?.resource_type ?? 'link')
  const [industry, setIndustry] = useState(initial?.industry ?? '')
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
      url: url.trim() || null, description: description.trim() || null,
      resource_type: resourceType, industry: industry || null,
      impact_level: impactLevel, action_plan: actionPlan.trim() || null,
      review_date: reviewDate || null, updated_at: new Date().toISOString(),
    }
    let entryId = initial?.id
    if (entryId) {
      const { error } = await supabase.from('resources').update(payload).eq('id', entryId)
      if (error) { toast.error(error.message); setSaving(false); return }
    } else {
      const { data, error } = await supabase.from('resources').insert(payload).select().single()
      if (error) { toast.error(error.message); setSaving(false); return }
      entryId = data.id
    }
    if (entryId) {
      await supabase.from('entry_tags').delete().eq('entry_type', 'resource').eq('entry_id', entryId)
      if (tagIds.length > 0) await supabase.from('entry_tags').insert(tagIds.map(tag_id => ({ tag_id, entry_type: 'resource', entry_id: entryId! })))
    }
    toast.success(initial?.id ? 'Updated!' : 'Resource saved!')
    setSaving(false); onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="form-label">Title *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} className="form-input" placeholder="Resource name" required />
      </div>
      <div>
        <label className="form-label">URL</label>
        <input value={url} onChange={e => setUrl(e.target.value)} className="form-input" type="url" placeholder="https://..." />
      </div>
      <div>
        <label className="form-label">Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="form-textarea" rows={3} placeholder="What is this resource about?" />
      </div>
      <div>
        <label className="form-label">What should I DO with this?</label>
        <textarea value={actionPlan} onChange={e => setActionPlan(e.target.value)} className="form-textarea" rows={2} placeholder="How to use or apply this resource..." />
      </div>
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
          <label className="form-label">Type</label>
          <select value={resourceType} onChange={e => setResourceType(e.target.value)} className="form-select">
            {RESOURCE_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
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
          {initial?.id ? 'Update' : 'Save Resource'}
        </button>
      </div>
    </form>
  )
}
