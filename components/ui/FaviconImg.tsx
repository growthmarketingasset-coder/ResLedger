'use client'

import { useState } from 'react'
import { Globe } from 'lucide-react'
import { getFaviconUrl } from '@/lib/utils'

interface FaviconImgProps {
  url: string | null | undefined
  size?: number
  className?: string
}

export default function FaviconImg({ url, size = 20, className }: FaviconImgProps) {
  const [errored, setErrored] = useState(false)
  const faviconUrl = getFaviconUrl(url)

  if (!faviconUrl || errored) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg ${className ?? ''}`}
        style={{ width: size + 8, height: size + 8, background: 'var(--bg-hover)' }}
      >
        <Globe size={size - 4} style={{ color: 'var(--text-muted)' }} />
      </div>
    )
  }

  return (
    <div
      className={`flex items-center justify-center rounded-lg overflow-hidden shrink-0 ${className ?? ''}`}
      style={{ width: size + 8, height: size + 8, background: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}
    >
      <img
        src={faviconUrl}
        alt=""
        width={size}
        height={size}
        onError={() => setErrored(true)}
        style={{ objectFit: 'contain' }}
      />
    </div>
  )
}
