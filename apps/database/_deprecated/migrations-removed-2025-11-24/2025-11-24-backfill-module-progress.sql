-- =====================================================
-- Migration: Backfill module_progress for existing users
-- Date: 2025-11-24
-- Priority: CRITICAL
-- Reason: Bug fix - initialize_user_stats() didn't create module_progress records
--
-- ISSUE: The trigger gamilit.initialize_user_stats() was incomplete.
--        It created user_stats, comodines_inventory, and user_ranks,
--        but NEVER created progress_tracking.module_progress records.
--        This caused new users to see "no modules available" errors.
--
-- IMPACT: All users registered before 2025-11-24 are missing module_progress.
--         This migration backfills those records.
--
-- SAFETY: This script is idempotent and safe to run multiple times.
--         Uses ON CONFLICT DO NOTHING to prevent duplicates.
-- =====================================================

DO $$
DECLARE
    v_affected_users INTEGER;
    v_affected_records INTEGER;
    v_total_users INTEGER;
    v_users_needing_fix INTEGER;
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Migration: Backfill module_progress';
    RAISE NOTICE 'Started at: %', NOW();
    RAISE NOTICE '================================================';

    -- Count total users with gamification roles
    SELECT COUNT(*)
    INTO v_total_users
    FROM auth_management.profiles
    WHERE role IN ('student', 'admin_teacher', 'super_admin')
      AND deleted_at IS NULL;

    RAISE NOTICE 'Total users with gamification: %', v_total_users;

    -- Count users who are missing module_progress records
    SELECT COUNT(DISTINCT p.id)
    INTO v_users_needing_fix
    FROM auth_management.profiles p
    WHERE p.role IN ('student', 'admin_teacher', 'super_admin')
      AND p.deleted_at IS NULL
      AND NOT EXISTS (
          SELECT 1
          FROM progress_tracking.module_progress mp
          WHERE mp.user_id = p.id  -- FIXED: Use p.id (profiles.id) not p.user_id
      );

    RAISE NOTICE 'Users missing module_progress: %', v_users_needing_fix;

    -- Insert module_progress for users who don't have any
    -- This matches the logic in the fixed initialize_user_stats() function
    -- IMPORTANT: module_progress.user_id references profiles.id (NOT auth.users.id)
    INSERT INTO progress_tracking.module_progress (
        user_id,
        module_id,
        status,
        progress_percentage,
        created_at,
        updated_at
    )
    SELECT
        p.id,  -- FIXED: Use p.id (profiles.id) not p.user_id (auth.users.id)
        m.id as module_id,
        'not_started'::progress_tracking.progress_status,
        0,
        NOW(),
        NOW()
    FROM auth_management.profiles p
    CROSS JOIN educational_content.modules m
    WHERE p.role IN ('student', 'admin_teacher', 'super_admin')
      AND p.deleted_at IS NULL
      AND m.is_published = true
      AND m.status = 'published'
      AND NOT EXISTS (
          SELECT 1
          FROM progress_tracking.module_progress mp
          WHERE mp.user_id = p.id  -- FIXED: Use p.id (profiles.id) not p.user_id
            AND mp.module_id = m.id
      )
    ON CONFLICT (user_id, module_id) DO NOTHING;

    GET DIAGNOSTICS v_affected_records = ROW_COUNT;

    -- Count how many users now have module_progress
    SELECT COUNT(DISTINCT p.id)
    INTO v_affected_users
    FROM auth_management.profiles p
    WHERE p.role IN ('student', 'admin_teacher', 'super_admin')
      AND p.deleted_at IS NULL
      AND EXISTS (
          SELECT 1
          FROM progress_tracking.module_progress mp
          WHERE mp.user_id = p.id  -- FIXED: Use p.id (profiles.id) not p.user_id
      );

    RAISE NOTICE '================================================';
    RAISE NOTICE 'Migration Results:';
    RAISE NOTICE '  - Total module_progress records created: %', v_affected_records;
    RAISE NOTICE '  - Users affected: %', v_users_needing_fix;
    RAISE NOTICE '  - Users now with module_progress: %', v_affected_users;
    RAISE NOTICE '  - Completed at: %', NOW();
    RAISE NOTICE '================================================';

    -- Validation check
    IF v_affected_users < v_total_users THEN
        RAISE WARNING 'Some users still missing module_progress! Check: % of %',
                      v_total_users - v_affected_users, v_total_users;
    ELSE
        RAISE NOTICE 'SUCCESS: All users now have module_progress records!';
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Migration failed: % - %', SQLERRM, SQLSTATE;
END $$;

-- =====================================================
-- Verification Query (Run after migration)
-- =====================================================
-- SELECT
--     p.id,  -- FIXED: Use p.id (profiles.id) for grouping
--     p.email,
--     p.role,
--     COUNT(mp.id) as module_count
-- FROM auth_management.profiles p
-- LEFT JOIN progress_tracking.module_progress mp ON mp.user_id = p.id  -- FIXED: Use p.id
-- WHERE p.role IN ('student', 'admin_teacher', 'super_admin')
--   AND p.deleted_at IS NULL
-- GROUP BY p.id, p.email, p.role  -- FIXED: Use p.id
-- ORDER BY module_count ASC, p.email;
-- =====================================================
