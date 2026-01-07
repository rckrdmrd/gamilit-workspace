-- =============================================================================
-- Trigger: trg_update_missions_on_perfect_scores
-- Tabla: progress_tracking.exercise_attempts
-- Descripción: Actualiza misiones con objetivo 'perfect_scores' cuando se logra score=100
-- Tipo: AFTER INSERT
-- Funcion: gamilit.trigger_missions_on_perfect_scores() (wrapper unificado)
-- Created: 2025-11-28
-- =============================================================================

DROP TRIGGER IF EXISTS trg_update_missions_on_perfect_scores ON progress_tracking.exercise_attempts;

CREATE TRIGGER trg_update_missions_on_perfect_scores
    AFTER INSERT ON progress_tracking.exercise_attempts
    FOR EACH ROW
    WHEN (NEW.is_correct = true AND NEW.score = 100)
    EXECUTE FUNCTION gamilit.trigger_missions_on_perfect_scores();

-- Comentario descriptivo
COMMENT ON TRIGGER trg_update_missions_on_perfect_scores ON progress_tracking.exercise_attempts IS
    'Actualiza el progreso de misiones con objetivo "perfect_scores" cuando un usuario '
    'completa un ejercicio con puntaje perfecto (100/100). Solo se activa cuando '
    'is_correct = true AND score = 100.';

-- =============================================================================
-- NOTAS DE IMPLEMENTACIÓN
-- =============================================================================
--
-- CONDICIÓN DE ACTIVACIÓN:
-- - is_correct = true (ejercicio correcto)
-- - score = 100 (puntaje perfecto)
--
-- ORDEN DE EJECUCIÓN:
-- Este trigger se ejecuta DESPUÉS de otros triggers sobre exercise_attempts:
-- 1. trg_update_user_stats_on_exercise (actualiza estadísticas generales)
-- 2. trg_update_module_progress_on_exercise (actualiza progreso de módulos)
-- 3. trg_update_missions_on_exercise (actualiza misiones de completar ejercicios)
-- 4. trg_update_missions_on_perfect_scores (este trigger - scores perfectos)
--
-- RELACIÓN CON OTRAS FUNCIONES:
-- - Similar a: gamilit.update_missions_on_exercise_complete() (función 17)
-- - Diferencia: Solo se activa con score = 100 vs cualquier is_correct = true
-- - Pueden ejecutarse ambas funciones en el mismo INSERT si score = 100
--
-- IMPACTO EN PERFORMANCE:
-- - Solo se ejecuta cuando se cumplen ambas condiciones (WHEN clause)
-- - Evita ejecución innecesaria cuando score < 100 o is_correct = false
-- - No afecta el INSERT original aunque falle la actualización de misiones
--
-- DEPENDENCIAS:
-- - Funcion: gamilit.trigger_missions_on_perfect_scores() (wrapper unificado 2025-12-29)
-- - Tabla: gamification_system.missions (actualizada por la función)
-- - Índices: idx_missions_user_type_status, GIN index en objectives
--
-- =============================================================================
-- EJEMPLOS DE USO
-- =============================================================================
--
-- Caso 1: Score perfecto - SE ACTIVA
-- INSERT INTO progress_tracking.exercise_attempts
--   (user_id, exercise_id, is_correct, score)
-- VALUES
--   ('user-123', 'exercise-456', true, 100);
-- → Trigger se ejecuta, actualiza misiones con objetivo 'perfect_scores'
--
-- Caso 2: Score alto pero no perfecto - NO SE ACTIVA
-- INSERT INTO progress_tracking.exercise_attempts
--   (user_id, exercise_id, is_correct, score)
-- VALUES
--   ('user-123', 'exercise-456', true, 95);
-- → Trigger NO se ejecuta (score != 100)
--
-- Caso 3: Score perfecto pero respuesta incorrecta - NO SE ACTIVA
-- INSERT INTO progress_tracking.exercise_attempts
--   (user_id, exercise_id, is_correct, score)
-- VALUES
--   ('user-123', 'exercise-456', false, 100);
-- → Trigger NO se ejecuta (is_correct = false)
--
-- =============================================================================
-- TROUBLESHOOTING
-- =============================================================================
--
-- Problema: Trigger no se activa con score = 100
-- Solución: Verificar que is_correct = true también
--
-- Problema: Misiones no se actualizan
-- Solución: Verificar que:
--   - La misión tiene objetivo con type = 'perfect_scores'
--   - La misión está en estado 'active' o 'in_progress'
--   - La misión no ha expirado (end_date > now)
--
-- Problema: Error en logs pero INSERT se completa
-- Solución: Comportamiento esperado - trigger usa EXCEPTION para no bloquear INSERT
--
-- Verificar ejecución del trigger:
-- SELECT * FROM pg_trigger
-- WHERE tgname = 'trg_update_missions_on_perfect_scores';
--
-- Verificar función asociada:
-- SELECT * FROM pg_proc
-- WHERE proname = 'update_missions_on_perfect_scores';
--
-- =============================================================================
-- CHANGELOG
-- =============================================================================
-- 2025-11-28: Creación inicial
--             - Implementado para actualizar misiones de scores perfectos
--             - Usa WHEN clause para optimizar ejecución
--             - Compatible con triggers existentes en exercise_attempts
--             - Documentación completa de casos de uso
-- =============================================================================
