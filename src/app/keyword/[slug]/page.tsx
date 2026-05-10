import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbNav from '@/components/keyword/BreadcrumbNav'
import ResponsibleGamingDisclaimer from '@/components/compliance/ResponsibleGamingDisclaimer'
import { generateStructuredData } from '@/lib/structured-data'
import SEOHead from '@/components/seo/SEOHead'

export const revalidate = 60

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://reddyexchgaming.com'
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919999999999'

// All 30 keyword slugs from seed data
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

// Convert slug to human-readable title
function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Generate page data from slug
function getPageData(slug: string) {
  const keyword = slugToTitle(slug)
  const h1 = `${keyword} — Get Yours Instantly via WhatsApp`
  const title = `${keyword} | Get Your Gaming ID Instantly — ReddyExch`
  const metaDesc = `Get your ${keyword.toLowerCase()} instantly via WhatsApp. ReddyExch provides gaming IDs for sports prediction and fantasy participation platforms. 18+ only.`
  const canonical = `${SITE_URL}/keyword/${slug}`

  return { keyword, h1, title, metaDesc, canonical }
}

export async function generateStaticParams() {
  return KEYWORD_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { title, metaDesc, canonical } = getPageData(slug)

  return {
    title,
    description: metaDesc,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description: metaDesc,
      url: canonical,
      type: 'article',
      siteName: 'ReddyExch',
      locale: 'en_IN',
    },
  }
}

export default async function KeywordLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { keyword, h1, title, metaDesc, canonical } = getPageData(slug)

  const phone = WHATSAPP_NUMBER.replace(/\D/g, '')
  const message = encodeURIComponent(`Hi, I want to get my Gaming ID — ${canonical}`)
  const waUrl = `https://wa.me/${phone}?text=${message}`

  const structuredData = generateStructuredData(
    {
      title,
      metaDesc,
      canonical,
      h1,
      pageType: 'keyword_landing',
      hasFaq: false,
      hasHowto: false,
      publishedAt: new Date('2025-01-01'),
      updatedAt: new Date(),
    },
    { includeBreadcrumb: true, breadcrumbSlug: slug }
  )

  return (
    <>
      {/* JSON-LD structured data */}
      <SEOHead structuredData={structuredData} />

      {/* ── Keyword Hero ── */}
      <section className="bg-black text-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <BreadcrumbNav h1={h1} slug={slug} />

          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            {h1}
          </h1>

          <p className="text-white/70 text-lg mb-8 max-w-2xl">
            ReddyExch provides gaming IDs for online sports prediction and fantasy
            participation platforms. Get your {keyword.toLowerCase()} in 5 minutes via
            WhatsApp — no paperwork, no waiting.
          </p>

          {/* Inline WhatsApp CTA */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-red text-white font-bold text-lg px-8 py-4 rounded-2xl interactive shadow-2xl"
            aria-label={`Get ${keyword} on WhatsApp`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Get {keyword} Now
          </a>

          <p className="text-white/40 text-sm mt-3">
            ✓ 5-minute activation &nbsp;·&nbsp; ✓ 18+ only &nbsp;·&nbsp; ✓ Not available in Telangana &amp; AP
          </p>
        </div>
      </section>

      {/* ── Body Content ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-black mb-4">
              What is a {keyword}?
            </h2>
            <p className="text-black/70 leading-relaxed mb-6">
              A {keyword.toLowerCase()} is your unique identifier on online sports
              prediction and fantasy participation platforms. With your gaming ID, you can
              participate in sports prediction contests, fantasy leagues, and other
              skill-based gaming activities on platforms like Diamond Exch, Fairplay,
              Lotus365, Sky Exchange, and more.
            </p>

            <h2 className="text-2xl font-bold text-black mb-4">
              How to Get Your {keyword}
            </h2>
            <ol className="list-decimal list-inside text-black/70 space-y-3 mb-6">
              <li>
                <strong>Click the WhatsApp button</strong> on this page. It opens a
                pre-filled message.
              </li>
              <li>
                <strong>Send the message</strong> to our team. Let us know which platform
                you want your ID for.
              </li>
              <li>
                <strong>Receive your gaming ID</strong> within 5 minutes. Our team is
                available 24/7.
              </li>
            </ol>

            <h2 className="text-2xl font-bold text-black mb-4">
              Why Choose ReddyExch for Your {keyword}?
            </h2>
            <ul className="list-disc list-inside text-black/70 space-y-2 mb-6">
              <li>Instant activation — get your ID in 5 minutes</li>
              <li>24/7 WhatsApp support</li>
              <li>Trusted by 10,000+ players across India</li>
              <li>IDs available for all major platforms</li>
              <li>Secure and confidential service</li>
            </ul>

            <div className="bg-black/5 rounded-2xl p-6 mb-6">
              <h3 className="text-black font-bold text-lg mb-2">Important Notice</h3>
              <p className="text-black/60 text-sm">
                ReddyExch provides gaming IDs for online sports prediction and fantasy
                participation platforms. This is not a gaming or gambling service. This
                service is available to users aged 18 and above only. Not available in
                Telangana and Andhra Pradesh.
              </p>
            </div>
          </div>

          {/* Inline CTA */}
          <div className="bg-black rounded-2xl p-8 text-center mt-8">
            <h3 className="text-white text-xl font-bold mb-2">
              Ready to Get Your {keyword}?
            </h3>
            <p className="text-white/60 text-sm mb-6">
              Contact us on WhatsApp and get your gaming ID in 5 minutes.
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red text-white font-semibold px-6 py-3 rounded-xl interactive"
              aria-label={`Get ${keyword} via WhatsApp`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Get {keyword} via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── Related Pages ── */}
      <section className="py-12 px-4 bg-black/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-black mb-4">Related Pages</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: '/keyword/online-cricket-id', label: 'Online Cricket ID' },
              { href: '/keyword/whatsapp-cricket-id', label: 'WhatsApp Cricket ID' },
              { href: '/keyword/instant-cricket-id', label: 'Instant Cricket ID' },
              { href: '/keyword/cricket-id-kaise-banaye', label: 'Cricket ID Kaise Banaye' },
              { href: '/keyword/reddyexch-cricket-id', label: 'ReddyExch Cricket ID' },
            ]
              .filter((p) => p.href !== `/keyword/${slug}`)
              .map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="bg-white border border-black/10 text-black/70 hover:text-black text-sm px-3 py-1.5 rounded-full transition-colors"
                >
                  {label}
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Responsible Gaming Disclaimer */}
      <div className="bg-black px-4 py-4">
        <ResponsibleGamingDisclaimer />
      </div>
    </>
  )
}
