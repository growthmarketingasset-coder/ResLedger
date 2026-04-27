import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const TABLES = [
  { key: 'learnings', type: 'learning', descField: 'summary' },
  { key: 'resources', type: 'resource', descField: 'description' },
  { key: 'templates', type: 'template', descField: 'description' },
  { key: 'tools', type: 'tool', descField: 'description' },
  { key: 'ideas', type: 'idea', descField: 'description' },
] as const

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') ?? ''
  const type = searchParams.get('type') ?? ''
  const industry = searchParams.get('industry') ?? ''
  const tagId = searchParams.get('tag') ?? ''

  const allResults: any[] = []
  const tablesToSearch = type ? TABLES.filter(t => t.type === type) : TABLES

  for (const { key, type: entryType, descField } of tablesToSearch) {
    let q = (supabase.from(key) as any)
      .select(`id, title, ${descField}, created_at`)
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .limit(15)

    if (query) q = q.or(`title.ilike.%${query}%,${descField}.ilike.%${query}%`)

    const { data } = await q
    if (data) {
      allResults.push(...data.map((d: any) => ({
        id: d.id,
        title: d.title,
        description: d[descField] ?? null,
        entryType,
        tableKey: key,
        created_at: d.created_at,
      })))
    }
  }

  // Filter by tag if needed
  let finalResults = allResults
  if (tagId) {
    const tagged = new Set<string>()
    const { data: entryTags } = await supabase
      .from('entry_tags')
      .select('entry_id')
      .eq('tag_id', tagId)
    entryTags?.forEach((et: any) => tagged.add(et.entry_id))
    finalResults = allResults.filter(r => tagged.has(r.id))
  }

  finalResults.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return NextResponse.json(finalResults)
}
