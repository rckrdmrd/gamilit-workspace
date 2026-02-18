-- =====================================================
-- RLS Policies for lti_integration schema
-- Description: Politicas de seguridad para integracion LTI con LMS externos
-- Schema: lti_integration
-- Tables: lti_consumers, lti_sessions, lti_grade_passback
-- Epic: EXT-007
-- Gap Reference: GAP-SYS-001 (CRITICAL - Security)
-- Created: 2026-02-03
-- =====================================================
--
-- Security Strategy:
-- - Multi-tenant isolation via tenant_id (lti_consumers)
-- - User-based access for sessions and grade passback
-- - Role-based access: super_admin (full), admin_teacher (read tenant), student (own data)
-- - Service role bypass for system operations
--
-- Helper Functions Used:
-- - gamilit.is_admin() -> Returns true for admin_teacher or super_admin roles
-- - gamilit.get_current_user_id() -> Returns current session user UUID
-- - gamilit.get_current_tenant_id() -> Returns current tenant UUID (placeholder)
-- - gamilit.get_current_user_role() -> Returns user role enum
--
-- =====================================================

-- =====================================================
-- TABLE: lti_integration.lti_consumers
-- Description: Configuracion de plataformas LMS que integran via LTI 1.3
-- Columns: tenant_id (UUID), is_active, created_by
-- Policies: 6 (SELECT: 3, INSERT: 1, UPDATE: 1, DELETE: 1)
-- =====================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS lti_consumers_select_admin ON lti_integration.lti_consumers;
DROP POLICY IF EXISTS lti_consumers_select_teacher_tenant ON lti_integration.lti_consumers;
DROP POLICY IF EXISTS lti_consumers_select_service ON lti_integration.lti_consumers;
DROP POLICY IF EXISTS lti_consumers_insert_admin ON lti_integration.lti_consumers;
DROP POLICY IF EXISTS lti_consumers_update_admin ON lti_integration.lti_consumers;
DROP POLICY IF EXISTS lti_consumers_delete_super_admin ON lti_integration.lti_consumers;

-- Policy: lti_consumers_select_admin
-- Purpose: Admins (admin_teacher, super_admin) can view all active consumers
CREATE POLICY lti_consumers_select_admin
    ON lti_integration.lti_consumers
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (gamilit.is_admin());

COMMENT ON POLICY lti_consumers_select_admin ON lti_integration.lti_consumers IS
    'Permite a administradores ver todas las configuraciones de consumidores LTI';

-- Policy: lti_consumers_select_teacher_tenant
-- Purpose: Teachers can view consumers in their tenant
CREATE POLICY lti_consumers_select_teacher_tenant
    ON lti_integration.lti_consumers
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        gamilit.get_current_user_role() = 'admin_teacher'::auth_management.gamilit_role
        AND tenant_id = (
            SELECT tenant_id
            FROM auth_management.profiles
            WHERE id = gamilit.get_current_user_id()
        )
        AND is_active = true
    );

COMMENT ON POLICY lti_consumers_select_teacher_tenant ON lti_integration.lti_consumers IS
    'Permite a profesores ver consumidores LTI activos de su tenant';

-- Policy: lti_consumers_select_service
-- Purpose: Service role bypass for system operations (backend services)
CREATE POLICY lti_consumers_select_service
    ON lti_integration.lti_consumers
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        current_setting('app.service_role', true) = 'true'
    );

COMMENT ON POLICY lti_consumers_select_service ON lti_integration.lti_consumers IS
    'Permite acceso completo para operaciones del servicio backend (LTI launch validation)';

-- Policy: lti_consumers_insert_admin
-- Purpose: Only admins can create new LTI consumers
CREATE POLICY lti_consumers_insert_admin
    ON lti_integration.lti_consumers
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (gamilit.is_admin());

COMMENT ON POLICY lti_consumers_insert_admin ON lti_integration.lti_consumers IS
    'Solo administradores pueden registrar nuevos consumidores LTI';

-- Policy: lti_consumers_update_admin
-- Purpose: Only admins can update LTI consumer configuration
CREATE POLICY lti_consumers_update_admin
    ON lti_integration.lti_consumers
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (gamilit.is_admin())
    WITH CHECK (gamilit.is_admin());

COMMENT ON POLICY lti_consumers_update_admin ON lti_integration.lti_consumers IS
    'Solo administradores pueden actualizar configuracion de consumidores LTI';

