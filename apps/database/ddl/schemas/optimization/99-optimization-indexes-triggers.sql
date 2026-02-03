-- =============================================================================
-- Indices de Optimizacion para Triggers Consolidados
-- Descripcion: Indices adicionales para acelerar los triggers de exercise_submissions
-- Creado: 2026-02-02
-- Origen: TASK-2026-02-02-IMPLEMENTAR-OPTIMIZACION-TRIGGERS (P2-B - Fase 2)
-- =============================================================================
--
-- PROPOSITO:
-- Estos indices aceleran las queries ejecutadas por los triggers consolidados:
-- - update_module_progress_complete()
-- - process_xp_update()
--
-- IMPACTO ESTIMADO:
-- - Reduccion adicional de ~10-20ms en queries de lookup
-- - Mejora especialmente notable con >1000 submissions por modulo
--
-- =============================================================================

-- =============================================================================
-- INDICE 1: Ejercicios activos por modulo
-- =============================================================================
-- Acelera: COUNT(*) FROM exercises WHERE module_id = ? AND is_active = true
-- Usado por: update_module_progress_complete() - Paso 3.1

CREATE INDEX IF NOT EXISTS idx_exercises_module_active
ON educational_content.exercises(module_id)
WHERE is_active = true;

COMMENT ON INDEX educational_content.idx_exercises_module_active IS
    'Indice parcial para lookup de ejercicios activos por modulo. '
    'Acelera calculo de total_exercises en update_module_progress_complete(). '
    'Creado: TASK-2026-02-02-IMPLEMENTAR-OPTIMIZACION-TRIGGERS';

-- =============================================================================
-- INDICE 2: Submissions por usuario/ejercicio/status
-- =============================================================================
-- Acelera: SELECT FROM submissions WHERE user_id = ? AND exercise_id = ? AND status IN (...)
-- Usado por: update_module_progress_complete() - Paso 2 (verificacion primer aprobado)

CREATE INDEX IF NOT EXISTS idx_submissions_user_exercise_status
ON progress_tracking.exercise_submissions(user_id, exercise_id, status);

COMMENT ON INDEX progress_tracking.idx_submissions_user_exercise_status IS
    'Indice compuesto para lookup de submissions por usuario, ejercicio y status. '
    'Acelera verificacion de primer submission aprobado en update_module_progress_complete(). '
    'Creado: TASK-2026-02-02-IMPLEMENTAR-OPTIMIZACION-TRIGGERS';

-- =============================================================================
-- INDICE 3: Attempts correctos por usuario
-- =============================================================================
-- Acelera: SELECT FROM attempts WHERE user_id = ? AND is_correct = true
-- Usado por: update_module_progress_complete() - CTE completed_exercises

CREATE INDEX IF NOT EXISTS idx_attempts_user_correct
ON progress_tracking.exercise_attempts(user_id, exercise_id)
WHERE is_correct = true;

COMMENT ON INDEX progress_tracking.idx_attempts_user_correct IS
    'Indice parcial para lookup de attempts correctos por usuario. '
    'Acelera UNION de ejercicios completados en update_module_progress_complete(). '
    'Creado: TASK-2026-02-02-IMPLEMENTAR-OPTIMIZACION-TRIGGERS';

-- =============================================================================
-- INDICE 4: Submissions calificadas por usuario y modulo
-- =============================================================================
-- Acelera: JOIN submissions-exercises para calculo de average_score
-- Usado por: update_module_progress_complete() - CTE score_stats

CREATE INDEX IF NOT EXISTS idx_submissions_user_graded
ON progress_tracking.exercise_submissions(user_id, status)
WHERE status IN ('graded', 'reviewed');

COMMENT ON INDEX progress_tracking.idx_submissions_user_graded IS
    'Indice parcial para submissions calificadas por usuario. '
    'Acelera calculo de average_score y totales en update_module_progress_complete(). '
    'Creado: TASK-2026-02-02-IMPLEMENTAR-OPTIMIZACION-TRIGGERS';

-- =============================================================================
-- INDICE 5: Misiones activas por usuario y tipo de objetivo
-- =============================================================================
-- Acelera: SELECT FROM missions WHERE user_id = ? AND status IN (...) AND objectives @> ...
-- Usado por: update_mission_progress() (llamada desde process_xp_update)

CREATE INDEX IF NOT EXISTS idx_missions_user_active_type
ON gamification_system.missions(user_id, status)
WHERE status IN ('active', 'in_progress');

COMMENT ON INDEX gamification_system.idx_missions_user_active_type IS
    'Indice parcial para misiones activas por usuario. '
    'Acelera busqueda de misiones a actualizar en update_mission_progress(). '
    'Creado: TASK-2026-02-02-IMPLEMENTAR-OPTIMIZACION-TRIGGERS';

-- =============================================================================
-- VALIDACION
-- =============================================================================
-- Verificar que los indices fueron creados

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM pg_indexes
    WHERE indexname IN (
        'idx_exercises_module_active',
        'idx_submissions_user_exercise_status',
        'idx_attempts_user_correct',
        'idx_submissions_user_graded',
        'idx_missions_user_active_type'
    );

    IF v_count = 5 THEN
        RAISE NOTICE 'OK: 5 indices de optimizacion creados correctamente';
    ELSE
        RAISE WARNING 'WARN: Solo % de 5 indices fueron creados', v_count;
    END IF;
END $$;

-- =============================================================================
-- NOTAS DE MANTENIMIENTO
-- =============================================================================
--
-- REINDEXACION RECOMENDADA:
-- Ejecutar periodicamente (mensual) para mantener eficiencia:
--
-- REINDEX INDEX CONCURRENTLY educational_content.idx_exercises_module_active;
-- REINDEX INDEX CONCURRENTLY progress_tracking.idx_submissions_user_exercise_status;
-- REINDEX INDEX CONCURRENTLY progress_tracking.idx_attempts_user_correct;
-- REINDEX INDEX CONCURRENTLY progress_tracking.idx_submissions_user_graded;
-- REINDEX INDEX CONCURRENTLY gamification_system.idx_missions_user_active_type;
--
-- MONITOREO:
-- SELECT indexrelname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE indexrelname LIKE 'idx_%';
--
-- ROLLBACK:
-- DROP INDEX IF EXISTS educational_content.idx_exercises_module_active;
-- DROP INDEX IF EXISTS progress_tracking.idx_submissions_user_exercise_status;
-- DROP INDEX IF EXISTS progress_tracking.idx_attempts_user_correct;
-- DROP INDEX IF EXISTS progress_tracking.idx_submissions_user_graded;
-- DROP INDEX IF EXISTS gamification_system.idx_missions_user_active_type;
--
-- =============================================================================
