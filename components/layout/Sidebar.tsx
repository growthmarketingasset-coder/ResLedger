'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, BookOpen, Link2, FileText, Wrench,
  Lightbulb, Archive, Search, LogOut, Tag, Sparkles, Brain,
  PlayCircle, BookMarked, Settings, ChevronRight, Library, Menu, X, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/learnings', label: 'Learnings', icon: BookOpen },
  { href: '/resources', label: 'Resources', icon: Link2 },
  { href: '/templates', label: 'Templates', icon: FileText },
  { href: '/tools', label: 'Tools', icon: Wrench },
  { href: '/ideas', label: 'Ideas Vault', icon: Lightbulb },
  { href: '/ai-strategy', label: 'AI Strategy', icon: Brain },
  { href: '/workshop-videos', label: 'Workshops', icon: PlayCircle },
  { href: '/case-studies', label: 'Case Studies', icon: BookMarked },
  { href: '/books', label: 'Books', icon: Library },
]

const SECONDARY_ITEMS = [
  { href: '/tags', label: 'Tags', icon: Tag },
  { href: '/archive', label: 'Archive', icon: Archive },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [signingOut, setSigningOut] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [displayName, setDisplayName] = useState<string>('')
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  useEffect(() => {
    let active = true
    const loadProfileName = async () => {
      const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      if (!active) return
      setDisplayName(data?.full_name?.trim() || '')
    }
    loadProfileName()
    return () => { active = false }
  }, [supabase, user.id])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('resledge_sidebar_collapsed')
      setDesktopCollapsed(raw === '1')
    } catch {}
  }, [])

  const fallbackName = user.email?.split('@')[0] || 'User'
  const effectiveName = displayName || fallbackName
  const initials = effectiveName.slice(0, 2).toUpperCase() || 'RL'

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  const closeMobile = () => setMobileOpen(false)

  const NavContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <div className={cn('px-5 pt-6 pb-4', mobile && 'pt-4', !mobile && desktopCollapsed && 'px-3')}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 noise relative overflow-hidden"
            style={{ background: 'var(--grad-accent)', boxShadow: '0 12px 28px rgba(124,108,242,0.28)' }}
          >
            <img src="/RL.png" alt="ResLedge" className="w-full h-full object-cover" />
          </div>
          {!desktopCollapsed && (
          <div>
            <p className="font-extrabold text-sm" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>ResLedge</p>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Knowledge OS</p>
          </div>
          )}
        </div>
      </div>

      <div className="px-3 pb-3">
        <Link
          href="/search"
          onClick={closeMobile}
          className={cn(
            'flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 border',
            !mobile && desktopCollapsed && 'justify-center px-2',
            isActive('/search') ? 'sidebar-item active' : ''
          )}
          style={!isActive('/search') ? {
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-muted)',
            background: 'var(--bg-hover)',
          } : {}}
        >
          <Search size={14} style={{ color: isActive('/search') ? 'var(--accent-500)' : 'var(--text-muted)' }} />
          {(!desktopCollapsed || mobile) && <span className="flex-1">Search</span>}
          {!mobile && !desktopCollapsed && (
            <kbd
              className="text-xs px-1.5 py-0.5 rounded-md font-mono"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-faint)',
                fontSize: '10px',
              }}
            >
              Ctrl K
            </kbd>
          )}
        </Link>
      </div>

      <div className="px-3 flex-1 overflow-y-auto pb-4">
        {!desktopCollapsed && <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--text-faint)' }}>
          Workspace
        </p>}
        <nav className="space-y-1.5 mb-5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={closeMobile} title={desktopCollapsed ? label : undefined} className={cn('sidebar-item', desktopCollapsed && !mobile && 'justify-center px-2', isActive(href) ? 'active' : '')}>
              <Icon size={15} strokeWidth={isActive(href) ? 2.25 : 2} />
              {(!desktopCollapsed || mobile) && <span className="flex-1">{label}</span>}
              {(!desktopCollapsed || mobile) && isActive(href) && <ChevronRight size={12} style={{ color: 'var(--accent-500)' }} />}
            </Link>
          ))}
        </nav>

        {!desktopCollapsed && <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--text-faint)' }}>
          Manage
        </p>}
        <nav className="space-y-1.5">
          {SECONDARY_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={closeMobile} title={desktopCollapsed ? label : undefined} className={cn('sidebar-item', desktopCollapsed && !mobile && 'justify-center px-2', isActive(href) ? 'active' : '')}>
              <Icon size={15} strokeWidth={isActive(href) ? 2.25 : 2} />
              {(!desktopCollapsed || mobile) && <span>{label}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-3">
        <div className={cn('flex items-center rounded-2xl', desktopCollapsed && !mobile ? 'justify-center p-2' : 'gap-2.5 p-3')} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 noise relative overflow-hidden"
            style={{ background: 'var(--grad-accent)' }}
          >
            <span className="relative z-10">{initials}</span>
          </div>
          {(!desktopCollapsed || mobile) && <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate capitalize" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{effectiveName}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{user.email}</p>
          </div>}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,108,242,0.12)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 border-b" style={{ background: 'rgba(17,21,29,0.92)', borderColor: 'var(--border-subtle)', backdropFilter: 'blur(14px)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 noise relative overflow-hidden" style={{ background: 'var(--grad-accent)' }}>
            <Sparkles size={14} className="text-white relative z-10" strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-sm truncate" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>ResLedge</p>
            <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>Knowledge OS</p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl border transition-all"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <button className="absolute inset-0 w-full h-full" style={{ background: 'rgba(8,10,15,0.7)' }} onClick={closeMobile} aria-label="Close navigation overlay" />
          <div className="absolute inset-y-0 left-0 w-[88vw] max-w-[340px] flex flex-col" style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-drop)' }}>
            <div className="flex items-center justify-end px-3 pt-3">
              <button
                onClick={closeMobile}
                className="p-2 rounded-xl border transition-all"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>
            <NavContent mobile />
          </div>
        </div>
      )}

      <aside
        className={cn('hidden lg:flex h-full flex-col shrink-0 relative transition-[width] duration-200', desktopCollapsed ? 'w-[78px]' : 'w-60')}
        style={{
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sidebar)',
        }}
      >
        <div className="absolute right-2 top-2 z-20">
          <button
            type="button"
            onClick={() => {
              const next = !desktopCollapsed
              setDesktopCollapsed(next)
              try { localStorage.setItem('resledge_sidebar_collapsed', next ? '1' : '0') } catch {}
            }}
            className="p-2 rounded-xl border transition-all"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
            title={desktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={desktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {desktopCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
          </button>
        </div>
        <NavContent />
      </aside>
    </>
  )
}
