-- =====================================================
-- OPTIONAL MIGRATION: Consolidate comodin_usage_log INTO comodin_uses
-- =====================================================
-- Status: NOT REQUIRED - Provided for future reference only
--
-- This migration would merge comodin_usage_log into comodin_uses
-- and update the mission trigger. Only execute if decided to
-- reduce redundancy between these two similar tables.
--
-- Task: TASK-2026-02-03-CONSOLIDATION-COMODIN-TABLES
-- Option: B (Alternative - not recommended for now)
--
-- PREREQUISITES:
-- 1. Full database backup
-- 2. Application downtime or read-only mode
-- 3. Verification of all dependent code
--
-- ROLLBACK: See ROLLBACK section at bottom
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: Add missing columns to comodin_uses
-- =====================================================
-- comodin_usage_log has module_id and usage_context that
-- comodin_uses lacks

ALTER TABLE gamification_system.comodin_uses
ADD COLUMN IF NOT EXISTS module_id UUID;

ALTER TABLE gamification_system.comodin_uses
ADD COLUMN IF NOT EXISTS usage_context JSONB DEFAULT '{}';

COMMENT ON COLUMN gamification_system.comodin_uses.module_id IS
    'Module where comodin was used (migrated from comodin_usage_log)';

COMMENT ON COLUMN gamification_system.comodin_uses.usage_context IS
    'Additional context: time remaining, prior attempts, etc. (migrated from comodin_usage_log)';

-- =====================================================
-- STEP 2: Migrate existing data from comodin_usage_log
-- =====================================================
-- Note: comodin_uses does NOT have UNIQUE constraint, so all
-- records will be inserted even if duplicates exist

INSERT INTO gamification_system.comodin_uses (
    user_id,
    comodin_type,
    exercise_id,
    attempt_id,
    effect_applied,
    value_provided,
    module_id,
    usage_context,
    consumed_at,
    created_at
)
SELECT
    user_id,
    comodin_type,
    exercise_id,
    attempt_id,
    effect_applied,
    value_provided,
    module_id,
    usage_context,
    used_at,  -- maps to consumed_at
    used_at   -- maps to created_at
FROM gamification_system.comodin_usage_log
WHERE NOT EXISTS (
    -- Avoid duplicates based on business key
    SELECT 1 FROM gamification_system.comodin_uses cu
    WHERE cu.user_id = comodin_usage_log.user_id
      AND cu.exercise_id = comodin_usage_log.exercise_id
      AND cu.attempt_id = comodin_usage_log.attempt_id
      AND cu.comodin_type = comodin_usage_log.comodin_type
      AND cu.consumed_at = comodin_usage_log.used_at
);

-- Report migration count
DO $$
DECLARE
    v_migrated INTEGER;
BEGIN
    GET DIAGNOSTICS v_migrated = ROW_COUNT;
    RAISE NOTICE 'Migrated % records from comodin_usage_log to comodin_uses', v_migrated;
END $$;

-- =====================================================
-- STEP 3: Update mission trigger to use comodin_uses
-- =====================================================
-- Drop old trigger
DROP TRIGGER IF EXISTS trg_update_missions_on_use_comodines
    ON gamification_system.comodin_usage_log;

-- Create new trigger on comodin_uses
CREATE TRIGGER trg_update_missions_on_use_comodines
    AFTER INSERT ON gamification_system.comodin_uses
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.trigger_missions_on_use_comodines();

COMMENT ON TRIGGER trg_update_missions_on_use_comodines ON gamification_system.comodin_uses IS
    'Triggers mission progress update for use_comodines objectives (migrated from comodin_usage_log)';

-- =====================================================
-- STEP 4: Create backwards-compatible view
-- =====================================================
-- This allows existing queries against comodin_usage_log to continue working

CREATE OR REPLACE VIEW gamification_system.comodin_usage_log_v AS
SELECT
    id,
    user_id,
    comodin_type,
    exercise_id,
    attempt_id,
    module_id,
    effect_applied,
    value_provided,
    usage_context,
    consumed_at AS used_at,
    created_at AS used_at_alias
