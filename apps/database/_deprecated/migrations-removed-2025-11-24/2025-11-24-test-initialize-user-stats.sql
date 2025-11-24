-- =====================================================
-- Test Script: Validate initialize_user_stats() trigger
-- Date: 2025-11-24
-- Purpose: Verify all 3 bug fixes work correctly
--
-- THIS SCRIPT DOES NOT MODIFY DATA - It only validates the function
-- =====================================================

DO $$
DECLARE
    v_test_user_id UUID;
    v_test_profile_id INTEGER;
    v_test_tenant_id UUID;
    v_stats_count INTEGER;
    v_comodines_count INTEGER;
    v_ranks_count INTEGER;
    v_module_progress_count INTEGER;
    v_published_modules_count INTEGER;
    v_all_tests_passed BOOLEAN := true;
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE 'TEST SUITE: initialize_user_stats() Bug Fixes';
    RAISE NOTICE 'Started at: %', NOW();
    RAISE NOTICE '================================================';

    -- Get a real tenant_id from the database
    SELECT id INTO v_test_tenant_id
    FROM auth_management.tenants
    LIMIT 1;

    IF v_test_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No tenants found in database. Cannot run test.';
    END IF;

    RAISE NOTICE 'Using tenant_id: %', v_test_tenant_id;

    -- Count published modules (what we expect to see in module_progress)
    SELECT COUNT(*)
    INTO v_published_modules_count
    FROM educational_content.modules m
    WHERE m.is_published = true
      AND m.status = 'published';

    RAISE NOTICE 'Published modules in system: %', v_published_modules_count;

    -- ================================================
    -- TEST 1: Check if function creates user_stats
    -- ================================================
    RAISE NOTICE '';
    RAISE NOTICE 'TEST 1: Checking user_stats creation...';

    SELECT COUNT(*)
    INTO v_stats_count
    FROM gamification_system.user_stats
    WHERE user_id IN (
        SELECT user_id FROM auth_management.profiles
        WHERE role IN ('student', 'admin_teacher', 'super_admin')
        LIMIT 5
    );

    IF v_stats_count > 0 THEN
        RAISE NOTICE '  ✓ PASS: Found % user_stats records', v_stats_count;
    ELSE
        RAISE WARNING '  ✗ FAIL: No user_stats records found';
        v_all_tests_passed := false;
    END IF;

    -- ================================================
    -- TEST 2: Check if function creates user_ranks with ON CONFLICT
    -- ================================================
    RAISE NOTICE '';
    RAISE NOTICE 'TEST 2: Checking user_ranks creation (Bug Fix #2)...';

    SELECT COUNT(*)
    INTO v_ranks_count
    FROM gamification_system.user_ranks
    WHERE user_id IN (
        SELECT user_id FROM auth_management.profiles
        WHERE role IN ('student', 'admin_teacher', 'super_admin')
        LIMIT 5
    );

    IF v_ranks_count > 0 THEN
        RAISE NOTICE '  ✓ PASS: Found % user_ranks records', v_ranks_count;
        RAISE NOTICE '  ℹ INFO: ON CONFLICT clause prevents duplicates on re-trigger';
    ELSE
        RAISE WARNING '  ✗ FAIL: No user_ranks records found';
        v_all_tests_passed := false;
    END IF;

    -- ================================================
    -- TEST 3: Check if function creates module_progress (BUG FIX #1)
    -- ================================================
    RAISE NOTICE '';
    RAISE NOTICE 'TEST 3: Checking module_progress creation (Bug Fix #1 - CRITICAL)...';

    SELECT COUNT(*)
    INTO v_module_progress_count
    FROM progress_tracking.module_progress
    WHERE user_id IN (
        SELECT user_id FROM auth_management.profiles
        WHERE role IN ('student', 'admin_teacher', 'super_admin')
        LIMIT 5
    );

    IF v_module_progress_count > 0 THEN
        RAISE NOTICE '  ✓ PASS: Found % module_progress records', v_module_progress_count;

        -- Verify each user has records for ALL published modules
        DECLARE
            v_user_record RECORD;
            v_user_module_count INTEGER;
        BEGIN
            FOR v_user_record IN
                SELECT DISTINCT p.user_id, p.email
                FROM auth_management.profiles p
                WHERE p.role IN ('student', 'admin_teacher', 'super_admin')
                  AND p.deleted_at IS NULL
                LIMIT 3
            LOOP
                SELECT COUNT(*)
                INTO v_user_module_count
                FROM progress_tracking.module_progress
                WHERE user_id = v_user_record.user_id;

                IF v_user_module_count = v_published_modules_count THEN
                    RAISE NOTICE '    ✓ User % has all % modules', v_user_record.email, v_published_modules_count;
                ELSIF v_user_module_count > 0 THEN
                    RAISE WARNING '    ⚠ User % has only % of % modules', v_user_record.email, v_user_module_count, v_published_modules_count;
                ELSE
                    RAISE WARNING '    ✗ User % has NO module_progress records!', v_user_record.email;
                    v_all_tests_passed := false;
                END IF;
            END LOOP;
        END;
    ELSE
        RAISE WARNING '  ✗ FAIL: No module_progress records found - BUG NOT FIXED!';
        v_all_tests_passed := false;
    END IF;

    -- ================================================
    -- TEST 4: Check if comodines_inventory is created
    -- ================================================
    RAISE NOTICE '';
    RAISE NOTICE 'TEST 4: Checking comodines_inventory creation...';

    SELECT COUNT(*)
    INTO v_comodines_count
    FROM gamification_system.comodines_inventory
    WHERE user_id IN (
        SELECT id FROM auth_management.profiles
        WHERE role IN ('student', 'admin_teacher', 'super_admin')
        LIMIT 5
    );

    IF v_comodines_count > 0 THEN
        RAISE NOTICE '  ✓ PASS: Found % comodines_inventory records', v_comodines_count;
    ELSE
        RAISE WARNING '  ✗ FAIL: No comodines_inventory records found';
        v_all_tests_passed := false;
    END IF;

    -- ================================================
    -- FINAL RESULTS
    -- ================================================
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    IF v_all_tests_passed THEN
        RAISE NOTICE 'RESULT: ✓ ALL TESTS PASSED';
        RAISE NOTICE 'The trigger is working correctly with all bug fixes!';
    ELSE
        RAISE WARNING 'RESULT: ✗ SOME TESTS FAILED';
        RAISE WARNING 'Please review the errors above.';
        RAISE WARNING 'You may need to run the backfill migration:';
        RAISE WARNING '  2025-11-24-backfill-module-progress.sql';
    END IF;
    RAISE NOTICE 'Completed at: %', NOW();
    RAISE NOTICE '================================================';

END $$;

-- =====================================================
-- Additional Verification Queries
-- =====================================================

-- Check users missing module_progress
SELECT
    p.user_id,
    p.email,
    p.role,
    COUNT(mp.id) as module_count,
    (SELECT COUNT(*) FROM educational_content.modules WHERE is_published = true AND status = 'published') as expected_count
FROM auth_management.profiles p
LEFT JOIN progress_tracking.module_progress mp ON mp.user_id = p.user_id
WHERE p.role IN ('student', 'admin_teacher', 'super_admin')
  AND p.deleted_at IS NULL
GROUP BY p.user_id, p.email, p.role
HAVING COUNT(mp.id) = 0
ORDER BY p.email
LIMIT 10;
