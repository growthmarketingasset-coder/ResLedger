'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Plus, Tag, Loader2 } from 'lucide-react'

interface TagSelectorProps {
  selectedTagIds: string[]
  onChange: (tagIds: string[]) => void
}

interface TagOption { id: string; name: string; color: string }

export default function TagSelector({ selectedTagIds, onChange }: TagSelectorProps) {
  const [tags, setTags] = useState<TagOption[]>([])
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => { loadTags() }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const loadTags = async () => {
    const { data } = await supabase.from('tags').select('*').order('name')
    if (data) setTags(data)
  }

  const createTag = async (name: string) => {
    if (!name.trim() || creating) return
    setCreating(true)
    const colors = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']
    const color = colors[Math.floor(Math.random() * colors.length)]
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { setCreating(false); return }
    const { data, error } = await supabase.from('tags').insert({
      user_id: userData.user.id, name: name.trim(), color
    }).select().single()
    if (!error && data) {
      setTags(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      onChange([...selectedTagIds, data.id])
      setSearch('')
    }
    setCreating(false)
  }

  const toggle = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId))
    } else {
      onChange([...selectedTagIds, tagId])
    }
  }

  const selectedTags = tags.filter(t => selectedTagIds.includes(t.id))
  const filtered = tags.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
  const canCreate = search.trim() && !tags.find(t => t.name.toLowerCase() === search.trim().toLowerCase())

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <div
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50) }}
        className="min-h-[42px] flex flex-wrap gap-1.5 p-2.5 rounded-xl border cursor-pointer transition-all"
        style={{
          background: 'var(--bg-input)',
          borderColor: open ? '#86efac' : 'var(--border-default)',
          boxShadow: open ? '0 0 0 3px rgba(34,197,94,0.12)' : '0 1px 2px rgba(0,0,0,0.03)',
        }}
      >
        {selectedTags.map(tag => (
          <span key={tag.id}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold"
            style={{ backgroundColor: tag.color + '20', color: tag.color, border: `1px solid ${tag.color}30` }}>
            {tag.name}
            <button type="button"
              onClick={e => { e.stopPropagation(); toggle(tag.id) }}
              className="hover:opacity-60 transition-opacity">
              <X size={10} />
            </button>
          </span>
        ))}
        {selectedTags.length === 0 && (
          <span className="text-sm flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Tag size={13} /> Add tags...
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl animate-fade-in overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-dropdown)' }}>
          {/* Search input — type="text" NOT submit, and stopPropagation on keyDown to prevent form submit */}
          <div className="p-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search or create tag..."
              className="w-full text-sm outline-none bg-transparent px-1 py-0.5"
              style={{ color: 'var(--text-primary)' }}
              onKeyDown={e => {
                // CRITICAL: prevent form submission when pressing Enter inside tag dropdown
                e.stopPropagation()
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (canCreate) createTag(search)
                }
                if (e.key === 'Escape') {
                  e.preventDefault()
                  setOpen(false)
                }
              }}
            />
          </div>

          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.map(tag => (
              <button type="button" key={tag.id}
                onClick={() => toggle(tag.id)}
                className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-sm text-left transition-all"
                style={{
                  background: selectedTagIds.includes(tag.id) ? 'var(--bg-hover)' : 'transparent',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = selectedTagIds.includes(tag.id) ? 'var(--bg-hover)' : 'transparent'}>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                <span className="flex-1">{tag.name}</span>
                {selectedTagIds.includes(tag.id) && (
                  <span className="text-xs font-bold" style={{ color: '#16a34a' }}>✓</span>
                )}
              </button>
            ))}

            {canCreate && (
              <button type="button"
                onClick={() => createTag(search)}
                disabled={creating}
                className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-sm transition-all"
                style={{ color: '#16a34a' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                {creating ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                Create "{search.trim()}"
              </button>
            )}

            {filtered.length === 0 && !canCreate && (
              <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
                No tags found. Type to create one.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
