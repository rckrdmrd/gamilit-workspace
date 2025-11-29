-- =============================================================================
-- Función: update_missions_on_daily_streak
-- Descripción: Actualiza misiones con objetivo 'daily_streak' cuando cambia la racha diaria
-- Schema: gamilit
-- Tipo: TRIGGER FUNCTION
-- Dependencias: gamification_system.missions, gamification_system.user_stats, gamilit.now_mexico()
-- Uso: Trigger AFTER UPDATE ON gamification_system.user_stats
-- Created: 2025-11-28
-- =============================================================================

CREATE OR REPLACE FUNCTION gamilit.update_missions_on_daily_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_mission RECORD;
    v_objectives JSONB;
    v_new_objectives JSONB;
    v_objective JSONB;
    v_target INTEGER;
    v_total_progress FLOAT;
    v_obj_count INTEGER;
    v_obj_progress FLOAT;
    v_i INTEGER;
BEGIN
    -- Solo procesar si current_streak cambió
    IF OLD.current_streak IS NOT DISTINCT FROM NEW.current_streak THEN
        RETURN NEW;
    END IF;

    -- Buscar misiones activas o en progreso del usuario con objetivo 'daily_streak'
    FOR v_mission IN
        SELECT id, objectives, status
        FROM gamification_system.missions
        WHERE user_id = NEW.user_id
          AND status IN ('active', 'in_progress')
          AND end_date > gamilit.now_mexico()
          AND objectives @> '[{"type": "daily_streak"}]'::jsonb
    LOOP
        BEGIN
            v_objectives := v_mission.objectives;
            v_new_objectives := '[]'::jsonb;
            v_total_progress := 0;
            v_obj_count := jsonb_array_length(v_objectives);

            -- Iterar sobre cada objetivo
            FOR v_i IN 0..v_obj_count-1 LOOP
                v_objective := v_objectives->v_i;

                -- Si es objetivo de racha diaria
                IF v_objective->>'type' = 'daily_streak' THEN
                    v_target := (v_objective->>'target')::INTEGER;

                    -- IMPORTANTE: Establecer current = racha actual (valor absoluto, NO incrementar)
                    -- Si la racha es 3, current=3. Si baja a 2, current=2.
                    -- Pero NO "descompletar" misiones ya completadas
                    IF v_mission.status != 'completed' THEN
                        v_objective := jsonb_set(
                            v_objective,
                            '{current}',
                            to_jsonb(LEAST(NEW.current_streak, v_target))
                        );
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

            -- Actualizar la misión (NO descompletar si ya estaba completa)
            UPDATE gamification_system.missions
            SET
                objectives = v_new_objectives,
                progress = CASE
                    WHEN status = 'completed' THEN progress  -- No cambiar progress si ya está completa
                    ELSE ROUND(v_total_progress::NUMERIC, 2)
                END,
                status = CASE
                    -- Si ya está completada, mantenerla completada
                    WHEN status = 'completed' THEN 'completed'
                    -- Si alcanzó 100%, marcar como completada
                    WHEN v_total_progress >= 100 THEN 'completed'
                    -- Si tiene progreso y estaba activa, marcar como en progreso
                    WHEN v_total_progress > 0 AND status = 'active' THEN 'in_progress'
                    -- Caso contrario, mantener estado actual
                    ELSE status
                END,
                completed_at = CASE
                    WHEN v_total_progress >= 100 AND completed_at IS NULL THEN gamilit.now_mexico()
                    ELSE completed_at
                END,
                updated_at = gamilit.now_mexico()
            WHERE id = v_mission.id;

            RAISE NOTICE 'Mission % updated for daily_streak: streak=%, progress=%',
                v_mission.id, NEW.current_streak, v_total_progress;

        EXCEPTION
            WHEN OTHERS THEN
                -- Log error pero continuar con otras misiones
                RAISE WARNING 'Error updating mission % for daily_streak: %',
                    v_mission.id, SQLERRM;
        END;
    END LOOP;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error pero no bloquear el update del user_stats
        RAISE WARNING 'Error in update_missions_on_daily_streak for user %: %', NEW.user_id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Comentario descriptivo
COMMENT ON FUNCTION gamilit.update_missions_on_daily_streak() IS
    'Trigger function que actualiza el progreso de misiones con objetivo "daily_streak" '
    'cuando cambia la racha de días consecutivos (current_streak) del usuario. '
    'Establece current = racha actual (valor absoluto), recalcula progress y marca '
    'como completed si progress=100%. NO descompletará misiones ya completadas.';

-- =============================================================================
-- NOTAS DE IMPLEMENTACIÓN
-- =============================================================================
--
-- LÓGICA DE NEGOCIO:
-- - Se dispara cuando current_streak cambia en user_stats
-- - Busca misiones del usuario con objetivo type = 'daily_streak'
-- - ESTABLECE current = NEW.current_streak (valor absoluto, NO incrementa)
-- - Si la racha baja, current puede bajar también
-- - Pero misiones completadas NO se "descompletarán"
-- - Si progress = 100%, marca como 'completed'
--
-- DIFERENCIA CON correct_streak:
-- - correct_streak: racha de ejercicios correctos consecutivos (se calcula)
-- - daily_streak: racha de días consecutivos (ya existe en user_stats.current_streak)
--
-- ESTRUCTURA DE OBJECTIVES (JSONB):
-- [
--   {
--     "type": "daily_streak",
--     "target": 7,
--     "current": 0,
--     "description": "Mantener racha de 7 días"
--   }
-- ]
--
-- EJEMPLO DE COMPORTAMIENTO:
-- - Usuario tiene misión "7 días de racha"
-- - Día 1: current_streak=1 → misión.current=1 (14.3% progress)
-- - Día 3: current_streak=3 → misión.current=3 (42.9% progress)
-- - Usuario pierde racha: current_streak=0 → misión.current=0 (0% progress)
-- - Usuario vuelve: current_streak=7 → misión.current=7 (100% progress, completed)
--
-- PROTECCIÓN CONTRA "DESCOMPLETADO":
-- - Si una misión ya está 'completed', NO se cambia su status
-- - Esto permite que el usuario mantenga sus logros aunque pierda la racha
--
-- SEGURIDAD:
-- - SECURITY DEFINER permite escribir en missions sin permisos directos
-- - Manejo de excepciones por misión individual
-- - Error global no bloquea el update original de user_stats
--
-- PERFORMANCE:
-- - Query con índice en objectives JSONB (GIN index si existe)
-- - Un UPDATE por misión afectada
-- - Solo procesa si current_streak cambió (filtro en trigger condition)
--
-- =============================================================================
-- CHANGELOG
-- =============================================================================
-- 2025-11-28: Creación inicial
--             - Implementada para actualizar misiones con objetivo 'daily_streak'
--             - Establece current = racha actual (valor absoluto)
--             - Protege misiones completadas contra "descompletado"
--             - Compatible con arquitectura existente de triggers
-- =============================================================================
