'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import TagSelector from '@/components/entries/TagSelector'
import { INDUSTRIES, IMPACT_LEVELS, IMPACT_CONFIG } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

interface CaseStudyFormProps {
  onSuccess: () => void; onCancel: () => void
  initial?: { id?: string; title?: string; summary?: string; problem?: string; solution?: string; result?: string; industry?: string; client_context?: string; tools_used?: string; url?: string; action_plan?: string; impact_level?: string; tagIds?: string[] }
}

export default function CaseStudyForm({ onSuccess, onCancel, initial }: CaseStudyFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [summary, setSummary] = useState(initial?.summary ?? '')
  const [problem, setProblem] = useState(initial?.problem ?? '')
  const [solution, setSolution] = useState(initial?.solution ?? '')
  const [result, setResult] = useState(initial?.result ?? '')
  const [industry, setIndustry] = useState(initial?.industry ?? '')
  const [clientContext, setClientContext] = useState(initial?.client_context ?? '')
  const [toolsUsed, setToolsUsed] = useState(initial?.tools_used ?? '')
  const [url, setUrl] = useState(initial?.url ?? '')
  const [actionPlan, setActionPlan] = useState(initial?.action_plan ?? '')
  const [impactLevel, setImpactLevel] = useState(initial?.impact_level ?? 'medium')
  const [tagIds, setTagIds] = useState<string[]>(initial?.tagIds ?? [])
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { toast.error('Title required'); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return
    const payload = {
      user_id: user.id, title: title.trim(), summary: summary.trim() || null,
      problem: problem.trim() || null, solution: solution.trim() || null,
      result: result.trim() || null, industry: industry || null,
      client_context: clientContext.trim() || null, tools_used: toolsUsed.trim() || null,
      url: url.trim() || null, action_plan: actionPlan.trim() || null,
      impact_level: impactLevel, updated_at: new Date().toISOString(),
    }
    let entryId = initial?.id
    if (entryId) {
      const { error } = await supabase.from('case_studies').update(payload).eq('id', entryId)
      if (error) { toast.error(error.message); setSaving(false); return }
    } else {
      const { data, error } = await supabase.from('case_studies').insert(payload).select().single()
      if (error) { toast.error(error.message); setSaving(false); return }
      entryId = data.id
    }
    if (entryId) {
      await supabase.from('entry_tags').delete().eq('entry_type', 'case_study').eq('entry_id', entryId)
      if (tagIds.length > 0) await supabase.from('entry_tags').insert(tagIds.map(tag_id => ({ tag_id, entry_type: 'case_study', entry_id: entryId! })))
    }
    toast.success(initial?.id ? 'Updated!' : 'Case study saved!'); setSaving(false); onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><label className="form-label">Title *</label><input value={title} onChange={e => setTitle(e.target.value)} className="form-input" placeholder="Case study title" required /></div>
      <div><label className="form-label">Summary</label><textarea value={summary} onChange={e => setSummary(e.target.value)} className="form-textarea" rows={2} placeholder="One-line summary of this case study..." /></div>
      <div><label className="form-label">Problem / Challenge</label><textarea value={problem} onChange={e => setProblem(e.target.value)} className="form-textarea" rows={3} placeholder="What problem was being solved?" /></div>
      <div><label className="form-label">Solution / Approach</label><textarea value={solution} onChange={e => setSolution(e.target.value)} className="form-textarea" rows={3} placeholder="What strategy or solution was applied?" /></div>
      <div><label className="form-label">Results / Outcomes</label><textarea value={result} onChange={e => setResult(e.target.value)} className="form-textarea" rows={2} placeholder="What were the measurable results?" /></div>
      <div><label className="form-label">Client / Context</label><input value={clientContext} onChange={e => setClientContext(e.target.value)} className="form-input" placeholder="Company size, sector, context..." /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="form-label">Industry</label>
          <select value={industry} onChange={e => setIndustry(e.target.value)} className="form-select">
            <option value="">None</option>{INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div><label className="form-label">Tools Used</label><input value={toolsUsed} onChange={e => setToolsUsed(e.target.value)} className="form-input" placeholder="e.g. HubSpot, SEMrush..." /></div>
      </div>
      <div><label className="form-label">Reference URL</label><input value={url} onChange={e => setUrl(e.target.value)} className="form-input" type="url" placeholder="https://..." /></div>
      <div><label className="form-label">What should I DO with this?</label><textarea value={actionPlan} onChange={e => setActionPlan(e.target.value)} className="form-textarea" rows={2} placeholder="How to apply or replicate..." /></div>
      <div>
        <label className="form-label">Potential Impact</label>
        <div className="grid grid-cols-4 gap-2">
          {IMPACT_LEVELS.map(level => { const cfg = IMPACT_CONFIG[level]; return (
            <button key={level} type="button" onClick={() => setImpactLevel(level)}
              className="px-2 py-2 rounded-xl text-xs font-semibold border transition-all text-center"
              style={{ background: impactLevel === level ? cfg.bg : 'var(--bg-card)', color: impactLevel === level ? cfg.color : 'var(--text-muted)', borderColor: impactLevel === level ? cfg.border : 'var(--border-default)', boxShadow: impactLevel === level ? `0 0 0 2px ${cfg.border}` : 'none' }}>
              {cfg.label}
            </button>
          )})}
        </div>
      </div>
      <div><label className="form-label">Tags</label><TagSelector selectedTagIds={tagIds} onChange={setTagIds} /></div>
      <div className="flex gap-2 pt-2 justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">{saving && <Loader2 size={15} className="animate-spin" />}{initial?.id ? 'Update' : 'Save Case Study'}</button>
      </div>
    </form>
  )
}
