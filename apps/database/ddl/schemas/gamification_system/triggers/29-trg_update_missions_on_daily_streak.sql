-- =============================================================================
-- Trigger: trg_update_missions_on_daily_streak
-- Descripción: Dispara actualización de misiones cuando cambia la racha diaria
-- Tabla: gamification_system.user_stats
-- Evento: AFTER UPDATE
-- Condición: Cuando current_streak cambia
-- Función: gamilit.update_missions_on_daily_streak()
-- Created: 2025-11-28
-- =============================================================================

CREATE TRIGGER trg_update_missions_on_daily_streak
    AFTER UPDATE ON gamification_system.user_stats
    FOR EACH ROW
    WHEN (OLD.current_streak IS DISTINCT FROM NEW.current_streak)
    EXECUTE FUNCTION gamilit.update_missions_on_daily_streak();

-- Comentario descriptivo
COMMENT ON TRIGGER trg_update_missions_on_daily_streak ON gamification_system.user_stats IS
    'Dispara la actualización de misiones con objetivo "daily_streak" cuando '
    'cambia la racha de días consecutivos (current_streak) del usuario.';

-- =============================================================================
-- NOTAS DE IMPLEMENTACIÓN
-- =============================================================================
--
-- EVENTO:
-- - AFTER UPDATE: Se ejecuta después de que user_stats se actualiza
-- - FOR EACH ROW: Se ejecuta por cada registro actualizado
-- - WHEN condition: Solo cuando current_streak realmente cambia
--
-- CONDICIÓN WHEN:
-- - OLD.current_streak IS DISTINCT FROM NEW.current_streak
-- - Esto incluye cambios de NULL a valor, o de valor a NULL
-- - Más seguro que OLD.current_streak != NEW.current_streak
--
-- ORDEN DE EJECUCIÓN:
-- 1. Usuario mantiene racha → current_streak se actualiza en user_stats
-- 2. Este trigger se dispara (AFTER UPDATE)
-- 3. Llama a gamilit.update_missions_on_daily_streak()
-- 4. La función actualiza misiones con objetivo 'daily_streak'
--
-- EJEMPLO DE FLUJO COMPLETO:
-- 1. Sistema de streaks actualiza: UPDATE user_stats SET current_streak = 5
-- 2. Trigger detecta cambio (OLD.current_streak=4, NEW.current_streak=5)
-- 3. Función busca misiones con objective.type='daily_streak'
-- 4. Actualiza current=5 en esas misiones
-- 5. Recalcula progress (5/7 = 71.4% si target=7)
--
-- PERFORMANCE:
-- - WHEN condition evita ejecuciones innecesarias
-- - Solo se dispara cuando current_streak realmente cambia
-- - No se dispara en INSERT (solo UPDATE)
--
-- SEGURIDAD:
-- - Trigger usa SECURITY DEFINER function
-- - Función maneja excepciones para no bloquear update de user_stats
--
-- =============================================================================
-- CHANGELOG
-- =============================================================================
-- 2025-11-28: Creación inicial
--             - Trigger para actualizar misiones cuando cambia racha diaria
--             - Condición WHEN para optimizar performance
--             - Integrado con arquitectura existente de triggers
-- =============================================================================
