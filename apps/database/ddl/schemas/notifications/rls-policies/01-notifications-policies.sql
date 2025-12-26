-- =====================================================
-- RLS Policies for notifications schema
-- Description: Políticas de seguridad para sistema de notificaciones
-- Created: 2025-12-14
-- Priority: P0 - CRÍTICO (Auditoría AUDIT-DB-001)
-- =====================================================
--
-- Security Strategy:
-- - Users can only see their own notifications
-- - Users can only modify their own preferences
-- - System can create notifications for any user (via SECURITY DEFINER)
-- - Admins have full access for monitoring
-- =====================================================

-- =====================================================
-- TABLE: notifications.notifications
-- =====================================================

-- Enable RLS
ALTER TABLE notifications.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications.notifications FORCE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS notifications_select_own ON notifications.notifications;
DROP POLICY IF EXISTS notifications_select_admin ON notifications.notifications;
DROP POLICY IF EXISTS notifications_update_own ON notifications.notifications;
DROP POLICY IF EXISTS notifications_delete_own ON notifications.notifications;

-- Policy: notifications_select_own
-- Purpose: Users can only see their own notifications
CREATE POLICY notifications_select_own
    ON notifications.notifications
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        user_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY notifications_select_own ON notifications.notifications IS
    'Usuarios solo pueden ver sus propias notificaciones';

-- Policy: notifications_select_admin
-- Purpose: Admins can see all notifications
CREATE POLICY notifications_select_admin
    ON notifications.notifications
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            WHERE p.id = current_setting('app.current_user_id', true)::uuid
              AND p.role = 'super_admin'
        )
    );

COMMENT ON POLICY notifications_select_admin ON notifications.notifications IS
    'Administradores pueden ver todas las notificaciones';

-- Policy: notifications_update_own
-- Purpose: Users can mark their notifications as read
CREATE POLICY notifications_update_own
    ON notifications.notifications
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (
        user_id = current_setting('app.current_user_id', true)::uuid
    )
    WITH CHECK (
        user_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY notifications_update_own ON notifications.notifications IS
    'Usuarios solo pueden actualizar sus propias notificaciones (marcar como leídas)';

-- Policy: notifications_delete_own
-- Purpose: Users can delete their own notifications
CREATE POLICY notifications_delete_own
    ON notifications.notifications
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING (
        user_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY notifications_delete_own ON notifications.notifications IS
    'Usuarios solo pueden eliminar sus propias notificaciones';

-- =====================================================
-- TABLE: notifications.notification_preferences
-- =====================================================

-- Enable RLS
ALTER TABLE notifications.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications.notification_preferences FORCE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS notification_preferences_select_own ON notifications.notification_preferences;
DROP POLICY IF EXISTS notification_preferences_insert_own ON notifications.notification_preferences;
DROP POLICY IF EXISTS notification_preferences_update_own ON notifications.notification_preferences;

-- Policy: notification_preferences_select_own
CREATE POLICY notification_preferences_select_own
    ON notifications.notification_preferences
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        user_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY notification_preferences_select_own ON notifications.notification_preferences IS
    'Usuarios solo pueden ver sus propias preferencias de notificación';

-- Policy: notification_preferences_insert_own
CREATE POLICY notification_preferences_insert_own
    ON notifications.notification_preferences
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (
        user_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY notification_preferences_insert_own ON notifications.notification_preferences IS
    'Usuarios solo pueden crear preferencias para sí mismos';

-- Policy: notification_preferences_update_own
CREATE POLICY notification_preferences_update_own
    ON notifications.notification_preferences
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (
        user_id = current_setting('app.current_user_id', true)::uuid
    )
    WITH CHECK (
        user_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY notification_preferences_update_own ON notifications.notification_preferences IS
    'Usuarios solo pueden modificar sus propias preferencias de notificación';

-- =====================================================
-- TABLE: notifications.notification_logs
-- =====================================================

-- Enable RLS
ALTER TABLE notifications.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications.notification_logs FORCE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS notification_logs_select_own ON notifications.notification_logs;
DROP POLICY IF EXISTS notification_logs_select_admin ON notifications.notification_logs;

-- Policy: notification_logs_select_own
-- CORREGIDO 2025-12-26: notification_logs no tiene user_id directamente,
-- se obtiene a traves de la relacion con notifications
CREATE POLICY notification_logs_select_own
    ON notifications.notification_logs
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM notifications.notifications n
            WHERE n.id = notification_logs.notification_id
            AND n.user_id = current_setting('app.current_user_id', true)::uuid
        )
    );

COMMENT ON POLICY notification_logs_select_own ON notifications.notification_logs IS
    'Usuarios pueden ver logs de sus propias notificaciones (via JOIN con notifications)';

-- Policy: notification_logs_select_admin
CREATE POLICY notification_logs_select_admin
    ON notifications.notification_logs
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            WHERE p.id = current_setting('app.current_user_id', true)::uuid
              AND p.role = 'super_admin'
        )
    );

COMMENT ON POLICY notification_logs_select_admin ON notifications.notification_logs IS
    'Administradores pueden ver todos los logs de notificaciones';

-- =====================================================
-- TABLE: notifications.user_devices (para push notifications)
-- =====================================================

-- Enable RLS
ALTER TABLE notifications.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications.user_devices FORCE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS user_devices_select_own ON notifications.user_devices;
DROP POLICY IF EXISTS user_devices_insert_own ON notifications.user_devices;
DROP POLICY IF EXISTS user_devices_update_own ON notifications.user_devices;
DROP POLICY IF EXISTS user_devices_delete_own ON notifications.user_devices;

-- Policy: user_devices_all_own
CREATE POLICY user_devices_select_own
    ON notifications.user_devices
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        user_id = current_setting('app.current_user_id', true)::uuid
    );

CREATE POLICY user_devices_insert_own
    ON notifications.user_devices
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (
        user_id = current_setting('app.current_user_id', true)::uuid
    );

CREATE POLICY user_devices_update_own
    ON notifications.user_devices
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (
        user_id = current_setting('app.current_user_id', true)::uuid
    );

CREATE POLICY user_devices_delete_own
    ON notifications.user_devices
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING (
        user_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY user_devices_select_own ON notifications.user_devices IS
    'Usuarios solo pueden ver sus propios dispositivos registrados';

-- =====================================================
-- SUMMARY
-- =====================================================
-- Tables with RLS enabled: 4
-- - notifications.notifications (4 policies)
-- - notifications.notification_preferences (3 policies)
-- - notifications.notification_logs (2 policies)
-- - notifications.user_devices (4 policies)
--
-- Total policies: 13
--
-- Security enforced:
-- - Users cannot read other users' notifications
-- - Users cannot modify other users' preferences
-- - Users cannot see other users' registered devices
-- - Admins have read-only access for monitoring
-- - INSERT for notifications uses SECURITY DEFINER functions
-- =====================================================
