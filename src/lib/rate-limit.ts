import { rateLimitIncr } from './kv'

export interface RateLimitResult {
  allowed: boolean
  retryAfter: number  // seconds until reset
}

/**
 * Rate limiter using Vercel KV counters.
 * Returns { allowed: true } if under limit, { allowed: false, retryAfter: N } if exceeded.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const count = await rateLimitIncr(`rl:${key}`, windowSeconds)

  if (count === 0) {
    // KV unavailable — fail open
    return { allowed: true, retryAfter: 0 }
  }

  if (count > limit) {
    return { allowed: false, retryAfter: windowSeconds }
  }

  return { allowed: true, retryAfter: 0 }
}

// Pre-configured rate limiters per endpoint
export const RATE_LIMITS = {
  LOGIN:           { limit: 5,  windowSeconds: 900  },  // 5 / IP / 15 min
  ANALYTICS_EVENT: { limit: 60, windowSeconds: 60   },  // 60 / session / min
  ANALYTICS_BATCH: { limit: 5,  windowSeconds: 60   },  // 5 / session / min
  GEO_CHECK:       { limit: 30, windowSeconds: 60   },  // 30 / IP / min
} as const
