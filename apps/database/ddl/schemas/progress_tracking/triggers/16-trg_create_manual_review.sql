-- ============================================================================
-- Trigger: trg_create_manual_review_on_submission
-- Schema: progress_tracking
-- Descripcion: Dispara la creacion automatica de ManualReview al insertar
--              un ExerciseSubmission con status 'submitted'
-- Autor: Requirements-Analyst (P0-001)
-- Fecha: 2025-12-28
-- Gap: TP-001 - Trigger automatico ManualReview faltante
-- ============================================================================
--
-- COMPORTAMIENTO:
-- - Se ejecuta AFTER INSERT en exercise_submissions
-- - Solo se activa cuando status = 'submitted'
-- - Llama a create_manual_review_on_submission() que:
--   1. Verifica si el ejercicio requiere revision manual
--   2. Crea el registro ManualReview con el teacher correspondiente
--
-- NOTA: El trigger no bloquea el INSERT original si falla la creacion
-- del ManualReview (manejo de errores en la funcion)
--
-- ============================================================================

SET search_path TO progress_tracking, public;

-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS trg_create_manual_review_on_submission
    ON progress_tracking.exercise_submissions;

-- Crear trigger
CREATE TRIGGER trg_create_manual_review_on_submission
    AFTER INSERT ON progress_tracking.exercise_submissions
    FOR EACH ROW
    WHEN (NEW.status = 'submitted')
    EXECUTE FUNCTION progress_tracking.create_manual_review_on_submission();

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

COMMENT ON TRIGGER trg_create_manual_review_on_submission
    ON progress_tracking.exercise_submissions
    IS 'Crea ManualReview automaticamente para ejercicios con requires_manual_grading=true. '
       'Se ejecuta solo cuando el status del submission es "submitted".';
