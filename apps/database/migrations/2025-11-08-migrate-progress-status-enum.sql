-- =====================================================================================
-- Migration: migrate-progress-status-enum
-- Date: 2025-11-08
-- Type: ENUM Migration
-- Schema: progress_tracking (source: public)
-- Tables: module_progress (progress_tracking)
-- =====================================================================================
--
-- DESCRIPTION:
-- Migrates progress_status ENUM from public to progress_tracking schema
-- and updates module_progress table to reference the new schema
--
-- COMPLEXITY: BAJA - Migración estándar de ENUM single-tabla
--
-- CHANGES:
-- 1. Create progress_tracking.progress_status with 5 values
-- 2. ALTER TABLE module_progress.status to use new schema
-- 3. Drop public.progress_status (if not used by other tables)
--
-- ALIGNMENT:
-- - FASE 1 - Sprint 1 - PLAN-MIGRACION-ENUMS-FASE1.md
-- - Migración P1 ALTA - Complejidad BAJA
--
-- ESTIMATED TIME: 1-2 seconds
--
-- ROLLBACK: See section at bottom
--
-- =====================================================================================

-- =====================================================================================
-- PRE-VALIDATION: Check current state
-- =====================================================================================

DO $$
DECLARE
    v_public_enum_exists BOOLEAN;
    v_progress_enum_exists BOOLEAN;
    v_module_progress_count BIGINT;
    v_enum_values TEXT[];
BEGIN
    -- Check if public.progress_status exists
    SELECT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public' AND t.typname = 'progress_status'
    ) INTO v_public_enum_exists;

    -- Check if progress_tracking.progress_status exists
    SELECT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'progress_tracking' AND t.typname = 'progress_status'
    ) INTO v_progress_enum_exists;

    -- Count module_progress records
    SELECT COUNT(*) INTO v_module_progress_count FROM progress_tracking.module_progress;

    -- Get current enum values
    SELECT ARRAY_AGG(enumlabel ORDER BY enumsortorder)
    INTO v_enum_values
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE n.nspname = 'public' AND t.typname = 'progress_status';

    RAISE NOTICE '=== PRE-VALIDATION ===';
    RAISE NOTICE 'public.progress_status exists: %', v_public_enum_exists;
    RAISE NOTICE 'progress_tracking.progress_status exists: %', v_progress_enum_exists;
    RAISE NOTICE 'Current enum values: %', v_enum_values;
    RAISE NOTICE 'Total module_progress records: %', v_module_progress_count;
    RAISE NOTICE '=====================';

    -- Validation checks
    IF v_progress_enum_exists THEN
        RAISE EXCEPTION 'Migration halted: progress_tracking.progress_status already exists. Please check if migration was already applied.';
    END IF;

    IF NOT v_public_enum_exists THEN
        RAISE EXCEPTION 'Migration halted: public.progress_status does not exist. Cannot migrate.';
    END IF;
END $$;

-- =====================================================================================
-- STEP 1: Create progress_tracking.progress_status ENUM (5 values)
-- =====================================================================================

CREATE TYPE progress_tracking.progress_status AS ENUM (
    'not_started',  -- Sin iniciar
    'in_progress',  -- En progreso
    'completed',    -- Completado
    'reviewed',     -- Revisado
    'mastered'      -- Dominado
);

COMMENT ON TYPE progress_tracking.progress_status IS
    'Estados de progreso para módulos y ejercicios en el sistema de tracking (v1.0 - 2025-11-08). '
    'Define 5 estados que representan el ciclo completo de aprendizaje desde inicio hasta maestría. '
    'Migrado de public schema. Usado en module_progress.';

RAISE NOTICE 'Created progress_tracking.progress_status with 5 values';

-- =====================================================================================
-- STEP 2: Migrate progress_tracking.module_progress.status
-- =====================================================================================

ALTER TABLE progress_tracking.module_progress
    ALTER COLUMN status TYPE progress_tracking.progress_status
    USING status::text::progress_tracking.progress_status;

ALTER TABLE progress_tracking.module_progress
    ALTER COLUMN status SET DEFAULT 'not_started'::progress_tracking.progress_status;

RAISE NOTICE 'Migrated module_progress.status to progress_tracking.progress_status';

