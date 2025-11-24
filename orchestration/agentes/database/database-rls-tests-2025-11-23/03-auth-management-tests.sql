-- =====================================================
-- RLS Tests: auth_management schema
-- Created: 2025-11-23
-- Tests: 8 test cases
-- =====================================================

\echo 'Starting auth_management RLS tests...'

-- Test 1: Students can read their own profile
DO $$
DECLARE
    v_student1_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
    v_count INTEGER;
BEGIN
    PERFORM rls_tests.set_user_context(v_student1_id);

    SELECT COUNT(*) INTO v_count
    FROM auth_management.profiles
    WHERE id = v_student1_id;

    PERFORM rls_tests.run_test(
        'AUTH-001',
        'auth_management',
        'Student can read their own profile',
        format('SELECT COUNT(*)::TEXT FROM auth_management.profiles WHERE id = %L', v_student1_id),
        '1'
    );

    PERFORM rls_tests.clear_user_context();
END $$;

-- Test 2: Students cannot read other students' profiles
DO $$
DECLARE
    v_student1_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
    v_student2_id UUID := 'b0000000-0000-0000-0000-000000000002'::UUID;
    v_count INTEGER;
BEGIN
    PERFORM rls_tests.set_user_context(v_student1_id);

    SELECT COUNT(*) INTO v_count
    FROM auth_management.profiles
    WHERE id = v_student2_id;

    PERFORM rls_tests.run_test(
        'AUTH-002',
        'auth_management',
        'Student cannot read other student profile (without classroom)',
        format('SELECT COUNT(*)::TEXT FROM auth_management.profiles WHERE id = %L', v_student2_id),
        '0'
    );

    PERFORM rls_tests.clear_user_context();
END $$;

-- Test 3: Teachers can read student profiles in their classroom
DO $$
DECLARE
    v_teacher1_id UUID := 'b0000000-0000-0000-0000-000000000003'::UUID;
    v_student1_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
    v_count INTEGER;
BEGIN
    PERFORM rls_tests.set_user_context(v_teacher1_id);

    SELECT COUNT(*) INTO v_count
    FROM auth_management.profiles
    WHERE id = v_student1_id;

    PERFORM rls_tests.run_test(
        'AUTH-003',
        'auth_management',
        'Teacher can read student profile in their classroom',
        format('SELECT COUNT(*)::TEXT FROM auth_management.profiles WHERE id = %L AND role = ''student''', v_student1_id),
        '1'
    );

    PERFORM rls_tests.clear_user_context();
END $$;

-- Test 4: Teachers cannot read students from other classrooms
DO $$
DECLARE
    v_teacher1_id UUID := 'b0000000-0000-0000-0000-000000000003'::UUID;
    v_student3_id UUID := 'b0000000-0000-0000-0000-000000000005'::UUID;
    v_count INTEGER;
BEGIN
    PERFORM rls_tests.set_user_context(v_teacher1_id);

    SELECT COUNT(*) INTO v_count
    FROM auth_management.profiles
    WHERE id = v_student3_id;

    PERFORM rls_tests.run_test(
        'AUTH-004',
        'auth_management',
        'Teacher cannot read student from different classroom',
        format('SELECT COUNT(*)::TEXT FROM auth_management.profiles WHERE id = %L', v_student3_id),
        '0'
    );

    PERFORM rls_tests.clear_user_context();
END $$;

-- Test 5: Admin can read all profiles in their tenant
DO $$
DECLARE
    v_admin1_id UUID := 'b0000000-0000-0000-0000-000000000004'::UUID;
    v_tenant1_id UUID := 'a0000000-0000-0000-0000-000000000001'::UUID;
    v_count INTEGER;
BEGIN
    PERFORM rls_tests.set_user_context(v_admin1_id, v_tenant1_id);

    SELECT COUNT(*) INTO v_count
    FROM auth_management.profiles
    WHERE tenant_id = v_tenant1_id;

    PERFORM rls_tests.run_test(
        'AUTH-005',
        'auth_management',
        'Admin can read all profiles in their tenant',
        format('SELECT (COUNT(*) >= 3)::TEXT FROM auth_management.profiles WHERE tenant_id = %L', v_tenant1_id),
        'true'
    );

    PERFORM rls_tests.clear_user_context();
END $$;

-- Test 6: Multi-tenant isolation - Admin cannot see other tenant profiles
DO $$
DECLARE
    v_admin1_id UUID := 'b0000000-0000-0000-0000-000000000004'::UUID;
    v_tenant1_id UUID := 'a0000000-0000-0000-0000-000000000001'::UUID;
    v_tenant2_id UUID := 'a0000000-0000-0000-0000-000000000002'::UUID;
    v_count INTEGER;
BEGIN
    PERFORM rls_tests.set_user_context(v_admin1_id, v_tenant1_id);

    SELECT COUNT(*) INTO v_count
    FROM auth_management.profiles
    WHERE tenant_id = v_tenant2_id;

    PERFORM rls_tests.run_test(
        'AUTH-006',
        'auth_management',
        'Multi-tenant isolation: Admin cannot see other tenant profiles',
        format('SELECT COUNT(*)::TEXT FROM auth_management.profiles WHERE tenant_id = %L', v_tenant2_id),
        '0'
    );

    PERFORM rls_tests.clear_user_context();
END $$;

-- Test 7: Users can update their own profile
DO $$
DECLARE
    v_student1_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
    v_updated BOOLEAN := false;
BEGIN
    PERFORM rls_tests.set_user_context(v_student1_id);

    BEGIN
        UPDATE auth_management.profiles
        SET first_name = 'UpdatedStudent'
        WHERE id = v_student1_id;

        GET DIAGNOSTICS v_updated = ROW_COUNT;
    EXCEPTION WHEN OTHERS THEN
        v_updated := false;
    END;

    INSERT INTO rls_tests.test_results (
        test_name, test_category, test_description,
        expected_result, actual_result, status
    ) VALUES (
        'AUTH-007',
        'auth_management',
        'Student can update their own profile',
        'true',
        v_updated::TEXT,
        CASE WHEN v_updated THEN 'PASS' ELSE 'FAIL' END
    );

    -- Rollback the update
    UPDATE auth_management.profiles
    SET first_name = 'Student'
    WHERE id = v_student1_id;

    PERFORM rls_tests.clear_user_context();
END $$;

-- Test 8: Users cannot update other users' profiles
DO $$
DECLARE
    v_student1_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
    v_student2_id UUID := 'b0000000-0000-0000-0000-000000000002'::UUID;
    v_updated BOOLEAN := false;
    v_row_count INTEGER;
BEGIN
    PERFORM rls_tests.set_user_context(v_student1_id);

    BEGIN
        UPDATE auth_management.profiles
        SET first_name = 'Hacked'
        WHERE id = v_student2_id;

        GET DIAGNOSTICS v_row_count = ROW_COUNT;
        v_updated := (v_row_count > 0);
    EXCEPTION WHEN OTHERS THEN
        v_updated := false;
    END;

    INSERT INTO rls_tests.test_results (
        test_name, test_category, test_description,
        expected_result, actual_result, status
    ) VALUES (
        'AUTH-008',
        'auth_management',
        'Student cannot update other student profile',
        'false',
        v_updated::TEXT,
        CASE WHEN NOT v_updated THEN 'PASS' ELSE 'FAIL' END
    );

    PERFORM rls_tests.clear_user_context();
END $$;

\echo 'auth_management RLS tests completed.'
