-- =====================================================
-- RLS Policies for: social_features.teacher_reports
-- Description: Teacher reports with role-based access
-- Created: 2025-11-26
-- Policies: 2 (SELECT: 2)
-- =====================================================
--
-- Security Strategy:
-- - Teachers: Can see only their own reports
-- - Admins: Can see all reports in their tenant
-- - INSERT/UPDATE/DELETE: Handled at application level
-- =====================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS teacher_reports_teacher_policy ON social_features.teacher_reports;
DROP POLICY IF EXISTS teacher_reports_admin_policy ON social_features.teacher_reports;

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
-- SUMMARY
-- =====================================================
-- Total Policies: 2
-- - SELECT: 2 (teacher view own, admin view all in tenant)
-- - INSERT/UPDATE/DELETE: Handled at application level
-- =====================================================
