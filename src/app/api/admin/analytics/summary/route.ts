import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [eventsRes, ctaRes, convRes] = await Promise.all([
    service.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event', 'page_view').gte('timestamp', since),
    service.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event', 'whatsapp_cta_click').gte('timestamp', since),
    service.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event', 'conversion_complete').gte('timestamp', since),
  ])

  // Top pages by CTA clicks
  const { data: topRaw } = await service
    .from('analytics_events')
    .select('page_url')
    .eq('event', 'whatsapp_cta_click')
    .gte('timestamp', since)

  const counts: Record<string, number> = {}
  for (const row of topRaw ?? []) {
    counts[row.page_url] = (counts[row.page_url] ?? 0) + 1
  }
  const top_pages = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([page_url, clicks]) => ({ page_url, clicks }))

  return NextResponse.json({
    page_views: eventsRes.count ?? 0,
    cta_clicks: ctaRes.count ?? 0,
    conversions: convRes.count ?? 0,
    top_pages,
  })
}
