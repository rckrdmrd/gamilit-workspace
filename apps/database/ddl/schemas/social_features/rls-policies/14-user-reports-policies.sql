-- =====================================================
-- RLS Policies for: social_features.user_reports
-- Description: Content and user reporting moderation policies
-- Created: 2026-02-03
-- Ticket: GAP-SOC-005
-- Policies: 7 (SELECT: 3, INSERT: 1, UPDATE: 2, DELETE: 1)
-- =====================================================
--
-- Security Strategy:
-- - Reporters can see their own submitted reports
-- - Reported users CANNOT see reports against them (privacy)
-- - Moderators (admin/super_admin) can see all reports
-- - Only moderators can update report status/resolution
-- - Reporters can update their own report (add details) while open
-- - Only admins can delete reports (for GDPR compliance)
-- =====================================================

-- Habilitar RLS
ALTER TABLE social_features.user_reports ENABLE ROW LEVEL SECURITY;

-- Limpiar politicas existentes
DROP POLICY IF EXISTS user_reports_select_own ON social_features.user_reports;
DROP POLICY IF EXISTS user_reports_select_admin ON social_features.user_reports;
DROP POLICY IF EXISTS user_reports_select_moderator ON social_features.user_reports;
DROP POLICY IF EXISTS user_reports_insert_own ON social_features.user_reports;
DROP POLICY IF EXISTS user_reports_update_own ON social_features.user_reports;
DROP POLICY IF EXISTS user_reports_update_moderator ON social_features.user_reports;
DROP POLICY IF EXISTS user_reports_delete_admin ON social_features.user_reports;

-- =====================================================
-- Policy: user_reports_select_own
-- Purpose: Reporters can see their own submitted reports
-- =====================================================
CREATE POLICY user_reports_select_own
    ON social_features.user_reports
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        reporter_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY user_reports_select_own ON social_features.user_reports IS
    'Reporters can view reports they have submitted to track their status';

-- =====================================================
-- Policy: user_reports_select_admin
-- Purpose: Admins and super_admins can see all reports
-- =====================================================
CREATE POLICY user_reports_select_admin
    ON social_features.user_reports
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            WHERE p.id = current_setting('app.current_user_id', true)::uuid
            AND p.role IN ('admin', 'super_admin')
        )
    );

COMMENT ON POLICY user_reports_select_admin ON social_features.user_reports IS
    'Admins and super_admins can view all reports for moderation purposes';

-- =====================================================
-- Policy: user_reports_select_moderator
-- Purpose: Moderators can see reports assigned to them
-- =====================================================
CREATE POLICY user_reports_select_moderator
    ON social_features.user_reports
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        assigned_to = current_setting('app.current_user_id', true)::uuid
        AND EXISTS (
            SELECT 1 FROM auth_management.profiles p
            WHERE p.id = current_setting('app.current_user_id', true)::uuid
            AND p.role IN ('moderator', 'teacher', 'admin', 'super_admin')
        )
    );

COMMENT ON POLICY user_reports_select_moderator ON social_features.user_reports IS
    'Moderators and teachers can view reports assigned to them';

-- =====================================================
-- Policy: user_reports_insert_own
-- Purpose: Users can create reports
-- =====================================================
CREATE POLICY user_reports_insert_own
    ON social_features.user_reports
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (
        reporter_id = current_setting('app.current_user_id', true)::uuid
        AND status = 'open'
        AND assigned_to IS NULL
        AND resolved_by IS NULL
        AND resolved_at IS NULL
        AND resolution IS NULL
        AND resolution_notes IS NULL
        AND action_taken IS NULL
    );

COMMENT ON POLICY user_reports_insert_own ON social_features.user_reports IS
    'Users can create new reports where they are the reporter. Cannot set moderation fields.';

-- =====================================================
-- Policy: user_reports_update_own
-- Purpose: Reporters can add details to open reports
-- =====================================================
CREATE POLICY user_reports_update_own
    ON social_features.user_reports
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (
        reporter_id = current_setting('app.current_user_id', true)::uuid
        AND status = 'open'
    )
    WITH CHECK (
        reporter_id = current_setting('app.current_user_id', true)::uuid
        AND status = 'open'
        AND assigned_to IS NULL
        AND resolved_by IS NULL
        AND resolved_at IS NULL
        AND resolution IS NULL
        AND resolution_notes IS NULL
        AND action_taken IS NULL
    );

COMMENT ON POLICY user_reports_update_own ON social_features.user_reports IS
    'Reporters can update description and evidence on their open reports. Cannot modify moderation fields.';

-- =====================================================
-- Policy: user_reports_update_moderator
-- Purpose: Moderators can update report status and resolution
-- =====================================================
CREATE POLICY user_reports_update_moderator
    ON social_features.user_reports
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            WHERE p.id = current_setting('app.current_user_id', true)::uuid
            AND p.role IN ('moderator', 'teacher', 'admin', 'super_admin')
        )
        AND (
            assigned_to = current_setting('app.current_user_id', true)::uuid
            OR assigned_to IS NULL
            OR EXISTS (
                SELECT 1 FROM auth_management.profiles p
                WHERE p.id = current_setting('app.current_user_id', true)::uuid
                AND p.role IN ('admin', 'super_admin')
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            WHERE p.id = current_setting('app.current_user_id', true)::uuid
            AND p.role IN ('moderator', 'teacher', 'admin', 'super_admin')
        )
    );

COMMENT ON POLICY user_reports_update_moderator ON social_features.user_reports IS
    'Moderators can update reports assigned to them or unassigned. Admins can update any report.';

-- =====================================================
-- Policy: user_reports_delete_admin
-- Purpose: Only admins can delete reports (GDPR compliance)
-- =====================================================
CREATE POLICY user_reports_delete_admin
    ON social_features.user_reports
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            WHERE p.id = current_setting('app.current_user_id', true)::uuid
            AND p.role IN ('admin', 'super_admin')
        )
    );

COMMENT ON POLICY user_reports_delete_admin ON social_features.user_reports IS
    'Only admins can delete reports for GDPR/data retention compliance';
