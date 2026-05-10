import type { PlatformConfig } from '@/types'
import { kvGet, kvSet, kvDel, KV_KEYS } from '@/lib/kv'
import { createServiceClient } from '@/lib/supabase/server'

const KV_TTL_SECONDS = 300 // 5 minutes

/**
 * Fetches platform config.
 * Checks Vercel KV first (5-min TTL), falls back to Supabase.
 */
export async function getPlatformConfig(): Promise<PlatformConfig> {
  // 1. Try KV cache
  const cached = await kvGet<PlatformConfig>(KV_KEYS.PLATFORM_CONFIG)
  if (cached) return cached

  // 2. Fetch from Supabase
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('platform_config')
    .select('key, value')

  if (error || !data) {
    // Return safe defaults if DB is unavailable
    return {
      whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '+919999999999',
      exitUrl: 'https://www.google.com',
      ga4MeasurementId: '',
      ga4ApiSecret: '',
      gscSiteUrl: 'https://reddyexchgaming.com',
      fallbackContactPhone: '',
      fallbackContactEmail: 'support@reddyexchgaming.com',
    }
  }

  // Map flat key-value rows to typed config
  const map: Record<string, string> = {}
  for (const row of data as { key: string; value: string }[]) {
    map[row.key] = row.value
  }

  const config: PlatformConfig = {
    whatsappNumber: map['whatsapp_number'] ?? '+919999999999',
    exitUrl: map['exit_url'] ?? 'https://www.google.com',
    ga4MeasurementId: map['ga4_measurement_id'] ?? '',
    ga4ApiSecret: map['ga4_api_secret'] ?? '',
    gscSiteUrl: map['gsc_site_url'] ?? 'https://reddyexchgaming.com',
    fallbackContactPhone: map['fallback_contact_phone'] ?? '',
    fallbackContactEmail: map['fallback_contact_email'] ?? 'support@reddyexchgaming.com',
  }

  // 3. Store in KV for next requests
  await kvSet(KV_KEYS.PLATFORM_CONFIG, config, KV_TTL_SECONDS)

  return config
}

/**
 * Invalidates the platform config KV cache.
 * Call after any admin config change.
 */
export async function invalidatePlatformConfigCache(): Promise<void> {
  await kvDel(KV_KEYS.PLATFORM_CONFIG)
}
