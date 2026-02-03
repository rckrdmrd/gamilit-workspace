-- =============================================================================
-- MIGRACION: Optimizacion de Triggers exercise_submissions
-- Fecha: 2026-02-02
-- Tarea: TASK-2026-02-02-IMPLEMENTAR-OPTIMIZACION-TRIGGERS
-- Ambiente: STAGING
-- =============================================================================
--
-- OBJETIVO:
-- Reducir latencia de triggers de 150-220ms a 95-155ms (-35%)
-- al consolidar triggers redundantes y agregar indices.
--
-- CAMBIOS:
-- 1. Nueva funcion: progress_tracking.update_module_progress_complete()
-- 2. Nueva funcion: gamification_system.process_xp_update()
-- 3. Nuevo trigger: trg_module_progress_complete (reemplaza 27+33)
-- 4. Nuevo trigger: trg_process_xp_update (reemplaza 21)
-- 5. 5 indices de optimizacion
--
-- ROLLBACK: Ver seccion al final del archivo
--
-- =============================================================================

\echo '================================================='
\echo 'INICIO: Migracion Optimizacion Triggers'
\echo '================================================='

BEGIN;

-- =============================================================================
-- PASO 1: CREAR FUNCIONES CONSOLIDADAS
-- =============================================================================

\echo 'Paso 1.1: Creando progress_tracking.update_module_progress_complete()...'

CREATE OR REPLACE FUNCTION progress_tracking.update_module_progress_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_module_id UUID;
    v_total_exercises INTEGER;
    v_completed_exercises INTEGER;
    v_graded_exercises INTEGER;
    v_avg_score NUMERIC(5,2);
    v_progress_percentage NUMERIC;
    v_graded_percentage NUMERIC;
    v_new_status progress_tracking.progress_status;
    v_current_status progress_tracking.progress_status;
    v_is_first_approved_for_exercise BOOLEAN;
    v_total_xp INTEGER;
    v_total_coins INTEGER;
