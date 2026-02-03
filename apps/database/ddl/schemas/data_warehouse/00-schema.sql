-- =====================================================
-- Schema: data_warehouse
-- Description: Data Warehouse schema for GAMILIT analytics and reporting
-- Purpose: Dimensional model (Star Schema) for student performance,
--          exercise completion, gamification metrics, and teacher insights
-- Created: 2026-02-03
-- Sprint: 2.1 - Data Warehouse Design
-- =====================================================

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

-- =====================================================
-- CREATE SCHEMA
-- =====================================================
DROP SCHEMA IF EXISTS data_warehouse CASCADE;
CREATE SCHEMA IF NOT EXISTS data_warehouse;

-- =====================================================
-- SCHEMA OWNERSHIP AND PERMISSIONS
-- =====================================================
ALTER SCHEMA data_warehouse OWNER TO gamilit_user;

GRANT USAGE ON SCHEMA data_warehouse TO gamilit_user;
GRANT ALL ON ALL TABLES IN SCHEMA data_warehouse TO gamilit_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA data_warehouse TO gamilit_user;

-- =====================================================
-- SCHEMA COMMENTS
-- =====================================================
COMMENT ON SCHEMA data_warehouse IS
'Data Warehouse schema for GAMILIT analytics - Star Schema design with:
- 4 Fact Tables: exercise_completions, daily_progress, gamification_events, teacher_metrics
- 8 Dimension Tables: date, time, student (SCD2), exercise, module, teacher, achievement, event_type
- Source schemas: educational_content, progress_tracking, gamification_system, social_features, auth_management
- Purpose: Analytics, reporting, dashboards, and business intelligence';

-- =====================================================
-- SET DEFAULT SEARCH PATH
-- =====================================================
-- Note: This sets the default path for subsequent DDL operations
SET search_path TO data_warehouse, public;
