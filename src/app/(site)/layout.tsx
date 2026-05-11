import StickyNav from '@/components/layout/StickyNav'
import Footer from '@/components/layout/Footer'
import StickyWhatsAppCTA from '@/components/cta/StickyWhatsAppCTA'
import ComplianceOrchestrator from '@/components/compliance/ComplianceOrchestrator'
import AnalyticsTracker from '@/components/analytics/AnalyticsTracker'

/**
 * Public site layout.
 * Applied to all routes in the (site) group:
 *   / | /keyword/* | /privacy-policy | /responsible-gaming | /terms
 *
 * Admin routes (/admin/*) use their own layout and are NOT in this group.
 * This is the correct Next.js App Router pattern for isolating admin from public.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ComplianceOrchestrator />
      <StickyNav />
      <main>{children}</main>
      <Footer />
      <StickyWhatsAppCTA />
      <AnalyticsTracker />
    </>
  )
}
