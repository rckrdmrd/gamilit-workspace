-- =============================================================================
-- Función: update_missions_on_correct_streak
-- Descripción: Actualiza misiones con objetivo 'correct_streak' al completar ejercicios
-- Schema: gamilit
-- Tipo: TRIGGER FUNCTION
-- Dependencias: gamification_system.missions, gamilit.now_mexico()
-- Uso: Trigger AFTER INSERT ON progress_tracking.exercise_attempts
-- Created: 2025-11-26
-- =============================================================================

CREATE OR REPLACE FUNCTION gamilit.update_missions_on_correct_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_mission RECORD;
    v_objectives JSONB;
    v_new_objectives JSONB;
    v_objective JSONB;
    v_streak_count INTEGER;
    v_target INTEGER;
    v_total_progress FLOAT;
    v_obj_count INTEGER;
    v_obj_progress FLOAT;
    v_i INTEGER;
BEGIN
    -- Solo procesar si el ejercicio fue correcto
    IF NEW.is_correct IS NULL OR NEW.is_correct = false THEN
        -- Si fue incorrecto, la racha se rompe, no hay nada que actualizar
        -- Las misiones con correct_streak mantienen su progreso actual
        RETURN NEW;
    END IF;

    -- Calcular racha actual de ejercicios correctos consecutivos
    -- Cuenta hacia atrás desde el ejercicio actual hasta encontrar uno incorrecto
    SELECT COUNT(*) INTO v_streak_count
    FROM (
        SELECT is_correct
        FROM progress_tracking.exercise_attempts
        WHERE user_id = NEW.user_id
          AND created_at <= NEW.created_at
        ORDER BY created_at DESC
    ) recent_attempts
    WHERE is_correct = true
    -- Detenerse en el primer incorrecto (usar un truco con row_number)
    AND NOT EXISTS (
        SELECT 1
        FROM (
            SELECT is_correct, row_number() OVER (ORDER BY created_at DESC) as rn
            FROM progress_tracking.exercise_attempts
            WHERE user_id = NEW.user_id
              AND created_at <= NEW.created_at
        ) with_rn
        WHERE with_rn.is_correct = false
          AND with_rn.rn < (
              SELECT row_number() OVER (ORDER BY created_at DESC)
              FROM progress_tracking.exercise_attempts ea2
              WHERE ea2.user_id = NEW.user_id
                AND ea2.created_at = recent_attempts.created_at
          )
    );

    -- Método más simple: contar consecutivos desde el último
    WITH ordered_attempts AS (
        SELECT
            is_correct,
            ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
        FROM progress_tracking.exercise_attempts
        WHERE user_id = NEW.user_id
    ),
    consecutive_correct AS (
        SELECT COUNT(*) as streak
        FROM ordered_attempts
        WHERE rn <= (
            SELECT COALESCE(MIN(rn) - 1, (SELECT MAX(rn) FROM ordered_attempts))
            FROM ordered_attempts
            WHERE is_correct = false
        )
        AND is_correct = true
    )
    SELECT COALESCE(streak, 0) INTO v_streak_count
    FROM consecutive_correct;

    -- Si no hay racha, no actualizar
    IF v_streak_count = 0 THEN
        RETURN NEW;
    END IF;

    -- Buscar misiones activas o en progreso del usuario con objetivo 'correct_streak'
    FOR v_mission IN
        SELECT id, objectives, status
        FROM gamification_system.missions
        WHERE user_id = NEW.user_id
          AND status IN ('active', 'in_progress')
          AND end_date > gamilit.now_mexico()
          AND objectives @> '[{"type": "correct_streak"}]'::jsonb
    LOOP
        BEGIN
            v_objectives := v_mission.objectives;
            v_new_objectives := '[]'::jsonb;
            v_total_progress := 0;
            v_obj_count := jsonb_array_length(v_objectives);

            -- Iterar sobre cada objetivo
            FOR v_i IN 0..v_obj_count-1 LOOP
                v_objective := v_objectives->v_i;

                -- Si es objetivo de racha de correctos
                IF v_objective->>'type' = 'correct_streak' THEN
                    v_target := (v_objective->>'target')::INTEGER;

                    -- La racha actual se establece al mínimo entre la racha real y el target
                    -- (no puede superar el target)
                    v_objective := jsonb_set(
                        v_objective,
                        '{current}',
                        to_jsonb(LEAST(v_streak_count, v_target))
                    );
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

            RAISE NOTICE 'Mission % updated for correct_streak: streak=%, progress=%',
                v_mission.id, v_streak_count, v_total_progress;

        EXCEPTION
            WHEN OTHERS THEN
                -- Log error pero continuar con otras misiones
                RAISE WARNING 'Error updating mission % for correct_streak: %',
                    v_mission.id, SQLERRM;
        END;
    END LOOP;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error pero no bloquear el insert del attempt
        RAISE WARNING 'Error in update_missions_on_correct_streak for user %: %', NEW.user_id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Comentario descriptivo
COMMENT ON FUNCTION gamilit.update_missions_on_correct_streak() IS
    'Trigger function que actualiza el progreso de misiones con objetivo "correct_streak" '
    'cuando un usuario completa ejercicios correctos consecutivos. Calcula la racha actual '
    'basándose en los últimos intentos del usuario y actualiza las misiones correspondientes.';

-- =============================================================================
-- NOTAS DE IMPLEMENTACIÓN
-- =============================================================================
--
-- LÓGICA DE NEGOCIO:
-- - Solo procesa ejercicios correctos (is_correct = true)
-- - Calcula racha de correctos consecutivos mirando intentos recientes
-- - La racha se rompe con cualquier ejercicio incorrecto
-- - Busca misiones del usuario con objetivo type = 'correct_streak'
-- - Actualiza current con la racha actual (max = target)
-- - Si progress = 100%, marca como 'completed'
--
-- DIFERENCIA CON complete_exercises:
-- - complete_exercises: incrementa +1 por cada ejercicio correcto
-- - correct_streak: establece current = racha actual de consecutivos
--
-- ESTRUCTURA DE OBJECTIVES (JSONB):
-- [
--   {
--     "type": "correct_streak",
--     "target": 2,
--     "current": 0,
--     "description": "2 ejercicios correctos seguidos"
--   }
-- ]
--
-- SEGURIDAD:
-- - SECURITY DEFINER permite escribir en missions sin permisos directos
-- - Manejo de excepciones por misión individual
-- - Error global no bloquea el insert original
--
-- PERFORMANCE:
-- - Query con CTE para calcular racha eficientemente
-- - Un UPDATE por misión afectada
--
-- =============================================================================
-- CHANGELOG
-- =============================================================================
-- 2025-11-26: Creación inicial
--             - Implementada para cerrar BUG-002 (correct_streak no se actualizaba)
--             - Calcula racha de ejercicios correctos consecutivos
--             - Compatible con arquitectura existente de triggers
-- =============================================================================
