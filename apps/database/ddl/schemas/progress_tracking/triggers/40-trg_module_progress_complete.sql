-- =============================================================================
-- Trigger: trg_module_progress_complete
-- Descripcion: Trigger CONSOLIDADO que reemplaza trg_update_module_progress (27)
--              y trg_sync_average_score (33)
-- Tabla: progress_tracking.exercise_submissions
-- Evento: AFTER UPDATE
-- Creado: 2026-02-02
-- Origen: TASK-2026-02-02-IMPLEMENTAR-OPTIMIZACION-TRIGGERS (P2-B)
-- =============================================================================
--
-- REEMPLAZA:
-- - trg_update_module_progress_on_submission (27-trg_update_module_progress_on_submission.sql)
-- - trg_sync_average_score_on_submission (33-trg_sync_average_score_on_submission.sql)
--
-- CONDICION OPTIMIZADA:
-- Solo dispara cuando:
-- 1. status cambia a 'graded' o 'reviewed', O
-- 2. score cambia (recalificacion)
--
-- =============================================================================

-- Primero eliminar triggers antiguos si existen
DROP TRIGGER IF EXISTS trg_update_module_progress_on_submission ON progress_tracking.exercise_submissions;
DROP TRIGGER IF EXISTS trg_sync_average_score_on_submission ON progress_tracking.exercise_submissions;

-- Crear trigger consolidado
CREATE TRIGGER trg_module_progress_complete
    AFTER UPDATE ON progress_tracking.exercise_submissions
    FOR EACH ROW
    WHEN (
        -- Solo cuando status cambia a graded/reviewed
        (OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('graded', 'reviewed'))
        OR
        -- O cuando score cambia en un submission ya calificado
        (OLD.score IS DISTINCT FROM NEW.score AND NEW.status IN ('graded', 'reviewed'))
    )
    EXECUTE FUNCTION progress_tracking.update_module_progress_complete();

-- Comentario
COMMENT ON TRIGGER trg_module_progress_complete ON progress_tracking.exercise_submissions IS
    'Trigger CONSOLIDADO que actualiza module_progress (progress + average_score) en una sola operacion. '
    'Reemplaza triggers 27 y 33. Reduccion de latencia: ~30-50ms por submission. '
    'Creado: TASK-2026-02-02-IMPLEMENTAR-OPTIMIZACION-TRIGGERS';

-- =============================================================================
-- DOCUMENTACION DE ROLLBACK
-- =============================================================================
--
-- Para restaurar triggers originales:
--
-- DROP TRIGGER IF EXISTS trg_module_progress_complete ON progress_tracking.exercise_submissions;
--
-- -- Recrear trigger 27
-- CREATE TRIGGER trg_update_module_progress_on_submission
--     AFTER UPDATE ON progress_tracking.exercise_submissions
--     FOR EACH ROW
--     WHEN (NEW.status IN ('graded', 'reviewed') AND NEW.score >= 60)
--     EXECUTE FUNCTION gamilit.update_module_progress_on_submission_graded();
--
-- -- Recrear trigger 33
-- CREATE TRIGGER trg_sync_average_score_on_submission
--     AFTER INSERT OR UPDATE OF score, is_correct ON progress_tracking.exercise_submissions
--     FOR EACH ROW
--     EXECUTE FUNCTION progress_tracking.trg_sync_average_score();
--
-- =============================================================================
