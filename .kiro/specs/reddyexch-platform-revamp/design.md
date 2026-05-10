# Design Document — ReddyExch Commercial Gaming Platform Revamp

## Overview

ReddyExch is a commercial gaming ID platform targeting Indian cricket and sports gaming enthusiasts (18+). The revamp transforms a basic promotional site into a premium, high-conversion, SEO-dominant web application at reddyexchgaming.com. The platform's primary conversion mechanism is a WhatsApp-based Gaming ID activation flow — visitors land on keyword-optimized content pages, pass through a compliance layer (geo-block → age gate), and click a WhatsApp CTA to receive their Gaming ID within minutes.

### Primary Goals

- Rank #1 for "online cricket id" and "whatsapp cricket id" in India within 90 days
- Achieve ≥8% WhatsApp CTA click-through rate
- Lighthouse Mobile Score ≥90, LCP <2.5s, CLS <0.1
- Zero compliance violations (Age Gate, Geo-Blocking, Responsible Gaming)

### Tech Stack Decisions

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router, SSR/ISR, Server Components) | SSR/ISR for SEO, React Server Components reduce client JS bundle, built-in `next/image` optimization, route-based code splitting |
| Styling | Tailwind CSS + CSS custom properties | Utility-first keeps CSS lean; custom properties expose design tokens to both Tailwind and raw CSS; no runtime CSS-in-JS overhead |
| Database | Supabase (PostgreSQL + Row Level Security) | Managed Postgres with RLS enforced at DB level; Supabase client replaces Prisma ORM; no service keys exposed to client |
| Auth (Admin) | Supabase Auth (email/password, server-side session) | Built-in session management, RLS integration, 8-hour JWT lifetime configurable via Supabase dashboard; no separate auth library needed |
| Realtime | Supabase Realtime | Live score updates and admin dashboard analytics refresh without polling |
| Media Storage | Supabase Storage + `next/image` | Supabase Storage for uploads (WebP conversion via Sharp in API route before upload); `next/image` for responsive srcset, lazy loading, AVIF/WebP auto-optimization on delivery |
| Client State/Cache | SWR | Stale-while-revalidate for admin dashboard data fetching; automatic revalidation on focus/reconnect |
| API Cache | Vercel KV (Redis) | Cache geo-lookup results, platform config, and hot API responses at edge; TTL-based invalidation |
| CDN / Deployment | Vercel Edge Network | Global edge with India PoPs; CI/CD from GitHub (main/staging/develop branches); Preview Deployments per PR; environment variables managed in Vercel dashboard |
| DNS | GoDaddy → Vercel DNS (CNAME `@` → `cname.vercel-dns.com`) | GoDaddy registrar; DNS delegation to Vercel for automatic SSL and edge routing |
| Geo-Lookup | Vercel Edge Middleware (`geo` from `@vercel/edge`) | `request.geo.country` available in Next.js middleware at edge — zero-latency, no external service; falls back to `x-vercel-ip-country` header |
| Version Control | GitHub (main / staging / develop) | PR-based workflow; Vercel auto-deploys `main` to production, `staging` to staging preview |
| Analytics | GA4 (gtag.js) + Supabase `analytics_events` table | GA4 for marketing attribution; Supabase table for admin dashboard panel and offline queue fallback |
| Animations | CSS keyframes + Framer Motion (selective) | GPU-accelerated CSS keyframes for pulse/parallax; Framer Motion only for compliance modals (AgeGate, GeoBlocker) enter/exit transitions |
| Security | HTTPS default, CSP headers, Supabase RLS strict, no client-side service keys | All Supabase calls from Server Components or API Routes using `SUPABASE_SERVICE_ROLE_KEY` (server-only); client uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` with RLS |

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        VISITOR BROWSER                          │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Next.js  │  │ Compliance   │  │  Analytics Tracker       │  │
│  │ App      │  │ Layer        │  │  (async, non-blocking)   │  │
│  │ (React)  │  │ GeoBlock →   │  │  GA4 + Supabase queue    │  │
│  └────┬─────┘  │ AgeGate      │  └──────────────────────────┘  │
└───────┼────────┴──────────────┴─────────────────────────────────┘
        │ HTTPS
        ▼
┌───────────────────────────────────────────────────────────────┐
│                  VERCEL EDGE NETWORK                           │
│  Global CDN with India PoPs (Mumbai region)                   │
│  ┌─────────────────────┐  ┌──────────────────────────────┐   │
│  │ Static Asset Cache  │  │ Edge Middleware (Next.js)    │   │
│  │ (immutable, 1yr TTL)│  │ - request.geo.country        │   │
│  │ Cache-Control:      │  │ - Geo-block check            │   │
│  │ max-age=31536000,   │  │ - Age-gate cookie check      │   │
│  │ immutable           │  │ - Vercel KV config cache     │   │
│  └─────────────────────┘  └──────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
        │ Cache MISS / dynamic requests
        ▼
┌───────────────────────────────────────────────────────────────┐
│                  NEXT.JS 14 APP SERVER (Vercel)               │
│  Node.js runtime + Edge runtime (middleware)                  │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  App Router                                             │  │
│  │  /                    → Home page (ISR, revalidate=60)  │  │
│  │  /keyword/[slug]      → Keyword landing pages (ISR, 60s)│  │
│  │  /[slug]              → General content pages (ISR, 60s)│  │
│  │  /responsible-gaming  → Static page (SSG)               │  │
│  │  /sitemap.xml         → Dynamic sitemap (ISR, 60s)      │  │
│  │  /robots.txt          → Static                          │  │
│  │  /admin/**            → Admin Dashboard (SSR, auth)     │  │
│  │  /api/**              → API Routes (Node.js runtime)    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ SEO Scorer   │  │ Image Upload │  │ Sitemap Generator  │  │
│  │ Service      │  │ Pipeline     │  │ + GSC Ping         │  │
│  └──────────────┘  │ (Sharp→WebP  │  └────────────────────┘  │
│                    │ → Supabase   │                           │
│                    │   Storage)   │                           │
│                    └──────────────┘                           │
└───────────────────────────────────────────────────────────────┘
        │                           │
        ▼                           ▼
┌──────────────────────┐   ┌────────────────────────────────────┐
│   VERCEL KV (Redis)  │   │         SUPABASE                   │
│                      │   │                                    │
│  - Geo-lookup cache  │   │  PostgreSQL (RLS enforced)         │
│  - Platform config   │   │  Tables: content_pages,            │
│    cache (TTL 5min)  │   │    analytics_events, media_assets, │
│  - Hot API responses │   │    blocked_jurisdictions,          │
│                      │   │    platform_config                 │
└──────────────────────┘   │                                    │
                           │  Supabase Auth                     │
                           │  - Admin sessions (8hr JWT)        │
                           │  - RLS policy enforcement          │
                           │                                    │
                           │  Supabase Storage                  │
                           │  - WebP image assets               │
                           │  - Public CDN URLs                 │
                           │                                    │
                           │  Supabase Realtime                 │
                           │  - Live scores updates             │
                           │  - Admin analytics refresh         │
                           └────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                                 │
│  WhatsApp (wa.me / web.whatsapp.com deep-links)               │
│  Google Analytics 4 (gtag.js + Measurement Protocol)         │
│  Google Search Console (Sitemap Ping API)                     │
│  GitHub (main / staging / develop — PR-based CI/CD)          │
└───────────────────────────────────────────────────────────────┘
```

### GitHub → Vercel CI/CD Flow

```
GitHub Push / PR
      │
      ├─ develop branch → Vercel Preview Deployment (auto)
      ├─ staging branch → Vercel Staging Deployment (auto)
      └─ main branch   → Vercel Production Deployment (auto)
                              │
                              ▼
                    Smoke tests run (Lighthouse CI,
                    bundle size, Playwright checks)
                              │
                    Pass → deployment live
                    Fail → deployment blocked, PR notified
```

### Request Lifecycle (Visitor)

