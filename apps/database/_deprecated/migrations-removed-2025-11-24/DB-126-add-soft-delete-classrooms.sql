-- =====================================================
-- Migration: DB-126 - Add soft delete to classrooms
-- Description: Add is_deleted column to social_features.classrooms
-- Created: 2025-11-24
-- Gap: GAP-DB-003 (MINOR)
-- =====================================================
--
-- 📚 Documentación:
-- Requerimiento: orchestration/reportes/REPORTE-COHERENCIA-DATABASE-BACKEND-2025-11-24.md
-- Backend: apps/backend/src/modules/admin/services/admin-dashboard.service.ts:315
-- Epic: FE-051 Admin Portal Dashboard
--
-- =====================================================
-- PROBLEMA:
-- Backend query: WHERE is_deleted = FALSE
-- DDL actual: No tiene columna is_deleted (solo is_archived)
--
-- SOLUCIÓN:
-- Agregar columna is_deleted con default FALSE
-- Mantener is_archived para compatibilidad
-- =====================================================

SET search_path TO social_features, public;

-- =====================================================
-- ADD COLUMN
-- =====================================================

-- Add is_deleted column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'social_features'
          AND table_name = 'classrooms'
          AND column_name = 'is_deleted'
    ) THEN
        ALTER TABLE social_features.classrooms
        ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

        RAISE NOTICE 'Column is_deleted added to social_features.classrooms';
    ELSE
        RAISE NOTICE 'Column is_deleted already exists in social_features.classrooms';
    END IF;
END $$;

-- =====================================================
-- CREATE INDEX
-- =====================================================

-- Partial index for active (not deleted) classrooms
CREATE INDEX IF NOT EXISTS idx_classrooms_is_deleted
    ON social_features.classrooms(is_deleted)
    WHERE is_deleted = FALSE;

-- Composite index for common queries (tenant + not deleted)
CREATE INDEX IF NOT EXISTS idx_classrooms_tenant_not_deleted
    ON social_features.classrooms(tenant_id, is_deleted)
    WHERE is_deleted = FALSE;

-- =====================================================
-- UPDATE EXISTING RECORDS
-- =====================================================

-- Initialize is_deleted based on is_archived (if applicable)
-- Assumption: archived classrooms might be considered soft-deleted
-- Adjust this logic based on business requirements

DO $$
BEGIN
    -- If you want archived classrooms to be marked as deleted:
    -- UPDATE social_features.classrooms
    -- SET is_deleted = is_archived
    -- WHERE is_deleted = FALSE AND is_archived = TRUE;

    -- For now, keep all existing classrooms as NOT deleted (is_deleted = FALSE)
    -- This is already the default, so no UPDATE needed
    RAISE NOTICE 'All existing classrooms kept as is_deleted = FALSE';
END $$;

-- =====================================================
-- ADD COMMENT
-- =====================================================

COMMENT ON COLUMN social_features.classrooms.is_deleted IS
    'Soft delete flag. TRUE = classroom has been deleted (hidden from UI). Use this instead of hard delete for audit trail.';

-- =====================================================
-- GRANTS
-- =====================================================

-- No additional grants needed (inherits from table)

-- =====================================================
-- BACKEND USAGE
-- =====================================================

-- This column is used by:
-- apps/backend/src/modules/admin/services/admin-dashboard.service.ts:314-316
--
-- Query Example (from backend):
-- SELECT COUNT(*) as count
-- FROM social_features.classrooms
-- WHERE is_deleted = FALSE;
--
-- =====================================================
-- MIGRATION NOTES
-- =====================================================

-- Gap Resolved: GAP-DB-003 (MINOR)
-- Date: 2025-11-24
-- Issue: Backend expected is_deleted column but it didn't exist
-- Solution: Added is_deleted column with appropriate indexes
--
-- DESIGN DECISIONS:
-- 1. Kept is_archived for backward compatibility
--    - is_archived: Classroom ended/no longer active (can be unarchived)
--    - is_deleted: Classroom soft-deleted (should not appear in lists)
--
-- 2. Default value: FALSE (no classrooms deleted by default)
--
-- 3. Partial index WHERE is_deleted = FALSE for performance
--    - Most queries filter for active (not deleted) classrooms
--
-- ROLLBACK:
-- If needed, rollback with:
-- DROP INDEX IF EXISTS idx_classrooms_is_deleted;
-- DROP INDEX IF EXISTS idx_classrooms_tenant_not_deleted;
-- ALTER TABLE social_features.classrooms DROP COLUMN IF EXISTS is_deleted;
--
-- =====================================================
-- VALIDATION QUERIES
-- =====================================================

-- Verify column was added
DO $$
DECLARE
    col_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'social_features'
          AND table_name = 'classrooms'
          AND column_name = 'is_deleted'
    ) INTO col_exists;

    IF col_exists THEN
        RAISE NOTICE '✅ Migration DB-126 successful: is_deleted column exists';
    ELSE
        RAISE EXCEPTION '❌ Migration DB-126 failed: is_deleted column not found';
    END IF;
END $$;

-- Show statistics
SELECT
    COUNT(*) as total_classrooms,
    COUNT(*) FILTER (WHERE is_deleted = FALSE) as active_classrooms,
    COUNT(*) FILTER (WHERE is_deleted = TRUE) as deleted_classrooms,
    COUNT(*) FILTER (WHERE is_archived = TRUE) as archived_classrooms
FROM social_features.classrooms;

-- =====================================================
