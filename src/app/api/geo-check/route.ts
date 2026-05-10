import { NextRequest, NextResponse } from 'next/server'
import { isGeoBlocked } from '@/lib/geo'
import { getBlockedCountries, setBlockedCountries } from '@/lib/kv'
import { createServiceClient } from '@/lib/supabase/server'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  const rl = await rateLimit(`geo-check:${ip}`, RATE_LIMITS.GEO_CHECK.limit, RATE_LIMITS.GEO_CHECK.windowSeconds)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    )
  }

  const country = request.geo?.country ?? null
  const region = request.geo?.region ?? null

  // Fetch blocked jurisdictions from KV (with DB fallback)
  const cached = await getBlockedCountries()
  let blockedList = cached

  if (!blockedList) {
    try {
      const supabase = createServiceClient()
      const { data } = await supabase
        .from('blocked_jurisdictions')
        .select('country_code, region_code')
      const fetched = (data ?? []).map((r: { country_code: string; region_code?: string | null }) => ({
        countryCode: r.country_code,
        regionCode: r.region_code ?? undefined,
      }))
      blockedList = fetched
      await setBlockedCountries(fetched)
    } catch {
      blockedList = [
        { countryCode: 'IN', regionCode: 'IN-TG' },
        { countryCode: 'IN', regionCode: 'IN-AP' },
      ]
    }
  }

  const resolvedList = blockedList ?? [
    { countryCode: 'IN', regionCode: 'IN-TG' },
    { countryCode: 'IN', regionCode: 'IN-AP' },
  ]

  const blocked = isGeoBlocked(country, region, resolvedList)

  return NextResponse.json({
    blocked,
    countryCode: country ?? '',
    regionCode: region ?? '',
  })
}
