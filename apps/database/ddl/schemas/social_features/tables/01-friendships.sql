-- =====================================================
-- Table: social_features.friendships
-- Description: Relaciones de amistad ACEPTADAS entre usuarios
-- Ticket: DB-GAM-003
-- Created: 2025-12-05
-- =====================================================
-- IMPORTANTE: Esta tabla solo contiene amistades confirmadas.
-- Las solicitudes pendientes están en social_features.friend_requests
-- =====================================================

DROP TABLE IF EXISTS social_features.friendships CASCADE;

CREATE TABLE social_features.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    friend_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'accepted' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),

    -- Validacion de estados
    CONSTRAINT friendships_status_check CHECK (
        status IN ('pending', 'accepted', 'rejected', 'blocked')
    ),

    -- Evitar duplicados y auto-amistad
    CONSTRAINT friendships_unique UNIQUE (user_id, friend_id),
    CONSTRAINT friendships_no_self CHECK (user_id != friend_id)
);

-- Comentarios
COMMENT ON TABLE social_features.friendships IS 'Relaciones de amistad entre usuarios. Estados: pending, accepted, rejected, blocked.';
COMMENT ON COLUMN social_features.friendships.user_id IS 'ID del usuario que inicio la amistad';
COMMENT ON COLUMN social_features.friendships.friend_id IS 'ID del usuario amigo';
COMMENT ON COLUMN social_features.friendships.status IS 'Estado de la amistad: pending, accepted, rejected, blocked';
COMMENT ON COLUMN social_features.friendships.created_at IS 'Fecha de creacion de la solicitud de amistad';
COMMENT ON COLUMN social_features.friendships.updated_at IS 'Fecha de ultima actualizacion (cambio de estado)';

-- Indices para busquedas eficientes
CREATE INDEX idx_friendships_user_id ON social_features.friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON social_features.friendships(friend_id);
CREATE INDEX idx_friendships_status ON social_features.friendships(status);

-- Foreign Keys
ALTER TABLE social_features.friendships
    ADD CONSTRAINT friendships_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

ALTER TABLE social_features.friendships
    ADD CONSTRAINT friendships_friend_id_fkey
    FOREIGN KEY (friend_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

-- Permisos
ALTER TABLE social_features.friendships OWNER TO gamilit_user;
GRANT ALL ON TABLE social_features.friendships TO gamilit_user;

