-- =====================================================
-- Helper Functions for User Blocking System
-- Description: Utility functions for user block management
-- Created: 2026-02-03
-- Ticket: GAP-SOC-004
-- =====================================================

-- =====================================================
-- Function: is_blocked
-- Purpose: Verificar si existe bloqueo entre dos usuarios (en cualquier direccion)
-- Returns: BOOLEAN
-- Use Case: Verificar antes de permitir mensajes o solicitudes de reto
-- =====================================================
CREATE OR REPLACE FUNCTION social_features.is_blocked(
    user1_id UUID,
    user2_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar si existe bloqueo en cualquier direccion
    -- user1 bloqueo a user2 OR user2 bloqueo a user1
    RETURN EXISTS (
        SELECT 1
        FROM social_features.user_blocks
        WHERE (blocker_id = user1_id AND blocked_id = user2_id)
           OR (blocker_id = user2_id AND blocked_id = user1_id)
    );
END;
$$;

COMMENT ON FUNCTION social_features.is_blocked(UUID, UUID) IS
    'Verifica si existe un bloqueo entre dos usuarios (en cualquier direccion). Retorna TRUE si user1 bloqueo a user2 O si user2 bloqueo a user1.';

-- =====================================================
-- Function: has_blocked
-- Purpose: Verificar si user1 ha bloqueado a user2 (unidireccional)
-- Returns: BOOLEAN
-- Use Case: Verificar desde la perspectiva del bloqueador
-- =====================================================
CREATE OR REPLACE FUNCTION social_features.has_blocked(
    blocker_user_id UUID,
    target_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM social_features.user_blocks
        WHERE blocker_id = blocker_user_id
          AND blocked_id = target_user_id
    );
END;
$$;

COMMENT ON FUNCTION social_features.has_blocked(UUID, UUID) IS
    'Verifica si el primer usuario ha bloqueado al segundo (unidireccional)';

-- =====================================================
-- Function: is_blocked_by
-- Purpose: Verificar si user1 esta bloqueado por user2
-- Returns: BOOLEAN
-- Use Case: Verificar desde la perspectiva del bloqueado
-- =====================================================
CREATE OR REPLACE FUNCTION social_features.is_blocked_by(
    target_user_id UUID,
    blocker_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM social_features.user_blocks
        WHERE blocker_id = blocker_user_id
          AND blocked_id = target_user_id
    );
END;
$$;

COMMENT ON FUNCTION social_features.is_blocked_by(UUID, UUID) IS
    'Verifica si el primer usuario esta bloqueado por el segundo';

-- =====================================================
-- Function: count_blocked_users
-- Purpose: Contar cuantos usuarios ha bloqueado un usuario
-- Returns: INTEGER
-- =====================================================
CREATE OR REPLACE FUNCTION social_features.count_blocked_users(
    p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    block_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO block_count
    FROM social_features.user_blocks
    WHERE blocker_id = p_user_id;

    RETURN COALESCE(block_count, 0);
END;
$$;

COMMENT ON FUNCTION social_features.count_blocked_users(UUID) IS
    'Cuenta el numero de usuarios que ha bloqueado un usuario';

-- =====================================================
-- Function: get_blocked_users
-- Purpose: Obtener lista de usuarios bloqueados por un usuario
-- Returns: TABLE (blocked_id UUID, reason VARCHAR, created_at TIMESTAMP)
-- =====================================================
CREATE OR REPLACE FUNCTION social_features.get_blocked_users(
    p_user_id UUID
)
RETURNS TABLE (
    blocked_id UUID,
    reason VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.blocked_id,
        b.reason,
        b.created_at
    FROM social_features.user_blocks b
    WHERE b.blocker_id = p_user_id
    ORDER BY b.created_at DESC;
END;
$$;

COMMENT ON FUNCTION social_features.get_blocked_users(UUID) IS
    'Obtiene la lista de usuarios bloqueados por un usuario con razon y fecha';

-- =====================================================
-- Function: block_user
-- Purpose: Bloquear a un usuario
-- Returns: BOOLEAN (success)
-- Side Effects: También elimina amistad existente si hay
-- =====================================================
CREATE OR REPLACE FUNCTION social_features.block_user(
    p_blocker_id UUID,
    p_blocked_id UUID,
    p_reason VARCHAR(100) DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validar que no se bloquee a si mismo
    IF p_blocker_id = p_blocked_id THEN
        RETURN FALSE;
    END IF;

    -- Insertar bloqueo
    INSERT INTO social_features.user_blocks (blocker_id, blocked_id, reason, notes)
    VALUES (p_blocker_id, p_blocked_id, p_reason, p_notes)
    ON CONFLICT (blocker_id, blocked_id) DO UPDATE
    SET reason = EXCLUDED.reason,
        notes = EXCLUDED.notes;

    -- Eliminar amistad existente si hay (en cualquier direccion)
    DELETE FROM social_features.friendships
    WHERE (user_id = p_blocker_id AND friend_id = p_blocked_id)
       OR (user_id = p_blocked_id AND friend_id = p_blocker_id);

    -- Cancelar solicitudes de amistad pendientes (en cualquier direccion)
    DELETE FROM social_features.friend_requests
    WHERE status = 'pending'
      AND (
          (requester_id = p_blocker_id AND recipient_id = p_blocked_id)
          OR (requester_id = p_blocked_id AND recipient_id = p_blocker_id)
      );

    RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION social_features.block_user(UUID, UUID, VARCHAR, TEXT) IS
    'Bloquea a un usuario. Tambien elimina amistad existente y cancela solicitudes pendientes.';

-- =====================================================
-- Function: unblock_user
-- Purpose: Desbloquear a un usuario
-- Returns: BOOLEAN (success)
-- =====================================================
CREATE OR REPLACE FUNCTION social_features.unblock_user(
    p_blocker_id UUID,
    p_blocked_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM social_features.user_blocks
    WHERE blocker_id = p_blocker_id
      AND blocked_id = p_blocked_id;

    RETURN FOUND;
END;
$$;

COMMENT ON FUNCTION social_features.unblock_user(UUID, UUID) IS
    'Desbloquea a un usuario. Retorna TRUE si se elimino un bloqueo, FALSE si no existia.';

-- =====================================================
-- Function: can_interact
-- Purpose: Verificar si dos usuarios pueden interactuar (no hay bloqueo)
-- Returns: BOOLEAN
-- Use Case: Guard clause antes de permitir cualquier interaccion social
-- =====================================================
CREATE OR REPLACE FUNCTION social_features.can_interact(
    user1_id UUID,
    user2_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    -- Pueden interactuar si NO hay bloqueo en ninguna direccion
    RETURN NOT social_features.is_blocked(user1_id, user2_id);
END;
$$;

COMMENT ON FUNCTION social_features.can_interact(UUID, UUID) IS
    'Verifica si dos usuarios pueden interactuar (no hay bloqueo en ninguna direccion). Usar como guard clause para mensajes, retos, etc.';

