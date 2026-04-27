import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import ThemeProvider from '@/components/ui/ThemeProvider'
import { RouteLoader } from '@/components/ui/PageLoader'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'ResLedge — Your Knowledge Ledger',
  description: 'Capture learnings, resources, ideas, and tools in one place.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Prevent flash of unstyled theme */}
        <script dangerouslySetInnerHTML={{__html:`
          (function(){
            try{
              document.documentElement.classList.add('dark');
            }catch(e){}
          })();
        `}} />
        <link rel="icon" type="image/png" href="/RL.png" />
  <link rel="shortcut icon" href="/RL.png" />
</head>
      <body>
        <ThemeProvider>
          <Suspense fallback={null}><RouteLoader /></Suspense>
          {children}
        </ThemeProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: '14px',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '14px',
              boxShadow: 'var(--shadow-drop)',
            },
          }}
        />
      </body>
    </html>
  )
}
