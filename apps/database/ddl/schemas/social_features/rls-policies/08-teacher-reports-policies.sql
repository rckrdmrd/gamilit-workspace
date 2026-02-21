-- =====================================================
-- RLS Policies for: social_features.teacher_reports
-- Description: Teacher reports with role-based access
-- Created: 2025-11-26
-- Updated: 2026-02-20 (AUDIT-B3-01: Added INSERT/UPDATE/DELETE policies)
-- Policies: 5 (SELECT: 2, INSERT: 1, UPDATE: 1, DELETE: 1)
-- =====================================================
--
-- Security Strategy:
-- - Teachers: Full CRUD on their own reports
-- - Admins: Can see all reports in their tenant
-- =====================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS teacher_reports_teacher_policy ON social_features.teacher_reports;
DROP POLICY IF EXISTS teacher_reports_admin_policy ON social_features.teacher_reports;
DROP POLICY IF EXISTS teacher_reports_teacher_insert ON social_features.teacher_reports;
DROP POLICY IF EXISTS teacher_reports_teacher_update ON social_features.teacher_reports;
DROP POLICY IF EXISTS teacher_reports_teacher_delete ON social_features.teacher_reports;

-- =====================================================
-- SELECT Policies
-- =====================================================

-- Policy: teacher_reports_teacher_policy
-- Purpose: Teachers can view only their own reports
CREATE POLICY teacher_reports_teacher_policy
    ON social_features.teacher_reports
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        teacher_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY teacher_reports_teacher_policy ON social_features.teacher_reports IS
    'Teachers can see only their own generated reports';

-- Policy: teacher_reports_admin_policy
-- Purpose: Admins can view all reports in their tenant
CREATE POLICY teacher_reports_admin_policy
    ON social_features.teacher_reports
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        tenant_id = current_setting('app.current_tenant_id', true)::uuid
        AND EXISTS (
            SELECT 1 FROM auth_management.user_roles ur
            WHERE ur.user_id = current_setting('app.current_user_id', true)::uuid
                AND ur.role IN ('super_admin', 'admin_teacher')
        )
    );

COMMENT ON POLICY teacher_reports_admin_policy ON social_features.teacher_reports IS
    'Admins can view all reports in their tenant';

-- =====================================================
-- INSERT Policy (AUDIT-B3-01)
-- =====================================================

-- Policy: teacher_reports_teacher_insert
-- Purpose: Teachers can create reports assigned to themselves
CREATE POLICY teacher_reports_teacher_insert
    ON social_features.teacher_reports
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (
        teacher_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY teacher_reports_teacher_insert ON social_features.teacher_reports IS
    'Teachers can create reports assigned to themselves';

-- =====================================================
-- UPDATE Policy (AUDIT-B3-01)
-- =====================================================

-- Policy: teacher_reports_teacher_update
-- Purpose: Teachers can update only their own reports
CREATE POLICY teacher_reports_teacher_update
    ON social_features.teacher_reports
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (
        teacher_id = current_setting('app.current_user_id', true)::uuid
    )
    WITH CHECK (
        teacher_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY teacher_reports_teacher_update ON social_features.teacher_reports IS
    'Teachers can update only their own reports';

-- =====================================================
-- DELETE Policy (AUDIT-B3-01)
-- =====================================================

-- Policy: teacher_reports_teacher_delete
-- Purpose: Teachers can delete only their own reports
CREATE POLICY teacher_reports_teacher_delete
    ON social_features.teacher_reports
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING (
        teacher_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY teacher_reports_teacher_delete ON social_features.teacher_reports IS
    'Teachers can delete only their own reports';

-- =====================================================
-- SUMMARY
-- =====================================================
-- Total Policies: 5
-- - SELECT: 2 (teacher view own, admin view all in tenant)
-- - INSERT: 1 (teacher create own)
-- - UPDATE: 1 (teacher update own)
-- - DELETE: 1 (teacher delete own)
-- =====================================================
