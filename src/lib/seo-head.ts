export interface HreflangTag {
  lang: string
  url: string
}

export interface MetaTags {
  title: string
  description: string
  canonical: string
}

/**
 * Generates hreflang link tags for locale variants.
 * Always includes x-default pointing to the en-IN URL (or canonical).
 */
export function generateHreflangTags(
  localeVariants?: {
    'en-IN'?: string
    'hi-IN'?: string
    'hin-IN'?: string
  }
): HreflangTag[] {
  if (!localeVariants) return []

  const tags: HreflangTag[] = []

  if (localeVariants['en-IN']) {
    tags.push({ lang: 'en-IN', url: localeVariants['en-IN'] })
    // x-default points to the primary English variant
    tags.push({ lang: 'x-default', url: localeVariants['en-IN'] })
  }

  if (localeVariants['hi-IN']) {
    tags.push({ lang: 'hi-IN', url: localeVariants['hi-IN'] })
  }

  if (localeVariants['hin-IN']) {
    tags.push({ lang: 'hin-IN', url: localeVariants['hin-IN'] })
  }

  return tags
}

/**
 * Generates canonical meta tags from a page object.
 */
export function generateMetaTags(page: {
  title: string
  metaDesc: string
  canonical: string
}): MetaTags {
  return {
    title: page.title,
    description: page.metaDesc,
    canonical: page.canonical,
  }
}
