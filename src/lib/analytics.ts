import type { AnalyticsEvent, EventName } from '@/types'

/**
 * Builds a base analytics event with required fields.
 */
export function buildEvent(
  name: EventName,
  props: Partial<AnalyticsEvent>
): AnalyticsEvent {
  return {
    event: name,
    page_url: props.page_url ?? '',
    session_id: props.session_id ?? '',
    timestamp: props.timestamp ?? new Date().toISOString(),
    ...props,
  }
}

/**
 * Builds a whatsapp_cta_click event.
 */
export function buildCTAClickEvent(context: {
  pageUrl: string
  ctaPosition: 'hero' | 'sticky-footer' | 'inline'
  sessionId: string
  deviceType: 'mobile' | 'tablet' | 'desktop'
}): AnalyticsEvent {
  return buildEvent('whatsapp_cta_click', {
    page_url: context.pageUrl,
    session_id: context.sessionId,
    cta_position: context.ctaPosition,
    device_type: context.deviceType,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Detects the conversion funnel sequence:
 * page_view → age_gate_confirmed → whatsapp_cta_click
 *
 * Returns a conversion_complete event if the full funnel is detected,
 * or null if the sequence is incomplete.
 */
export function buildFunnelCompletionEvent(
  sessionEvents: AnalyticsEvent[]
): AnalyticsEvent | null {
  const FUNNEL_SEQUENCE: EventName[] = [
    'page_view',
    'age_gate_confirmed',
    'whatsapp_cta_click',
  ]

  // Find the funnel steps in order
  let stepIndex = 0
  const funnelEvents: AnalyticsEvent[] = []

  for (const event of sessionEvents) {
    if (event.event === FUNNEL_SEQUENCE[stepIndex]) {
      funnelEvents.push(event)
      stepIndex++
      if (stepIndex === FUNNEL_SEQUENCE.length) break
    }
  }

  if (funnelEvents.length < FUNNEL_SEQUENCE.length) return null

  const firstEvent = funnelEvents[0]
  const lastEvent = funnelEvents[funnelEvents.length - 1]

  const startTime = new Date(firstEvent.timestamp).getTime()
  const endTime = new Date(lastEvent.timestamp).getTime()
  const timeToConvert = Math.round((endTime - startTime) / 1000) // seconds

  return buildEvent('conversion_complete', {
    page_url: lastEvent.page_url,
    session_id: lastEvent.session_id,
    device_type: lastEvent.device_type,
    funnel_path: funnelEvents.map((e) => e.event),
    time_to_convert: timeToConvert,
    timestamp: new Date().toISOString(),
  })
}
