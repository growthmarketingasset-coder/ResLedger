import { ReactNode } from 'react'
import DensityToggle from '@/components/ui/DensityToggle'

interface PageShellProps {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}

export default function PageShell({ title, description, action, children }: PageShellProps) {
  return (
    <div className="flex flex-col min-h-full w-full">
      <header
        className="sticky top-0 z-10 glass soft-divider"
      >
        <div className="app-shell-content flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 w-full">
          <div className="flex-1 min-w-0">
            <h1
              className="text-lg sm:text-xl font-extrabold leading-tight"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}
            >
              {title}
            </h1>
            {description && (
              <p className="text-xs font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
                {description}
              </p>
            )}
          </div>
          <div className="shrink-0 flex w-full sm:w-auto items-center gap-2">
            <DensityToggle />
            {action}
          </div>
        </div>
      </header>

      <div className="flex-1 w-full">
        <div className="app-shell-content px-4 sm:px-6 py-4 sm:py-6 w-full">
          {children}
        </div>
      </div>
    </div>
  )
}
