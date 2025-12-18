-- =====================================================
-- Helper Functions for Friendship System
-- Description: Utility functions for friendship management
-- Created: 2025-12-05
-- Ticket: DB-GAM-005
-- =====================================================

-- =====================================================
-- Function: are_friends
-- Purpose: Verificar si dos usuarios son amigos
-- Returns: BOOLEAN
-- =====================================================
CREATE OR REPLACE FUNCTION social_features.are_friends(
    user1_id UUID,
    user2_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM social_features.friendships
        WHERE (user_id = user1_id AND friend_id = user2_id)
           OR (user_id = user2_id AND friend_id = user1_id)
    );
END;
$$;

COMMENT ON FUNCTION social_features.are_friends(UUID, UUID) IS
    'Verifica si dos usuarios son amigos (en cualquier dirección)';

-- =====================================================
-- Function: count_friends
-- Purpose: Contar número de amigos de un usuario
-- Returns: INTEGER
-- =====================================================
CREATE OR REPLACE FUNCTION social_features.count_friends(
    p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    friend_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO friend_count
    FROM social_features.friendships
    WHERE user_id = p_user_id OR friend_id = p_user_id;

    RETURN COALESCE(friend_count, 0);
END;
$$;

COMMENT ON FUNCTION social_features.count_friends(UUID) IS
    'Cuenta el número de amigos de un usuario';

-- =====================================================
-- Function: get_user_friends
-- Purpose: Obtener lista de amigos de un usuario
-- Returns: TABLE (friend_id UUID, created_at TIMESTAMP)
-- =====================================================
CREATE OR REPLACE FUNCTION social_features.get_user_friends(
    p_user_id UUID
)
RETURNS TABLE (
    friend_id UUID,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        CASE
            WHEN f.user_id = p_user_id THEN f.friend_id
            ELSE f.user_id
        END AS friend_id,
        f.created_at
    FROM social_features.friendships f
    WHERE f.user_id = p_user_id OR f.friend_id = p_user_id
    ORDER BY f.created_at DESC;
END;
$$;

COMMENT ON FUNCTION social_features.get_user_friends(UUID) IS
    'Obtiene la lista de amigos de un usuario con fechas de amistad';

-- =====================================================
-- Function: has_pending_friend_request
-- Purpose: Verificar si existe solicitud pendiente entre usuarios
-- Returns: BOOLEAN
-- =====================================================
CREATE OR REPLACE FUNCTION social_features.has_pending_friend_request(
    user1_id UUID,
    user2_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM social_features.friend_requests
        WHERE status = 'pending'
          AND (
              (requester_id = user1_id AND recipient_id = user2_id)
              OR (requester_id = user2_id AND recipient_id = user1_id)
          )
    );
END;
$$;

COMMENT ON FUNCTION social_features.has_pending_friend_request(UUID, UUID) IS
    'Verifica si existe una solicitud de amistad pendiente entre dos usuarios (en cualquier dirección)';

-- =====================================================
-- Function: count_pending_friend_requests
-- Purpose: Contar solicitudes pendientes recibidas por un usuario
-- Returns: INTEGER
-- =====================================================
CREATE OR REPLACE FUNCTION social_features.count_pending_friend_requests(
    p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    request_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO request_count
    FROM social_features.friend_requests
    WHERE recipient_id = p_user_id
      AND status = 'pending';

    RETURN COALESCE(request_count, 0);
END;
$$;

COMMENT ON FUNCTION social_features.count_pending_friend_requests(UUID) IS
    'Cuenta el número de solicitudes de amistad pendientes que ha recibido un usuario';

-- =====================================================
-- Function: accept_friend_request
-- Purpose: Aceptar solicitud de amistad (crea registro en friendships)
-- Returns: BOOLEAN (success)
-- =====================================================
CREATE OR REPLACE FUNCTION social_features.accept_friend_request(
    p_request_id UUID,
    p_recipient_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_requester_id UUID;
    v_recipient_id UUID;
BEGIN
    -- Verificar que la solicitud existe, está pendiente y el usuario es el destinatario
    SELECT requester_id, recipient_id
    INTO v_requester_id, v_recipient_id
    FROM social_features.friend_requests
    WHERE id = p_request_id
      AND recipient_id = p_recipient_id
      AND status = 'pending';

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Actualizar solicitud a 'accepted'
    UPDATE social_features.friend_requests
    SET status = 'accepted',
        responded_at = gamilit.now_mexico()
    WHERE id = p_request_id;

    -- Crear amistad (bidireccional: insertar solo una vez)
    INSERT INTO social_features.friendships (user_id, friend_id)
    VALUES (v_requester_id, v_recipient_id)
    ON CONFLICT (user_id, friend_id) DO NOTHING;

    RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION social_features.accept_friend_request(UUID, UUID) IS
    'Acepta una solicitud de amistad y crea el registro de amistad correspondiente';

-- =====================================================
-- Function: reject_friend_request
-- Purpose: Rechazar solicitud de amistad
-- Returns: BOOLEAN (success)
-- =====================================================
CREATE OR REPLACE FUNCTION social_features.reject_friend_request(
    p_request_id UUID,
    p_recipient_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    -- Actualizar solicitud a 'rejected'
    UPDATE social_features.friend_requests
    SET status = 'rejected',
        responded_at = gamilit.now_mexico()
    WHERE id = p_request_id
      AND recipient_id = p_recipient_id
      AND status = 'pending';

    RETURN FOUND;
END;
$$;

COMMENT ON FUNCTION social_features.reject_friend_request(UUID, UUID) IS
    'Rechaza una solicitud de amistad';

-- =====================================================
-- Function: cancel_friend_request
-- Purpose: Cancelar solicitud de amistad (por el solicitante)
-- Returns: BOOLEAN (success)
-- =====================================================
CREATE OR REPLACE FUNCTION social_features.cancel_friend_request(
    p_request_id UUID,
    p_requester_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    -- Actualizar solicitud a 'cancelled' o eliminarla
    DELETE FROM social_features.friend_requests
    WHERE id = p_request_id
      AND requester_id = p_requester_id
      AND status = 'pending';

    RETURN FOUND;
END;
$$;

COMMENT ON FUNCTION social_features.cancel_friend_request(UUID, UUID) IS
    'Cancela (elimina) una solicitud de amistad pendiente por parte del solicitante';

-- =====================================================
-- Function: remove_friendship
-- Purpose: Eliminar amistad entre dos usuarios
-- Returns: BOOLEAN (success)
-- =====================================================
CREATE OR REPLACE FUNCTION social_features.remove_friendship(
    p_user_id UUID,
    other_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    -- Eliminar amistad (en cualquier dirección)
    DELETE FROM social_features.friendships
    WHERE (user_id = p_user_id AND friend_id = other_user_id)
       OR (user_id = other_user_id AND friend_id = p_user_id);

    RETURN FOUND;
END;
$$;

COMMENT ON FUNCTION social_features.remove_friendship(UUID, UUID) IS
    'Elimina la amistad entre dos usuarios (en cualquier dirección)';
