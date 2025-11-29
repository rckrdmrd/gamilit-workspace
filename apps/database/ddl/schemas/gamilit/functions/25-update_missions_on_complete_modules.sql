-- =============================================================================
-- Función: update_missions_on_complete_modules
-- Descripción: Actualiza el progreso de misiones al completar un módulo
-- Schema: gamilit
-- Tipo: TRIGGER FUNCTION
-- Dependencias: gamification_system.missions, gamilit.now_mexico()
-- Uso: Trigger AFTER UPDATE ON progress_tracking.module_progress
-- Created: 2025-11-28
-- =============================================================================

CREATE OR REPLACE FUNCTION gamilit.update_missions_on_complete_modules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_mission RECORD;
    v_objectives JSONB;
    v_new_objectives JSONB;
    v_objective JSONB;
    v_new_current INTEGER;
    v_total_progress FLOAT;
    v_obj_count INTEGER;
    v_obj_progress FLOAT;
    v_i INTEGER;
BEGIN
    -- Solo procesar si el módulo fue completado (status cambió a 'completed')
    -- La condición WHEN del trigger ya valida que OLD.status no era 'completed'
    IF NEW.status IS NULL OR NEW.status != 'completed' THEN
        RETURN NEW;
    END IF;

    -- Buscar misiones activas o en progreso del usuario con objetivo 'complete_modules'
    FOR v_mission IN
        SELECT id, objectives, status
        FROM gamification_system.missions
        WHERE user_id = NEW.user_id
          AND status IN ('active', 'in_progress')
          AND end_date > gamilit.now_mexico()
          AND objectives @> '[{"type": "complete_modules"}]'::jsonb
    LOOP
        BEGIN
            v_objectives := v_mission.objectives;
            v_new_objectives := '[]'::jsonb;
            v_total_progress := 0;
            v_obj_count := jsonb_array_length(v_objectives);

            -- Iterar sobre cada objetivo
            FOR v_i IN 0..v_obj_count-1 LOOP
                v_objective := v_objectives->v_i;

                -- Si es objetivo de completar módulos, incrementar
                IF v_objective->>'type' = 'complete_modules' THEN
                    v_new_current := LEAST(
                        (v_objective->>'current')::INTEGER + 1,
                        (v_objective->>'target')::INTEGER
                    );
                    v_objective := jsonb_set(v_objective, '{current}', to_jsonb(v_new_current));
                END IF;

                -- Calcular progreso de este objetivo
                v_obj_progress := ((v_objective->>'current')::FLOAT / (v_objective->>'target')::FLOAT) * 100;
                v_total_progress := v_total_progress + v_obj_progress;

                -- Agregar objetivo actualizado al array
                v_new_objectives := v_new_objectives || jsonb_build_array(v_objective);
            END LOOP;

            -- Calcular progreso total de la misión
            v_total_progress := LEAST(v_total_progress / v_obj_count, 100);

            -- Actualizar la misión
            UPDATE gamification_system.missions
            SET
                objectives = v_new_objectives,
                progress = ROUND(v_total_progress::NUMERIC, 2),
                status = CASE
                    WHEN v_total_progress >= 100 THEN 'completed'
                    WHEN v_total_progress > 0 AND status = 'active' THEN 'in_progress'
                    ELSE status
                END,
                completed_at = CASE
                    WHEN v_total_progress >= 100 AND completed_at IS NULL THEN gamilit.now_mexico()
                    ELSE completed_at
                END,
                updated_at = gamilit.now_mexico()
            WHERE id = v_mission.id;

            RAISE NOTICE 'Mission % updated: progress=%, objectives=%',
                v_mission.id, v_total_progress, v_new_objectives;

        EXCEPTION
            WHEN OTHERS THEN
                -- Log error pero continuar con otras misiones
                RAISE WARNING 'Error updating mission % for user %: %',
                    v_mission.id, NEW.user_id, SQLERRM;
        END;
    END LOOP;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error pero no bloquear el update del module_progress
        RAISE WARNING 'Error updating missions for user %: %', NEW.user_id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Comentario descriptivo
COMMENT ON FUNCTION gamilit.update_missions_on_complete_modules() IS
    'Trigger function que actualiza el progreso de misiones diarias/semanales cuando un usuario '
    'completa un módulo (status cambia a ''completed''). Busca misiones con objetivo "complete_modules" y '
    'actualiza el contador. Si la misión alcanza 100% de progreso, la marca como completada.';