```
Browser Request
      │
      ▼
Vercel Edge Network
  ├─ Static asset? → Serve from cache (TTFB ≤200ms, Cache-Control: immutable)
  └─ Page request?
        │
        ▼
   Next.js Edge Middleware (runs at Vercel edge, before SSR)
     1. Read request.geo.country AND request.geo.region (Vercel built-in geo)
     2. Check blocked_jurisdictions (Vercel KV TTL 5min):
        - Blocked countries (any country code in blocked_jurisdictions)
        - Blocked Indian states: IN-TG (Telangana), IN-AP (Andhra Pradesh)
     3. If blocked OR geo unresolvable → set geo_blocked=1 cookie (HttpOnly; Secure; SameSite=Strict)
        → record compliance_logs entry (action='geo_block_triggered', no IP stored)
        → continue to page (GeoBlocker modal rendered client-side)
     4. Check age_verified session cookie (HttpOnly; Secure; SameSite=Strict)
     5. If not verified → set needs_age_gate=1 cookie, continue to page
     6. Set security headers: HSTS, X-Frame-Options, X-Content-Type-Options,
        Referrer-Policy, Permissions-Policy, CSP with per-request nonce
        │
        ▼
   Next.js Server (ISR cache HIT → serve cached HTML, MISS → render)
        │
        ▼
   Client hydrates:
     1. ComplianceOrchestrator reads cookies
     2. If geo_blocked → render GeoBlocker modal (Framer Motion enter)
     3. Else if needs_age_gate → render AgeGate modal (Framer Motion enter)
        → on confirm: set age_verified=1 (HttpOnly; Secure; SameSite=Strict)
                      record compliance_logs (action='age_gate_confirmed', no PII)
        → on decline: record compliance_logs (action='age_gate_declined')
                      redirect to exit URL
     4. Else → render page content normally
     5. Analytics Tracker initialises (requestIdleCallback, async, no PII in payloads)
     6. Supabase Realtime subscription (live scores section only)
```

### Page Structure (Every Public Page)

```
<html>
  <head>
    <!-- Preloaded fonts, LCP image preload, critical CSS inline -->
    <!-- JSON-LD structured data -->
    <!-- Canonical, hreflang, meta tags -->
  </head>
  <body>
    <StickyNav />           ← sticky, z-50
    <ComplianceOrchestrator />  ← renders GeoBlocker or AgeGate if needed
    <main>
      {page content}
    </main>
    <Footer>
      <ResponsibleGamingModule />
    </Footer>
    <StickyWhatsAppCTA />   ← fixed bottom-right, z-40, pulse animation
    <AnalyticsTracker />    ← async init, no render blocking
  </body>
</html>
```

---

## SEO Architecture

### Keyword Registry

The keyword registry is the authoritative source of truth for all target keywords. It is stored in the `keyword_registry` Supabase table and cached in Vercel KV. Every Keyword_Landing_Page has exactly one entry in the registry.

**Keyword Tiers:**

| Tier | Keywords | URL Pattern |
|---|---|---|
| Primary | online cricket id, whatsapp cricket id | `/keyword/online-cricket-id`, `/keyword/whatsapp-cricket-id` |
| Secondary | instant cricket id, cricket betting id, reddy anna book, diamond exch, fairplay id, lotus365 id, mahadev book, + 5 more brand/platform keywords | `/keyword/[slug]` |
| Long-tail | how to get cricket id via whatsapp, best ipl betting id india, + 8 more ≥4-word variants | `/keyword/[slug]` |

**Pillar-Cluster Mapping:**

```
Pillar: /keyword/online-cricket-id
  ├── Cluster: /keyword/instant-cricket-id
  ├── Cluster: /keyword/cricket-betting-id
  ├── Cluster: /keyword/how-to-get-cricket-id-via-whatsapp
  ├── Cluster: /keyword/best-ipl-betting-id-india
  └── Cluster: /keyword/whatsapp-cricket-id (cross-link)

Pillar: /keyword/whatsapp-cricket-id
  ├── Cluster: /keyword/how-to-get-cricket-id-via-whatsapp
  ├── Cluster: /keyword/instant-cricket-id
  └── Cluster: /keyword/online-cricket-id (cross-link)
```

### Content Language Rules

All Keyword_Landing_Pages follow these content rules enforced by the SEO_Scorer:

| Rule | Threshold | SEO_Scorer Action |
|---|---|---|
| Keyword in first 100 words | Required | Fail if absent |
| Keyword density | 1.5%–2.5% | Fail if <1.5% or >3%; warn if 2.5%–3% |
| Keyword density >3% | Forbidden | Warning: "Keyword density is X% — reduce below 3%" |
| Consecutive keyword repetition | ≤2 per sentence | Flag sentence |
| Meta title length | 50–60 chars (KLP), 10–60 chars (general) | Fail if outside range |
| Meta description length | 150–160 chars (KLP), 50–160 chars (general) | Fail if outside range |
| Exact-match H1 | Required | Fail if keyword not in H1 |
| Content register | Hinglish / English / Hindi natural mix | Advisory only (not auto-scored) |

### Structured Data Schema Map

Auto-generated from page content fields — no manual JSON editing required.

| Schema Type | Trigger Condition | Source Fields |
|---|---|---|
| `Organization` | Always | `platform_config`: name, url, logo, contactPoint |
| `WebPage` | Always | `title`, `meta_desc`, `canonical`, `published_at` |
| `Article` | Keyword_Landing_Pages + blog Content_Pages | `title`, `h1`, `body_html`, `published_at`, `author` |
| `BreadcrumbList` | URL depth ≥ 2 (all `/keyword/[slug]` pages) | Hardcoded: Home → page H1 |
| `FAQPage` | `has_faq = true` AND `faq_items` non-empty | `faq_items[]`: `question`, `answer` |
| `HowTo` | `has_howto = true` AND `howto_steps` non-empty | `howto_steps[]`: `name`, `text`, `image?` |

**BreadcrumbList structure for `/keyword/[slug]`:**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://reddyexchgaming.com/" },
    { "@type": "ListItem", "position": 2, "name": "{page h1}", "item": "https://reddyexchgaming.com/keyword/{slug}" }
  ]
}
```

### Hreflang Implementation

Three locale variants per page where content exists:

| Attribute | Locale | URL Pattern |
|---|---|---|
| `hreflang="en-IN"` | English (India) | `/keyword/[slug]` (default) |
| `hreflang="hi-IN"` | Hindi (India) | `/keyword/[slug]/hi` |
| `hreflang="hin-IN"` | Hinglish (India) | `/keyword/[slug]/hin` |

Each variant page includes `<link rel="alternate">` tags for all other variants. Stored via `locale_variants` JSONB column on `content_pages`.

### Auto-Linker Algorithm

```
Input: page body_html, keyword_registry[]
Output: body_html with contextual <a> tags inserted

For each keyword K in keyword_registry (sorted by length DESC to match longest first):
  1. Find all text nodes in body_html that contain K (case-insensitive)
  2. Skip text nodes already inside an <a> tag
  3. Skip if a link to /keyword/K.slug already exists on this page
  4. Replace the FIRST unlinked occurrence of K with:
     <a href="/keyword/{K.slug}" title="{K.anchor_title}">{original_text}</a>
  5. Mark K as linked for this page (no duplicate links to same target)

