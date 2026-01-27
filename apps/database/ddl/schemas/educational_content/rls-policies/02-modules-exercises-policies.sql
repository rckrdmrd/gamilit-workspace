-- =====================================================
-- RLS Policies for: educational_content.modules & exercises
-- Description: Educational content with role-based visibility
-- Created: 2025-10-28
-- Policies: 6 total (modules: 3, exercises: 3)
-- =====================================================
--
-- Security Strategy:
-- - Students: Can only see published/active content
-- - Teachers: Can see all content (including drafts)
-- - Admins: Full management access
-- =====================================================

-- =====================================================
-- TABLE: educational_content.modules
-- Policies: 3 (SELECT: 2, ALL: 1)
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS modules_read_published ON educational_content.modules;
DROP POLICY IF EXISTS modules_read_teacher ON educational_content.modules;
DROP POLICY IF EXISTS modules_manage_admin ON educational_content.modules;
DROP POLICY IF EXISTS modules_select_published ON educational_content.modules;
DROP POLICY IF EXISTS modules_all_admin ON educational_content.modules;

-- Policy: modules_read_published
-- Purpose: Students can read published modules
CREATE POLICY modules_read_published
    ON educational_content.modules
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (is_published = true AND status = 'published');

COMMENT ON POLICY modules_read_published ON educational_content.modules IS
    'Students can see only published and active modules';

-- Policy: modules_read_teacher
-- Purpose: Teachers can read all modules
CREATE POLICY modules_read_teacher
    ON educational_content.modules
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.user_roles ur
            WHERE ur.user_id = current_setting('app.current_user_id', true)::uuid
                AND ur.role = 'admin_teacher'
        )
    );

COMMENT ON POLICY modules_read_teacher ON educational_content.modules IS
    'Teachers can see all modules including drafts and unpublished content';

-- Policy: modules_manage_admin
-- Purpose: Admins can fully manage modules
CREATE POLICY modules_manage_admin
    ON educational_content.modules
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.user_roles ur
            WHERE ur.user_id = current_setting('app.current_user_id', true)::uuid
                AND ur.role = 'super_admin'
        )
    );

COMMENT ON POLICY modules_manage_admin ON educational_content.modules IS
    'Admins can create, update, and delete all modules';

-- =====================================================
-- TABLE: educational_content.exercises
-- Policies: 3 (SELECT: 2, ALL: 1)
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS exercises_read_active ON educational_content.exercises;
DROP POLICY IF EXISTS exercises_read_teacher ON educational_content.exercises;
DROP POLICY IF EXISTS exercises_manage_admin ON educational_content.exercises;
DROP POLICY IF EXISTS exercises_select_active ON educational_content.exercises;
DROP POLICY IF EXISTS exercises_all_admin ON educational_content.exercises;

-- Policy: exercises_read_active
-- Purpose: Students can read active exercises from modules assigned to their classrooms
-- FIX: TASK-022 GAP-C06 - Previously allowed ALL active exercises without classroom check
CREATE POLICY exercises_read_active
    ON educational_content.exercises
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        is_active = true
        AND module_id IN (
            SELECT cm.module_id
            FROM educational_content.classroom_modules cm
            INNER JOIN social_features.classroom_members cmb
                ON cm.classroom_id = cmb.classroom_id
            WHERE cm.is_active = true
                AND cmb.student_id = current_setting('app.current_user_id', true)::uuid
                AND cmb.status = 'active'
        )
    );

COMMENT ON POLICY exercises_read_active ON educational_content.exercises IS
    'Students can see active exercises only from modules assigned to their classrooms (GAP-C06 fix)';

-- Policy: exercises_read_teacher
-- Purpose: Teachers can read all exercises
CREATE POLICY exercises_read_teacher
    ON educational_content.exercises
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.user_roles ur
            WHERE ur.user_id = current_setting('app.current_user_id', true)::uuid
                AND ur.role = 'admin_teacher'
        )
    );

COMMENT ON POLICY exercises_read_teacher ON educational_content.exercises IS
    'Teachers can see all exercises including inactive ones';

-- Policy: exercises_manage_admin
-- Purpose: Admins can fully manage exercises
CREATE POLICY exercises_manage_admin
    ON educational_content.exercises
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.user_roles ur
            WHERE ur.user_id = current_setting('app.current_user_id', true)::uuid
                AND ur.role = 'super_admin'
        )
    );

COMMENT ON POLICY exercises_manage_admin ON educational_content.exercises IS
    'Admins can create, update, and delete all exercises';

-- =====================================================
-- SUMMARY: educational_content schema
-- =====================================================
-- Total policies: 6
-- Tables with policies: 2
-- - modules: 3 policies (2 SELECT, 1 ALL)
-- - exercises: 3 policies (2 SELECT, 1 ALL)
--   * exercises_read_active: context-aware (classroom_modules + classroom_members)
--   * exercises_read_teacher: role-based (admin_teacher)
--   * exercises_manage_admin: role-based (super_admin)
-- FIX: TASK-022 GAP-C06 - exercises_read_active now checks classroom enrollment
-- =====================================================