FROM gamification_system.comodin_uses;

COMMENT ON VIEW gamification_system.comodin_usage_log_v IS
    'DEPRECATED: Backwards-compatible view for comodin_usage_log. Use comodin_uses directly.';

-- Grant same permissions as original table
GRANT SELECT ON gamification_system.comodin_usage_log_v TO authenticated;
GRANT SELECT ON gamification_system.comodin_usage_log_v TO gamilit_user;

-- =====================================================
-- STEP 5: Deprecate original table (DO NOT DROP YET)
-- =====================================================
-- Add deprecation notice - keep table for rollback capability

COMMENT ON TABLE gamification_system.comodin_usage_log IS
    'DEPRECATED: Data migrated to comodin_uses. This table will be removed after verification period. Use comodin_uses or comodin_usage_log_v view.';

-- Disable inserts to prevent new data in deprecated table
-- Note: This uses a trigger since we can't REVOKE INSERT easily with RLS
CREATE OR REPLACE FUNCTION gamification_system.block_deprecated_comodin_usage_log()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'comodin_usage_log is DEPRECATED. Insert into comodin_uses instead.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_block_comodin_usage_log_insert
    BEFORE INSERT ON gamification_system.comodin_usage_log
    FOR EACH ROW
    EXECUTE FUNCTION gamification_system.block_deprecated_comodin_usage_log();

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these after migration to verify success

/*
-- Check record counts match
SELECT
    'comodin_usage_log' as table_name,
    COUNT(*) as record_count
FROM gamification_system.comodin_usage_log
UNION ALL
SELECT
    'comodin_uses (original)',
    (SELECT COUNT(*) FROM gamification_system.comodin_uses WHERE module_id IS NULL)
UNION ALL
SELECT
    'comodin_uses (migrated)',
    (SELECT COUNT(*) FROM gamification_system.comodin_uses WHERE module_id IS NOT NULL);

-- Verify trigger exists on new table
SELECT tgname, tgrelid::regclass
FROM pg_trigger
WHERE tgname = 'trg_update_missions_on_use_comodines';

-- Test view works
SELECT COUNT(*) FROM gamification_system.comodin_usage_log_v;
*/

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================
/*
BEGIN;

-- Remove block trigger
DROP TRIGGER IF EXISTS trg_block_comodin_usage_log_insert
    ON gamification_system.comodin_usage_log;
DROP FUNCTION IF EXISTS gamification_system.block_deprecated_comodin_usage_log();

-- Restore original trigger
DROP TRIGGER IF EXISTS trg_update_missions_on_use_comodines
    ON gamification_system.comodin_uses;

CREATE TRIGGER trg_update_missions_on_use_comodines
    AFTER INSERT ON gamification_system.comodin_usage_log
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.trigger_missions_on_use_comodines();

-- Drop view
DROP VIEW IF EXISTS gamification_system.comodin_usage_log_v;

-- Remove added columns from comodin_uses
ALTER TABLE gamification_system.comodin_uses DROP COLUMN IF EXISTS module_id;
ALTER TABLE gamification_system.comodin_uses DROP COLUMN IF EXISTS usage_context;

-- Delete migrated records (careful!)
DELETE FROM gamification_system.comodin_uses
WHERE module_id IS NOT NULL OR usage_context IS NOT NULL;

-- Restore original comment
COMMENT ON TABLE gamification_system.comodin_usage_log IS
    'Log historico de uso de comodines con contexto completo';

COMMIT;
*/

-- =====================================================
-- FINAL CLEANUP (Execute 30 days after migration)
-- =====================================================
/*
-- Only execute after verifying all systems work correctly

BEGIN;

-- Drop deprecated table
DROP TABLE gamification_system.comodin_usage_log CASCADE;

-- Drop backwards-compatible view (optional, keep for legacy support)
-- DROP VIEW IF EXISTS gamification_system.comodin_usage_log_v;

COMMIT;
*/
