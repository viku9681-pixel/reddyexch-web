import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { isGeoBlocked } from '@/lib/geo'
import { getBlockedCountries } from '@/lib/kv'

const PUBLIC_ASSET_PATTERNS = [
  /^\/_next\//,
  /^\/favicon/,
  /^\/robots\.txt$/,
  /^\/sitemap\.xml$/,
  /^\/api\//,
]

const ADMIN_PATTERN = /^\/admin/

const FALLBACK_BLOCKED = [
  { countryCode: 'IN', regionCode: 'IN-TG' },
  { countryCode: 'IN', regionCode: 'IN-AP' },
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_ASSET_PATTERNS.some((p) => p.test(pathname))) {
    return NextResponse.next()
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com https://www.google-analytics.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: https://*.supabase.co`,
    `connect-src 'self' https://*.supabase.co https://www.google-analytics.com`,
    `frame-ancestors 'none'`,
  ].join('; ')

  if (ADMIN_PATTERN.test(pathname)) {
    const response = await updateSession(request)
    response.headers.set('x-nonce', nonce)
    response.headers.set('Content-Security-Policy', csp)
    return response
  }

  const country = request.geo?.country ?? null
  const region = request.geo?.region ?? null

  const cachedList = await getBlockedCountries()
  const blockedList = cachedList ?? FALLBACK_BLOCKED
  const blocked = isGeoBlocked(country, region, blockedList)

  const response = NextResponse.next()
  response.headers.set('x-nonce', nonce)
  response.headers.set('Content-Security-Policy', csp)

  if (blocked) {
    response.cookies.set('geo_blocked', '1', { httpOnly: true, secure: true, sameSite: 'strict', path: '/' })
    response.cookies.delete('needs_age_gate')
    return response
  }

  response.cookies.delete('geo_blocked')

  const ageVerified = request.cookies.get('age_verified')?.value === '1'
  if (!ageVerified) {
    response.cookies.set('needs_age_gate', '1', { httpOnly: false, secure: true, sameSite: 'strict', path: '/' })
  } else {
    response.cookies.delete('needs_age_gate')
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}