-- =============================================================================
-- NOTAS DE IMPLEMENTACIÓN
-- =============================================================================
--
-- LÓGICA DE NEGOCIO:
-- - Solo procesa cuando status cambia a 'completed' (validado por WHEN del trigger)
-- - Busca misiones del usuario en estado 'active' o 'in_progress'
-- - Solo actualiza misiones que NO han expirado (end_date > now)
-- - Busca objetivos con type = 'complete_modules'
-- - Incrementa current sin superar target
-- - Recalcula progreso total de la misión
-- - Si progreso = 100%, marca como 'completed'
-- - Si progreso > 0% y estaba 'active', cambia a 'in_progress'
--
-- ESTRUCTURA DE OBJECTIVES (JSONB):
-- [
--   {
--     "type": "complete_modules",
--     "target": 2,
--     "current": 0,
--     "description": "Completa 2 módulos"
--   }
-- ]
--
-- SEGURIDAD:
-- - SECURITY DEFINER permite escribir en missions sin permisos directos
-- - Manejo de excepciones por misión individual (no afecta otras)
-- - Error global no bloquea el update original
--
-- PERFORMANCE:
-- - Usa índice idx_missions_user_type_status para búsqueda eficiente
-- - Operador @> usa índice GIN en objectives
-- - Un UPDATE por misión afectada
--
-- DEPENDENCIAS:
-- - Tabla: gamification_system.missions
-- - Tabla: progress_tracking.module_progress (NEW.user_id, NEW.status)
-- - Función: gamilit.now_mexico()
--
-- =============================================================================
-- USO EN TRIGGERS
-- =============================================================================
--
-- CREATE TRIGGER trg_update_missions_on_complete_modules
--   AFTER UPDATE ON progress_tracking.module_progress
--   FOR EACH ROW
--   WHEN (NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed')
--   EXECUTE FUNCTION gamilit.update_missions_on_complete_modules();
--
-- =============================================================================
-- TESTING
-- =============================================================================
--
-- Test 1: Usuario con misión diaria activa
-- -- Crear misión de prueba
-- INSERT INTO gamification_system.missions (user_id, template_id, title, mission_type, objectives, rewards, end_date)
-- VALUES ('user-uuid', 'daily_complete_modules', 'Completar módulos', 'daily',
--   '[{"type": "complete_modules", "target": 2, "current": 0, "description": "Completa 2 módulos"}]'::jsonb,
--   '{"xp": 100, "ml_coins": 50}'::jsonb, NOW() + INTERVAL '1 day');
--
-- -- Completar un módulo (cambiar status a 'completed')
-- UPDATE progress_tracking.module_progress
-- SET status = 'completed', completed_at = NOW()
-- WHERE user_id = 'user-uuid' AND module_id = 'module-uuid-1';
--
-- -- Verificar: missions.objectives[0].current = 1, progress = 50%
-- SELECT objectives, progress, status FROM gamification_system.missions WHERE user_id = 'user-uuid';
--
-- Test 2: Usuario completa todos los módulos de la misión
-- -- Completar segundo módulo
-- UPDATE progress_tracking.module_progress
-- SET status = 'completed', completed_at = NOW()
-- WHERE user_id = 'user-uuid' AND module_id = 'module-uuid-2';
--
-- -- Verificar: status = 'completed', progress = 100%, completed_at IS NOT NULL
-- SELECT status, progress, completed_at FROM gamification_system.missions WHERE user_id = 'user-uuid';
--
-- Test 3: Cambiar status de 'in_progress' a 'completed' (no duplicar)
-- -- Primera vez: not_started -> completed (debe incrementar)
-- UPDATE progress_tracking.module_progress
-- SET status = 'completed' WHERE user_id = 'user-uuid' AND module_id = 'module-1';
-- -- Segunda actualización: completed -> completed (NO debe incrementar)
-- UPDATE progress_tracking.module_progress
-- SET progress_percentage = 100 WHERE user_id = 'user-uuid' AND module_id = 'module-1';
-- -- Verificar: current NO se duplicó
--
-- =============================================================================
-- CHANGELOG
-- =============================================================================
-- 2025-11-28: Creación inicial
--             - Implementada para integrar completación de módulos con misiones
--             - Soporta misiones diarias y semanales
--             - Manejo robusto de errores
--             - Evita duplicación con condición WHEN en trigger
--             - Compatible con arquitectura existente de triggers
-- =============================================================================
