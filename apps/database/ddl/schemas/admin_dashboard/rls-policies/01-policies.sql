-- =====================================================
-- RLS Policies for admin_dashboard schema
-- Description: Politicas de seguridad para tablas admin_reports y metrics_history
-- Created: 2026-02-17 (CORR-F2-02)
-- =====================================================
--
-- Security Strategy:
-- - admin_reports: Admin full access + creator read own
-- - metrics_history: Admin-only (system metrics)
-- - bulk_operations: Policies defined in 07b/07d (not duplicated here)
-- =====================================================

-- =====================================================
-- TABLE: admin_dashboard.admin_reports
-- Description: Reportes generados por administradores
-- Policies: 3 (ALL admin, SELECT own, INSERT own)
-- =====================================================

DROP POLICY IF EXISTS admin_reports_admin_all ON admin_dashboard.admin_reports;
DROP POLICY IF EXISTS admin_reports_read_own ON admin_dashboard.admin_reports;
DROP POLICY IF EXISTS admin_reports_insert_own ON admin_dashboard.admin_reports;

ALTER TABLE admin_dashboard.admin_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_dashboard.admin_reports FORCE ROW LEVEL SECURITY;

CREATE POLICY admin_reports_admin_all
    ON admin_dashboard.admin_reports
    AS PERMISSIVE FOR ALL TO public
    USING (gamilit.is_admin() OR gamilit.is_super_admin());

COMMENT ON POLICY admin_reports_admin_all ON admin_dashboard.admin_reports IS
    'Admins tienen acceso completo a reportes administrativos';

CREATE POLICY admin_reports_read_own
    ON admin_dashboard.admin_reports
    AS PERMISSIVE FOR SELECT TO public
    USING (requested_by = gamilit.get_current_user_id());

COMMENT ON POLICY admin_reports_read_own ON admin_dashboard.admin_reports IS
    'Usuarios pueden leer reportes que ellos solicitaron';

CREATE POLICY admin_reports_insert_own
    ON admin_dashboard.admin_reports
    AS PERMISSIVE FOR INSERT TO public
    WITH CHECK (requested_by = gamilit.get_current_user_id());

COMMENT ON POLICY admin_reports_insert_own ON admin_dashboard.admin_reports IS
    'Usuarios pueden crear reportes a su nombre';

-- =====================================================
-- TABLE: admin_dashboard.metrics_history
-- Description: Historial de metricas del sistema (admin-only)
-- Policies: 2 (ALL admin, INSERT system)
-- =====================================================

DROP POLICY IF EXISTS metrics_history_admin_all ON admin_dashboard.metrics_history;
DROP POLICY IF EXISTS metrics_history_system_insert ON admin_dashboard.metrics_history;

ALTER TABLE admin_dashboard.metrics_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_dashboard.metrics_history FORCE ROW LEVEL SECURITY;

CREATE POLICY metrics_history_admin_all
    ON admin_dashboard.metrics_history
    AS PERMISSIVE FOR ALL TO public
    USING (gamilit.is_admin() OR gamilit.is_super_admin());

COMMENT ON POLICY metrics_history_admin_all ON admin_dashboard.metrics_history IS
    'Solo admins pueden ver y gestionar historial de metricas del sistema';

CREATE POLICY metrics_history_system_insert
    ON admin_dashboard.metrics_history
    AS PERMISSIVE FOR INSERT TO public
    WITH CHECK (true);

COMMENT ON POLICY metrics_history_system_insert ON admin_dashboard.metrics_history IS
    'Sistema puede insertar metricas via jobs automaticos';

-- =====================================================
-- SUMMARY
-- =====================================================
-- admin_reports: 3 policies (ALL admin, SELECT own, INSERT own)
-- metrics_history: 2 policies (ALL admin, INSERT system)
-- bulk_operations: Policies in 07b/07d (NOT duplicated here)
-- Total new policies: 5
-- =====================================================
