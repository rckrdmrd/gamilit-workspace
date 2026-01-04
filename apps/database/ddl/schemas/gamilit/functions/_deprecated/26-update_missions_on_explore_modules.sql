-- =============================================================================
-- Función: update_missions_on_explore_modules
-- Descripción: Actualiza el progreso de misiones al explorar módulos
-- Schema: gamilit
-- Tipo: TRIGGER FUNCTION
-- Dependencias: gamification_system.missions, gamilit.now_mexico()
-- Uso: Trigger AFTER INSERT OR UPDATE ON progress_tracking.module_progress
-- Created: 2025-11-28
-- =============================================================================

CREATE OR REPLACE FUNCTION gamilit.update_missions_on_explore_modules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_mission RECORD;
    v_objectives JSONB;
    v_new_objectives JSONB;
    v_objective JSONB;
    v_modules_visited JSONB;
    v_new_current INTEGER;
    v_target INTEGER;
    v_total_progress FLOAT;
    v_obj_count INTEGER;
    v_obj_progress FLOAT;
    v_i INTEGER;
BEGIN
    -- Buscar misiones activas o en progreso del usuario con objetivo 'explore_modules'
    FOR v_mission IN
        SELECT id, objectives, status
        FROM gamification_system.missions
        WHERE user_id = NEW.user_id
          AND status IN ('active', 'in_progress')
          AND end_date > gamilit.now_mexico()
          AND objectives @> '[{"type": "explore_modules"}]'::jsonb
    LOOP
        BEGIN
            v_objectives := v_mission.objectives;
            v_new_objectives := '[]'::jsonb;
            v_total_progress := 0;
            v_obj_count := jsonb_array_length(v_objectives);

            -- Iterar sobre cada objetivo
            FOR v_i IN 0..v_obj_count-1 LOOP
                v_objective := v_objectives->v_i;

                -- Si es objetivo de explorar módulos, actualizar
                IF v_objective->>'type' = 'explore_modules' THEN
                    v_target := (v_objective->>'target')::INTEGER;

                    -- Inicializar modules_visited si no existe
                    IF v_objective->'modules_visited' IS NULL THEN
                        v_modules_visited := '[]'::jsonb;
                        v_objective := jsonb_set(v_objective, '{modules_visited}', v_modules_visited);
                    ELSE
                        v_modules_visited := v_objective->'modules_visited';
                    END IF;

                    -- Verificar si el módulo ya fue visitado
                    -- Convertir el UUID a texto para comparación JSON
                    IF NOT (v_modules_visited @> to_jsonb(NEW.module_id::text)) THEN
                        -- Agregar módulo al array modules_visited
                        v_modules_visited := v_modules_visited || jsonb_build_array(NEW.module_id::text);
                        v_objective := jsonb_set(v_objective, '{modules_visited}', v_modules_visited);

                        -- Actualizar current = cantidad de módulos únicos visitados
                        v_new_current := LEAST(
                            jsonb_array_length(v_modules_visited),
                            v_target
                        );
                        v_objective := jsonb_set(v_objective, '{current}', to_jsonb(v_new_current));

                        RAISE NOTICE 'Added module % to mission %. New count: %/%',
                            NEW.module_id, v_mission.id, v_new_current, v_target;
                    ELSE
                        RAISE NOTICE 'Module % already visited in mission %',
                            NEW.module_id, v_mission.id;
                    END IF;
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
        -- Log error pero no bloquear el insert/update del module_progress
        RAISE WARNING 'Error updating missions for user %: %', NEW.user_id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Comentario descriptivo
COMMENT ON FUNCTION gamilit.update_missions_on_explore_modules() IS
    'Trigger function que actualiza el progreso de misiones cuando un usuario explora módulos. '
    'Busca misiones con objetivo "explore_modules" y mantiene un array de módulos únicos visitados. '
    'Solo cuenta cada módulo UNA vez, incluso si el usuario lo visita múltiples veces. '
    'Si la misión alcanza 100% de progreso, la marca como completada.';

