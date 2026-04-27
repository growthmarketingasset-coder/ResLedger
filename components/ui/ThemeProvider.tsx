'use client'

import { createContext, useContext } from 'react'

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
  return (
    <ThemeContext.Provider value={{ theme: 'dark', resolvedTheme: 'dark', setTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  )
}
