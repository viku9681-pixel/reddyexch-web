const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://reddyexchgaming.com'

type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

function getChangeFreq(pageType: string): ChangeFreq {
  switch (pageType) {
    case 'keyword_landing':
      return 'weekly'
    case 'pillar':
      return 'daily'
    case 'content':
      return 'monthly'
    default:
      return 'weekly'
  }
}

function getPriority(pageType: string): string {
  switch (pageType) {
    case 'pillar':
      return '1.0'
    case 'keyword_landing':
      return '0.8'
    case 'content':
      return '0.6'
    default:
      return '0.5'
  }
}

function buildUrl(slug: string, pageType: string): string {
  if (pageType === 'keyword_landing') {
    return `${SITE_URL}/keyword/${slug}`
  }
  return `${SITE_URL}/${slug}`
}

/**
 * Generates a Sitemap Protocol 0.9 compliant XML string.
 */
export function generateSitemapXml(
  pages: { slug: string; pageType: string; publishedAt: Date; updatedAt: Date }[]
): string {
  const urlEntries = pages
    .map((page) => {
      const loc = buildUrl(page.slug, page.pageType)
      const lastmod = page.updatedAt.toISOString()
      const changefreq = getChangeFreq(page.pageType)
      const priority = getPriority(page.pageType)

      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`
}