-- =====================================================================================
-- STEP 3: Drop public.progress_status (if not used by other tables)
-- =====================================================================================

DO $$
BEGIN
    -- Check if public.progress_status is used by any other table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns c
        JOIN pg_type t ON c.udt_name = t.typname
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public'
        AND t.typname = 'progress_status'
        AND NOT (c.table_schema = 'progress_tracking' AND c.table_name = 'module_progress')
    ) THEN
        RAISE NOTICE 'WARNING: public.progress_status is still used by other tables. NOT dropping.';
    ELSE
        DROP TYPE public.progress_status;
        RAISE NOTICE 'Dropped public.progress_status (no other tables using it)';
    END IF;
END $$;

-- =====================================================================================
-- POST-VALIDATION: Verify changes
-- =====================================================================================

DO $$
DECLARE
    v_enum_values TEXT[];
    v_module_progress_using_new BOOLEAN;
    v_module_progress_count BIGINT;
    v_status_distribution RECORD;
BEGIN
    -- Check enum values
    SELECT ARRAY_AGG(enumlabel ORDER BY enumsortorder)
    INTO v_enum_values
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE n.nspname = 'progress_tracking' AND t.typname = 'progress_status';

    -- Check module_progress uses new type
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'progress_tracking'
        AND table_name = 'module_progress'
        AND column_name = 'status'
        AND udt_schema = 'progress_tracking'
    ) INTO v_module_progress_using_new;

    -- Count records
    SELECT COUNT(*) INTO v_module_progress_count FROM progress_tracking.module_progress;

    RAISE NOTICE '=== POST-VALIDATION ===';
    RAISE NOTICE 'ENUM values: %', v_enum_values;
    RAISE NOTICE 'Expected: {not_started,in_progress,completed,reviewed,mastered}';
    RAISE NOTICE 'module_progress uses new type: %', v_module_progress_using_new;
    RAISE NOTICE 'Total module_progress records: %', v_module_progress_count;
    RAISE NOTICE '======================';

    -- Validations
    IF v_enum_values != ARRAY['not_started', 'in_progress', 'completed', 'reviewed', 'mastered'] THEN
        RAISE EXCEPTION 'POST-VALIDATION FAILED: ENUM values do not match expected';
    END IF;

    IF NOT v_module_progress_using_new THEN
        RAISE EXCEPTION 'POST-VALIDATION FAILED: module_progress.status is not using progress_tracking.progress_status';
    END IF;

    RAISE NOTICE '✅ POST-VALIDATION PASSED: All checks successful';
END $$;

-- =====================================================================================
-- SUMMARY
-- =====================================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'MIGRATION COMPLETED SUCCESSFULLY';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Changes applied:';
    RAISE NOTICE '1. Created progress_tracking.progress_status (5 values)';
    RAISE NOTICE '2. Migrated module_progress.status to new schema';
    RAISE NOTICE '3. Dropped public.progress_status (if not used elsewhere)';
    RAISE NOTICE '';
    RAISE NOTICE 'All progress tracking now uses progress_tracking.progress_status';
    RAISE NOTICE '=================================================';
END $$;

-- =====================================================================================
-- ROLLBACK SCRIPT
-- =====================================================================================
--
-- WARNING: This rollback will:
-- 1. Recreate public.progress_status
-- 2. Convert module_progress back to public schema
-- 3. Drop progress_tracking.progress_status
--
-- TO ROLLBACK THIS MIGRATION, RUN:
--
-- BEGIN;
--
-- -- Step 1: Recreate public.progress_status
-- CREATE TYPE public.progress_status AS ENUM (
--     'not_started',
--     'in_progress',
--     'completed',
--     'reviewed',
--     'mastered'
-- );
--
-- -- Step 2: Convert module_progress back
-- ALTER TABLE progress_tracking.module_progress
--     ALTER COLUMN status TYPE public.progress_status
--     USING status::text::public.progress_status;
--
-- ALTER TABLE progress_tracking.module_progress
--     ALTER COLUMN status SET DEFAULT 'not_started'::public.progress_status;
--
-- -- Step 3: Drop progress_tracking.progress_status
-- DROP TYPE IF EXISTS progress_tracking.progress_status;
--
-- COMMIT;
--
-- =====================================================================================
