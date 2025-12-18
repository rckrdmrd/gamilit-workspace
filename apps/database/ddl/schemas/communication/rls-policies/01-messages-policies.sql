-- =====================================================
-- RLS Policies for communication.messages
-- Description: Políticas de seguridad para mensajes privados
-- Created: 2025-12-14
-- Priority: P0 - CRÍTICO (Auditoría AUDIT-DB-001)
-- =====================================================
--
-- Security Strategy:
-- - Users can only see messages where they are sender or recipient
-- - Users can only see classroom messages if they are members
-- - Moderation access for admins
-- - Soft-delete respects ownership
-- =====================================================

-- =====================================================
-- Enable RLS
-- =====================================================
ALTER TABLE communication.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication.messages FORCE ROW LEVEL SECURITY;

-- =====================================================
-- Drop existing policies (if any)
-- =====================================================
DROP POLICY IF EXISTS messages_select_own ON communication.messages;
DROP POLICY IF EXISTS messages_select_classroom ON communication.messages;
DROP POLICY IF EXISTS messages_select_admin ON communication.messages;
DROP POLICY IF EXISTS messages_insert_own ON communication.messages;
DROP POLICY IF EXISTS messages_update_own ON communication.messages;
DROP POLICY IF EXISTS messages_delete_own ON communication.messages;

-- =====================================================
-- SELECT Policies
-- =====================================================

-- Policy: messages_select_own
-- Purpose: Users can read messages where they are sender or recipient
CREATE POLICY messages_select_own
    ON communication.messages
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        sender_id = current_setting('app.current_user_id', true)::uuid
        OR recipient_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY messages_select_own ON communication.messages IS
    'Permite a los usuarios ver mensajes donde son remitente o destinatario';

-- Policy: messages_select_classroom
-- Purpose: Users can read classroom messages if they are members
CREATE POLICY messages_select_classroom
    ON communication.messages
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        classroom_id IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM social_features.classroom_members cm
            WHERE cm.classroom_id = communication.messages.classroom_id
              AND cm.student_id = current_setting('app.current_user_id', true)::uuid
        )
    );

COMMENT ON POLICY messages_select_classroom ON communication.messages IS
    'Permite a los miembros del aula ver mensajes del aula';

-- Policy: messages_select_admin
-- Purpose: Admins can read all messages for moderation
CREATE POLICY messages_select_admin
    ON communication.messages
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            WHERE p.id = current_setting('app.current_user_id', true)::uuid
              AND p.role IN ('super_admin', 'admin_teacher')
        )
    );

COMMENT ON POLICY messages_select_admin ON communication.messages IS
    'Permite a los administradores ver todos los mensajes (moderación)';

-- =====================================================
-- INSERT Policies
-- =====================================================

-- Policy: messages_insert_own
-- Purpose: Users can send messages as themselves
CREATE POLICY messages_insert_own
    ON communication.messages
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (
        sender_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY messages_insert_own ON communication.messages IS
    'Los usuarios solo pueden enviar mensajes como ellos mismos';

-- =====================================================
-- UPDATE Policies
-- =====================================================

-- Policy: messages_update_own
-- Purpose: Users can update/edit their own messages
CREATE POLICY messages_update_own
    ON communication.messages
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (
        sender_id = current_setting('app.current_user_id', true)::uuid
    )
    WITH CHECK (
        sender_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY messages_update_own ON communication.messages IS
    'Los usuarios solo pueden editar sus propios mensajes';

-- =====================================================
-- DELETE Policies
-- =====================================================

-- Policy: messages_delete_own
-- Purpose: Users can soft-delete their own messages
CREATE POLICY messages_delete_own
    ON communication.messages
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING (
        sender_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY messages_delete_own ON communication.messages IS
    'Los usuarios solo pueden eliminar sus propios mensajes';

-- =====================================================
-- SUMMARY
-- =====================================================
-- Total policies: 6
-- - SELECT: 3 (own, classroom members, admin)
-- - INSERT: 1 (only as self)
-- - UPDATE: 1 (only own messages)
-- - DELETE: 1 (only own messages)
--
-- Security enforced:
-- - Users cannot read other users' direct messages
-- - Users cannot read classroom messages unless members
-- - Users cannot impersonate others (sender_id check)
-- - Admins have moderation access (audit trail preserved)
-- =====================================================
