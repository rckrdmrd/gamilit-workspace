-- =====================================================
-- RLS Policies for: progress_tracking.certificates
-- Description: Row Level Security for digital certificates
-- EPIC: 10.2 - Digital Certificates System
-- Created: 2026-01-04
--
-- Access Rules:
--   - Students can view their own certificates
--   - Teachers can view certificates of students in their classrooms
--   - Admins can view/manage all certificates
--   - System can insert certificates (controlled at service layer)
-- =====================================================

-- Enable RLS
ALTER TABLE progress_tracking.certificates ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner
ALTER TABLE progress_tracking.certificates FORCE ROW LEVEL SECURITY;

-- =====================================================
-- DROP existing policies (idempotent)
-- =====================================================
DROP POLICY IF EXISTS certificates_select_own ON progress_tracking.certificates;
DROP POLICY IF EXISTS certificates_select_teacher ON progress_tracking.certificates;
DROP POLICY IF EXISTS certificates_select_admin ON progress_tracking.certificates;
DROP POLICY IF EXISTS certificates_insert_system ON progress_tracking.certificates;
DROP POLICY IF EXISTS certificates_update_admin ON progress_tracking.certificates;
DROP POLICY IF EXISTS certificates_delete_admin ON progress_tracking.certificates;

-- =====================================================
-- SELECT Policies
-- =====================================================

-- Policy: Students can view their own certificates
CREATE POLICY certificates_select_own
    ON progress_tracking.certificates
    FOR SELECT
    USING (user_id = gamilit.get_current_user_id());

COMMENT ON POLICY certificates_select_own ON progress_tracking.certificates IS
    'Estudiantes pueden ver sus propios certificados';

-- Policy: Teachers can view certificates of students in their classrooms
CREATE POLICY certificates_select_teacher
    ON progress_tracking.certificates
    FOR SELECT
    USING (
        gamilit.get_current_user_role() = 'admin_teacher'::auth_management.gamilit_role
        AND (
            -- Teacher can see certificates from their classrooms
            classroom_id IN (
                SELECT id FROM social_features.classrooms
                WHERE teacher_id = gamilit.get_current_user_id()
            )
            OR
            -- Teacher can see certificates of students in their classrooms
            user_id IN (
                SELECT cm.student_id
                FROM social_features.classroom_members cm
                JOIN social_features.classrooms c ON c.id = cm.classroom_id
                WHERE c.teacher_id = gamilit.get_current_user_id()
            )
        )
    );

COMMENT ON POLICY certificates_select_teacher ON progress_tracking.certificates IS
    'Profesores pueden ver certificados de estudiantes en sus aulas';

-- Policy: Admins can view all certificates
CREATE POLICY certificates_select_admin
    ON progress_tracking.certificates
    FOR SELECT
    USING (gamilit.is_admin());

COMMENT ON POLICY certificates_select_admin ON progress_tracking.certificates IS
    'Administradores pueden ver todos los certificados';

-- =====================================================
-- INSERT Policies
-- =====================================================

-- Policy: System/Admin can insert certificates
-- Note: Certificate generation is controlled at the service layer
-- This policy allows the system to create certificates
CREATE POLICY certificates_insert_system
    ON progress_tracking.certificates
    FOR INSERT
    WITH CHECK (
        -- Allow admins to insert
        gamilit.is_admin()
        OR
        -- Allow system (service layer) to insert for any user
        -- The service layer validates permissions before calling
        user_id IS NOT NULL
    );

COMMENT ON POLICY certificates_insert_system ON progress_tracking.certificates IS
    'Sistema y administradores pueden emitir certificados';

-- =====================================================
-- UPDATE Policies
-- =====================================================

-- Policy: Only admins can update certificates (revoke, etc.)
CREATE POLICY certificates_update_admin
    ON progress_tracking.certificates
    FOR UPDATE
    USING (gamilit.is_admin())
    WITH CHECK (gamilit.is_admin());

COMMENT ON POLICY certificates_update_admin ON progress_tracking.certificates IS
    'Solo administradores pueden modificar certificados (revocar, actualizar PDF, etc.)';

-- =====================================================
-- DELETE Policies
-- =====================================================

-- Policy: Only super_admin can delete certificates
-- Note: Normally certificates should be revoked, not deleted
CREATE POLICY certificates_delete_admin
    ON progress_tracking.certificates
    FOR DELETE
    USING (
        gamilit.get_current_user_role() = 'super_admin'::auth_management.gamilit_role
    );

COMMENT ON POLICY certificates_delete_admin ON progress_tracking.certificates IS
    'Solo super_admin puede eliminar certificados (uso excepcional)';
