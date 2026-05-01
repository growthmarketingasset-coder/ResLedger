'use client'

import { useEffect, useState } from 'react'
import { Rows3, Rows2 } from 'lucide-react'

export default function DensityToggle() {
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem('resledge_prefs') || '{}')
      setCompact(!!prefs.compactView)
    } catch {}
  }, [])

  const toggleDensity = () => {
    const next = !compact
    setCompact(next)
    try {
      const current = JSON.parse(localStorage.getItem('resledge_prefs') || '{}')
      localStorage.setItem('resledge_prefs', JSON.stringify({ ...current, compactView: next }))
      window.dispatchEvent(new Event('resledge-prefs-changed'))
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggleDensity}
      className="btn-secondary sm:w-auto"
      title={compact ? 'Switch to comfortable density' : 'Switch to compact density'}
      aria-label={compact ? 'Switch to comfortable density' : 'Switch to compact density'}
    >
      {compact ? <Rows2 size={14} /> : <Rows3 size={14} />}
      {compact ? 'Compact' : 'Comfort'}
    </button>
  )
}

