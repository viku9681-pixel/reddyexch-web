# Tasks — ReddyExch Commercial Gaming Platform Revamp

## Summary

| Phase | Tasks | Description |
|---|---|---|
| 1 | 1–8 | Project Scaffolding & Infrastructure |
| 2 | 9–17 | Design System & Shared Components |
| 3 | 18–24 | Compliance Layer (core) |
| 3b | 121–132 | Compliance Layer — India 2026 Rules & Security Hardening |
| 4 | 25–31 | Public Pages |
| 5 | 32–40 | SEO Infrastructure |
| 5b | 95–104 | Keyword Architecture & SEO Expansion |
| 6 | 41–46 | WhatsApp CTA System |
| 7 | 47–55 | Analytics Tracker |
| 8 | 56–72 | Admin Dashboard (core) |
| 8b | 105–120 | Admin Dashboard (roles, SEO tools, rank tracker, widgets, audit log) |
| 9 | 73–82 | Performance Optimization |
| 10 | 83–94 | CI/CD & Smoke Tests |

**Total tasks: 132**

**Property-Based Tests Index:**

| Property | Task | Module |
|---|---|---|
| P1: WhatsApp URL construction | Task 42 | `lib/whatsapp.ts` |
| P2: WhatsApp CTA fallback | Task 43 | `lib/whatsapp.ts` |
| P3: CTA click event payload | Task 44 | `lib/analytics.ts` |
| P4: Sitemap generation | Task 37 | `lib/sitemap.ts` |
| P5: Structured data completeness | Task 38 | `lib/structured-data.ts` |
| P6: Meta tag length constraints | Task 35 | `lib/seo-validation.ts` |
| P7: Keyword presence | Task 36 | `lib/seo-validation.ts` |
| P8: Hreflang generation | Task 39 | `lib/seo-head.ts` |
| P9: Top-N pages by word count | Task 31 | `lib/content-utils.ts` |
| P10: Geo-block decision logic | Task 23 | `lib/geo.ts` |
| P11: Compliance orchestration | Task 24 | `lib/compliance.ts` |
| P12: Admin session token lifetime | Task 68 | `lib/auth.ts` |
| P13: SEO Scorer correctness | Task 69 | `lib/seo-scorer.ts` |
| P14: Calendar 90-day filter | Task 70 | `lib/calendar.ts` |
| P15: Image conversion output | Task 71 | `lib/image-pipeline.ts` |
| P16: Slug uniqueness validation | Task 72 | `lib/slug-validation.ts` |
| P17: Analytics CTR calculation | Task 55 | `lib/analytics-calc.ts` |
| P18: Funnel completion detection | Task 52 | `lib/analytics.ts` |
| P19: Queue FIFO eviction | Task 53 | `lib/analytics-queue.ts` |
| P20: Event dispatch GA4 fallback | Task 54 | `lib/analytics.ts` |

---

## Phase 1: Project Scaffolding & Infrastructure

- [ ] Task 1: Initialize Next.js 14 App Router project
  - Description: Bootstrap the Next.js 14 project with App Router, TypeScript strict mode, ESLint, Prettier, and path aliases. Configure `next.config.js` with security headers (CSP, HSTS, X-Frame-Options), image domains (Supabase Storage CDN), and ISR revalidation defaults. Set up `.env.example` with all required environment variable keys.
  - Files: `next.config.js`, `tsconfig.json`, `.eslintrc.json`, `.prettierrc`, `.env.example`, `package.json`
  - Requires: —
  - Validates: REQ 1.2, REQ 6.1, REQ 6.4

- [ ] Task 2: Configure Tailwind CSS with design tokens
  - Description: Install and configure Tailwind CSS v3. Define all CSS custom properties (design tokens) in `globals.css` — color palette (white, black, red, success, warning, error), typography scale (8 clamp-based sizes), spacing scale (10 tokens on 4px grid), animation easing and duration variables. Extend `tailwind.config.ts` to reference these tokens so Tailwind utilities map to the same values.
  - Files: `tailwind.config.ts`, `src/app/globals.css`
  - Requires: Task 1
  - Validates: REQ 1.5

- [ ] Task 3: Set up Supabase project and database schema
  - Description: Create Supabase project (production + staging). Run all SQL migrations to create tables: `content_pages`, `media_assets`, `analytics_events`, `blocked_jurisdictions`, `platform_config`. Enable RLS on every table. Apply all RLS policies as defined in the design document. Create indexes on `analytics_events`. Seed `blocked_jurisdictions` with initial list and `platform_config` with required keys.
  - Files: `supabase/migrations/001_initial_schema.sql`, `supabase/migrations/002_rls_policies.sql`, `supabase/migrations/003_indexes.sql`, `supabase/seed.sql`
  - Requires: Task 1
  - Validates: REQ 4.4, REQ 5.1, REQ 7.1

