-- =============================================================================
-- Funcion: update_module_progress_on_submission_graded
-- Descripcion: Actualiza el progreso del modulo al calificar un submission
-- Schema: gamilit
-- Tipo: TRIGGER FUNCTION
-- Dependencias: progress_tracking.module_progress, educational_content.exercises
-- Uso: Trigger AFTER UPDATE ON progress_tracking.exercise_submissions
-- Creado: 2025-11-28
-- =============================================================================

CREATE OR REPLACE FUNCTION gamilit.update_module_progress_on_submission_graded()
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
    v_is_first_approved_for_exercise BOOLEAN;
    v_current_status progress_tracking.progress_status;
BEGIN
    -- Solo procesar si el submission fue aprobado (score >= 60)
    IF NEW.score < 60 THEN
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

    -- Verificar si es el primer submission aprobado para ESTE ejercicio especifico
    -- Cuenta submissions con score >= 60 del mismo usuario en el mismo ejercicio
    SELECT NOT EXISTS (
        SELECT 1 FROM progress_tracking.exercise_submissions
        WHERE user_id = NEW.user_id
          AND exercise_id = NEW.exercise_id
          AND score >= 60
          AND status IN ('graded', 'reviewed')
          AND id != NEW.id
    ) INTO v_is_first_approved_for_exercise;

    -- Si no es el primer aprobado para este ejercicio, solo actualizar timestamps
    IF NOT v_is_first_approved_for_exercise THEN
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

    -- Contar ejercicios aprobados UNICOS del usuario en este modulo
    -- Incluye tanto exercise_attempts (is_correct=true) como exercise_submissions (score>=60)
    SELECT COUNT(DISTINCT exercise_id)
    INTO v_completed_exercises
    FROM (
        -- Ejercicios auto-calificados correctos (attempts)
        SELECT ea.exercise_id
        FROM progress_tracking.exercise_attempts ea
        JOIN educational_content.exercises e ON e.id = ea.exercise_id
        WHERE ea.user_id = NEW.user_id
          AND e.module_id = v_module_id
          AND ea.is_correct = true

        UNION

        -- Ejercicios con revision manual aprobados (submissions)
        SELECT es.exercise_id
        FROM progress_tracking.exercise_submissions es
        JOIN educational_content.exercises e ON e.id = es.exercise_id
        WHERE es.user_id = NEW.user_id
          AND e.module_id = v_module_id
          AND es.score >= 60
          AND es.status IN ('graded', 'reviewed')
    ) completed;

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
        -- Log error pero no bloquear el update del submission
        RAISE WARNING 'Error al actualizar progreso de modulo para usuario % en submission %: %',
            NEW.user_id, NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Comentario descriptivo
COMMENT ON FUNCTION gamilit.update_module_progress_on_submission_graded() IS
    'Trigger function que actualiza el progreso del modulo al calificar un submission con score >= 60. '
    'Calcula porcentaje de avance considerando AMBOS exercise_attempts Y exercise_submissions. '
    'Solo cuenta un ejercicio una vez aunque tenga multiples submissions aprobados. '
    'Complementa update_module_progress_on_exercise_complete() para ejercicios con revision manual.';

-- Permisos
GRANT EXECUTE ON FUNCTION gamilit.update_module_progress_on_submission_graded() TO gamilit_user;

-- =============================================================================
-- NOTAS TECNICAS
-- =============================================================================
--
-- DIFERENCIAS CON update_module_progress_on_exercise_complete():
--
-- 1. CONDICION DE APROBADO:
--    - exercise_attempts: is_correct = true OR score >= 60
--    - exercise_submissions: score >= 60 AND status IN ('graded', 'reviewed')
--
-- 2. VERIFICACION DE PRIMER ACIERTO:
--    - exercise_attempts: Busca attempts con is_correct=true del mismo ejercicio
--    - exercise_submissions: Busca submissions con score>=60 del mismo ejercicio
--
-- 3. CONTEO DE EJERCICIOS COMPLETADOS:
--    - exercise_attempts: Solo cuenta attempts con is_correct=true
--    - exercise_submissions: Cuenta UNION de attempts correctos Y submissions aprobados
--      (Para tener vision completa del progreso del usuario)
--
-- 4. TRIGGER EVENT:
--    - exercise_attempts: AFTER INSERT (nuevo intento)
--    - exercise_submissions: AFTER UPDATE (calificacion del profesor)
--
-- RAZON DEL UNION EN EL CONTEO:
-- Un modulo puede tener:
-- - Ejercicios auto-calificados (Crucigrama, Sopa Letras) -> exercise_attempts
-- - Ejercicios con revision manual (Rueda Inferencias) -> exercise_submissions
--
-- Para calcular el progreso correcto del modulo, necesitamos contar ejercicios
-- completados de AMBAS fuentes. El UNION evita duplicados si un ejercicio
-- tiene tanto attempts como submissions (aunque seria raro).
--
-- EJEMPLO DE PROGRESO:
-- Modulo 2 "Comprension Lectora" tiene 10 ejercicios:
-- - 7 auto-calificados (Crucigrama, etc.)
-- - 3 con revision manual (Rueda Inferencias, Detective Textual)
--
-- Usuario completa:
-- - 5/7 auto-calificados -> 5 en exercise_attempts con is_correct=true
-- - 2/3 con revision manual -> 2 en exercise_submissions con score >= 60
--
-- Total: 7/10 ejercicios completados = 70% progreso
--
-- Sin el UNION, solo contariamos 2/10 = 20% cuando se califica un submission,
-- lo cual seria incorrecto.
--
-- =============================================================================
