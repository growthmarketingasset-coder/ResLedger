'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageShell from '@/components/layout/PageShell'
import EmptyState from '@/components/ui/EmptyState'
import { Tag, Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface TagItem {
  id: string
  name: string
  color: string
  count?: number
}

const PRESET_COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16']

export default function TagsPage() {
  const [tags, setTags] = useState<TagItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const supabase = createClient()

  const fetchTags = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('tags').select('*').eq('user_id', user.id).order('name')
    if (data) {
      const tagsWithCount = await Promise.all(data.map(async tag => {
        const { count } = await supabase.from('entry_tags').select('*', { count: 'exact', head: true }).eq('tag_id', tag.id)
        return { ...tag, count: count ?? 0 }
      }))
      setTags(tagsWithCount)
    }
    setLoading(false)
  }

  useEffect(() => { fetchTags() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('tags').insert({ user_id: user.id, name: newName.trim(), color: newColor })
    if (error) {
      toast.error(error.code === '23505' ? 'Tag already exists' : error.message)
    } else {
      toast.success('Tag created!'); setNewName(''); fetchTags()
    }
    setCreating(false)
  }

  const startEdit = (tag: TagItem) => { setEditingId(tag.id); setEditName(tag.name); setEditColor(tag.color) }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return
    const { error } = await supabase.from('tags').update({ name: editName.trim(), color: editColor }).eq('id', id)
    if (error) { toast.error(error.code === '23505' ? 'Tag name already exists' : error.message) }
    else { toast.success('Tag updated!'); setEditingId(null); fetchTags() }
  }

  const handleDelete = async (id: string, name: string) => {
        await supabase.from('tags').delete().eq('id', id)
    setTags(prev => prev.filter(t => t.id !== id)); toast.success('Tag deleted')
  }

  const ColorPicker = ({ selected, onSelect }: { selected: string; onSelect: (c: string) => void }) => (
    <div className="flex items-center gap-1.5 flex-wrap">
      {PRESET_COLORS.map(color => (
        <button key={color} type="button" onClick={() => onSelect(color)}
          className="w-5 h-5 rounded-full transition-all duration-150 hover:scale-110 shrink-0"
          style={{ backgroundColor: color, outline: selected === color ? `2.5px solid ${color}` : 'none', outlineOffset: '2px' }}
        />
      ))}
    </div>
  )

  return (
    <PageShell title="Tags" description="Manage your tag library">
      {/* Create form */}
      <div className="surface-card rounded-2xl p-5 mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Create new tag</h3>
        <form onSubmit={handleCreate} className="flex items-center gap-3 flex-wrap">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Tag name…" className="form-input flex-1 min-w-40" />
          <ColorPicker selected={newColor} onSelect={setNewColor} />
          <button type="submit" disabled={creating || !newName.trim()} className="btn-primary shrink-0">
            <Plus size={14} /> Create Tag
          </button>
        </form>
      </div>

      {/* Tag list */}
      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="rounded-2xl animate-pulse h-14" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }} />)}</div>
      ) : tags.length === 0 ? (
        <EmptyState icon={Tag} title="No tags yet" description="Create tags to organise and filter your entries." />
      ) : (
        <div className="space-y-2">
          {tags.map(tag => (
            <div key={tag.id} className="surface-card flex items-center gap-3 px-5 py-3.5 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              {editingId === tag.id ? (
                <>
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: editColor }} />
                  <input value={editName} onChange={e => setEditName(e.target.value)} className="form-input flex-1 py-1.5"
                    onKeyDown={e => { if (e.key === 'Enter') handleUpdate(tag.id); if (e.key === 'Escape') setEditingId(null) }} autoFocus />
                  <ColorPicker selected={editColor} onSelect={setEditColor} />
                  <button onClick={() => handleUpdate(tag.id)} className="p-1.5 rounded-lg" style={{ color: '#16a34a', background: '#f0fdf4' }}><Check size={13} /></button>
                  <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}><X size={13} /></button>
                </>
              ) : (
                <>
                  <span className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: tag.color + '20' }}>
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                  </span>
                  <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{tag.name}</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'var(--bg-base)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                    {tag.count} {tag.count === 1 ? 'entry' : 'entries'}
                  </span>
                  <button onClick={() => startEdit(tag)} className="p-1.5 rounded-lg transition-all duration-150" style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLElement).style.color = '#475569' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94a3b8' }}>
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleDelete(tag.id, tag.name)} className="p-1.5 rounded-lg transition-all duration-150" style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fff1f2'; (e.currentTarget as HTMLElement).style.color = '#ef4444' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94a3b8' }}>
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}
