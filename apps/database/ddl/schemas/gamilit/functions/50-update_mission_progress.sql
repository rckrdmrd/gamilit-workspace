-- =============================================================================
-- Funcion: update_mission_progress
-- Descripcion: Funcion UNIFICADA para actualizar el progreso de misiones
-- Schema: gamilit
-- Tipo: FUNCTION (no trigger - llamada desde wrappers)
-- Dependencias: gamification_system.missions, gamilit.now_mexico()
-- Created: 2025-12-29
-- Reemplaza: 8 funciones duplicadas de missions (17-26)
-- =============================================================================
--
-- FUNCIONES REEMPLAZADAS:
-- - 17-update_missions_on_exercise_complete.sql
-- - 19-update_missions_on_correct_streak.sql
-- - 21-update_missions_on_use_comodines.sql
-- - 22-update_missions_on_earn_xp.sql
-- - 23-update_missions_on_daily_streak.sql
-- - 24-update_missions_on_perfect_scores.sql
-- - 25-update_missions_on_complete_modules.sql
-- - 26-update_missions_on_explore_modules.sql
--
-- BENEFICIOS DE UNIFICACION:
-- - Reduccion de ~1,100 lineas de codigo duplicado a ~150 lineas
-- - Un solo punto de mantenimiento
-- - Facilidad para agregar nuevos tipos de objetivos
-- - Consistencia en el comportamiento de todas las misiones
-- =============================================================================

CREATE OR REPLACE FUNCTION gamilit.update_mission_progress(
    p_user_id UUID,
    p_objective_type TEXT,
    p_increment_value INTEGER DEFAULT 1
)
RETURNS void
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
    v_all_completed BOOLEAN;
BEGIN
    -- Validar parametros
    IF p_user_id IS NULL OR p_objective_type IS NULL OR p_objective_type = '' THEN
        RETURN;
    END IF;

    -- Buscar misiones activas o en progreso del usuario con objetivo del tipo especificado
    FOR v_mission IN
        SELECT id, objectives, status
        FROM gamification_system.missions
        WHERE user_id = p_user_id
          AND status IN ('active', 'in_progress')
          AND end_date > gamilit.now_mexico()
          AND objectives @> format('[{"type": "%s"}]', p_objective_type)::jsonb
    LOOP
        BEGIN
            v_objectives := v_mission.objectives;
            v_new_objectives := '[]'::jsonb;
            v_total_progress := 0;
            v_obj_count := jsonb_array_length(v_objectives);
            v_all_completed := TRUE;

            -- Iterar sobre cada objetivo
            FOR v_i IN 0..v_obj_count-1 LOOP
                v_objective := v_objectives->v_i;

                -- Si es objetivo del tipo especificado, incrementar
                IF v_objective->>'type' = p_objective_type THEN
                    v_new_current := LEAST(
                        COALESCE((v_objective->>'current')::INTEGER, 0) + p_increment_value,
                        (v_objective->>'target')::INTEGER
                    );
                    v_objective := jsonb_set(v_objective, '{current}', to_jsonb(v_new_current));

                    -- Verificar si este objetivo esta completo
                    IF v_new_current < (v_objective->>'target')::INTEGER THEN
                        v_all_completed := FALSE;
                    END IF;
                ELSE
                    -- Verificar si otros objetivos estan completos
                    IF COALESCE((v_objective->>'current')::INTEGER, 0) < (v_objective->>'target')::INTEGER THEN
                        v_all_completed := FALSE;
                    END IF;
                END IF;

                -- Calcular progreso de este objetivo (0-100%)
                v_obj_progress := (
                    COALESCE((v_objective->>'current')::FLOAT, 0) /
                    NULLIF((v_objective->>'target')::FLOAT, 0)
                ) * 100;
                v_total_progress := v_total_progress + COALESCE(v_obj_progress, 0);

                -- Agregar objetivo actualizado al array
                v_new_objectives := v_new_objectives || jsonb_build_array(v_objective);
            END LOOP;

            -- Calcular progreso total de la mision (promedio de objetivos)
            v_total_progress := LEAST(v_total_progress / NULLIF(v_obj_count, 0), 100);

            -- Actualizar la mision
            UPDATE gamification_system.missions
            SET
                objectives = v_new_objectives,
                progress = ROUND(COALESCE(v_total_progress, 0)::NUMERIC, 2),
                status = CASE
                    WHEN v_all_completed AND v_total_progress >= 100 THEN 'completed'
                    WHEN v_total_progress > 0 AND status = 'active' THEN 'in_progress'
                    ELSE status
                END,
                completed_at = CASE
                    WHEN v_all_completed AND v_total_progress >= 100 AND completed_at IS NULL
                    THEN gamilit.now_mexico()
                    ELSE completed_at
                END,
                updated_at = gamilit.now_mexico()
            WHERE id = v_mission.id;

            RAISE NOTICE 'Mission % updated: type=%, increment=%, progress=%',
                v_mission.id, p_objective_type, p_increment_value, v_total_progress;

        EXCEPTION
            WHEN OTHERS THEN
                -- Log error pero continuar con otras misiones
                RAISE WARNING 'Error updating mission % for user % (type=%): %',
                    v_mission.id, p_user_id, p_objective_type, SQLERRM;
        END;
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error global pero no propagar
        RAISE WARNING 'Error in update_mission_progress for user % (type=%): %',
            p_user_id, p_objective_type, SQLERRM;
