import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [
    { count: learnings },
    { count: resources },
    { count: templates },
    { count: tools },
    { count: ideas },
  ] = await Promise.all([
    supabase.from('learnings').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_archived', false),
    supabase.from('resources').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_archived', false),
    supabase.from('templates').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_archived', false),
    supabase.from('tools').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_archived', false),
    supabase.from('ideas').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_archived', false),
  ])

  return NextResponse.json({ learnings, resources, templates, tools, ideas })
}
