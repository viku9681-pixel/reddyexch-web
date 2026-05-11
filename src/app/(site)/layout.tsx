import StickyNav from '@/components/layout/StickyNav'
import Footer from '@/components/layout/Footer'
import StickyWhatsAppCTA from '@/components/cta/StickyWhatsAppCTA'
import ComplianceOrchestrator from '@/components/compliance/ComplianceOrchestrator'
import AnalyticsTracker from '@/components/analytics/AnalyticsTracker'
import { getWhatsAppNumber } from '@/lib/get-whatsapp-number'

/**
 * Public site layout.
 * Applied to all routes in the (site) group:
 *   / | /keyword/* | /privacy-policy | /responsible-gaming | /terms
 *
 * Admin routes (/admin/*) use their own layout and are NOT in this group.
 * This is the correct Next.js App Router pattern for isolating admin from public.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const waPhone = await getWhatsAppNumber()

  return (
    <>
      <ComplianceOrchestrator />
      <StickyNav phone={waPhone} />
      <main>{children}</main>
      <Footer />
      <StickyWhatsAppCTA phone={waPhone} />
      <AnalyticsTracker />
    </>
  )
}
