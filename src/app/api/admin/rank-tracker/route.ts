import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()

  // Get all keywords
  const { data: keywords } = await service
    .from('keyword_registry')
    .select('id, keyword, slug, tier')
    .order('tier')

  // Get latest position for each keyword
  const { data: metrics } = await service
    .from('seo_metrics')
    .select('keyword_id, position, source, recorded_at')
    .order('recorded_at', { ascending: false })

  // Build map: keywordId → latest + previous
  const posMap: Record<string, { position: number; previous: number | null; source: string; recorded_at: string }> = {}
  for (const m of metrics ?? []) {
    if (!posMap[m.keyword_id]) {
      posMap[m.keyword_id] = { position: m.position, previous: null, source: m.source, recorded_at: m.recorded_at }
    } else if (posMap[m.keyword_id].previous === null) {
      posMap[m.keyword_id].previous = m.position
    }
  }

  const result = (keywords ?? []).map(kw => ({
    ...kw,
    position: posMap[kw.id]?.position ?? null,
    previous_position: posMap[kw.id]?.previous ?? null,
    source: posMap[kw.id]?.source ?? null,
    recorded_at: posMap[kw.id]?.recorded_at ?? null,
  }))

  return NextResponse.json({ keywords: result })
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { keywordId, position, source } = await request.json()
  if (!keywordId || !position) return NextResponse.json({ error: 'keywordId and position required' }, { status: 400 })

  const service = createServiceClient()
  const { error } = await service.from('seo_metrics').insert({
    keyword_id: keywordId,
    position: parseInt(position),
    source: source ?? 'manual',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