Return modified body_html
```

### Canonical URL & Redirect Rules

| Scenario | Behaviour |
|---|---|
| `/keyword/Online-Cricket-ID` (uppercase) | 301 → `/keyword/online-cricket-id` |
| `/keyword/online-cricket-id/` (trailing slash) | 301 → `/keyword/online-cricket-id` |
| `/keyword/online-cricket-id?utm_source=x` | Canonical = `/keyword/online-cricket-id` (UTM params stripped from canonical, not redirected) |
| `/admin/**` | `noindex, nofollow` meta tag + `Disallow` in robots.txt |
| `/api/**` | `noindex, nofollow` meta tag + `Disallow` in robots.txt |

---

### Design System Tokens

```css
/* CSS Custom Properties — defined in globals.css */
:root {
  /* Colors */
  --color-white:    #FFFFFF;
  --color-black:    #1A1A1A;
  --color-red:      #FF3B30;   /* Hot Red — CTA / accent */
  --color-success:  #10B981;
  --color-warning:  #F59E0B;
  --color-error:    #EF4444;

  /* Typography */
  --font-sans:      'Inter', system-ui, sans-serif;
  --font-devanagari:'Noto Sans Devanagari', sans-serif;

  /* Type scale (clamp: min, preferred, max) */
  --text-xs:   clamp(0.75rem,  1.5vw, 0.875rem);
  --text-sm:   clamp(0.875rem, 2vw,   1rem);
  --text-base: clamp(1rem,     2.5vw, 1.125rem);
  --text-lg:   clamp(1.125rem, 3vw,   1.25rem);
  --text-xl:   clamp(1.25rem,  3.5vw, 1.5rem);
  --text-2xl:  clamp(1.5rem,   4vw,   2rem);
  --text-3xl:  clamp(1.875rem, 5vw,   2.5rem);
  --text-4xl:  clamp(2.25rem,  6vw,   3rem);

  /* Spacing (4px baseline grid) */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;

  /* Animation */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 200ms;
  --duration-base: 300ms;
}
```

### Component Hierarchy

```
App
├── Layout (RootLayout)
│   ├── StickyNav
│   │   ├── Logo
│   │   ├── NavLinks
│   │   └── NavWhatsAppCTA (mobile: icon only)
│   ├── ComplianceOrchestrator
│   │   ├── GeoBlocker (modal, full-screen)
│   │   └── AgeGate (modal, full-screen)
│   ├── {page content slot}
│   ├── Footer
│   │   ├── FooterLinks
│   │   ├── FooterLegal
│   │   └── ResponsibleGamingModule
│   │       ├── PlayResponsiblyBadge
│   │       ├── HelplineNumber
│   │       ├── SelfExclusionLink
│   │       └── AgeDisclaimer
│   ├── StickyWhatsAppCTA (fixed, bottom-right)
│   └── AnalyticsTracker (no DOM output)
│
├── HomePage
│   ├── HeroSection
│   │   ├── HeroHeadline
│   │   ├── HeroSubheadline
│   │   ├── HeroWhatsAppCTA
│   │   ├── ActivationTimeBadge
│   │   └── CricketParallaxBackground
│   ├── PartnersSection (trust badges)
│   ├── HowItWorksSection
│   ├── WhyReddyExchSection
│   ├── OffersSection
│   ├── LiveScoresSection
│   ├── InstagramFeedSection
│   └── Footer (via Layout)
│
├── KeywordLandingPage (/keyword/[slug])
│   ├── KeywordHero (exact-match H1, above-fold CTA)
│   ├── KeywordBody (rich text, auto-linked, Hinglish/EN/HI)
│   ├── FAQSection (conditional, if has_faq)
│   ├── HowToSection (conditional, if has_howto)
│   ├── BreadcrumbNav (Home → page H1)
│   ├── RelatedKeywordsSection (cluster links)
│   ├── InlineWhatsAppCTA
│   └── Footer (via Layout)
│
├── ContentPage ([slug])
│   ├── ContentHero
│   ├── ContentBody (rich text, MDX)
│   ├── FAQSection (conditional)
│   ├── InlineWhatsAppCTA
│   └── Footer (via Layout)
│
├── ResponsibleGamingPage
│   ├── SelfExclusionInstructions
│   ├── DepositLimitGuidance
│   └── HelplineDetails
│
└── AdminDashboard (/admin/*)
    ├── AdminLogin
    ├── AdminLayout (auth-gated, role-aware)
    │   ├── AdminNav (role-filtered menu items)
    │   ├── ContentEditor (admin + editor only)
    │   │   ├── RichTextEditor
    │   │   ├── SEOPanel
    │   │   │   ├── SEOScoreMeter (0–100 gauge)
    │   │   │   ├── SEOSuggestionList (per-criterion, <70 only)
    │   │   │   └── KeywordDensityMeter (real-time, colour-coded)
    │   │   ├── KeywordDensityAnalyzer
    │   │   │   └── HinglishSynonymSuggester (≥3 suggestions when >2.5%)
    │   │   ├── SchemaGenerator
    │   │   │   ├── FAQSchemaPreview
    │   │   │   ├── ArticleSchemaPreview
    │   │   │   ├── BreadcrumbSchemaPreview
    │   │   │   └── SchemaValidationErrors
    │   │   ├── AnchorTextSuggester (related keyword links)
    │   │   ├── PrePublishChecklist (modal, blocks publish if any fail)
    │   │   ├── ImageUploader
    │   │   └── SlugInput
    │   ├── ContentCalendar (admin + editor)
    │   ├── InternalLinkGapAnalyzer (admin + editor)
    │   │   ├── GapList (under-linked pages)
    │   │   └── LinkSuggestionRow (source page + anchor text)
    │   ├── RankTracker (admin + editor + viewer)
    │   │   ├── KeywordRankTable
    │   │   └── RankHistoryChart
    │   ├── WidgetConfigPanel (admin only)
    │   │   ├── CrictimeConfigForm
    │   │   ├── InstagramConfigForm
    │   │   └── WhatsAppABTestConfig
    │   ├── AuditLog (admin + viewer)
    │   │   ├── AuditLogTable
    │   │   └── DiffViewer (before/after state)
    │   └── AnalyticsPanel (admin + editor + viewer)
    │       ├── CTRChart
    │       ├── TopPagesTable
    │       └── FunnelSummary
```

### Key Component Interfaces (TypeScript)

```typescript
// WhatsApp CTA
interface WhatsAppCTAProps {
  position: 'hero' | 'sticky-footer' | 'inline';
  sourcePageUrl: string;
  activationLabel?: string; // ≤60 chars, e.g. "Get your ID in 5 minutes"
}

// Age Gate
interface AgeGateProps {
  onConfirm: () => void;
  onDecline: () => void;
  exitUrl: string; // from platform config
}

// Geo Blocker
interface GeoBlockerProps {
  countryCode: string;
  blockedCountries: string[];
}

// SEO Head (per page)
interface SEOHeadProps {
  title: string;           // 10–60 chars
  description: string;     // 50–160 chars
  canonical: string;       // absolute URL
  structuredData: object[]; // JSON-LD objects array
  hreflang?: { lang: string; url: string }[];
  lcpImageUrl?: string;    // triggers <link rel="preload" as="image">
}

// Content Page (rendered)
interface ContentPageProps {
  page: ContentPage;       // from DB
  relatedPages?: ContentPage[];
}

// Analytics Event
interface AnalyticsEvent {
  event: EventName;
  page_url: string;
  session_id: string;
  timestamp: string;       // ISO 8601 UTC
  properties?: Record<string, string | number | boolean>;
}

type EventName =
  | 'page_view'
  | 'whatsapp_cta_click'
  | 'age_gate_confirmed'
  | 'age_gate_declined'
  | 'geo_block_triggered'
  | 'content_page_scroll_depth'
  | 'conversion_complete';
```

### Animation Specifications

```css
/* Hover / active micro-interactions — applied via Tailwind plugin or utility classes */
.interactive {
  transition: transform var(--duration-fast) var(--ease-out);
  will-change: transform;
  transform: translateZ(0); /* GPU layer promotion */
}
.interactive:hover  { transform: scale(1.02) translateZ(0); }
.interactive:active { transform: scale(0.98) translateZ(0); }

/* Sticky WhatsApp CTA pulse */
@keyframes wa-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.4); }
  50%       { box-shadow: 0 0 0 12px rgba(255, 59, 48, 0); }
}
.wa-cta-sticky {
  animation: wa-pulse 2s ease-out infinite;
  will-change: box-shadow;
}

/* Hero cricket parallax — CSS only, no JS library */
@keyframes cricket-float {
  0%, 100% { transform: translateY(0) translateZ(0); }
  50%       { transform: translateY(-12px) translateZ(0); }
}
.hero-parallax-asset {
  animation: cricket-float 4s ease-in-out infinite;
  will-change: transform;
}
```

---

## Data Models

### Supabase PostgreSQL Schema

All tables use Supabase's built-in `auth.users` for admin identity. Row Level Security (RLS) is enabled on every table. No service role key is ever exposed to the client — all privileged operations go through Next.js API Routes using `SUPABASE_SERVICE_ROLE_KEY` (server-only environment variable).

```sql
-- Enable RLS on all tables (run once)
-- ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;