BEGIN
    -- Filtro rapido
    IF NEW.score < 60 OR NEW.status NOT IN ('graded', 'reviewed') THEN
        RETURN NEW;
    END IF;

    -- Obtener module_id
    SELECT module_id INTO v_module_id
    FROM educational_content.exercises
    WHERE id = NEW.exercise_id;

    IF v_module_id IS NULL THEN
        RAISE WARNING 'Ejercicio % no tiene module_id', NEW.exercise_id;
        RETURN NEW;
    END IF;

    -- Verificar primer aprobado
    SELECT NOT EXISTS (
        SELECT 1 FROM progress_tracking.exercise_submissions
        WHERE user_id = NEW.user_id AND exercise_id = NEW.exercise_id
          AND score >= 60 AND status IN ('graded', 'reviewed') AND id != NEW.id
    ) INTO v_is_first_approved_for_exercise;

    IF NOT v_is_first_approved_for_exercise THEN
        SELECT ROUND(AVG(CASE WHEN es.max_score > 0 THEN (es.score::NUMERIC / es.max_score * 100) ELSE es.score END), 2)
        INTO v_avg_score
        FROM progress_tracking.exercise_submissions es
        JOIN educational_content.exercises e ON es.exercise_id = e.id
        WHERE es.user_id = NEW.user_id AND e.module_id = v_module_id AND es.status IN ('graded', 'reviewed');

        UPDATE progress_tracking.module_progress
        SET average_score = COALESCE(v_avg_score, average_score),
            last_accessed_at = gamilit.now_mexico(), updated_at = gamilit.now_mexico()
        WHERE user_id = NEW.user_id AND module_id = v_module_id;
        RETURN NEW;
    END IF;

    -- Total ejercicios activos
    SELECT COUNT(*) INTO v_total_exercises
    FROM educational_content.exercises WHERE module_id = v_module_id AND is_active = true;

    -- Calcular metricas consolidadas
    WITH completed_exercises AS (
        SELECT ea.exercise_id FROM progress_tracking.exercise_attempts ea
        JOIN educational_content.exercises e ON e.id = ea.exercise_id
        WHERE ea.user_id = NEW.user_id AND e.module_id = v_module_id AND ea.is_correct = true
        UNION
        SELECT es.exercise_id FROM progress_tracking.exercise_submissions es
        JOIN educational_content.exercises e ON e.id = es.exercise_id
        WHERE es.user_id = NEW.user_id AND e.module_id = v_module_id
          AND es.score >= 60 AND es.status IN ('graded', 'reviewed')
    ),
    graded_exercises AS (
        SELECT DISTINCT es.exercise_id FROM progress_tracking.exercise_submissions es
        JOIN educational_content.exercises e ON e.id = es.exercise_id
        WHERE es.user_id = NEW.user_id AND e.module_id = v_module_id AND es.status IN ('graded', 'reviewed')
    ),
    score_stats AS (
        SELECT ROUND(AVG(CASE WHEN es.max_score > 0 THEN (es.score::NUMERIC / es.max_score * 100) ELSE es.score END), 2) as avg_score,
               COALESCE(SUM(es.xp_earned), 0) as total_xp, COALESCE(SUM(es.ml_coins_earned), 0) as total_coins
        FROM progress_tracking.exercise_submissions es
        JOIN educational_content.exercises e ON e.id = es.exercise_id
        WHERE es.user_id = NEW.user_id AND e.module_id = v_module_id AND es.status IN ('graded', 'reviewed')
    )
    SELECT (SELECT COUNT(*) FROM completed_exercises), (SELECT COUNT(*) FROM graded_exercises),
           ss.avg_score, ss.total_xp, ss.total_coins
    INTO v_completed_exercises, v_graded_exercises, v_avg_score, v_total_xp, v_total_coins
    FROM score_stats ss;

    -- Calcular porcentajes
    IF v_total_exercises > 0 THEN
        v_progress_percentage := ROUND((v_completed_exercises::NUMERIC / v_total_exercises::NUMERIC) * 100, 2);
        v_graded_percentage := ROUND((v_graded_exercises::NUMERIC / v_total_exercises::NUMERIC) * 100, 2);
    ELSE
        v_progress_percentage := 0; v_graded_percentage := 0;
    END IF;

    -- Determinar status
    IF v_progress_percentage >= 100 THEN v_new_status := 'completed';
    ELSIF v_progress_percentage > 0 THEN v_new_status := 'in_progress';
    ELSE v_new_status := 'not_started'; END IF;

    SELECT status INTO v_current_status FROM progress_tracking.module_progress
    WHERE user_id = NEW.user_id AND module_id = v_module_id;

    -- UPSERT
    INSERT INTO progress_tracking.module_progress (
        user_id, module_id, status, progress_percentage, completed_exercises, total_exercises,
        graded_exercises, graded_progress_percentage, average_score, total_xp_earned,
        total_ml_coins_earned, started_at, last_accessed_at, completed_at, updated_at
    ) VALUES (
        NEW.user_id, v_module_id, v_new_status, v_progress_percentage, v_completed_exercises,
        v_total_exercises, v_graded_exercises, v_graded_percentage, COALESCE(v_avg_score, 0),
        COALESCE(v_total_xp, 0), COALESCE(v_total_coins, 0), gamilit.now_mexico(),
        gamilit.now_mexico(), CASE WHEN v_new_status = 'completed' THEN gamilit.now_mexico() ELSE NULL END,
        gamilit.now_mexico()
    )
    ON CONFLICT (user_id, module_id) DO UPDATE SET
        completed_exercises = EXCLUDED.completed_exercises, total_exercises = EXCLUDED.total_exercises,
        progress_percentage = EXCLUDED.progress_percentage, graded_exercises = EXCLUDED.graded_exercises,
        graded_progress_percentage = EXCLUDED.graded_progress_percentage, average_score = EXCLUDED.average_score,
        total_xp_earned = EXCLUDED.total_xp_earned, total_ml_coins_earned = EXCLUDED.total_ml_coins_earned,
        status = EXCLUDED.status,
        completed_at = CASE WHEN EXCLUDED.status = 'completed' AND progress_tracking.module_progress.completed_at IS NULL
                       THEN gamilit.now_mexico() ELSE progress_tracking.module_progress.completed_at END,
        started_at = COALESCE(progress_tracking.module_progress.started_at, gamilit.now_mexico()),
        last_accessed_at = gamilit.now_mexico(), updated_at = gamilit.now_mexico();

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error en update_module_progress_complete: %', SQLERRM;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION progress_tracking.update_module_progress_complete() IS
    'Funcion consolidada para module_progress. TASK-2026-02-02';