END;
$$;

-- Comentario descriptivo
COMMENT ON FUNCTION gamilit.update_mission_progress(UUID, TEXT, INTEGER) IS
'Funcion UNIFICADA para actualizar el progreso de misiones.
Reemplaza 8 funciones duplicadas (update_missions_on_*).
Parametros:
  - p_user_id: UUID del usuario
  - p_objective_type: Tipo de objetivo a actualizar (complete_exercises, earn_xp, etc.)
  - p_increment_value: Valor a incrementar (default 1)
Tipos de objetivo soportados:
  - complete_exercises: Completar ejercicios
  - earn_xp: Ganar XP
  - correct_streak: Racha de ejercicios correctos
  - daily_streak: Racha de dias consecutivos
  - use_comodines: Usar comodines
  - perfect_scores: Obtener puntajes perfectos
  - complete_modules: Completar modulos
  - explore_modules: Explorar modulos nuevos';

-- =============================================================================
-- NOTAS DE IMPLEMENTACION
-- =============================================================================
--
-- LOGICA DE NEGOCIO:
-- - Busca misiones del usuario en estado 'active' o 'in_progress'
-- - Solo actualiza misiones que NO han expirado (end_date > now)
-- - Busca objetivos con type = p_objective_type
-- - Incrementa current con p_increment_value (sin superar target)
-- - Recalcula progreso total de la mision
-- - Si progreso = 100% y todos objetivos completos, marca como 'completed'
-- - Si progreso > 0% y estaba 'active', cambia a 'in_progress'
--
-- ESTRUCTURA DE OBJECTIVES (JSONB):
-- [
--   {
--     "type": "complete_exercises",
--     "target": 3,
--     "current": 0,
--     "description": "Completa 3 ejercicios"
--   }
-- ]
--
-- SEGURIDAD:
-- - SECURITY DEFINER permite escribir en missions sin permisos directos
-- - Manejo de excepciones por mision individual (no afecta otras)
-- - Error global no se propaga al trigger llamante
--
-- PERFORMANCE:
-- - Usa indice idx_missions_user_type_status para busqueda eficiente
-- - Operador @> usa indice GIN en objectives
-- - Un UPDATE por mision afectada
--
-- =============================================================================
-- TESTING
-- =============================================================================
--
-- Test 1: Actualizar progreso de ejercicios
-- SELECT gamilit.update_mission_progress('user-uuid'::UUID, 'complete_exercises', 1);
--
-- Test 2: Actualizar progreso de XP ganado
-- SELECT gamilit.update_mission_progress('user-uuid'::UUID, 'earn_xp', 50);
--
-- Test 3: Actualizar progreso de racha
-- SELECT gamilit.update_mission_progress('user-uuid'::UUID, 'daily_streak', 1);
--
-- =============================================================================
-- CHANGELOG
-- =============================================================================
-- 2025-12-29: Creacion como funcion UNIFICADA
--             - Reemplaza 8 funciones duplicadas
--             - Parametriza tipo de objetivo e incremento
--             - Mantiene compatibilidad con estructura existente
--             - Mejora manejo de errores y logging
-- =============================================================================
