-- =============================================================================
-- Funcion: update_module_progress_on_exercise_complete
-- Descripcion: Actualiza el progreso del modulo al completar un ejercicio
-- Schema: gamilit
-- Tipo: TRIGGER FUNCTION
-- Dependencias: progress_tracking.module_progress, educational_content.exercises
-- Uso: Trigger AFTER INSERT ON progress_tracking.exercise_attempts
-- Creado: 2025-11-24
-- =============================================================================

CREATE OR REPLACE FUNCTION gamilit.update_module_progress_on_exercise_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_module_id UUID;
    v_total_exercises INTEGER;
    v_completed_exercises INTEGER;
    v_progress_percentage NUMERIC;
    v_new_status progress_tracking.progress_status;
    v_is_first_correct_for_exercise BOOLEAN;
    v_current_status progress_tracking.progress_status;
BEGIN
    -- Solo procesar si el ejercicio fue correcto
    IF NOT (NEW.is_correct = true OR NEW.score >= 60) THEN
        RETURN NEW;
    END IF;

    -- Obtener el module_id del ejercicio
    SELECT module_id INTO v_module_id
    FROM educational_content.exercises
    WHERE id = NEW.exercise_id;

    IF v_module_id IS NULL THEN
        RAISE WARNING 'Ejercicio % no tiene module_id asociado', NEW.exercise_id;
        RETURN NEW;
    END IF;

    -- Verificar si es el primer intento correcto para ESTE ejercicio especifico
    SELECT NOT EXISTS (
        SELECT 1 FROM progress_tracking.exercise_attempts
        WHERE user_id = NEW.user_id
          AND exercise_id = NEW.exercise_id
          AND is_correct = true
          AND id != NEW.id
    ) INTO v_is_first_correct_for_exercise;

    -- Si no es el primer acierto para este ejercicio, solo actualizar timestamps
    IF NOT v_is_first_correct_for_exercise THEN
        UPDATE progress_tracking.module_progress
        SET last_accessed_at = gamilit.now_mexico(),
            updated_at = gamilit.now_mexico()
        WHERE user_id = NEW.user_id AND module_id = v_module_id;
        RETURN NEW;
    END IF;

    -- Contar total de ejercicios activos en el modulo
    SELECT COUNT(*)
    INTO v_total_exercises
    FROM educational_content.exercises
    WHERE module_id = v_module_id AND is_active = true;

    -- Contar ejercicios correctos UNICOS del usuario en este modulo
    SELECT COUNT(DISTINCT ea.exercise_id)
    INTO v_completed_exercises
    FROM progress_tracking.exercise_attempts ea
    JOIN educational_content.exercises e ON e.id = ea.exercise_id
    WHERE ea.user_id = NEW.user_id
      AND e.module_id = v_module_id
      AND ea.is_correct = true;

    -- Calcular porcentaje de progreso
    IF v_total_exercises > 0 THEN
        v_progress_percentage := ROUND((v_completed_exercises::NUMERIC / v_total_exercises::NUMERIC) * 100, 2);
    ELSE
        v_progress_percentage := 0;
    END IF;

    -- Determinar nuevo status
    IF v_progress_percentage >= 100 THEN
        v_new_status := 'completed';
    ELSIF v_progress_percentage > 0 THEN
        v_new_status := 'in_progress';
    ELSE
        v_new_status := 'not_started';
    END IF;

    -- Obtener status actual
    SELECT status INTO v_current_status
    FROM progress_tracking.module_progress
    WHERE user_id = NEW.user_id AND module_id = v_module_id;

    -- Actualizar module_progress
    UPDATE progress_tracking.module_progress
    SET
        completed_exercises = v_completed_exercises,
        total_exercises = v_total_exercises,
        progress_percentage = v_progress_percentage,
        status = v_new_status,
        total_xp_earned = total_xp_earned + COALESCE(NEW.xp_earned, 0),
        total_ml_coins_earned = total_ml_coins_earned + COALESCE(NEW.ml_coins_earned, 0),
        -- Establecer started_at solo si es el primer ejercicio
        started_at = CASE
            WHEN started_at IS NULL THEN gamilit.now_mexico()
            ELSE started_at
        END,
        -- Establecer completed_at cuando se completa el modulo
        completed_at = CASE
            WHEN v_new_status = 'completed' AND (completed_at IS NULL OR v_current_status != 'completed')
            THEN gamilit.now_mexico()
            ELSE completed_at
        END,
        last_accessed_at = gamilit.now_mexico(),
        updated_at = gamilit.now_mexico()
    WHERE user_id = NEW.user_id AND module_id = v_module_id;

    -- Si no existe el registro de progreso, crearlo
    IF NOT FOUND THEN
        INSERT INTO progress_tracking.module_progress (
            user_id,
            module_id,
            status,
            progress_percentage,
            completed_exercises,
            total_exercises,
            total_xp_earned,
            total_ml_coins_earned,
            started_at,
            last_accessed_at
        ) VALUES (
            NEW.user_id,
            v_module_id,
            v_new_status,
            v_progress_percentage,
            v_completed_exercises,
            v_total_exercises,
            COALESCE(NEW.xp_earned, 0),
            COALESCE(NEW.ml_coins_earned, 0),
            gamilit.now_mexico(),
            gamilit.now_mexico()
        );
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error pero no bloquear el insert del attempt
        RAISE WARNING 'Error al actualizar progreso de modulo para usuario %: %', NEW.user_id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Comentario descriptivo
COMMENT ON FUNCTION gamilit.update_module_progress_on_exercise_complete() IS
    'Trigger function que actualiza el progreso del modulo al completar un ejercicio correctamente. '
    'Calcula porcentaje de avance, actualiza contadores y determina status (not_started/in_progress/completed). '
    'Solo cuenta un ejercicio una vez aunque tenga multiples intentos correctos.';

-- Permisos
GRANT EXECUTE ON FUNCTION gamilit.update_module_progress_on_exercise_complete() TO gamilit_user;
