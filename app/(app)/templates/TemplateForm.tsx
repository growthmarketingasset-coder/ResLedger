'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import TagSelector from '@/components/entries/TagSelector'
import { IMPACT_LEVELS, IMPACT_CONFIG } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

const TEMPLATE_CATEGORIES = ['Strategy','Analysis','Planning','Communication','Research','Operations','Sales','Marketing','Finance','AI/ML','Other']

interface TemplateFormProps {
  onSuccess: () => void
  onCancel: () => void
  initial?: {
    id?: string; title?: string; description?: string; content?: string;
    category?: string; reference_url?: string; action_plan?: string;
    impact_level?: string; tagIds?: string[]
  }
}

export default function TemplateForm({ onSuccess, onCancel, initial }: TemplateFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [referenceUrl, setReferenceUrl] = useState(initial?.reference_url ?? '')
  const [actionPlan, setActionPlan] = useState(initial?.action_plan ?? '')
  const [impactLevel, setImpactLevel] = useState(initial?.impact_level ?? 'medium')
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
      description: description.trim() || null, content: content.trim() || null,
      category: category || null, reference_url: referenceUrl.trim() || null,
      action_plan: actionPlan.trim() || null, impact_level: impactLevel,
      updated_at: new Date().toISOString(),
    }
    let entryId = initial?.id
    if (entryId) {
      const { error } = await supabase.from('templates').update(payload).eq('id', entryId)
      if (error) { toast.error(error.message); setSaving(false); return }
    } else {
      const { data, error } = await supabase.from('templates').insert(payload).select().single()
      if (error) { toast.error(error.message); setSaving(false); return }
      entryId = data.id
    }
    if (entryId) {
      await supabase.from('entry_tags').delete().eq('entry_type', 'template').eq('entry_id', entryId)
      if (tagIds.length > 0) await supabase.from('entry_tags').insert(tagIds.map(tag_id => ({ tag_id, entry_type: 'template', entry_id: entryId! })))
    }
    toast.success(initial?.id ? 'Updated!' : 'Template saved!')
    setSaving(false); onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="form-label">Title *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} className="form-input" placeholder="Template name" required />
      </div>
      <div>
        <label className="form-label">Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="form-textarea" rows={2} placeholder="When to use this template?" />
      </div>
      <div>
        <label className="form-label">Reference Link</label>
        <input value={referenceUrl} onChange={e => setReferenceUrl(e.target.value)} className="form-input" type="url" placeholder="https://... (source or inspiration)" />
      </div>
      <div>
        <label className="form-label">Content / Structure</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} className="form-textarea" rows={8} placeholder="Paste your template here — sections, prompts, frameworks..." style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }} />
      </div>
      <div>
        <label className="form-label">What should I DO with this?</label>
        <textarea value={actionPlan} onChange={e => setActionPlan(e.target.value)} className="form-textarea" rows={2} placeholder="How to use or customize this template..." />
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
          <label className="form-label">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="form-select">
            <option value="">None</option>
            {TEMPLATE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
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
          {initial?.id ? 'Update' : 'Save Template'}
        </button>
      </div>
    </form>
  )
}
