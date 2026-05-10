-- ============================================================
-- Migration 001: Initial Schema
-- ReddyExch Commercial Gaming Platform
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- content_pages
-- ============================================================
CREATE TABLE IF NOT EXISTS content_pages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  page_type       TEXT NOT NULL DEFAULT 'content'
                    CHECK (page_type IN ('keyword_landing', 'content', 'pillar')),
  title           TEXT NOT NULL CHECK (char_length(title) BETWEEN 10 AND 60),
  meta_desc       TEXT NOT NULL CHECK (char_length(meta_desc) BETWEEN 50 AND 160),
  h1              TEXT NOT NULL,
  body_html       TEXT NOT NULL DEFAULT '',
  body_raw        TEXT NOT NULL DEFAULT '',
  target_keyword  TEXT NOT NULL DEFAULT '',
  language        TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi', 'hin')),
  locale_variants JSONB,
  pillar_id       UUID REFERENCES content_pages(id),
  status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','scheduled','published','unpublished')),
  scheduled_at    TIMESTAMPTZ,
  published_at    TIMESTAMPTZ,
  word_count      INTEGER GENERATED ALWAYS AS (
                    COALESCE(array_length(regexp_split_to_array(trim(body_raw), '\s+'), 1), 0)
                  ) STORED,
  seo_score       INTEGER CHECK (seo_score BETWEEN 0 AND 100),
  has_faq         BOOLEAN NOT NULL DEFAULT false,
  has_howto       BOOLEAN NOT NULL DEFAULT false,
  faq_items       JSONB,
  howto_steps     JSONB,
  internal_links  INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- keyword_registry
-- ============================================================
CREATE TABLE IF NOT EXISTS keyword_registry (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword         TEXT UNIQUE NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  tier            TEXT NOT NULL CHECK (tier IN ('primary', 'secondary', 'long_tail')),
  pillar_slug     TEXT REFERENCES keyword_registry(slug),
  anchor_title    TEXT,
  synonyms        TEXT[] DEFAULT '{}',
  page_id         UUID REFERENCES content_pages(id),
  inbound_link_count INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_keyword_registry_slug ON keyword_registry(slug);
CREATE INDEX IF NOT EXISTS idx_keyword_registry_tier ON keyword_registry(tier);

-- ============================================================
-- media_assets
-- ============================================================
CREATE TABLE IF NOT EXISTS media_assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_name   TEXT NOT NULL,
  webp_url        TEXT NOT NULL,
  original_url    TEXT,
  file_size_kb    INTEGER NOT NULL,
  width           INTEGER,
  height          INTEGER,
  uploaded_by     UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- analytics_events (append-only)
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id              BIGSERIAL PRIMARY KEY,
  event           TEXT NOT NULL,
  page_url        TEXT NOT NULL,
  session_id      TEXT NOT NULL,
  device_type     TEXT CHECK (device_type IN ('mobile','tablet','desktop')),
  cta_position    TEXT CHECK (cta_position IN ('hero','sticky-footer','inline')),
  scroll_depth    INTEGER CHECK (scroll_depth IN (25, 50, 75, 100)),
  funnel_path     TEXT[],
  time_to_convert INTEGER,
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_properties  JSONB
  -- NO IP addresses stored — compliance requirement
);

CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON analytics_events(event);
CREATE INDEX IF NOT EXISTS idx_analytics_page_url   ON analytics_events(page_url);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp  ON analytics_events(timestamp DESC);

-- ============================================================
-- blocked_jurisdictions (country + state level)
-- ============================================================
CREATE TABLE IF NOT EXISTS blocked_jurisdictions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code    CHAR(2) NOT NULL,
  region_code     TEXT,
  reason          TEXT,
  added_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (country_code, region_code)
);

-- ============================================================
-- platform_config (key-value)
-- ============================================================
CREATE TABLE IF NOT EXISTS platform_config (
  key             TEXT PRIMARY KEY,
  value           TEXT NOT NULL,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- seo_metrics (rank tracking history)
-- ============================================================
CREATE TABLE IF NOT EXISTS seo_metrics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id      UUID NOT NULL REFERENCES keyword_registry(id),
  position        INTEGER NOT NULL CHECK (position >= 0),
  source          TEXT NOT NULL CHECK (source IN ('api', 'manual')),
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seo_metrics_keyword_id  ON seo_metrics(keyword_id);
CREATE INDEX IF NOT EXISTS idx_seo_metrics_recorded_at ON seo_metrics(recorded_at DESC);

-- ============================================================
-- compliance_logs (append-only audit log — NO PII)
-- ============================================================
CREATE TABLE IF NOT EXISTS compliance_logs (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id),
  action          TEXT NOT NULL CHECK (action IN (
                    'create','edit','publish','unpublish','delete','config_change',
                    'age_gate_confirmed','age_gate_declined','geo_block_triggered',
                    'compliance_export'
                  )),
  resource_type   TEXT NOT NULL CHECK (resource_type IN (
                    'article','keyword','widget_config','session','export'
                  )),
  resource_id     TEXT NOT NULL,
  before_state    JSONB,
  after_state     JSONB,
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT now()
  -- NO IP addresses in before_state or after_state
);

CREATE INDEX IF NOT EXISTS idx_compliance_logs_user_id   ON compliance_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_logs_action    ON compliance_logs(action);
CREATE INDEX IF NOT EXISTS idx_compliance_logs_timestamp ON compliance_logs(timestamp DESC);

-- ============================================================
-- conversion_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS conversion_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      TEXT NOT NULL,
  page_url        TEXT NOT NULL,
  cta_variant     TEXT,
  device_type     TEXT CHECK (device_type IN ('mobile','tablet','desktop')),
  funnel_path     TEXT[],
  time_to_convert INTEGER,
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversion_logs_session_id ON conversion_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_conversion_logs_timestamp  ON conversion_logs(timestamp DESC);

-- ============================================================
-- widget_configs
-- ============================================================
CREATE TABLE IF NOT EXISTS widget_configs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_type     TEXT NOT NULL CHECK (widget_type IN ('crictime','instagram','whatsapp_ab')),
  config          JSONB NOT NULL DEFAULT '{}',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  updated_by      UUID REFERENCES auth.users(id),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
