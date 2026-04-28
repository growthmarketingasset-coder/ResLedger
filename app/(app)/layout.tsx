import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh lg:flex-row lg:overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <Sidebar user={session.user} />
      <main className="flex-1 w-full min-w-0 lg:overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
