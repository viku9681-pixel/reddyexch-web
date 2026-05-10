import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { scorePage } from '@/lib/seo-scorer'

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const result = scorePage({
    title: body.title ?? '',
    metaDesc: body.meta_desc ?? '',
    bodyRaw: body.body_raw ?? '',
    bodyHtml: body.body_html ?? body.body_raw ?? '',
    targetKeyword: body.target_keyword ?? '',
    pageType: body.page_type ?? 'content',
    internalLinks: body.internal_links,
    hasFaq: body.has_faq,
  })

  return NextResponse.json(result)
}
