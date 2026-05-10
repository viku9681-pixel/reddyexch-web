# ReddyExch — Commercial Gaming Platform

Premium, high-conversion, SEO-dominant gaming ID platform for Indian cricket and sports gaming enthusiasts.

**Domain:** reddyexchgaming.com  
**Stack:** Next.js 14 (App Router) · Supabase · Vercel · Tailwind CSS  
**Status:** Spec complete — implementation in progress

## Branch Structure

| Branch | Purpose | Deployment |
|---|---|---|
| `main` | Production | Vercel production |
| `staging` | Pre-production QA | Vercel staging preview |
| `develop` | Active development | Vercel preview per PR |

## Spec

Full requirements, technical design, and 132-task implementation plan in `.kiro/specs/reddyexch-platform-revamp/`.

| File | Contents |
|---|---|
| `requirements.md` | 8 requirements, 100+ acceptance criteria (India Online Gaming Rules 2026 compliant) |
| `design.md` | Architecture, DB schema, component hierarchy, SEO architecture, security spec |
| `tasks.md` | 132 tasks across 13 phases |

## Quick Start

```bash
# Install dependencies (once Next.js project is scaffolded — Task 1)
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build
npm run build
```

## Compliance

- India Online Gaming Rules 2026 compliant
- 18+ Age Gate (server-side rendered)
- State-level geo-blocking: Telangana (IN-TG), Andhra Pradesh (IN-AP)
- AIGF guidelines referenced
- No "betting" language — uses "gaming ID", "sports prediction", "fantasy participation"

## Security

- Supabase RLS on all tables
- HTTPS enforced, CSP headers with per-request nonce
- HttpOnly; Secure; SameSite=Strict cookies
- Rate-limited APIs (Vercel KV)
- No PII in logs or analytics
