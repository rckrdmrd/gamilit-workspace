-- =====================================================
-- RLS Policies for: social_features.teacher_classrooms
-- Description: Teacher-Classroom relationships with role-based access
-- Created: 2025-11-26
-- Issue: ISS-001 (P0 - Bloqueante)
-- Policies: 3 (SELECT: 2, UPDATE: 1)
-- =====================================================
--
-- Security Strategy:
-- - Teachers: Can see their own classroom assignments
-- - Admins: Can see all teacher-classroom relationships
-- - Updates: Only admins can modify role assignments
-- - INSERT/DELETE: Handled at application level
-- =====================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS teacher_classrooms_read_teacher ON social_features.teacher_classrooms;
DROP POLICY IF EXISTS teacher_classrooms_read_admin ON social_features.teacher_classrooms;
DROP POLICY IF EXISTS teacher_classrooms_update_admin ON social_features.teacher_classrooms;

-- =====================================================
-- SELECT Policies
-- =====================================================

-- Policy: teacher_classrooms_read_teacher
-- Purpose: Teachers can view their own classroom assignments
CREATE POLICY teacher_classrooms_read_teacher
    ON social_features.teacher_classrooms
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        teacher_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY teacher_classrooms_read_teacher ON social_features.teacher_classrooms IS
    'Teachers can see their own classroom assignments and roles';

-- Policy: teacher_classrooms_read_admin
-- Purpose: Admins can view all teacher-classroom relationships
CREATE POLICY teacher_classrooms_read_admin
    ON social_features.teacher_classrooms
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.user_roles ur
            WHERE ur.user_id = current_setting('app.current_user_id', true)::uuid
                AND ur.role IN ('super_admin', 'admin_teacher')
        )
    );

COMMENT ON POLICY teacher_classrooms_read_admin ON social_features.teacher_classrooms IS
    'Admins can view all teacher-classroom relationships in the system';

-- =====================================================
-- UPDATE Policies
-- =====================================================

-- Policy: teacher_classrooms_update_admin
-- Purpose: Only admins can update teacher roles in classrooms
CREATE POLICY teacher_classrooms_update_admin
    ON social_features.teacher_classrooms
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.user_roles ur
            WHERE ur.user_id = current_setting('app.current_user_id', true)::uuid
                AND ur.role IN ('super_admin', 'admin_teacher')
        )
    );

COMMENT ON POLICY teacher_classrooms_update_admin ON social_features.teacher_classrooms IS
    'Only admins can update teacher roles and assignments';

-- =====================================================
-- SUMMARY
-- =====================================================
-- Total Policies: 3
-- - SELECT: 2 (teacher view own, admin view all)
-- - UPDATE: 1 (admin only)
-- - INSERT/DELETE: Handled at application level with explicit validation
-- =====================================================
