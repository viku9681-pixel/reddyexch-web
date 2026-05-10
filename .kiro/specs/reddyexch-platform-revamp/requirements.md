# Requirements Document

## Introduction

ReddyExch Commercial Gaming Platform Revamp transforms the existing basic promotional site at reddyexchgaming.com into a premium, high-conversion, SEO-dominant commercial platform for online cricket and sports gaming ID activation in India. The platform targets Indian sports gaming enthusiasts (18+) who seek instant, WhatsApp-based gaming ID activation. Success is measured by achieving #1 Google rankings for target keywords within 90 days, a ≥8% WhatsApp CTA conversion rate, Lighthouse Mobile Score ≥90, and zero compliance violations.

## Glossary

- **Platform**: The ReddyExch web application hosted at reddyexchgaming.com
- **Gaming_ID**: A unique identifier issued to a user that grants access to online cricket/sports gaming services
- **WhatsApp_CTA**: A call-to-action button or link that initiates a WhatsApp conversation for Gaming_ID activation
- **Age_Gate**: A compliance mechanism that verifies a visitor is 18 years of age or older before granting access
- **Geo_Blocker**: A compliance mechanism that restricts or warns visitors accessing the Platform from prohibited jurisdictions
- **Admin_Dashboard**: A password-protected backend interface used by platform administrators to manage content and view SEO scores
- **SEO_Scorer**: A built-in tool within the Admin_Dashboard that evaluates content against SEO best practices and returns a numeric score
- **Responsible_Gaming_Module**: A UI component that surfaces responsible gaming disclosures, self-exclusion options, and helpline information
- **Structured_Data**: JSON-LD schema markup embedded in page HTML to enable rich search results
- **LCP**: Largest Contentful Paint — a Core Web Vital measuring perceived load speed; target <2.5s
- **CLS**: Cumulative Layout Shift — a Core Web Vital measuring visual stability; target <0.1
- **Lighthouse_Score**: Google Lighthouse mobile performance score; target ≥90
- **Conversion_Funnel**: The tracked sequence of user interactions from landing page visit to WhatsApp_CTA click
- **Analytics_Tracker**: The component responsible for capturing and forwarding conversion and engagement events
- **Content_Page**: A keyword-optimized landing page targeting a specific search query (e.g., "online cricket id", "whatsapp cricket id")
- **Keyword_Landing_Page**: A Content_Page served at the exact-match URL path `/keyword/[slug]`, targeting one primary keyword from the Platform's keyword architecture
- **Pillar_Page**: A high-authority Content_Page that covers a broad topic (e.g., "online cricket id") and links out to multiple Cluster_Pages
- **Cluster_Page**: A Content_Page targeting a long-tail or secondary keyword that links back to its parent Pillar_Page
- **Keyword_Density**: The ratio of target keyword occurrences to total word count in a page's body content, expressed as a percentage
- **Hinglish**: A natural mix of Hindi and English used in Indian digital content; the primary content register for this Platform
- **Auto_Linker**: A server-side utility that scans Content_Page body text and inserts contextual internal links to related Keyword_Landing_Pages based on keyword match rules
- **Anchor_Text_Suggester**: An Admin_Dashboard tool that recommends contextual anchor text phrases for internal links based on the target page's primary keyword
- **Schema_Type**: One of the JSON-LD `@type` values supported by the Platform's structured data generator: `Organization`, `WebPage`, `Article`, `FAQPage`, `BreadcrumbList`, `HowTo`
- **Admin_Role**: One of three access levels in the Admin_Dashboard: `admin` (full access), `editor` (content + SEO tools), `viewer` (read-only)
- **SEO_Score_Meter**: The visual 0–100 gauge in the Admin_Dashboard that evaluates meta tags, keyword density, schema completeness, internal links, and readability
- **Keyword_Density_Analyzer**: An Admin_Dashboard tool that calculates Keyword_Density in real time and suggests Hinglish synonym alternatives to avoid over-optimisation
- **Schema_Generator**: An Admin_Dashboard tool that auto-generates and previews JSON-LD structured data (FAQPage, Article, BreadcrumbList) from page content fields, with inline validation against Google's Rich Results Test rules
- **Internal_Link_Gap_Analyzer**: An Admin_Dashboard tool that identifies Keyword_Landing_Pages that have fewer than 2 internal links pointing to them, and suggests source pages and anchor text to fill the gap
- **Pre_Publish_Checklist**: A modal displayed before a Content_Page is published, listing all SEO, compliance, and content quality checks that must pass before publication is allowed
- **Rank_Tracker**: An Admin_Dashboard panel that displays current Google ranking positions for target keywords, sourced from Ahrefs/SEMrush API integration or manual input
- **Widget_Config**: A configurable set of parameters for embeddable front-end widgets (Crictime live score filters, Instagram feed curation rules, WhatsApp CTA A/B test variants)
- **Audit_Log**: An append-only record of all content changes, publishes, unpublishes, and deletions performed by any admin user, stored in the `compliance_logs` table
- **AIGF**: All India Gaming Federation — the industry body whose guidelines the Platform references for responsible gaming compliance
- **Compliant_Language**: User-facing text that avoids prohibited terms ("betting", "bet") and uses approved alternatives ("gaming ID", "sports prediction", "fantasy participation", "online gaming")
- **PII**: Personally Identifiable Information — any data that can identify a specific individual (name, email, phone number, IP address, device fingerprint); the Platform SHALL NOT store PII in logs or analytics tables
- **CSP**: Content Security Policy — an HTTP response header that restricts which resources the browser may load, preventing XSS attacks
- **Rate_Limit**: A per-IP or per-session cap on API request frequency, enforced via Vercel KV counters, returning HTTP 429 when exceeded

