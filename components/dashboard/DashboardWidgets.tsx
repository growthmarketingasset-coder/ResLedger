'use client'

import Link from 'next/link'
import { ArrowRight, AlertTriangle, CheckCircle2, Calendar, Zap } from 'lucide-react'
import { ENTRY_TYPE_LABELS, IMPACT_CONFIG, formatRelative } from '@/lib/utils'
import EmptyState from '@/components/ui/EmptyState'

interface BarData { label: string; learnings: number; resources: number }

function getChartTicks(maxVal: number) {
  if (maxVal <= 1) return [1, 0]
  const mid = Math.max(1, Math.ceil(maxVal / 2))
  return Array.from(new Set([maxVal, mid, 0])).sort((a, b) => b - a)
}

export function ActivityBarChart({ data }: { data: BarData[] }) {
  const maxVal = Math.max(...data.flatMap(d => [d.learnings, d.resources]), 1)
  const ticks = getChartTicks(maxVal)
  const activeDays = data.filter(d => d.learnings + d.resources > 0).length
  const W = 360; const H = 108; const barGap = 3; const groupGap = 8

  const totalBars = data.length * 2
  const totalGaps = data.length * barGap + (data.length - 1) * groupGap
  const barW = Math.max(6, (W - totalGaps) / totalBars)

  let x = 0
  const rects: JSX.Element[] = []
  const labels: { x: number; label: string }[] = []

  data.forEach((d, i) => {
    const lH = Math.max((d.learnings / maxVal) * H, d.learnings > 0 ? 5 : 0)
    const rH = Math.max((d.resources / maxVal) * H, d.resources > 0 ? 5 : 0)
    const cx = x + barW + barGap / 2

    rects.push(
      <rect
        key={`l${i}`}
        x={x}
        y={H - lH}
        width={barW}
        height={lH}
        rx="3"
        fill="url(#barLearnings)"
        aria-label={`${d.learnings} learnings on ${d.label}`}
      />
    )
    x += barW + barGap
    rects.push(
      <rect
        key={`r${i}`}
        x={x}
        y={H - rH}
        width={barW}
        height={rH}
        rx="3"
        fill="url(#barResources)"
        aria-label={`${d.resources} resources on ${d.label}`}
      />
    )
    x += barW + groupGap
    labels.push({ x: cx, label: d.label })
  })

  return (
    <div className="w-full">
      <div className="flex gap-2 sm:gap-3">
        <div className="w-8 shrink-0 pt-1">
          <div className="flex h-[108px] flex-col justify-between">
            {ticks.map(tick => (
              <span key={tick} className="text-[11px] font-semibold leading-none tabular-nums text-right" style={{ color: 'var(--text-faint)' }}>
                {tick}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-faint)' }}>
            Count
          </p>
        </div>

        <div className="min-w-0 flex-1 overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H + 16}`} style={{ width: '100%', minWidth: '320px', height: 'auto', overflow: 'visible' }}>
            <defs>
              <linearGradient id="barLearnings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9f94ff" />
                <stop offset="100%" stopColor="#7c6cf2" />
              </linearGradient>
              <linearGradient id="barResources" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c2bbff" />
                <stop offset="100%" stopColor="#8f81f6" />
              </linearGradient>
            </defs>
            {ticks.map(tick => {
              const y = tick === 0 ? H : H - (tick / maxVal) * H
              return (
                <line
                  key={tick}
                  x1="0"
                  y1={y}
                  x2={W}
                  y2={y}
                  stroke="var(--border-subtle)"
                  strokeWidth="0.5"
                  strokeDasharray={tick === 0 ? undefined : '3,3'}
                />
              )
            })}
            {rects}
            {labels.map(({ x: lx, label }) => (
              <text key={lx} x={lx} y={H + 14} textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontFamily="inherit">
                {label}
              </text>
            ))}
          </svg>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: '#8f81f6' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Learnings</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: '#c2bbff' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Resources</span>
        </div>
      </div>

      <p className="mt-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
        {activeDays} of {data.length} days show activity. Empty slots represent zero items captured on those days.
      </p>
    </div>
  )
}

export function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100)
  return (
    <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

interface ImpactSlice { level: string; count: number; color: string }
export function ImpactDonut({ slices, total }: { slices: ImpactSlice[]; total: number }) {
  const size = 110; const cx = 55; const cy = 55; const r = 38; const stroke = 12
  const circumference = 2 * Math.PI * r
  let cumPct = 0

  return (
    <div className="flex w-full flex-col items-center gap-4 py-2 sm:grid sm:grid-cols-[108px_minmax(0,1fr)] sm:items-center sm:gap-5 sm:py-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="h-[96px] w-[96px] shrink-0 sm:h-[108px] sm:w-[108px]">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth={stroke} />
        {slices.filter(s => s.count > 0).map((slice) => {
          const pct = total === 0 ? 0 : slice.count / total
          const dash = circumference * pct
          const gap = circumference - dash
          const offset = circumference * 0.25 - cumPct * circumference
          cumPct += pct
          return (
            <circle
              key={slice.level}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={slice.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={offset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
            />
          )
        })}
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="24" fontWeight="800" fill="var(--text-primary)" fontFamily="inherit">
          {total}
        </text>
      </svg>
      <div className="w-full max-w-[280px] space-y-1.5">
        {slices.map(s => (
          <div key={s.level} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
              <span className="text-base font-medium leading-5 sm:text-[18px]" style={{ color: 'var(--text-secondary)' }}>{IMPACT_CONFIG[s.level]?.label ?? s.level}</span>
            </div>
            <span className="text-xl font-semibold tabular-nums sm:text-[22px]" style={{ color: 'var(--text-primary)' }}>{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface GapItem { industry: string; count: number; maxCount: number }

export function KnowledgeGaps({ gaps, totalIndustries }: { gaps: GapItem[]; totalIndustries: number }) {
  const maxCount = Math.max(...gaps.map(g => g.count), 1)
  return (
    <div className="space-y-2.5">
      {gaps.length === 0 ? (
        <EmptyState dense icon={CheckCircle2} title="No Industry Data Yet" description="Tag entries with industries to see coverage." />
      ) : (
        gaps.map(g => (
          <div key={g.industry}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{g.industry}</span>
              <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--text-secondary)' }}>{g.count}</span>
            </div>
            <ProgressBar value={g.count} max={maxCount} color="var(--accent-600)" />
          </div>
        ))
      )}
      {totalIndustries > 8 && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>+{totalIndustries - 8} more industries</p>
      )}
    </div>
  )
}

interface ReviewItem { id: string; title: string; type: string; created_at: string; tableKey: string }
export function NotReviewedList({ items }: { items: ReviewItem[] }) {
  const TYPE_PILL: Record<string, { bg: string; text: string }> = {
    learning: { bg: 'rgba(124,108,242,0.08)', text: '#d7d2ff' },
    resource: { bg: 'rgba(124,108,242,0.14)', text: '#f3f1ff' },
    tool: { bg: 'rgba(124,108,242,0.10)', text: '#d7d2ff' },
    idea: { bg: 'rgba(124,108,242,0.08)', text: '#c7c0ff' },
    ai_strategy: { bg: 'rgba(124,108,242,0.16)', text: '#f3f1ff' },
  }

  if (items.length === 0) return <EmptyState dense icon={CheckCircle2} title="All Reviewed" description="You are caught up on entry reviews." />

  return (
    <div className="space-y-1.5">
      {items.slice(0, 5).map(item => {
        const pill = TYPE_PILL[item.type] || { bg: 'var(--bg-hover)', text: 'var(--text-secondary)' }
        return (
          <Link key={`${item.type}-${item.id}`} href={`/${item.tableKey}/${item.id}`}>
            <div className="row-item flex flex-wrap items-center gap-2 px-3 py-2.5 rounded-xl transition-all group cursor-pointer sm:flex-nowrap sm:gap-3">
              <AlertTriangle size={13} style={{ color: 'var(--accent-500)', flexShrink: 0 }} />
              <span className="min-w-0 flex-1 text-sm font-medium transition-colors sm:truncate group-hover:text-[var(--accent-400)]" style={{ color: 'var(--text-primary)' }}>
                {item.title}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0" style={{ background: pill.bg, color: pill.text }}>
                {ENTRY_TYPE_LABELS[item.type] || item.type}
              </span>
              <ArrowRight size={11} className="ml-auto shrink-0 opacity-100 transition-opacity lg:opacity-0 group-hover:opacity-100" style={{ color: 'var(--accent-500)' }} />
            </div>
          </Link>
        )
      })}
    </div>
  )
}

interface HighPotentialItem { id: string; title: string; type: string; impact_level: string; tableKey: string }
export function HighPotentialList({ items }: { items: HighPotentialItem[] }) {
  if (items.length === 0) return <EmptyState dense icon={Zap} title="No High Impact Yet" description="Mark entries as high impact to surface them here." />

  return (
    <div className="space-y-1.5">
      {items.slice(0, 5).map(item => {
        const cfg = IMPACT_CONFIG[item.impact_level]
        return (
          <Link key={`${item.type}-${item.id}`} href={`/${item.tableKey}/${item.id}`}>
            <div className="row-item flex flex-wrap items-center gap-2 px-3 py-2.5 rounded-xl transition-all group cursor-pointer sm:flex-nowrap sm:gap-3">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg?.color || 'var(--accent-500)' }} />
              <span className="min-w-0 flex-1 text-sm font-medium transition-colors sm:truncate group-hover:text-[var(--accent-400)]" style={{ color: 'var(--text-primary)' }}>
                {item.title}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0" style={{ background: cfg?.bg, color: cfg?.color, border: `1px solid ${cfg?.border}` }}>
                {cfg?.label || item.impact_level}
              </span>
              <ArrowRight size={11} className="ml-auto shrink-0 opacity-100 transition-opacity lg:opacity-0 group-hover:opacity-100" style={{ color: 'var(--accent-500)' }} />
            </div>
          </Link>
        )
      })}
    </div>
  )
}

interface WeeklyStats {
  newEntries: number; newLearnings: number; newResources: number
  newIdeas: number; reviewed: number; highImpact: number; streak: number
}

export function WeeklyReport({ stats, userName }: { stats: WeeklyStats; userName: string }) {
  const today = new Date()
  const weekStart = new Date(today); weekStart.setDate(today.getDate() - 6)
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden h-full flex flex-col"
      style={{ background: 'linear-gradient(180deg, rgba(124,108,242,0.10) 0%, rgba(26,29,36,1) 42%)', border: '1px solid rgba(124,108,242,0.16)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, rgba(124,108,242,0.22) 0%, transparent 72%)', transform: 'translate(30%,-30%)' }} />
      <div className="relative flex-1 flex flex-col">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] mb-1" style={{ color: 'var(--text-faint)' }}>Weekly Report</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{fmt(weekStart)} - {fmt(today)}</p>
          </div>
          <div className="flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 sm:w-auto" style={{ background: 'rgba(124,108,242,0.12)', border: '1px solid rgba(124,108,242,0.18)' }}>
            <Calendar size={12} style={{ color: 'var(--accent-500)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--accent-400)' }}>{stats.streak}d streak</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: 'New Entries', value: stats.newEntries },
            { label: 'Reviewed', value: stats.reviewed },
            { label: 'Learnings', value: stats.newLearnings },
            { label: 'High Impact', value: stats.highImpact },
          ].map(s => (
            <div key={s.label} className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.03)' }}>
              <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--accent-400)', letterSpacing: '-0.03em' }}>{s.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
        <div className="text-xs mt-auto pt-3" style={{ color: 'var(--text-secondary)' }}>
          {stats.newEntries === 0
            ? 'No entries added this week. Start capturing knowledge.'
            : `${stats.newEntries} entries added. Keep it up, ${userName}.`}
        </div>
      </div>
    </div>
  )
}
