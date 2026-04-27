'use client'

import { useState } from 'react'
import { FileText, Globe, Video, BookOpen, Link2, Headphones, FileSpreadsheet, Presentation } from 'lucide-react'

interface ServiceIconProps {
  url?: string | null
  title?: string
  size?: number
  className?: string
}

// Known service patterns → icon color + icon
const SERVICE_PATTERNS: Array<{
  match: (url: string, title: string) => boolean
  bg: string
  iconUrl?: string
  icon?: React.ReactNode
  label: string
}> = [
  // Google services
  {
    match: (u) => u.includes('docs.google.com/document') || u.includes('google.com/document'),
    bg: '#4285f4', label: 'Google Docs',
    iconUrl: 'https://www.google.com/s2/favicons?domain=docs.google.com&sz=64',
  },
  {
    match: (u) => u.includes('docs.google.com/spreadsheets'),
    bg: '#34a853', label: 'Google Sheets',
    iconUrl: 'https://www.google.com/s2/favicons?domain=sheets.google.com&sz=64',
  },
  {
    match: (u) => u.includes('docs.google.com/presentation'),
    bg: '#fbbc04', label: 'Google Slides',
    iconUrl: 'https://www.google.com/s2/favicons?domain=slides.google.com&sz=64',
  },
  {
    match: (u) => u.includes('docs.google.com/forms'),
    bg: '#673ab7', label: 'Google Forms',
    iconUrl: 'https://www.google.com/s2/favicons?domain=forms.google.com&sz=64',
  },
  // YouTube
  {
    match: (u) => u.includes('youtube.com') || u.includes('youtu.be'),
    bg: '#ff0000', label: 'YouTube',
    iconUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64',
  },
  // Notion
  {
    match: (u) => u.includes('notion.so') || u.includes('notion.com'),
    bg: '#000000', label: 'Notion',
    iconUrl: 'https://www.google.com/s2/favicons?domain=notion.so&sz=64',
  },
  // Figma
  {
    match: (u) => u.includes('figma.com'),
    bg: '#f24e1e', label: 'Figma',
    iconUrl: 'https://www.google.com/s2/favicons?domain=figma.com&sz=64',
  },
  // GitHub
  {
    match: (u) => u.includes('github.com'),
    bg: '#24292e', label: 'GitHub',
    iconUrl: 'https://www.google.com/s2/favicons?domain=github.com&sz=64',
  },
  // Loom
  {
    match: (u) => u.includes('loom.com'),
    bg: '#625df5', label: 'Loom',
    iconUrl: 'https://www.google.com/s2/favicons?domain=loom.com&sz=64',
  },
  // Airtable
  {
    match: (u) => u.includes('airtable.com'),
    bg: '#18bfff', label: 'Airtable',
    iconUrl: 'https://www.google.com/s2/favicons?domain=airtable.com&sz=64',
  },
  // Miro
  {
    match: (u) => u.includes('miro.com'),
    bg: '#ffd02f', label: 'Miro',
    iconUrl: 'https://www.google.com/s2/favicons?domain=miro.com&sz=64',
  },
  // Dropbox
  {
    match: (u) => u.includes('dropbox.com'),
    bg: '#0061ff', label: 'Dropbox',
    iconUrl: 'https://www.google.com/s2/favicons?domain=dropbox.com&sz=64',
  },
  // OneDrive / SharePoint
  {
    match: (u) => u.includes('onedrive.live.com') || u.includes('sharepoint.com'),
    bg: '#0078d4', label: 'OneDrive',
    iconUrl: 'https://www.google.com/s2/favicons?domain=onedrive.live.com&sz=64',
  },
  // Canva
  {
    match: (u) => u.includes('canva.com'),
    bg: '#00c4cc', label: 'Canva',
    iconUrl: 'https://www.google.com/s2/favicons?domain=canva.com&sz=64',
  },
  // Slack
  {
    match: (u) => u.includes('slack.com'),
    bg: '#4a154b', label: 'Slack',
    iconUrl: 'https://www.google.com/s2/favicons?domain=slack.com&sz=64',
  },
  // HubSpot
  {
    match: (u) => u.includes('hubspot.com'),
    bg: '#ff7a59', label: 'HubSpot',
    iconUrl: 'https://www.google.com/s2/favicons?domain=hubspot.com&sz=64',
  },
]

function getFaviconUrl(url: string): string {
  try {
    const parsed = new URL(url)
    return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`
  } catch { return '' }
}

export default function ServiceIcon({ url, title = '', size = 36, className = '' }: ServiceIconProps) {
  const [imgFailed, setImgFailed] = useState(false)

  if (!url) {
    return (
      <div className={`flex items-center justify-center rounded-xl shrink-0 ${className}`}
        style={{ width: size, height: size, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>
        <Link2 size={size * 0.45} style={{ color: 'var(--text-muted)' }} />
      </div>
    )
  }

  // Check for known service
  const service = SERVICE_PATTERNS.find(s => {
    try { return s.match(url, title) }
    catch { return false }
  })

  const iconSrc = service?.iconUrl || getFaviconUrl(url)

  if (!imgFailed && iconSrc) {
    return (
      <div className={`flex items-center justify-center rounded-xl shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size, background: service?.bg || 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        <img
          src={iconSrc}
          alt={service?.label || ''}
          width={size * 0.6}
          height={size * 0.6}
          onError={() => setImgFailed(true)}
          style={{ objectFit: 'contain' }}
        />
      </div>
    )
  }

  // Fallback: Globe icon
  return (
    <div className={`flex items-center justify-center rounded-xl shrink-0 ${className}`}
      style={{ width: size, height: size, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>
      <Globe size={size * 0.45} style={{ color: 'var(--text-muted)' }} />
    </div>
  )
}
