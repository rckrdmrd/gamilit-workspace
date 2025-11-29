-- =====================================================
-- Trigger: trg_update_missions_on_submission
-- Table: progress_tracking.exercise_submissions
-- Function: gamilit.update_missions_on_exercise_complete
-- Event: AFTER UPDATE
-- Level: FOR EACH ROW
-- Description: Actualiza progreso de misiones cuando se califica un submission
-- Created: 2025-11-26
-- =====================================================
--
-- PROPÓSITO:
-- Este trigger conecta la calificación de ejercicios con revisión manual
-- (Rueda de Inferencias, Detective Textual, Identificación de Argumentos)
-- con el sistema de misiones.
--
-- Cuando un profesor/sistema califica un submission como correcto,
-- las misiones diarias/semanales con objetivo 'complete_exercises'
-- se actualizan automáticamente.
--
-- DIFERENCIA CON exercise_attempts:
-- - exercise_attempts: ejercicios auto-calificados (trigger AFTER INSERT)
-- - exercise_submissions: ejercicios con revisión manual (trigger AFTER UPDATE)
--
-- CONDICIONES DE DISPARO:
-- 1. status cambia a 'graded' o 'reviewed'
-- 2. is_correct = true
-- 3. El cambio es real (OLD.status != NEW.status OR OLD.is_correct != NEW.is_correct)
--
-- ORDEN DE EJECUCIÓN:
-- Los triggers en exercise_submissions se ejecutan en orden alfabético:
-- 1. exercise_submissions_updated_at (22-)
-- 2. trg_update_missions_on_submission (25-) <- ESTE TRIGGER
--
-- MISIONES AFECTADAS:
-- - Diarias: "Completar 3 ejercicios" (50 XP + 25 ML Coins)
-- - Semanales: "Maratón de 15 ejercicios" (200 XP + 100 ML Coins)
--
-- FLUJO:
-- 1. Profesor califica submission → UPDATE en exercise_submissions
-- 2. Este trigger detecta status='graded' AND is_correct=true
-- 3. Busca misiones activas del usuario con objetivo 'complete_exercises'
-- 4. Incrementa current en cada misión encontrada
-- 5. Recalcula progress (%) de cada misión
-- 6. Si progress = 100%, marca como 'completed'
--
-- NOTAS:
-- - NO bloquea si falla (errores solo se loggean)
-- - Solo afecta submissions calificados como correctos
-- - Solo afecta misiones no expiradas
-- - Usa la misma función que exercise_attempts para consistencia
-- - Reutiliza gamilit.update_missions_on_exercise_complete()
-- =====================================================

DROP TRIGGER IF EXISTS trg_update_missions_on_submission ON progress_tracking.exercise_submissions CASCADE;

CREATE TRIGGER trg_update_missions_on_submission
    AFTER UPDATE ON progress_tracking.exercise_submissions
    FOR EACH ROW
    WHEN (
        -- Condición 1: El nuevo status es 'graded' o 'reviewed'
        NEW.status IN ('graded', 'reviewed')
        -- Condición 2: El ejercicio fue marcado como correcto
        AND NEW.is_correct = true
        -- Condición 3: Hubo un cambio real (evitar re-disparos)
        AND (
            OLD.status IS DISTINCT FROM NEW.status
            OR OLD.is_correct IS DISTINCT FROM NEW.is_correct
        )
    )
    EXECUTE FUNCTION gamilit.update_missions_on_exercise_complete();

-- =====================================================
-- COMENTARIO DEL TRIGGER
-- =====================================================
COMMENT ON TRIGGER trg_update_missions_on_submission ON progress_tracking.exercise_submissions IS
    'Actualiza el progreso de misiones diarias/semanales cuando se califica un exercise_submission como correcto. '
    'Complementa el trigger de exercise_attempts para cubrir ejercicios con revisión manual. '
    'Usa la misma función update_missions_on_exercise_complete() para consistencia.';

-- =====================================================
-- VERIFICACIÓN POST-CREACIÓN
-- =====================================================
-- SELECT tgname, tgtype, proname
-- FROM pg_trigger t
-- JOIN pg_proc p ON t.tgfoid = p.oid
-- WHERE tgrelid = 'progress_tracking.exercise_submissions'::regclass;
--
-- Resultado esperado: 2 triggers
-- - exercise_submissions_updated_at (22-)
-- - trg_update_missions_on_submission (25-) <- NUEVO
-- =====================================================

-- =====================================================
-- TESTING
-- =====================================================
--
-- Test 1: Submission calificado como correcto
-- UPDATE progress_tracking.exercise_submissions
-- SET status = 'graded', is_correct = true
-- WHERE id = 'test-submission-uuid';
-- -- Verificar: misión con objetivo 'complete_exercises' incrementa current
--
-- Test 2: Submission calificado como incorrecto (NO debe disparar)
-- UPDATE progress_tracking.exercise_submissions
-- SET status = 'graded', is_correct = false
-- WHERE id = 'test-submission-uuid';
-- -- Verificar: misiones sin cambios
--
-- Test 3: Actualización sin cambio de status (NO debe disparar)
-- UPDATE progress_tracking.exercise_submissions
-- SET feedback = 'Actualizado'
-- WHERE id = 'test-submission-uuid' AND status = 'graded';
-- -- Verificar: misiones sin cambios (evita re-disparos)
--
-- =====================================================
-- CHANGELOG
-- =====================================================
-- 2025-11-26: Creación inicial
--             - Implementado para cerrar BUG-001 (exercise_submissions no actualizaba misiones)
--             - Reutiliza función existente para consistencia
--             - Incluye condiciones para evitar re-disparos
-- =====================================================
