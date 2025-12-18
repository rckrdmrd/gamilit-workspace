-- =====================================================
-- RLS Policies for: social_features.friendships
-- Description: Accepted friendships management with bidirectional access
-- Created: 2025-10-28
-- Updated: 2025-12-05 (DB-GAM-005 - Simplified for accepted friendships only)
-- Policies: 2 (SELECT: 1, DELETE: 1)
-- =====================================================
--
-- Security Strategy:
-- - Read-only via app: Friendships are created by triggers/functions, not direct INSERT
-- - Bidirectional visibility: Both users in a friendship can see it
-- - Privacy: Users cannot see other people's friendships
-- - Deletion: Either user can end the friendship
-- =====================================================
-- IMPORTANTE: Esta tabla solo contiene amistades ACEPTADAS.
-- Las solicitudes se gestionan en social_features.friend_requests
-- =====================================================

-- Habilitar RLS
ALTER TABLE social_features.friendships ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas existentes
DROP POLICY IF EXISTS friendships_read_own ON social_features.friendships;
DROP POLICY IF EXISTS friendships_insert_own ON social_features.friendships;
DROP POLICY IF EXISTS friendships_delete_own ON social_features.friendships;
DROP POLICY IF EXISTS friendships_select_own ON social_features.friendships;

-- =====================================================
-- Policy: friendships_select_own
-- Purpose: Users can see accepted friendships where they participate
-- =====================================================
CREATE POLICY friendships_select_own
    ON social_features.friendships
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        user_id = current_setting('app.current_user_id', true)::uuid
        OR friend_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY friendships_select_own ON social_features.friendships IS
    'Users can see accepted friendships where they are either the user or the friend';

-- =====================================================
-- Policy: friendships_delete_own
-- Purpose: Either user can end the friendship
-- =====================================================
CREATE POLICY friendships_delete_own
    ON social_features.friendships
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING (
        user_id = current_setting('app.current_user_id', true)::uuid
        OR friend_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY friendships_delete_own ON social_features.friendships IS
    'Users can delete (end) friendships they are part of (either as user or friend)';

-- =====================================================
-- NOTA: No hay política INSERT
-- Las amistades se crean mediante funciones/triggers cuando
-- una solicitud de amistad es aceptada.
-- =====================================================
