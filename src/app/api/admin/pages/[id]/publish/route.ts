import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/audit-log'
import { scorePage } from '@/lib/seo-scorer'
import { checkCompliantLanguage } from '@/lib/language-compliance'
import { validateStateTransition } from '@/lib/content-state-machine'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const service = createServiceClient()

  const { data: page, error: fetchErr } = await service.from('content_pages').select('*').eq('id', id).single()
  if (fetchErr || !page) return NextResponse.json({ error: 'Page not found' }, { status: 404 })

  // State machine check
  if (!validateStateTransition(page.status, 'published')) {
    return NextResponse.json({ error: `Cannot publish from status "${page.status}"` }, { status: 422 })
  }

  // Language compliance check
  const langCheck = checkCompliantLanguage({
    bodyRaw: page.body_raw ?? '',
    title: page.title ?? '',
    metaDesc: page.meta_desc ?? '',
    h1: page.h1 ?? '',
  })
  if (!langCheck.passed) {
    return NextResponse.json({
      error: 'Language compliance check failed',
      violations: langCheck.violations,
    }, { status: 422 })
  }

  // SEO score check
  const seoResult = scorePage({
    title: page.title ?? '',
    metaDesc: page.meta_desc ?? '',
    bodyRaw: page.body_raw ?? '',
    bodyHtml: page.body_html ?? '',
    targetKeyword: page.target_keyword ?? '',
    pageType: page.page_type ?? 'content',
    internalLinks: page.internal_links ?? 0,
    hasFaq: page.has_faq,
  })

  if (seoResult.total < 70) {
    return NextResponse.json({
      error: 'SEO score too low to publish',
      seoScore: seoResult.total,
      suggestions: seoResult.suggestions,
    }, { status: 422 })
  }

  // Slug uniqueness check
  const { data: existing } = await service
    .from('content_pages')
    .select('id')
    .eq('slug', page.slug)
    .in('status', ['published', 'scheduled'])
    .neq('id', id)
    .single()

  if (existing) {
    return NextResponse.json({ error: `Slug "${page.slug}" is already used by another published page` }, { status: 409 })
  }

  // Publish
  const { data: updated, error: updateErr } = await service
    .from('content_pages')
    .update({ status: 'published', published_at: new Date().toISOString(), seo_score: seoResult.total, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

  await writeAuditLog({
    userId: user.id,
    action: 'publish',
    resourceType: 'article',
    resourceId: id,
    beforeState: { status: page.status },
    afterState: { status: 'published', seo_score: seoResult.total },
  })

  // GSC ping (non-blocking)
  const { pingSitemapToGSC } = await import('@/lib/gsc-ping')
  pingSitemapToGSC('https://reddyexchgaming.com/sitemap.xml').catch(() => null)

  // Auto-linker (non-blocking) — update body_html with internal links
  try {
    const { autoLink } = await import('@/lib/auto-linker')
    const service2 = createServiceClient()
    const { data: registry } = await service2.from('keyword_registry').select('id, keyword, slug, anchor_title, synonyms')
    if (registry && registry.length > 0 && updated.body_raw) {
      const linkedHtml = autoLink(updated.body_raw, registry)
      const linkCount = (linkedHtml.match(/href="\/keyword\//g) ?? []).length
      await service2.from('content_pages').update({
        body_html: linkedHtml,
        internal_links: linkCount,
      }).eq('id', id)
    }
  } catch { /* auto-linker failure is non-blocking */ }

  return NextResponse.json({ page: updated, seoScore: seoResult.total })
}
