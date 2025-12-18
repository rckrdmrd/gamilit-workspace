-- =====================================================
-- Table: social_features.friend_requests
-- Description: Solicitudes de amistad entre usuarios
-- Ticket: DB-GAM-004
-- Created: 2025-12-05
-- =====================================================
-- Estados posibles:
-- - pending: Solicitud enviada, esperando respuesta
-- - accepted: Aceptada (se crea registro en friendships)
-- - rejected: Rechazada por el destinatario
-- - cancelled: Cancelada por el solicitante
-- =====================================================

CREATE TABLE social_features.friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL,
    recipient_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    responded_at TIMESTAMP WITH TIME ZONE,

    -- Validación de estados
    CONSTRAINT friend_requests_status_check CHECK (
        status IN ('pending', 'accepted', 'rejected', 'cancelled')
    ),

    -- Evitar duplicados y auto-solicitud
    CONSTRAINT friend_requests_unique UNIQUE (requester_id, recipient_id),
    CONSTRAINT friend_requests_no_self CHECK (requester_id != recipient_id)
);

-- Comentarios
COMMENT ON TABLE social_features.friend_requests IS 'Solicitudes de amistad entre usuarios. Incluye estados: pending, accepted, rejected, cancelled';
COMMENT ON COLUMN social_features.friend_requests.requester_id IS 'ID del usuario que envía la solicitud';
COMMENT ON COLUMN social_features.friend_requests.recipient_id IS 'ID del usuario que recibe la solicitud';
COMMENT ON COLUMN social_features.friend_requests.status IS 'Estado de la solicitud: pending, accepted, rejected, cancelled';
COMMENT ON COLUMN social_features.friend_requests.message IS 'Mensaje opcional del solicitante';
COMMENT ON COLUMN social_features.friend_requests.created_at IS 'Fecha de creación de la solicitud';
COMMENT ON COLUMN social_features.friend_requests.responded_at IS 'Fecha de respuesta (aceptación/rechazo)';

-- Índices para búsquedas eficientes
CREATE INDEX idx_friend_requests_requester ON social_features.friend_requests(requester_id);
CREATE INDEX idx_friend_requests_recipient ON social_features.friend_requests(recipient_id);
CREATE INDEX idx_friend_requests_status ON social_features.friend_requests(status);
CREATE INDEX idx_friend_requests_created_at ON social_features.friend_requests(created_at);

-- Índice compuesto para búsquedas de solicitudes pendientes por usuario
CREATE INDEX idx_friend_requests_recipient_status ON social_features.friend_requests(recipient_id, status)
    WHERE status = 'pending';

-- Foreign Keys
ALTER TABLE social_features.friend_requests
    ADD CONSTRAINT friend_requests_requester_id_fkey
    FOREIGN KEY (requester_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

ALTER TABLE social_features.friend_requests
    ADD CONSTRAINT friend_requests_recipient_id_fkey
    FOREIGN KEY (recipient_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

-- Permisos
ALTER TABLE social_features.friend_requests OWNER TO gamilit_user;
GRANT ALL ON TABLE social_features.friend_requests TO gamilit_user;
