import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  // Auth check
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()
  const { data: pages, error } = await service
    .from('content_pages')
    .select('id, slug, title, status, page_type, seo_score, published_at, updated_at, target_keyword')
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ pages: pages ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const service = createServiceClient()
  const { data, error } = await service
    .from('content_pages')
    .insert({
      slug: body.slug,
      title: body.title,
      meta_desc: body.meta_desc,
      h1: body.h1 ?? body.title,
      body_html: body.body_html ?? '',
      body_raw: body.body_raw ?? '',
      target_keyword: body.target_keyword ?? '',
      page_type: body.page_type ?? 'content',
      status: 'draft',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ page: data }, { status: 201 })
}
