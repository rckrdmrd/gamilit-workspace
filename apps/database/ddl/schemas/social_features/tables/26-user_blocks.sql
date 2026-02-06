-- =====================================================
-- Table: social_features.user_blocks
-- Description: User blocking functionality for social safety
-- Ticket: GAP-SOC-004
-- Created: 2026-02-03
-- =====================================================
-- Security Feature:
-- - Allows users to block other users
-- - Blocks prevent messaging and challenge requests
-- - Unidirectional: user A blocking user B doesn't affect user B blocking user A
-- =====================================================

CREATE TABLE social_features.user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL,
    blocked_id UUID NOT NULL,
    reason VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),

    -- Evitar duplicados y auto-bloqueo
    CONSTRAINT user_blocks_unique UNIQUE (blocker_id, blocked_id),
    CONSTRAINT user_blocks_no_self CHECK (blocker_id != blocked_id)
);

-- Comentarios
COMMENT ON TABLE social_features.user_blocks IS 'Bloqueos entre usuarios para seguridad social. Previene mensajes y solicitudes de retos.';
COMMENT ON COLUMN social_features.user_blocks.id IS 'Identificador unico del bloqueo';
COMMENT ON COLUMN social_features.user_blocks.blocker_id IS 'ID del usuario que realiza el bloqueo';
COMMENT ON COLUMN social_features.user_blocks.blocked_id IS 'ID del usuario bloqueado';
COMMENT ON COLUMN social_features.user_blocks.reason IS 'Razon categorica del bloqueo (ej: spam, harassment, inappropriate)';
COMMENT ON COLUMN social_features.user_blocks.notes IS 'Notas adicionales privadas del usuario';
COMMENT ON COLUMN social_features.user_blocks.created_at IS 'Fecha de creacion del bloqueo';

-- Indices para busquedas eficientes
CREATE INDEX idx_user_blocks_blocker_id ON social_features.user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked_id ON social_features.user_blocks(blocked_id);

-- Indice compuesto para busquedas bidireccionales eficientes
-- Util para verificar si existe bloqueo en cualquier direccion
CREATE INDEX idx_user_blocks_bidirectional ON social_features.user_blocks(blocker_id, blocked_id);

-- Foreign Keys
ALTER TABLE social_features.user_blocks
    ADD CONSTRAINT user_blocks_blocker_id_fkey
    FOREIGN KEY (blocker_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

ALTER TABLE social_features.user_blocks
    ADD CONSTRAINT user_blocks_blocked_id_fkey
    FOREIGN KEY (blocked_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

-- Permisos
ALTER TABLE social_features.user_blocks OWNER TO gamilit_user;
GRANT ALL ON TABLE social_features.user_blocks TO gamilit_user;

