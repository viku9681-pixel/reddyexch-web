import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BreadcrumbNav from '@/components/keyword/BreadcrumbNav'
import ResponsibleGamingDisclaimer from '@/components/compliance/ResponsibleGamingDisclaimer'
import { generateStructuredData } from '@/lib/structured-data'
import SEOHead from '@/components/seo/SEOHead'
import { createServiceClient } from '@/lib/supabase/server'
import TrackedWhatsAppCTA from '@/components/cta/TrackedWhatsAppCTA'

export const revalidate = 60

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://reddyexchgaming.com'

// All 30 keyword slugs — used for generateStaticParams fallback
const KEYWORD_SLUGS = [
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

function slugToTitle(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export async function generateStaticParams() {
  try {
    const service = createServiceClient()
    const { data } = await service
      .from('content_pages')
      .select('slug')
      .in('page_type', ['keyword_landing', 'pillar'])
      .eq('status', 'published')
    if (data && data.length > 0) return data.map(p => ({ slug: p.slug }))
  } catch { /* fallback */ }
  return KEYWORD_SLUGS.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  try {
    const service = createServiceClient()
    const { data: page } = await service
      .from('content_pages')
      .select('title, meta_desc')
      .eq('slug', slug)
      .single()

    if (page) {
      return {
        title: page.title,
        description: page.meta_desc,
        alternates: { canonical: `${SITE_URL}/keyword/${slug}` },
        robots: { index: true, follow: true },
      }
    }
  } catch { /* fallback */ }

  const keyword = slugToTitle(slug)
  return {
    title: `${keyword} | Get Your Gaming ID Instantly — ReddyExch`,
    description: `Get your ${keyword.toLowerCase()} instantly via WhatsApp. ReddyExch provides gaming IDs for sports prediction platforms. 5-minute activation. 18+ only.`,
    alternates: { canonical: `${SITE_URL}/keyword/${slug}` },
  }
}

export default async function KeywordLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Try to load from DB first
  let page: { title: string; meta_desc: string; h1: string; body_html: string; target_keyword: string; has_faq: boolean } | null = null

  try {
    const service = createServiceClient()
    const { data } = await service
      .from('content_pages')
      .select('title, meta_desc, h1, body_html, target_keyword, has_faq, page_type')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
    page = data
  } catch { /* fallback to generated content */ }

  // If not in DB and not in known slugs, 404
  if (!page && !KEYWORD_SLUGS.includes(slug)) notFound()

  const keyword = page?.target_keyword ? slugToTitle(page.target_keyword) : slugToTitle(slug)
  const h1 = page?.h1 ?? `${keyword} — Get Yours Instantly via WhatsApp`
  const title = page?.title ?? `${keyword} | Get Your Gaming ID Instantly — ReddyExch`
  const metaDesc = page?.meta_desc ?? `Get your ${keyword.toLowerCase()} instantly via WhatsApp. ReddyExch provides gaming IDs for sports prediction platforms. 5-minute activation. 18+ only.`
  const canonical = `${SITE_URL}/keyword/${slug}`

  const structuredData = generateStructuredData(
    { title, metaDesc, canonical, h1, pageType: 'keyword_landing', hasFaq: page?.has_faq ?? true, hasHowto: false, publishedAt: new Date('2025-01-01'), updatedAt: new Date() },
    { includeBreadcrumb: true, breadcrumbSlug: slug }
  )

  return (
    <>
      <SEOHead structuredData={structuredData} />

      {/* Hero */}
      <section className="bg-black text-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <BreadcrumbNav h1={h1} slug={slug} />
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4 mt-3">{h1}</h1>
          <p className="text-white/70 text-lg mb-8 max-w-2xl">
            ReddyExch provides gaming IDs for online sports prediction and fantasy participation platforms.
            Get your {keyword.toLowerCase()} in 5 minutes via WhatsApp — no paperwork, no waiting.
          </p>
          <TrackedWhatsAppCTA slug={slug} keyword={keyword} position="hero" />
          <p className="text-white/40 text-sm mt-3">
            ✓ 5-minute activation &nbsp;·&nbsp; ✓ 18+ only &nbsp;·&nbsp; ✓ Not available in Telangana &amp; AP
          </p>
        </div>
      </section>

      {/* Body content */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          {page?.body_html ? (
            <div
              className="prose prose-lg max-w-none prose-headings:text-black prose-p:text-black/70 prose-li:text-black/70 prose-a:text-red-500"
              dangerouslySetInnerHTML={{ __html: page.body_html }}
            />
          ) : (
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-black mb-4">What is a {keyword}?</h2>
              <p className="text-black/70 leading-relaxed mb-6">
                A {keyword.toLowerCase()} is your unique identifier on online sports prediction and fantasy participation platforms.
                With your gaming ID, you can participate in sports prediction contests, fantasy leagues, and skill-based gaming activities.
              </p>
              <h2 className="text-2xl font-bold text-black mb-4">How to Get Your {keyword}</h2>
              <ol className="list-decimal list-inside text-black/70 space-y-3 mb-6">
                <li><strong>Click the WhatsApp button</strong> on this page — it opens a pre-filled message.</li>
                <li><strong>Send the message</strong> to our team and let us know which platform you want.</li>
                <li><strong>Receive your gaming ID</strong> within 5 minutes. Our team is available 24/7.</li>
              </ol>
              <h2 className="text-2xl font-bold text-black mb-4">Why Choose ReddyExch?</h2>
              <ul className="list-disc list-inside text-black/70 space-y-2 mb-6">
                <li>Instant activation — get your ID in 5 minutes</li>
                <li>24/7 WhatsApp support</li>
                <li>Trusted by 10,000+ players across India</li>
                <li>IDs available for all major platforms</li>
              </ul>
            </div>
          )}

          {/* Inline CTA */}
          <div className="bg-black rounded-2xl p-8 text-center mt-10">
            <h3 className="text-white text-xl font-bold mb-2">Ready to Get Your {keyword}?</h3>
            <p className="text-white/60 text-sm mb-6">Contact us on WhatsApp and get your gaming ID in 5 minutes.</p>
            <TrackedWhatsAppCTA slug={slug} keyword={keyword} position="inline" />
          </div>
        </div>
      </section>

      {/* Related pages */}
      <section className="py-12 px-4 bg-black/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-black mb-4">Related Gaming ID Pages</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: '/keyword/online-cricket-id',   label: 'Online Cricket ID' },
              { href: '/keyword/whatsapp-cricket-id', label: 'WhatsApp Cricket ID' },
              { href: '/keyword/instant-cricket-id',  label: 'Instant Cricket ID' },
              { href: '/keyword/diamond-exch',        label: 'Diamond Exch ID' },
              { href: '/keyword/fairplay-id',         label: 'Fairplay ID' },
            ].filter(p => p.href !== `/keyword/${slug}`).map(({ href, label }) => (
              <Link key={href} href={href} className="bg-white border border-black/10 text-black/70 hover:text-black text-sm px-3 py-1.5 rounded-full transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-black px-4 py-4">
        <ResponsibleGamingDisclaimer />
      </div>
    </>
  )
}
