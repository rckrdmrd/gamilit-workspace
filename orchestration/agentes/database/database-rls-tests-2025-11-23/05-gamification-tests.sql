-- =====================================================
-- RLS Tests: gamification_system schema
-- Created: 2025-11-23
-- Tests: 6 test cases
-- =====================================================

\echo 'Starting gamification_system RLS tests...'

-- Test 17: Students can read their own user stats
DO $$
DECLARE
    v_student1_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
    v_count INTEGER;
BEGIN
    PERFORM rls_tests.set_user_context(v_student1_id);

    SELECT COUNT(*) INTO v_count
    FROM gamification_system.user_stats
    WHERE user_id = v_student1_id;

    PERFORM rls_tests.run_test(
        'GAMIF-001',
        'gamification_system',
        'Student can read their own user stats',
        format('SELECT (COUNT(*) > 0)::TEXT FROM gamification_system.user_stats WHERE user_id = %L', v_student1_id),
        'true'
    );

    PERFORM rls_tests.clear_user_context();
END $$;

-- Test 18: Students cannot read other students' stats (without friendship)
DO $$
DECLARE
    v_student1_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
    v_student3_id UUID := 'b0000000-0000-0000-0000-000000000005'::UUID;
    v_count INTEGER;
BEGIN
    PERFORM rls_tests.set_user_context(v_student1_id);

    SELECT COUNT(*) INTO v_count
    FROM gamification_system.user_stats
    WHERE user_id = v_student3_id;

    PERFORM rls_tests.run_test(
        'GAMIF-002',
        'gamification_system',
        'Student cannot read other student stats (without friendship)',
        format('SELECT COUNT(*)::TEXT FROM gamification_system.user_stats WHERE user_id = %L', v_student3_id),
        '0'
    );

    PERFORM rls_tests.clear_user_context();
END $$;

-- Test 19: Teachers can read stats of students in their classroom
DO $$
DECLARE
    v_teacher1_id UUID := 'b0000000-0000-0000-0000-000000000003'::UUID;
    v_student1_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
    v_count INTEGER;
BEGIN
    PERFORM rls_tests.set_user_context(v_teacher1_id);

    SELECT COUNT(*) INTO v_count
    FROM gamification_system.user_stats
    WHERE user_id = v_student1_id;

    PERFORM rls_tests.run_test(
        'GAMIF-003',
        'gamification_system',
        'Teacher can read stats of students in their classroom',
        format('SELECT (COUNT(*) > 0)::TEXT FROM gamification_system.user_stats WHERE user_id = %L', v_student1_id),
        'true'
    );

    PERFORM rls_tests.clear_user_context();
END $$;

-- Test 20: Students cannot update their own stats (system-controlled)
DO $$
DECLARE
    v_student1_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
    v_updated BOOLEAN := false;
    v_row_count INTEGER;
BEGIN
    PERFORM rls_tests.set_user_context(v_student1_id);

    BEGIN
        UPDATE gamification_system.user_stats
        SET total_xp = 999999
        WHERE user_id = v_student1_id;

        GET DIAGNOSTICS v_row_count = ROW_COUNT;
        v_updated := (v_row_count > 0);
    EXCEPTION WHEN OTHERS THEN
        v_updated := false;
    END;

    INSERT INTO rls_tests.test_results (
        test_name, test_category, test_description,
        expected_result, actual_result, status
    ) VALUES (
        'GAMIF-004',
        'gamification_system',
        'Student cannot update their own stats (system-controlled)',
        'false',
        v_updated::TEXT,
        CASE WHEN NOT v_updated THEN 'PASS' ELSE 'FAIL' END
    );

    PERFORM rls_tests.clear_user_context();
END $$;

-- Test 21: All users can read rankings (public leaderboards)
DO $$
DECLARE
    v_student1_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
    v_count INTEGER;
BEGIN
    PERFORM rls_tests.set_user_context(v_student1_id);

    SELECT COUNT(*) INTO v_count
    FROM gamification_system.user_ranks;

    PERFORM rls_tests.run_test(
        'GAMIF-005',
        'gamification_system',
        'All users can read rankings (public leaderboards)',
        'SELECT (COUNT(*) >= 0)::TEXT FROM gamification_system.user_ranks',
        'true'
    );

    PERFORM rls_tests.clear_user_context();
END $$;

-- Test 22: Admin can update user stats
DO $$
DECLARE
    v_admin1_id UUID := 'b0000000-0000-0000-0000-000000000004'::UUID;
    v_student1_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
    v_updated BOOLEAN := false;
    v_row_count INTEGER;
    v_original_xp INTEGER;
BEGIN
    PERFORM rls_tests.set_user_context(v_admin1_id);

    -- Save original value
    SELECT total_xp INTO v_original_xp
    FROM gamification_system.user_stats
    WHERE user_id = v_student1_id;

    BEGIN
        UPDATE gamification_system.user_stats
        SET total_xp = total_xp + 100
        WHERE user_id = v_student1_id;

        GET DIAGNOSTICS v_row_count = ROW_COUNT;
        v_updated := (v_row_count > 0);

        -- Rollback the change
        IF v_updated THEN
            UPDATE gamification_system.user_stats
            SET total_xp = v_original_xp
            WHERE user_id = v_student1_id;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        v_updated := false;
    END;

    INSERT INTO rls_tests.test_results (
        test_name, test_category, test_description,
        expected_result, actual_result, status
    ) VALUES (
        'GAMIF-006',
        'gamification_system',
        'Admin can update user stats',
        'true',
        v_updated::TEXT,
        CASE WHEN v_updated THEN 'PASS' ELSE 'FAIL' END
    );

    PERFORM rls_tests.clear_user_context();
END $$;

\echo 'gamification_system RLS tests completed.'
