-- =====================================================
-- Tabla: pending_user_initializations
-- Descripción: Registra usuarios cuya inicialización de gamificación falló
-- Schema: audit_logging
-- Autor: Requirements-Analyst (P1-010)
-- Fecha: 2025-12-27
-- =====================================================
--
-- PROPÓSITO:
-- Esta tabla registra los casos donde el trigger initialize_user_stats
-- falló al crear los registros de gamificación para un usuario nuevo.
-- Permite monitorear y reintentar la inicialización posteriormente.
--
-- USO:
-- - Los triggers insertan aquí cuando fallan
-- - Un job periódico puede reintentar la inicialización
-- - El admin dashboard puede mostrar usuarios pendientes
--
-- =====================================================

SET search_path TO audit_logging, public;

-- =====================================================
-- TABLA: pending_user_initializations
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logging.pending_user_initializations (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Usuario afectado
    user_id UUID NOT NULL,
    profile_id UUID,
    tenant_id UUID,

    -- Información del error
    error_message TEXT NOT NULL,
    error_code TEXT,
    error_detail TEXT,

    -- Contexto del fallo
    trigger_name TEXT DEFAULT 'initialize_user_stats',
    function_name TEXT DEFAULT 'gamilit.initialize_user_stats',

    -- Estado del retry
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    last_retry_at TIMESTAMPTZ,
    next_retry_at TIMESTAMPTZ,

    -- Estado
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'retrying', 'resolved', 'failed', 'manual')),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID,
    resolution_notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT gamilit.now_mexico() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT gamilit.now_mexico() NOT NULL
);

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_pending_init_user_id
    ON audit_logging.pending_user_initializations(user_id);

CREATE INDEX IF NOT EXISTS idx_pending_init_status
    ON audit_logging.pending_user_initializations(status);

CREATE INDEX IF NOT EXISTS idx_pending_init_created_at
    ON audit_logging.pending_user_initializations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pending_init_next_retry
    ON audit_logging.pending_user_initializations(next_retry_at)
    WHERE status IN ('pending', 'retrying');

-- =====================================================
-- TRIGGER: updated_at automático
-- =====================================================

CREATE OR REPLACE TRIGGER trg_pending_init_updated_at
    BEFORE UPDATE ON audit_logging.pending_user_initializations
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

-- =====================================================
-- COMENTARIOS
-- =====================================================

COMMENT ON TABLE audit_logging.pending_user_initializations IS
    'Registra usuarios cuya inicialización de gamificación falló para retry posterior';

COMMENT ON COLUMN audit_logging.pending_user_initializations.user_id IS
    'ID del usuario en auth.users que falló la inicialización';

COMMENT ON COLUMN audit_logging.pending_user_initializations.status IS
    'Estado: pending (nuevo), retrying (en proceso), resolved (exitoso), failed (agotó retries), manual (requiere intervención)';

-- =====================================================
-- GRANTS (RLS se maneja en archivo separado)
-- =====================================================

GRANT SELECT, INSERT, UPDATE ON audit_logging.pending_user_initializations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON audit_logging.pending_user_initializations TO service_role;

-- =====================================================
-- FUNCIÓN HELPER: Marcar como resuelto
-- =====================================================

CREATE OR REPLACE FUNCTION audit_logging.resolve_pending_initialization(
    p_user_id UUID,
    p_resolved_by UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE audit_logging.pending_user_initializations
    SET status = 'resolved',
        resolved_at = gamilit.now_mexico(),
        resolved_by = p_resolved_by,
        resolution_notes = p_notes,
        updated_at = gamilit.now_mexico()
    WHERE user_id = p_user_id
      AND status IN ('pending', 'retrying', 'failed');

    RETURN FOUND;
END;
$$;

COMMENT ON FUNCTION audit_logging.resolve_pending_initialization IS
    'Marca un registro de inicialización pendiente como resuelto';
