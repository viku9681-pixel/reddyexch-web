/**
 * Vercel KV (Redis) typed wrapper
 * All keys, TTLs, and value shapes defined here.
 */

// Lazy import so this module works in environments without KV configured
async function getKV() {
  const { kv } = await import('@vercel/kv')
  return kv
}

// TTLs in seconds
const TTL = {
  GEO_BLOCKED_COUNTRIES: 300,    // 5 min
  PLATFORM_CONFIG:        300,    // 5 min
  SITEMAP_LAST_UPDATED:   60,     // 60s
  ANALYTICS_SUMMARY:      3600,   // 1 hr
  KEYWORDS_REGISTRY:      600,    // 10 min
  KEYWORDS_PILLAR_MAP:    600,    // 10 min
  WIDGETS_CRICTIME:       300,    // 5 min
  WIDGETS_INSTAGRAM:      300,    // 5 min
  WIDGETS_WHATSAPP_AB:    300,    // 5 min
  RANK_LATEST:            86400,  // 24 hr
} as const

// Key names
export const KV_KEYS = {
  GEO_BLOCKED_COUNTRIES: 'geo:blocked_countries',
  PLATFORM_CONFIG:        'config:platform',
  SITEMAP_LAST_UPDATED:   'sitemap:last_updated',
  ANALYTICS_SUMMARY:      'analytics:summary:daily',
  KEYWORDS_REGISTRY:      'keywords:registry',
  KEYWORDS_PILLAR_MAP:    'keywords:pillar_map',
  WIDGETS_CRICTIME:       'widgets:crictime',
  WIDGETS_INSTAGRAM:      'widgets:instagram',
  WIDGETS_WHATSAPP_AB:    'widgets:whatsapp_ab',
  RANK_LATEST:            'rank:latest',
} as const

export async function kvGet<T>(key: string): Promise<T | null> {
  try {
    const kv = await getKV()
    return await kv.get<T>(key)
  } catch {
    return null
  }
}

export async function kvSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  try {
    const kv = await getKV()
    await kv.set(key, value, { ex: ttlSeconds })
  } catch {
    // KV unavailable — log but don't throw
    console.warn(`[KV] Failed to set key: ${key}`)
  }
}

export async function kvDel(key: string): Promise<void> {
  try {
    const kv = await getKV()
    await kv.del(key)
  } catch {
    console.warn(`[KV] Failed to delete key: ${key}`)
  }
}

// Typed helpers
export async function getBlockedCountries(): Promise<{ countryCode: string; regionCode?: string }[] | null> {
  return kvGet(KV_KEYS.GEO_BLOCKED_COUNTRIES)
}

export async function setBlockedCountries(list: { countryCode: string; regionCode?: string }[]): Promise<void> {
  return kvSet(KV_KEYS.GEO_BLOCKED_COUNTRIES, list, TTL.GEO_BLOCKED_COUNTRIES)
}

export async function invalidatePlatformConfig(): Promise<void> {
  return kvDel(KV_KEYS.PLATFORM_CONFIG)
}

export async function invalidateKeywordsRegistry(): Promise<void> {
  await kvDel(KV_KEYS.KEYWORDS_REGISTRY)
  await kvDel(KV_KEYS.KEYWORDS_PILLAR_MAP)
}

export async function invalidateWidgetCache(widgetType: 'crictime' | 'instagram' | 'whatsapp_ab'): Promise<void> {
  const keyMap = {
    crictime:     KV_KEYS.WIDGETS_CRICTIME,
    instagram:    KV_KEYS.WIDGETS_INSTAGRAM,
    whatsapp_ab:  KV_KEYS.WIDGETS_WHATSAPP_AB,
  }
  return kvDel(keyMap[widgetType])
}

// Rate limiting counter
export async function rateLimitIncr(key: string, windowSeconds: number): Promise<number> {
  try {
    const kv = await getKV()
    const count = await kv.incr(key)
    if (count === 1) {
      // First request in window — set expiry
      await kv.expire(key, windowSeconds)
    }
    return count
  } catch {
    // KV unavailable — allow request (fail open for rate limiting)
    return 0
  }
}
