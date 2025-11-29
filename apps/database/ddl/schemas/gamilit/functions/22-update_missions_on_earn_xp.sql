-- =============================================================================
-- Función: update_missions_on_earn_xp
-- Archivo: 22-update_missions_on_earn_xp.sql
-- Descripción: Actualiza el progreso de misiones al ganar XP
-- Schema: gamilit
-- Tipo: TRIGGER FUNCTION
-- Dependencias: gamification_system.missions, gamilit.now_mexico()
-- Uso: Trigger AFTER UPDATE ON gamification_system.user_stats
-- Created: 2025-11-28
-- =============================================================================

CREATE OR REPLACE FUNCTION gamilit.update_missions_on_earn_xp()
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
    v_xp_gained INTEGER;
    v_total_progress FLOAT;
    v_obj_count INTEGER;
    v_obj_progress FLOAT;
    v_i INTEGER;
BEGIN
    -- Solo procesar si el XP aumentó
    IF NEW.total_xp <= OLD.total_xp THEN
        RETURN NEW;
    END IF;

    -- Calcular XP ganado en esta actualización
    v_xp_gained := NEW.total_xp - OLD.total_xp;

    -- Buscar misiones activas o en progreso del usuario con objetivo 'earn_xp'
    FOR v_mission IN
        SELECT id, objectives, status
        FROM gamification_system.missions
        WHERE user_id = NEW.user_id
          AND status IN ('active', 'in_progress')
          AND end_date > gamilit.now_mexico()
          AND objectives @> '[{"type": "earn_xp"}]'::jsonb
    LOOP
        BEGIN
            v_objectives := v_mission.objectives;
            v_new_objectives := '[]'::jsonb;
            v_total_progress := 0;
            v_obj_count := jsonb_array_length(v_objectives);

            -- Iterar sobre cada objetivo
            FOR v_i IN 0..v_obj_count-1 LOOP
                v_objective := v_objectives->v_i;

                -- Si es objetivo de ganar XP, incrementar con el XP ganado
                IF v_objective->>'type' = 'earn_xp' THEN
                    v_new_current := LEAST(
                        (v_objective->>'current')::INTEGER + v_xp_gained,
                        (v_objective->>'target')::INTEGER
                    );
                    v_objective := jsonb_set(v_objective, '{current}', to_jsonb(v_new_current));
                END IF;

                -- Calcular progreso de este objetivo (0-100%)
                v_obj_progress := ((v_objective->>'current')::FLOAT / (v_objective->>'target')::FLOAT) * 100;
                v_total_progress := v_total_progress + v_obj_progress;

                -- Agregar objetivo actualizado al array
                v_new_objectives := v_new_objectives || jsonb_build_array(v_objective);
            END LOOP;

            -- Calcular progreso total de la misión (promedio de objetivos)
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

            RAISE NOTICE 'Mission % updated for user %: +% XP (total progress: %%)',
                v_mission.id, NEW.user_id, v_xp_gained, v_total_progress;

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
        -- Log error pero no bloquear el update de user_stats
        RAISE WARNING 'Error in update_missions_on_earn_xp for user %: %', NEW.user_id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Comentario descriptivo
COMMENT ON FUNCTION gamilit.update_missions_on_earn_xp() IS
    'Trigger function que actualiza el progreso de misiones diarias/semanales cuando un usuario '
    'gana XP. Busca misiones con objetivo "earn_xp" y actualiza el contador con el XP ganado. '
    'Si la misión alcanza 100% de progreso, la marca como completada.';

