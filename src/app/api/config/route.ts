import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Public config endpoint — serves runtime config to client components.
 * No auth required. Only exposes safe, non-sensitive values.
 * This allows admin to update WhatsApp number without a redeploy.
 */
export const revalidate = 0 // always fresh

export async function GET() {
  try {
    const service = createServiceClient()
    const { data, error } = await service
      .from('platform_config')
      .select('key, value')
      .in('key', ['whatsapp_number', 'fallback_contact_phone', 'fallback_contact_email'])

    if (error) throw error

    const config: Record<string, string> = {}
    for (const row of data ?? []) {
      config[row.key] = row.value
    }

    // Fall back to env var if DB has no entry yet
    const whatsappNumber =
      config.whatsapp_number ||
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
      '+919999999999'

    return NextResponse.json(
      { whatsapp_number: whatsappNumber },
      {
        headers: {
          // Cache for 60s on CDN, but always revalidate — so config changes
          // propagate within 1 minute without hammering the DB
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    )
  } catch {
    // If DB is unavailable, fall back to env var
    return NextResponse.json({
      whatsapp_number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '+919999999999',
    })
  }
}
