'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import TagSelector from '@/components/entries/TagSelector'
import { INDUSTRIES, IMPACT_LEVELS, IMPACT_CONFIG, AI_STRATEGY_STATUSES } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Loader2, Plus, X, Link2 } from 'lucide-react'

interface AIStrategyFormProps {
  onSuccess: () => void
  onCancel: () => void
  initial?: {
    id?: string; title?: string; objective?: string; approach?: string;
    tools_used?: string; outcome?: string; status?: string;
    impact_level?: string; industry?: string; action_plan?: string;
    review_date?: string; supporting_links?: string; tagIds?: string[]
  }
}

export default function AIStrategyForm({ onSuccess, onCancel, initial }: AIStrategyFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [objective, setObjective] = useState(initial?.objective ?? '')
  const [approach, setApproach] = useState(initial?.approach ?? '')
  const [toolsUsed, setToolsUsed] = useState(initial?.tools_used ?? '')
  const [outcome, setOutcome] = useState(initial?.outcome ?? '')
  const [status, setStatus] = useState(initial?.status ?? 'draft')
  const [impactLevel, setImpactLevel] = useState(initial?.impact_level ?? 'medium')
  const [industry, setIndustry] = useState(initial?.industry ?? '')
  const [actionPlan, setActionPlan] = useState(initial?.action_plan ?? '')
  const [reviewDate, setReviewDate] = useState(initial?.review_date ?? '')
  const [tagIds, setTagIds] = useState<string[]>(initial?.tagIds ?? [])

  // Supporting links — stored as JSON array in the supporting_links column
  const parseLinks = (raw?: string): string[] => {
    if (!raw) return ['']
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) && parsed.length > 0 ? [...parsed, ''] : ['']
    } catch {
      // legacy plain text
      return raw.split('\n').filter(Boolean).concat([''])
    }
  }
  const [links, setLinks] = useState<string[]>(parseLinks(initial?.supporting_links))

  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const updateLink = (idx: number, val: string) => {
    const next = [...links]
    next[idx] = val
    // auto-add row when typing in last field
    if (idx === links.length - 1 && val.trim()) next.push('')
    setLinks(next)
  }

  const removeLink = (idx: number) => {
    setLinks(prev => {
      const next = prev.filter((_, i) => i !== idx)
      return next.length === 0 ? [''] : next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const cleanLinks = links.filter(l => l.trim())
    const payload = {
      user_id: user.id,
      title: title.trim(),
      objective: objective.trim() || null,
      approach: approach.trim() || null,
      tools_used: toolsUsed.trim() || null,
      outcome: outcome.trim() || null,
      status,
      impact_level: impactLevel,
      industry: industry || null,
      action_plan: actionPlan.trim() || null,
      review_date: reviewDate || null,
      supporting_links: cleanLinks.length > 0 ? JSON.stringify(cleanLinks) : null,
      updated_at: new Date().toISOString(),
    }

    let entryId = initial?.id
    if (entryId) {
      const { error } = await supabase.from('ai_strategies').update(payload).eq('id', entryId)
      if (error) { toast.error(error.message); setSaving(false); return }
    } else {
      const { data, error } = await supabase.from('ai_strategies').insert(payload).select().single()
      if (error) { toast.error(error.message); setSaving(false); return }
      entryId = data.id
    }

    if (entryId) {
      await supabase.from('entry_tags').delete().eq('entry_type', 'ai_strategy').eq('entry_id', entryId)
      if (tagIds.length > 0) {
        await supabase.from('entry_tags').insert(
          tagIds.map(tag_id => ({ tag_id, entry_type: 'ai_strategy', entry_id: entryId! }))
        )
      }
    }

    toast.success(initial?.id ? 'Updated!' : 'AI Strategy saved!')
    setSaving(false)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="form-label">Title *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} className="form-input"
          placeholder="e.g. AI-powered lead scoring pipeline" required />
      </div>

      <div>
        <label className="form-label">Objective</label>
        <textarea value={objective} onChange={e => setObjective(e.target.value)} className="form-textarea"
          rows={2} placeholder="What problem does this AI strategy solve?" />
      </div>

      <div>
        <label className="form-label">Approach / Method</label>
        <textarea value={approach} onChange={e => setApproach(e.target.value)} className="form-textarea"
          rows={3} placeholder="How does the strategy work? What models, prompts, or frameworks are involved?" />
      </div>

      <div>
        <label className="form-label">Tools Used</label>
        <input value={toolsUsed} onChange={e => setToolsUsed(e.target.value)} className="form-input"
          placeholder="e.g. GPT-4, LangChain, Pinecone, Claude..." />
      </div>

      <div>
        <label className="form-label">Outcome / Results</label>
        <textarea value={outcome} onChange={e => setOutcome(e.target.value)} className="form-textarea"
          rows={2} placeholder="What results did this achieve or what's the expected outcome?" />
      </div>

      <div>
        <label className="form-label">What should I DO with this?</label>
        <textarea value={actionPlan} onChange={e => setActionPlan(e.target.value)} className="form-textarea"
          rows={2} placeholder="Next steps, action items, or how to implement this..." />
      </div>

      {/* ── Supporting Links ── */}
      <div>
        <label className="form-label">Supporting Links</label>
        <div className="space-y-2">
          {links.map((link, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border transition-all"
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-default)' }}>
                <Link2 size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  type="url"
                  value={link}
                  onChange={e => updateLink(idx, e.target.value)}
                  placeholder="https://..."
                  className="flex-1 text-sm bg-transparent outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
              {links.length > 1 && link.trim() && (
                <button
                  type="button"
                  onClick={() => removeLink(idx)}
                  className="p-1.5 rounded-lg transition-all shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fff1f2'; (e.currentTarget as HTMLElement).style.color = '#ef4444' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
          Type to add more links automatically
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="form-select">
            {AI_STRATEGY_STATUSES.map(s => (
              <option key={s} value={s} className="capitalize">
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
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
          <label className="form-label">Potential Impact</label>
          <div className="grid grid-cols-2 gap-1.5">
            {IMPACT_LEVELS.map(level => {
              const cfg = IMPACT_CONFIG[level]
              return (
                <button key={level} type="button" onClick={() => setImpactLevel(level)}
                  className="px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all"
                  style={{
                    background: impactLevel === level ? cfg.bg : 'var(--bg-card)',
                    color: impactLevel === level ? cfg.color : 'var(--text-muted)',
                    borderColor: impactLevel === level ? cfg.border : 'var(--border-default)',
                    boxShadow: impactLevel === level ? `0 0 0 2px ${cfg.border}` : 'none',
                  }}>
                  {cfg.label}
                </button>
              )
            })}
          </div>
        </div>
        <div>
          <label className="form-label">Review Date</label>
          <input type="date" value={reviewDate} onChange={e => setReviewDate(e.target.value)} className="form-input" />
        </div>
      </div>

      <div>
        <label className="form-label">Tags</label>
        <TagSelector selectedTagIds={tagIds} onChange={setTagIds} />
      </div>

      <div className="flex gap-2 pt-2 justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving && <Loader2 size={15} className="animate-spin" />}
          {initial?.id ? 'Update' : 'Save Strategy'}
        </button>
      </div>
    </form>
  )
}
