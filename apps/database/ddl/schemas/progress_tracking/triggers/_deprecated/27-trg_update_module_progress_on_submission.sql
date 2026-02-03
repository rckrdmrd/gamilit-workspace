-- =============================================================================
-- DEPRECATED: 2026-02-03
-- REASON: Replaced by trigger 40 (trg_module_progress_complete)
-- TASK: TASK-2026-02-03-PLAN-MAESTRO-BD-REQUERIMIENTOS
-- =============================================================================
-- Trigger: trg_update_module_progress_on_submission
-- Descripcion: Actualiza module_progress cuando se califica un submission
-- Tabla: progress_tracking.exercise_submissions
-- Funcion: gamilit.update_module_progress_on_submission_graded()
-- Creado: 2025-11-28
-- =============================================================================

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS trg_update_module_progress_on_submission ON progress_tracking.exercise_submissions;

-- Crear trigger AFTER UPDATE
CREATE TRIGGER trg_update_module_progress_on_submission
    AFTER UPDATE ON progress_tracking.exercise_submissions
    FOR EACH ROW
    WHEN (
        -- Condicion 1: El nuevo status es 'graded' o 'reviewed'
        NEW.status IN ('graded', 'reviewed')
        -- Condicion 2: El ejercicio fue calificado con score >= 60 (aprobado)
        AND NEW.score >= 60
        -- Condicion 3: Hubo un cambio real (evitar re-disparos)
        AND (
            OLD.status IS DISTINCT FROM NEW.status
            OR OLD.score IS DISTINCT FROM NEW.score
        )
    )
    EXECUTE FUNCTION gamilit.update_module_progress_on_submission_graded();

-- Comentario descriptivo
COMMENT ON TRIGGER trg_update_module_progress_on_submission ON progress_tracking.exercise_submissions IS
    'Actualiza el progreso del modulo cuando se califica un exercise_submission con score >= 60. '
    'Complementa el trigger de exercise_attempts para cubrir ejercicios con revision manual. '
    'Solo se dispara cuando status cambia a graded/reviewed y score >= 60.';

-- =============================================================================
-- NOTAS DE IMPLEMENTACION
-- =============================================================================
--
-- Este trigger complementa al trg_update_module_progress_on_exercise:
-- - trg_update_module_progress_on_exercise: Se dispara AFTER INSERT en exercise_attempts
--   (ejercicios auto-calificados)
-- - trg_update_module_progress_on_submission: Se dispara AFTER UPDATE en exercise_submissions
--   (ejercicios con revision manual por profesor)
--
-- DIFERENCIAS CLAVE:
-- - exercise_attempts: Trigger INSERT, usa is_correct=true
-- - exercise_submissions: Trigger UPDATE, usa score >= 60 + status graded/reviewed
--
-- ORDEN DE EJECUCION en exercise_submissions:
-- PostgreSQL ejecuta triggers en orden alfabetico por nombre:
-- 1. 22-exercise_submissions_updated_at (actualiza timestamp)
-- 2. 25-trg_update_missions_on_submission (actualiza misiones)
-- 3. 27-trg_update_module_progress_on_submission (actualiza progreso) <- ESTE TRIGGER
--
-- LOGICA DE NEGOCIO:
-- - Solo ejercicios con score >= 60 (aprobado) actualizan progreso del modulo
-- - Un ejercicio solo se cuenta UNA vez aunque tenga multiples submissions con score >= 60
-- - El progreso se calcula como: (ejercicios_aprobados_unicos / total_ejercicios) * 100
-- - Status del modulo cambia: not_started -> in_progress -> completed
--
-- CONDICIONES DE DISPARO:
-- 1. status cambia a 'graded' o 'reviewed' (profesor califico el ejercicio)
-- 2. score >= 60 (ejercicio aprobado)
-- 3. Cambio real detectado (OLD.status != NEW.status OR OLD.score != NEW.score)
--    Esto evita re-disparos innecesarios cuando se actualiza otro campo
--
-- FLUJO COMPLETO:
-- 1. Estudiante completa ejercicio con revision manual (Rueda Inferencias, Detective Textual)
-- 2. Profesor califica: UPDATE exercise_submissions SET status='graded', score=85
-- 3. Este trigger se dispara (status='graded' AND score >= 60)
-- 4. Funcion update_module_progress_on_submission_graded() actualiza module_progress
-- 5. Si es primer submission aprobado del ejercicio, incrementa completed_exercises
-- 6. Recalcula progress_percentage del modulo
-- 7. Actualiza status del modulo si corresponde (completed cuando progress=100%)
--
-- CASOS DE USO:
-- - Rueda de Inferencias: Profesor califica respuesta narrativa
-- - Detective Textual: Profesor califica conexiones conceptuales
-- - Identificacion de Argumentos: Profesor califica analisis de fuentes
-- - Construccion de Hipotesis: Profesor califica hipotesis creadas
--
-- =============================================================================
