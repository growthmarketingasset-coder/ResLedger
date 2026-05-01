'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageShell from '@/components/layout/PageShell'
import { User, Palette, Bell, Database, Shield, Moon, Check, Loader2, Download } from 'lucide-react'
import toast from 'react-hot-toast'

function SettingsSection({ title, description, icon: Icon, children }: { title: string; description: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="interactive-card relative rounded-2xl overflow-hidden mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
      <div className="flex items-start gap-4 px-4 py-4 sm:px-6 sm:py-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--accent-soft)', border: '1px solid rgba(124,108,242,0.12)' }}>
          <Icon size={17} style={{ color: 'var(--accent-500)' }} />
        </div>
        <div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{description}</p>
        </div>
      </div>
      <div className="px-4 py-4 sm:px-6 sm:py-5">{children}</div>
    </div>
  )
}

function SettingsRow({ label, description, children, last = false }: { label: string; description?: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3.5" style={{ borderBottom: last ? 'none' : '1px solid var(--border-subtle)' }}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {description && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{description}</p>}
      </div>
      <div className="shrink-0 w-full sm:w-auto">{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="relative inline-flex h-6 w-11 rounded-full transition-all duration-200"
      style={{ background: value ? 'var(--accent-600)' : 'var(--border-default)' }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow transition-transform duration-200"
        style={{ transform: value ? 'translateX(20px)' : 'translateX(0)', background: '#f6f7fb' }}
      />
    </button>
  )
}

type Prefs = {
  defaultIndustry?: string
  defaultImpact?: string
  compactView?: boolean
  emailNotifications?: boolean
  reviewReminders?: boolean
}

function readPrefs(): Prefs {
  try {
    return JSON.parse(localStorage.getItem('resledge_prefs') || '{}')
  } catch {
    return {}
  }
}

export default function SettingsPage() {
  const [profile, setProfile] = useState({ full_name: '', email: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [defaultIndustry, setDefaultIndustry] = useState('')
  const [defaultImpact, setDefaultImpact] = useState('medium')
  const [compactView, setCompactView] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [reviewReminders, setReviewReminders] = useState(true)
  const [exporting, setExporting] = useState(false)
  const supabase = createClient()

  const persistPrefs = (next: Prefs) => {
    const merged = { ...readPrefs(), ...next }
    localStorage.setItem('resledge_prefs', JSON.stringify(merged))
    window.dispatchEvent(new Event('resledge-prefs-changed'))
  }

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase.from('profiles').select('full_name,email').eq('id', user.id).single()
      setProfile({
        full_name: data?.full_name ?? '',
        email: data?.email ?? user.email ?? '',
      })

      const prefs = readPrefs()
      if (prefs.defaultIndustry) setDefaultIndustry(prefs.defaultIndustry)
      if (prefs.defaultImpact) setDefaultImpact(prefs.defaultImpact)
      if (prefs.compactView !== undefined) setCompactView(!!prefs.compactView)
      if (prefs.emailNotifications !== undefined) setEmailNotifications(!!prefs.emailNotifications)
      if (prefs.reviewReminders !== undefined) setReviewReminders(!!prefs.reviewReminders)
    }
    load()
  }, [supabase])

  const saveProfile = async () => {
    setSavingProfile(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSavingProfile(false)
      return
    }
    const payload = {
      id: user.id,
      email: user.email ?? profile.email,
      full_name: profile.full_name.trim() || null,
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' })
    if (error) toast.error(error.message)
    else toast.success('Profile updated')
    setSavingProfile(false)
  }

  const savePrefs = () => {
    persistPrefs({ defaultIndustry, defaultImpact, compactView, emailNotifications, reviewReminders })
    toast.success('Preferences saved')
  }

  const handleExportData = async () => {
    setExporting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const tableRead = async (table: string) => {
        const { data, error } = await supabase.from(table).select('*').eq('user_id', user.id)
        if (error) return []
        return data ?? []
      }

      const [profileData, tags, learnings, resources, templates, tools, ideas, aiStrategies, workshopVideos, caseStudies, internalLinks] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        tableRead('tags'),
        tableRead('learnings'),
        tableRead('resources'),
        tableRead('templates'),
        tableRead('tools'),
        tableRead('ideas'),
        tableRead('ai_strategies'),
        tableRead('workshop_videos'),
        tableRead('case_studies'),
        tableRead('internal_links'),
      ])

      const tagIds = (tags as any[]).map((t) => t.id)
      let entryTags: any[] = []
      if (tagIds.length > 0) {
        const { data } = await supabase.from('entry_tags').select('*').in('tag_id', tagIds)
        entryTags = data ?? []
      }

      const payload = {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        profile: profileData.data ?? null,
        settings: readPrefs(),
        data: {
          tags,
          learnings,
          resources,
          templates,
          tools,
          ideas,
          ai_strategies: aiStrategies,
          workshop_videos: workshopVideos,
          case_studies: caseStudies,
          entry_tags: entryTags,
          internal_links: internalLinks,
        },
      }

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resledge-export-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success('Data exported successfully')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'Marketing', 'Consulting', 'AI/ML', 'Other']
  const IMPACTS = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'game_changing', label: 'Game Changing' },
  ]

  return (
    <PageShell title="Settings" description="Manage your profile, defaults, and workspace preferences">
      <SettingsSection title="Profile" description="Your personal information and account details" icon={User}>
        <SettingsRow label="Display Name" description="Shown in the sidebar and dashboard greeting">
          <input value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} placeholder="Your name" className="form-input w-full sm:w-56 text-sm" />
        </SettingsRow>
        <SettingsRow label="Email" description="Your account email address" last>
          <input value={profile.email} disabled className="form-input w-full sm:w-56 text-sm opacity-60" />
        </SettingsRow>
        <div className="pt-4 flex justify-end">
          <button onClick={saveProfile} disabled={savingProfile} className="btn-primary sm:w-auto">
            {savingProfile && <Loader2 size={14} className="animate-spin" />}
            Save Profile
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Appearance" description="ResLedge now uses a single premium dark workspace by default" icon={Palette}>
        <div className="rounded-2xl p-4" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-soft)', border: '1px solid rgba(124,108,242,0.14)' }}>
              <Moon size={18} style={{ color: 'var(--accent-500)' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Dark mode is standard</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>The interface now stays in the calm analytics theme everywhere for consistency and readability.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(124,108,242,0.12)', color: 'var(--accent-400)' }}>
              <Check size={12} />
              Active
            </span>
          </div>
        </div>
        <div className="pt-4">
          <SettingsRow label="Compact Card View" description="Show denser cards with less whitespace" last>
            <Toggle value={compactView} onChange={v => { setCompactView(v); persistPrefs({ compactView: v }); toast.success(v ? 'Compact view enabled' : 'Comfort view enabled') }} />
          </SettingsRow>
        </div>
      </SettingsSection>

      <SettingsSection title="Entry Defaults" description="Pre-fill common values when creating new entries" icon={Database}>
        <SettingsRow label="Default Industry" description="Auto-selected when creating a new entry">
          <select value={defaultIndustry} onChange={e => setDefaultIndustry(e.target.value)} className="form-select w-full sm:w-56 text-sm">
            <option value="">None</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </SettingsRow>
        <SettingsRow label="Default Impact Level" description="Starting impact level for new entries" last>
          <select value={defaultImpact} onChange={e => setDefaultImpact(e.target.value)} className="form-select w-full sm:w-56 text-sm">
            {IMPACTS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
          </select>
        </SettingsRow>
        <div className="pt-4 flex justify-end">
          <button onClick={savePrefs} className="btn-primary sm:w-auto">Save Defaults</button>
        </div>
      </SettingsSection>

      <SettingsSection title="Notifications" description="Control when ResLedge alerts you" icon={Bell}>
        <SettingsRow label="Email Notifications" description="Enable reminder and review notification preferences">
          <Toggle value={emailNotifications} onChange={v => { setEmailNotifications(v); persistPrefs({ emailNotifications: v }); toast.success(v ? 'Email notifications enabled' : 'Email notifications disabled') }} />
        </SettingsRow>
        <SettingsRow label="Review Reminders" description="Turn on reminders for entries with review dates" last>
          <Toggle value={reviewReminders} onChange={v => { setReviewReminders(v); persistPrefs({ reviewReminders: v }); toast.success(v ? 'Review reminders enabled' : 'Review reminders disabled') }} />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Account" description="Manage your workspace data" icon={Shield}>
        <SettingsRow label="Export Data" description="Download your entries, links, tags, and settings as JSON">
          <button onClick={handleExportData} disabled={exporting} className="btn-secondary text-sm sm:w-auto">
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Export
          </button>
        </SettingsRow>
        <SettingsRow label="Delete Account" description="Permanently delete your account and all data" last>
          <button
            onClick={() => toast.error('Please contact support to delete your account')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all w-full sm:w-auto justify-center"
            style={{ background: 'rgba(255,120,146,0.08)', color: '#f3b3c1', border: '1px solid rgba(255,120,146,0.16)' }}
          >
            Delete Account
          </button>
        </SettingsRow>
      </SettingsSection>

      <div className="text-center pt-4 pb-8">
        <p className="text-xs" style={{ color: 'var(--text-faint)' }}>ResLedge v5 · Built with Next.js + Supabase</p>
      </div>
    </PageShell>
  )
}
