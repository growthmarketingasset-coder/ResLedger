'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Loader2, Sparkles, ArrowRight, Mail, KeyRound } from 'lucide-react'

type AuthMode = 'password' | 'magic'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('password')
  const [loading, setLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const usingMagicLink = !isSignUp && authMode === 'magic'

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()

    if (usingMagicLink) {
      await handleMagicLink()
      return
    }

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
    try {
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) throw error
      setMagicSent(true)
      toast.success('Magic link sent!')
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const switchAuthMode = (mode: AuthMode) => {
    setAuthMode(mode)
    setMagicSent(false)
  }

  const toggleSignUp = () => {
    setIsSignUp((prev) => {
      const next = !prev
      if (next) {
        setAuthMode('password')
        setMagicSent(false)
      }
      return next
    })
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(460px,0.92fr)]" style={{ background: '#0f1117' }}>
      <section
        className="relative hidden overflow-hidden lg:flex lg:min-h-screen lg:flex-col lg:justify-between"
        style={{
          background: 'linear-gradient(135deg, #5d4ce0 0%, #7364ef 56%, #5e4edf 100%)',
        }}
      >
        <div
          className="absolute -left-24 -top-24 h-72 w-72 rounded-full"
          style={{ background: 'rgba(18, 21, 29, 0.1)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)' }}
        />
        <div
          className="absolute -bottom-10 right-0 h-48 w-48 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}
        />
        <div
          className="absolute bottom-16 right-16 h-28 w-28 rounded-full"
          style={{ background: 'rgba(255,255,255,0.04)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}
        />

        <div className="relative z-10 flex items-center gap-4 px-12 pt-14">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.16)',
              boxShadow: '0 14px 28px rgba(38, 27, 110, 0.16)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <p className="text-[2rem] font-bold leading-none text-white" style={{ fontSize: '1.05rem' }}>
              ResLedge
            </p>
            <p className="mt-1 text-xs font-medium" style={{ color: 'rgba(236, 232, 255, 0.84)' }}>
              Knowledge OS
            </p>
          </div>
        </div>

        <div className="relative z-10 px-12 pb-24">
          <div className="max-w-md">
            <h1 className="text-[4rem] font-bold leading-[1.02] text-white" style={{ letterSpacing: '-0.05em' }}>
              Your personal
              <br />
              <span style={{ color: 'rgba(246, 244, 255, 0.92)' }}>knowledge ledger.</span>
            </h1>
            <p className="mt-7 max-w-sm text-xl leading-9" style={{ color: 'rgba(235, 231, 255, 0.8)', fontSize: '1.02rem' }}>
              Capture learnings, resources, ideas, and tools in one clean workspace. Built for the relentlessly curious.
            </p>

            <div className="mt-11 space-y-4">
              {['Capture learnings & insights', 'Organize with tags & links', 'Search everything instantly'].map((feat) => (
                <div key={feat} className="flex items-center gap-4">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full"
                    style={{
                      background: 'rgba(255,255,255,0.12)',
                      border: '1px solid rgba(255,255,255,0.18)',
                    }}
                  >
                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: '#f7f4ff' }} />
                  </div>
                  <span className="text-base" style={{ color: 'rgba(246, 244, 255, 0.94)' }}>
                    {feat}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-28 text-sm" style={{ color: 'rgba(232, 228, 255, 0.56)' }}>
            © {new Date().getFullYear()} ResLedge. All rights reserved.
          </p>
        </div>
      </section>

      <section
        className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10 sm:px-8"
        style={{
          background:
            'linear-gradient(135deg, #181c25 0%, #12161f 38%, #7b7f8d 100%)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at bottom right, rgba(255,255,255,0.22), transparent 28%), linear-gradient(135deg, rgba(10,12,18,0.48), rgba(10,12,18,0.12))',
          }}
        />

        <div className="relative z-10 w-full max-w-[25rem]">
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl"
              style={{
                background: 'var(--btn-primary-bg)',
                boxShadow: '0 12px 28px rgba(124, 108, 242, 0.24)',
              }}
            >
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white">ResLedge</p>
              <p className="text-xs" style={{ color: 'rgba(221, 227, 240, 0.68)' }}>
                Knowledge OS
              </p>
            </div>
          </div>

          <div
            className="rounded-[28px] px-7 py-8 sm:px-8"
            style={{
              background: 'rgba(24, 28, 37, 0.92)',
              border: '1px solid rgba(77, 87, 110, 0.36)',
              boxShadow: '0 26px 56px rgba(7, 10, 18, 0.28)',
              backdropFilter: 'blur(14px)',
            }}
          >
            <div className="mb-7">
              <h2 className="text-[2rem] font-bold text-white" style={{ letterSpacing: '-0.04em', fontSize: '1.05rem' }}>
                {magicSent ? 'Check your inbox' : isSignUp ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="mt-2 text-sm leading-6" style={{ color: 'rgba(180, 194, 218, 0.82)' }}>
                {magicSent
                  ? 'Your secure sign-in link is on the way.'
                  : isSignUp
                    ? 'Start building your knowledge ledger.'
                    : usingMagicLink
                      ? 'Enter your email and we will send a secure magic link.'
                      : 'Sign in to continue to ResLedge.'}
              </p>
            </div>

            {magicSent ? (
              <div className="py-3 text-center">
                <div
                  className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: 'var(--btn-primary-bg)', boxShadow: '0 14px 30px rgba(124, 108, 242, 0.22)' }}
                >
                  <Mail size={22} className="text-white" />
                </div>
                <p className="text-sm leading-6" style={{ color: 'rgba(180, 194, 218, 0.86)' }}>
                  Magic link sent to <strong className="text-white">{email}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => setMagicSent(false)}
                  className="mt-5 text-sm font-semibold transition-colors"
                  style={{ color: 'var(--accent-500)' }}
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <>
                {!isSignUp && (
                  <div
                    className="mb-6 grid grid-cols-2 gap-2 rounded-2xl p-1"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(110, 122, 147, 0.2)' }}
                  >
                    <button
                      type="button"
                      onClick={() => switchAuthMode('password')}
                      className="rounded-[14px] px-4 py-2.5 text-sm font-semibold transition-all"
                      style={{
                        background: authMode === 'password' ? 'var(--btn-primary-bg)' : 'transparent',
                        color: authMode === 'password' ? '#f8f9ff' : 'rgba(180, 194, 218, 0.82)',
                        boxShadow: authMode === 'password' ? '0 12px 24px rgba(124, 108, 242, 0.18)' : 'none',
                      }}
                    >
                      <span className="inline-flex items-center gap-2">
                        <KeyRound size={14} />
                        Password
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => switchAuthMode('magic')}
                      className="rounded-[14px] px-4 py-2.5 text-sm font-semibold transition-all"
                      style={{
                        background: authMode === 'magic' ? 'var(--btn-primary-bg)' : 'transparent',
                        color: authMode === 'magic' ? '#f8f9ff' : 'rgba(180, 194, 218, 0.82)',
                        boxShadow: authMode === 'magic' ? '0 12px 24px rgba(124, 108, 242, 0.18)' : 'none',
                      }}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Mail size={14} />
                        Magic link
                      </span>
                    </button>
                  </div>
                )}

                <form onSubmit={handleAuth} className="space-y-5">
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

                  {!usingMagicLink && (
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
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full justify-center rounded-2xl px-4 py-3 text-sm font-semibold text-white transition-all"
                    style={{
                      background: 'var(--btn-primary-bg)',
                      boxShadow: '0 18px 34px rgba(124, 108, 242, 0.24)',
                    }}
                  >
                    <span className="inline-flex items-center gap-2">
                      {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
                      {usingMagicLink ? 'Send magic link' : isSignUp ? 'Create account' : 'Sign in'}
                    </span>
                  </button>

                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => switchAuthMode(usingMagicLink ? 'password' : 'magic')}
                      disabled={loading}
                      className="w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors"
                      style={{
                        borderColor: 'rgba(98, 112, 139, 0.36)',
                        color: 'rgba(226, 233, 245, 0.88)',
                        background: 'rgba(255,255,255,0.01)',
                      }}
                    >
                      {usingMagicLink ? 'Use password instead' : 'Use magic link instead'}
                    </button>
                  )}
                </form>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-sm" style={{ color: 'rgba(196, 206, 223, 0.7)' }}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button type="button" onClick={toggleSignUp} className="font-semibold" style={{ color: 'var(--accent-500)' }}>
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </section>
    </div>
  )
}
