/**
 * Geo-block decision logic — India Online Gaming Rules 2026
 *
 * Blocked by default (fail-safe):
 * - null / undefined / empty country code
 * - country IN with null / undefined region (cannot confirm state is allowed)
 * - country matches a blocked entry with no region (entire country blocked)
 * - country IN + region matches IN-TG or IN-AP (or any other blocked Indian state)
 */

export interface BlockedJurisdiction {
  countryCode: string
  regionCode?: string | null
}

export function isGeoBlocked(
  countryCode: string | null | undefined,
  regionCode: string | null | undefined,
  blockedList: BlockedJurisdiction[]
): boolean {
  // Fail-safe: unresolvable geo → block
  if (!countryCode) return true

  const country = countryCode.toUpperCase()

  for (const entry of blockedList) {
    const entryCountry = entry.countryCode.toUpperCase()

    if (entryCountry === country) {
      if (!entry.regionCode) {
        // Entire country is blocked
        return true
      }
      // State-level block — check region
      if (regionCode && entry.regionCode.toUpperCase() === regionCode.toUpperCase()) {
        return true
      }
    }
  }

  // Special fail-safe for India: if country is IN but region is unknown → block
  // Cannot confirm the visitor is NOT in a blocked Indian state
  if (country === 'IN' && !regionCode) {
    return true
  }

  return false
}
