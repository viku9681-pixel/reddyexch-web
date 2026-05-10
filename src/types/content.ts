export type PageType = 'keyword_landing' | 'content' | 'pillar'
export type PageStatus = 'draft' | 'scheduled' | 'published' | 'unpublished'
export type Language = 'en' | 'hi' | 'hin'

export interface ContentPage {
  id: string
  slug: string
  pageType: PageType
  title: string
  metaDesc: string
  h1: string
  bodyHtml: string       // auto-linked HTML for rendering
  bodyRaw: string        // pre-auto-link source for editor
  targetKeyword: string
  language: Language
  localeVariants?: {
    'en-IN'?: string
    'hi-IN'?: string
    'hin-IN'?: string
  }
  pillarId?: string
  status: PageStatus
  scheduledAt?: Date
  publishedAt?: Date
  wordCount: number
  seoScore?: number
  hasFaq: boolean
  hasHowto: boolean
  faqItems?: { question: string; answer: string }[]
  howtoSteps?: { name: string; text: string; image?: string }[]
  internalLinks: number
  createdAt: Date
  updatedAt: Date
}

export interface KeywordRegistryEntry {
  id: string
  keyword: string        // exact keyword string, e.g. "online cricket id"
  slug: string           // URL slug, e.g. "online-cricket-id"
  tier: 'primary' | 'secondary' | 'long_tail'
  pillarSlug?: string
  anchorTitle?: string
  synonyms: string[]
  pageId?: string
  inboundLinkCount?: number
}
