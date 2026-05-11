import type { Metadata } from 'next'
import Link from 'next/link'
import { getWhatsAppNumber } from '@/lib/get-whatsapp-number'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'ReddyExch — Online Cricket ID | Get Yours Instantly via WhatsApp',
  description:
    'Get your online cricket gaming ID instantly via WhatsApp. ReddyExch provides gaming IDs for sports prediction and fantasy participation platforms. 18+ only.',
  alternates: {
    canonical: 'https://reddyexchgaming.com',
  },
  // LCP preload hint for hero section
  other: {
    'link-preload': '</og-image.jpg>; rel=preload; as=image',
  },
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://reddyexchgaming.com'

function buildWAUrl(phone: string, source: string) {
  const digits = phone.replace(/\D/g, '')
  const message = encodeURIComponent(`Hi, I want to get my Gaming ID — ${SITE_URL}${source}`)
  return `https://wa.me/${digits}?text=${message}`
}

const PARTNERS = [
  'Diamond Exch',
  'Fairplay',
  'Lotus365',
  'Sky Exchange',
  'Mahadev Book',
  'Reddy Anna',
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Click WhatsApp Button',
    desc: 'Tap the WhatsApp button on this page. It opens a pre-filled message for you.',
  },
  {
    step: '02',
    title: 'Send Your Details',
    desc: 'Send the message and share your preferred platform. Our team responds instantly.',
  },
  {
    step: '03',
    title: 'Get Your Cricket ID in 5 Minutes',
    desc: 'Receive your gaming ID within 5 minutes. Start participating right away.',
  },
]

const FEATURES = [
  {
    icon: '⚡',
    title: 'Instant Activation',
    desc: 'Your gaming ID is activated within 5 minutes of your WhatsApp request.',
  },
  {
    icon: '🕐',
    title: '24/7 Support',
    desc: 'Our team is available around the clock to assist you via WhatsApp.',
  },
  {
    icon: '🏆',
    title: 'Trusted Platform',
    desc: 'Trusted by 10,000+ players across India for reliable gaming ID services.',
  },
  {
    icon: '🔒',
    title: 'Secure & Safe',
    desc: 'Your information is handled with strict confidentiality and security.',
  },
]

const OFFERS = [
  {
    title: 'Welcome Bonus',
    desc: 'Get a welcome bonus on your first deposit through ReddyExch.',
    badge: 'New Users',
  },
  {
    title: 'Refer & Earn',
    desc: 'Refer a friend and earn rewards when they activate their gaming ID.',
    badge: 'Ongoing',
  },
  {
    title: 'IPL Special',
    desc: 'Exclusive gaming IDs with special benefits during IPL season.',
    badge: 'IPL 2025',
  },
]

