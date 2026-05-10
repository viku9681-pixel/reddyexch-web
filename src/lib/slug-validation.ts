const SLUG_REGEX = /^[a-z0-9-]+$/

/**
 * Validates a URL slug.
 * Must be non-empty and match ^[a-z0-9-]+$
 */
export function validateSlug(slug: string): boolean {
  if (!slug || slug.trim().length === 0) return false
  return SLUG_REGEX.test(slug)
}

/**
 * Validates that a proposed slug is unique among existing slugs.
 * Case-insensitive comparison.
 */
export function validateSlugUniqueness(
  proposed: string,
  existingSlugs: string[]
): boolean {
  const lower = proposed.toLowerCase()
  return !existingSlugs.some((s) => s.toLowerCase() === lower)
}