-- Policy: lti_consumers_delete_super_admin
-- Purpose: Only super_admin can delete LTI consumers (critical operation)
CREATE POLICY lti_consumers_delete_super_admin
    ON lti_integration.lti_consumers
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING (
        EXISTS (
            SELECT 1
            FROM auth_management.profiles
            WHERE id = gamilit.get_current_user_id()
            AND role = 'super_admin'
            AND status = 'active'
        )
    );

COMMENT ON POLICY lti_consumers_delete_super_admin ON lti_integration.lti_consumers IS
    'Solo super_admin puede eliminar consumidores LTI (operacion critica)';

-- =====================================================
-- TABLE: lti_integration.lti_sessions
-- Description: Sesiones activas de LTI - tracking de launches desde LMS
-- Columns: consumer_id, user_id, is_active
-- Policies: 5 (SELECT: 3, INSERT: 1, UPDATE: 1)
-- =====================================================

-- Drop existing policies if any (including legacy ones from 07-enable-rls.sql)
DROP POLICY IF EXISTS lti_sessions_admin_all ON lti_integration.lti_sessions;
DROP POLICY IF EXISTS lti_sessions_user_own ON lti_integration.lti_sessions;
DROP POLICY IF EXISTS lti_sessions_select_admin ON lti_integration.lti_sessions;
DROP POLICY IF EXISTS lti_sessions_select_own ON lti_integration.lti_sessions;
DROP POLICY IF EXISTS lti_sessions_select_service ON lti_integration.lti_sessions;
DROP POLICY IF EXISTS lti_sessions_insert_service ON lti_integration.lti_sessions;
DROP POLICY IF EXISTS lti_sessions_update_service ON lti_integration.lti_sessions;

-- Policy: lti_sessions_select_admin
-- Purpose: Admins can view all LTI sessions
CREATE POLICY lti_sessions_select_admin
    ON lti_integration.lti_sessions
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (gamilit.is_admin());

COMMENT ON POLICY lti_sessions_select_admin ON lti_integration.lti_sessions IS
    'Permite a administradores ver todas las sesiones LTI para monitoreo';

-- Policy: lti_sessions_select_own
-- Purpose: Users can view their own LTI sessions
CREATE POLICY lti_sessions_select_own
    ON lti_integration.lti_sessions
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (user_id = gamilit.get_current_user_id());

COMMENT ON POLICY lti_sessions_select_own ON lti_integration.lti_sessions IS
    'Permite a usuarios ver sus propias sesiones LTI';

-- Policy: lti_sessions_select_service
-- Purpose: Service role bypass for LTI launch processing
CREATE POLICY lti_sessions_select_service
    ON lti_integration.lti_sessions
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        current_setting('app.service_role', true) = 'true'
    );

COMMENT ON POLICY lti_sessions_select_service ON lti_integration.lti_sessions IS
    'Permite acceso del servicio backend para procesamiento de launches LTI';

-- Policy: lti_sessions_insert_service
-- Purpose: Only service role can create LTI sessions (during launch)
CREATE POLICY lti_sessions_insert_service
    ON lti_integration.lti_sessions
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (
        current_setting('app.service_role', true) = 'true'
        OR gamilit.is_admin()
    );

COMMENT ON POLICY lti_sessions_insert_service ON lti_integration.lti_sessions IS
    'Solo el servicio backend o admins pueden crear sesiones LTI (durante launch)';

-- Policy: lti_sessions_update_service
-- Purpose: Service role or owner can update session (last_activity, ended_at)
CREATE POLICY lti_sessions_update_service
    ON lti_integration.lti_sessions
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (
        current_setting('app.service_role', true) = 'true'
        OR user_id = gamilit.get_current_user_id()
        OR gamilit.is_admin()
    )
    WITH CHECK (
        current_setting('app.service_role', true) = 'true'
        OR user_id = gamilit.get_current_user_id()
        OR gamilit.is_admin()
    );

COMMENT ON POLICY lti_sessions_update_service ON lti_integration.lti_sessions IS
    'Permite actualizar sesiones LTI (servicio, usuario propietario, o admin)';

-- =====================================================
-- TABLE: lti_integration.lti_grade_passbacks
-- Description: Registro de envio de calificaciones a LMS via AGS
-- Columns: session_id, user_id, consumer_id, passback_status
-- Policies: 6 (SELECT: 3, INSERT: 1, UPDATE: 1, DELETE: 1)
-- =====================================================

