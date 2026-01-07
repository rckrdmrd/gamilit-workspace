-- ============================================================================
-- VALIDATION: Ensure module_progress records exist for all users
-- ============================================================================
-- ID: VAL-MODULE-PROGRESS-001
-- Description: Validates and creates module_progress records using the
--              gamilit.initialize_module_progress_for_users() function.
--
-- Usage (standalone):
--   psql -h localhost -U gamilit_app -d gamilit_db -f fix-missing-module-progress.sql
--
-- Usage (in create-database.sh):
--   Automatically called in FASE 17: VALIDACIONES POST-SEEDS
--
-- Safe to run multiple times (idempotent via ON CONFLICT DO NOTHING)
--
-- Architecture:
--   This script calls gamilit.initialize_module_progress_for_users(NULL)
--   which creates records for ALL published modules and ALL eligible users.
--
-- Related Objects:
--   - Function: gamilit.initialize_module_progress_for_users()
--   - Trigger: trg_initialize_user_stats (on profiles - for new users)
--   - Trigger: trg_initialize_module_progress (on modules - for new modules)
-- ============================================================================

BEGIN;

-- Log start
DO $$ BEGIN
    RAISE NOTICE '============================================================';
    RAISE NOTICE '[VAL-MODULE-PROGRESS-001] Starting validation...';
    RAISE NOTICE '============================================================';
END $$;

-- Count records before
DO $$
DECLARE
    v_before_count INTEGER;
    v_user_count INTEGER;
    v_module_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_before_count FROM progress_tracking.module_progress;
    SELECT COUNT(*) INTO v_user_count
    FROM auth_management.profiles
    WHERE role IN ('student', 'admin_teacher', 'super_admin');
    SELECT COUNT(*) INTO v_module_count
    FROM educational_content.modules
    WHERE is_published = true AND status = 'published';

    RAISE NOTICE '[VAL] Current state:';
    RAISE NOTICE '  - module_progress records: %', v_before_count;
    RAISE NOTICE '  - Eligible users: %', v_user_count;
    RAISE NOTICE '  - Published modules: %', v_module_count;
    RAISE NOTICE '  - Expected records: %', v_user_count * v_module_count;
    RAISE NOTICE '  - Missing records: %', (v_user_count * v_module_count) - v_before_count;
END $$;

-- Call the initialization function for ALL modules (NULL = all)
DO $$
DECLARE
    v_records_created INTEGER;
BEGIN
    SELECT gamilit.initialize_module_progress_for_users(NULL) INTO v_records_created;
    RAISE NOTICE '[VAL] Records created by initialize_module_progress_for_users: %', v_records_created;
END $$;

-- Count records after
DO $$
DECLARE
    v_after_count INTEGER;
    v_user_count INTEGER;
    v_module_count INTEGER;
    v_expected INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_after_count FROM progress_tracking.module_progress;
    SELECT COUNT(*) INTO v_user_count
    FROM auth_management.profiles
    WHERE role IN ('student', 'admin_teacher', 'super_admin');
    SELECT COUNT(*) INTO v_module_count
    FROM educational_content.modules
    WHERE is_published = true AND status = 'published';

    v_expected := v_user_count * v_module_count;

    RAISE NOTICE '';
    RAISE NOTICE '[VAL] Final state:';
    RAISE NOTICE '  - module_progress records: %', v_after_count;
    RAISE NOTICE '  - Expected: %', v_expected;

    IF v_after_count >= v_expected THEN
        RAISE NOTICE '  - Status: OK - All records exist';
    ELSE
        RAISE WARNING '  - Status: WARNING - Missing % records', v_expected - v_after_count;
    END IF;
END $$;

COMMIT;

-- Summary
DO $$ BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================================';
    RAISE NOTICE '[VAL-MODULE-PROGRESS-001] Validation completed';
    RAISE NOTICE '============================================================';
END $$;
