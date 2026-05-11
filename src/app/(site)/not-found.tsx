import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '404 — Page Not Found | ReddyExch',
  description: 'The page you are looking for could not be found.',
  robots: { index: false, follow: false },
}

// Top keyword pages — hardcoded for static rendering (no DB dependency)
const TOP_KEYWORD_PAGES = [
  { href: '/keyword/online-cricket-id', label: 'Online Cricket ID' },
  { href: '/keyword/whatsapp-cricket-id', label: 'WhatsApp Cricket ID' },
  { href: '/keyword/instant-cricket-id', label: 'Instant Cricket ID' },
  { href: '/keyword/cricket-id-kaise-banaye', label: 'Cricket ID Kaise Banaye' },
  { href: '/keyword/reddyexch-cricket-id', label: 'ReddyExch Cricket ID' },
]

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-lg">
        {/* 404 display */}
        <div className="text-8xl font-bold text-red mb-4" aria-hidden="true">
          404
        </div>

        <h1 className="text-2xl font-bold text-black mb-3">Page Not Found</h1>

        <p className="text-black/60 text-sm mb-8">
          The page you are looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Back to home */}
        <Link
          href="/"
          className="inline-block bg-red text-white font-semibold px-6 py-3 rounded-xl interactive mb-10"
        >
          ← Back to Home
        </Link>

        {/* Popular pages */}
        <div className="text-left">
          <h2 className="text-sm font-semibold text-black/50 uppercase tracking-wider mb-4">
            Popular Pages
          </h2>
          <ul className="space-y-2">
            {TOP_KEYWORD_PAGES.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-red hover:underline text-sm"
                >
                  {label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