-- Drop existing policies if any (including legacy ones from 07-enable-rls.sql)
DROP POLICY IF EXISTS lti_grade_passback_admin_all ON lti_integration.lti_grade_passbacks;
DROP POLICY IF EXISTS lti_grade_passback_user_read_own ON lti_integration.lti_grade_passbacks;
DROP POLICY IF EXISTS lti_grade_passback_select_admin ON lti_integration.lti_grade_passbacks;
DROP POLICY IF EXISTS lti_grade_passback_select_own ON lti_integration.lti_grade_passbacks;
DROP POLICY IF EXISTS lti_grade_passback_select_service ON lti_integration.lti_grade_passbacks;
DROP POLICY IF EXISTS lti_grade_passback_insert_service ON lti_integration.lti_grade_passbacks;
DROP POLICY IF EXISTS lti_grade_passback_update_service ON lti_integration.lti_grade_passbacks;
DROP POLICY IF EXISTS lti_grade_passback_delete_admin ON lti_integration.lti_grade_passbacks;

-- Policy: lti_grade_passback_select_admin
-- Purpose: Admins can view all grade passback records
CREATE POLICY lti_grade_passback_select_admin
    ON lti_integration.lti_grade_passbacks
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (gamilit.is_admin());

COMMENT ON POLICY lti_grade_passback_select_admin ON lti_integration.lti_grade_passbacks IS
    'Permite a administradores ver todos los registros de passback de calificaciones';

-- Policy: lti_grade_passback_select_own
-- Purpose: Users can view their own grade passback records
CREATE POLICY lti_grade_passback_select_own
    ON lti_integration.lti_grade_passbacks
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (user_id = gamilit.get_current_user_id());

COMMENT ON POLICY lti_grade_passback_select_own ON lti_integration.lti_grade_passbacks IS
    'Permite a usuarios ver sus propios registros de passback';

-- Policy: lti_grade_passback_select_service
-- Purpose: Service role bypass for grade sync processing
CREATE POLICY lti_grade_passback_select_service
    ON lti_integration.lti_grade_passbacks
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        current_setting('app.service_role', true) = 'true'
    );

COMMENT ON POLICY lti_grade_passback_select_service ON lti_integration.lti_grade_passbacks IS
    'Permite acceso del servicio backend para procesamiento de sincronizacion de calificaciones';

-- Policy: lti_grade_passback_insert_service
-- Purpose: Only service role can create grade passback records
CREATE POLICY lti_grade_passback_insert_service
    ON lti_integration.lti_grade_passbacks
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (
        current_setting('app.service_role', true) = 'true'
        OR gamilit.is_admin()
    );

COMMENT ON POLICY lti_grade_passback_insert_service ON lti_integration.lti_grade_passbacks IS
    'Solo el servicio backend o admins pueden crear registros de passback';

-- Policy: lti_grade_passback_update_service
-- Purpose: Service role can update passback status (retry logic)
CREATE POLICY lti_grade_passback_update_service
    ON lti_integration.lti_grade_passbacks
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (
        current_setting('app.service_role', true) = 'true'
        OR gamilit.is_admin()
    )
    WITH CHECK (
        current_setting('app.service_role', true) = 'true'
        OR gamilit.is_admin()
    );

COMMENT ON POLICY lti_grade_passback_update_service ON lti_integration.lti_grade_passbacks IS
    'Permite actualizar registros de passback (servicio backend o admin)';

-- Policy: lti_grade_passback_delete_admin
-- Purpose: Only super_admin can delete passback records (audit trail)
CREATE POLICY lti_grade_passback_delete_admin
    ON lti_integration.lti_grade_passbacks
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING (
        EXISTS (
            SELECT 1
            FROM auth_management.profiles
            WHERE id = gamilit.get_current_user_id()
            AND role = 'super_admin'
            AND status = 'active'
        )
    );

COMMENT ON POLICY lti_grade_passback_delete_admin ON lti_integration.lti_grade_passbacks IS
    'Solo super_admin puede eliminar registros de passback (pista de auditoria)';

-- =====================================================
-- SUMMARY: lti_integration schema
-- =====================================================
-- Total policies: 17
-- Tables with policies: 3
-- - lti_consumers: 6 policies (3 SELECT, 1 INSERT, 1 UPDATE, 1 DELETE)
-- - lti_sessions: 5 policies (3 SELECT, 1 INSERT, 1 UPDATE)
-- - lti_grade_passback: 6 policies (3 SELECT, 1 INSERT, 1 UPDATE, 1 DELETE)
--
-- Security Model:
-- - Admin (admin_teacher, super_admin): Full read access, manage config
-- - Teacher: Read active consumers in their tenant
-- - Student: Read own sessions and grade passback
-- - Service Role: Full access for LTI launch and grade sync operations
-- - Super Admin Only: DELETE operations (audit trail protection)
--
-- Gap Reference: GAP-SYS-001 (CRITICAL - Security) - RESOLVED
-- =====================================================
