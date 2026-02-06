-- =====================================================
-- Table: social_features.user_reports
-- Description: Content and user reporting for moderation
-- Ticket: GAP-SOC-005
-- Created: 2026-02-03
-- =====================================================
-- Moderation Feature:
-- - Allows users to report inappropriate content or users
-- - Supports polymorphic reporting (users, messages, challenges, guilds, etc.)
-- - Tracks moderation workflow from open to resolution
-- - Enables moderation panel functionality
-- =====================================================

CREATE TABLE social_features.user_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Reporter
    reporter_id UUID NOT NULL,

    -- Reported entity (polymorphic)
    report_type VARCHAR(50) NOT NULL,
    reported_user_id UUID,
    reported_entity_id UUID,
    reported_entity_type VARCHAR(50),

    -- Report details
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    evidence_urls TEXT[],

    -- Moderation
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    priority VARCHAR(20) NOT NULL DEFAULT 'normal',
    assigned_to UUID,

    -- Resolution
    resolution VARCHAR(100),
    resolution_notes TEXT,
    action_taken VARCHAR(100),
    resolved_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),

    -- Constraints
    CONSTRAINT user_reports_report_type_check CHECK (
        report_type IN ('user', 'message', 'content', 'challenge', 'guild', 'team', 'classroom')
    ),
    CONSTRAINT user_reports_reason_check CHECK (
        reason IN ('harassment', 'spam', 'inappropriate', 'cheating', 'hate_speech', 'impersonation', 'privacy_violation', 'other')
    ),
    CONSTRAINT user_reports_status_check CHECK (
        status IN ('open', 'under_review', 'resolved', 'dismissed', 'escalated')
    ),
    CONSTRAINT user_reports_priority_check CHECK (
        priority IN ('low', 'normal', 'high', 'urgent', 'critical')
    ),
    CONSTRAINT user_reports_action_taken_check CHECK (
        action_taken IS NULL OR action_taken IN (
            'warning_issued', 'content_removed', 'user_suspended',
            'user_banned', 'none', 'education_provided', 'account_restricted'
        )
    ),
    -- Ensure reported_user_id is set when report_type is 'user'
    CONSTRAINT user_reports_user_type_requires_user_id CHECK (
        report_type != 'user' OR reported_user_id IS NOT NULL
    ),
    -- Ensure entity info is provided for non-user reports
    CONSTRAINT user_reports_entity_type_requires_entity CHECK (
        report_type = 'user' OR (reported_entity_id IS NOT NULL AND reported_entity_type IS NOT NULL)
    ),
    -- Reporter cannot report themselves
    CONSTRAINT user_reports_no_self_report CHECK (
        reporter_id != reported_user_id OR reported_user_id IS NULL
    )
);

-- Comentarios
COMMENT ON TABLE social_features.user_reports IS
    'Reportes de usuarios para moderacion. Soporta reportes de usuarios, mensajes, contenido, retos, gremios, equipos y aulas.';

COMMENT ON COLUMN social_features.user_reports.id IS 'Identificador unico del reporte';
COMMENT ON COLUMN social_features.user_reports.reporter_id IS 'ID del usuario que realiza el reporte';
COMMENT ON COLUMN social_features.user_reports.report_type IS 'Tipo de entidad reportada: user, message, content, challenge, guild, team, classroom';
COMMENT ON COLUMN social_features.user_reports.reported_user_id IS 'ID del usuario reportado (obligatorio si report_type=user, opcional para otros)';
COMMENT ON COLUMN social_features.user_reports.reported_entity_id IS 'ID de la entidad reportada (mensaje, reto, etc.)';
COMMENT ON COLUMN social_features.user_reports.reported_entity_type IS 'Nombre de la tabla de la entidad reportada para referencia';
COMMENT ON COLUMN social_features.user_reports.reason IS 'Razon categorica del reporte: harassment, spam, inappropriate, cheating, hate_speech, impersonation, privacy_violation, other';
COMMENT ON COLUMN social_features.user_reports.description IS 'Descripcion detallada del problema reportado';
COMMENT ON COLUMN social_features.user_reports.evidence_urls IS 'Array de URLs de evidencia (capturas, enlaces)';
COMMENT ON COLUMN social_features.user_reports.status IS 'Estado del reporte: open, under_review, resolved, dismissed, escalated';
COMMENT ON COLUMN social_features.user_reports.priority IS 'Prioridad del reporte: low, normal, high, urgent, critical';
COMMENT ON COLUMN social_features.user_reports.assigned_to IS 'ID del moderador asignado al reporte';
COMMENT ON COLUMN social_features.user_reports.resolution IS 'Resumen de la resolucion tomada';
COMMENT ON COLUMN social_features.user_reports.resolution_notes IS 'Notas detalladas sobre la resolucion (solo moderadores)';
COMMENT ON COLUMN social_features.user_reports.action_taken IS 'Accion tomada: warning_issued, content_removed, user_suspended, user_banned, none, education_provided, account_restricted';
COMMENT ON COLUMN social_features.user_reports.resolved_by IS 'ID del moderador que resolvio el reporte';
COMMENT ON COLUMN social_features.user_reports.resolved_at IS 'Timestamp de resolucion del reporte';
COMMENT ON COLUMN social_features.user_reports.created_at IS 'Timestamp de creacion del reporte';
COMMENT ON COLUMN social_features.user_reports.updated_at IS 'Timestamp de ultima actualizacion del reporte';

