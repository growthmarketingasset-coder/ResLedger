'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

// Global loader that shows on route change
export function RouteLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Show loader briefly on each route change
    setLoading(true)
    setProgress(20)
    const t1 = setTimeout(() => setProgress(60), 80)
    const t2 = setTimeout(() => setProgress(90), 200)
    const t3 = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setLoading(false)
        setProgress(0)
      }, 200)
    }, 350)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [pathname, searchParams])

  if (!loading && progress === 0) return null

  return (
    <>
      {/* Top progress bar */}
      <div
        className="fixed top-0 left-0 z-[100] h-0.5 transition-all duration-200"
        style={{
          width: `${progress}%`,
          background: 'var(--btn-primary-bg)',
          boxShadow: '0 0 10px rgba(124, 108, 242, 0.48)',
          opacity: loading ? 1 : 0,
          transition: 'width 0.2s ease, opacity 0.3s ease',
        }}
      />
      {/* Subtle page dim */}
      {loading && progress < 80 && (
        <div
          className="fixed inset-0 z-[90] pointer-events-none"
          style={{
            background: 'var(--bg-base)',
            opacity: 0.15,
            animation: 'fadeIn 0.1s ease',
          }}
        />
      )}
    </>
  )
}

// Spinner for in-component loading states
export function Spinner({ size = 16, color }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'spin 0.7s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="12" cy="12" r="9" stroke={color || 'var(--border-default)'} strokeWidth="2.5" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke={color || 'var(--accent-600)'} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

// Full-section skeleton loader
export function SectionSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
            animationDelay: `${i * 40}ms`,
          }}
        >
          {/* Top color bar */}
          <div className="h-0.5" style={{ background: 'var(--border-subtle)' }} />
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-5 w-16 rounded-full skeleton-pulse" style={{ background: 'var(--bg-hover)' }} />
            </div>
            <div className="h-4 rounded-lg skeleton-pulse" style={{ background: 'var(--bg-hover)', width: '85%' }} />
            <div className="h-3 rounded-lg skeleton-pulse" style={{ background: 'var(--bg-hover)', width: '65%' }} />
            <div className="h-3 rounded-lg skeleton-pulse" style={{ background: 'var(--bg-hover)', width: '75%' }} />
            <div className="pt-2 mt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <div className="h-3 rounded-lg skeleton-pulse" style={{ background: 'var(--bg-hover)', width: '40%' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
