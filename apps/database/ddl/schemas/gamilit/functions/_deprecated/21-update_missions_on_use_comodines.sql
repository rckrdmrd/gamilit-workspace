-- =============================================================================
-- Función: update_missions_on_use_comodines
-- Descripción: Actualiza el progreso de misiones al usar un comodín
-- Schema: gamilit
-- Tipo: TRIGGER FUNCTION
-- Dependencias: gamification_system.missions, gamilit.now_mexico()
-- Uso: Trigger AFTER INSERT ON gamification_system.comodin_usage_log
-- Created: 2025-11-28
-- =============================================================================

CREATE OR REPLACE FUNCTION gamilit.update_missions_on_use_comodines()
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
    -- Buscar misiones activas o en progreso del usuario con objetivo 'use_comodines'
    FOR v_mission IN
        SELECT id, objectives, status
        FROM gamification_system.missions
        WHERE user_id = NEW.user_id
          AND status IN ('active', 'in_progress')
          AND end_date > gamilit.now_mexico()
          AND objectives @> '[{"type": "use_comodines"}]'::jsonb
    LOOP
        BEGIN
            v_objectives := v_mission.objectives;
            v_new_objectives := '[]'::jsonb;
            v_total_progress := 0;
            v_obj_count := jsonb_array_length(v_objectives);

            -- Iterar sobre cada objetivo
            FOR v_i IN 0..v_obj_count-1 LOOP
                v_objective := v_objectives->v_i;

                -- Si es objetivo de usar comodines, incrementar
                IF v_objective->>'type' = 'use_comodines' THEN
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

            RAISE NOTICE 'Mission % updated on comodin usage: progress=%, objectives=%',
                v_mission.id, v_total_progress, v_new_objectives;

        EXCEPTION
            WHEN OTHERS THEN
                -- Log error pero continuar con otras misiones
                RAISE WARNING 'Error updating mission % for user % on comodin usage: %',
                    v_mission.id, NEW.user_id, SQLERRM;
        END;
    END LOOP;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error pero no bloquear el insert del comodin_usage_log
        RAISE WARNING 'Error updating missions for user % on comodin usage: %', NEW.user_id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Comentario descriptivo
COMMENT ON FUNCTION gamilit.update_missions_on_use_comodines() IS
    'Trigger function que actualiza el progreso de misiones diarias/semanales cuando un usuario '
    'usa un comodín. Busca misiones con objetivo "use_comodines" y actualiza el contador. '
    'Si la misión alcanza 100% de progreso, la marca como completada.';

-- =============================================================================
-- NOTAS DE IMPLEMENTACIÓN
-- =============================================================================
--
-- LÓGICA DE NEGOCIO:
-- - Dispara en cada inserción en comodin_usage_log (cualquier tipo de comodín)
-- - Busca misiones del usuario en estado 'active' o 'in_progress'
-- - Solo actualiza misiones que NO han expirado (end_date > now)
-- - Busca objetivos con type = 'use_comodines'
-- - Incrementa current en +1 por cada uso
-- - No excede el target configurado
-- - Recalcula progreso total de la misión
-- - Si progreso = 100%, marca como 'completed'
-- - Si progreso > 0% y estaba 'active', cambia a 'in_progress'
--
-- ESTRUCTURA DE OBJECTIVES (JSONB):
-- [
--   {
--     "type": "use_comodines",
--     "target": 5,
--     "current": 0,
--     "description": "Usa 5 comodines"
--   }
-- ]
--
-- SEGURIDAD:
-- - SECURITY DEFINER permite escribir en missions sin permisos directos
-- - Manejo de excepciones por misión individual (no afecta otras)
-- - Error global no bloquea el insert original en comodin_usage_log
--
-- PERFORMANCE:
-- - Usa índice idx_missions_user_type_status para búsqueda eficiente
-- - Operador @> usa índice GIN en objectives
-- - Un UPDATE por misión afectada
--
-- DEPENDENCIAS:
-- - Tabla origen: gamification_system.comodin_usage_log
-- - Tabla destino: gamification_system.missions
-- - Función: gamilit.now_mexico()
-- - Columnas en NEW: user_id, comodin_type
--
-- =============================================================================
-- USO EN TRIGGERS
-- =============================================================================
--
-- CREATE TRIGGER trg_update_missions_on_use_comodines
--   AFTER INSERT ON gamification_system.comodin_usage_log
--   FOR EACH ROW
--   EXECUTE FUNCTION gamilit.update_missions_on_use_comodines();
--
-- =============================================================================
-- TESTING
-- =============================================================================
--
-- Test 1: Usuario con misión diaria de usar comodines
-- -- Crear misión de prueba
-- INSERT INTO gamification_system.missions (user_id, template_id, title, mission_type, objectives, rewards, end_date)
-- VALUES ('user-uuid', 'daily_use_comodines', 'Usar comodines', 'daily',
--   '[{"type": "use_comodines", "target": 5, "current": 0}]'::jsonb,
--   '{"xp": 30, "ml_coins": 15}'::jsonb, NOW() + INTERVAL '1 day');
--
-- -- Insertar uso de comodín
-- INSERT INTO gamification_system.comodin_usage_log (user_id, comodin_type, exercise_id)
-- VALUES ('user-uuid', 'pista', 'exercise-uuid');
--
-- -- Verificar: missions.objectives[0].current = 1, progress = 20%
--
-- Test 2: Usuario completa todos los usos de la misión
-- -- Repetir 5 veces el insert de comodin_usage_log
-- -- Verificar: status = 'completed', progress = 100%, completed_at IS NOT NULL
--
-- Test 3: Diferentes tipos de comodines
-- INSERT INTO gamification_system.comodin_usage_log (user_id, comodin_type, exercise_id)
-- VALUES ('user-uuid', 'resaltar', 'exercise-uuid');
-- -- Verificar: todos los tipos cuentan para el objetivo
--
-- =============================================================================
-- CHANGELOG
-- =============================================================================
-- 2025-11-28: Creación inicial
--             - Implementada para integrar uso de comodines con misiones
--             - Soporta misiones diarias y semanales
--             - Manejo robusto de errores
--             - Compatible con arquitectura existente de triggers
--             - Basada en patrón de update_missions_on_exercise_complete
-- =============================================================================
