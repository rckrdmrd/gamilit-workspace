-- =============================================================================
-- Trigger: trg_update_module_progress_on_exercise
-- Descripcion: Actualiza module_progress cuando se completa un ejercicio
-- Tabla: progress_tracking.exercise_attempts
-- Funcion: gamilit.update_module_progress_on_exercise_complete()
-- Creado: 2025-11-24
-- =============================================================================

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS trg_update_module_progress_on_exercise ON progress_tracking.exercise_attempts;

-- Crear trigger AFTER INSERT
CREATE TRIGGER trg_update_module_progress_on_exercise
    AFTER INSERT ON progress_tracking.exercise_attempts
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_module_progress_on_exercise_complete();

-- Comentario descriptivo
COMMENT ON TRIGGER trg_update_module_progress_on_exercise ON progress_tracking.exercise_attempts IS
    'Actualiza el progreso del modulo correspondiente cuando se inserta un nuevo exercise_attempt. '
    'Solo cuenta ejercicios correctos unicos para el calculo de progreso.';

-- =============================================================================
-- NOTAS DE IMPLEMENTACION
-- =============================================================================
--
-- Este trigger complementa al trg_update_user_stats_on_exercise:
-- - trg_update_user_stats_on_exercise: Actualiza gamification_system.user_stats
-- - trg_update_module_progress_on_exercise: Actualiza progress_tracking.module_progress
--
-- ORDEN DE EJECUCION:
-- PostgreSQL ejecuta triggers en orden alfabetico por nombre.
-- 21-trg_update_user_stats_on_exercise se ejecuta primero.
-- 22-trg_update_module_progress_on_exercise se ejecuta despues.
--
-- LOGICA DE NEGOCIO:
-- - Solo ejercicios correctos (is_correct=true OR score>=60) actualizan progreso
-- - Un ejercicio solo se cuenta UNA vez aunque tenga multiples intentos correctos
-- - El progreso se calcula como: (ejercicios_correctos_unicos / total_ejercicios) * 100
-- - Status cambia: not_started -> in_progress -> completed
--
-- =============================================================================
