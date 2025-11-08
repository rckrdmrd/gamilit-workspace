-- =====================================================================================
-- Migration: add-notification-priority
-- Date: 2025-11-08
-- Type: ENUM Migration + Column Addition
-- Schema: gamification_system
-- Table: notifications
-- =====================================================================================
--
-- DESCRIPTION:
-- Migrates notification_priority ENUM from public (4 values) to gamification_system (3 values)
-- and adds priority column to notifications table
--
-- CHANGES:
-- 1. Drop public.notification_priority (if exists) - had 4 values including 'critical' not in docs
-- 2. Create gamification_system.notification_priority with 3 values (low, medium, high)
-- 3. Add priority column to gamification_system.notifications with DEFAULT 'medium'
--
-- ALIGNMENT:
-- - Aligned with docs/02-especificaciones-tecnicas/trazabilidad/05-realtime-notifications.md
-- - Removed 'critical' value that was not in official specification
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
    v_gamification_enum_exists BOOLEAN;
    v_priority_column_exists BOOLEAN;
BEGIN
    -- Check if public.notification_priority exists
    SELECT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public' AND t.typname = 'notification_priority'
    ) INTO v_public_enum_exists;

    -- Check if gamification_system.notification_priority exists
    SELECT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'gamification_system' AND t.typname = 'notification_priority'
    ) INTO v_gamification_enum_exists;

    -- Check if priority column exists in notifications
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'gamification_system'
        AND table_name = 'notifications'
        AND column_name = 'priority'
    ) INTO v_priority_column_exists;

    RAISE NOTICE '=== PRE-VALIDATION ===';
    RAISE NOTICE 'public.notification_priority exists: %', v_public_enum_exists;
    RAISE NOTICE 'gamification_system.notification_priority exists: %', v_gamification_enum_exists;
    RAISE NOTICE 'notifications.priority column exists: %', v_priority_column_exists;
    RAISE NOTICE '=====================';

    -- Validation checks
    IF v_gamification_enum_exists THEN
        RAISE EXCEPTION 'Migration halted: gamification_system.notification_priority already exists. Please check if migration was already applied.';
    END IF;

    IF v_priority_column_exists THEN
        RAISE EXCEPTION 'Migration halted: notifications.priority column already exists. Please check if migration was already applied.';
    END IF;
END $$;

-- =====================================================================================
-- STEP 1: Drop public.notification_priority if exists
-- =====================================================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public' AND t.typname = 'notification_priority'
    ) THEN
        -- Check if it's being used by any table
        IF EXISTS (
            SELECT 1 FROM information_schema.columns c
            JOIN pg_type t ON c.udt_name = t.typname
            JOIN pg_namespace n ON t.typnamespace = n.oid
            WHERE n.nspname = 'public'
            AND t.typname = 'notification_priority'
        ) THEN
            RAISE EXCEPTION 'Cannot drop public.notification_priority: it is being used by one or more tables';
        END IF;

        DROP TYPE public.notification_priority;
        RAISE NOTICE 'Dropped public.notification_priority (had 4 values including ''critical'' not in docs)';
    ELSE
        RAISE NOTICE 'public.notification_priority does not exist, skipping drop';
    END IF;
END $$;

-- =====================================================================================
-- STEP 2: Create gamification_system.notification_priority ENUM (3 values)
-- =====================================================================================

CREATE TYPE gamification_system.notification_priority AS ENUM (
    'low',      -- Prioridad baja: Notificaciones informativas, sin urgencia
    'medium',   -- Prioridad media: Notificaciones estándar (DEFAULT)
    'high'      -- Prioridad alta: Notificaciones que requieren atención inmediata
);

COMMENT ON TYPE gamification_system.notification_priority IS
    'Prioridad de notificaciones (v1.0 - 2025-11-08). '
    'Define la urgencia de visualización: low (informativa), medium (estándar), high (urgente). '
    'Alineado con especificación oficial en 05-realtime-notifications.md.';

RAISE NOTICE 'Created gamification_system.notification_priority with 3 values (low, medium, high)';

-- =====================================================================================
-- STEP 3: Add priority column to notifications table
-- =====================================================================================

ALTER TABLE gamification_system.notifications
    ADD COLUMN priority gamification_system.notification_priority
    DEFAULT 'medium'::gamification_system.notification_priority
    NOT NULL;

