-- =====================================================
-- RLS Tests: progress_tracking schema
-- Created: 2025-11-23
-- Tests: 8 test cases
-- =====================================================

\echo 'Starting progress_tracking RLS tests...'

-- Test 9: Students can read their own module progress
DO $$
DECLARE
    v_student1_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
    v_count INTEGER;
BEGIN
    PERFORM rls_tests.set_user_context(v_student1_id);

    SELECT COUNT(*) INTO v_count
    FROM progress_tracking.module_progress
    WHERE user_id = v_student1_id;

    PERFORM rls_tests.run_test(
        'PROG-001',
        'progress_tracking',
        'Student can read their own module progress',
        format('SELECT (COUNT(*) > 0)::TEXT FROM progress_tracking.module_progress WHERE user_id = %L', v_student1_id),
        'true'
    );

    PERFORM rls_tests.clear_user_context();
END $$;

-- Test 10: Students cannot read other students' progress
DO $$
DECLARE
    v_student1_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
    v_student2_id UUID := 'b0000000-0000-0000-0000-000000000002'::UUID;
    v_count INTEGER;
BEGIN
    PERFORM rls_tests.set_user_context(v_student1_id);

    SELECT COUNT(*) INTO v_count
    FROM progress_tracking.module_progress
    WHERE user_id = v_student2_id;

    PERFORM rls_tests.run_test(
        'PROG-002',
        'progress_tracking',
        'Student cannot read other student progress',
        format('SELECT COUNT(*)::TEXT FROM progress_tracking.module_progress WHERE user_id = %L', v_student2_id),
        '0'
    );

    PERFORM rls_tests.clear_user_context();
END $$;

-- Test 11: Teachers can read progress of students in their classroom
DO $$
DECLARE
    v_teacher1_id UUID := 'b0000000-0000-0000-0000-000000000003'::UUID;
    v_student1_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
    v_count INTEGER;
BEGIN
    PERFORM rls_tests.set_user_context(v_teacher1_id);

    SELECT COUNT(*) INTO v_count
    FROM progress_tracking.module_progress
    WHERE user_id = v_student1_id;

    PERFORM rls_tests.run_test(
        'PROG-003',
        'progress_tracking',
        'Teacher can read student progress in their classroom',
        format('SELECT (COUNT(*) > 0)::TEXT FROM progress_tracking.module_progress WHERE user_id = %L', v_student1_id),
        'true'
    );

    PERFORM rls_tests.clear_user_context();
END $$;

-- Test 12: Teachers cannot read progress of students not in their classroom
DO $$
DECLARE
    v_teacher1_id UUID := 'b0000000-0000-0000-0000-000000000003'::UUID;
    v_student3_id UUID := 'b0000000-0000-0000-0000-000000000005'::UUID;
    v_count INTEGER;
BEGIN
    PERFORM rls_tests.set_user_context(v_teacher1_id);

    SELECT COUNT(*) INTO v_count
    FROM progress_tracking.module_progress
    WHERE user_id = v_student3_id;

    PERFORM rls_tests.run_test(
        'PROG-004',
        'progress_tracking',
        'Teacher cannot read progress of students not in their classroom',
        format('SELECT COUNT(*)::TEXT FROM progress_tracking.module_progress WHERE user_id = %L', v_student3_id),
        '0'
    );

    PERFORM rls_tests.clear_user_context();
END $$;

-- Test 13: Students can read their own exercise attempts
DO $$
DECLARE
    v_student1_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
    v_count INTEGER;
BEGIN
    PERFORM rls_tests.set_user_context(v_student1_id);

    SELECT COUNT(*) INTO v_count
    FROM progress_tracking.exercise_attempts
    WHERE user_id = v_student1_id;

    PERFORM rls_tests.run_test(
        'PROG-005',
        'progress_tracking',
        'Student can read their own exercise attempts',
        format('SELECT (COUNT(*) > 0)::TEXT FROM progress_tracking.exercise_attempts WHERE user_id = %L', v_student1_id),
        'true'
    );

    PERFORM rls_tests.clear_user_context();
END $$;

-- Test 14: Students cannot read other students' exercise attempts
DO $$
DECLARE
    v_student1_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
    v_student2_id UUID := 'b0000000-0000-0000-0000-000000000002'::UUID;
    v_count INTEGER;
BEGIN
    PERFORM rls_tests.set_user_context(v_student1_id);

    SELECT COUNT(*) INTO v_count
    FROM progress_tracking.exercise_attempts
    WHERE user_id = v_student2_id;

    PERFORM rls_tests.run_test(
        'PROG-006',
        'progress_tracking',
        'Student cannot read other student exercise attempts',
        format('SELECT COUNT(*)::TEXT FROM progress_tracking.exercise_attempts WHERE user_id = %L', v_student2_id),
        '0'
    );

    PERFORM rls_tests.clear_user_context();
END $$;

-- Test 15: Teachers can read submissions from their students
DO $$
DECLARE
    v_teacher1_id UUID := 'b0000000-0000-0000-0000-000000000003'::UUID;
    v_student1_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
    v_count INTEGER;
BEGIN
    PERFORM rls_tests.set_user_context(v_teacher1_id);

    SELECT COUNT(*) INTO v_count
    FROM progress_tracking.exercise_submissions
    WHERE user_id = v_student1_id;

    PERFORM rls_tests.run_test(
        'PROG-007',
        'progress_tracking',
        'Teacher can read submissions from their students',
        format('SELECT (COUNT(*) > 0)::TEXT FROM progress_tracking.exercise_submissions WHERE user_id = %L', v_student1_id),
        'true'
    );

    PERFORM rls_tests.clear_user_context();
END $$;

-- Test 16: Teachers can update (grade) submissions from their students
DO $$
DECLARE
    v_teacher1_id UUID := 'b0000000-0000-0000-0000-000000000003'::UUID;
    v_student1_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
    v_updated BOOLEAN := false;
    v_row_count INTEGER;
    v_submission_id UUID;
BEGIN
    PERFORM rls_tests.set_user_context(v_teacher1_id);

    -- Get a submission ID
    SELECT id INTO v_submission_id
    FROM progress_tracking.exercise_submissions
    WHERE user_id = v_student1_id
    LIMIT 1;

    IF v_submission_id IS NOT NULL THEN
        BEGIN
            UPDATE progress_tracking.exercise_submissions
            SET teacher_feedback = 'Great work!'
            WHERE id = v_submission_id;

            GET DIAGNOSTICS v_row_count = ROW_COUNT;
            v_updated := (v_row_count > 0);
        EXCEPTION WHEN OTHERS THEN
            v_updated := false;
        END;
    END IF;

    INSERT INTO rls_tests.test_results (
        test_name, test_category, test_description,
        expected_result, actual_result, status
    ) VALUES (
        'PROG-008',
        'progress_tracking',
        'Teacher can update (grade) submissions from their students',
        'true',
        v_updated::TEXT,
        CASE WHEN v_updated THEN 'PASS' ELSE 'FAIL' END
    );

    PERFORM rls_tests.clear_user_context();
END $$;

\echo 'progress_tracking RLS tests completed.'
