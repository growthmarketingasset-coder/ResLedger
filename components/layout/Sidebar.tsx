'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, BookOpen, Link2, FileText, Wrench,
  Lightbulb, Archive, Search, LogOut, Tag, Sparkles, Brain,
  PlayCircle, BookMarked, Settings, ChevronRight, Library, Menu, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { useState } from 'react'

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

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = user.email?.slice(0, 2).toUpperCase() || 'RL'
  const emailName = user.email?.split('@')[0] || 'User'

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  const closeMobile = () => setMobileOpen(false)

  const NavContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <div className={cn('px-5 pt-6 pb-4', mobile && 'pt-4')}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 noise relative overflow-hidden"
            style={{ background: 'var(--grad-accent)', boxShadow: '0 12px 28px rgba(124,108,242,0.28)' }}
          >
            <img src="/RL.png" alt="ResLedge" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-extrabold text-sm" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>ResLedge</p>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Knowledge OS</p>
          </div>
        </div>
      </div>

      <div className="px-3 pb-3">
        <Link
          href="/search"
          onClick={closeMobile}
          className={cn(
            'flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 border',
            isActive('/search') ? 'sidebar-item active' : ''
          )}
          style={!isActive('/search') ? {
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-muted)',
            background: 'var(--bg-hover)',
          } : {}}
        >
          <Search size={14} style={{ color: isActive('/search') ? 'var(--accent-500)' : 'var(--text-muted)' }} />
          <span className="flex-1">Search</span>
          {!mobile && (
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

      <div className="px-3 flex-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--text-faint)' }}>
          Workspace
        </p>
        <nav className="space-y-1.5 mb-5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={closeMobile} className={cn('sidebar-item', isActive(href) ? 'active' : '')}>
              <Icon size={15} strokeWidth={isActive(href) ? 2.25 : 2} />
              <span className="flex-1">{label}</span>
              {isActive(href) && <ChevronRight size={12} style={{ color: 'var(--accent-500)' }} />}
            </Link>
          ))}
        </nav>

        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--text-faint)' }}>
          Manage
        </p>
        <nav className="space-y-1.5">
          {SECONDARY_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={closeMobile} className={cn('sidebar-item', isActive(href) ? 'active' : '')}>
              <Icon size={15} strokeWidth={isActive(href) ? 2.25 : 2} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2.5 p-3 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 noise relative overflow-hidden"
            style={{ background: 'var(--grad-accent)' }}
          >
            <span className="relative z-10">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate capitalize" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{emailName}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{user.email}</p>
          </div>
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
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b" style={{ background: 'rgba(17,21,29,0.92)', borderColor: 'var(--border-subtle)', backdropFilter: 'blur(14px)' }}>
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
          <div className="absolute inset-y-0 left-0 w-[86vw] max-w-[320px] flex flex-col" style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-drop)' }}>
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
        className="hidden lg:flex w-60 h-full flex-col shrink-0 relative"
        style={{
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sidebar)',
        }}
      >
        <NavContent />
      </aside>
    </>
  )
}