---

## Requirements

### Requirement 1: Mobile-First UI/UX Redesign

**User Story:** As an Indian sports gaming enthusiast, I want a visually premium, fast-loading mobile experience, so that I can quickly understand the service and take action to get my Gaming_ID.

#### Acceptance Criteria

1. THE Platform SHALL render all pages using a mobile-first responsive layout that adapts without horizontal scrolling on viewports from 320px to 1440px wide.
2. WHEN a visitor loads any page on a mobile device, THE Platform SHALL achieve a Lighthouse Mobile Score ≥90, LCP <2.5s, and CLS <0.1 as measured by Google Lighthouse 10+.
3. THE Platform SHALL display a WhatsApp_CTA in the visible viewport area (above the fold at 360×640px viewport) on every page, such that the CTA is fully visible without any scrolling and is not obscured by any overlapping element.
4. WHEN a visitor interacts with any interactive element (button, link, form field), THE Platform SHALL apply a visible CSS state change (e.g., color, border, or opacity change) within 100ms of the interaction event being fired, as measurable via browser DevTools performance trace.
5. THE Platform SHALL define and apply a design system comprising a named color palette (minimum 3 brand colors with hex values), a typography scale (minimum 4 named text styles with font-size, line-height, and font-weight), and a spacing scale (minimum 6 named spacing tokens in px or rem); these tokens SHALL be referenced consistently across all page components with no inline overrides.
6. WHEN a page is loaded under a simulated 3G network condition (download speed ≤1.6 Mbps, latency ≥300ms as configured in browser DevTools), THE Platform SHALL render text content and at least one above-the-fold image within 3 seconds of navigation start, using techniques such as skeleton screens, lazy loading, or progressive image rendering.

---

### Requirement 2: WhatsApp-Based Gaming ID Activation Flow

**User Story:** As a visitor ready to start gaming, I want a frictionless WhatsApp-based activation flow, so that I can receive my Gaming_ID instantly without filling out lengthy forms.

#### Acceptance Criteria

1. THE Platform SHALL display a WhatsApp_CTA persistently on every page (visible without any user interaction) that, when clicked, opens a WhatsApp conversation pre-filled with the message "Hi, I want to get my Gaming ID — [source page URL]" addressed to the phone number defined in the Platform's WhatsApp business number configuration.
2. WHEN a visitor clicks the WhatsApp_CTA, THE Analytics_Tracker SHALL record a `whatsapp_cta_click` event including the source page URL, visitor session ID, and timestamp within 500ms.
3. THE Platform SHALL achieve a WhatsApp_CTA click-through rate ≥8% of unique page sessions as measured over any rolling 7-day period.
4. WHEN the WhatsApp_CTA is rendered on a mobile device, THE Platform SHALL use the `https://wa.me/` deep-link scheme to open the WhatsApp application directly.
5. WHEN the WhatsApp_CTA is rendered on a desktop device, THE Platform SHALL use the `https://web.whatsapp.com/send` scheme to open WhatsApp Web.
6. THE Platform SHALL display a fixed activation time label of ≤60 characters (e.g., "Get your ID in 5 minutes") within the same visual container as every WhatsApp_CTA, positioned such that it is visible alongside the CTA without scrolling.
7. IF the Platform's WhatsApp business number configuration is absent or the constructed WhatsApp URL fails URL validation at render time, THEN THE Platform SHALL replace the WhatsApp_CTA with a fallback contact block sourced from the Platform's fallback contact configuration, displaying the configured alternate phone number or email address.

---

### Requirement 3: SEO Infrastructure, Keyword Architecture, and Content Pages

**User Story:** As the platform owner, I want a comprehensive keyword architecture with 30+ exact-match landing pages, full technical SEO infrastructure, and auto-generated structured data, so that reddyexchgaming.com dominates Google rankings for all target keywords within 90 days.

#### Acceptance Criteria

**Keyword Architecture & URL Structure**

1. THE Platform SHALL serve all Keyword_Landing_Pages at the URL path `/keyword/[slug]`, where `[slug]` is the URL-encoded, hyphenated form of the target keyword (e.g., `/keyword/online-cricket-id`, `/keyword/whatsapp-cricket-id`).
2. THE Platform SHALL include at least 30 published Keyword_Landing_Pages covering the following keyword tiers:
   - Primary (exact-match): "online cricket id", "whatsapp cricket id"
   - Secondary: "instant cricket id", "cricket betting id", "reddy anna book", "diamond exch", "fairplay id", "lotus365 id", "mahadev book", and at least 5 additional brand/platform keywords
   - Long-tail: "how to get cricket id via whatsapp", "best ipl betting id india", and at least 8 additional long-tail variants of ≥4 words each
