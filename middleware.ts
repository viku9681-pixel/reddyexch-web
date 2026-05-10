import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { isGeoBlocked } from '@/lib/geo'
import { getBlockedCountries, setBlockedCountries } from '@/lib/kv'
import { createServiceClient } from '@/lib/supabase/server'

// Routes that bypass compliance checks
const PUBLIC_ASSET_PATTERNS = [
  /^\/_next\//,
  /^\/favicon/,
  /^\/robots\.txt$/,
  /^\/sitemap\.xml$/,
  /^\/api\//,
]

// Admin routes — only session refresh, no compliance checks
const ADMIN_PATTERN = /^\/admin/

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static assets and API routes
  if (PUBLIC_ASSET_PATTERNS.some((p) => p.test(pathname))) {
    return NextResponse.next()
  }

  // Generate per-request CSP nonce
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com https://www.google-analytics.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: https://*.supabase.co https://www.google-analytics.com`,
    `connect-src 'self' https://*.supabase.co https://www.google-analytics.com`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ].join('; ')

  // Admin routes — refresh session only
  if (ADMIN_PATTERN.test(pathname)) {
    const response = await updateSession(request)
    response.headers.set('x-nonce', nonce)
    response.headers.set('Content-Security-Policy', csp)
    return response
  }

  // --- Geo-block check (runs before age gate) ---
  const country = request.geo?.country
  const region = request.geo?.region

  // Fetch blocked jurisdictions from KV (with DB fallback)
  let blockedList = await getBlockedCountries()
  if (!blockedList) {
    try {
      const supabase = createServiceClient()
      const { data } = await supabase
        .from('blocked_jurisdictions')
        .select('country_code, region_code')
      blockedList = (data ?? []).map((r: { country_code: string; region_code?: string }) => ({
        countryCode: r.country_code,
        regionCode: r.region_code,
      }))
      await setBlockedCountries(blockedList)
    } catch {
      // DB unavailable — fail safe: block all
      blockedList = [{ countryCode: 'IN', regionCode: 'IN-TG' }, { countryCode: 'IN', regionCode: 'IN-AP' }]
    }
  }

  const blocked = isGeoBlocked(country, region, blockedList)

  const response = NextResponse.next()
  response.headers.set('x-nonce', nonce)
  response.headers.set('Content-Security-Policy', csp)

  if (blocked) {
    response.cookies.set('geo_blocked', '1', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    })
    // Clear age gate cookie if geo-blocked
    response.cookies.delete('needs_age_gate')
    return response
  }

  // Clear geo_blocked cookie if not blocked
  response.cookies.delete('geo_blocked')

  // --- Age gate check ---
  const ageVerified = request.cookies.get('age_verified')?.value === '1'
  if (!ageVerified) {
    response.cookies.set('needs_age_gate', '1', {
      httpOnly: false,  // needs to be readable by client ComplianceOrchestrator
      secure: true,
      sameSite: 'strict',
      path: '/',
    })
  } else {
    response.cookies.delete('needs_age_gate')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
