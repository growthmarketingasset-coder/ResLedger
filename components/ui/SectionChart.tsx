'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

type Period = 'week' | 'month' | 'year'
interface DataPoint { label: string; count: number; date: string }

function getYAxisTicks(maxVal: number) {
  if (maxVal <= 1) return [1, 0]
  const mid = Math.max(1, Math.ceil(maxVal / 2))
  return Array.from(new Set([maxVal, mid, 0])).sort((a, b) => b - a)
}

function buildBuckets(period: Period): DataPoint[] {
  const now = new Date()
  if (period === 'week') {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now); d.setDate(d.getDate() - (6 - i))
      return { label: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2), count: 0, date: d.toISOString().split('T')[0] }
    })
  } else if (period === 'month') {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now); d.setDate(d.getDate() - (29 - i))
      return { label: i % 6 === 0 ? `${d.getDate()}` : '', count: 0, date: d.toISOString().split('T')[0] }
    })
  } else {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
      return { label: d.toLocaleDateString('en-US', { month: 'short' }), count: 0, date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }
    })
  }
}

export default function SectionChart({ tableName, color = '#7c6cf2', label = 'entries' }: {
  tableName: string; color?: string; label?: string
}) {
  const [period, setPeriod] = useState<Period>('week')
  const [data, setData] = useState<DataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const buckets = buildBuckets(period)
    const earliest = buckets[0].date + (period === 'year' ? '-01T00:00:00Z' : 'T00:00:00Z')
    const { data: rows } = await supabase.from(tableName).select('created_at')
      .eq('user_id', user.id).gte('created_at', earliest)
    const filled = buckets.map(b => ({ ...b }))
    rows?.forEach(r => {
      const key = period === 'year' ? (r.created_at as string).slice(0, 7) : (r.created_at as string).split('T')[0]
      const pt = filled.find(p => p.date === key)
      if (pt) pt.count++
    })
    setData(filled); setLoading(false)
  }, [period, tableName])

  useEffect(() => { fetchData() }, [fetchData])

  const total = data.reduce((a, b) => a + b.count, 0)
  const maxVal = Math.max(...data.map(d => d.count), 1)
  const yAxisTicks = getYAxisTicks(maxVal)
  const activePeriods = data.filter(d => d.count > 0).length
  const half = Math.floor(data.length / 2)
  const firstH = data.slice(0, half).reduce((a, b) => a + b.count, 0)
  const secondH = data.slice(half).reduce((a, b) => a + b.count, 0)
  const trend = secondH > firstH ? 'up' : secondH < firstH ? 'down' : 'flat'
  const peak = data.reduce((best, d) => d.count > best.count ? d : best, { label: '—', count: 0, date: '' })

  const H = 84

  if (loading) return (
    <div className="rounded-2xl skeleton-pulse mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', height: 108 }} />
  )

  return (
    <div className="rounded-2xl overflow-hidden mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-5">
          <div>
            <p className="text-3xl font-extrabold tabular-nums leading-none" style={{ color: 'var(--text-primary)', letterSpacing: '-0.05em' }}>{total}</p>
            <p className="text-xs font-bold mt-0.5 uppercase" style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.06em' }}>
              {label} this {period}
            </p>
          </div>
          <div className="h-8 w-px" style={{ background: 'var(--border-subtle)' }} />
          <div>
            <p className="text-sm font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>{peak.count}</p>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Peak · {peak.label || '—'}</p>
          </div>
          {trend === 'up' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold"
              style={{ background: 'rgba(124,108,242,0.12)', color: '#d7d2ff' }}>
              <TrendingUp size={11} /> Trending up
            </span>
          )}
          {trend === 'down' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold"
              style={{ background: 'rgba(124,108,242,0.08)', color: 'var(--text-muted)' }}>
              <TrendingDown size={11} /> Slowing
            </span>
          )}
          {trend === 'flat' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
              <Minus size={11} /> Steady
            </span>
          )}
        </div>
        {/* Period tabs */}
        <div className="flex items-center gap-0.5 p-1 rounded-xl" style={{ background: 'var(--bg-hover)' }}>
          {(['week', 'month', 'year'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all"
              style={{
                background: period === p ? 'var(--bg-card)' : 'transparent',
                color: period === p ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: period === p ? 'var(--shadow-sm)' : 'none',
                letterSpacing: '-0.01em',
              }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      <div className="px-5 pt-3 pb-3">
        {total === 0 ? (
          <div className="flex items-center justify-center py-5">
            <p className="text-xs font-semibold" style={{ color: 'var(--text-faint)' }}>No entries this {period}</p>
          </div>
        ) : (
          <>
            <div className="flex gap-3">
              <div className="w-7 shrink-0 pt-1">
                <div className="flex flex-col justify-between" style={{ height: `${H}px` }}>
                  {yAxisTicks.map(tick => (
                    <span key={tick} className="text-[10px] font-semibold leading-none tabular-nums text-right" style={{ color: 'var(--text-faint)' }}>
                      {tick}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-faint)' }}>
                  Count
                </p>
              </div>

              <div className="min-w-0 flex-1">
                <div className="relative" style={{ height: `${H}px` }}>
                  {yAxisTicks.map(tick => {
                    const y = tick === 0 ? H - 1 : H - (tick / maxVal) * H
                    return (
                      <div
                        key={tick}
                        className="absolute left-0 right-0"
                        style={{
                          top: `${Math.max(0, y)}px`,
                          borderTop: `1px ${tick === 0 ? 'solid' : 'dashed'} var(--border-subtle)`,
                        }}
                      />
                    )
                  })}

                  <div
                    className="grid h-full items-end gap-2"
                    style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}
                  >
                    {data.map((d, i) => {
                      const barH = d.count === 0 ? 2 : Math.max(6, (d.count / maxVal) * (H - 10))
                      const isToday = period === 'week' && i === data.length - 1
                      return (
                        <div key={i} className="relative flex h-full items-end justify-center">
                          {d.count > 0 && (
                            <span
                              className="absolute text-[10px] font-bold tabular-nums"
                              style={{ bottom: `${barH + 6}px`, color, lineHeight: 1 }}
                            >
                              {d.count}
                            </span>
                          )}
                          <div
                            className="w-full max-w-10 rounded-t-md transition-all"
                            style={{
                              height: `${barH}px`,
                              background: d.count === 0
                                ? 'var(--border-subtle)'
                                : isToday
                                  ? color
                                  : `linear-gradient(180deg, ${color} 0%, ${color}b3 100%)`,
                              opacity: d.count === 0 ? 0.55 : 1,
                            }}
                            title={`${d.count} ${label} on ${d.date}`}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div
                  className="grid mt-2 gap-2"
                  style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}
                >
                  {data.map((d, i) => (
                    <div key={i} className="text-center">
                      {d.label && (
                        <span style={{ color: 'var(--text-faint)', fontSize: '9px', fontWeight: '700', letterSpacing: '0.03em' }}>
                          {d.label}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
              <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                {activePeriods} of {data.length} {period === 'year' ? 'periods' : 'days'} recorded activity. Zero-value bars show inactive slots, not missing data.
              </p>
              <p className="text-[11px] font-semibold tabular-nums" style={{ color: 'var(--text-faint)' }}>
                Max {maxVal}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
