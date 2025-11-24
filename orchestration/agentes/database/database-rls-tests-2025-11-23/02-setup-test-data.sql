-- =====================================================
-- Test Data Setup for RLS Testing
-- Created: 2025-11-23
-- Purpose: Create test users, tenants, and sample data
-- =====================================================

-- Clear existing test data
TRUNCATE rls_tests.test_results CASCADE;
TRUNCATE rls_tests.test_users CASCADE;

-- Create test tenants
DO $$
DECLARE
    v_tenant1_id UUID := 'a0000000-0000-0000-0000-000000000001'::UUID;
    v_tenant2_id UUID := 'a0000000-0000-0000-0000-000000000002'::UUID;
BEGIN
    -- Tenant 1: Main Test Tenant
    INSERT INTO auth_management.tenants (id, name, slug, status)
    VALUES (v_tenant1_id, 'Test Tenant 1', 'test-tenant-1', 'active')
    ON CONFLICT (id) DO NOTHING;

    -- Tenant 2: Isolation Test Tenant
    INSERT INTO auth_management.tenants (id, name, slug, status)
    VALUES (v_tenant2_id, 'Test Tenant 2', 'test-tenant-2', 'active')
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Test tenants created';
END $$;

-- Create test users
DO $$
DECLARE
    -- Tenant 1 Users
    v_student1_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
    v_student2_id UUID := 'b0000000-0000-0000-0000-000000000002'::UUID;
    v_teacher1_id UUID := 'b0000000-0000-0000-0000-000000000003'::UUID;
    v_admin1_id UUID := 'b0000000-0000-0000-0000-000000000004'::UUID;

    -- Tenant 2 Users (for isolation testing)
    v_student3_id UUID := 'b0000000-0000-0000-0000-000000000005'::UUID;
    v_teacher2_id UUID := 'b0000000-0000-0000-0000-000000000006'::UUID;

    -- IDs
    v_tenant1_id UUID := 'a0000000-0000-0000-0000-000000000001'::UUID;
    v_tenant2_id UUID := 'a0000000-0000-0000-0000-000000000002'::UUID;
