export interface PlatformConfig {
  whatsappNumber: string        // E.164 format, e.g. "+919876543210"
  exitUrl: string               // redirect for age gate decline
  ga4MeasurementId: string
  ga4ApiSecret: string
  gscSiteUrl: string
  fallbackContactPhone?: string
  fallbackContactEmail?: string
}

export type EventName =
  | 'page_view'
  | 'whatsapp_cta_click'
  | 'age_gate_confirmed'
  | 'age_gate_declined'
  | 'geo_block_triggered'
  | 'content_page_scroll_depth'
  | 'conversion_complete'

export interface AnalyticsEvent {
  event: EventName
  page_url: string
  session_id: string
  timestamp: string              // ISO 8601 UTC
  device_type?: 'mobile' | 'tablet' | 'desktop'
  cta_position?: 'hero' | 'sticky-footer' | 'inline'
  scroll_depth?: 25 | 50 | 75 | 100
  funnel_path?: string[]
  time_to_convert?: number       // seconds
  properties?: Record<string, string | number | boolean>
}

export interface WhatsAppCTAProps {
  position: 'hero' | 'sticky-footer' | 'inline'
  sourcePageUrl: string
  activationLabel?: string       // ≤60 chars
}

export interface AgeGateProps {
  onConfirm: () => void
  onDecline: () => void
  exitUrl: string
}

export interface GeoBlockerProps {
  countryCode?: string
  regionCode?: string
  blockedJurisdictions: { countryCode: string; regionCode?: string }[]
}

export interface SEOHeadProps {
  title: string                  // 10–60 chars
  description: string            // 50–160 chars
  canonical: string              // absolute URL
  structuredData: object[]       // JSON-LD objects array
  hreflang?: { lang: string; url: string }[]
  lcpImageUrl?: string           // triggers <link rel="preload" as="image">
  noindex?: boolean
}

export interface ContentPageProps {
  page: import('./content').ContentPage
  relatedPages?: import('./content').ContentPage[]
}
