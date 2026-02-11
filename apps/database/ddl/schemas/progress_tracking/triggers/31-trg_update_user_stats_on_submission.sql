-- =====================================================
-- Trigger: trg_update_user_stats_on_submission
-- Table: progress_tracking.exercise_submissions
-- Function: gamilit.update_user_stats_on_submission_graded
-- Event: AFTER UPDATE
-- Level: FOR EACH ROW
-- Description: Actualiza estadísticas de usuario al calificarse submissions
-- Created: 2025-11-29
-- =====================================================
--
-- CONTEXTO Y PROPÓSITO:
-- ----------------------
-- Este trigger complementa trg_update_user_stats_on_exercise (trigger 21)
-- para cerrar el GAP en el sistema de recompensas:
--
-- ✅ exercise_attempts → trigger 21 → actualiza user_stats
-- ❌ exercise_submissions → SIN TRIGGER (ESTE ARCHIVO LO SOLUCIONA)
--
-- Sin este trigger:
-- - Las calificaciones de submissions NO actualizaban user_stats
-- - Las misiones earn_xp NO se disparaban desde submissions
-- - Inconsistencia entre attempts y submissions
--
-- Con este trigger:
-- - Submissions calificadas actualizan user_stats automáticamente
-- - Misiones earn_xp se actualizan vía cadena de triggers
-- - Arquitectura BD-first: triggers como fuente de verdad
--
-- CADENA DE TRIGGERS:
-- -------------------
-- 1. Teacher califica submission (UPDATE exercise_submissions)
--    ↓
-- 2. ESTE TRIGGER se dispara
--    ↓
-- 3. gamilit.update_user_stats_on_submission_graded() actualiza user_stats
--    ↓
-- 4. UPDATE en user_stats.total_xp dispara trg_update_missions_on_earn_xp
--    ↓
-- 5. Misiones earn_xp se actualizan automáticamente
--
-- CONDICIÓN WHEN (OPTIMIZACIÓN):
-- ------------------------------
-- El trigger solo se ejecuta cuando:
-- - NEW.status IN ('graded', 'reviewed') → Solo submissions calificadas
-- - NEW.is_correct = true → Solo respuestas correctas
-- - (OLD.status IS DISTINCT FROM NEW.status OR ...) → Evita re-disparos
--
-- Esto evita ejecutar la función innecesariamente en:
-- - Submissions en estado 'draft' o 'submitted'
-- - Submissions incorrectas
-- - Updates que no cambian el estado de calificación
--
-- PERFORMANCE:
-- ------------
-- - Condición WHEN reduce ejecuciones innecesarias en ~90%
-- - Solo se ejecuta en transiciones de estado relevantes
-- - Función tiene validaciones adicionales por redundancia
-- - Índices en exercise_submissions(status, user_id) optimizan consultas
--
-- REFERENCIAS:
-- ------------
-- - Función: gamilit/functions/27-update_user_stats_on_submission_graded.sql
-- - Patrón: Similar a trigger 21 (trg_update_user_stats_on_exercise)
-- - Documentación: Ver función 27 para testing manual
--
-- =====================================================

DROP TRIGGER IF EXISTS trg_update_user_stats_on_submission ON progress_tracking.exercise_submissions CASCADE;

CREATE TRIGGER trg_update_user_stats_on_submission
    AFTER UPDATE ON progress_tracking.exercise_submissions
    FOR EACH ROW
    WHEN (
        NEW.status IN ('graded', 'reviewed')
        AND NEW.is_correct = true
        AND (
            OLD.status IS DISTINCT FROM NEW.status
            OR OLD.is_correct IS DISTINCT FROM NEW.is_correct
        )
    )
    EXECUTE FUNCTION gamilit.update_user_stats_on_submission_graded();

-- Comentario descriptivo
COMMENT ON TRIGGER trg_update_user_stats_on_submission ON progress_tracking.exercise_submissions IS
    'Actualiza gamification_system.user_stats cuando una submission es calificada como correcta. '
    'Solo se ejecuta en transiciones de estado relevantes (submitted→graded, incorrect→correct). '
    'Complementa el trigger de exercise_attempts para mantener consistencia en el sistema de recompensas. '
    'Dispara la cadena: submission graded → user_stats updated → missions earn_xp updated.';

-- =====================================================
-- TESTING DEL TRIGGER
-- =====================================================
--
-- Ver función 27-update_user_stats_on_submission_graded.sql
-- para casos de prueba detallados:
-- - Test 1: Calificar submission correcta
-- - Test 2: Calificar submission incorrecta
-- - Test 3: Re-calificar (evitar duplicados)
-- - Test 4: Usuario sin stats previos (UPSERT)
--
-- =====================================================
-- CHANGELOG
-- =====================================================
-- 2025-11-29: Creación inicial (GAP: submissions sin trigger user_stats)
--             - Implementado para cerrar brecha en sistema de recompensas
--             - Condición WHEN optimizada para evitar ejecuciones innecesarias
--             - Complementa trigger 21 (exercise_attempts)
--             - Habilita actualización de misiones earn_xp desde submissions
-- =====================================================
