import type { KeywordRegistryEntry } from '@/types'

/**
 * Auto-links the first unlinked occurrence of each keyword (and its synonyms)
 * in bodyRaw HTML. Longest keywords are matched first to avoid partial matches.
 *
 * Rules:
 * - Sorts registry by keyword length DESC (longest first)
 * - Replaces FIRST unlinked occurrence per keyword
 * - Never creates duplicate links to the same target slug on the same page
 * - Also matches synonyms
 */
export function autoLink(bodyRaw: string, registry: KeywordRegistryEntry[]): string {
  // Sort by keyword length descending (longest first to avoid partial matches)
  const sorted = [...registry].sort((a, b) => b.keyword.length - a.keyword.length)

  let html = bodyRaw
  const linkedSlugs = new Set<string>()

  for (const entry of sorted) {
    // Skip if we've already linked to this slug
    if (linkedSlugs.has(entry.slug)) continue

    const terms = [entry.keyword, ...entry.synonyms]
    let linked = false

    for (const term of terms) {
      if (linked) break
      if (!term) continue

      // Build a regex that matches the term as a whole word, case-insensitive,
      // but NOT when it's already inside an <a> tag
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`(?<!<a[^>]*>)\\b(${escapedTerm})\\b(?![^<]*<\\/a>)`, 'i')

      const anchorTitle = entry.anchorTitle ?? `Get ${entry.keyword} — ReddyExch`
      const replacement = `<a href="/keyword/${entry.slug}" title="${anchorTitle}">$1</a>`

      const newHtml = html.replace(regex, replacement)

      if (newHtml !== html) {
        html = newHtml
        linkedSlugs.add(entry.slug)
        linked = true
      }
    }
  }

  return html
}