\echo 'Paso 1.2: Creando gamification_system.process_xp_update()...'

CREATE OR REPLACE FUNCTION gamification_system.process_xp_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_level INTEGER;
    v_xp_gained INTEGER;
    v_old_xp INTEGER;
BEGIN
    v_old_xp := COALESCE(OLD.total_xp, 0);
    IF NEW.total_xp IS NOT DISTINCT FROM v_old_xp THEN RETURN NEW; END IF;

    -- Recalcular nivel
    v_new_level := gamification_system.calculate_level_from_xp(NEW.total_xp);
    IF v_new_level IS DISTINCT FROM NEW.level THEN
        NEW.level := v_new_level;
        RAISE NOTICE 'User % level: % -> %', NEW.user_id, OLD.level, v_new_level;
    END IF;

    -- Actualizar misiones de XP
    v_xp_gained := NEW.total_xp - v_old_xp;
    IF v_xp_gained > 0 THEN
        PERFORM gamilit.update_mission_progress(NEW.user_id, 'earn_xp', v_xp_gained);
    END IF;

    NEW.updated_at := gamilit.now_mexico();
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error en process_xp_update: %', SQLERRM;
    BEGIN
        v_new_level := gamification_system.calculate_level_from_xp(NEW.total_xp);
        IF v_new_level IS DISTINCT FROM NEW.level THEN NEW.level := v_new_level; END IF;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION gamification_system.process_xp_update() IS
    'Funcion consolidada para XP + level + missions. TASK-2026-02-02';

-- =============================================================================
-- PASO 2: CREAR INDICES DE OPTIMIZACION
-- =============================================================================

\echo 'Paso 2: Creando indices de optimizacion...'

