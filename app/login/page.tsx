'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Loader2, Sparkles, ArrowRight, Mail } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        toast.success('Account created! Check your email to verify.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      toast.error('Enter your email first')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      toast.error(error.message)
    } else {
      setMagicSent(true)
      toast.success('Magic link sent!')
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex"
      style={{
        background:
          'linear-gradient(135deg, color-mix(in srgb, var(--accent-600) 14%, white) 0%, var(--bg-surface) 52%, color-mix(in srgb, var(--accent-400) 12%, white) 100%)',
      }}
    >
      {/* Left decorative panel - hidden on mobile */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, var(--accent-700) 0%, var(--accent-600) 42%, #5647cf 100%)',
        }}
      >
        <div
          className="absolute top-0 left-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'var(--bg-card)', transform: 'translate(-40%, -40%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'var(--accent-400)', transform: 'translate(30%, 30%)' }}
        />
        <div
          className="absolute top-1/2 right-0 w-48 h-48 rounded-full opacity-5"
          style={{ background: 'var(--bg-card)', transform: 'translate(40%, -50%)' }}
        />

        <div className="relative flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-lg tracking-tight">ResLedge</p>
            <p className="text-xs font-medium" style={{ color: 'rgba(226, 221, 255, 0.86)' }}>
              Knowledge OS
            </p>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight" style={{ letterSpacing: '-0.03em' }}>
            Your personal
            <br />
            <span style={{ color: '#e2ddff' }}>knowledge ledger.</span>
          </h2>
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(238, 234, 255, 0.8)' }}>
            Capture learnings, resources, ideas, and tools in one clean workspace. Built for the relentlessly curious.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {['Capture learnings & insights', 'Organize with tags & links', 'Search everything instantly'].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: 'rgba(226, 221, 255, 0.14)',
                    border: '1px solid rgba(226, 221, 255, 0.24)',
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#e2ddff' }} />
                </div>
                <span className="text-sm" style={{ color: 'rgba(245, 243, 255, 0.92)' }}>
                  {feat}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs" style={{ color: 'rgba(226, 221, 255, 0.62)' }}>
          © {new Date().getFullYear()} ResLedge. All rights reserved.
        </p>
      </div>

      {/* Right - auth form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 justify-center mb-8 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--btn-primary-bg)', boxShadow: '0 12px 28px rgba(124, 108, 242, 0.24)' }}
            >
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
              ResLedge
            </span>
          </div>

          <div
            className="rounded-3xl p-7"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 4px 32px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <div className="mb-6">
              <h1 className="text-xl font-bold mb-1.5" style={{ color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {isSignUp ? 'Start building your knowledge ledger.' : 'Sign in to continue to ResLedge.'}
              </p>
            </div>

            {magicSent ? (
              <div className="text-center py-6">
                <div
                  className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'var(--btn-primary-bg)', boxShadow: '0 14px 30px rgba(124, 108, 242, 0.22)' }}
                >
                  <Mail size={20} className="text-white" />
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Check your inbox
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Magic link sent to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
                </p>
                <button
                  onClick={() => setMagicSent(false)}
                  className="mt-4 text-sm font-medium transition-colors"
                  style={{ color: 'var(--accent-500)' }}
                >
                  ← Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="form-label">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary justify-center py-2.5 mt-1"
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
                  {isSignUp ? 'Create account' : 'Sign in'}
                </button>

                <div className="relative flex items-center gap-3 py-1">
                  <div className="flex-1 h-px" style={{ background: 'var(--bg-hover)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>
                    or
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'var(--bg-hover)' }} />
                </div>

                <button
                  type="button"
                  onClick={handleMagicLink}
                  disabled={loading}
                  className="w-full btn-secondary justify-center py-2.5"
                >
                  <Mail size={15} />
                  Send magic link
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-sm mt-5" style={{ color: 'var(--text-muted)' }}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-semibold transition-colors"
              style={{ color: 'var(--accent-500)' }}
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