COMMENT ON COLUMN gamification_system.notifications.priority IS
    'Notification priority using gamification_system.notification_priority ENUM (v1.0 - 3 levels): '
    'low (informational), medium (standard, DEFAULT), high (urgent). '
    'Aligns with 05-realtime-notifications.md specification.';

RAISE NOTICE 'Added priority column to gamification_system.notifications with DEFAULT ''medium''';

-- =====================================================================================
-- POST-VALIDATION: Verify changes
-- =====================================================================================

DO $$
DECLARE
    v_enum_values TEXT[];
    v_column_exists BOOLEAN;
    v_default_value TEXT;
    v_notifications_count BIGINT;
    v_medium_priority_count BIGINT;
BEGIN
    -- Check enum values
    SELECT ARRAY_AGG(enumlabel ORDER BY enumsortorder)
    INTO v_enum_values
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE n.nspname = 'gamification_system' AND t.typname = 'notification_priority';

    -- Check column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'gamification_system'
        AND table_name = 'notifications'
        AND column_name = 'priority'
    ) INTO v_column_exists;

    -- Check default value
    SELECT column_default INTO v_default_value
    FROM information_schema.columns
    WHERE table_schema = 'gamification_system'
    AND table_name = 'notifications'
    AND column_name = 'priority';

    -- Count notifications and verify all have 'medium' priority
    SELECT COUNT(*) INTO v_notifications_count
    FROM gamification_system.notifications;

    SELECT COUNT(*) INTO v_medium_priority_count
    FROM gamification_system.notifications
    WHERE priority = 'medium';

    RAISE NOTICE '=== POST-VALIDATION ===';
    RAISE NOTICE 'ENUM values: %', v_enum_values;
    RAISE NOTICE 'Expected: {low,medium,high}';
    RAISE NOTICE 'Column exists: %', v_column_exists;
    RAISE NOTICE 'Default value: %', v_default_value;
    RAISE NOTICE 'Total notifications: %', v_notifications_count;
    RAISE NOTICE 'Notifications with medium priority: %', v_medium_priority_count;
    RAISE NOTICE '======================';

    -- Validations
    IF NOT v_column_exists THEN
        RAISE EXCEPTION 'POST-VALIDATION FAILED: priority column was not created';
    END IF;

    IF v_enum_values != ARRAY['low', 'medium', 'high'] THEN
        RAISE EXCEPTION 'POST-VALIDATION FAILED: ENUM values do not match expected (low, medium, high)';
    END IF;

    IF v_default_value IS NULL OR v_default_value NOT LIKE '%medium%' THEN
        RAISE EXCEPTION 'POST-VALIDATION FAILED: Default value is not ''medium''';
    END IF;

    IF v_notifications_count != v_medium_priority_count THEN
        RAISE EXCEPTION 'POST-VALIDATION FAILED: Not all notifications have medium priority (expected %, got %)',
            v_notifications_count, v_medium_priority_count;
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
    RAISE NOTICE '1. Dropped public.notification_priority (if existed)';
    RAISE NOTICE '2. Created gamification_system.notification_priority (3 values)';
    RAISE NOTICE '3. Added priority column to notifications (DEFAULT ''medium'')';
    RAISE NOTICE '';
    RAISE NOTICE 'All existing notifications now have priority = ''medium''';
    RAISE NOTICE '=================================================';
END $$;

-- =====================================================================================
-- ROLLBACK SCRIPT
-- =====================================================================================
--
-- WARNING: This rollback will:
-- 1. Remove priority column from notifications (data loss)
-- 2. Drop gamification_system.notification_priority ENUM
-- 3. Optionally recreate public.notification_priority with 4 values
--
-- TO ROLLBACK THIS MIGRATION, RUN:
--
-- BEGIN;
--
-- -- Step 1: Remove priority column
-- ALTER TABLE gamification_system.notifications DROP COLUMN IF EXISTS priority;
--
-- -- Step 2: Drop ENUM
-- DROP TYPE IF EXISTS gamification_system.notification_priority;
--
-- -- Step 3: (Optional) Recreate public.notification_priority with 4 values
-- -- CREATE TYPE public.notification_priority AS ENUM (
-- --     'low',
-- --     'medium',
-- --     'high',
-- --     'critical'
-- -- );
--
-- COMMIT;
--
-- =====================================================================================