BEGIN
    -- Student 1 (Tenant 1)
    INSERT INTO auth_management.profiles (id, email, first_name, last_name, role, tenant_id)
    VALUES (v_student1_id, 'student1@test.com', 'Student', 'One', 'student', v_tenant1_id)
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

    INSERT INTO auth_management.user_roles (user_id, role)
    VALUES (v_student1_id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;

    INSERT INTO rls_tests.test_users (user_id, username, role, tenant_id)
    VALUES (v_student1_id, 'student1', 'student', v_tenant1_id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Student 2 (Tenant 1)
    INSERT INTO auth_management.profiles (id, email, first_name, last_name, role, tenant_id)
    VALUES (v_student2_id, 'student2@test.com', 'Student', 'Two', 'student', v_tenant1_id)
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

    INSERT INTO auth_management.user_roles (user_id, role)
    VALUES (v_student2_id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;

    INSERT INTO rls_tests.test_users (user_id, username, role, tenant_id)
    VALUES (v_student2_id, 'student2', 'student', v_tenant1_id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Teacher 1 (Tenant 1)
    INSERT INTO auth_management.profiles (id, email, first_name, last_name, role, tenant_id)
    VALUES (v_teacher1_id, 'teacher1@test.com', 'Teacher', 'One', 'teacher', v_tenant1_id)
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

    INSERT INTO auth_management.user_roles (user_id, role)
    VALUES (v_teacher1_id, 'admin_teacher')
    ON CONFLICT (user_id, role) DO NOTHING;

    INSERT INTO rls_tests.test_users (user_id, username, role, tenant_id)
    VALUES (v_teacher1_id, 'teacher1', 'admin_teacher', v_tenant1_id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Admin 1 (Tenant 1)
    INSERT INTO auth_management.profiles (id, email, first_name, last_name, role, tenant_id)
    VALUES (v_admin1_id, 'admin1@test.com', 'Admin', 'One', 'admin', v_tenant1_id)
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

    INSERT INTO auth_management.user_roles (user_id, role)
    VALUES (v_admin1_id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    INSERT INTO rls_tests.test_users (user_id, username, role, tenant_id)
    VALUES (v_admin1_id, 'admin1', 'super_admin', v_tenant1_id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Student 3 (Tenant 2 - for isolation testing)
    INSERT INTO auth_management.profiles (id, email, first_name, last_name, role, tenant_id)
    VALUES (v_student3_id, 'student3@test.com', 'Student', 'Three', 'student', v_tenant2_id)
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

    INSERT INTO auth_management.user_roles (user_id, role)
    VALUES (v_student3_id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;

    INSERT INTO rls_tests.test_users (user_id, username, role, tenant_id)
    VALUES (v_student3_id, 'student3', 'student', v_tenant2_id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Teacher 2 (Tenant 2 - for isolation testing)
    INSERT INTO auth_management.profiles (id, email, first_name, last_name, role, tenant_id)
    VALUES (v_teacher2_id, 'teacher2@test.com', 'Teacher', 'Two', 'teacher', v_tenant2_id)
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

    INSERT INTO auth_management.user_roles (user_id, role)
    VALUES (v_teacher2_id, 'admin_teacher')
    ON CONFLICT (user_id, role) DO NOTHING;

    INSERT INTO rls_tests.test_users (user_id, username, role, tenant_id)
    VALUES (v_teacher2_id, 'teacher2', 'admin_teacher', v_tenant2_id)
    ON CONFLICT (user_id) DO NOTHING;

    RAISE NOTICE 'Test users created';
END $$;

-- Create test classroom and relationships
DO $$
DECLARE
    v_classroom_id UUID := 'c0000000-0000-0000-0000-000000000001'::UUID;
    v_student1_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
    v_student2_id UUID := 'b0000000-0000-0000-0000-000000000002'::UUID;
    v_teacher1_id UUID := 'b0000000-0000-0000-0000-000000000003'::UUID;
BEGIN
    -- Create classroom for teacher1
    INSERT INTO social_features.classrooms (id, name, teacher_id, status)
    VALUES (v_classroom_id, 'Test Classroom 1', v_teacher1_id, 'active')
    ON CONFLICT (id) DO NOTHING;

    -- Add students to classroom
    INSERT INTO social_features.classroom_members (classroom_id, student_id, status)
    VALUES
        (v_classroom_id, v_student1_id, 'active'),
        (v_classroom_id, v_student2_id, 'active')
    ON CONFLICT (classroom_id, student_id) DO NOTHING;

    RAISE NOTICE 'Test classroom and memberships created';
END $$;

-- Create sample progress tracking data
DO $$
DECLARE
    v_student1_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
    v_student2_id UUID := 'b0000000-0000-0000-0000-000000000002'::UUID;
    v_student3_id UUID := 'b0000000-0000-0000-0000-000000000005'::UUID;
    v_module_id UUID;
    v_exercise_id UUID;
BEGIN
    -- Get a sample module
    SELECT id INTO v_module_id
    FROM educational_content.modules
    WHERE status = 'published'
    LIMIT 1;

    IF v_module_id IS NULL THEN
        -- Create a test module
        INSERT INTO educational_content.modules (
            title, description, difficulty_level, status
        ) VALUES (
            'Test Module', 'Module for RLS testing', 'beginner', 'published'
        ) RETURNING id INTO v_module_id;
    END IF;

    -- Get a sample exercise
    SELECT id INTO v_exercise_id
    FROM educational_content.exercises
    WHERE module_id = v_module_id
    LIMIT 1;

    IF v_exercise_id IS NULL THEN
        -- Create a test exercise
        INSERT INTO educational_content.exercises (
            module_id, title, content, difficulty_level, status
        ) VALUES (
            v_module_id, 'Test Exercise', '{"type": "test"}', 'beginner', 'active'
        ) RETURNING id INTO v_exercise_id;
    END IF;

    -- Create module progress for students
    INSERT INTO progress_tracking.module_progress (user_id, module_id, status, progress_percentage)
    VALUES
        (v_student1_id, v_module_id, 'in_progress', 50),
        (v_student2_id, v_module_id, 'in_progress', 30),
        (v_student3_id, v_module_id, 'in_progress', 40)
    ON CONFLICT (user_id, module_id) DO NOTHING;

    -- Create exercise attempts
    INSERT INTO progress_tracking.exercise_attempts (user_id, exercise_id, result, score)
    VALUES
        (v_student1_id, v_exercise_id, 'correct', 100),
        (v_student2_id, v_exercise_id, 'correct', 85),
        (v_student3_id, v_exercise_id, 'correct', 90)
    ON CONFLICT DO NOTHING;

    -- Create exercise submissions
    INSERT INTO progress_tracking.exercise_submissions (
        user_id, exercise_id, submission_data, status
    ) VALUES
        (v_student1_id, v_exercise_id, '{"answer": "test1"}', 'graded'),
        (v_student2_id, v_exercise_id, '{"answer": "test2"}', 'submitted'),
        (v_student3_id, v_exercise_id, '{"answer": "test3"}', 'submitted')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Sample progress data created';
END $$;

-- Create sample gamification data
DO $$
DECLARE
    v_student1_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
    v_student2_id UUID := 'b0000000-0000-0000-0000-000000000002'::UUID;
    v_student3_id UUID := 'b0000000-0000-0000-0000-000000000005'::UUID;
BEGIN
    -- Create user stats
    INSERT INTO gamification_system.user_stats (
        user_id, total_xp, ml_coins_balance, level
    ) VALUES
        (v_student1_id, 1000, 500, 5),
        (v_student2_id, 800, 400, 4),
        (v_student3_id, 600, 300, 3)
    ON CONFLICT (user_id) DO NOTHING;

    RAISE NOTICE 'Sample gamification data created';
END $$;

-- Verify test data
SELECT 'Test Users Created:' as status, COUNT(*) as count
FROM rls_tests.test_users;

SELECT 'Test Profiles Created:' as status, COUNT(*) as count
FROM auth_management.profiles
WHERE id IN (SELECT user_id FROM rls_tests.test_users);

SELECT 'Test Progress Records:' as status, COUNT(*) as count
FROM progress_tracking.module_progress
WHERE user_id IN (SELECT user_id FROM rls_tests.test_users);