-- Content Pages (covers both general Content_Pages and Keyword_Landing_Pages)
CREATE TABLE content_pages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  page_type     TEXT NOT NULL DEFAULT 'content'
                  CHECK (page_type IN ('keyword_landing', 'content', 'pillar')),
  title         TEXT NOT NULL CHECK (char_length(title) BETWEEN 10 AND 60),
  meta_desc     TEXT NOT NULL CHECK (char_length(meta_desc) BETWEEN 50 AND 160),
  h1            TEXT NOT NULL,
  body_html     TEXT NOT NULL,          -- compiled HTML for rendering (auto-linked)
  body_raw      TEXT NOT NULL,          -- raw source for editor (pre-auto-link)
  target_keyword TEXT NOT NULL,
  language      TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi', 'hin')),
  locale_variants JSONB,               -- {"en-IN": "/keyword/slug", "hi-IN": "/keyword/slug/hi", "hin-IN": "/keyword/slug/hin"}
  pillar_id     UUID REFERENCES content_pages(id), -- null for pillar pages; set for cluster pages
  status        TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','scheduled','published','unpublished')),
  scheduled_at  TIMESTAMPTZ,
  published_at  TIMESTAMPTZ,
  word_count    INTEGER GENERATED ALWAYS AS (
                  array_length(regexp_split_to_array(trim(body_raw), '\s+'), 1)
                ) STORED,
  seo_score     INTEGER CHECK (seo_score BETWEEN 0 AND 100),
  has_faq       BOOLEAN NOT NULL DEFAULT false,
  has_howto     BOOLEAN NOT NULL DEFAULT false,
  faq_items     JSONB,                 -- [{"question": "...", "answer": "..."}]
  howto_steps   JSONB,                 -- [{"name": "...", "text": "...", "image": "...?"}]
  internal_links INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Keyword Registry (source of truth for all 30+ target keywords)
CREATE TABLE keyword_registry (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword       TEXT UNIQUE NOT NULL,  -- exact keyword string, e.g. "online cricket id"
  slug          TEXT UNIQUE NOT NULL,  -- URL slug, e.g. "online-cricket-id"
  tier          TEXT NOT NULL CHECK (tier IN ('primary', 'secondary', 'long_tail')),
  pillar_slug   TEXT REFERENCES keyword_registry(slug), -- null for pillar keywords
  anchor_title  TEXT,                  -- title attribute for auto-generated links
  synonyms      TEXT[],                -- alternate forms for auto-linker matching
  page_id       UUID REFERENCES content_pages(id), -- linked Keyword_Landing_Page
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_keyword_registry_slug ON keyword_registry(slug);
CREATE INDEX idx_keyword_registry_tier ON keyword_registry(tier);

-- Admin User Roles (extends Supabase auth.users)
-- Role stored in auth.users.raw_user_meta_data->>'role'
-- Values: 'admin' | 'editor' | 'viewer'
-- Set via Supabase Auth admin API on user creation/update

-- SEO Metrics (rank tracking history)
CREATE TABLE seo_metrics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id    UUID NOT NULL REFERENCES keyword_registry(id),
  position      INTEGER NOT NULL CHECK (position >= 0),
  source        TEXT NOT NULL CHECK (source IN ('api', 'manual')),
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_seo_metrics_keyword_id ON seo_metrics(keyword_id);
CREATE INDEX idx_seo_metrics_recorded_at ON seo_metrics(recorded_at DESC);

CREATE POLICY "Admin manage seo_metrics" ON seo_metrics
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Viewer read seo_metrics" ON seo_metrics
  FOR SELECT USING (auth.role() = 'authenticated');

-- Compliance Logs (append-only audit log)
CREATE TABLE compliance_logs (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id), -- NULL for visitor events (age gate, geo block)
  action        TEXT NOT NULL CHECK (action IN (
                  'create','edit','publish','unpublish','delete','config_change',
                  'age_gate_confirmed','age_gate_declined','geo_block_triggered',
                  'compliance_export'
                )),
  resource_type TEXT NOT NULL CHECK (resource_type IN (
                  'article','keyword','widget_config','session','export'
                )),
  resource_id   TEXT NOT NULL,         -- page id, keyword id, or session_id (no PII)
  before_state  JSONB,                 -- NO IP addresses, NO PII
  after_state   JSONB,                 -- NO IP addresses, NO PII
  timestamp     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_compliance_logs_user_id    ON compliance_logs(user_id);
CREATE INDEX idx_compliance_logs_action     ON compliance_logs(action);
CREATE INDEX idx_compliance_logs_timestamp  ON compliance_logs(timestamp DESC);

-- Append-only: no UPDATE or DELETE permitted
CREATE POLICY "Authenticated insert compliance_logs" ON compliance_logs
  FOR INSERT WITH CHECK (true);        -- service role inserts visitor events too
CREATE POLICY "Admin read compliance_logs" ON compliance_logs
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "No update compliance_logs" ON compliance_logs
  FOR UPDATE USING (false);
CREATE POLICY "No delete compliance_logs" ON compliance_logs
  FOR DELETE USING (false);

-- Conversion Logs (WhatsApp CTA conversion tracking, separate from analytics_events)
CREATE TABLE conversion_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    TEXT NOT NULL,
  page_url      TEXT NOT NULL,
  cta_variant   TEXT,                   -- A/B test variant identifier
  device_type   TEXT CHECK (device_type IN ('mobile','tablet','desktop')),
  funnel_path   TEXT[],
  time_to_convert INTEGER,             -- seconds
  timestamp     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_conversion_logs_session_id ON conversion_logs(session_id);
CREATE INDEX idx_conversion_logs_timestamp  ON conversion_logs(timestamp DESC);

CREATE POLICY "No direct client access" ON conversion_logs
  FOR ALL USING (false);

-- Widget Configurations
CREATE TABLE widget_configs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_type   TEXT NOT NULL CHECK (widget_type IN ('crictime','instagram','whatsapp_ab')),
  config        JSONB NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  updated_by    UUID REFERENCES auth.users(id),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE POLICY "Admin manage widget_configs" ON widget_configs
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );
CREATE POLICY "Editor read widget_configs" ON widget_configs
  FOR SELECT USING (auth.role() = 'authenticated');
-- Media Assets (files stored in Supabase Storage bucket: 'media')
CREATE TABLE media_assets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_name TEXT NOT NULL,
  webp_url      TEXT NOT NULL,          -- Supabase Storage public URL (WebP)
  original_url  TEXT,                   -- Supabase Storage URL of original
  file_size_kb  INTEGER NOT NULL,       -- output WebP size, must be ≤500
  width         INTEGER,
  height        INTEGER,
  uploaded_by   UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE POLICY "Admin manage media" ON media_assets
  FOR ALL USING (auth.role() = 'authenticated');

-- Analytics Events (append-only; public INSERT via API route with service key)
CREATE TABLE analytics_events (
  id            BIGSERIAL PRIMARY KEY,
  event         TEXT NOT NULL,
  page_url      TEXT NOT NULL,
  session_id    TEXT NOT NULL,
  device_type   TEXT CHECK (device_type IN ('mobile','tablet','desktop')),
  cta_position  TEXT CHECK (cta_position IN ('hero','sticky-footer','inline')),
  scroll_depth  INTEGER CHECK (scroll_depth IN (25, 50, 75, 100)),
  funnel_path   TEXT[],
  time_to_convert INTEGER,
  timestamp     TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_properties JSONB
);
CREATE INDEX idx_analytics_event_name ON analytics_events(event);
CREATE INDEX idx_analytics_page_url   ON analytics_events(page_url);
CREATE INDEX idx_analytics_timestamp  ON analytics_events(timestamp DESC);

-- RLS: no direct client access; all writes via API route (service role)
CREATE POLICY "No direct client access" ON analytics_events
  FOR ALL USING (false);

