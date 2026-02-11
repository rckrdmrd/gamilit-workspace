-- =====================================================
-- Table: social_features.guild_join_requests
-- Description: Solicitudes de union a gremios
-- Ticket: DB-GAM-013
-- Created: 2026-02-03
-- =====================================================

DROP TABLE IF EXISTS social_features.guild_join_requests CASCADE;

CREATE TABLE social_features.guild_join_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id UUID NOT NULL,
    requester_id UUID NOT NULL,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    responded_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    responded_at TIMESTAMP WITH TIME ZONE,

    -- Estados validos
    CONSTRAINT guild_join_requests_status_check CHECK (
        status IN ('pending', 'accepted', 'rejected', 'cancelled')
    )
);

-- Comentarios
COMMENT ON TABLE social_features.guild_join_requests IS 'Solicitudes de union a gremios pendientes y procesadas';
COMMENT ON COLUMN social_features.guild_join_requests.id IS 'ID unico de la solicitud';
COMMENT ON COLUMN social_features.guild_join_requests.guild_id IS 'ID del gremio al que se solicita unirse';
COMMENT ON COLUMN social_features.guild_join_requests.requester_id IS 'ID del usuario solicitante';
COMMENT ON COLUMN social_features.guild_join_requests.message IS 'Mensaje opcional del solicitante';
COMMENT ON COLUMN social_features.guild_join_requests.status IS 'Estado: pending, accepted, rejected, cancelled';
COMMENT ON COLUMN social_features.guild_join_requests.responded_by IS 'ID del lider/officer que respondio';
COMMENT ON COLUMN social_features.guild_join_requests.created_at IS 'Fecha de creacion de la solicitud';
COMMENT ON COLUMN social_features.guild_join_requests.responded_at IS 'Fecha de respuesta';

-- Indices
CREATE INDEX idx_guild_join_requests_guild_id ON social_features.guild_join_requests(guild_id);
CREATE INDEX idx_guild_join_requests_requester_id ON social_features.guild_join_requests(requester_id);
CREATE INDEX idx_guild_join_requests_status ON social_features.guild_join_requests(status) WHERE status = 'pending';
CREATE INDEX idx_guild_join_requests_created_at ON social_features.guild_join_requests(created_at);

-- Indice parcial unico para evitar solicitudes duplicadas pendientes
CREATE UNIQUE INDEX idx_guild_join_requests_unique_pending
    ON social_features.guild_join_requests(guild_id, requester_id)
    WHERE status = 'pending';

-- Foreign Keys
ALTER TABLE social_features.guild_join_requests
    ADD CONSTRAINT guild_join_requests_guild_id_fkey
    FOREIGN KEY (guild_id) REFERENCES social_features.guilds(id) ON DELETE CASCADE;

ALTER TABLE social_features.guild_join_requests
    ADD CONSTRAINT guild_join_requests_requester_id_fkey
    FOREIGN KEY (requester_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

ALTER TABLE social_features.guild_join_requests
    ADD CONSTRAINT guild_join_requests_responded_by_fkey
    FOREIGN KEY (responded_by) REFERENCES auth_management.profiles(id) ON DELETE SET NULL;

-- Permisos
ALTER TABLE social_features.guild_join_requests OWNER TO gamilit_user;
GRANT ALL ON TABLE social_features.guild_join_requests TO gamilit_user;