-- =====================================================
-- Indices para consultas frecuentes
-- =====================================================

-- Indice para buscar reportes por reportador
CREATE INDEX idx_user_reports_reporter_id
    ON social_features.user_reports(reporter_id);

-- Indice para buscar reportes contra un usuario
CREATE INDEX idx_user_reports_reported_user_id
    ON social_features.user_reports(reported_user_id)
    WHERE reported_user_id IS NOT NULL;

-- Indice para filtrar por estado (moderacion)
CREATE INDEX idx_user_reports_status
    ON social_features.user_reports(status);

-- Indice para filtrar por prioridad (moderacion)
CREATE INDEX idx_user_reports_priority
    ON social_features.user_reports(priority);

-- Indice compuesto para panel de moderacion (estado + prioridad + fecha)
CREATE INDEX idx_user_reports_moderation_queue
    ON social_features.user_reports(status, priority DESC, created_at ASC)
    WHERE status IN ('open', 'under_review', 'escalated');

-- Indice para reportes asignados a moderador
CREATE INDEX idx_user_reports_assigned_to
    ON social_features.user_reports(assigned_to)
    WHERE assigned_to IS NOT NULL;

-- Indice para tipo de reporte
CREATE INDEX idx_user_reports_report_type
    ON social_features.user_reports(report_type);

-- Indice para entidades reportadas (busquedas por entidad especifica)
CREATE INDEX idx_user_reports_entity
    ON social_features.user_reports(reported_entity_type, reported_entity_id)
    WHERE reported_entity_id IS NOT NULL;

-- Indice para buscar por razon
CREATE INDEX idx_user_reports_reason
    ON social_features.user_reports(reason);

-- Indice para reportes recientes
CREATE INDEX idx_user_reports_created_at
    ON social_features.user_reports(created_at DESC);

-- =====================================================
-- Foreign Keys
-- =====================================================

ALTER TABLE social_features.user_reports
    ADD CONSTRAINT user_reports_reporter_id_fkey
    FOREIGN KEY (reporter_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

ALTER TABLE social_features.user_reports
    ADD CONSTRAINT user_reports_reported_user_id_fkey
    FOREIGN KEY (reported_user_id) REFERENCES auth_management.profiles(id) ON DELETE SET NULL;

ALTER TABLE social_features.user_reports
    ADD CONSTRAINT user_reports_assigned_to_fkey
    FOREIGN KEY (assigned_to) REFERENCES auth_management.profiles(id) ON DELETE SET NULL;

ALTER TABLE social_features.user_reports
    ADD CONSTRAINT user_reports_resolved_by_fkey
    FOREIGN KEY (resolved_by) REFERENCES auth_management.profiles(id) ON DELETE SET NULL;

-- =====================================================
-- Permisos
-- =====================================================

ALTER TABLE social_features.user_reports OWNER TO gamilit_user;
GRANT ALL ON TABLE social_features.user_reports TO gamilit_user;

-- =====================================================
-- RLS sera habilitado en archivo separado
-- Ver: social_features/rls-policies/14-user-reports-policies.sql
-- =====================================================
