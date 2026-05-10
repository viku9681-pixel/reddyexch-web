import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()
  const { data: keywords, error } = await service
    .from('keyword_registry')
    .select('id, keyword, slug, tier, pillar_slug, synonyms, inbound_link_count, page_id')
    .order('tier')
    .order('keyword')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ keywords: keywords ?? [] })
}
