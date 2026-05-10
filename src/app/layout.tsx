import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import StickyNav from '@/components/layout/StickyNav'
import Footer from '@/components/layout/Footer'
import StickyWhatsAppCTA from '@/components/cta/StickyWhatsAppCTA'
import ComplianceOrchestrator from '@/components/compliance/ComplianceOrchestrator'
import AnalyticsTracker from '@/components/analytics/AnalyticsTracker'

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Noto Sans Devanagari for Hindi content */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-black antialiased">
        {/* Compliance layer — renders GeoBlocker or AgeGate if needed */}
        <ComplianceOrchestrator />

        {/* Sticky navigation */}
        <StickyNav />

        <main>{children}</main>

        {/* Footer with Responsible Gaming Module */}
        <Footer />

        {/* Sticky WhatsApp CTA — fixed bottom-right, z-40, pulse animation */}
        <StickyWhatsAppCTA />

        {/* Analytics tracker — async, non-blocking */}
        <AnalyticsTracker />
      </body>
    </html>
  )
}