-- =============================================================================
-- NOTAS DE IMPLEMENTACIÓN
-- =============================================================================
--
-- LÓGICA DE NEGOCIO:
-- - Se dispara en INSERT o UPDATE de module_progress
-- - Busca misiones del usuario en estado 'active' o 'in_progress'
-- - Solo actualiza misiones que NO han expirado (end_date > now)
-- - Busca objetivos con type = 'explore_modules'
-- - Mantiene array de módulos visitados (modules_visited)
-- - Solo agrega módulo si NO está en el array (tracking de únicos)
-- - Actualiza current = cantidad de módulos únicos en modules_visited
-- - Recalcula progreso total de la misión
-- - Si progreso = 100%, marca como 'completed'
-- - Si progreso > 0% y estaba 'active', cambia a 'in_progress'
--
-- ESTRUCTURA DE OBJECTIVES (JSONB):
-- [
--   {
--     "type": "explore_modules",
--     "target": 3,
--     "current": 0,
--     "description": "Explora 3 módulos diferentes",
--     "modules_visited": ["uuid1", "uuid2", ...]
--   }
-- ]
--
-- MÓDULOS ÚNICOS:
-- - modules_visited almacena UUIDs como strings
-- - Usa operador @> para verificar si módulo ya existe
-- - Usa || para concatenar nuevo módulo al array
-- - Solo incrementa current si módulo es nuevo
--
-- SEGURIDAD:
-- - SECURITY DEFINER permite escribir en missions sin permisos directos
-- - Manejo de excepciones por misión individual (no afecta otras)
-- - Error global no bloquea el insert/update original
--
-- PERFORMANCE:
-- - Usa índice idx_missions_user_type_status para búsqueda eficiente
-- - Operador @> usa índice GIN en objectives (si existe)
-- - Un UPDATE por misión afectada
-- - Evita cálculos innecesarios si módulo ya fue visitado
--
-- DEPENDENCIAS:
-- - Tabla: gamification_system.missions
-- - Función: gamilit.now_mexico()
-- - Columnas en NEW: user_id, module_id
--
-- =============================================================================
-- USO EN TRIGGERS
-- =============================================================================
--
-- CREATE TRIGGER trg_update_missions_on_explore_modules
--   AFTER INSERT OR UPDATE ON progress_tracking.module_progress
--   FOR EACH ROW
--   EXECUTE FUNCTION gamilit.update_missions_on_explore_modules();
--
-- =============================================================================
-- TESTING
-- =============================================================================
--
-- Test 1: Usuario explora primer módulo
-- -- Crear misión de prueba
-- INSERT INTO gamification_system.missions (user_id, template_id, title, mission_type, objectives, rewards, end_date)
-- VALUES ('user-uuid', 'daily_explore_modules', 'Explorar módulos', 'daily',
--   '[{"type": "explore_modules", "target": 3, "current": 0, "description": "Explora 3 módulos diferentes"}]'::jsonb,
--   '{"xp": 75, "ml_coins": 30}'::jsonb, NOW() + INTERVAL '1 day');
--
-- -- Usuario interactúa con módulo A
-- INSERT INTO progress_tracking.module_progress (user_id, module_id, status)
-- VALUES ('user-uuid', 'module-a-uuid', 'in_progress');
--
-- -- Verificar: modules_visited = ["module-a-uuid"], current = 1, progress = 33.33%
--
-- Test 2: Usuario explora segundo módulo (diferente)
-- INSERT INTO progress_tracking.module_progress (user_id, module_id, status)
-- VALUES ('user-uuid', 'module-b-uuid', 'in_progress');
--
-- -- Verificar: modules_visited = ["module-a-uuid", "module-b-uuid"], current = 2, progress = 66.67%
--
-- Test 3: Usuario vuelve a módulo A (no debe contar)
-- UPDATE progress_tracking.module_progress
-- SET last_accessed_at = NOW()
-- WHERE user_id = 'user-uuid' AND module_id = 'module-a-uuid';
--
-- -- Verificar: modules_visited sin cambios, current = 2, progress = 66.67%
--
-- Test 4: Usuario completa la misión (tercer módulo)
-- INSERT INTO progress_tracking.module_progress (user_id, module_id, status)
-- VALUES ('user-uuid', 'module-c-uuid', 'in_progress');
--
-- -- Verificar:
-- --   modules_visited = ["module-a-uuid", "module-b-uuid", "module-c-uuid"]
-- --   current = 3, progress = 100%
-- --   status = 'completed', completed_at IS NOT NULL
--
-- Test 5: Misión sin modules_visited (inicialización)
-- -- La función debe crear el campo modules_visited automáticamente
--
-- =============================================================================
-- CHANGELOG
-- =============================================================================
-- 2025-11-28: Creación inicial
--             - Implementada para tracking de exploración de módulos únicos
--             - Soporta misiones diarias y semanales con objetivo explore_modules
--             - Manejo robusto de errores
--             - Inicialización automática de modules_visited si no existe
--             - Compatible con arquitectura existente de triggers
-- =============================================================================
