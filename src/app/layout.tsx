import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
})

export const metadata: Metadata = {
  title: {
    default: 'ReddyExch — Online Cricket ID | Get Your Gaming ID Instantly',
    template: '%s | ReddyExch',
  },
  description:
    'Get your online cricket gaming ID instantly via WhatsApp. ReddyExch provides gaming IDs for sports prediction and fantasy participation platforms. 18+ only.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://reddyexchgaming.com'),
  robots: { index: true, follow: true },
  openGraph: {
    siteName: 'ReddyExch',
    locale: 'en_IN',
    type: 'website',
  },
}

/**
 * Root layout — bare HTML shell only.
 *
 * Public chrome (StickyNav, Footer, ComplianceOrchestrator, etc.)
 * lives in src/app/(site)/layout.tsx
 *
 * Admin chrome lives in src/app/admin/layout.tsx
 *
 * This separation ensures admin routes are NEVER wrapped with
 * ComplianceOrchestrator, which would block them with geo/age modals.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-black antialiased">
        {children}
      </body>
    </html>
  )
}