- [ ] Task 4: Configure Supabase client utilities (server + client)
  - Description: Install `@supabase/ssr` and `@supabase/supabase-js`. Create server-side Supabase client factory (uses `SUPABASE_SERVICE_ROLE_KEY`, never exposed to client). Create browser-side Supabase client (uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` with RLS). Create middleware helper for session refresh. Ensure service role key is never in any `NEXT_PUBLIC_*` variable.
  - Files: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/middleware.ts`
  - Requires: Task 3
  - Validates: REQ 5.1, REQ 5.2

- [ ] Task 5: Configure Vercel KV (Redis) client
  - Description: Install `@vercel/kv`. Create a typed KV client wrapper with helper functions for all defined key patterns: `geo:blocked_countries` (TTL 5 min), `config:platform` (TTL 5 min), `sitemap:last_updated` (TTL 60s), `analytics:summary:daily` (TTL 1 hr). Include get/set/invalidate helpers with proper TTL enforcement.
  - Files: `src/lib/kv.ts`
  - Requires: Task 1
  - Validates: REQ 4.4, REQ 5.7, REQ 6.5

- [ ] Task 6: Set up GitHub repository branch structure and Vercel CI/CD
  - Description: Configure GitHub repository with `main`, `staging`, and `develop` branches. Set branch protection on `main` (require PR review + passing CI). Connect Vercel project: `main` → production, `staging` → staging preview, `develop` → preview deployments. Configure environment variables in Vercel dashboard for production and staging scopes. Document the deployment flow in `CONTRIBUTING.md`.
  - Files: `.github/branch-protection.md`, `CONTRIBUTING.md`, `.github/workflows/ci.yml` (placeholder)
  - Requires: Task 1
  - Validates: REQ 6.5, REQ 6.6

- [ ] Task 7: Configure Next.js Edge Middleware (geo + compliance routing)
  - Description: Implement `middleware.ts` at the project root. Read `request.geo.country` (Vercel built-in). Fetch blocked countries from Vercel KV (fall back to Supabase DB if KV miss). If country is blocked or geo is unresolvable, set `geo_blocked=1` cookie and continue. Check `age_verified` session cookie; if absent, set `needs_age_gate=1` cookie and continue. Apply middleware only to public page routes (exclude `/api`, `/admin`, `/_next`, static files).
  - Files: `middleware.ts`, `src/lib/geo.ts`
  - Requires: Task 4, Task 5
  - Validates: REQ 4.4, REQ 4.8, REQ 4.9

- [ ] Task 8: Define TypeScript domain types
  - Description: Create the full set of TypeScript interfaces and types as specified in the design document: `ContentPage`, `PlatformConfig`, `SEOScoreResult`, `SEOSuggestion`, `AdminSession`, `AnalyticsEvent`, `EventName`, `WhatsAppCTAProps`, `AgeGateProps`, `GeoBlockerProps`, `SEOHeadProps`, `ContentPageProps`, SWR hook return types. Export from a central `src/types/index.ts`.
  - Files: `src/types/index.ts`, `src/types/analytics.ts`, `src/types/content.ts`, `src/types/admin.ts`
  - Requires: Task 1
  - Validates: REQ 2.2, REQ 7.2


---

## Phase 2: Design System & Shared Components

- [ ] Task 9: Build RootLayout with StickyNav and Footer shell
  - Description: Implement `src/app/layout.tsx` as the RootLayout. Include `<html lang="en">`, font preloads (Inter + Noto Sans Devanagari with `font-display: swap`), critical CSS inline, and `<link rel="preload" as="font">` tags. Render `StickyNav` (sticky, z-50), a `{children}` slot, and `Footer`. Wire up `ComplianceOrchestrator` and `StickyWhatsAppCTA` and `AnalyticsTracker` placeholders. Ensure no horizontal overflow at 320px viewport.
  - Files: `src/app/layout.tsx`, `src/components/layout/StickyNav.tsx`, `src/components/layout/Footer.tsx`
  - Requires: Task 2, Task 8
  - Validates: REQ 1.1, REQ 1.3, REQ 6.8

- [ ] Task 10: Implement StickyNav component
  - Description: Build `StickyNav` with Logo, NavLinks (homepage + top content pages), and `NavWhatsAppCTA` (icon-only on mobile, text+icon on desktop). Apply sticky positioning (CSS `position: sticky; top: 0; z-index: 50`). Ensure nav does not obscure above-fold CTA. Add visible focus states and ARIA roles for accessibility. Implement mobile hamburger menu with smooth open/close transition.
  - Files: `src/components/layout/StickyNav.tsx`, `src/components/layout/NavWhatsAppCTA.tsx`
  - Requires: Task 9
  - Validates: REQ 1.3, REQ 1.4

- [ ] Task 11: Implement Footer with ResponsibleGamingModule
  - Description: Build `Footer` component with `FooterLinks`, `FooterLegal`, and `ResponsibleGamingModule`. The `ResponsibleGamingModule` must include: `PlayResponsiblyBadge` (never hidden, never overlapped), `HelplineNumber`, `SelfExclusionLink` (links to `/responsible-gaming`), `AgeDisclaimer` ("This platform is for users 18 years and older."), and a hyperlink to `/responsible-gaming`. Ensure the badge is visible when footer is scrolled into view.
  - Files: `src/components/layout/Footer.tsx`, `src/components/compliance/ResponsibleGamingModule.tsx`
  - Requires: Task 9
  - Validates: REQ 4.5, REQ 4.6

- [ ] Task 12: Build WhatsAppCTA component (all positions)
  - Description: Implement `WhatsAppCTA` component supporting three positions: `hero`, `sticky-footer`, `inline`. Build `buildWhatsAppUrl(phone, sourceUrl, deviceType)` utility in `src/lib/whatsapp.ts` — uses `https://wa.me/` for mobile, `https://web.whatsapp.com/send` for desktop, pre-fills message "Hi, I want to get my Gaming ID — {sourceUrl}". Implement fallback contact block when phone config is absent or URL is invalid. Display activation label (≤60 chars) alongside every CTA. Apply `wa-pulse` CSS animation to sticky variant.
  - Files: `src/components/cta/WhatsAppCTA.tsx`, `src/components/cta/FallbackContactBlock.tsx`, `src/lib/whatsapp.ts`
  - Requires: Task 2, Task 8
  - Validates: REQ 2.1, REQ 2.4, REQ 2.5, REQ 2.6, REQ 2.7

- [ ] Task 13: Build StickyWhatsAppCTA (fixed bottom-right)
  - Description: Implement the persistent sticky CTA as a fixed-position element (bottom-right, z-40). Uses `WhatsAppCTA` with `position="sticky-footer"`. Reads `sourcePageUrl` from current pathname. Applies `wa-pulse` keyframe animation. Must be visible above the fold at 360×640px without scrolling and not obscured by any other element. Reads phone number from `PlatformConfig` via server component or SWR.
  - Files: `src/components/cta/StickyWhatsAppCTA.tsx`
  - Requires: Task 12
  - Validates: REQ 1.3, REQ 2.1, REQ 2.3

- [ ] Task 14: Build SEOHead component
  - Description: Implement `SEOHead` component that renders into `<head>` via Next.js `metadata` API or direct `<head>` injection. Outputs: `<title>` (10–60 chars), `<meta name="description">` (50–160 chars), `<link rel="canonical">`, hreflang alternate links (when `hiVariantId` present), `<link rel="preload" as="image">` for LCP image, and JSON-LD `<script type="application/ld+json">` blocks. Validates all constraints at render time (throws in dev, logs in prod if violated).
  - Files: `src/components/seo/SEOHead.tsx`, `src/lib/seo-head.ts`
  - Requires: Task 8
  - Validates: REQ 3.3, REQ 3.4, REQ 3.5, REQ 3.8, REQ 6.7

- [ ] Task 15: Build structured data generators
  - Description: Implement `src/lib/structured-data.ts` with functions: `generateWebPageSchema(page)`, `generateOrganizationSchema()`, `generateFAQSchema(faqItems)`. The generator always includes `WebPage` + `Organization`; adds `FAQPage` if and only if `hasFaq = true` and FAQ items exist. All objects must include non-empty `@context` and be valid JSON. Export `generateStructuredData(page, faqItems?)` as the main entry point.
  - Files: `src/lib/structured-data.ts`
  - Requires: Task 8
  - Validates: REQ 3.3, REQ 3.4

- [ ] Task 16: Implement interactive micro-animations and CSS keyframes
  - Description: Add all animation definitions to `globals.css`: `wa-pulse` keyframe (box-shadow pulse, 2s infinite), `cricket-float` keyframe (translateY parallax, 4s infinite). Add `.interactive` utility class (hover scale 1.02, active scale 0.98, GPU-promoted via `translateZ(0)`, transition 200ms). Install Framer Motion and configure it for selective use (compliance modals only). Add `will-change` hints only where specified.
  - Files: `src/app/globals.css`, `package.json`
  - Requires: Task 2
  - Validates: REQ 1.4, REQ 1.5

- [ ] Task 17: Build platform config loader utility
  - Description: Implement `src/lib/config.ts` with `getPlatformConfig(): Promise<PlatformConfig>`. Checks Vercel KV (`config:platform`, TTL 5 min) first; on miss, queries Supabase `platform_config` table, maps rows to `PlatformConfig` object, writes to KV, returns result. Implement `invalidatePlatformConfigCache()` for use after admin config updates. All calls use server-side Supabase client.
  - Files: `src/lib/config.ts`
  - Requires: Task 4, Task 5, Task 8
  - Validates: REQ 2.7, REQ 4.3


---

## Phase 3: Compliance Layer

- [ ] Task 18: Implement GeoBlocker modal component
  - Description: Build `GeoBlocker` full-screen modal using Framer Motion enter/exit transitions. Displays a notice that the service is unavailable in the visitor's region. Reads `countryCode` from cookie set by middleware. Prevents all interaction with page content behind the modal (focus trap, `aria-modal`, `inert` on background). No close/dismiss button — visitor cannot bypass. Styled with design tokens.
  - Files: `src/components/compliance/GeoBlocker.tsx`
  - Requires: Task 7, Task 16
  - Validates: REQ 4.4, REQ 4.9

- [ ] Task 19: Implement AgeGate modal component
  - Description: Build `AgeGate` full-screen modal using Framer Motion enter/exit transitions. Displays age confirmation prompt (18+). On confirm: sets `age_verified` session cookie via `document.cookie` (or API route for HttpOnly), dismisses modal, fires `age_gate_confirmed` analytics event. On decline: fires `age_gate_declined` event, redirects to `exitUrl` from `PlatformConfig`. Implements focus trap and `aria-modal`. Must not display if visitor is geo-blocked (orchestrator handles ordering).
  - Files: `src/components/compliance/AgeGate.tsx`
  - Requires: Task 7, Task 16, Task 17
  - Validates: REQ 4.1, REQ 4.2, REQ 4.3, REQ 4.8

- [ ] Task 20: Implement ComplianceOrchestrator component
  - Description: Build `ComplianceOrchestrator` client component that reads `geo_blocked` and `needs_age_gate` cookies on mount. Implements the decision logic: if `geo_blocked=1` → render `GeoBlocker`; else if `needs_age_gate=1` → render `AgeGate`; else → render nothing. Geo-block check always takes precedence over age gate. Handles cookie-unavailable scenario by re-running checks on every render.
  - Files: `src/components/compliance/ComplianceOrchestrator.tsx`, `src/lib/compliance.ts`
  - Requires: Task 18, Task 19
  - Validates: REQ 4.1, REQ 4.4, REQ 4.8, REQ 4.9

- [ ] Task 21: Build Responsible Gaming page (`/responsible-gaming`)
  - Description: Create `src/app/responsible-gaming/page.tsx` as a static SSG page. Content must include: self-exclusion instructions (step-by-step), deposit limit guidance, helpline contact details (phone + link), and the "18+" disclaimer. Include `SEOHead` with appropriate title/description/canonical. Link from footer `ResponsibleGamingModule`. Return HTTP 200 with full server-rendered HTML.
  - Files: `src/app/responsible-gaming/page.tsx`
  - Requires: Task 14, Task 11
  - Validates: REQ 4.5, REQ 4.6, REQ 4.7

- [ ] Task 22: Implement geo-block decision logic utility
  - Description: Implement `src/lib/geo.ts` with `isGeoBlocked(countryCode: string | null | undefined, blockedList: string[]): boolean`. Returns `true` if `countryCode` is in `blockedList` (case-insensitive). Returns `true` (fail-safe deny) for null, undefined, or empty-string input. Returns `false` only when a valid, non-blocked country code is provided. Used by both middleware and the GeoBlocker component.
  - Files: `src/lib/geo.ts`
  - Requires: Task 8
  - Validates: REQ 4.4

- [ ] Task 23: Write property-based test — P10: Geo-block decision logic
  - Description: Using fast-check, write property test for `isGeoBlocked`. Generators: `fc.string({minLength:2, maxLength:2})` for country code, `fc.array(fc.string({minLength:2, maxLength:2}))` for blocked list. Properties: (a) blocked if country in list (case-insensitive), (b) fail-safe deny for null/undefined/empty string. Run with `numRuns: 1000`. Tag: `// Feature: reddyexch-platform-revamp, Property 10`.
  - Files: `src/__tests__/properties/p10-geo-block.test.ts`
  - Requires: Task 22
  - Validates: REQ 4.4

- [ ] Task 24: Write property-based test — P11: Compliance orchestration ordering
  - Description: Using fast-check, write property test for `ComplianceOrchestrator` decision logic in `src/lib/compliance.ts`. Generators: `fc.boolean()` for `geoBlocked`, `fc.boolean()` for `ageVerified`. Properties: (a) returns `GeoBlocker` when `geoBlocked=true` regardless of `ageVerified`, (b) returns `AgeGate` when `geoBlocked=false` and `ageVerified=false`, (c) returns `null` when `geoBlocked=false` and `ageVerified=true`. Run with `numRuns: 100`. Tag: `// Feature: reddyexch-platform-revamp, Property 11`.
  - Files: `src/__tests__/properties/p11-compliance-orchestration.test.ts`
  - Requires: Task 20
  - Validates: REQ 4.9


---

## Phase 4: Public Pages

- [ ] Task 25: Build HomePage (`/`)
  - Description: Implement `src/app/page.tsx` as an ISR page (`revalidate = 60`). Compose sections: `HeroSection` (headline, subheadline, `HeroWhatsAppCTA`, `ActivationTimeBadge`, `CricketParallaxBackground` with `cricket-float` animation), `PartnersSection` (trust badges), `HowItWorksSection`, `WhyReddyExchSection`, `OffersSection`, `LiveScoresSection` (Supabase Realtime subscription), `InstagramFeedSection`. Include `SEOHead` with homepage metadata and JSON-LD. LCP image must be preloaded.
  - Files: `src/app/page.tsx`, `src/components/home/HeroSection.tsx`, `src/components/home/PartnersSection.tsx`, `src/components/home/HowItWorksSection.tsx`, `src/components/home/WhyReddyExchSection.tsx`, `src/components/home/OffersSection.tsx`, `src/components/home/LiveScoresSection.tsx`, `src/components/home/InstagramFeedSection.tsx`
  - Requires: Task 9, Task 12, Task 14, Task 15
  - Validates: REQ 1.1, REQ 1.2, REQ 1.3, REQ 2.1, REQ 3.7

- [ ] Task 26: Build dynamic ContentPage (`/[slug]`)
  - Description: Implement `src/app/[slug]/page.tsx` with ISR (`revalidate = 60`). `generateStaticParams` pre-renders all published pages at build time. Fetch page data from Supabase by slug (server component, service role). Render: `ContentHero`, `ContentBody` (sanitized `body_html` via `dangerouslySetInnerHTML` after server-side sanitization), conditional `FAQSection` (if `hasFaq = true`), `InlineWhatsAppCTA`. Include `SEOHead` with page-specific metadata, canonical, hreflang (if `hi_variant_id` set), and JSON-LD. Return HTTP 200 with full SSR/SSG HTML.
  - Files: `src/app/[slug]/page.tsx`, `src/components/content/ContentHero.tsx`, `src/components/content/ContentBody.tsx`, `src/components/content/FAQSection.tsx`, `src/components/content/InlineWhatsAppCTA.tsx`
  - Requires: Task 14, Task 15, Task 12, Task 4
  - Validates: REQ 3.3, REQ 3.4, REQ 3.5, REQ 3.6, REQ 3.7, REQ 3.8

- [ ] Task 27: Build custom 404 page
  - Description: Implement `src/app/not-found.tsx`. Returns HTTP 404. Renders a custom page with navigation links to the homepage and the 5 content pages with the highest published `word_count` (fetched server-side from Supabase). Implement `getTopPagesByWordCount(n: number)` in `src/lib/content-utils.ts`. Include `SEOHead` with `noindex` directive.
  - Files: `src/app/not-found.tsx`, `src/lib/content-utils.ts`
  - Requires: Task 4, Task 14
  - Validates: REQ 3.9

- [ ] Task 28: Build static 500 error page
  - Description: Implement `src/app/error.tsx` (Next.js error boundary) and a static fallback `src/app/global-error.tsx`. The 500 page must have no database dependency — render static HTML only with a link to the homepage. Include appropriate HTTP 500 status.
  - Files: `src/app/error.tsx`, `src/app/global-error.tsx`
  - Requires: Task 9
  - Validates: REQ 3.9 (error handling)

- [ ] Task 29: Implement LiveScoresSection with Supabase Realtime
  - Description: Build `LiveScoresSection` as a client component that subscribes to Supabase Realtime for live score updates. Use `useEffect` to set up the subscription on mount and clean up on unmount. Display a loading skeleton while initial data loads. Ensure the Realtime subscription does not block initial page render or contribute to LCP/CLS.
  - Files: `src/components/home/LiveScoresSection.tsx`
  - Requires: Task 4, Task 25
  - Validates: REQ 1.2, REQ 7.6

- [ ] Task 30: Seed 10+ keyword-optimized content pages
  - Description: Create a seed script or admin-inserted dataset of at least 10 published `ContentPage` records, each targeting a distinct keyword from the primary set: "online cricket id", "whatsapp cricket id", "cricket betting id", "online gaming id india", and 6+ long-tail variants. Each page must have: target keyword in `title`, `h1`, and `meta_desc`; unique `title` and `meta_desc`; `word_count ≥ 600`; `status = 'published'`; `seo_score ≥ 70`. Include at least 2 pages with `hasFaq = true`.
  - Files: `supabase/seed_content_pages.sql`, `scripts/seed-content.ts`
  - Requires: Task 3, Task 26
  - Validates: REQ 3.5, REQ 3.6

- [ ] Task 31: Write property-based test — P9: Top-N pages by word count
  - Description: Using fast-check, write property test for `getTopPagesByWordCount(pages, n)` in `src/lib/content-utils.ts`. Generators: `fc.array(fc.record({wordCount: fc.nat(), ...}))`, `fc.nat({max: 20})` for N. Properties: (a) returns exactly `min(N, total)` pages, (b) sorted descending by `wordCount`, (c) no page outside top-N by word count is included. Run with `numRuns: 100`. Tag: `// Feature: reddyexch-platform-revamp, Property 9`.
  - Files: `src/__tests__/properties/p09-top-n-pages.test.ts`
  - Requires: Task 27
  - Validates: REQ 3.9


---

## Phase 5: SEO Infrastructure

- [ ] Task 32: Implement dynamic XML sitemap (`/sitemap.xml`)
  - Description: Implement `src/app/sitemap.ts` using Next.js's built-in sitemap support (or `src/app/sitemap.xml/route.ts` for full control). ISR with `revalidate = 60`. Fetches all published, indexable content pages from Supabase. Generates Sitemap Protocol 0.9-compliant XML with `<loc>`, `<lastmod>` (ISO 8601), and `<changefreq>` (from allowed set). Excludes `/admin`, `/api` paths. Updates `sitemap:last_updated` in Vercel KV after generation.
  - Files: `src/app/sitemap.ts`, `src/lib/sitemap.ts`
  - Requires: Task 4, Task 5
  - Validates: REQ 3.1

- [ ] Task 33: Implement static robots.txt (`/robots.txt`)
  - Description: Create `src/app/robots.ts` (Next.js robots metadata) or `public/robots.txt`. Must contain: `Allow: /` for all public content page paths, `Disallow: /admin`, `Disallow: /api`, and `Sitemap: https://reddyexchgaming.com/sitemap.xml`. Verify the file is served at `/robots.txt` with `Content-Type: text/plain`.
  - Files: `src/app/robots.ts`
  - Requires: Task 1
  - Validates: REQ 3.2

- [ ] Task 34: Implement SEO meta tag validation utility
  - Description: Implement `src/lib/seo-validation.ts` with: `validateTitleLength(title: string): boolean` (10–60 chars), `validateDescLength(desc: string): boolean` (50–160 chars), `validateKeywordPresence(keyword, title, h1, metaDesc): boolean` (case-insensitive substring check in all three fields). These are used by both the SEO Scorer and the publish guard in the admin API.
  - Files: `src/lib/seo-validation.ts`
  - Requires: Task 8
  - Validates: REQ 3.5, REQ 3.6

- [ ] Task 35: Write property-based test — P6: Meta tag length constraints and uniqueness
  - Description: Using fast-check, write property test for `validateTitleLength` and `validateDescLength`. Generators: `fc.string({minLength:0, maxLength:200})`. Properties: (a) accepts title 10–60 chars, rejects all others; (b) accepts description 50–160 chars, rejects all others. Run with `numRuns: 100`. Tag: `// Feature: reddyexch-platform-revamp, Property 6`.
  - Files: `src/__tests__/properties/p06-meta-tag-constraints.test.ts`
  - Requires: Task 34
  - Validates: REQ 3.5

- [ ] Task 36: Write property-based test — P7: Target keyword presence in required fields
  - Description: Using fast-check, write property test for `validateKeywordPresence`. Generators: `fc.record({title: fc.string(), h1: fc.string(), metaDesc: fc.string(), keyword: fc.string({minLength:1})})`. Properties: returns `true` iff keyword appears (case-insensitive) in all three fields; returns `false` if absent from any one field. Run with `numRuns: 100`. Tag: `// Feature: reddyexch-platform-revamp, Property 7`.
  - Files: `src/__tests__/properties/p07-keyword-presence.test.ts`
  - Requires: Task 34
  - Validates: REQ 3.6

- [ ] Task 37: Write property-based test — P4: Sitemap generation completeness and validity
  - Description: Using fast-check, write property test for `generateSitemap(pages)` in `src/lib/sitemap.ts`. Generators: `fc.array(fc.record({slug: fc.string(), publishedAt: fc.date(), ...}), {minLength:1})`. Properties: (a) every input page appears exactly once, (b) each `<lastmod>` parses as valid ISO 8601, (c) each `<changefreq>` is from the allowed set, (d) output validates against Sitemap Protocol 0.9 schema. Run with `numRuns: 100`. Tag: `// Feature: reddyexch-platform-revamp, Property 4`.
  - Files: `src/__tests__/properties/p04-sitemap-generation.test.ts`
  - Requires: Task 32
  - Validates: REQ 3.1

- [ ] Task 38: Write property-based test — P5: Structured data completeness
  - Description: Using fast-check, write property test for `generateStructuredData(page, faqItems?)`. Generators: `fc.record(contentPage)` with `hasFaq: fc.boolean()`, `fc.array(faqItem)`. Properties: (a) always contains `WebPage` and `Organization` types, (b) contains `FAQPage` iff `hasFaq=true` and faqItems non-empty, (c) every object is valid JSON with non-empty `@context`. Run with `numRuns: 100`. Tag: `// Feature: reddyexch-platform-revamp, Property 5`.
  - Files: `src/__tests__/properties/p05-structured-data.test.ts`
  - Requires: Task 15
  - Validates: REQ 3.3, REQ 3.4

- [ ] Task 39: Write property-based test — P8: Hreflang tag generation
  - Description: Using fast-check, write property test for `generateHreflangTags(page)` in `src/lib/seo-head.ts`. Generators: `fc.option(fc.uuid())` for `hiVariantId`. Properties: (a) when `hiVariantId` is non-null, output contains both `hreflang="hi"` and `hreflang="en"` tags; (b) when `hiVariantId` is null, neither tag is present. Run with `numRuns: 100`. Tag: `// Feature: reddyexch-platform-revamp, Property 8`.
  - Files: `src/__tests__/properties/p08-hreflang-generation.test.ts`
  - Requires: Task 14
  - Validates: REQ 3.8

- [ ] Task 40: Implement GSC sitemap ping utility
  - Description: Implement `src/lib/gsc-ping.ts` with `pingSitemapToGSC(sitemapUrl: string): Promise<{success: boolean; error?: string}>`. Calls the Google Search Console Sitemap Ping API. Returns success/failure without throwing. Used by the publish API route — failure is non-blocking (returns warning, does not abort publication).
  - Files: `src/lib/gsc-ping.ts`
  - Requires: Task 1
  - Validates: REQ 5.7


---

## Phase 6: WhatsApp CTA System

- [ ] Task 41: Implement WhatsApp URL builder utility with full spec
  - Description: Finalize `src/lib/whatsapp.ts` with `buildWhatsAppUrl(phone: string, sourceUrl: string, deviceType: 'mobile' | 'desktop'): string | null`. Mobile → `https://wa.me/{phone}?text={encoded_message}`. Desktop → `https://web.whatsapp.com/send?phone={phone}&text={encoded_message}`. Message: `"Hi, I want to get my Gaming ID — {sourceUrl}"`. Validate constructed URL with `new URL(...)` — return `null` on failure. Implement `resolveCTATarget(config: PlatformConfig, sourceUrl: string, deviceType: string): {type: 'whatsapp' | 'fallback'; url?: string; fallback?: FallbackContact}`.
  - Files: `src/lib/whatsapp.ts`
  - Requires: Task 8, Task 12
  - Validates: REQ 2.1, REQ 2.4, REQ 2.5, REQ 2.7

- [ ] Task 42: Write property-based test — P1: WhatsApp URL construction correctness
  - Description: Using fast-check, write property test for `buildWhatsAppUrl`. Generators: `fc.webUrl()` for sourceUrl, `fc.constantFrom('mobile', 'desktop')` for deviceType, valid E.164 phone strings. Properties: (a) mobile → `https://wa.me/` scheme, (b) desktop → `https://web.whatsapp.com/send` scheme, (c) phone in correct position, (d) URL-encoded message contains literal sourceUrl. Run with `numRuns: 100`. Tag: `// Feature: reddyexch-platform-revamp, Property 1`.
  - Files: `src/__tests__/properties/p01-whatsapp-url-construction.test.ts`
  - Requires: Task 41
  - Validates: REQ 2.1, REQ 2.4, REQ 2.5

- [ ] Task 43: Write property-based test — P2: WhatsApp CTA fallback on invalid config
  - Description: Using fast-check, write property test for `resolveCTATarget`. Generators: `fc.option(fc.string())` for phone number (absent, empty, invalid). Properties: when phone is absent/empty/invalid URL, resolver returns `{type: 'fallback'}` containing configured alternate phone or email. Run with `numRuns: 100`. Tag: `// Feature: reddyexch-platform-revamp, Property 2`.
  - Files: `src/__tests__/properties/p02-whatsapp-cta-fallback.test.ts`
  - Requires: Task 41
  - Validates: REQ 2.7

- [ ] Task 44: Write property-based test — P3: WhatsApp CTA click event payload completeness
  - Description: Using fast-check, write property test for the `whatsapp_cta_click` event builder in `src/lib/analytics.ts`. Generators: `fc.webUrl()`, `fc.constantFrom('hero','sticky-footer','inline')`, `fc.string()` for sessionId, `fc.constantFrom('mobile','tablet','desktop')`. Properties: constructed event always contains all 5 required fields (`page_url`, `cta_position`, `session_id`, `device_type`, `timestamp`) with no field absent or null; `timestamp` is valid ISO 8601 UTC. Run with `numRuns: 100`. Tag: `// Feature: reddyexch-platform-revamp, Property 3`.
  - Files: `src/__tests__/properties/p03-cta-click-event-payload.test.ts`
  - Requires: Task 41
  - Validates: REQ 2.2, REQ 7.2

- [ ] Task 45: Implement device-type detection utility
  - Description: Implement `src/lib/device.ts` with `getDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop'`. Used by `WhatsAppCTA` to select the correct deep-link scheme and by the analytics event builder to populate `device_type`. Must work in both server (SSR, from request headers) and client (browser `navigator.userAgent`) contexts.
  - Files: `src/lib/device.ts`
  - Requires: Task 8
  - Validates: REQ 2.4, REQ 2.5, REQ 7.2

- [ ] Task 46: Implement activation label validation
  - Description: Add `validateActivationLabel(label: string): boolean` to `src/lib/whatsapp.ts` — returns `true` iff label is non-empty and ≤60 characters. Used by `WhatsAppCTA` component to validate the `activationLabel` prop at render time (dev warning if violated). Write unit test covering boundary values (60 chars = valid, 61 chars = invalid, empty = invalid).
  - Files: `src/lib/whatsapp.ts`, `src/__tests__/unit/activation-label.test.ts`
  - Requires: Task 41
  - Validates: REQ 2.6


---

## Phase 7: Analytics Tracker

- [ ] Task 47: Implement core analytics library
  - Description: Implement `src/lib/analytics.ts` with: `buildEvent(name: EventName, props: Partial<AnalyticsEvent>): AnalyticsEvent` (always populates `page_url`, `session_id`, `timestamp`), `buildCTAClickEvent(context)` (populates all 5 required fields), `buildFunnelCompletionEvent(sessionEvents)` (detects page_view → age_gate_confirmed → whatsapp_cta_click sequence, computes `time_to_convert`). Export `EventName` type and all builders.
  - Files: `src/lib/analytics.ts`
  - Requires: Task 8
  - Validates: REQ 7.1, REQ 7.2, REQ 7.5

- [ ] Task 48: Implement analytics offline queue
  - Description: Implement `src/lib/analytics-queue.ts` with `AnalyticsQueue` class. Uses `localStorage` as backing store (key: `reddyexch_analytics_queue`). Max size: 50 events. On enqueue when full: evict oldest event (FIFO). On `localStorage` unavailable: drop silently, never throw. Expose `enqueue(event)`, `dequeue(): AnalyticsEvent[]`, `size(): number`, `clear()`. Implement retry loop: attempt delivery every 30 seconds when online, stop when queue is empty.
  - Files: `src/lib/analytics-queue.ts`
  - Requires: Task 47
  - Validates: REQ 7.7

- [ ] Task 49: Implement analytics event dispatcher
  - Description: Implement `src/lib/analytics-dispatcher.ts` with `dispatch(event: AnalyticsEvent, config: PlatformConfig): Promise<void>`. Sends to internal endpoint (`POST /api/analytics/event`) and, if GA4 is enabled in config, also forwards via `gtag('event', ...)` or GA4 Measurement Protocol. If internal endpoint is unreachable, enqueues to `AnalyticsQueue`. If `localStorage` unavailable, drops silently. Never blocks rendering — all calls are fire-and-forget.
  - Files: `src/lib/analytics-dispatcher.ts`
  - Requires: Task 47, Task 48
  - Validates: REQ 7.4, REQ 7.6, REQ 7.7

- [ ] Task 50: Build AnalyticsTracker component
  - Description: Build `AnalyticsTracker` as a client component with no DOM output. Initializes via `requestIdleCallback` (fallback: `setTimeout(fn, 0)`) to avoid blocking rendering. On mount: fires `page_view` event. Sets up scroll depth listeners (25%, 50%, 75%, 100% thresholds using `IntersectionObserver` or scroll event with throttle). Detects funnel completion and fires `conversion_complete`. Integrates GA4 `gtag.js` script loading (async, non-render-blocking). Starts offline queue retry loop.
  - Files: `src/components/analytics/AnalyticsTracker.tsx`
  - Requires: Task 47, Task 48, Task 49
  - Validates: REQ 7.1, REQ 7.5, REQ 7.6

- [ ] Task 51: Implement analytics API routes
  - Description: Implement `POST /api/analytics/event` and `POST /api/analytics/batch` (max 50 events). Both routes use `SUPABASE_SERVICE_ROLE_KEY` server-side to insert into `analytics_events` table (bypassing RLS). Validate event shape with Zod schema. Return 200 on success, 400 on validation failure, 500 on DB error. Batch route processes all events in a single Supabase `insert` call.
  - Files: `src/app/api/analytics/event/route.ts`, `src/app/api/analytics/batch/route.ts`
  - Requires: Task 4, Task 47
  - Validates: REQ 7.1, REQ 7.4

- [ ] Task 52: Write property-based test — P18: Funnel completion detection
  - Description: Using fast-check, write property test for funnel detection logic. Generators: `fc.array(fc.record(event))` with funnel events interleaved. Properties: (a) emits exactly one `conversion_complete` when sequence contains page_view → age_gate_confirmed → whatsapp_cta_click in order; (b) `funnel_path` equals `["page_view","age_gate_confirmed","whatsapp_cta_click"]`; (c) `time_to_convert` equals seconds between first page_view and whatsapp_cta_click; (d) no event emitted for incomplete sequences. Run with `numRuns: 100`. Tag: `// Feature: reddyexch-platform-revamp, Property 18`.
  - Files: `src/__tests__/properties/p18-funnel-detection.test.ts`
  - Requires: Task 47
  - Validates: REQ 7.5

- [ ] Task 53: Write property-based test — P19: Analytics offline queue FIFO eviction
  - Description: Using fast-check, write property test for `AnalyticsQueue`. Generators: `fc.array(fc.record(event), {minLength:51, maxLength:200})`. Properties: (a) queue size never exceeds 50, (b) when full and new event enqueued, earliest-timestamp event is evicted, (c) after N>50 enqueues, queue contains exactly the 50 most recently enqueued events, (d) events ordered oldest-to-newest. Run with `numRuns: 1000`. Tag: `// Feature: reddyexch-platform-revamp, Property 19`.
  - Files: `src/__tests__/properties/p19-queue-fifo-eviction.test.ts`
  - Requires: Task 48
  - Validates: REQ 7.7

- [ ] Task 54: Write property-based test — P20: Analytics event dispatch with GA4 fallback
  - Description: Using fast-check, write property test for `dispatch`. Generators: `fc.record(event)`, `fc.boolean()` for GA4 enabled. Properties: (a) always stores to internal endpoint regardless of GA4 config; (b) when GA4 enabled, also forwards to GA4; (c) when GA4 disabled, absence of GA4 forwarding does not prevent internal storage. Run with `numRuns: 100`. Tag: `// Feature: reddyexch-platform-revamp, Property 20`.
  - Files: `src/__tests__/properties/p20-event-dispatch-fallback.test.ts`
  - Requires: Task 49
  - Validates: REQ 7.1, REQ 7.4

- [ ] Task 55: Write property-based test — P17: Analytics CTR calculation correctness
  - Description: Using fast-check, write property test for CTR calculator in `src/lib/analytics-calc.ts`. Generators: `fc.nat()` for `ctaClicks`, `fc.nat({min:1})` for `pageViews`. Properties: (a) CTR = `ctaClicks / pageViews` (decimal in [0,1]); (b) ranking function returns pages in strictly non-increasing order of click count; (c) no page with higher click count than any included page is omitted from top-10. Run with `numRuns: 100`. Tag: `// Feature: reddyexch-platform-revamp, Property 17`.
  - Files: `src/__tests__/properties/p17-ctr-calculation.test.ts`, `src/lib/analytics-calc.ts`
  - Requires: Task 47
  - Validates: REQ 7.3


---

## Phase 8: Admin Dashboard

- [ ] Task 56: Implement admin authentication (login/logout API routes)
  - Description: Implement `POST /api/admin/auth/login` — accepts `{email, password}`, calls Supabase `signInWithPassword`, sets server-side session cookie via `@supabase/ssr`. Implement `POST /api/admin/auth/logout` — calls Supabase `signOut`, clears session cookie. Implement rate limiting: 5 attempts / 15 min per IP using Vercel KV counter. Validate inputs with Zod. JWT lifetime is 8 hours (configured in Supabase dashboard).
  - Files: `src/app/api/admin/auth/login/route.ts`, `src/app/api/admin/auth/logout/route.ts`, `src/lib/auth.ts`
  - Requires: Task 4, Task 5
  - Validates: REQ 5.1, REQ 5.2

- [ ] Task 57: Implement admin auth middleware guard
  - Description: Extend `middleware.ts` (or create a separate admin middleware) to protect all `/admin/**` routes. Check Supabase session cookie via `@supabase/ssr`. If session is absent or expired (`exp ≤ now`), redirect to `/admin/login`. If session is valid, refresh the session token and continue. Ensure unauthenticated requests to any `/api/admin/**` route return HTTP 401 (not redirect).
  - Files: `middleware.ts`, `src/lib/auth.ts`
  - Requires: Task 56
  - Validates: REQ 5.1, REQ 5.2

- [ ] Task 58: Build AdminLogin page (`/admin/login`)
  - Description: Implement `src/app/admin/login/page.tsx`. Renders a login form (email + password). On submit: calls `POST /api/admin/auth/login`. On success: redirects to `/admin`. On failure: displays error message. No public navigation links. Accessible form with proper labels and ARIA attributes.
  - Files: `src/app/admin/login/page.tsx`
  - Requires: Task 56
  - Validates: REQ 5.1

- [ ] Task 59: Build AdminLayout (auth-gated shell)
  - Description: Implement `src/app/admin/layout.tsx`. Verifies session server-side (redirect to `/admin/login` if invalid). Renders `AdminNav` with links to: content list, content calendar, analytics panel, config settings. Includes logout button. Uses SWR for client-side data fetching within admin pages.
  - Files: `src/app/admin/layout.tsx`, `src/components/admin/AdminNav.tsx`
  - Requires: Task 57
  - Validates: REQ 5.1, REQ 5.3

- [ ] Task 60: Implement content pages CRUD API routes
  - Description: Implement admin content API routes (all require auth session): `GET /api/admin/pages` (list all pages), `POST /api/admin/pages` (create), `GET /api/admin/pages/[id]` (get single), `PUT /api/admin/pages/[id]` (update), `POST /api/admin/pages/[id]/publish` (publish + sitemap update + GSC ping), `POST /api/admin/pages/[id]/unpublish` (unpublish). Validate all inputs with Zod. Publish route: check slug uniqueness, validate keyword presence, trigger ISR revalidation, update `sitemap:last_updated` KV, call GSC ping (non-blocking).
  - Files: `src/app/api/admin/pages/route.ts`, `src/app/api/admin/pages/[id]/route.ts`, `src/app/api/admin/pages/[id]/publish/route.ts`, `src/app/api/admin/pages/[id]/unpublish/route.ts`
  - Requires: Task 4, Task 57, Task 34, Task 40
  - Validates: REQ 5.3, REQ 5.7, REQ 5.9

- [ ] Task 61: Implement SEO Scorer service
  - Description: Implement `src/lib/seo-scorer.ts` with `scorePage(page: ContentPage): SEOScoreResult`. Evaluates 6 criteria: keyword density (1–3%), title length (≤60 chars), description length (≤160 chars), heading structure (H1 present + H2/H3 hierarchy valid), internal link count (≥2), content length (≥600 words). Returns total score 0–100 and `breakdown` with per-criterion pass/fail. When score < 70, `suggestions` array contains one entry per failing criterion with `criterion`, `currentValue`, `requiredValue`, `message`. Handles edge cases: empty body → score 0, empty keyword → skip density check.
  - Files: `src/lib/seo-scorer.ts`
  - Requires: Task 8, Task 34
  - Validates: REQ 5.4, REQ 5.5

- [ ] Task 62: Implement SEO Scorer API route
  - Description: Implement `POST /api/admin/pages/score` (auth required). Accepts draft content page fields, runs `scorePage()`, returns `SEOScoreResult`. Used by the admin editor for real-time scoring on save/preview. Returns 400 if required fields are missing.
  - Files: `src/app/api/admin/pages/score/route.ts`
  - Requires: Task 57, Task 61
  - Validates: REQ 5.4, REQ 5.5

- [ ] Task 63: Build ContentEditor component with SEO panel
  - Description: Build `ContentEditor` admin component with: `RichTextEditor` (rich text input for `body_raw`), `SEOPanel` (displays `SEOScoreGauge` 0–100 and `SEOSuggestionList` when score < 70), `ImageUploader` (drag-and-drop, calls upload API), `SlugInput` (with uniqueness validation feedback). On save/preview: calls `POST /api/admin/pages/score` and updates SEO panel. Displays actionable suggestions per failing criterion (criterion name + current vs required value).
  - Files: `src/components/admin/ContentEditor.tsx`, `src/components/admin/SEOPanel.tsx`, `src/components/admin/SEOScoreGauge.tsx`, `src/components/admin/SEOSuggestionList.tsx`, `src/components/admin/ImageUploader.tsx`, `src/components/admin/SlugInput.tsx`
  - Requires: Task 61, Task 62
  - Validates: REQ 5.3, REQ 5.4, REQ 5.5

- [ ] Task 64: Build ContentCalendar component
  - Description: Build `ContentCalendar` admin component. Fetches all content pages via `GET /api/admin/pages` (SWR). Filters to rolling 90-day window: pages with `scheduled_at` or `published_at` in `[T − 90 days, T + 90 days)`. Displays each page with its scheduled/published date and status badge (draft, scheduled, published, unpublished). Pages with null dates are excluded. Implement `filterCalendarPages(pages, referenceDate)` in `src/lib/calendar.ts`.
  - Files: `src/components/admin/ContentCalendar.tsx`, `src/lib/calendar.ts`
  - Requires: Task 59, Task 60
  - Validates: REQ 5.6

- [ ] Task 65: Implement image upload pipeline API route
  - Description: Implement `POST /api/admin/media/upload` (auth required, multipart form). Validates: MIME type via magic bytes (not just extension), file size ≤10 MB (return 413 if exceeded). Processes with Sharp: convert to WebP, target ≤500 KB (retry with q=60, then q=40 if needed; return error if still >500 KB). Upload WebP to Supabase Storage `media` bucket and original to `media-originals` bucket. Insert `media_assets` DB row. Return `{webpUrl, fileSize, width, height}`.
  - Files: `src/app/api/admin/media/upload/route.ts`, `src/lib/image-pipeline.ts`
  - Requires: Task 4, Task 57
  - Validates: REQ 5.8

- [ ] Task 66: Implement platform config admin API routes
  - Description: Implement `GET /api/admin/config` (auth required) — returns `PlatformConfig` from Vercel KV (TTL 5 min) or Supabase DB. Implement `PUT /api/admin/config` (auth required) — validates with Zod, writes to Supabase `platform_config`, invalidates Vercel KV `config:platform` key. If KV invalidation fails, log error but complete the DB write (serve stale KV until TTL expires).
  - Files: `src/app/api/admin/config/route.ts`
  - Requires: Task 4, Task 5, Task 17, Task 57
  - Validates: REQ 5.3

- [ ] Task 67: Build AnalyticsPanel component (admin dashboard)
  - Description: Build `AnalyticsPanel` admin component with: `CTRChart` (daily + 7-day rolling WhatsApp CTA click counts), `TopPagesTable` (top 10 pages by `whatsapp_cta_click` count over selected period), `FunnelSummary` (CTR by page = clicks / views). Uses SWR to fetch from `GET /api/admin/analytics/summary` and `GET /api/admin/analytics/pages`. Implement both API routes (auth required, Vercel KV cache 1 hr for summary).
  - Files: `src/components/admin/AnalyticsPanel.tsx`, `src/components/admin/CTRChart.tsx`, `src/components/admin/TopPagesTable.tsx`, `src/components/admin/FunnelSummary.tsx`, `src/app/api/admin/analytics/summary/route.ts`, `src/app/api/admin/analytics/pages/route.ts`, `src/lib/analytics-calc.ts`
  - Requires: Task 51, Task 55, Task 59
  - Validates: REQ 7.3

- [ ] Task 68: Write property-based test — P12: Admin session token lifetime
  - Description: Using fast-check, write property test for session token expiry logic in `src/lib/auth.ts`. Generators: `fc.date()` for issuance time T. Properties: (a) session `exp` = T + 28800 seconds; (b) middleware rejects any token with `exp ≤ current time`. Run with `numRuns: 100`. Tag: `// Feature: reddyexch-platform-revamp, Property 12`.
  - Files: `src/__tests__/properties/p12-session-token-lifetime.test.ts`
  - Requires: Task 56
  - Validates: REQ 5.2

- [ ] Task 69: Write property-based test — P13: SEO Scorer correctness and suggestion generation
  - Description: Using fast-check, write property test for `scorePage`. Generators: `fc.record(contentPage)` with all fields varying (keyword density, title length, desc length, heading structure, link count, word count). Properties: (a) total score in [0,100]; (b–g) each criterion pass/fail matches spec thresholds exactly; (h) when score < 70, suggestions contains exactly one entry per failing criterion with non-empty `criterion`, `currentValue`, `requiredValue`. Run with `numRuns: 100`. Tag: `// Feature: reddyexch-platform-revamp, Property 13`.
  - Files: `src/__tests__/properties/p13-seo-scorer.test.ts`
  - Requires: Task 61
  - Validates: REQ 5.4, REQ 5.5

- [ ] Task 70: Write property-based test — P14: Content calendar 90-day window filter
  - Description: Using fast-check, write property test for `filterCalendarPages(pages, referenceDate)`. Generators: `fc.array(fc.record({scheduledAt: fc.option(fc.date()), publishedAt: fc.option(fc.date()), ...}))`, `fc.date()` for reference T. Properties: (a) returns exactly pages with `scheduled_at` or `published_at` in `[T−90d, T+90d)`; (b) excludes pages outside window; (c) pages with null dates excluded. Run with `numRuns: 100`. Tag: `// Feature: reddyexch-platform-revamp, Property 14`.
  - Files: `src/__tests__/properties/p14-calendar-filter.test.ts`
  - Requires: Task 64
  - Validates: REQ 5.6

- [ ] Task 71: Write property-based test — P15: Image conversion output constraint
  - Description: Using fast-check (with sample image fixtures), write property test for `convertToWebP(inputBuffer, mimeType)` in `src/lib/image-pipeline.ts`. Generators: sample JPEG/PNG/GIF/WebP buffers ≤10 MB. Properties: (a) output is valid WebP (magic bytes `52 49 46 46 ... 57 45 42 50`); (b) output file size ≤500 KB. Run with `numRuns: 100` (use small sample set for CI speed). Tag: `// Feature: reddyexch-platform-revamp, Property 15`.
  - Files: `src/__tests__/properties/p15-image-conversion.test.ts`
  - Requires: Task 65
  - Validates: REQ 5.8

- [ ] Task 72: Write property-based test — P16: Slug uniqueness validation
  - Description: Using fast-check, write property test for `validateSlugUniqueness(proposed, existingSlugs)` in `src/lib/slug-validation.ts`. Generators: `fc.string()` for proposed, `fc.array(fc.string())` for existing. Properties: (a) returns `false` if proposed matches any existing (case-insensitive, URL-normalized); (b) returns `true` if no match; (c) empty/whitespace-only slug always returns `false`. Run with `numRuns: 100`. Tag: `// Feature: reddyexch-platform-revamp, Property 16`.
  - Files: `src/__tests__/properties/p16-slug-uniqueness.test.ts`, `src/lib/slug-validation.ts`
  - Requires: Task 60
  - Validates: REQ 5.9


---

## Phase 9: Performance Optimization

- [ ] Task 73: Configure next/image pipeline and WebP delivery
  - Description: Configure `next/image` in `next.config.js` with Supabase Storage CDN domain. Ensure all `<Image>` components use `loading="lazy"` for below-fold images and `priority` (no lazy) for LCP candidates. Add `<picture>` element fallback to JPEG/PNG for non-WebP browsers. Audit all image usages across HomePage and ContentPage to confirm correct attributes. Install and configure Sharp for server-side image processing.
  - Files: `next.config.js`, `src/components/home/HeroSection.tsx`, `src/components/content/ContentHero.tsx`
  - Requires: Task 25, Task 26
  - Validates: REQ 6.2, REQ 6.7

- [ ] Task 74: Implement critical CSS inlining and async CSS loading
  - Description: Configure Next.js to inline critical CSS for the 360×800px (1x DPR) viewport on initial page load. Load remaining CSS asynchronously using `<link rel="preload" as="style">` with `onload` handler. Verify no render-blocking CSS remains for above-fold content. Use `critters` or Next.js built-in CSS optimization. Audit with Lighthouse to confirm no render-blocking resources.
  - Files: `next.config.js`, `src/app/layout.tsx`
  - Requires: Task 9
  - Validates: REQ 6.3

- [ ] Task 75: Configure static asset caching headers
  - Description: In `next.config.js`, add `Cache-Control: max-age=31536000, immutable` headers for all static assets (`/_next/static/**`, `/fonts/**`, `/images/**`). Verify Next.js content-hash-based filenames are used for all JS/CSS bundles (default behavior, confirm not overridden). Add cache-busting verification to CI smoke tests.
  - Files: `next.config.js`
  - Requires: Task 1
  - Validates: REQ 6.1

- [ ] Task 76: Configure route-based JS bundle splitting and size budget
  - Description: Install `@next/bundle-analyzer`. Configure `next.config.js` to enable bundle analysis. Audit initial JS bundle size per route — target ≤150KB gzip. Identify and eliminate unnecessary client-side imports in Server Components. Move heavy dependencies (Framer Motion, rich text editor) to dynamic imports with `next/dynamic`. Add bundle size check to CI pipeline.
  - Files: `next.config.js`, `package.json`, `.github/workflows/ci.yml`
  - Requires: Task 1, Task 6
  - Validates: REQ 6.4

- [ ] Task 77: Implement font preloading and font-display swap
  - Description: Add `<link rel="preload" as="font" crossOrigin="anonymous">` tags for Inter and Noto Sans Devanagari font files in `RootLayout`. Declare `font-display: swap` for both font faces in `globals.css`. Limit to ≤2 font families. Verify fonts are preloaded before first render using Lighthouse font audit.
  - Files: `src/app/layout.tsx`, `src/app/globals.css`
  - Requires: Task 9
  - Validates: REQ 6.8

- [ ] Task 78: Implement LCP image preload on all pages
  - Description: Identify the LCP candidate image on each page type (hero image on HomePage, content hero on ContentPage). Add `<link rel="preload" as="image" href="{lcpImageUrl}">` in `SEOHead` when `lcpImageUrl` prop is provided. Ensure `next/image` `priority` prop is set on LCP images. Verify LCP <2.5s with Lighthouse.
  - Files: `src/components/seo/SEOHead.tsx`, `src/app/page.tsx`, `src/app/[slug]/page.tsx`
  - Requires: Task 14, Task 73
  - Validates: REQ 6.7, REQ 6.9

- [ ] Task 79: Implement skeleton screens and progressive loading
  - Description: Add skeleton screen components for: `LiveScoresSection` (while Realtime data loads), `AnalyticsPanel` (while SWR fetches), `ContentCalendar` (while SWR fetches). Implement progressive image rendering using `next/image` `placeholder="blur"` with `blurDataURL`. Verify text content and at least one above-fold image render within 3 seconds on simulated 3G (1.6 Mbps, 300ms latency).
  - Files: `src/components/ui/Skeleton.tsx`, `src/components/home/LiveScoresSection.tsx`, `src/components/admin/AnalyticsPanel.tsx`
  - Requires: Task 29, Task 67
  - Validates: REQ 1.6

- [ ] Task 80: Audit and enforce total page weight budget
  - Description: Using Playwright network intercept, measure total uncompressed page weight for each ContentPage. Enforce: total ≤1500 KB, images ≤1000 KB. Optimize any images exceeding budget (re-compress via Sharp, reduce dimensions). Add page weight check to CI smoke tests. Document the measurement methodology in `PERFORMANCE.md`.
  - Files: `src/__tests__/smoke/page-weight.spec.ts`, `PERFORMANCE.md`
  - Requires: Task 73, Task 76
  - Validates: REQ 6.10

- [ ] Task 81: Configure Vercel Edge Network and India CDN PoP
  - Description: Verify Vercel project is configured for the Mumbai (India) region. Set `regions: ['bom1']` in `vercel.json` for ISR functions. Confirm static assets are served from Vercel's global CDN with India PoPs. Document CDN configuration and verify ≤50ms round-trip latency for Indian IPs using Vercel Analytics Real Experience Score.
  - Files: `vercel.json`
  - Requires: Task 6
  - Validates: REQ 6.5, REQ 6.6

- [ ] Task 82: Implement geo-check API route with KV caching
  - Description: Implement `GET /api/geo-check` — reads `request.geo.country` from Vercel headers, checks against blocked countries list (Vercel KV `geo:blocked_countries` first, fall back to Supabase DB on miss, write to KV on miss). Returns `{blocked: boolean, countryCode: string}`. Used by client-side compliance checks when middleware cookie is unavailable.
  - Files: `src/app/api/geo-check/route.ts`
  - Requires: Task 5, Task 22
  - Validates: REQ 4.4


---

## Phase 10: CI/CD & Smoke Tests

- [ ] Task 83: Set up GitHub Actions CI pipeline
  - Description: Create `.github/workflows/ci.yml`. On push to `main`, `staging`, `develop` and on PRs: run TypeScript type check (`tsc --noEmit`), ESLint, Prettier check, unit tests (`jest`), property-based tests (`jest` with fast-check), and build (`next build`). Fail the pipeline on any error. Cache `node_modules` and `.next/cache` for speed. Report test results as PR checks.
  - Files: `.github/workflows/ci.yml`
  - Requires: Task 6
  - Validates: REQ 1.2, REQ 6.4

- [ ] Task 84: Set up Lighthouse CI smoke test
  - Description: Install `@lhci/cli`. Create `.lighthouserc.json` with assertions: `performance ≥ 0.9`, `lcp ≤ 2500`, `cls ≤ 0.1`, `fid ≤ 100` (or `inp ≤ 200`). Run against deployed Vercel preview URL on every PR. Fail CI if any assertion fails. Configure to test mobile simulation profile. Add to `.github/workflows/ci.yml` as a post-deploy step.
  - Files: `.lighthouserc.json`, `.github/workflows/ci.yml`
  - Requires: Task 83
  - Validates: REQ 1.2, REQ 3.10, REQ 6.9

- [ ] Task 85: Set up Playwright smoke tests
  - Description: Install Playwright. Write smoke tests covering: (a) responsive layout at 320px, 768px, 1440px (no horizontal overflow), (b) WhatsApp CTA above-fold visibility at 360×640px, (c) Responsible Gaming Module visible in footer, (d) `/responsible-gaming` returns HTTP 200, (e) custom 404 page for non-existent URL, (f) admin login redirect for unauthenticated access to `/admin`. Run in CI on every deployment.
  - Files: `playwright.config.ts`, `src/__tests__/smoke/layout.spec.ts`, `src/__tests__/smoke/cta-visibility.spec.ts`, `src/__tests__/smoke/responsible-gaming.spec.ts`, `src/__tests__/smoke/auth-redirect.spec.ts`
  - Requires: Task 83, Task 11, Task 13, Task 21, Task 58
  - Validates: REQ 1.1, REQ 1.3, REQ 4.5, REQ 4.6, REQ 4.7, REQ 5.1

- [ ] Task 86: Implement bundle size CI check
  - Description: Add `@next/bundle-analyzer` to CI pipeline. After `next build`, parse bundle stats and assert: initial JS bundle ≤150KB gzip per route. Fail CI if any route exceeds budget. Output a bundle size report as a PR comment using `github-actions-bundle-diff` or similar. Add to `.github/workflows/ci.yml`.
  - Files: `.github/workflows/ci.yml`, `scripts/check-bundle-size.ts`
  - Requires: Task 76, Task 83
  - Validates: REQ 6.4

- [ ] Task 87: Implement robots.txt and sitemap.xml smoke tests
  - Description: Add Playwright/fetch-based smoke tests: (a) `GET /robots.txt` returns HTTP 200 with `Content-Type: text/plain`, contains `Allow: /`, `Disallow: /admin`, `Disallow: /api`, and `Sitemap:` directive; (b) `GET /sitemap.xml` returns HTTP 200 with `Content-Type: application/xml`, contains at least one `<url>` entry, all `<lastmod>` values parse as ISO 8601. Run in CI on every deployment.
  - Files: `src/__tests__/smoke/seo-files.spec.ts`
  - Requires: Task 32, Task 33, Task 83
  - Validates: REQ 3.1, REQ 3.2

- [ ] Task 88: Implement Cache-Control header smoke test
  - Description: Add Playwright/fetch-based smoke test: request a static asset (`/_next/static/...`) and assert `Cache-Control` header contains `max-age=31536000` and `immutable`. Run in CI on every deployment.
  - Files: `src/__tests__/smoke/cache-headers.spec.ts`
  - Requires: Task 75, Task 83
  - Validates: REQ 6.1

- [ ] Task 89: Implement Supabase RLS smoke test
  - Description: Write a smoke test using the Supabase anon key (client-side): (a) attempt to SELECT from `content_pages` where `status = 'draft'` — assert 0 rows returned (RLS blocks draft reads); (b) attempt to SELECT from `analytics_events` — assert error or 0 rows (RLS blocks all direct client access); (c) attempt to INSERT into `analytics_events` directly — assert error. Run in CI against staging Supabase project.
  - Files: `src/__tests__/smoke/rls.spec.ts`
  - Requires: Task 3, Task 83
  - Validates: REQ 5.1 (security)

- [ ] Task 90: Implement page weight smoke test
  - Description: Write Playwright smoke test that intercepts all network requests for a ContentPage with cache disabled. Assert: total uncompressed response size ≤1500 KB, image assets ≤1000 KB. Run in CI on every deployment against the Vercel preview URL.
  - Files: `src/__tests__/smoke/page-weight.spec.ts`
  - Requires: Task 80, Task 83
  - Validates: REQ 6.10

- [ ] Task 91: Write unit tests for compliance and auth flows
  - Description: Write example-based unit tests: (a) AgeGate confirm → `age_verified` cookie set, modal dismissed, `age_gate_confirmed` event fired; (b) AgeGate decline → redirect to `exitUrl`, `age_gate_declined` event fired; (c) admin auth middleware: unauthenticated request → 302 redirect to `/admin/login`; (d) admin API route: missing session → 401; (e) ResponsibleGamingModule: "Play Responsibly" badge present and not hidden.
  - Files: `src/__tests__/unit/age-gate.test.ts`, `src/__tests__/unit/admin-auth.test.ts`, `src/__tests__/unit/responsible-gaming.test.ts`
  - Requires: Task 19, Task 57, Task 11
  - Validates: REQ 4.1, REQ 4.2, REQ 4.3, REQ 4.5, REQ 5.1

- [ ] Task 92: Write integration tests for admin CRUD and image pipeline
  - Description: Write integration tests (against staging Supabase): (a) create → publish → unpublish content page lifecycle; (b) duplicate slug on publish → 409 error with conflicting slug identified; (c) image upload: JPEG ≤10 MB → WebP ≤500 KB returned; (d) image upload: file >10 MB → 413 error; (e) sitemap updates within 60s of page publication; (f) GA4 Measurement Protocol forwarding (mock GA4 endpoint).
  - Files: `src/__tests__/integration/content-crud.test.ts`, `src/__tests__/integration/image-upload.test.ts`, `src/__tests__/integration/sitemap-update.test.ts`
  - Requires: Task 60, Task 65, Task 32
  - Validates: REQ 5.3, REQ 5.7, REQ 5.8, REQ 5.9, REQ 7.4

- [ ] Task 93: Configure Jest and fast-check test runner
  - Description: Install and configure Jest with `ts-jest` for TypeScript support. Install `fast-check`. Configure `jest.config.ts` with: test environment (`jsdom` for component tests, `node` for lib tests), coverage thresholds (≥80% for `src/lib/**`), `numRuns: 100` default for fast-check (1000 for P10 and P19). Add `test` and `test:coverage` scripts to `package.json`. Ensure all property-based test files follow the tag comment format.
  - Files: `jest.config.ts`, `package.json`
  - Requires: Task 1
  - Validates: All property-based test tasks (Tasks 23, 24, 31, 35–39, 42–44, 52–55, 68–72)

- [ ] Task 94: Final Lighthouse audit and performance sign-off
  - Description: Run full Lighthouse CI audit against production deployment. Verify all targets: Mobile Score ≥90, LCP <2.5s, CLS <0.1, INP <200ms, TTFB ≤200ms (CDN HIT). Run against at least 3 ContentPages and the HomePage. Document results in `PERFORMANCE.md`. Fix any regressions before marking complete.
  - Files: `PERFORMANCE.md`
  - Requires: Task 73, Task 74, Task 75, Task 76, Task 77, Task 78, Task 84
  - Validates: REQ 1.2, REQ 3.10, REQ 6.5, REQ 6.9


---

## Phase 5b: Keyword Architecture & SEO Expansion

- [ ] Task 95: Create keyword_registry Supabase table and seed 30+ keywords
  - Description: Add migration `supabase/migrations/004_keyword_registry.sql` to create the `keyword_registry` table with all columns (keyword, slug, tier, pillar_slug, anchor_title, synonyms, page_id). Enable RLS: public SELECT, authenticated full access. Seed all 30+ target keywords across three tiers: Primary (online cricket id, whatsapp cricket id), Secondary (instant cricket id, cricket betting id, reddy anna book, diamond exch, fairplay id, lotus365 id, mahadev book + 5 more), Long-tail (how to get cricket id via whatsapp, best ipl betting id india + 8 more). Set `pillar_slug` for all cluster keywords. Add Vercel KV keys `keywords:registry` (TTL 10 min) and `keywords:pillar_map` (TTL 10 min) to the KV client wrapper.
  - Files: `supabase/migrations/004_keyword_registry.sql`, `supabase/seed_keywords.sql`, `src/lib/kv.ts`
  - Requires: Task 3, Task 5
  - Validates: REQ 3.2 (keyword tiers), REQ 3.3 (pillar-cluster)

- [ ] Task 96: Build Keyword Landing Page route (`/keyword/[slug]`)
  - Description: Implement `src/app/keyword/[slug]/page.tsx` with ISR (`revalidate = 60`). `generateStaticParams` pre-renders all published keyword landing pages at build time. Fetch page data from Supabase by slug (server component, service role). Render: `KeywordHero` (exact-match H1, above-fold WhatsApp CTA), `KeywordBody` (auto-linked `body_html`), conditional `FAQSection` (if `has_faq`), conditional `HowToSection` (if `has_howto`), `BreadcrumbNav` (Home → page H1), `RelatedKeywordsSection` (cluster links from pillar map), `InlineWhatsAppCTA`. Include `SEOHead` with all required structured data types (Organization, WebPage, Article, BreadcrumbList, FAQPage if applicable, HowTo if applicable), canonical, and hreflang tags for en-IN / hi-IN / hin-IN variants. Return HTTP 200 with full SSR HTML.
  - Files: `src/app/keyword/[slug]/page.tsx`, `src/components/keyword/KeywordHero.tsx`, `src/components/keyword/KeywordBody.tsx`, `src/components/keyword/BreadcrumbNav.tsx`, `src/components/keyword/RelatedKeywordsSection.tsx`, `src/components/keyword/HowToSection.tsx`
  - Requires: Task 14, Task 15, Task 12, Task 4, Task 95
  - Validates: REQ 3.1, REQ 3.7, REQ 3.8, REQ 3.9, REQ 3.10

- [ ] Task 97: Expand structured data generators for Article, BreadcrumbList, HowTo
  - Description: Extend `src/lib/structured-data.ts` with: `generateArticleSchema(page)` (for keyword landing pages and blog content pages), `generateBreadcrumbSchema(slug, h1)` (always 2 items: Home → current page, for all `/keyword/[slug]` URLs), `generateHowToSchema(howtoSteps)` (conditional on `has_howto = true` and non-empty steps). Update `generateStructuredData(page, options)` to include all applicable types based on `page_type`, `has_faq`, `has_howto`. All schemas must pass Google's Rich Results Test.
  - Files: `src/lib/structured-data.ts`
  - Requires: Task 15, Task 96
  - Validates: REQ 3.8, REQ 3.9, REQ 3.10

- [ ] Task 98: Implement Auto-Linker service
  - Description: Implement `src/lib/auto-linker.ts` with `autoLink(bodyRaw: string, registry: KeywordRegistryEntry[]): string`. Algorithm: sort registry by keyword length DESC (longest-first to avoid partial matches). For each keyword, find all text nodes not already inside `<a>` tags. Replace the FIRST unlinked occurrence per keyword per page with `<a href="/keyword/{slug}" title="{anchorTitle}">{original_text}</a>`. Never create duplicate links to the same target on the same page. Also match synonyms from `KeywordRegistryEntry.synonyms`. Return modified HTML. Expose `runAutoLinker(pageId)` API that fetches registry from Vercel KV, runs auto-linker on `body_raw`, saves result to `body_html`, updates `internal_links` count.
  - Files: `src/lib/auto-linker.ts`
  - Requires: Task 95, Task 8
  - Validates: REQ 3.4

- [ ] Task 99: Implement Anchor Text Suggester for admin editor
  - Description: Implement `src/lib/anchor-suggester.ts` with `getAnchorSuggestions(currentPageKeyword: string, registry: KeywordRegistryEntry[]): AnchorSuggestion[]`. Returns a list of related keyword pages (excluding the current page) with suggested anchor text phrases derived from each target page's primary keyword and synonyms. Sorted by tier (primary first, then secondary, then long-tail). Implement `GET /api/admin/keywords/[id]/anchor-suggestions` API route (auth required) that calls this function and returns the suggestions. Wire up `AnchorTextSuggester` component in `ContentEditor` to display suggestions as clickable chips that insert the anchor text into the rich text editor.
  - Files: `src/lib/anchor-suggester.ts`, `src/app/api/admin/keywords/[id]/anchor-suggestions/route.ts`, `src/components/admin/AnchorTextSuggester.tsx`
  - Requires: Task 95, Task 63
  - Validates: REQ 3.5

- [ ] Task 100: Implement hreflang for en-IN / hi-IN / hin-IN locale variants
  - Description: Update `src/lib/seo-head.ts` to support three locale variants: `en-IN`, `hi-IN`, `hin-IN`. Read `locale_variants` JSONB from `ContentPage`. Generate `<link rel="alternate" hreflang="en-IN">`, `<link rel="alternate" hreflang="hi-IN">`, `<link rel="alternate" hreflang="hin-IN">` tags for all variants that exist. Update `SEOHead` component to pass `localeVariants` prop. Update `generateHreflangTags` to handle the three-locale model. Add locale variant URL routes: `src/app/keyword/[slug]/hi/page.tsx` and `src/app/keyword/[slug]/hin/page.tsx` as ISR pages serving Hindi and Hinglish variants respectively.
  - Files: `src/lib/seo-head.ts`, `src/components/seo/SEOHead.tsx`, `src/app/keyword/[slug]/hi/page.tsx`, `src/app/keyword/[slug]/hin/page.tsx`
  - Requires: Task 14, Task 96
  - Validates: REQ 3.14

- [ ] Task 101: Implement canonical URL normalisation and 301 redirects
  - Description: In `middleware.ts`, add canonical URL normalisation for `/keyword/[slug]` routes: (a) uppercase slug → 301 redirect to lowercase; (b) trailing slash → 301 redirect without slash; (c) UTM/tracking query params → strip from canonical tag (do NOT redirect, just set canonical without params). Implement `normaliseKeywordSlug(slug: string): string` utility. Add unit tests for all three normalisation cases.
  - Files: `middleware.ts`, `src/lib/slug-utils.ts`, `src/__tests__/unit/slug-normalisation.test.ts`
  - Requires: Task 7, Task 96
  - Validates: REQ 3.17

- [ ] Task 102: Update SEO Scorer for expanded keyword content rules
  - Description: Update `src/lib/seo-scorer.ts` to enforce the expanded content rules for Keyword_Landing_Pages: (a) keyword in first 100 words (new criterion, fail if absent); (b) keyword density 1.5%–2.5% (tightened from 1–3%); (c) warn if density 2.5%–3% with message "Keyword density is X% — reduce below 3%"; (d) fail if density >3%; (e) meta title 50–60 chars for KLPs (tightened from 10–60); (f) meta description 150–160 chars for KLPs (tightened from 50–160); (g) exact-match keyword in H1 (not just presence, exact match); (h) structured data completeness check (all required schema types present). Update `SEOScoreResult` type to include `keywordInFirst100Words` and `structuredDataComplete` criteria. Update `SEOSuggestionList` to display the keyword density warning distinctly from a failure.
  - Files: `src/lib/seo-scorer.ts`, `src/types/index.ts`, `src/components/admin/SEOSuggestionList.tsx`, `src/components/admin/KeywordDensityMeter.tsx`
  - Requires: Task 61, Task 97
  - Validates: REQ 3.6, REQ 5.4

- [ ] Task 103: Seed 30+ Keyword Landing Pages with full content
  - Description: Create seed data for all 30+ Keyword_Landing_Pages. Each page must satisfy: `page_type = 'keyword_landing'`, target keyword in first 100 words, keyword density 1.5%–2.5%, exact-match H1, meta title 50–60 chars, meta description 150–160 chars, `word_count ≥ 600`, `seo_score ≥ 70`, `status = 'published'`. At least 5 pages must have `has_faq = true` with 3+ FAQ items. At least 3 pages must have `has_howto = true` with 3+ steps. Pillar pages must link to ≥5 cluster pages. Content must be in natural Hinglish/English/Hindi mix. Link each `keyword_registry` entry to its `content_pages` row via `page_id`.
  - Files: `supabase/seed_keyword_pages.sql`, `scripts/seed-keyword-pages.ts`
  - Requires: Task 95, Task 96, Task 98
  - Validates: REQ 3.2, REQ 3.3, REQ 3.6, REQ 3.7

- [ ] Task 104: Add keyword architecture smoke tests
  - Description: Add Playwright smoke tests for the keyword architecture: (a) `GET /keyword/online-cricket-id` returns HTTP 200 with full SSR HTML; (b) page H1 contains exact keyword "online cricket id"; (c) BreadcrumbList JSON-LD present and valid (2 items: Home → page H1); (d) `<link rel="canonical">` present with correct absolute URL; (e) hreflang tags present for en-IN; (f) `GET /keyword/Online-Cricket-ID` returns 301 to `/keyword/online-cricket-id`; (g) auto-linked body contains at least one `<a href="/keyword/...">` tag; (h) sitemap.xml includes all 30+ keyword landing page URLs. Run in CI on every deployment.
  - Files: `src/__tests__/smoke/keyword-pages.spec.ts`
  - Requires: Task 96, Task 97, Task 98, Task 101, Task 103
  - Validates: REQ 3.1, REQ 3.4, REQ 3.7, REQ 3.8, REQ 3.9, REQ 3.10, REQ 3.11, REQ 3.17

---

## Phase 8b: Admin Dashboard — Roles, SEO Tools, Rank Tracker, Widgets, Audit Log

- [ ] Task 105: Add new Supabase tables and migrations (seo_metrics, compliance_logs, conversion_logs, widget_configs)
  - Description: Create migration `supabase/migrations/005_admin_expansion.sql`. Add tables: `seo_metrics` (keyword_id, position, source, recorded_at), `compliance_logs` (append-only: user_id, action, resource_type, resource_id, before_state JSONB, after_state JSONB, timestamp), `conversion_logs` (session_id, page_url, cta_variant, device_type, funnel_path, time_to_convert), `widget_configs` (widget_type, config JSONB, is_active, updated_by, updated_at). Apply all RLS policies as specified in design: compliance_logs has NO UPDATE/DELETE policies. Add indexes. Update Vercel KV wrapper with widget cache keys (`widgets:crictime`, `widgets:instagram`, `widgets:whatsapp_ab`, `rank:latest`).
  - Files: `supabase/migrations/005_admin_expansion.sql`, `src/lib/kv.ts`
  - Requires: Task 3
  - Validates: REQ 5.5, REQ 5.26, REQ 5.28, REQ 5.32

- [ ] Task 106: Implement role-based access control (RBAC) middleware and helpers
  - Description: Extend `src/lib/auth.ts` with `getAdminRole(session): 'admin' | 'editor' | 'viewer'` — reads `raw_user_meta_data->>'role'` from Supabase JWT. Implement `requireRole(minRole: AdminRole)` middleware helper that returns HTTP 403 with `{error: "Access denied"}` if the authenticated user's role is below the required level. Role hierarchy: admin > editor > viewer. Apply `requireRole` to all admin API routes according to the permissions table in the design document. Update `AdminSession` type to include `role`.
  - Files: `src/lib/auth.ts`, `src/types/admin.ts`
  - Requires: Task 56, Task 57
  - Validates: REQ 5.3, REQ 5.4

- [ ] Task 107: Implement Audit Log service and compliance_logs writer
  - Description: Implement `src/lib/audit-log.ts` with `writeAuditLog(params: {userId, action, resourceType, resourceId, beforeState?, afterState?}): Promise<void>`. Uses `SUPABASE_SERVICE_ROLE_KEY` server-side to INSERT into `compliance_logs`. Never throws — log failures are caught and reported to console/Sentry without blocking the primary operation. Call `writeAuditLog` from all admin API routes that perform create, edit, publish, unpublish, delete, or config_change actions. Implement `GET /api/admin/audit-log` route (admin + viewer) with filters: `userId`, `action`, `resourceType`, `startDate`, `endDate`. Return paginated results (50 per page).
  - Files: `src/lib/audit-log.ts`, `src/app/api/admin/audit-log/route.ts`
  - Requires: Task 105, Task 106
  - Validates: REQ 5.5, REQ 5.30, REQ 5.31, REQ 5.32

- [ ] Task 108: Build AuditLog admin UI component
  - Description: Build `AuditLog` admin page at `src/app/admin/audit-log/page.tsx` (admin + viewer access). Renders `AuditLogTable` with columns: timestamp, user email, action badge, resource type, resource ID, and a "View diff" button. Implement `DiffViewer` modal that shows `before_state` vs `after_state` as a side-by-side JSON diff for edit actions. Add filter controls: user dropdown, action multi-select, resource type multi-select, date range picker. Use SWR for data fetching with pagination. Viewer role sees all entries but has no action buttons.
  - Files: `src/app/admin/audit-log/page.tsx`, `src/components/admin/AuditLogTable.tsx`, `src/components/admin/DiffViewer.tsx`
  - Requires: Task 107, Task 59
  - Validates: REQ 5.30, REQ 5.31

- [ ] Task 109: Implement Pre-Publish Checklist modal
  - Description: Implement `POST /api/admin/pages/prepublish` API route (admin + editor) that runs all Pre_Publish_Checklist checks: SEO score ≥70, keyword in first 100 words, exact-match H1, meta title within bounds, meta description within bounds, internal link count ≥2, no duplicate slug, structured data valid. Returns `PrePublishCheckResult` with per-check pass/fail, current value, and required value. Build `PrePublishChecklist` modal component that displays the checklist results. The "Publish" button in `ContentEditor` SHALL call this endpoint first; if any check fails, the modal is shown and publication is blocked until all checks pass.
  - Files: `src/app/api/admin/pages/prepublish/route.ts`, `src/components/admin/PrePublishChecklist.tsx`
  - Requires: Task 61, Task 62, Task 106
  - Validates: REQ 5.8

- [ ] Task 110: Implement draft/publish state machine with transition guards
  - Description: Update the publish/unpublish API routes to enforce the state machine: `draft` → `scheduled` → `published` → `unpublished`. Implement `validateStateTransition(currentStatus, targetStatus): boolean` in `src/lib/content-state-machine.ts`. Reject invalid transitions (e.g., published → draft directly) with HTTP 422 and a descriptive error message. Update `ContentEditor` to show only valid next-state actions based on current status. Write unit tests for all valid and invalid transitions.
  - Files: `src/lib/content-state-machine.ts`, `src/app/api/admin/pages/[id]/publish/route.ts`, `src/app/api/admin/pages/[id]/unpublish/route.ts`, `src/__tests__/unit/content-state-machine.test.ts`
  - Requires: Task 60, Task 109
  - Validates: REQ 5.7

- [ ] Task 111: Implement Keyword Density Analyzer with Hinglish Synonym Suggester
  - Description: Implement `src/lib/keyword-density.ts` with `analyzeKeywordDensity(bodyRaw: string, keyword: string): KeywordDensityAnalysis`. Calculates density = (keyword occurrences / total words) × 100. Status: green (1.5–2.5%), amber (2.5–3%), red (<1.5% or >3%). When density >2.5%, generate ≥3 Hinglish synonym suggestions from a configurable synonym map stored in `keyword_registry.synonyms`. Build `KeywordDensityAnalyzer` component that updates in real time as the editor content changes (debounced 500ms). Display colour-coded density percentage, word count, and synonym chips when density >2.5%.
  - Files: `src/lib/keyword-density.ts`, `src/components/admin/KeywordDensityAnalyzer.tsx`, `src/components/admin/HinglishSynonymSuggester.tsx`
  - Requires: Task 63, Task 95
  - Validates: REQ 5.15, REQ 5.16

- [ ] Task 112: Implement Schema Generator with inline validation
  - Description: Implement `src/lib/schema-generator.ts` with `generateSchemaPreview(page: Partial<ContentPage>): SchemaPreviewResult`. Generates JSON-LD previews for FAQPage (from `faq_items`), Article (from title, h1, meta_desc, published_at), and BreadcrumbList (from slug, h1). Validates each schema against schema.org rules: checks required fields, value types, and array lengths. Returns `{schemas: GeneratedSchema[], errors: SchemaValidationError[]}`. Build `SchemaGenerator` panel in `ContentEditor` with three tabs (FAQ, Article, Breadcrumb), a formatted JSON preview, and inline error highlighting (red border + tooltip on invalid properties). Validation runs on every save/preview.
  - Files: `src/lib/schema-generator.ts`, `src/components/admin/SchemaGenerator.tsx`, `src/components/admin/FAQSchemaPreview.tsx`, `src/components/admin/ArticleSchemaPreview.tsx`, `src/components/admin/BreadcrumbSchemaPreview.tsx`
  - Requires: Task 97, Task 63
  - Validates: REQ 5.17, REQ 5.18, REQ 5.19

- [ ] Task 113: Implement Internal Link Gap Analyzer
  - Description: Add `inbound_link_count` column to `keyword_registry` table (migration `006_inbound_link_count.sql`). Update the publish API route to recalculate `inbound_link_count` for all affected keywords after auto-linking runs. Implement `src/lib/link-gap-analyzer.ts` with `findLinkGaps(registry: KeywordRegistryEntry[]): InternalLinkGap[]` — returns all keywords with `inbound_link_count < 2`, each with a suggested source page (highest-traffic published page that mentions the keyword but doesn't link to it) and suggested anchor text. Implement `GET /api/admin/keywords/link-gaps` route (admin + editor). Build `InternalLinkGapAnalyzer` admin page with `GapList` and `LinkSuggestionRow` components. "Accept suggestion" button opens the source page in the editor with cursor at the anchor text position.
  - Files: `supabase/migrations/006_inbound_link_count.sql`, `src/lib/link-gap-analyzer.ts`, `src/app/api/admin/keywords/link-gaps/route.ts`, `src/app/admin/link-gaps/page.tsx`, `src/components/admin/InternalLinkGapAnalyzer.tsx`, `src/components/admin/GapList.tsx`, `src/components/admin/LinkSuggestionRow.tsx`
  - Requires: Task 98, Task 106
  - Validates: REQ 5.20, REQ 5.21, REQ 5.22

- [ ] Task 114: Implement Rank Tracker — data model and API routes
  - Description: Implement `GET /api/admin/rank-tracker` (admin + editor + viewer) — returns all keywords with their latest position from `seo_metrics`, previous position, and delta. Implement `POST /api/admin/rank-tracker` (admin + editor) — accepts `{keywordId, position, source: 'manual'}`, inserts into `seo_metrics`, updates `rank:latest` Vercel KV. Implement `POST /api/admin/rank-tracker/refresh` (admin only) — calls Ahrefs or SEMrush API (key from `platform_config`), fetches positions for all keywords, bulk-inserts into `seo_metrics`, updates KV. If API key is absent, return 422 with "No rank tracking API key configured — use manual input". Implement `GET /api/admin/seo-metrics/[keywordId]` — returns full position history for a keyword.
  - Files: `src/app/api/admin/rank-tracker/route.ts`, `src/app/api/admin/rank-tracker/refresh/route.ts`, `src/app/api/admin/seo-metrics/[keywordId]/route.ts`, `src/lib/rank-tracker.ts`
  - Requires: Task 105, Task 106
  - Validates: REQ 5.23, REQ 5.24, REQ 5.26

- [ ] Task 115: Build Rank Tracker admin UI
  - Description: Build `RankTracker` admin page at `src/app/admin/rank-tracker/page.tsx` (admin + editor + viewer). Renders `KeywordRankTable` with columns: keyword, tier, current position, previous position, delta indicator (↑ green / ↓ red when |delta| ≥ 3), source badge (API / Manual), last updated. Add "Refresh from API" button (admin only) and "Manual input" inline edit (admin + editor). Implement `RankHistoryChart` (line chart, last 30 days) shown in a slide-out panel when a keyword row is clicked. Use SWR for data fetching with 24hr revalidation.
  - Files: `src/app/admin/rank-tracker/page.tsx`, `src/components/admin/KeywordRankTable.tsx`, `src/components/admin/RankHistoryChart.tsx`
  - Requires: Task 114, Task 59
  - Validates: REQ 5.23, REQ 5.24, REQ 5.25, REQ 5.26

- [ ] Task 116: Implement Widget Configuration Panel — Crictime
  - Description: Implement `GET /api/admin/widgets` and `PUT /api/admin/widgets/[id]` API routes (admin only for PUT; admin + editor for GET). Build `CrictimeConfigForm` component: checkboxes for match types (IPL, T20I, ODI, Test), multi-select for teams and tournaments. On save: write to `widget_configs` table, invalidate `widgets:crictime` Vercel KV, write `compliance_logs` entry. The `LiveScoresSection` on the homepage reads Crictime config from Vercel KV (TTL 5 min) to apply filters to the embed.
  - Files: `src/app/admin/widgets/page.tsx`, `src/components/admin/WidgetConfigPanel.tsx`, `src/components/admin/CrictimeConfigForm.tsx`, `src/app/api/admin/widgets/route.ts`, `src/app/api/admin/widgets/[id]/route.ts`
  - Requires: Task 105, Task 106, Task 107
  - Validates: REQ 5.27, REQ 5.28

- [ ] Task 117: Implement Widget Configuration Panel — Instagram Feed
  - Description: Build `InstagramConfigForm` component: text inputs for hashtags (comma-separated) and account handles (comma-separated), number input for post count (1–12). On save: write to `widget_configs`, invalidate `widgets:instagram` KV, write `compliance_logs`. The `InstagramFeedSection` on the homepage reads Instagram config from Vercel KV (TTL 5 min) to filter the feed.
  - Files: `src/components/admin/InstagramConfigForm.tsx`
  - Requires: Task 116
  - Validates: REQ 5.27, REQ 5.28

- [ ] Task 118: Implement Widget Configuration Panel — WhatsApp A/B Test
  - Description: Build `WhatsAppABTestConfig` component: two variant forms (button text, activation label ≤60 chars, pre-filled message), a traffic split slider (0–100% to variant A), and a "Declare winner" button (sets `winner: 'A' | 'B'`, disables the test). On save: write to `widget_configs`, invalidate `widgets:whatsapp_ab` KV, write `compliance_logs`. Implement deterministic variant assignment in `StickyWhatsAppCTA`: hash `session_id` to a number 0–99; if < `splitPercentage`, serve variant A, else variant B. Record `cta_variant` in `conversion_logs` on every WhatsApp CTA click.
  - Files: `src/components/admin/WhatsAppABTestConfig.tsx`, `src/components/cta/StickyWhatsAppCTA.tsx`, `src/lib/ab-test.ts`
  - Requires: Task 116, Task 13
  - Validates: REQ 5.27, REQ 5.28, REQ 5.29

- [ ] Task 119: Update AdminNav with role-filtered menu and access denied handling
  - Description: Update `AdminNav` to show/hide menu items based on the authenticated user's role: `admin` sees all items; `editor` sees content, SEO tools, rank tracker, analytics (no widgets, no user management); `viewer` sees rank tracker, analytics, audit log (read-only). Implement `AccessDenied` component (HTTP 403 page) shown when a user navigates directly to a restricted route. Update all admin page components to check role and render `AccessDenied` if insufficient permissions.
  - Files: `src/components/admin/AdminNav.tsx`, `src/components/admin/AccessDenied.tsx`, `src/app/admin/widgets/page.tsx`, `src/app/admin/audit-log/page.tsx`
  - Requires: Task 106, Task 59
  - Validates: REQ 5.3, REQ 5.4

- [ ] Task 120: Write integration and unit tests for admin expansion
  - Description: Write tests covering: (a) role enforcement — editor cannot access `/admin/widgets` (403); viewer cannot POST to any write endpoint (403); (b) compliance_logs immutability — direct UPDATE/DELETE on `compliance_logs` via anon key returns error; (c) Pre_Publish_Checklist — page with SEO score <70 is blocked from publication; (d) state machine — published → draft transition returns 422; (e) A/B test determinism — same session_id always gets same variant; (f) keyword density analyzer — density >3% returns 'fail' status with ≥3 synonym suggestions; (g) rank tracker delta — position improvement of ≥3 shows green indicator; (h) audit log — every publish action creates a `compliance_logs` entry with correct before/after state.
  - Files: `src/__tests__/integration/admin-rbac.test.ts`, `src/__tests__/integration/compliance-logs.test.ts`, `src/__tests__/unit/pre-publish-checklist.test.ts`, `src/__tests__/unit/content-state-machine.test.ts`, `src/__tests__/unit/ab-test-determinism.test.ts`, `src/__tests__/unit/keyword-density.test.ts`, `src/__tests__/unit/rank-tracker-delta.test.ts`
  - Requires: Task 106, Task 107, Task 109, Task 110, Task 111, Task 114, Task 118
  - Validates: REQ 5.3, REQ 5.4, REQ 5.5, REQ 5.7, REQ 5.8, REQ 5.15, REQ 5.25, REQ 5.29, REQ 5.32

---

## Phase 3b: Compliance Layer — India Online Gaming Rules 2026 & Security Hardening

- [ ] Task 121: Update blocked_jurisdictions schema and seed IN-TG, IN-AP
  - Description: Create migration `supabase/migrations/007_blocked_jurisdictions_regions.sql`. Alter `blocked_jurisdictions` table to add `region_code TEXT` column (ISO 3166-2 subdivision, e.g. `IN-TG`) and replace the `country_code PRIMARY KEY` with a composite unique constraint on `(country_code, region_code)`. Seed the two mandatory blocked Indian states: `{country_code: 'IN', region_code: 'IN-TG', reason: 'India Online Gaming Rules 2026 — Telangana'}` and `{country_code: 'IN', region_code: 'IN-AP', reason: 'India Online Gaming Rules 2026 — Andhra Pradesh'}`. Update the Vercel KV `geo:blocked_countries` key to store the full list including region codes.
  - Files: `supabase/migrations/007_blocked_jurisdictions_regions.sql`, `supabase/seed.sql`, `src/lib/kv.ts`
  - Requires: Task 3
  - Validates: REQ 4.6

- [ ] Task 122: Update geo-block decision logic for state-level blocking
  - Description: Update `src/lib/geo.ts` `isGeoBlocked(countryCode, regionCode, blockedList)` to handle state-level blocking. Logic: (a) if country matches a blocked entry with `region_code = null` → blocked; (b) if country is `IN` and region matches a blocked entry (e.g., `IN-TG`, `IN-AP`) → blocked; (c) if country is `IN` and region is null/undefined → fail-safe blocked (cannot confirm state is allowed); (d) if country is null/undefined → fail-safe blocked. Update Edge Middleware to read `request.geo.region` alongside `request.geo.country` and pass both to `isGeoBlocked`. Update property-based test P10 to cover region-level logic.
  - Files: `src/lib/geo.ts`, `middleware.ts`, `src/__tests__/properties/p10-geo-block.test.ts`
  - Requires: Task 121, Task 7, Task 22
  - Validates: REQ 4.6, REQ 4.7, REQ 4.8

- [ ] Task 123: Update Age Gate — server-side render, HttpOnly cookie, compliance_logs
  - Description: Update Age Gate implementation: (a) render the Age Gate modal in the initial SSR HTML response (not only client-side) so it is present before JavaScript executes — use Next.js middleware to set a response header that the layout reads to inject the modal server-side; (b) update `age_verified` cookie to use `HttpOnly; Secure; SameSite=Strict` flags — set via API route `POST /api/compliance/age-gate/confirm` (server-side) rather than `document.cookie`; (c) on confirm: call the API route which sets the cookie and writes `compliance_logs` entry (`action='age_gate_confirmed'`, `resource_type='session'`, `resource_id=session_id`, no PII); (d) on decline: write `compliance_logs` entry (`action='age_gate_declined'`) then redirect. Verify cookie value is `1` only — no PII.
  - Files: `src/components/compliance/AgeGate.tsx`, `src/app/api/compliance/age-gate/confirm/route.ts`, `src/app/api/compliance/age-gate/decline/route.ts`, `middleware.ts`
  - Requires: Task 19, Task 107
  - Validates: REQ 4.1, REQ 4.2, REQ 4.3, REQ 4.4, REQ 8.7, REQ 8.8

- [ ] Task 124: Update geo-block compliance_logs recording (no IP storage)
  - Description: Update the geo-block middleware path to write a `compliance_logs` entry when a geo-block is triggered: `action='geo_block_triggered'`, `resource_type='session'`, `resource_id=session_id` (from cookie or generated UUID), `after_state={region: request.geo.region, country: request.geo.country}`. Explicitly verify that no IP address is included in `after_state` or any other field. Use the service-role Supabase client in a middleware-compatible way (Edge runtime — use `fetch` to call the internal analytics API route rather than the Supabase client directly, since Edge runtime has limited Node.js APIs).
  - Files: `middleware.ts`, `src/app/api/compliance/geo-block/route.ts`
  - Requires: Task 122, Task 107
  - Validates: REQ 4.10, REQ 8.11

- [ ] Task 125: Build /terms, /privacy-policy, and update /responsible-gaming pages
  - Description: Create three static SSG pages: (a) `src/app/terms/page.tsx` — Terms & Conditions including: 18+ eligibility, exclusion of Telangana and Andhra Pradesh residents, disclaimer that platform provides gaming IDs only (not a betting/gambling service), user responsibility for local law compliance; (b) `src/app/privacy-policy/page.tsx` — Privacy Policy stating no PII collected beyond session management, listing all data collected (session cookie, analytics events without PII, compliance logs without IP); (c) update `src/app/responsible-gaming/page.tsx` to add: AIGF guidelines reference with link to `https://aigf.in`, iCall helpline (9152987821), links to `/terms` and `/privacy-policy`. Add `/terms` and `/privacy-policy` links to Footer and Age Gate modal.
  - Files: `src/app/terms/page.tsx`, `src/app/privacy-policy/page.tsx`, `src/app/responsible-gaming/page.tsx`, `src/components/layout/Footer.tsx`, `src/components/compliance/AgeGate.tsx`
  - Requires: Task 21, Task 11
  - Validates: REQ 4.13, REQ 4.14, REQ 4.18, REQ 4.19, REQ 4.20

- [ ] Task 126: Implement compliant language enforcement in Pre-Publish Checklist
  - Description: Add a language compliance check to `POST /api/admin/pages/prepublish`. Implement `checkCompliantLanguage(fields: {bodyRaw, title, metaDesc, h1}): {passed: boolean; violations: {term: string; field: string; position: number}[]}`. Scans for "betting" and "bet" as whole-word, case-insensitive matches using regex `\b(betting|bet)\b`. If any violation found, returns `passed: false` with the term, field name, and character position. Add this check to `PrePublishCheckResult`. Update `PrePublishChecklist` modal to display language violations with the message: "Prohibited term '{term}' found in {field} at position {n} — replace with a compliant alternative (e.g., 'gaming ID', 'sports prediction')."
  - Files: `src/lib/language-compliance.ts`, `src/app/api/admin/pages/prepublish/route.ts`, `src/components/admin/PrePublishChecklist.tsx`
  - Requires: Task 109
  - Validates: REQ 4.15, REQ 4.16

- [ ] Task 127: Auto-inject Responsible Gaming disclaimer on all public pages
  - Description: Add a static `ResponsibleGamingDisclaimer` component that renders the disclaimer text: "ReddyExch provides gaming IDs for online sports prediction and fantasy participation platforms. This is not a betting or gambling service." as a `<p>` element with `role="note"`. Inject this component into the layout of all public pages (homepage, `/keyword/[slug]`, `/[slug]`, `/responsible-gaming`) as static HTML in the SSR/SSG output — NOT via JavaScript injection. Verify the disclaimer text is present in the raw HTML response (not dependent on JS execution) using a Playwright smoke test.
  - Files: `src/components/compliance/ResponsibleGamingDisclaimer.tsx`, `src/app/layout.tsx`, `src/app/keyword/[slug]/page.tsx`, `src/app/[slug]/page.tsx`
  - Requires: Task 9, Task 26, Task 96
  - Validates: REQ 4.17

- [ ] Task 128: Implement security headers in next.config.js
  - Description: Update `next.config.js` to add all required security headers via the `headers()` async function. Apply to all routes (`source: '/(.*)'`): `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`. Implement per-request CSP nonce in middleware: generate `crypto.randomUUID()`, set as `x-nonce` response header, use in CSP `script-src 'nonce-{nonce}'`. Update `RootLayout` to read the nonce from headers and apply to all inline scripts and JSON-LD script tags.
  - Files: `next.config.js`, `middleware.ts`, `src/app/layout.tsx`
  - Requires: Task 1, Task 7
  - Validates: REQ 8.1, REQ 8.2, REQ 8.3

- [ ] Task 129: Implement API rate limiting via Vercel KV
  - Description: Implement `src/lib/rate-limit.ts` with `rateLimit(key: string, limit: number, windowSeconds: number): Promise<{allowed: boolean; retryAfter: number}>`. Uses Vercel KV `INCR` + `EXPIRE` pattern. Apply to: `POST /api/admin/auth/login` (5 req / IP / 900s), `POST /api/analytics/event` (60 req / session_id / 60s), `POST /api/analytics/batch` (5 req / session_id / 60s), `GET /api/geo-check` (30 req / IP / 60s). On limit exceeded: return HTTP 429 with `{"error": "Too many requests", "retryAfter": N}` and `Retry-After: N` header. Write unit tests for the rate limiter covering: under limit (allowed), at limit (allowed), over limit (denied with correct retryAfter).
  - Files: `src/lib/rate-limit.ts`, `src/app/api/admin/auth/login/route.ts`, `src/app/api/analytics/event/route.ts`, `src/app/api/analytics/batch/route.ts`, `src/app/api/geo-check/route.ts`, `src/__tests__/unit/rate-limit.test.ts`
  - Requires: Task 5, Task 51, Task 56, Task 82
  - Validates: REQ 8.9, REQ 8.10

- [ ] Task 130: Implement input sanitisation and slug validation
  - Description: (a) Add `sanitize-html` package. Implement `src/lib/sanitise.ts` with `sanitiseHtml(raw: string): string` — removes `<script>`, `<iframe>`, `<object>`, `<embed>` tags and all `on*` event handler attributes. Apply in all admin API routes that accept `body_html` or `body_raw` before DB storage. (b) Implement `validateSlug(slug: string): boolean` — validates against `^[a-z0-9-]+$` regex; returns false for empty, whitespace, or non-matching strings. Apply in create/update page API routes; return HTTP 400 with `{"error": "Invalid slug format"}` on failure. (c) Add CI secret-scanning step to `.github/workflows/ci.yml` that fails if any file contains `NEXT_PUBLIC_SUPABASE_SERVICE` pattern.
  - Files: `src/lib/sanitise.ts`, `src/lib/slug-validation.ts`, `src/app/api/admin/pages/route.ts`, `src/app/api/admin/pages/[id]/route.ts`, `.github/workflows/ci.yml`
  - Requires: Task 60, Task 83
  - Validates: REQ 8.14, REQ 8.15, REQ 8.16, REQ 8.5

- [ ] Task 131: Implement compliance audit export endpoint
  - Description: Implement `GET /api/admin/compliance/export` (admin role only). Accepts query params: `startDate` (ISO 8601), `endDate` (ISO 8601, default: today), defaults to last 30 days. Queries `compliance_logs` for the date range. Anonymises `user_id` by replacing with `SHA-256(user_id)` using Node.js `crypto.createHash('sha256')`. Generates CSV with columns: `timestamp`, `action`, `resource_type`, `resource_id`, `user_id_hash`, `before_summary` (truncated string of before_state, no PII), `after_summary`. Streams response with `Content-Disposition: attachment; filename="compliance-export-{date}.csv"` and `Content-Type: text/csv`. Records the export action in `compliance_logs` with `action='compliance_export'`. Add "Compliance Export" button to Admin Dashboard under a dedicated `/admin/compliance` page (admin only).
  - Files: `src/app/api/admin/compliance/export/route.ts`, `src/app/admin/compliance/page.tsx`, `src/lib/compliance-export.ts`
  - Requires: Task 107, Task 106
  - Validates: REQ 4.21, REQ 4.22, REQ 8.12, REQ 8.17

- [ ] Task 132: Write compliance and security smoke tests
  - Description: Add tests covering: (a) Playwright: `GET /` response headers include `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Content-Security-Policy` with `nonce-`; (b) Playwright: `GET /keyword/online-cricket-id` HTML contains the Responsible Gaming disclaimer text as static HTML (not injected by JS); (c) Playwright: `GET /keyword/online-cricket-id` HTML does NOT contain the words "betting" or "bet" (whole-word); (d) fetch test: `POST /api/admin/auth/login` with 6 rapid requests from same IP returns HTTP 429 on the 6th; (e) Supabase RLS: direct UPDATE on `compliance_logs` via anon key returns error; (f) Playwright: visitor from simulated IN-TG region sees GeoBlocker modal (mock `request.geo.region = 'IN-TG'`); (g) Playwright: `/terms` and `/privacy-policy` return HTTP 200 with correct content; (h) Playwright: Age Gate modal is present in raw HTML before JS hydration.
  - Files: `src/__tests__/smoke/security-headers.spec.ts`, `src/__tests__/smoke/compliance-language.spec.ts`, `src/__tests__/smoke/geo-block-states.spec.ts`, `src/__tests__/smoke/rate-limiting.spec.ts`, `src/__tests__/smoke/legal-pages.spec.ts`
  - Requires: Task 121, Task 122, Task 123, Task 126, Task 127, Task 128, Task 129
  - Validates: REQ 4.6, REQ 4.15, REQ 4.17, REQ 8.1, REQ 8.2, REQ 8.3, REQ 8.9, REQ 8.32