export default async function HomePage() {
  const waPhone = await getWhatsAppNumber()
  const waUrl = buildWAUrl(waPhone, '/')

  return (
    <>
      {/* ── Hero Section ── */}
      <section className="bg-black text-white py-20 px-4 relative overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              'radial-gradient(ellipse at 70% 50%, #FF3B30 0%, transparent 60%)',
          }}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                Online Cricket ID —{' '}
                <span className="text-red">Get Yours Instantly</span> via WhatsApp
              </h1>
              <p className="text-white/70 text-lg mb-8 max-w-lg">
                ReddyExch provides gaming IDs for online sports prediction and fantasy
                participation platforms. Get your ID in 5 minutes — no paperwork, no
                waiting.
              </p>

              {/* Hero CTA */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-red text-white font-bold text-lg px-8 py-4 rounded-2xl wa-cta-sticky interactive shadow-2xl"
                aria-label="Get Cricket ID on WhatsApp"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Get Cricket ID on WhatsApp
              </a>

              <p className="text-white/50 text-sm mt-3">
                ✓ Get your ID in 5 minutes &nbsp;·&nbsp; ✓ 18+ only &nbsp;·&nbsp; ✓ Not available in Telangana &amp; AP
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4 mt-8">
                {['10,000+ Players', '5-Min Activation', '24/7 Support', 'Secure'].map(
                  (badge) => (
                    <span
                      key={badge}
                      className="bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full border border-white/20"
                    >
                      {badge}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Cricket ball floating animation */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="hero-parallax-asset text-[160px] select-none" aria-hidden="true">
                🏏
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Partners Section ── */}
      <section className="bg-black/5 py-12 px-4" aria-labelledby="partners-heading">
        <div className="max-w-7xl mx-auto text-center">
          <h2
            id="partners-heading"
            className="text-black/50 text-sm font-semibold uppercase tracking-widest mb-6"
          >
            Trusted by 10,000+ players — IDs available for
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {PARTNERS.map((name) => (
              <span
                key={name}
                className="bg-white border border-black/10 text-black font-semibold text-sm px-4 py-2 rounded-full shadow-sm"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-4 bg-white" aria-labelledby="how-it-works-heading">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2
              id="how-it-works-heading"
              className="text-3xl font-bold text-black mb-3"
            >
              How It Works
            </h2>
            <p className="text-black/60 max-w-md mx-auto">
              Getting your cricket gaming ID is simple. Three steps, five minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 bg-red text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step}
                </div>
                <h3 className="text-black font-semibold text-lg mb-2">{title}</h3>
                <p className="text-black/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red text-white font-semibold px-6 py-3 rounded-xl interactive"
              aria-label="Get your Cricket ID now via WhatsApp"
            >
              Get Your Cricket ID Now →
            </a>
          </div>
        </div>
      </section>

      {/* ── Why ReddyExch ── */}
      <section className="py-20 px-4 bg-black" aria-labelledby="why-reddyexch-heading">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2
              id="why-reddyexch-heading"
              className="text-3xl font-bold text-white mb-3"
            >
              Why Choose ReddyExch?
            </h2>
            <p className="text-white/60 max-w-md mx-auto">
              We make getting your gaming ID fast, safe, and hassle-free.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors"
              >
                <div className="text-4xl mb-4" aria-hidden="true">{icon}</div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Offers Section ── */}
      <section className="py-20 px-4 bg-white" aria-labelledby="offers-heading">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2
              id="offers-heading"
              className="text-3xl font-bold text-black mb-3"
            >
              Current Offers
            </h2>
            <p className="text-black/60 max-w-md mx-auto">
              Exclusive offers for new and existing players.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {OFFERS.map(({ title, desc, badge }) => (
              <div
                key={title}
                className="border-2 border-red/20 rounded-2xl p-6 hover:border-red/50 transition-colors relative overflow-hidden"
              >
                <span className="absolute top-4 right-4 bg-red text-white text-xs font-bold px-2 py-1 rounded-full">
                  {badge}
                </span>
                <h3 className="text-black font-bold text-lg mb-2 pr-16">{title}</h3>
                <p className="text-black/60 text-sm leading-relaxed mb-4">{desc}</p>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red font-semibold text-sm hover:underline"
                  aria-label={`Claim ${title} offer on WhatsApp`}
                >
                  Claim via WhatsApp →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Scores Placeholder ── */}
      <section className="py-16 px-4 bg-black/5" aria-labelledby="live-scores-heading">
        <div className="max-w-7xl mx-auto text-center">
          <h2
            id="live-scores-heading"
            className="text-2xl font-bold text-black mb-3"
          >
            Live Scores
          </h2>
          <div className="bg-white border border-black/10 rounded-2xl p-12 max-w-lg mx-auto">
            <div className="text-4xl mb-4" aria-hidden="true">🏏</div>
            <p className="text-black/50 font-medium">Live scores coming soon</p>
            <p className="text-black/30 text-sm mt-1">
              Real-time match scores via Supabase Realtime — Phase 4
            </p>
          </div>
        </div>
      </section>

      {/* ── Instagram Feed Placeholder ── */}
      <section className="py-16 px-4 bg-white" aria-labelledby="instagram-heading">
        <div className="max-w-7xl mx-auto">
          <h2
            id="instagram-heading"
            className="text-2xl font-bold text-black mb-6 text-center"
          >
            Follow Us on Instagram
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-black/5 rounded-xl flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="text-black/20 text-2xl">📸</span>
              </div>
            ))}
          </div>
          <p className="text-center text-black/30 text-sm mt-4">
            Instagram feed — Phase 4
          </p>
        </div>
      </section>

      {/* ── Keyword Links Section ── */}
      <section className="py-12 px-4 bg-black/5" aria-labelledby="popular-pages-heading">
        <div className="max-w-7xl mx-auto">
          <h2
            id="popular-pages-heading"
            className="text-lg font-semibold text-black mb-4"
          >
            Popular Gaming ID Pages
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: '/keyword/online-cricket-id', label: 'Online Cricket ID' },
              { href: '/keyword/whatsapp-cricket-id', label: 'WhatsApp Cricket ID' },
              { href: '/keyword/instant-cricket-id', label: 'Instant Cricket ID' },
              { href: '/keyword/diamond-exch', label: 'Diamond Exch ID' },
              { href: '/keyword/fairplay-id', label: 'Fairplay ID' },
              { href: '/keyword/lotus365-id', label: 'Lotus365 ID' },
              { href: '/keyword/mahadev-book', label: 'Mahadev Book' },
              { href: '/keyword/sky-exchange-id', label: 'Sky Exchange ID' },
            ].map(({ href, label }) => (
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

      {/* Responsible Gaming note */}
      <div className="bg-black/5 px-4 py-4 text-center">
        <p role="note" className="text-black/40 text-xs">
          ReddyExch provides gaming IDs for online sports prediction and fantasy participation
          platforms. This is not a gaming or gambling service. 18+ only. Not available in
          Telangana and Andhra Pradesh.{' '}
          <Link href="/responsible-gaming" className="underline">
            Responsible Gaming
          </Link>
        </p>
      </div>
    </>
  )
}
