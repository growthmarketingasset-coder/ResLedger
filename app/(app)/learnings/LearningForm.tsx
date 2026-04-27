'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import TagSelector from '@/components/entries/TagSelector'
import { INDUSTRIES, IMPACT_LEVELS, IMPACT_CONFIG } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Loader2, Link2, X, Plus, Search } from 'lucide-react'

interface ResourceOption { id: string; title: string; url: string | null; resource_type: string }

interface LearningFormProps {
  onSuccess: () => void
  onCancel: () => void
  initial?: {
    id?: string; title?: string; summary?: string; details?: string; source?: string
    industry?: string; impact_level?: string; action_plan?: string; review_date?: string
    tagIds?: string[]; linked_resource_ids?: string[]
  }
}

export default function LearningForm({ onSuccess, onCancel, initial }: LearningFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [summary, setSummary] = useState(initial?.summary ?? '')
  const [details, setDetails] = useState(initial?.details ?? '')
  const [source, setSource] = useState(initial?.source ?? '')
  const [industry, setIndustry] = useState(initial?.industry ?? '')
  const [impactLevel, setImpactLevel] = useState(initial?.impact_level ?? 'medium')
  const [actionPlan, setActionPlan] = useState(initial?.action_plan ?? '')
  const [reviewDate, setReviewDate] = useState(initial?.review_date ?? '')
  const [tagIds, setTagIds] = useState<string[]>(initial?.tagIds ?? [])
  const [linkedResources, setLinkedResources] = useState<ResourceOption[]>([])
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>(initial?.linked_resource_ids ?? [])
  const [resourceSearch, setResourceSearch] = useState('')
  const [showResourcePicker, setShowResourcePicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const loadResources = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('resources').select('id, title, url, resource_type')
        .eq('user_id', user.id).eq('is_archived', false).order('title').limit(100)
      if (data) setLinkedResources(data)
    }
    loadResources()
  }, [])

  const filteredResources = linkedResources.filter(r =>
    r.title.toLowerCase().includes(resourceSearch.toLowerCase())
  )
  const selectedResObjs = linkedResources.filter(r => selectedResourceIds.includes(r.id))

  const toggleResource = (id: string) => {
    setSelectedResourceIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id, title: title.trim(),
      summary: summary.trim() || null, details: details.trim() || null,
      source: source.trim() || null, industry: industry || null,
      impact_level: impactLevel, action_plan: actionPlan.trim() || null,
      review_date: reviewDate || null, updated_at: new Date().toISOString(),
    }

    let entryId = initial?.id
    if (entryId) {
      const { error } = await supabase.from('learnings').update(payload).eq('id', entryId)
      if (error) { toast.error(error.message); setSaving(false); return }
    } else {
      const { data, error } = await supabase.from('learnings').insert(payload).select().single()
      if (error) { toast.error(error.message); setSaving(false); return }
      entryId = data.id
    }

    if (entryId) {
      // Sync tags
      await supabase.from('entry_tags').delete().eq('entry_type', 'learning').eq('entry_id', entryId)
      if (tagIds.length > 0) {
        await supabase.from('entry_tags').insert(tagIds.map(tag_id => ({ tag_id, entry_type: 'learning', entry_id: entryId! })))
      }
      // Sync linked resources as internal links
      await supabase.from('internal_links').delete()
        .eq('source_type', 'learning').eq('source_id', entryId).eq('target_type', 'resource')
      if (selectedResourceIds.length > 0) {
        await supabase.from('internal_links').insert(
          selectedResourceIds.map(rid => ({
            user_id: user.id, source_type: 'learning', source_id: entryId!,
            target_type: 'resource', target_id: rid,
          }))
        )
      }
    }

    toast.success(initial?.id ? 'Updated!' : 'Learning saved!')
    setSaving(false); onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="form-label">Title *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} className="form-input" placeholder="What did you learn?" required />
      </div>
      <div>
        <label className="form-label">Summary</label>
        <textarea value={summary} onChange={e => setSummary(e.target.value)} className="form-textarea" rows={2} placeholder="One-line takeaway..." />
      </div>
      <div>
        <label className="form-label">Details</label>
        <textarea value={details} onChange={e => setDetails(e.target.value)} className="form-textarea" rows={4} placeholder="Full notes, context, examples..." />
      </div>
      <div>
        <label className="form-label">What should I DO with this?</label>
        <textarea value={actionPlan} onChange={e => setActionPlan(e.target.value)} className="form-textarea" rows={2} placeholder="Next steps, how to apply this learning..." />
      </div>

      {/* Impact selector */}
      <div>
        <label className="form-label">Potential Impact</label>
        <div className="grid grid-cols-4 gap-2">
          {IMPACT_LEVELS.map(level => {
            const cfg = IMPACT_CONFIG[level]
            return (
              <button key={level} type="button" onClick={() => setImpactLevel(level)}
                className="px-2 py-2 rounded-xl text-xs font-semibold border transition-all text-center"
                style={{ background: impactLevel === level ? cfg.bg : 'var(--bg-card)', color: impactLevel === level ? cfg.color : 'var(--text-muted)', borderColor: impactLevel === level ? cfg.border : 'var(--border-default)', boxShadow: impactLevel === level ? `0 0 0 2px ${cfg.border}` : 'none' }}>
                {cfg.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Source</label>
          <input value={source} onChange={e => setSource(e.target.value)} className="form-input" placeholder="Book, article, person..." />
        </div>
        <div>
          <label className="form-label">Industry</label>
          <select value={industry} onChange={e => setIndustry(e.target.value)} className="form-select">
            <option value="">None</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>

      {/* Linked Resources */}
      <div>
        <label className="form-label">Linked Resources</label>
        {selectedResObjs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {selectedResObjs.map(r => (
              <span key={r.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: '#faf5ff', color: '#7c3aed', border: '1px solid #ddd6fe' }}>
                <Link2 size={10} />
                {r.title}
                <button type="button" onClick={() => toggleResource(r.id)} className="hover:opacity-60">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="relative">
          <button type="button" onClick={() => setShowResourcePicker(!showResourcePicker)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', borderColor: 'var(--border-subtle)' }}>
            <Plus size={12} /> Link resource
          </button>
          {showResourcePicker && (
            <div className="absolute top-full left-0 mt-1 z-30 rounded-xl w-72 animate-fade-in overflow-hidden"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-dropdown)' }}>
              <div className="flex items-center gap-2 p-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <Search size={13} style={{ color: 'var(--text-muted)' }} />
                <input type="text" value={resourceSearch} onChange={e => setResourceSearch(e.target.value)}
                  placeholder="Search resources..."
                  className="flex-1 text-sm outline-none bg-transparent" style={{ color: 'var(--text-primary)' }}
                  onKeyDown={e => e.stopPropagation()} />
              </div>
              <div className="max-h-48 overflow-y-auto p-1">
                {filteredResources.length === 0 ? (
                  <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>No resources found</p>
                ) : filteredResources.map(r => (
                  <button type="button" key={r.id} onClick={() => { toggleResource(r.id); setShowResourcePicker(false); setResourceSearch('') }}
                    className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-sm text-left transition-all"
                    style={{ background: selectedResourceIds.includes(r.id) ? 'var(--bg-hover)' : 'transparent', color: 'var(--text-primary)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = selectedResourceIds.includes(r.id) ? 'var(--bg-hover)' : 'transparent'}>
                    <Link2 size={13} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                    <span className="truncate flex-1">{r.title}</span>
                    {selectedResourceIds.includes(r.id) && <span style={{ color: '#16a34a', fontSize: '10px' }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
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
          {initial?.id ? 'Update Learning' : 'Save Learning'}
        </button>
      </div>
    </form>
  )
}
