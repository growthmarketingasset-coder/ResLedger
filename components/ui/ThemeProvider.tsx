'use client'

import { createContext, useContext, useEffect } from 'react'

type Theme = 'dark'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: 'dark'
  setTheme: (_t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  resolvedTheme: 'dark',
  setTheme: () => {},
})

export function useTheme() { return useContext(ThemeContext) }

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const applyPrefs = () => {
      try {
        const prefs = JSON.parse(localStorage.getItem('resledge_prefs') || '{}')
        const compact = !!prefs.compactView
        document.body.classList.toggle('compact-view', compact)
      } catch {
        document.body.classList.remove('compact-view')
      }
    }

    applyPrefs()
    window.addEventListener('storage', applyPrefs)
    window.addEventListener('resledge-prefs-changed', applyPrefs)
    return () => {
      window.removeEventListener('storage', applyPrefs)
      window.removeEventListener('resledge-prefs-changed', applyPrefs)
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ theme: 'dark', resolvedTheme: 'dark', setTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  )
}
