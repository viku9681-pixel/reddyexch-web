/**
 * SEO field validation utilities.
 * KLP = Keyword Landing Page (stricter requirements).
 */

// Title length constraints
const TITLE_MIN_GENERAL = 10
const TITLE_MAX_GENERAL = 60
const TITLE_MIN_KLP = 50
const TITLE_MAX_KLP = 60

// Description length constraints
const DESC_MIN_GENERAL = 50
const DESC_MAX_GENERAL = 160
const DESC_MIN_KLP = 150
const DESC_MAX_KLP = 160

/**
 * Validates title length.
 * KLP: 50–60 chars. General: 10–60 chars.
 */
export function validateTitleLength(title: string, isKLP = false): boolean {
  const len = title.trim().length
  if (isKLP) return len >= TITLE_MIN_KLP && len <= TITLE_MAX_KLP
  return len >= TITLE_MIN_GENERAL && len <= TITLE_MAX_GENERAL
}

/**
 * Validates meta description length.
 * KLP: 150–160 chars. General: 50–160 chars.
 */
export function validateDescLength(desc: string, isKLP = false): boolean {
  const len = desc.trim().length
  if (isKLP) return len >= DESC_MIN_KLP && len <= DESC_MAX_KLP
  return len >= DESC_MIN_GENERAL && len <= DESC_MAX_GENERAL
}

/**
 * Validates that the target keyword appears in title, H1, and meta description.
 * Case-insensitive substring match.
 */
export function validateKeywordPresence(
  keyword: string,
  title: string,
  h1: string,
  metaDesc: string
): boolean {
  const kw = keyword.toLowerCase()
  return (
    title.toLowerCase().includes(kw) &&
    h1.toLowerCase().includes(kw) &&
    metaDesc.toLowerCase().includes(kw)
  )
}

/**
 * Validates that the target keyword appears within the first 100 words of body content.
 * Strips HTML tags before counting words.
 */
export function validateKeywordInFirst100Words(bodyRaw: string, keyword: string): boolean {
  // Strip HTML tags
  const plainText = bodyRaw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const words = plainText.split(' ').slice(0, 100).join(' ')
  return words.toLowerCase().includes(keyword.toLowerCase())
}
