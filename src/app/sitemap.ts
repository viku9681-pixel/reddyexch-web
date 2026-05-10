import type { MetadataRoute } from 'next'

export const revalidate = 60

const SITE_URL = 'https://reddyexchgaming.com'

// All 30 keyword slugs from seed data — static for now
const KEYWORD_SLUGS = [
  'online-cricket-id',
  'whatsapp-cricket-id',
  'instant-cricket-id',
  'cricket-betting-id',
  'reddy-anna-book',
  'diamond-exch',
  'fairplay-id',
  'lotus365-id',
  'mahadev-book',
  'sky-exchange-id',
  'betbhai9-id',
  'world777-id',
  'tigerexch-id',
  'online-gaming-id-india',
  'how-to-get-cricket-id-via-whatsapp',
  'best-ipl-betting-id-india',
  'cricket-id-kaise-banaye',
  'online-cricket-id-free',
  'cricket-id-whatsapp-number-india',
  'instant-cricket-id-whatsapp',
  'trusted-cricket-id-provider-india',
  'cricket-id-5-minutes',
  'ipl-2025-cricket-id',
  't20-world-cup-cricket-id',
  'online-sports-prediction-id-india',
  'fantasy-cricket-id-india',
  'cricket-id-registration-online',
  'new-cricket-id-2025',
  'reddyexch-cricket-id',
  'whatsapp-se-gaming-id-kaise-le',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/responsible-gaming`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // Keyword landing pages
  const keywordPages: MetadataRoute.Sitemap = KEYWORD_SLUGS.map((slug) => ({
    url: `${SITE_URL}/keyword/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: slug === 'online-cricket-id' || slug === 'whatsapp-cricket-id' ? 0.9 : 0.8,
  }))

  return [...staticPages, ...keywordPages]
}
