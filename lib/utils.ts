import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
export function formatDate(date: string) { return format(new Date(date), 'MMM d, yyyy') }
export function formatRelative(date: string) { return formatDistanceToNow(new Date(date), { addSuffix: true }) }
export function truncate(str: string, length: number) { return str.length <= length ? str : str.slice(0, length) + '...' }

export function getFaviconUrl(url: string | null | undefined): string | null {
  if (!url) return null
  try { const p = new URL(url); return `https://www.google.com/s2/favicons?domain=${p.hostname}&sz=32` }
  catch { return null }
}

export const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing',
  'Media', 'Real Estate', 'Consulting', 'Marketing', 'Legal', 'Sales',
  'Operations', 'Product', 'Design', 'AI/ML', 'Other',
]

export const IMPACT_LEVELS = ['low', 'medium', 'high', 'game_changing'] as const
export type ImpactLevel = typeof IMPACT_LEVELS[number]

export const IMPACT_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  low: { label: 'Low', bg: 'rgba(152,161,178,0.12)', color: '#98a1b2', border: 'rgba(152,161,178,0.18)' },
  medium: { label: 'Medium', bg: 'rgba(124,108,242,0.10)', color: '#aaa1fb', border: 'rgba(124,108,242,0.18)' },
  high: { label: 'High', bg: 'rgba(124,108,242,0.14)', color: '#c7c0ff', border: 'rgba(124,108,242,0.24)' },
  game_changing: { label: 'Game Changing', bg: 'rgba(124,108,242,0.18)', color: '#f3f1ff', border: 'rgba(124,108,242,0.32)' },
}

export const ENTRY_TYPE_LABELS: Record<string, string> = {
  learning: 'Learning',
  resource: 'Resource',
  template: 'Template',
  tool: 'Tool',
  idea: 'Idea',
  ai_strategy: 'AI Strategy',
  workshop_video: 'Workshop',
  case_study: 'Case Study',
}

export const ENTRY_TYPE_COLORS: Record<string, string> = {
  learning: 'bg-[rgba(124,108,242,0.10)] text-[#d7d2ff]',
  resource: 'bg-[rgba(124,108,242,0.14)] text-[#f3f1ff]',
  template: 'bg-[rgba(124,108,242,0.08)] text-[#c7c0ff]',
  tool: 'bg-[rgba(124,108,242,0.10)] text-[#d7d2ff]',
  idea: 'bg-[rgba(124,108,242,0.08)] text-[#c7c0ff]',
  ai_strategy: 'bg-[rgba(124,108,242,0.16)] text-[#f3f1ff]',
  workshop_video: 'bg-[rgba(124,108,242,0.10)] text-[#d7d2ff]',
  case_study: 'bg-[rgba(124,108,242,0.08)] text-[#c7c0ff]',
}

export const IDEA_STATUSES = ['raw', 'exploring', 'validating', 'shelved']
export const AI_STRATEGY_STATUSES = ['draft', 'active', 'completed', 'paused']
export const RESOURCE_TYPES = ['link', 'doc', 'video', 'article', 'course', 'podcast']
export const TOOL_PRICING = ['free', 'paid', 'freemium']
