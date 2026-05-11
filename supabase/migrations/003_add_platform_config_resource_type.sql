-- Migration 003: Add platform_config to compliance_logs resource_type constraint
-- Run this in Supabase SQL Editor

ALTER TABLE compliance_logs
  DROP CONSTRAINT IF EXISTS compliance_logs_resource_type_check;

ALTER TABLE compliance_logs
  ADD CONSTRAINT compliance_logs_resource_type_check
  CHECK (resource_type IN (
    'article', 'keyword', 'widget_config', 'platform_config', 'session', 'export'
  ));
