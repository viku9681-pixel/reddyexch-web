-- ============================================================
-- Migration 002: Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE content_pages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_registry     ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets         ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events     ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_config      ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_metrics          ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_configs       ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- content_pages
-- ============================================================
CREATE POLICY "Public read published pages" ON content_pages
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated full access" ON content_pages
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- keyword_registry
-- ============================================================
CREATE POLICY "Public read keywords" ON keyword_registry
  FOR SELECT USING (true);

CREATE POLICY "Authenticated manage keywords" ON keyword_registry
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- media_assets
-- ============================================================
CREATE POLICY "Authenticated manage media" ON media_assets
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- analytics_events — no direct client access
-- ============================================================
CREATE POLICY "No direct client access to analytics" ON analytics_events
  FOR ALL USING (false);

-- ============================================================
-- blocked_jurisdictions
-- ============================================================
CREATE POLICY "Public read blocked jurisdictions" ON blocked_jurisdictions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated manage blocked jurisdictions" ON blocked_jurisdictions
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- platform_config
-- ============================================================
CREATE POLICY "Public read platform config" ON platform_config
  FOR SELECT USING (true);

CREATE POLICY "Authenticated manage platform config" ON platform_config
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- seo_metrics
-- ============================================================
CREATE POLICY "Authenticated read seo_metrics" ON seo_metrics
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated insert seo_metrics" ON seo_metrics
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- No UPDATE or DELETE on seo_metrics

-- ============================================================
-- compliance_logs — APPEND ONLY, NO UPDATE/DELETE
-- ============================================================
CREATE POLICY "Insert compliance_logs" ON compliance_logs
  FOR INSERT WITH CHECK (true);  -- service role inserts visitor events

CREATE POLICY "Authenticated read compliance_logs" ON compliance_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "No update compliance_logs" ON compliance_logs
  FOR UPDATE USING (false);

CREATE POLICY "No delete compliance_logs" ON compliance_logs
  FOR DELETE USING (false);

-- ============================================================
-- conversion_logs — no direct client access
-- ============================================================
CREATE POLICY "No direct client access to conversion_logs" ON conversion_logs
  FOR ALL USING (false);

-- ============================================================
-- widget_configs
-- ============================================================
CREATE POLICY "Authenticated read widget_configs" ON widget_configs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admin-only write (role stored in user metadata)
CREATE POLICY "Admin manage widget_configs" ON widget_configs
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
