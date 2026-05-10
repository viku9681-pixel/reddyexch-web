import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'

// Zod schema for a single analytics event
const AnalyticsEventSchema = z.object({
  event: z.enum([
    'page_view',
    'whatsapp_cta_click',
    'age_gate_confirmed',
    'age_gate_declined',
    'geo_block_triggered',
    'content_page_scroll_depth',
    'conversion_complete',
  ]),
  page_url: z.string().url(),
  session_id: z.string().min(1).max(128),
  timestamp: z.string().datetime(),
  device_type: z.enum(['mobile', 'tablet', 'desktop']).optional(),
  cta_position: z.enum(['hero', 'sticky-footer', 'inline']).optional(),
  scroll_depth: z.union([z.literal(25), z.literal(50), z.literal(75), z.literal(100)]).optional(),
  funnel_path: z.array(z.string()).optional(),
  time_to_convert: z.number().int().nonnegative().optional(),
  properties: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
})

export async function POST(request: NextRequest) {
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Rate limit: 60/session/min â€” extract session_id from body
  const sessionId =
    typeof rawBody === 'object' && rawBody !== null && 'session_id' in rawBody
      ? String((rawBody as Record<string, unknown>).session_id)
      : 'unknown'

  const rl = await rateLimit(
    `analytics-event:${sessionId}`,
    RATE_LIMITS.ANALYTICS_EVENT.limit,
    RATE_LIMITS.ANALYTICS_EVENT.windowSeconds
  )
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    )
  }

  const parsed = AnalyticsEventSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid event shape', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const event = parsed.data

  try {
    const supabase = createServiceClient()
    const { error } = await supabase.from('analytics_events').insert({
      event_name: event.event,
      page_url: event.page_url,
      session_id: event.session_id,
      timestamp: event.timestamp,
      device_type: event.device_type ?? null,
      cta_position: event.cta_position ?? null,
      scroll_depth: event.scroll_depth ?? null,
      funnel_path: event.funnel_path ?? null,
      time_to_convert: event.time_to_convert ?? null,
      properties: event.properties ?? null,
    })

    if (error) {
      console.error('[analytics/event] DB insert error:', error.message)
      return NextResponse.json({ error: 'Failed to record event' }, { status: 500 })
    }
  } catch (err) {
    console.error('[analytics/event] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
