-- =====================================================
-- DEPRECATED: RLS Policies for gamification_system.notifications
-- Movido a _deprecated: 2026-01-07
-- Razon: Tabla notifications migrada a notifications.notifications
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 3)
-- =====================================================
--
-- NOTA: Este archivo se mantiene como referencia historica.
-- NO se ejecuta en create-database.sh (excluye _deprecated/)
-- La tabla destino (notifications.notifications) tiene sus propias policies
-- en: ddl/schemas/notifications/rls-policies/
-- =====================================================

-- TABLE: gamification_system.notifications
-- Policies: 4 (SELECT: 2, UPDATE: 1, INSERT: 1)

DROP POLICY IF EXISTS notifications_read_own ON gamification_system.notifications;
DROP POLICY IF EXISTS notifications_update_own ON gamification_system.notifications;
DROP POLICY IF EXISTS notifications_insert_system ON gamification_system.notifications;
DROP POLICY IF EXISTS notifications_select_admin ON gamification_system.notifications;

-- Policy: notifications_read_own
-- Purpose: Users can read their own notifications
CREATE POLICY notifications_read_own
    ON gamification_system.notifications
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (user_id = current_setting('app.current_user_id', true)::uuid);

COMMENT ON POLICY notifications_read_own ON gamification_system.notifications IS
    'Users can see only their own notifications';

-- Policy: notifications_update_own
-- Purpose: Users can update their notifications (mark as read)
CREATE POLICY notifications_update_own
    ON gamification_system.notifications
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (user_id = current_setting('app.current_user_id', true)::uuid)
    WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

COMMENT ON POLICY notifications_update_own ON gamification_system.notifications IS
    'Users can mark their own notifications as read';

-- Policy: notifications_insert_system
-- Purpose: System creates notifications
CREATE POLICY notifications_insert_system
    ON gamification_system.notifications
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth_management.user_roles ur
            WHERE ur.user_id = current_setting('app.current_user_id', true)::uuid
                AND ur.role = 'super_admin'
        )
    );

COMMENT ON POLICY notifications_insert_system ON gamification_system.notifications IS
    'Only system can create notifications (via SECURITY DEFINER functions)';

-- Policy: notifications_select_admin
-- Purpose: Admins can read all notifications for monitoring and support
CREATE POLICY notifications_select_admin
    ON gamification_system.notifications
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (gamilit.is_admin());

COMMENT ON POLICY notifications_select_admin ON gamification_system.notifications IS
    'Admins can view all notifications for monitoring and support purposes';