3. THE Platform SHALL implement a pillar-cluster internal linking model: each Primary keyword page SHALL be designated as a Pillar_Page and SHALL contain contextual internal links to at least 5 Cluster_Pages; each Cluster_Page SHALL contain a contextual internal link back to its parent Pillar_Page.
4. WHEN the Auto_Linker processes a Content_Page's body HTML at publish time, it SHALL scan for occurrences of any registered keyword from the Platform's keyword registry and insert a contextual `<a href="/keyword/[slug]">` link for the first unlinked occurrence of each keyword per page, without modifying existing links or creating duplicate links to the same target on the same page.
5. WHEN an administrator edits a Content_Page in the Admin_Dashboard, THE Anchor_Text_Suggester SHALL display a list of suggested anchor text phrases for each related Keyword_Landing_Page, derived from the target page's primary keyword and its registered synonyms.

**Content Rules**

6. WHEN a Keyword_Landing_Page is authored, THE Platform SHALL enforce the following content rules, validated by the SEO_Scorer:
   - The target keyword SHALL appear in the first 100 words of the body content (case-insensitive)
   - Keyword_Density SHALL be between 1.5% and 2.5% of total body word count
   - WHEN Keyword_Density exceeds 3.0%, THE SEO_Scorer SHALL display a warning: "Keyword density is {current}% — reduce to below 3% to avoid over-optimisation penalty"
   - The `<title>` tag SHALL be 50–60 characters (tighter than the general 10–60 range for Keyword_Landing_Pages)
   - The `<meta name="description">` tag SHALL be 150–160 characters (tighter than the general 50–160 range)
   - The first `<h1>` element SHALL contain the exact-match target keyword
   - Content SHALL be written in a natural Hinglish, English, or Hindi register with no mechanical keyword repetition; the SEO_Scorer SHALL flag any sentence where the keyword appears more than twice consecutively
7. THE Platform SHALL serve all Keyword_Landing_Pages with full server-side rendered or statically generated HTML (HTTP 200) so that search engine crawlers receive complete content without executing JavaScript.

**Structured Data**

8. WHEN any Content_Page or Keyword_Landing_Page is rendered, THE Platform SHALL inject the following JSON-LD Structured_Data types into the `<head>` element, each passing Google's Rich Results Test without errors:
   - `Organization`: always present on every page
   - `WebPage`: always present on every page
   - `Article`: present on Keyword_Landing_Pages and blog-style Content_Pages
   - `BreadcrumbList`: present on all pages with a URL depth ≥ 2 (e.g., `/keyword/online-cricket-id`)
   - `FAQPage`: present IF and ONLY IF the page contains one or more question-and-answer pairs marked up in the page content
   - `HowTo`: present IF and ONLY IF the page contains a step-by-step instructional section marked up with `howto_steps` in the page content
