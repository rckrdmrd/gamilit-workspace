-- ============================================================================
-- Funcion: retry_pending_initializations
-- Schema: audit_logging
-- Descripcion: Reintenta la inicializacion de usuarios que fallaron
-- Autor: Requirements-Analyst (P1-004)
-- Fecha: 2025-12-28
-- Gap: UI-001 - Retry automatico no implementado
-- ============================================================================
--
-- PROPOSITO:
-- Cuando el trigger de inicializacion de usuario falla, el registro queda
-- en pending_user_initialization. Esta funcion permite reintentar la
-- inicializacion de forma batch.
--
-- USO:
-- - Llamar periodicamente via cron job o manualmente
-- - Procesa registros con status='pending' y retry_count < 3
-- - Respeta next_retry_at para no reintentar demasiado rapido
--
-- ============================================================================

SET search_path TO audit_logging, public;

CREATE OR REPLACE FUNCTION audit_logging.retry_pending_initializations(
    p_batch_size INTEGER DEFAULT 10
)
RETURNS TABLE (
    user_id UUID,
    retry_status TEXT,
    error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = audit_logging, gamilit, gamification_system, social_features, auth_management, public
AS $$
DECLARE
    rec RECORD;
    v_result TEXT;
    v_error TEXT;
BEGIN
    -- =========================================================================
    -- Procesar registros pendientes que pueden ser reintentados
    -- =========================================================================
    FOR rec IN
        SELECT *
        FROM audit_logging.pending_user_initialization pui
        WHERE pui.status IN ('pending', 'retrying')
          AND pui.retry_count < pui.max_retries
          AND (pui.next_retry_at IS NULL OR pui.next_retry_at <= NOW())
        ORDER BY pui.created_at ASC
        LIMIT p_batch_size
    LOOP
        BEGIN
            -- Marcar como en proceso
            UPDATE audit_logging.pending_user_initialization
            SET status = 'retrying',
                last_retry_at = gamilit.now_mexico(),
                updated_at = gamilit.now_mexico()
            WHERE id = rec.id;

            -- =========================================================
            -- Reintentar segun el codigo de error original
            -- =========================================================
            IF rec.error_code = 'P0-001' OR rec.trigger_name LIKE '%manual_review%' THEN
                -- Error en creacion de ManualReview
                -- Intentar crear el ManualReview faltante
                PERFORM progress_tracking.create_manual_review_on_submission();

            ELSIF rec.function_name LIKE '%initialize_user_stats%' THEN
                -- Error en inicializacion de user_stats
                PERFORM gamilit.initialize_user_stats_for_user(rec.user_id);

            ELSIF rec.function_name LIKE '%assign_default_classroom%' THEN
                -- Error en asignacion de classroom
                PERFORM gamilit.assign_default_classroom_for_user(rec.user_id);

            ELSIF rec.function_name LIKE '%initialize_user_missions%' THEN
                -- Error en inicializacion de misiones
                PERFORM gamilit.initialize_user_missions(rec.user_id);

            ELSE
                -- Intento generico: reinicializar todo
                -- Verificar si ya tiene user_stats
                IF NOT EXISTS (
                    SELECT 1 FROM gamification_system.user_stats
                    WHERE user_id = rec.user_id
                ) THEN
                    PERFORM gamilit.initialize_user_stats_for_user(rec.user_id);
                END IF;

                -- Verificar si ya tiene classroom
                IF NOT EXISTS (
                    SELECT 1 FROM social_features.classroom_members
                    WHERE student_id = rec.user_id AND is_active = TRUE
                ) THEN
                    PERFORM gamilit.assign_default_classroom_for_user(rec.user_id);
                END IF;
            END IF;

            -- =========================================================
            -- Marcar como resuelto
            -- =========================================================
            UPDATE audit_logging.pending_user_initialization
            SET status = 'resolved',
                resolved_at = gamilit.now_mexico(),
                resolution_notes = 'Reintento automatico exitoso',
                updated_at = gamilit.now_mexico()
            WHERE id = rec.id;

            user_id := rec.user_id;
            retry_status := 'SUCCESS';
            error_message := NULL;
            RETURN NEXT;

        EXCEPTION WHEN OTHERS THEN
            -- =========================================================
            -- Manejar error: incrementar contador y programar siguiente retry
            -- =========================================================
            v_error := SQLERRM;

            UPDATE audit_logging.pending_user_initialization
            SET retry_count = retry_count + 1,
                last_retry_at = gamilit.now_mexico(),
                next_retry_at = gamilit.now_mexico() + INTERVAL '5 minutes' * (retry_count + 1),
                error_message = v_error,
                status = CASE
                    WHEN retry_count + 1 >= max_retries THEN 'failed'
                    ELSE 'pending'
                END,
                updated_at = gamilit.now_mexico()
            WHERE id = rec.id;

            user_id := rec.user_id;
            retry_status := CASE
                WHEN rec.retry_count + 1 >= rec.max_retries THEN 'FAILED_PERMANENT'
                ELSE 'FAILED_RETRY_SCHEDULED'
            END;
            error_message := v_error;
            RETURN NEXT;
        END;
    END LOOP;
END;
$$;

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

COMMENT ON FUNCTION audit_logging.retry_pending_initializations(INTEGER) IS
    'Reintenta la inicializacion de usuarios que fallaron. Procesa un batch de '
    'registros pendientes y retorna el resultado de cada intento. Usar via cron job '
    'o llamar manualmente cuando se detecten usuarios sin inicializar.';

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT EXECUTE ON FUNCTION audit_logging.retry_pending_initializations(INTEGER)
    TO gamilit_user;

GRANT EXECUTE ON FUNCTION audit_logging.retry_pending_initializations(INTEGER)
    TO service_role;

-- ============================================================================
-- FUNCION HELPER: Obtener estadisticas de pendientes
-- ============================================================================

CREATE OR REPLACE FUNCTION audit_logging.get_pending_initialization_stats()
RETURNS TABLE (
    status TEXT,
    count BIGINT,
    oldest_created_at TIMESTAMPTZ,
    newest_created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT
        pui.status,
        COUNT(*) AS count,
        MIN(pui.created_at) AS oldest_created_at,
        MAX(pui.created_at) AS newest_created_at
    FROM audit_logging.pending_user_initialization pui
    GROUP BY pui.status
    ORDER BY pui.status;
$$;

COMMENT ON FUNCTION audit_logging.get_pending_initialization_stats() IS
    'Retorna estadisticas de registros pendientes de inicializacion agrupados por status';

GRANT EXECUTE ON FUNCTION audit_logging.get_pending_initialization_stats()
    TO gamilit_user;

GRANT EXECUTE ON FUNCTION audit_logging.get_pending_initialization_stats()
    TO service_role;
