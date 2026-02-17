-- =====================================================
-- Trigger: trg_update_missions_on_use_comodines
-- Table: gamification_system.comodin_usage_log
-- Description: Actualiza misiones cuando un usuario usa un comodín
-- Function: gamilit.trigger_missions_on_use_comodines() (wrapper unificado)
-- Created: 2025-11-28
-- =====================================================

DROP TRIGGER IF EXISTS trg_update_missions_on_use_comodines ON gamification_system.comodin_usage_logs;

CREATE TRIGGER trg_update_missions_on_use_comodines
    AFTER INSERT ON gamification_system.comodin_usage_logs
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.trigger_missions_on_use_comodines();

-- Comentario descriptivo
COMMENT ON TRIGGER trg_update_missions_on_use_comodines ON gamification_system.comodin_usage_logs IS
    'Dispara la actualización de misiones con objetivo "use_comodines" cada vez que un usuario usa un comodín';

-- =====================================================
-- NOTAS
-- =====================================================
--
-- PROPÓSITO:
-- Este trigger conecta el uso de comodines con el sistema de misiones,
-- permitiendo que las misiones diarias/semanales incluyan objetivos
-- como "Usa 5 comodines hoy"
--
-- EVENTOS:
-- - Se dispara AFTER INSERT en cada registro de comodin_usage_log
-- - Procesa todos los tipos de comodines (pista, resaltar, segundo_intento, etc.)
--
-- EFECTO:
-- - Busca misiones activas del usuario con objetivo 'use_comodines'
-- - Incrementa el contador current en +1
-- - Recalcula el progress de la misión
-- - Marca como 'completed' si alcanza 100%
--
-- PERFORMANCE:
-- - Trigger ejecuta por fila (FOR EACH ROW)
-- - Function usa índices en missions para búsqueda eficiente
-- - SECURITY DEFINER evita problemas de permisos
--
-- MANEJO DE ERRORES:
-- - Errores en la función NO bloquean el INSERT original
-- - Warnings son loggeados para debugging
-- - Cada misión se procesa independientemente
--
-- DEPENDENCIAS:
-- - Function: gamilit.update_missions_on_use_comodines()
-- - Table: gamification_system.missions
-- - Table: gamification_system.comodin_usage_log
--
-- EJEMPLOS DE USO:
--
-- -- Crear misión diaria
-- INSERT INTO gamification_system.missions (user_id, template_id, title, mission_type, objectives, rewards, end_date)
-- VALUES ('user-uuid', 'daily_comodines', 'Explorador Estratégico', 'daily',
--   '[{"type": "use_comodines", "target": 3, "current": 0, "description": "Usa 3 comodines"}]'::jsonb,
--   '{"xp": 25, "ml_coins": 10}'::jsonb, NOW() + INTERVAL '1 day');
--
-- -- Usuario usa un comodín → trigger dispara automáticamente
-- INSERT INTO gamification_system.comodin_usage_log (user_id, comodin_type, exercise_id)
-- VALUES ('user-uuid', 'pista', 'exercise-uuid');
--
-- -- Resultado: objectives[0].current = 1, progress = 33.33%
--
-- =====================================================
-- CHANGELOG
-- =====================================================
-- 2025-11-28: Creación inicial
--             - Trigger para actualizar misiones en uso de comodines
--             - Integración con sistema de misiones diarias/semanales
-- =====================================================