9. WHEN `BreadcrumbList` Structured_Data is generated for a Keyword_Landing_Page at `/keyword/[slug]`, THE breadcrumb SHALL contain exactly two items: item 1 = homepage (`/`, name = "Home"), item 2 = the current page (`/keyword/[slug]`, name = the page's `<h1>` text).
10. ALL Structured_Data JSON-LD objects SHALL be auto-generated from page content fields (title, h1, meta_desc, body, faq_items, howto_steps) without requiring manual JSON editing by administrators.

**Technical SEO**

11. THE Platform SHALL generate an XML sitemap at `/sitemap.xml` that conforms to the Sitemap Protocol 0.9 schema, listing all indexable Content_Pages and Keyword_Landing_Pages (defined as pages not carrying a `noindex` directive and not disallowed in `robots.txt`) with their `<lastmod>` dates in ISO 8601 format and `<changefreq>` values drawn from the set {always, hourly, daily, weekly, monthly, yearly, never}.
12. THE Platform SHALL serve a `robots.txt` file at `/robots.txt` that contains an explicit `Allow: /` directive for all public Content_Page and Keyword_Landing_Page paths, an explicit `Disallow:` directive for all non-public paths (`/admin`, `/api`), and a `Sitemap:` directive referencing the absolute URL of `/sitemap.xml`.
13. WHEN a Content_Page or Keyword_Landing_Page is rendered, THE Platform SHALL populate a `<title>` tag, a `<meta name="description">` tag, and a `<link rel="canonical">` tag with the page's absolute canonical URL; no two published pages SHALL share an identical `<title>` value or an identical `<meta name="description">` value.
14. THE Platform SHALL implement hreflang tags for three locale variants on each page where the variant exists:
    - `hreflang="en-IN"` for the English (India) variant
    - `hreflang="hi-IN"` for the Hindi (India) variant
    - `hreflang="hin-IN"` for the Hinglish (India) variant
    - Each variant page SHALL include `<link rel="alternate">` tags referencing all other variants of the same page.
15. WHEN a visitor navigates to a non-existent URL, THE Platform SHALL return an HTTP 404 status code and render a custom 404 page that includes navigation links to the homepage and to the 5 Keyword_Landing_Pages with the highest published word count.
16. THE Platform SHALL apply a `<meta name="robots" content="noindex, nofollow">` tag to all `/admin/**` and `/api/**` routes, and SHALL include `Disallow: /admin` and `Disallow: /api` in `robots.txt`.
17. WHEN a Keyword_Landing_Page URL is accessed via a non-canonical form (e.g., with trailing slash, uppercase characters, or query parameters not in the canonical set), THE Platform SHALL return an HTTP 301 redirect to the canonical URL.
18. THE Platform SHALL be configured such that a Google Lighthouse 10+ audit run against any Keyword_Landing_Page in a simulated mobile environment produces LCP <2.5s, FID <100ms (or INP <200ms), and CLS <0.1.

---

### Requirement 4: Compliance Layer — India Online Gaming Rules 2026

**User Story:** As the platform owner, I want a robust compliance layer enforcing India Online Gaming Rules 2026 requirements — age verification, state-level geo-blocking, responsible gaming disclosures, compliant language, legal pages, and exportable audit records — so that the platform operates within Indian law and avoids regulatory violations.

#### Acceptance Criteria

**Age Verification Gate**

1. WHEN a new visitor accesses the Platform for the first time in a browser session, THE Age_Gate SHALL display a full-screen modal requiring the visitor to confirm they are 18 years of age or older before any page content is accessible. The modal SHALL be rendered server-side in the initial HTML response so that it is present before any JavaScript executes.
2. WHEN a visitor confirms they are 18+ in the Age_Gate, THE Platform SHALL: (a) set a session cookie named `age_verified=1` with flags `HttpOnly; Secure; SameSite=Strict`; (b) insert a record into the `compliance_logs` table with `action='age_gate_confirmed'`, `resource_type='session'`, `resource_id=session_id`, and `timestamp`; (c) dismiss the modal.
3. THE Age_Gate confirmation cookie SHALL NOT contain any Personally Identifiable Information (PII) — it SHALL store only the boolean confirmation value and session identifier, not name, email, phone, or IP address.
4. IF a visitor declines the Age_Gate confirmation, THEN THE Platform SHALL redirect the visitor to the exit URL defined in the Platform's compliance configuration and SHALL NOT grant access to any Platform content. The decline event SHALL be recorded in `compliance_logs` with `action='age_gate_declined'`.
5. IF the visitor's browser does not support cookies, THEN THE Age_Gate SHALL be displayed on every page load and THE Geo_Blocker check SHALL be performed on every page load to ensure compliance is maintained.

**State-Level Geo-Blocking (India Online Gaming Rules 2026)**

6. THE Platform SHALL block access from the following Indian states where online gaming is prohibited under India Online Gaming Rules 2026: Telangana (ISO 3166-2: `IN-TG`) and Andhra Pradesh (ISO 3166-2: `IN-AP`). These state codes SHALL be stored in the `blocked_jurisdictions` table and checked in Next.js Edge Middleware using Vercel's `request.geo.region` field.
7. WHEN a visitor's IP address resolves to a blocked Indian state (`IN-TG` or `IN-AP`) or any other jurisdiction listed in `blocked_jurisdictions`, THE Geo_Blocker SHALL display a full-screen notice stating "This service is not available in your state/region as per applicable laws" and SHALL prevent access to all Platform content.
8. IF the IP address cannot be resolved, `request.geo.region` is undefined, or the geo-lookup returns an error, THE Geo_Blocker SHALL deny access by default (fail-safe) and display the unavailability notice.
9. THE Platform SHALL evaluate the Geo_Blocker check before displaying the Age_Gate; if a visitor is geo-blocked, the Age_Gate SHALL NOT be displayed.
10. WHEN a geo-block is triggered, THE Platform SHALL record the event in `compliance_logs` with `action='geo_block_triggered'`, `resource_type='session'`, `resource_id=session_id`, `after_state={region: request.geo.region}`, and `timestamp`. No visitor IP address SHALL be stored in `compliance_logs` or any other table.

**Responsible Gaming Disclosures**

11. THE Platform SHALL auto-inject the Responsible_Gaming_Module into the footer of every public page (homepage, all Content_Pages, all Keyword_Landing_Pages, `/responsible-gaming`). The module SHALL include: (a) the statement "This platform is for users 18 years and older"; (b) a "Play Responsibly" badge; (c) a link to `/responsible-gaming`; (d) the iCall helpline number (9152987821) or equivalent AIGF-recognised helpline; (e) a self-exclusion link.
12. WHEN the Responsible_Gaming_Module is rendered, THE Platform SHALL include the "Play Responsibly" badge such that it is not hidden (`display` ≠ `none`, `visibility` ≠ `hidden`), not overlapped by any other element, and visible within the rendered viewport when the footer is scrolled into view.
13. THE Platform SHALL include a dedicated Responsible Gaming page at `/responsible-gaming` containing: self-exclusion instructions, deposit limit guidance, helpline contact details (iCall or AIGF-recognised), a reference to AIGF (All India Gaming Federation) guidelines, and a link to the Platform's Terms & Conditions and Privacy Policy.
14. THE Platform SHALL include a Terms & Conditions page at `/terms` and a Privacy Policy page at `/privacy-policy`. Both pages SHALL be linked from the footer of every page and from the Age_Gate modal.

**Compliant Language Rules**

15. THE Platform SHALL NOT use the word "betting" or "bet" in any user-facing content, meta tags, structured data, or page titles. All references SHALL use compliant alternatives: "gaming ID", "sports prediction", "fantasy participation", "online gaming", or "sports gaming".
16. THE Pre_Publish_Checklist SHALL include a language compliance check that scans the page's `body_raw`, `title`, `meta_desc`, and `h1` for the strings "betting" and "bet" (case-insensitive, whole-word match). IF any prohibited term is found, THE checklist SHALL block publication and display: "Prohibited term '{term}' found at position {n} — replace with a compliant alternative."
17. THE Platform SHALL display a disclaimer on every Keyword_Landing_Page and Content_Page: "ReddyExch provides gaming IDs for online sports prediction and fantasy participation platforms. This is not a betting or gambling service." This disclaimer SHALL be rendered as static HTML (not injected via JavaScript) so it is present in the SSR/SSG output.

**Legal Pages & AIGF Reference**

18. THE Platform SHALL reference AIGF (All India Gaming Federation) guidelines on the `/responsible-gaming` page and in the footer's Responsible_Gaming_Module, with a hyperlink to the AIGF website (`https://aigf.in`).
19. THE `/terms` page SHALL include: eligibility criteria (18+ only, not resident of Telangana or Andhra Pradesh), disclaimer that the platform provides gaming IDs only and does not operate gaming platforms directly, and a statement that users are responsible for compliance with their local laws.
20. THE `/privacy-policy` page SHALL state that the Platform does not collect, store, or process Personally Identifiable Information beyond what is required for session management, and SHALL list all data collected (session cookie, analytics events without PII, compliance log entries without IP addresses).

**Compliance Audit Exports**

21. THE Admin_Dashboard (`admin` role only) SHALL provide a "Compliance Export" function at `GET /api/admin/compliance/export` that generates a downloadable CSV file containing all `compliance_logs` entries for a specified date range (default: last 30 days). The export SHALL include: timestamp, action, resource_type, resource_id, user_id (anonymised as a hash, not raw UUID), and a summary of before/after state changes. No PII SHALL appear in the export.
22. THE compliance export SHALL be available in the Admin_Dashboard under a dedicated "Compliance" section, accessible to `admin` role only. The export action SHALL itself be recorded in `compliance_logs` with `action='compliance_export'`.
23. THE Platform SHALL retain `compliance_logs` entries for a minimum of 12 months. Entries older than 12 months MAY be archived to Supabase Storage as compressed JSON files but SHALL NOT be deleted from the database within the retention period.

---

### Requirement 5: Admin Dashboard — Roles, SEO Tools, Workflow, and Audit

**User Story:** As a platform administrator, I want a secure, role-gated dashboard with real-time SEO scoring, keyword analysis, schema generation, internal link gap analysis, a pre-publish checklist, rank tracking, widget configuration, and a full audit log, so that I can manage content and rankings daily without developer assistance.

#### Acceptance Criteria

**Authentication & Role-Based Access Control**

1. THE Admin_Dashboard SHALL be accessible only to authenticated users via Supabase Auth (email/password); unauthenticated requests to any `/admin/**` route SHALL redirect to `/admin/login`.
2. WHEN an authenticated user submits valid credentials, THE Admin_Dashboard SHALL issue a Supabase session token with a maximum lifetime of 8 hours, after which the user SHALL be required to re-authenticate.
3. THE Admin_Dashboard SHALL enforce three Admin_Roles with the following permissions:
   - `admin`: full access to all features including user management, widget config, audit log, and deletion
   - `editor`: access to content editor, SEO tools, schema generator, internal link analyzer, rank tracker, and publish workflow; no access to user management or widget config
   - `viewer`: read-only access to all content, SEO scores, rank tracker, and audit log; no create, edit, publish, or delete actions
4. WHEN a user with `editor` or `viewer` role attempts to access a feature restricted to `admin`, THE Admin_Dashboard SHALL return HTTP 403 and display an "Access denied" message without revealing the restricted feature's content.
5. WHEN any admin action (create, edit, publish, unpublish, delete, widget config change) is performed, THE Platform SHALL write an entry to the `compliance_logs` table containing: `user_id`, `action` (one of: create, edit, publish, unpublish, delete, config_change), `resource_type` (one of: article, keyword, widget_config), `resource_id`, `before_state` (JSONB snapshot), `after_state` (JSONB snapshot), and `timestamp`. This log SHALL be immutable — no update or delete operations are permitted on `compliance_logs` rows.

**Content Management**

6. THE Admin_Dashboard SHALL allow `admin` and `editor` roles to create, edit, publish, and unpublish Content_Pages and Keyword_Landing_Pages without modifying application source code or configuration files.
7. THE Admin_Dashboard SHALL implement a draft/publish workflow with the following states: `draft` → `scheduled` → `published` → `unpublished`. State transitions SHALL only be permitted in the defined direction; a published page cannot be moved directly to draft without first being unpublished.
8. WHEN an `admin` or `editor` attempts to publish a Content_Page, THE Platform SHALL display the Pre_Publish_Checklist modal. The checklist SHALL block publication unless ALL of the following pass: SEO score ≥70, keyword in first 100 words, exact-match H1 present, meta title within length bounds, meta description within length bounds, internal link count ≥2, no duplicate slug, structured data valid.
9. IF an administrator attempts to publish a Content_Page with a URL slug identical to an existing published or scheduled page's slug, THE Admin_Dashboard SHALL display an error identifying the conflicting slug and SHALL prevent publication until the slug is unique.
10. THE Admin_Dashboard SHALL display a content calendar view showing scheduled publish date and current status (draft, scheduled, published, unpublished) for all Content_Pages within a rolling 90-day window.
11. WHEN an `admin` or `editor` publishes a Content_Page, THE Platform SHALL automatically update the XML sitemap within 60 seconds and attempt a sitemap ping to Google Search Console; IF the ping fails, THE Platform SHALL display a non-blocking warning but SHALL still complete publication.
12. THE Admin_Dashboard SHALL allow `admin` and `editor` roles to upload images in JPEG, PNG, GIF, or WebP format (max input 10 MB), automatically convert to WebP (max output 500 KB), and store in Supabase Storage.

**SEO Score Meter**

13. WHEN an `admin` or `editor` saves or previews a Content_Page, THE SEO_Score_Meter SHALL evaluate the content and return a score from 0–100 based on the following weighted criteria:
    - Keyword density 1.5%–2.5%: pass; >3%: warn with "Keyword density is X% — reduce below 3%"; <1.5% or >3%: fail
    - Keyword in first 100 words: pass/fail
    - Meta title length (50–60 chars for KLPs, 10–60 for general): pass/fail
    - Meta description length (150–160 chars for KLPs, 50–160 for general): pass/fail
    - Exact-match keyword in first `<h1>`: pass/fail
    - Heading structure (H1 present, H2/H3 hierarchy, no skipped levels): pass/fail
    - Internal link count ≥2: pass/fail
    - Content length ≥600 words: pass/fail
    - Structured data completeness (all required Schema_Types present): pass/fail
    - Readability score (Flesch-Kincaid or equivalent, target ≥50 for Hinglish/English content): pass/fail
14. IF THE SEO_Score_Meter returns a score below 70, THE Admin_Dashboard SHALL display a specific, actionable suggestion for each failing criterion, identifying the criterion by name and stating current value vs required value.

**Keyword Density Analyzer & Hinglish Synonym Suggester**

15. WHEN an `admin` or `editor` is editing a Content_Page, THE Keyword_Density_Analyzer SHALL display in real time: the current keyword density percentage, a colour-coded indicator (green: 1.5–2.5%, amber: 2.5–3%, red: >3% or <1.5%), and the total word count.
16. WHEN Keyword_Density exceeds 2.5%, THE Keyword_Density_Analyzer SHALL display a list of at least 3 Hinglish synonym suggestions for the target keyword (e.g., for "cricket id": "cricket account", "cricket ID banwao", "cricket wala ID") that can be used as natural replacements to reduce density without losing topical relevance.

**Schema Generator**

17. THE Schema_Generator SHALL auto-generate JSON-LD previews for `FAQPage`, `Article`, and `BreadcrumbList` schema types from the page's content fields (title, h1, meta_desc, faq_items, howto_steps) without requiring manual JSON editing.
18. WHEN an `admin` or `editor` views the Schema_Generator panel, THE Admin_Dashboard SHALL display a real-time JSON-LD preview for each applicable schema type and SHALL highlight any validation errors (missing required fields, incorrect value types) inline, referencing the specific JSON-LD property that is invalid.
19. WHEN an `admin` or `editor` saves a Content_Page, THE Platform SHALL validate all generated JSON-LD against the schema.org specification rules for each `@type` before saving; IF validation fails, THE Admin_Dashboard SHALL display the specific validation error and SHALL prevent saving until resolved.

**Internal Link Gap Analyzer**

20. THE Internal_Link_Gap_Analyzer SHALL identify all published Keyword_Landing_Pages that have fewer than 2 internal links pointing to them (as recorded in the `keyword_registry.inbound_link_count` field, updated at publish time).
21. WHEN the Internal_Link_Gap_Analyzer displays a gap, it SHALL suggest at least one source page and one anchor text phrase for each under-linked target page, derived from the Auto_Linker's keyword registry.
22. WHEN an `admin` or `editor` accepts a link suggestion from the Internal_Link_Gap_Analyzer, THE Admin_Dashboard SHALL open the suggested source page in the content editor with the cursor positioned at the first occurrence of the suggested anchor text.

**Rank Tracker**

23. THE Rank_Tracker panel SHALL display the current Google ranking position for each keyword in the `keyword_registry`, updated at least once every 24 hours.
24. THE Rank_Tracker SHALL support two data sources, configurable per keyword: (a) Ahrefs or SEMrush API (using API key stored in `platform_config`), or (b) manual input by an `admin` or `editor` user.
25. WHEN a keyword's ranking position improves or worsens by 3 or more positions compared to the previous recorded value, THE Rank_Tracker SHALL display a visual indicator (up arrow in green for improvement, down arrow in red for decline) alongside the keyword row.
26. THE Rank_Tracker SHALL store all historical ranking data in the `seo_metrics` table with columns: `keyword_id`, `position`, `source` (api or manual), `recorded_at`.

**Widget Configuration Panel**

27. THE Widget_Config panel SHALL be accessible to `admin` role only and SHALL allow configuration of the following widgets without code changes:
    - Crictime live score embed: filter by match type (IPL, T20I, ODI, Test), team, and tournament
    - Instagram feed curation: configure hashtags, account handles, and post count (max 12)
    - WhatsApp CTA A/B test: configure up to 2 variants (button text, activation label, pre-filled message), with traffic split percentage (0–100%) and a winner selection mechanism
28. WHEN a Widget_Config change is saved by an `admin`, THE Platform SHALL write the new configuration to the `widget_configs` table, invalidate the relevant Vercel KV cache key, and record the change in `compliance_logs`.
29. WHEN the WhatsApp CTA A/B test is active, THE Platform SHALL serve variant A or variant B to each visitor session deterministically (same variant for the same session), with traffic split determined by the configured percentage.

**Audit Log**

30. THE Audit_Log view SHALL be accessible to `admin` and `viewer` roles and SHALL display all `compliance_logs` entries in reverse chronological order, filterable by: `user_id`, `action`, `resource_type`, and date range.
31. THE Audit_Log SHALL display for each entry: timestamp, user email, action, resource type, resource ID, and a diff view showing `before_state` vs `after_state` for edit actions.
32. THE `compliance_logs` table SHALL be append-only: no UPDATE or DELETE SQL operations SHALL be permitted on this table via RLS policy (`FOR UPDATE USING (false)`, `FOR DELETE USING (false)`).

---

### Requirement 8: Security Hardening

**User Story:** As the platform owner, I want all data, sessions, APIs, and logs to be secured against common web threats and compliant with Indian data protection expectations, so that visitor data is protected and the platform cannot be exploited.

#### Acceptance Criteria

**HTTPS & Transport Security**

1. THE Platform SHALL enforce HTTPS on all routes. HTTP requests SHALL be redirected to HTTPS with a 301 status code at the Vercel edge. THE Platform SHALL set a `Strict-Transport-Security` header with `max-age=31536000; includeSubDomains; preload` on all responses.
2. THE Platform SHALL set the following security headers on all HTTP responses via `next.config.js`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
3. THE Platform SHALL set a Content Security Policy (CSP) header on all responses. The CSP SHALL include: `default-src 'self'`; `script-src 'self' 'nonce-{random}' https://www.googletagmanager.com https://www.google-analytics.com`; `img-src 'self' data: https://*.supabase.co`; `connect-src 'self' https://*.supabase.co https://www.google-analytics.com`; `frame-ancestors 'none'`. The nonce SHALL be a cryptographically random value generated per request.

**Supabase RLS & Data Access**

4. THE Platform SHALL enable Row Level Security (RLS) on every Supabase table. The following access rules SHALL be enforced at the database level (not only at the application level):
   - `content_pages`: public SELECT on `status='published'` rows only; authenticated INSERT/UPDATE/DELETE
   - `analytics_events`: no direct client access (all writes via API route with service role key)
   - `compliance_logs`: authenticated INSERT only; no UPDATE or DELETE for any role
   - `conversion_logs`: no direct client access
   - `widget_configs`: authenticated SELECT; admin-role INSERT/UPDATE only
   - `seo_metrics`: authenticated SELECT and INSERT; no DELETE
   - `blocked_jurisdictions`: public SELECT; authenticated INSERT/UPDATE/DELETE
   - `platform_config`: public SELECT; authenticated INSERT/UPDATE/DELETE
5. THE `SUPABASE_SERVICE_ROLE_KEY` environment variable SHALL be used exclusively in server-side Next.js API Routes and Server Components. It SHALL NOT appear in any `NEXT_PUBLIC_*` variable, client-side bundle, or browser-accessible file. Violation of this rule SHALL cause the CI pipeline to fail via a secret-scanning step.
6. THE `NEXT_PUBLIC_SUPABASE_ANON_KEY` SHALL be used for all client-side Supabase operations. All client-side queries SHALL be subject to RLS policies and SHALL NOT bypass them.

**Secure Cookies**

7. ALL cookies set by the Platform SHALL use the following flags: `HttpOnly` (prevents JavaScript access), `Secure` (HTTPS only), `SameSite=Strict` (prevents CSRF). This applies to: `age_verified`, Supabase Auth session cookie, and any other Platform-set cookies.
8. THE `age_verified` cookie SHALL NOT contain any PII. Its value SHALL be `1` (confirmed) only. Session identity SHALL be managed separately via the Supabase Auth session cookie.

**API Rate Limiting**

9. THE Platform SHALL apply rate limiting to the following API routes using Vercel KV as the counter store:
   - `POST /api/admin/auth/login`: maximum 5 requests per IP per 15-minute window; excess requests SHALL return HTTP 429 with `Retry-After` header
   - `POST /api/analytics/event`: maximum 60 requests per session per minute; excess requests SHALL return HTTP 429
   - `POST /api/analytics/batch`: maximum 5 requests per session per minute; excess requests SHALL return HTTP 429
   - `GET /api/geo-check`: maximum 30 requests per IP per minute; excess requests SHALL return HTTP 429
10. WHEN a rate limit is exceeded, THE Platform SHALL return HTTP 429 with a JSON body `{"error": "Too many requests", "retryAfter": N}` where N is the number of seconds until the rate limit resets. No other information SHALL be included in the response.

**No PII in Logs**

11. THE Platform SHALL NOT store any Personally Identifiable Information in `analytics_events`, `compliance_logs`, `conversion_logs`, or any server-side log. Specifically: IP addresses SHALL NOT be stored in any database table; user email addresses SHALL NOT appear in `compliance_logs` (only `user_id` UUID); visitor names, phone numbers, and device fingerprints SHALL NOT be stored.
12. THE `compliance_logs` export function (REQ 4.21) SHALL anonymise `user_id` by replacing it with a SHA-256 hash of the UUID before including it in the CSV export. The raw UUID SHALL NOT appear in any exported file.
13. THE Analytics_Tracker SHALL NOT include IP address, full User-Agent string, or any browser fingerprint in any event payload sent to the internal analytics endpoint or GA4.

**Input Validation & Injection Prevention**

14. ALL admin API route inputs SHALL be validated with Zod schemas server-side before any database operation. Requests that fail Zod validation SHALL return HTTP 400 with a structured error listing the failing fields. No raw user input SHALL be passed to a Supabase query without validation.
15. ALL rich text content stored in `content_pages.body_html` SHALL be sanitised using `sanitize-html` (or equivalent) before storage, removing all `<script>`, `<iframe>`, `<object>`, `<embed>` tags and all `on*` event handler attributes. Sanitisation SHALL occur server-side in the API route, not client-side.
16. ALL URL slug inputs SHALL be normalised (lowercase, hyphens only, no special characters) and validated against a regex `^[a-z0-9-]+$` before storage. Slugs that fail validation SHALL return HTTP 400.

**Compliance Audit Export Security**

17. THE compliance export endpoint (`GET /api/admin/compliance/export`) SHALL require `admin` role authentication. Unauthenticated or under-privileged requests SHALL return HTTP 403. The export SHALL be generated server-side and streamed as a CSV file attachment (`Content-Disposition: attachment; filename="compliance-export-{date}.csv"`). The CSV SHALL NOT include raw IP addresses, full User-Agent strings, or any PII.

---

### Requirement 6: Performance Optimization

**User Story:** As a visitor on a mobile device in India, I want pages to load instantly, so that I don't abandon the site before seeing the offer.

#### Acceptance Criteria

1. THE Platform SHALL serve all static assets (JavaScript, CSS, images, fonts) with a `Cache-Control` header of at least `max-age=31536000, immutable` and use content-hash-based filenames for cache busting.
2. THE Platform SHALL serve images in WebP format with a `<picture>` element fallback to JPEG/PNG for browsers that do not support WebP, and SHALL apply the `loading="lazy"` attribute to all `<img>` elements whose top edge is below the 360×800px (1x DPR) viewport boundary on initial page load.
3. THE Platform SHALL extract and inline the CSS rules required to render all elements visible within the 360×800px (1x DPR) viewport on initial page load, and SHALL load all remaining CSS asynchronously using `<link rel="preload" as="style">` with an `onload` handler to prevent render-blocking.
4. THE Platform SHALL serve JavaScript bundles split by route, with a maximum initial bundle size of 150KB (gzip-compressed) for any single page.
5. WHEN a Content_Page is requested and the CDN returns a cache status of HIT, THE Platform SHALL respond with a Time to First Byte (TTFB) of ≤200ms as measured from the CDN edge node.
6. THE Platform SHALL use a Content Delivery Network (CDN) configured with at least one edge node in India such that ≥90% of HTTP requests originating from Indian IP addresses experience a network round-trip latency of ≤50ms to the nearest CDN edge node.
7. THE Platform SHALL preload the LCP image element using `<link rel="preload" as="image">` on every page where an image is the LCP candidate.
8. WHEN a font file is required to render text within the 360×800px (1x DPR) viewport on initial page load, THE Platform SHALL declare `font-display: swap` for that font face and SHALL include a `<link rel="preload" as="font">` tag for the font file in the `<head>` element.
9. THE Platform SHALL be configured such that a Google Lighthouse 10+ mobile audit of any Content_Page produces LCP ≤2.5s and CLS ≤0.1, measured using the Lighthouse default simulated throttling profile.
10. THE Platform SHALL ensure that the total uncompressed page weight of any Content_Page does not exceed 1500 KB, with image assets not exceeding 1000 KB of that total, as measured by a browser network waterfall with cache disabled.

---

### Requirement 7: Analytics and Conversion Tracking

**User Story:** As the platform owner, I want detailed analytics on visitor behavior and WhatsApp CTA conversions, so that I can optimize the funnel and demonstrate ROI.

#### Acceptance Criteria

1. THE Analytics_Tracker SHALL capture and forward the following events to the configured analytics endpoint: `page_view`, `whatsapp_cta_click`, `age_gate_confirmed`, `age_gate_declined`, `geo_block_triggered`, and `content_page_scroll_depth` (at 25%, 50%, 75%, 100% thresholds).
2. WHEN a `whatsapp_cta_click` event is captured, THE Analytics_Tracker SHALL include the following properties: `page_url` (string), `cta_position` (one of: "hero", "sticky-footer", "inline"), `session_id` (string), `device_type` (one of: "mobile", "tablet", "desktop", derived from User-Agent), and `timestamp` (ISO 8601 UTC string).
3. THE Admin_Dashboard SHALL display a conversion analytics panel showing daily and 7-day rolling WhatsApp_CTA click counts, click-through rate by page (calculated as `whatsapp_cta_click` events divided by `page_view` events for the same page and period), and the top 10 Content_Pages ranked by `whatsapp_cta_click` count over the selected period.
4. THE Platform SHALL integrate with Google Analytics 4 (GA4) and forward all Analytics_Tracker events as GA4 custom events using the GA4 Measurement Protocol or gtag.js; IF GA4 integration is disabled in configuration, THEN events SHALL still be captured to the internal analytics endpoint.
5. WHEN a visitor completes the Conversion_Funnel (page_view → age_gate_confirmed → whatsapp_cta_click), THE Analytics_Tracker SHALL record a `conversion_complete` event with the full funnel path and time-to-convert in seconds.
6. THE Analytics_Tracker SHALL operate without blocking page rendering; all tracking calls SHALL be made asynchronously and SHALL NOT contribute to LCP or CLS metrics.
7. IF the analytics endpoint is unreachable, THEN THE Analytics_Tracker SHALL queue events in localStorage using a FIFO eviction policy (oldest event discarded first when the queue is full) and retry delivery at 30-second intervals when connectivity is restored, up to a maximum queue size of 50 events.