-- Blocked Jurisdictions (country-level and state-level)
CREATE TABLE blocked_jurisdictions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code  CHAR(2) NOT NULL,      -- ISO 3166-1 alpha-2, e.g. 'IN'
  region_code   TEXT,                  -- ISO 3166-2 subdivision, e.g. 'IN-TG', 'IN-AP'
                                       -- NULL means entire country is blocked
  reason        TEXT,
  added_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (country_code, region_code)
);
-- Pre-seeded: IN-TG (Telangana), IN-AP (Andhra Pradesh) per India Online Gaming Rules 2026

CREATE POLICY "Public read" ON blocked_jurisdictions FOR SELECT USING (true);
CREATE POLICY "Admin manage" ON blocked_jurisdictions
  FOR ALL USING (auth.role() = 'authenticated');

-- Platform Configuration (key-value; cached in Vercel KV)
CREATE TABLE platform_config (
  key           TEXT PRIMARY KEY,
  value         TEXT NOT NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Required keys: whatsapp_number, exit_url, ga4_measurement_id,
--                ga4_api_secret, gsc_site_url, fallback_contact_phone,
--                fallback_contact_email

CREATE POLICY "Public read config" ON platform_config FOR SELECT USING (true);
CREATE POLICY "Admin manage config" ON platform_config
  FOR ALL USING (auth.role() = 'authenticated');
```

### Supabase Storage Buckets

| Bucket | Access | Purpose |
|---|---|---|
| `media` | Public (read) | WebP-converted image assets served via Supabase CDN URL |
| `media-originals` | Private | Original uploaded files (JPEG/PNG/GIF) kept for re-processing |

### Vercel KV (Redis) Key Schema

| Key Pattern | TTL | Value |
|---|---|---|
| `geo:blocked_countries` | 5 min | JSON array of ISO 3166-1 alpha-2 codes |
| `config:platform` | 5 min | JSON object of all `platform_config` rows |
| `sitemap:last_updated` | 60s | ISO 8601 timestamp |
| `analytics:summary:daily` | 1 hr | Pre-aggregated daily CTR summary JSON |
| `keywords:registry` | 10 min | Full `keyword_registry` array (for auto-linker + anchor suggester) |
| `keywords:pillar_map` | 10 min | Map of pillar slug → cluster slugs[] |
| `widgets:crictime` | 5 min | CrictimeConfig JSON |
| `widgets:instagram` | 5 min | InstagramConfig JSON |
| `widgets:whatsapp_ab` | 5 min | WhatsAppABConfig JSON |
| `rank:latest` | 24 hr | Map of keyword_id → latest position |

### TypeScript Domain Types

```typescript
// Mirrors DB schema for application layer
interface ContentPage {
  id: string;
  slug: string;
  pageType: 'keyword_landing' | 'content' | 'pillar';
  title: string;
  metaDesc: string;
  h1: string;
  bodyHtml: string;       // auto-linked HTML for rendering
  bodyRaw: string;        // pre-auto-link source for editor
  targetKeyword: string;
  language: 'en' | 'hi' | 'hin';
  localeVariants?: {      // hreflang map
    'en-IN'?: string;
    'hi-IN'?: string;
    'hin-IN'?: string;
  };
  pillarId?: string;      // null for pillar pages; set for cluster pages
  status: 'draft' | 'scheduled' | 'published' | 'unpublished';
  scheduledAt?: Date;
  publishedAt?: Date;
  wordCount: number;
  seoScore?: number;
  hasFaq: boolean;
  hasHowto: boolean;
  faqItems?: { question: string; answer: string }[];
  howtoSteps?: { name: string; text: string; image?: string }[];
  internalLinks: number;
  createdAt: Date;
  updatedAt: Date;
}

interface KeywordRegistryEntry {
  id: string;
  keyword: string;        // exact keyword string, e.g. "online cricket id"
  slug: string;           // URL slug, e.g. "online-cricket-id"
  tier: 'primary' | 'secondary' | 'long_tail';
  pillarSlug?: string;    // null for pillar keywords
  anchorTitle?: string;   // title attribute for auto-generated links
  synonyms: string[];     // alternate forms for auto-linker matching
  pageId?: string;        // linked Keyword_Landing_Page id
}

interface PlatformConfig {
  whatsappNumber: string;       // E.164 format, e.g. "+919876543210"
  exitUrl: string;              // redirect for age gate decline
  ga4MeasurementId: string;
  ga4ApiSecret: string;
  gscSiteUrl: string;
  fallbackContactPhone?: string;
  fallbackContactEmail?: string;
}

interface SEOScoreResult {
  total: number;               // 0–100
  breakdown: {
    keywordDensity:    { score: number; current: number; required: [number, number]; pass: boolean };
    titleLength:       { score: number; current: number; required: number; pass: boolean };
    descLength:        { score: number; current: number; required: number; pass: boolean };
    headingStructure:  { score: number; h1Present: boolean; hierarchyValid: boolean; pass: boolean };
    internalLinks:     { score: number; current: number; required: number; pass: boolean };
    contentLength:     { score: number; current: number; required: number; pass: boolean };
  };
  suggestions: SEOSuggestion[];
}

interface SEOSuggestion {
  criterion: string;
  currentValue: string;
  requiredValue: string;
  message: string;
}

// Supabase Auth session (admin)
// Uses Supabase's built-in auth.users — no custom admin_users table
// Session managed via @supabase/ssr (server-side cookie session)
// JWT lifetime: 8 hours (configured in Supabase dashboard → Auth → JWT expiry)
// Role stored in auth.users.raw_user_meta_data->>'role'
interface AdminSession {
  userId: string;        // auth.users.id
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  accessToken: string;   // Supabase JWT (8hr expiry)
  expiresAt: number;     // Unix timestamp
}

interface SEOMetric {
  id: string;
  keywordId: string;
  position: number;
  source: 'api' | 'manual';
  recordedAt: Date;
}

interface ComplianceLog {
  id: number;
  userId: string;
  action: 'create' | 'edit' | 'publish' | 'unpublish' | 'delete' | 'config_change';
  resourceType: 'article' | 'keyword' | 'widget_config';
  resourceId: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  timestamp: Date;
}

interface WidgetConfig {
  id: string;
  widgetType: 'crictime' | 'instagram' | 'whatsapp_ab';
  config: CrictimeConfig | InstagramConfig | WhatsAppABConfig;
  isActive: boolean;
  updatedBy?: string;
  updatedAt: Date;
}

interface CrictimeConfig {
  matchTypes: ('IPL' | 'T20I' | 'ODI' | 'Test')[];
  teams?: string[];
  tournaments?: string[];
}

interface InstagramConfig {
  hashtags: string[];
  accountHandles: string[];
  postCount: number;     // max 12
}

interface WhatsAppABConfig {
  variantA: { buttonText: string; activationLabel: string; prefilledMessage: string };
  variantB: { buttonText: string; activationLabel: string; prefilledMessage: string };
  splitPercentage: number;  // 0–100, percentage of traffic to variant A
  winner?: 'A' | 'B' | null;
}

interface KeywordDensityAnalysis {
  density: number;           // percentage
  occurrences: number;
  totalWords: number;
  status: 'ok' | 'warn' | 'fail';
  synonymSuggestions: string[];  // Hinglish synonyms when density > 2.5%
}

interface InternalLinkGap {
  targetPage: ContentPage;
  inboundLinkCount: number;
  suggestedSourcePage: ContentPage;
  suggestedAnchorText: string;
}

interface PrePublishCheckResult {
  passed: boolean;
  checks: {
    name: string;
    passed: boolean;
    currentValue: string;
    requiredValue: string;
  }[];
}

interface RankTrackerEntry {
  keyword: KeywordRegistryEntry;
  currentPosition: number | null;
  previousPosition: number | null;
  positionDelta: number | null;   // positive = improvement, negative = decline
  source: 'api' | 'manual';
  lastUpdated: Date;
}

// SWR hook return types (admin dashboard client)
interface UseContentPagesResult {
  pages: ContentPage[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

interface UseAnalyticsSummaryResult {
  summary: AnalyticsSummary | undefined;
  isLoading: boolean;
  error: Error | undefined;
}
```

### API Routes

```
Public API (no auth required)
──────────────────────────────
GET  /sitemap.xml                    → Dynamic XML sitemap (ISR revalidate=60)
GET  /robots.txt                     → Static
GET  /api/geo-check                  → { blocked: boolean, countryCode: string }
                                       (reads Vercel KV cache, falls back to DB)
POST /api/analytics/event            → Ingest single analytics event
                                       (uses SUPABASE_SERVICE_ROLE_KEY server-side)
POST /api/analytics/batch            → Batch ingest (offline queue flush, max 50)

Admin API (all require Supabase Auth session cookie)
─────────────────────────────────────────────────────
POST /api/admin/auth/login           → Supabase signInWithPassword → set session cookie
POST /api/admin/auth/logout          → Supabase signOut → clear session cookie
GET  /api/admin/pages                → List all content pages (SWR-cached on client)
POST /api/admin/pages                → Create content page (admin + editor)
GET  /api/admin/pages/[id]           → Get single page
PUT  /api/admin/pages/[id]           → Update page (admin + editor)
POST /api/admin/pages/[id]/publish   → Publish (admin + editor; runs Pre_Publish_Checklist,
                                       triggers sitemap ISR revalidation,
                                       Vercel KV sitemap:last_updated update,
                                       GSC ping, auto-linker run,
                                       compliance_logs entry)
POST /api/admin/pages/[id]/unpublish → Unpublish page (admin + editor; compliance_logs entry)
DELETE /api/admin/pages/[id]         → Delete page (admin only; compliance_logs entry)
POST /api/admin/pages/score          → Run SEO_Score_Meter on draft content
POST /api/admin/pages/autolink       → Run Auto_Linker on body_raw, return body_html preview
POST /api/admin/pages/prepublish     → Run Pre_Publish_Checklist, return pass/fail per check
POST /api/admin/media/upload         → Multipart upload → Sharp WebP conversion
                                       → Supabase Storage upload → return public URL
GET  /api/admin/analytics/summary    → Dashboard summary (Vercel KV cache 1hr)
GET  /api/admin/analytics/pages      → Per-page CTR data
GET  /api/admin/config               → Get platform config (Vercel KV cache 5min)
PUT  /api/admin/config               → Update platform config + invalidate KV cache
GET  /api/admin/keywords             → List keyword registry (Vercel KV cache 10min)
POST /api/admin/keywords             → Add keyword to registry + invalidate KV cache (admin only)
PUT  /api/admin/keywords/[id]        → Update keyword entry + invalidate KV cache (admin only)
GET  /api/admin/keywords/[id]/anchor-suggestions → Return anchor text suggestions for a page
GET  /api/admin/keywords/link-gaps   → Return Internal_Link_Gap_Analyzer results
GET  /api/admin/rank-tracker         → List current rankings for all keywords
POST /api/admin/rank-tracker         → Manual rank input (admin + editor)
POST /api/admin/rank-tracker/refresh → Trigger Ahrefs/SEMrush API refresh (admin only)
GET  /api/admin/widgets              → List all widget configs (admin + editor)
PUT  /api/admin/widgets/[id]         → Update widget config (admin only; compliance_logs entry)
GET  /api/admin/audit-log            → List compliance_logs (admin + viewer), filterable
GET  /api/admin/seo-metrics/[keywordId] → Historical rank data for a keyword
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: WhatsApp URL Construction Correctness

*For any* valid source page URL, phone number, and device type (mobile or desktop), the WhatsApp URL builder SHALL produce a URL that: (a) uses the `https://wa.me/` scheme when device type is mobile, (b) uses the `https://web.whatsapp.com/send` scheme when device type is desktop, (c) contains the phone number in the correct position, and (d) contains a URL-encoded message body that includes the literal source page URL.

**Validates: Requirements 2.1, 2.4, 2.5**

---

### Property 2: WhatsApp CTA Fallback on Invalid Configuration

*For any* phone number configuration value that is absent, empty, or fails URL validation, the CTA resolver SHALL return a fallback contact block (not a WhatsApp URL), and the fallback block SHALL contain the configured alternate phone number or email address.

**Validates: Requirements 2.7**

---

### Property 3: WhatsApp CTA Click Event Payload Completeness

*For any* WhatsApp CTA click context (page URL, CTA position, session ID, device type, timestamp), the constructed `whatsapp_cta_click` event object SHALL contain all five required fields — `page_url` (string), `cta_position` (one of "hero", "sticky-footer", "inline"), `session_id` (string), `device_type` (one of "mobile", "tablet", "desktop"), and `timestamp` (valid ISO 8601 UTC string) — with no field absent or null.

**Validates: Requirements 2.2, 7.2**

---

### Property 4: Sitemap Generation Completeness and Validity

*For any* non-empty set of published, indexable content pages, the sitemap generator SHALL produce XML that: (a) lists every page in the input set exactly once, (b) contains a `<lastmod>` value for each entry that parses as a valid ISO 8601 date string, (c) contains a `<changefreq>` value for each entry drawn exclusively from the set {always, hourly, daily, weekly, monthly, yearly, never}, and (d) validates against the Sitemap Protocol 0.9 XML schema.

**Validates: Requirements 3.1**

---

### Property 5: Structured Data Completeness

*For any* content page, the structured data generator SHALL produce a JSON-LD array that: (a) always contains objects with `@type: "WebPage"` and `@type: "Organization"`, (b) additionally contains an object with `@type: "FAQPage"` if and only if the page has `hasFaq = true` and at least one FAQ item, and (c) every object in the array is valid JSON and contains a non-empty `@context` field.

**Validates: Requirements 3.3, 3.4**

---

### Property 6: Meta Tag Length Constraints and Uniqueness

*For any* content page, the meta tag validator SHALL: (a) accept title strings of length 10–60 characters and reject all others, (b) accept description strings of length 50–160 characters and reject all others. *For any* collection of published content pages, no two pages SHALL share an identical `title` value and no two pages SHALL share an identical `meta_desc` value.

**Validates: Requirements 3.5**

---

### Property 7: Target Keyword Presence in Required Fields

*For any* published content page with a non-empty `target_keyword`, the keyword SHALL appear as a case-insensitive substring in the page's `title`, in the page's first `h1` element text, and in the page's `meta_desc`. A page that fails any of these three checks SHALL not be publishable.

**Validates: Requirements 3.6**

---

### Property 8: Hreflang Tag Generation

*For any* content page with a non-null `hi_variant_id`, the head tag generator SHALL produce both a `<link rel="alternate" hreflang="hi">` tag referencing the Hindi variant URL and a `<link rel="alternate" hreflang="en">` tag referencing the English variant URL. *For any* content page with a null `hi_variant_id`, neither hreflang tag SHALL be present in the output.

**Validates: Requirements 3.8**

---

### Property 9: Top-N Pages by Word Count Selection

*For any* non-empty set of published content pages and any integer N ≥ 1, the top-N selector SHALL return exactly min(N, total_pages) pages, and the returned pages SHALL be sorted in descending order by `word_count` with no page outside the top-N by word count included in the result.

**Validates: Requirements 3.9**

---

### Property 10: Geo-Block Decision Logic and Fail-Safe

*For any* country code string, region code string, and any non-empty blocked jurisdiction list, the geo-block decision function SHALL return `true` (blocked) if: (a) the country code matches a blocked entry with `region_code = NULL` (entire country blocked), OR (b) the country code is `IN` and the region code matches a blocked entry (e.g., `IN-TG`, `IN-AP`). *For any* null, undefined, or empty-string country code input (representing an unresolvable IP), the function SHALL return `true` (fail-safe deny). *For any* `IN` country code with undefined or null region code, the function SHALL return `true` (fail-safe deny — cannot confirm state is allowed).

**Validates: Requirements 4.6, 4.7, 4.8**

---

### Property 11: Compliance Orchestration Ordering

*For any* combination of compliance state inputs (geoBlocked: boolean, ageVerified: boolean), the compliance orchestrator SHALL return: (a) `GeoBlocker` when `geoBlocked = true`, regardless of `ageVerified`, (b) `AgeGate` when `geoBlocked = false` and `ageVerified = false`, and (c) `null` (no modal) when `geoBlocked = false` and `ageVerified = true`. No other output is valid for any input combination.

**Validates: Requirements 4.9**

---

### Property 12: Admin Session Token Lifetime

*For any* valid admin credential submission at any wall-clock time T, the Supabase Auth session token SHALL have an expiry equal to exactly T + 8 hours (28,800 seconds), as configured in the Supabase project's Auth settings (JWT expiry = 28800). The session middleware SHALL reject any request bearing a token whose `exp` claim is less than or equal to the current time.

**Validates: Requirements 5.2**

---

### Property 13: SEO Scorer Correctness and Suggestion Generation

*For any* content page input, the SEO Scorer SHALL: (a) return a total score in the closed interval [0, 100], (b) mark `keywordDensity` as passing if and only if the keyword density is in [1%, 3%], (c) mark `titleLength` as passing if and only if title length is ≤60 characters, (d) mark `descLength` as passing if and only if description length is ≤160 characters, (e) mark `headingStructure` as passing if and only if an H1 is present and H2/H3 hierarchy is valid, (f) mark `internalLinks` as passing if and only if internal link count is ≥2, (g) mark `contentLength` as passing if and only if word count is ≥600. *For any* input where the total score is below 70, the suggestions array SHALL contain exactly one entry for each criterion that did not pass, with non-empty `criterion`, `currentValue`, and `requiredValue` fields.

**Validates: Requirements 5.4, 5.5**

---

### Property 14: Content Calendar 90-Day Window Filter

*For any* set of content pages and any reference timestamp T, the calendar filter SHALL return exactly the pages whose `scheduled_at` or `published_at` falls within the half-open interval [T − 90 days, T + 90 days), and SHALL exclude all pages whose dates fall outside this window. Pages with null dates SHALL not appear in the calendar view.

**Validates: Requirements 5.6**

---

### Property 15: Image Conversion Output Constraint

*For any* valid input image in JPEG, PNG, GIF, or WebP format with file size ≤10 MB, the image conversion pipeline SHALL produce an output file in WebP format with file size ≤500 KB. The output SHALL be a valid WebP binary (correct magic bytes: `52 49 46 46 ... 57 45 42 50`).

**Validates: Requirements 5.8**

---

### Property 16: Slug Uniqueness Validation

*For any* proposed slug string and any set of existing published or scheduled page slugs, the slug validator SHALL return `false` (invalid) if the proposed slug matches any existing slug (case-insensitive, after URL normalization), and SHALL return `true` (valid) if the proposed slug does not match any existing slug. An empty or whitespace-only slug SHALL always return `false`.

**Validates: Requirements 5.9**

---

### Property 17: Analytics CTR Calculation Correctness

*For any* set of analytics events for a given page and time period where `pageViews > 0`, the CTR calculator SHALL return a value equal to `ctaClicks / pageViews` (as a decimal in [0, 1]). *For any* set of pages ranked by CTA click count, the ranking function SHALL return pages in strictly non-increasing order of click count, with no page omitted from the top-10 that has a higher click count than any included page.

**Validates: Requirements 7.3**

---

### Property 18: Funnel Completion Detection

*For any* ordered sequence of analytics events for a session that contains `page_view`, then `age_gate_confirmed`, then `whatsapp_cta_click` (in that order, with any other events interleaved), the funnel detector SHALL emit exactly one `conversion_complete` event with `funnel_path` equal to `["page_view", "age_gate_confirmed", "whatsapp_cta_click"]` and `time_to_convert` equal to the integer number of seconds between the `page_view` timestamp and the `whatsapp_cta_click` timestamp. *For any* sequence that does not contain all three events in order, no `conversion_complete` event SHALL be emitted.

**Validates: Requirements 7.5**

---

### Property 19: Analytics Offline Queue FIFO Eviction

*For any* sequence of N events enqueued when the analytics endpoint is unreachable, where N > 50: (a) the queue size SHALL never exceed 50 at any point, (b) when the queue is full and a new event is enqueued, the event with the earliest timestamp SHALL be evicted, (c) after enqueuing all N events, the queue SHALL contain exactly the 50 most recently enqueued events, and (d) the events in the queue SHALL be ordered from oldest to newest (FIFO delivery order).

**Validates: Requirements 7.7**

---

### Property 20: Analytics Event Dispatch with GA4 Fallback

*For any* analytics event and any platform configuration (GA4 enabled or disabled), the event dispatcher SHALL always store the event to the internal analytics endpoint. When GA4 is enabled, the event SHALL additionally be forwarded to GA4. When GA4 is disabled, the absence of GA4 forwarding SHALL not prevent internal storage.

**Validates: Requirements 7.1, 7.4**

---

## Error Handling

### Compliance Layer Errors

| Scenario | Behavior |
|---|---|
| Vercel `request.geo.country` returns undefined | Fail-safe: treat as blocked, show GeoBlocker, log to compliance_logs |
| Vercel `request.geo.region` returns undefined (country known, state unknown) | Fail-safe: if country is IN, treat as blocked (cannot confirm state is allowed) |
| Vercel KV unavailable (geo cache miss) | Fall back to direct Supabase DB query for blocked_jurisdictions |
| Supabase DB unreachable for geo check | Fail-safe: treat as blocked |
| Cookie write fails (private browsing / ITP) | Re-run compliance checks on every page load via middleware |
| Age gate confirm — compliance_logs write fails | Log error to Sentry; do NOT block the user (cookie already set) |

### WhatsApp CTA Errors

| Scenario | Behavior |
|---|---|
| `whatsapp_number` config key missing | Render fallback contact block (phone/email from config) |
| Constructed URL fails `URL` constructor validation | Render fallback contact block |
| `fallback_contact_phone` and `fallback_contact_email` both absent | Render static "Contact us" text with no link |

### Analytics Errors

| Scenario | Behavior |
|---|---|
| Analytics endpoint unreachable | Enqueue to localStorage FIFO queue (max 50 events) |
| localStorage unavailable (private mode, quota exceeded) | Drop event silently; never block rendering |
| GA4 Measurement Protocol returns non-2xx | Log to console (dev) / Sentry (prod); continue internal storage |
| Queue retry fails after 30s | Retry again at next 30s interval; no exponential backoff (keep simple) |

### Admin Dashboard Errors

| Scenario | Behavior |
|---|---|
| Image upload exceeds 10 MB | Return 413 with message "File too large. Maximum size is 10 MB." |
| WebP conversion fails to meet 500 KB target | Retry with lower quality (q=60, then q=40); if still >500 KB, return error |
| Supabase Storage upload fails | Return 502; do not save media_assets DB row; display error to admin |
| Duplicate slug on publish | Return 409 with message identifying the conflicting slug |
| GSC sitemap ping fails | Complete publication; display non-blocking toast warning to admin |
| Supabase Auth session expired (8hr) | Supabase `@supabase/ssr` middleware redirects to `/admin/login` |
| Vercel KV unavailable on config update | Write to Supabase DB; log KV invalidation failure; serve stale KV until TTL expires |

### SEO Scorer Errors

| Scenario | Behavior |
|---|---|
| Body HTML is empty | Return score 0 with all criteria failing |
| Target keyword is empty | Skip keyword density check; score that criterion as 0 |
| HTML parsing fails | Return score 0 with error message in suggestions |

### HTTP Error Pages

| Status | Page |
|---|---|
| 404 | Custom page with nav links to homepage + top 5 pages by word count |
| 500 | Static error page (no DB dependency) with homepage link |
| 503 | Cloudflare error page (CDN-level) |

---

## Testing Strategy

### Overview

The testing strategy uses a dual approach: property-based tests for universal correctness guarantees and example-based unit/integration tests for specific scenarios, edge cases, and infrastructure verification.

### Property-Based Testing

**Library**: [fast-check](https://github.com/dubzzz/fast-check) (TypeScript/JavaScript)

**Configuration**: Minimum 100 runs per property test (`numRuns: 100` in fast-check config; increase to 1000 for critical properties like geo-block and queue eviction).

**Tag format**: Each property test file includes a comment header:
```
// Feature: reddyexch-platform-revamp, Property {N}: {property_text}
```

**Properties to implement** (20 total — see Correctness Properties section):

| Property | Module Under Test | Key Generators |
|---|---|---|
| P1: WhatsApp URL construction | `lib/whatsapp.ts` | `fc.webUrl()`, `fc.constantFrom('mobile','desktop')` |
| P2: WhatsApp CTA fallback | `lib/whatsapp.ts` | `fc.option(fc.string())` for phone number |
| P3: CTA click event payload | `lib/analytics.ts` | `fc.webUrl()`, `fc.constantFrom(positions)` |
| P4: Sitemap generation | `lib/sitemap.ts` | `fc.array(fc.record({slug, publishedAt, ...}))` |
| P5: Structured data | `lib/structured-data.ts` | `fc.record(contentPage)`, `fc.array(faqItem)` |
| P6: Meta tag constraints | `lib/seo-validation.ts` | `fc.string({minLength:0, maxLength:200})` |
| P7: Keyword presence | `lib/seo-validation.ts` | `fc.record({title, h1, metaDesc, keyword})` |
| P8: Hreflang generation | `lib/seo-head.ts` | `fc.option(fc.uuid())` for hiVariantId |
| P9: Top-N by word count | `lib/content-utils.ts` | `fc.array(fc.record({wordCount: fc.nat()}))` |
| P10: Geo-block decision | `lib/geo.ts` | `fc.string({minLength:2,maxLength:2})`, `fc.array(fc.string())` |
| P11: Compliance orchestration | `lib/compliance.ts` | `fc.boolean()`, `fc.boolean()` |
| P12: JWT session lifetime | `lib/auth.ts` | `fc.date()` for issuance time |
| P13: SEO Scorer | `lib/seo-scorer.ts` | `fc.record(contentPage)` with all fields varying |
| P14: Calendar 90-day filter | `lib/calendar.ts` | `fc.array(fc.record({scheduledAt: fc.date()}))` |
| P15: Image conversion | `lib/image-pipeline.ts` | Sample images of varying sizes/formats |
| P16: Slug uniqueness | `lib/slug-validation.ts` | `fc.string()`, `fc.array(fc.string())` |
| P17: CTR calculation | `lib/analytics-calc.ts` | `fc.nat()` for clicks and views |
| P18: Funnel detection | `lib/analytics.ts` | `fc.array(fc.record(event))` with funnel events |
| P19: Queue FIFO eviction | `lib/analytics-queue.ts` | `fc.array(fc.record(event), {minLength:51})` |
| P20: Event dispatch fallback | `lib/analytics.ts` | `fc.record(event)`, `fc.boolean()` for GA4 enabled |

### Unit Tests (Example-Based)

Focus areas:
- Age Gate state transitions (confirm → cookie set, decline → redirect)
- Admin auth middleware (unauthenticated → 302 redirect)
- CRUD operations for content pages via admin API
- 404 page rendering with correct navigation links
- Responsible Gaming Module content presence
- WhatsApp activation label length validation (≤60 chars)

### Integration Tests

Focus areas:
- HTTP 200 for all published content pages (SSR/SSG output)
- HTTP 404 for non-existent URLs
- `/sitemap.xml` updates within 60s of page publication
- `/robots.txt` directive correctness
- Admin API CRUD operations end-to-end
- Image upload pipeline (upload → WebP conversion → CDN URL returned)
- GA4 Measurement Protocol forwarding

### Smoke Tests (CI/CD Pipeline — runs on every Vercel deployment)

Run automatically via GitHub Actions on push to `main`, `staging`, `develop`:
- Lighthouse CI: LCP <2.5s, CLS <0.1, Score ≥90 (mobile)
- Bundle size check: initial JS ≤150KB gzip per route (`@next/bundle-analyzer`)
- Page weight check: total ≤1500KB, images ≤1000KB (Playwright network intercept)
- Cache-Control header check on static assets (`immutable` present)
- `robots.txt` and `sitemap.xml` accessibility (HTTP 200, valid content-type)
- Responsive layout check at 320px, 768px, 1440px (Playwright)
- WhatsApp CTA above-fold visibility at 360×640px (Playwright)
- Responsible Gaming Module visibility in footer (Playwright)
- `/responsible-gaming` page HTTP 200
- Supabase RLS smoke test: anon key cannot read draft pages or analytics_events
- Vercel Preview URL accessible (for PR deployments)

### Performance Budget

| Metric | Target | Measurement Tool |
|---|---|---|
| Lighthouse Mobile Score | ≥90 | Lighthouse CI (GitHub Action) |
| LCP | <2.5s | Lighthouse CI |
| CLS | <0.1 | Lighthouse CI |
| INP | <200ms | Lighthouse CI |
| TTFB (Vercel Edge HIT) | ≤200ms | Vercel Analytics / synthetic monitoring |
| Initial JS bundle (gzip) | ≤150KB | `@next/bundle-analyzer` |
| Total page weight | ≤1500KB | Browser network waterfall (Playwright) |
| Image weight per page | ≤1000KB | Browser network waterfall (Playwright) |
| Font files | ≤2 families, preloaded | Manual audit |
| CDN round-trip (India) | ≤50ms (90th pct) | Vercel Analytics (Real Experience Score) |

### Security Considerations

**Transport & Headers**
- **HTTPS**: Enforced by Vercel (automatic TLS via Let's Encrypt); HSTS header set via `next.config.js` (`Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`); HTTP → HTTPS 301 redirect at Vercel edge
- **Security headers** (all set in `next.config.js` `headers()` config): `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- **CSP**: Per-request nonce (`crypto.randomUUID()` in middleware); `default-src 'self'`; `script-src 'self' 'nonce-{nonce}' https://www.googletagmanager.com https://www.google-analytics.com`; `frame-ancestors 'none'`; JSON-LD injected via `dangerouslySetInnerHTML` only after server-side sanitisation

**Authentication & Sessions**
- **Admin auth**: Supabase Auth (email/password); JWT lifetime 8 hours (Supabase dashboard config); role stored in `raw_user_meta_data->>'role'`; rate-limit login: 5 attempts / 15 min per IP via Vercel KV counter
- **Cookies**: ALL Platform-set cookies use `HttpOnly; Secure; SameSite=Strict` — applies to `age_verified`, Supabase Auth session, and `geo_blocked`; no PII in any cookie value

**Supabase RLS (enforced at DB level)**
- RLS enabled on every table; see schema for per-table policies
- `SUPABASE_SERVICE_ROLE_KEY`: server-only env var, never in `NEXT_PUBLIC_*`, never in client bundle; CI pipeline includes secret-scanning step to fail on any `NEXT_PUBLIC_SUPABASE_SERVICE` pattern
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: client-side only, all queries subject to RLS

**Rate Limiting (Vercel KV counters)**
- `POST /api/admin/auth/login`: 5 req / IP / 15 min → HTTP 429 + `Retry-After`
- `POST /api/analytics/event`: 60 req / session / min → HTTP 429
- `POST /api/analytics/batch`: 5 req / session / min → HTTP 429
- `GET /api/geo-check`: 30 req / IP / min → HTTP 429

**No PII in Logs**
- IP addresses: NEVER stored in any DB table or log
- `compliance_logs`: stores `user_id` UUID (not email); visitor events store `session_id` only
- `analytics_events`: stores `session_id`, `device_type` (mobile/tablet/desktop), `page_url` — no IP, no full User-Agent, no fingerprint
- Compliance export: `user_id` anonymised as SHA-256 hash before CSV generation

**Input Validation & Injection Prevention**
- All admin API inputs validated with Zod server-side; HTTP 400 on failure with structured error
- Rich text sanitised with `sanitize-html` server-side (removes `<script>`, `<iframe>`, `on*` attributes) before DB storage
- URL slugs validated against `^[a-z0-9-]+$`; HTTP 400 on failure
- All Supabase queries use parameterised client methods (no raw SQL with user input)

**Compliant Language Enforcement**
- Pre_Publish_Checklist scans `body_raw`, `title`, `meta_desc`, `h1` for "betting"/"bet" (case-insensitive, whole-word); blocks publication if found
- Responsible Gaming disclaimer auto-injected as static HTML on all public pages

**Branch Protection & Secrets**
- GitHub `main` branch: PR review required + CI passing before merge
- Vercel env vars scoped per environment (production/staging/preview)
- No secrets committed to repository; `.env.example` contains only key names, no values
