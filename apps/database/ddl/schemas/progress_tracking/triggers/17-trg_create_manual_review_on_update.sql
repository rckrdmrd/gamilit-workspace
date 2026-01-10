-- ============================================================================
-- Trigger: trg_create_manual_review_on_submission_update
-- Schema: progress_tracking
-- Descripcion: Dispara la creacion automatica de ManualReview cuando un
--              ExerciseSubmission cambia su status a 'submitted' (via UPDATE)
-- Autor: Claude Opus 4.5
-- Fecha: 2026-01-07
-- Bug Fix: BUG-TEACHER-REVIEWS-002 - Ejercicios con auto-save no aparecen
-- ============================================================================
--
-- PROBLEMA SOLUCIONADO:
-- Cuando un estudiante hace auto-save, se crea una submission con status='draft'.
-- Al enviar el ejercicio, se hace UPDATE a status='submitted'.
-- El trigger original (16-trg_create_manual_review.sql) solo se ejecutaba en INSERT,
-- por lo que el ManualReview no se creaba en este escenario.
--
-- SOLUCION:
-- Este trigger complementario se ejecuta en AFTER UPDATE cuando:
-- 1. NEW.status = 'submitted' (el nuevo estado es 'submitted')
-- 2. OLD.status != 'submitted' (evita re-ejecucion en actualizaciones de submitted)
--
-- ESCENARIOS CUBIERTOS:
-- - draft -> submitted: ✅ Se ejecuta (caso del bug)
-- - pending_review -> submitted: ✅ Se ejecuta (raro pero posible)
-- - submitted -> submitted: ✗ No se ejecuta (evita duplicados innecesarios)
-- - graded -> submitted: ✗ No permitido por backend (pero trigger es seguro)
--
-- FUNCION REUTILIZADA:
-- progress_tracking.create_manual_review_on_submission()
-- La misma funcion del trigger INSERT, que tiene:
-- - Verificacion de requires_manual_grading
-- - ON CONFLICT DO NOTHING (evita duplicados)
-- - Manejo de errores sin bloquear el UPDATE
--
-- ============================================================================

SET search_path TO progress_tracking, public;

-- Eliminar trigger existente si existe (idempotente)
DROP TRIGGER IF EXISTS trg_create_manual_review_on_submission_update
    ON progress_tracking.exercise_submissions;

-- Crear trigger AFTER UPDATE
CREATE TRIGGER trg_create_manual_review_on_submission_update
    AFTER UPDATE ON progress_tracking.exercise_submissions
    FOR EACH ROW
    WHEN (
        -- Condicion 1: El nuevo status es 'submitted'
        NEW.status = 'submitted'
        -- Condicion 2: El status anterior NO era 'submitted' (evita re-ejecucion)
        AND OLD.status IS DISTINCT FROM 'submitted'
    )
    EXECUTE FUNCTION progress_tracking.create_manual_review_on_submission();

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

COMMENT ON TRIGGER trg_create_manual_review_on_submission_update
    ON progress_tracking.exercise_submissions
    IS 'BUG-TEACHER-REVIEWS-002: Crea ManualReview automaticamente cuando una '
       'submission cambia de draft/pending_review a submitted via UPDATE. '
       'Complementa al trigger INSERT existente (16-trg_create_manual_review.sql). '
       'Usa la misma funcion create_manual_review_on_submission() que tiene '
       'ON CONFLICT DO NOTHING para evitar duplicados.';

-- ============================================================================
-- VERIFICACION POST-CREACION
-- ============================================================================
-- Ejecutar para verificar que ambos triggers existen:
--
-- SELECT trigger_name, event_manipulation, action_statement
-- FROM information_schema.triggers
-- WHERE trigger_name LIKE '%manual_review%'
--   AND event_object_table = 'exercise_submissions';
--
-- Resultado esperado:
-- trigger_name                                  | event_manipulation
-- trg_create_manual_review_on_submission        | INSERT
-- trg_create_manual_review_on_submission_update | UPDATE
--
-- ============================================================================