CREATE INDEX IF NOT EXISTS idx_exercises_module_active
ON educational_content.exercises(module_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_submissions_user_exercise_status
ON progress_tracking.exercise_submissions(user_id, exercise_id, status);

CREATE INDEX IF NOT EXISTS idx_attempts_user_correct
ON progress_tracking.exercise_attempts(user_id, exercise_id) WHERE is_correct = true;

CREATE INDEX IF NOT EXISTS idx_submissions_user_graded
ON progress_tracking.exercise_submissions(user_id, status) WHERE status IN ('graded', 'reviewed');

CREATE INDEX IF NOT EXISTS idx_missions_user_active_type
ON gamification_system.missions(user_id, status) WHERE status IN ('active', 'in_progress');

\echo 'Indices creados: 5'

-- =============================================================================
-- PASO 3: REEMPLAZAR TRIGGERS
-- =============================================================================

\echo 'Paso 3.1: Eliminando triggers antiguos...'

DROP TRIGGER IF EXISTS trg_update_module_progress_on_submission ON progress_tracking.exercise_submissions;
DROP TRIGGER IF EXISTS trg_sync_average_score_on_submission ON progress_tracking.exercise_submissions;
DROP TRIGGER IF EXISTS trg_recalculate_level_on_xp_change ON gamification_system.user_stats;

\echo 'Paso 3.2: Creando triggers consolidados...'

CREATE TRIGGER trg_module_progress_complete
    AFTER UPDATE ON progress_tracking.exercise_submissions
    FOR EACH ROW
    WHEN ((OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('graded', 'reviewed'))
          OR (OLD.score IS DISTINCT FROM NEW.score AND NEW.status IN ('graded', 'reviewed')))
    EXECUTE FUNCTION progress_tracking.update_module_progress_complete();

CREATE TRIGGER trg_process_xp_update
    BEFORE UPDATE ON gamification_system.user_stats
    FOR EACH ROW
    WHEN (OLD.total_xp IS DISTINCT FROM NEW.total_xp)
    EXECUTE FUNCTION gamification_system.process_xp_update();

\echo 'Triggers consolidados creados: 2'

-- =============================================================================
-- PASO 4: PERMISOS
-- =============================================================================

\echo 'Paso 4: Otorgando permisos...'

GRANT EXECUTE ON FUNCTION progress_tracking.update_module_progress_complete() TO gamilit_user;
GRANT EXECUTE ON FUNCTION gamification_system.process_xp_update() TO gamilit_user;

-- =============================================================================
-- VERIFICACION
-- =============================================================================

\echo 'Paso 5: Verificando migracion...'

DO $$
DECLARE
    v_func_count INTEGER;
    v_trig_count INTEGER;
    v_idx_count INTEGER;
BEGIN
    -- Verificar funciones
    SELECT COUNT(*) INTO v_func_count FROM pg_proc
    WHERE proname IN ('update_module_progress_complete', 'process_xp_update');

    -- Verificar triggers
    SELECT COUNT(*) INTO v_trig_count FROM pg_trigger
    WHERE tgname IN ('trg_module_progress_complete', 'trg_process_xp_update');

    -- Verificar indices
    SELECT COUNT(*) INTO v_idx_count FROM pg_indexes
    WHERE indexname IN ('idx_exercises_module_active', 'idx_submissions_user_exercise_status',
                        'idx_attempts_user_correct', 'idx_submissions_user_graded',
                        'idx_missions_user_active_type');

    IF v_func_count = 2 AND v_trig_count = 2 AND v_idx_count = 5 THEN
        RAISE NOTICE '✓ VERIFICACION OK: 2 funciones, 2 triggers, 5 indices';
    ELSE
        RAISE EXCEPTION 'VERIFICACION FALLIDA: funciones=%, triggers=%, indices=%',
            v_func_count, v_trig_count, v_idx_count;
    END IF;
END $$;

COMMIT;

\echo '================================================='
\echo 'FIN: Migracion completada exitosamente'
\echo '================================================='

-- =============================================================================
-- ROLLBACK (ejecutar manualmente si es necesario)
-- =============================================================================
/*
BEGIN;

-- Eliminar triggers consolidados
DROP TRIGGER IF EXISTS trg_module_progress_complete ON progress_tracking.exercise_submissions;
DROP TRIGGER IF EXISTS trg_process_xp_update ON gamification_system.user_stats;

-- Recrear triggers originales
CREATE TRIGGER trg_update_module_progress_on_submission
    AFTER UPDATE ON progress_tracking.exercise_submissions
    FOR EACH ROW
    WHEN (NEW.status IN ('graded', 'reviewed') AND NEW.score >= 60)
    EXECUTE FUNCTION gamilit.update_module_progress_on_submission_graded();

CREATE TRIGGER trg_recalculate_level_on_xp_change
    BEFORE UPDATE ON gamification_system.user_stats
    FOR EACH ROW
    WHEN (OLD.total_xp IS DISTINCT FROM NEW.total_xp)
    EXECUTE FUNCTION gamification_system.recalculate_level_on_xp_change();

-- Nota: trg_sync_average_score_on_submission requiere recrear su funcion inline
-- Ver archivo original: 33-trg_sync_average_score_on_submission.sql

-- Eliminar indices (opcional, no afectan funcionalidad)
-- DROP INDEX IF EXISTS educational_content.idx_exercises_module_active;
-- DROP INDEX IF EXISTS progress_tracking.idx_submissions_user_exercise_status;
-- DROP INDEX IF EXISTS progress_tracking.idx_attempts_user_correct;
-- DROP INDEX IF EXISTS progress_tracking.idx_submissions_user_graded;
-- DROP INDEX IF EXISTS gamification_system.idx_missions_user_active_type;

COMMIT;
*/