-- =============================================================================
-- NOTAS DE IMPLEMENTACIÓN
-- =============================================================================
--
-- LÓGICA DE NEGOCIO:
-- - Solo procesa cuando total_xp AUMENTA (NEW.total_xp > OLD.total_xp)
-- - Calcula XP ganado: v_xp_gained = NEW.total_xp - OLD.total_xp
-- - Busca misiones del usuario en estado 'active' o 'in_progress'
-- - Solo actualiza misiones que NO han expirado (end_date > now)
-- - Busca objetivos con type = 'earn_xp'
-- - Incrementa current con el XP ganado (sin superar target)
-- - Recalcula progreso total de la misión
-- - Si progreso = 100%, marca como 'completed'
-- - Si progreso > 0% y estaba 'active', cambia a 'in_progress'
--
-- ESTRUCTURA DE OBJECTIVES (JSONB):
-- [
--   {
--     "type": "earn_xp",
--     "target": 100,
--     "current": 0,
--     "description": "Gana 100 XP"
--   }
-- ]
--
-- SEGURIDAD:
-- - SECURITY DEFINER permite escribir en missions sin permisos directos
-- - Manejo de excepciones por misión individual (no afecta otras)
-- - Error global no bloquea el update original de user_stats
--
-- PERFORMANCE:
-- - Usa índice idx_missions_user_type_status para búsqueda eficiente
-- - Operador @> usa índice GIN en objectives
-- - Un UPDATE por misión afectada
-- - Se ejecuta SOLO cuando total_xp cambia (gracias a WHEN clause en trigger)
--
-- DEPENDENCIAS:
-- - Tabla: gamification_system.missions
-- - Función: gamilit.now_mexico()
-- - Columnas en NEW: user_id, total_xp
-- - Columnas en OLD: total_xp
--
-- =============================================================================
-- USO EN TRIGGERS
-- =============================================================================
--
-- CREATE TRIGGER trg_update_missions_on_earn_xp
--   AFTER UPDATE ON gamification_system.user_stats
--   FOR EACH ROW
--   WHEN (OLD.total_xp IS DISTINCT FROM NEW.total_xp)
--   EXECUTE FUNCTION gamilit.update_missions_on_earn_xp();
--
-- =============================================================================
-- TESTING
-- =============================================================================
--
-- Test 1: Usuario con misión diaria de ganar XP
-- -- Crear misión de prueba
-- INSERT INTO gamification_system.missions (user_id, template_id, title, mission_type, objectives, rewards, end_date)
-- VALUES ('user-uuid', 'daily_earn_xp', 'Ganar experiencia', 'daily',
--   '[{"type": "earn_xp", "target": 100, "current": 0}]'::jsonb,
--   '{"xp": 50, "ml_coins": 25}'::jsonb, NOW() + INTERVAL '1 day');
--
-- -- Actualizar XP del usuario (+50 XP)
-- UPDATE gamification_system.user_stats
-- SET total_xp = total_xp + 50
-- WHERE user_id = 'user-uuid';
--
-- -- Verificar: missions.objectives[0].current = 50, progress = 50%
--
-- Test 2: Usuario completa la misión de XP
-- -- Actualizar XP del usuario (+50 XP más)
-- UPDATE gamification_system.user_stats
-- SET total_xp = total_xp + 50
-- WHERE user_id = 'user-uuid';
--
-- -- Verificar: status = 'completed', progress = 100%, completed_at IS NOT NULL
--
-- Test 3: XP que no aumenta no afecta misiones
-- UPDATE gamification_system.user_stats
-- SET ml_coins = ml_coins + 10
-- WHERE user_id = 'user-uuid';
-- -- Verificar: misión sin cambios
--
-- Test 4: Múltiples objetivos
-- INSERT INTO gamification_system.missions (user_id, template_id, title, mission_type, objectives, rewards, end_date)
-- VALUES ('user-uuid', 'weekly_combined', 'Misión combinada', 'weekly',
--   '[
--     {"type": "earn_xp", "target": 200, "current": 0},
--     {"type": "complete_exercises", "target": 5, "current": 0}
--   ]'::jsonb,
--   '{"xp": 100, "ml_coins": 50}'::jsonb, NOW() + INTERVAL '7 days');
--
-- -- Ganar 100 XP
-- UPDATE gamification_system.user_stats SET total_xp = total_xp + 100 WHERE user_id = 'user-uuid';
-- -- Verificar: objectives[0].current = 100, progress = 25% (50% de earn_xp + 0% de exercises / 2)
--
-- =============================================================================
-- CHANGELOG
-- =============================================================================
-- 2025-11-28: Creación inicial
--             - Implementada para integrar ganancia de XP con misiones
--             - Soporta misiones diarias y semanales
--             - Manejo robusto de errores
--             - Compatible con arquitectura existente de triggers
--             - Calcula XP ganado incremental (no total_xp absoluto)
-- =============================================================================
