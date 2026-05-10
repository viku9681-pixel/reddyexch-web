import type { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/server'

export const revalidate = 60

const SITE_URL = 'https://reddyexchgaming.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/responsible-gaming`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ]

  // Dynamic pages from DB
  try {
    const service = createServiceClient()
    const { data: pages } = await service
      .from('content_pages')
      .select('slug, page_type, published_at, updated_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    const dbPages: MetadataRoute.Sitemap = (pages ?? []).map(page => ({
      url: page.page_type === 'keyword_landing' || page.page_type === 'pillar'
        ? `${SITE_URL}/keyword/${page.slug}`
        : `${SITE_URL}/${page.slug}`,
      lastModified: new Date(page.updated_at ?? page.published_at ?? now),
      changeFrequency: 'weekly' as const,
      priority: page.page_type === 'pillar' ? 0.9 : 0.8,
    }))

    return [...staticPages, ...dbPages]
  } catch {
    // Fallback to static slugs if DB unavailable
    const FALLBACK_SLUGS = [
      'online-cricket-id', 'whatsapp-cricket-id', 'instant-cricket-id',
      'cricket-betting-id', 'reddy-anna-book', 'diamond-exch', 'fairplay-id',
      'lotus365-id', 'mahadev-book', 'sky-exchange-id', 'betbhai9-id',
      'world777-id', 'tigerexch-id', 'online-gaming-id-india',
      'how-to-get-cricket-id-via-whatsapp', 'best-ipl-betting-id-india',
      'cricket-id-kaise-banaye', 'online-cricket-id-free',
      'cricket-id-whatsapp-number-india', 'instant-cricket-id-whatsapp',
      'trusted-cricket-id-provider-india', 'cricket-id-5-minutes',
      'ipl-2025-cricket-id', 't20-world-cup-cricket-id',
      'online-sports-prediction-id-india', 'fantasy-cricket-id-india',
      'cricket-id-registration-online', 'new-cricket-id-2025',
      'reddyexch-cricket-id', 'whatsapp-se-gaming-id-kaise-le',
    ]
    return [
      ...staticPages,
      ...FALLBACK_SLUGS.map(slug => ({
        url: `${SITE_URL}/keyword/${slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    ]
  }
}
