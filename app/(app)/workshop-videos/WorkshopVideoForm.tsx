'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import TagSelector from '@/components/entries/TagSelector'
import { IMPACT_LEVELS, IMPACT_CONFIG } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

interface WorkshopVideoFormProps {
  onSuccess: () => void; onCancel: () => void
  initial?: { id?: string; title?: string; url?: string; description?: string; module_number?: number; duration?: string; instructor?: string; course_name?: string; notes?: string; action_plan?: string; impact_level?: string; tagIds?: string[] }
}

export default function WorkshopVideoForm({ onSuccess, onCancel, initial }: WorkshopVideoFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [url, setUrl] = useState(initial?.url ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [courseName, setCourseName] = useState(initial?.course_name ?? '')
  const [moduleNumber, setModuleNumber] = useState(initial?.module_number?.toString() ?? '')
  const [duration, setDuration] = useState(initial?.duration ?? '')
  const [instructor, setInstructor] = useState(initial?.instructor ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [actionPlan, setActionPlan] = useState(initial?.action_plan ?? '')
  const [impactLevel, setImpactLevel] = useState(initial?.impact_level ?? 'medium')
  const [tagIds, setTagIds] = useState<string[]>(initial?.tagIds ?? [])
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { toast.error('Title required'); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const payload = {
      user_id: user.id, title: title.trim(), url: url.trim() || null,
      description: description.trim() || null, course_name: courseName.trim() || null,
      module_number: moduleNumber ? parseInt(moduleNumber) : null,
      duration: duration.trim() || null, instructor: instructor.trim() || null,
      notes: notes.trim() || null, action_plan: actionPlan.trim() || null,
      impact_level: impactLevel, updated_at: new Date().toISOString(),
    }
    let entryId = initial?.id
    if (entryId) {
      const { error } = await supabase.from('workshop_videos').update(payload).eq('id', entryId)
      if (error) { toast.error(error.message); setSaving(false); return }
    } else {
      const { data, error } = await supabase.from('workshop_videos').insert(payload).select().single()
      if (error) { toast.error(error.message); setSaving(false); return }
      entryId = data.id
    }
    if (entryId) {
      await supabase.from('entry_tags').delete().eq('entry_type', 'workshop_video').eq('entry_id', entryId)
      if (tagIds.length > 0) await supabase.from('entry_tags').insert(tagIds.map(tag_id => ({ tag_id, entry_type: 'workshop_video', entry_id: entryId! })))
    }
    toast.success(initial?.id ? 'Updated!' : 'Video saved!'); setSaving(false); onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><label className="form-label">Title *</label><input value={title} onChange={e => setTitle(e.target.value)} className="form-input" placeholder="Video title" required /></div>
      <div><label className="form-label">Video URL</label><input value={url} onChange={e => setUrl(e.target.value)} className="form-input" type="url" placeholder="https://youtube.com/..." /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="form-label">Course / Program</label><input value={courseName} onChange={e => setCourseName(e.target.value)} className="form-input" placeholder="Course name" /></div>
        <div><label className="form-label">Module #</label><input value={moduleNumber} onChange={e => setModuleNumber(e.target.value)} className="form-input" type="number" min="1" placeholder="1" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="form-label">Duration</label><input value={duration} onChange={e => setDuration(e.target.value)} className="form-input" placeholder="e.g. 45 min" /></div>
        <div><label className="form-label">Instructor</label><input value={instructor} onChange={e => setInstructor(e.target.value)} className="form-input" placeholder="Instructor name" /></div>
      </div>
      <div><label className="form-label">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="form-textarea" rows={2} placeholder="What is this video about?" /></div>
      <div><label className="form-label">Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} className="form-textarea" rows={3} placeholder="Key takeaways from this video..." /></div>
      <div><label className="form-label">What should I DO with this?</label><textarea value={actionPlan} onChange={e => setActionPlan(e.target.value)} className="form-textarea" rows={2} placeholder="Action steps..." /></div>
      <div>
        <label className="form-label">Potential Impact</label>
        <div className="grid grid-cols-4 gap-2">
          {IMPACT_LEVELS.map(level => { const cfg = IMPACT_CONFIG[level]; return (
            <button key={level} type="button" onClick={() => setImpactLevel(level)}
              className="px-2 py-2 rounded-xl text-xs font-semibold border transition-all text-center"
              style={{ background: impactLevel === level ? cfg.bg : 'var(--bg-card)', color: impactLevel === level ? cfg.color : 'var(--text-muted)', borderColor: impactLevel === level ? cfg.border : 'var(--border-default)', boxShadow: impactLevel === level ? `0 0 0 2px ${cfg.border}` : 'none' }}>
              {cfg.label}
            </button>
          ) })}
        </div>
      </div>
      <div><label className="form-label">Tags</label><TagSelector selectedTagIds={tagIds} onChange={setTagIds} /></div>
      <div className="flex gap-2 pt-2 justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">{saving && <Loader2 size={15} className="animate-spin" />}{initial?.id ? 'Update' : 'Save Video'}</button>
      </div>
    </form>
  )
}
