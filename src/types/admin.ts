import type { ContentPage, KeywordRegistryEntry } from './content'

export type AdminRole = 'admin' | 'editor' | 'viewer'

export interface AdminSession {
  userId: string
  email: string
  role: AdminRole
  accessToken: string
  expiresAt: number
}

export interface SEOSuggestion {
  criterion: string
  currentValue: string
  requiredValue: string
  message: string
}

export interface SEOScoreResult {
  total: number
  breakdown: {
    keywordDensity:       { score: number; current: number; required: [number, number]; pass: boolean; warn?: boolean }
    keywordInFirst100:    { score: number; pass: boolean }
    titleLength:          { score: number; current: number; required: [number, number]; pass: boolean }
    descLength:           { score: number; current: number; required: [number, number]; pass: boolean }
    exactMatchH1:         { score: number; pass: boolean }
    headingStructure:     { score: number; h1Present: boolean; hierarchyValid: boolean; pass: boolean }
    internalLinks:        { score: number; current: number; required: number; pass: boolean }
    contentLength:        { score: number; current: number; required: number; pass: boolean }
    structuredData:       { score: number; pass: boolean }
    readability:          { score: number; current: number; required: number; pass: boolean }
  }
  suggestions: SEOSuggestion[]
}

export interface SEOMetric {
  id: string
  keywordId: string
  position: number
  source: 'api' | 'manual'
  recordedAt: Date
}

export type ComplianceAction =
  | 'create' | 'edit' | 'publish' | 'unpublish' | 'delete' | 'config_change'
  | 'age_gate_confirmed' | 'age_gate_declined' | 'geo_block_triggered' | 'compliance_export'

export type ComplianceResourceType = 'article' | 'keyword' | 'widget_config' | 'platform_config' | 'session' | 'export'

export interface ComplianceLog {
  id: number
  userId?: string
  action: ComplianceAction
  resourceType: ComplianceResourceType
  resourceId: string
  beforeState?: Record<string, unknown>
  afterState?: Record<string, unknown>
  timestamp: Date
}

export interface CrictimeConfig {
  matchTypes: ('IPL' | 'T20I' | 'ODI' | 'Test')[]
  teams?: string[]
  tournaments?: string[]
}

export interface InstagramConfig {
  hashtags: string[]
  accountHandles: string[]
  postCount: number
}

export interface WhatsAppABConfig {
  variantA: { buttonText: string; activationLabel: string; prefilledMessage: string }
  variantB: { buttonText: string; activationLabel: string; prefilledMessage: string }
  splitPercentage: number
  winner?: 'A' | 'B' | null
}

export interface WidgetConfig {
  id: string
  widgetType: 'crictime' | 'instagram' | 'whatsapp_ab'
  config: CrictimeConfig | InstagramConfig | WhatsAppABConfig
  isActive: boolean
  updatedBy?: string
  updatedAt: Date
}

export interface KeywordDensityAnalysis {
  density: number
  occurrences: number
  totalWords: number
  status: 'ok' | 'warn' | 'fail'
  synonymSuggestions: string[]
}

export interface InternalLinkGap {
  targetPage: ContentPage
  inboundLinkCount: number
  suggestedSourcePage: ContentPage
  suggestedAnchorText: string
}

export interface PrePublishCheckResult {
  passed: boolean
  checks: {
    name: string
    passed: boolean
    currentValue: string
    requiredValue: string
  }[]
}

export interface RankTrackerEntry {
  keyword: KeywordRegistryEntry
  currentPosition: number | null
  previousPosition: number | null
  positionDelta: number | null
  source: 'api' | 'manual'
  lastUpdated: Date
}
