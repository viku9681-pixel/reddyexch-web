import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/audit-log'
import { sanitiseHtml } from '@/lib/sanitise'
import { validateSlug } from '@/lib/slug-validation'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const service = createServiceClient()
  const { data, error } = await service.from('content_pages').select('*').eq('id', id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ page: data })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  // Validate slug format
  if (body.slug && !validateSlug(body.slug)) {
    return NextResponse.json({ error: 'Invalid slug format — use lowercase letters, numbers, and hyphens only' }, { status: 400 })
  }

  // Sanitise HTML
  const bodyHtml = body.body_html ? sanitiseHtml(body.body_html) : undefined

  const service = createServiceClient()

  // Get before state for audit log
  const { data: before } = await service.from('content_pages').select('title, status, slug').eq('id', id).single()

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  const fields = ['slug', 'title', 'meta_desc', 'h1', 'body_raw', 'target_keyword', 'page_type', 'language', 'has_faq', 'has_howto', 'faq_items', 'howto_steps', 'seo_score', 'scheduled_at']
  for (const f of fields) {
    if (body[f] !== undefined) updates[f] = body[f]
  }
  if (bodyHtml !== undefined) updates.body_html = bodyHtml

  const { data, error } = await service.from('content_pages').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAuditLog({
    userId: user.id,
    action: 'edit',
    resourceType: 'article',
    resourceId: id,
    beforeState: before ?? undefined,
    afterState: { title: data.title, status: data.status, slug: data.slug },
  })

  return NextResponse.json({ page: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const service = createServiceClient()

  const { data: before } = await service.from('content_pages').select('title, slug').eq('id', id).single()
  const { error } = await service.from('content_pages').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAuditLog({
    userId: user.id,
    action: 'delete',
    resourceType: 'article',
    resourceId: id,
    beforeState: before ?? undefined,
  })

  return NextResponse.json({ success: true })
}
