-- =============================================================================
-- Indices de Optimizacion para Foreign Keys
-- Descripcion: Indices adicionales para acelerar JOINs en FKs frecuentes
-- Creado: 2026-02-03
-- Ticket: TASK-RLS-FK-OPTIMIZATION
-- =============================================================================
--
-- PROPOSITO:
-- Estos indices optimizan las queries mas comunes que involucran FKs:
-- - Lookups por usuario + ejercicio
-- - Configuraciones de alertas por teacher
-- - Membresías de gremios
-- - Misiones de aula activas
-- - Colas de grading
--
-- IMPACTO ESTIMADO:
-- - Reduccion de ~20-50ms en queries de lookup con JOINs
-- - Mejora notable en consultas del Teacher Portal y Gamification
--
-- =============================================================================

-- =============================================================================
-- INDICE 1: Comodin tracking por usuario + ejercicio
-- =============================================================================
-- Acelera: Verificacion de comodines usados por usuario en ejercicio especifico
-- Usado por: ComodinService.checkAvailability(), ExerciseAttempt validation

CREATE INDEX IF NOT EXISTS idx_comodin_tracking_user_exercise
    ON gamification_system.comodin_usage_tracking(user_id, exercise_id);

COMMENT ON INDEX gamification_system.idx_comodin_tracking_user_exercise IS
    'Indice compuesto para lookup de comodines por usuario+ejercicio. '
    'Optimiza validacion de limites de comodines en ejercicios. '
    'Creado: TASK-RLS-FK-OPTIMIZATION 2026-02-03';

-- =============================================================================
-- INDICE 2: Configuraciones de alertas por teacher + classroom + tipo
-- =============================================================================
-- Acelera: Busqueda de configuracion especifica de alerta
-- Usado por: AlertConfigService.getTeacherConfig(), Generate alerts cron

CREATE INDEX IF NOT EXISTS idx_teacher_alerts_teacher_classroom_type
    ON progress_tracking.teacher_alert_configurations(teacher_id, classroom_id, alert_type);

COMMENT ON INDEX progress_tracking.idx_teacher_alerts_teacher_classroom_type IS
    'Indice compuesto para lookup de configuraciones de alertas por teacher+classroom+type. '
    'Optimiza generacion de alertas personalizadas en Teacher Portal. '
    'Creado: TASK-RLS-FK-OPTIMIZATION 2026-02-03';

-- =============================================================================
-- INDICE 3: Miembros de gremio por guild + user
-- =============================================================================
-- Acelera: Verificacion de membresia en gremio
-- Usado por: GuildService.isMember(), RLS policies para guild_missions

CREATE INDEX IF NOT EXISTS idx_guild_members_guild_user
    ON social_features.guild_members(guild_id, user_id);

COMMENT ON INDEX social_features.idx_guild_members_guild_user IS
    'Indice compuesto para lookup de membresia guild+user. '
    'Optimiza verificaciones de pertenencia a gremios (RLS, services). '
    'Creado: TASK-RLS-FK-OPTIMIZATION 2026-02-03';

-- =============================================================================
-- INDICE 4: Misiones de aula activas
-- =============================================================================
-- Acelera: Listado de misiones activas por classroom
-- Usado por: ClassroomMissionService.getActiveMissions()

CREATE INDEX IF NOT EXISTS idx_classroom_missions_classroom_active
    ON gamification_system.classroom_missions(classroom_id, is_active)
    WHERE is_active = true;

COMMENT ON INDEX gamification_system.idx_classroom_missions_classroom_active IS
    'Indice parcial para misiones activas por classroom. '
    'Optimiza listado de misiones disponibles en vista de estudiante. '
    'Creado: TASK-RLS-FK-OPTIMIZATION 2026-02-03';

-- =============================================================================
-- INDICE 5: Submissions por usuario, ejercicio y fecha
-- =============================================================================
-- Acelera: Historial de submissions por usuario ordenado por fecha
-- Usado por: ProgressService.getRecentSubmissions(), Module progress calculation
-- Nota: ejercicio_id implica module_id a traves de JOIN con exercises

CREATE INDEX IF NOT EXISTS idx_submissions_user_exercise_date
    ON progress_tracking.exercise_submissions(user_id, exercise_id, created_at DESC);

COMMENT ON INDEX progress_tracking.idx_submissions_user_exercise_date IS
    'Indice compuesto para historial de submissions por usuario+ejercicio+fecha. '
    'Optimiza calculo de progreso y consultas de historial. '
    'Creado: TASK-RLS-FK-OPTIMIZATION 2026-02-03';

-- =============================================================================
-- INDICE 6: Cola de grading (submissions pendientes de revision)
-- =============================================================================
-- Acelera: Obtener submissions pendientes de calificacion
-- Usado por: GradingQueueService.getPendingSubmissions(), Teacher review dashboard

CREATE INDEX IF NOT EXISTS idx_submissions_grading_queue
    ON progress_tracking.exercise_submissions(status, created_at)
    WHERE status IN ('submitted', 'pending_review');

COMMENT ON INDEX progress_tracking.idx_submissions_grading_queue IS
    'Indice parcial para cola de grading (submissions pendientes). '
    'Optimiza dashboard de revision del teacher y procesos batch de grading. '
    'Creado: TASK-RLS-FK-OPTIMIZATION 2026-02-03';

-- =============================================================================
-- INDICE 7: Misiones de gremio activas por guild
-- =============================================================================
-- Acelera: Listado de misiones activas del gremio
-- Usado por: GuildMissionService.getActiveMissions()

CREATE INDEX IF NOT EXISTS idx_guild_missions_guild_active
    ON social_features.guild_missions(guild_id, status)
    WHERE status = 'active';

COMMENT ON INDEX social_features.idx_guild_missions_guild_active IS
    'Indice parcial para misiones activas de gremio. '
    'Optimiza listado de misiones disponibles en vista de gremio. '
    'Creado: TASK-RLS-FK-OPTIMIZATION 2026-02-03';

-- =============================================================================
-- INDICE 8: Contribuciones a misiones por mision
-- =============================================================================
-- Acelera: Obtener contribuciones a una mision especifica
-- Usado por: GuildMissionService.getContributions()

CREATE INDEX IF NOT EXISTS idx_guild_mission_contributions_mission
    ON social_features.guild_mission_contributions(mission_id, user_id);

COMMENT ON INDEX social_features.idx_guild_mission_contributions_mission IS
    'Indice compuesto para contribuciones por mision+usuario. '
    'Optimiza calculo de leaderboards y progreso de misiones. '
    'Creado: TASK-RLS-FK-OPTIMIZATION 2026-02-03';

-- =============================================================================
-- INDICE 9: Alertas de intervencion activas por classroom
-- =============================================================================
-- Acelera: Obtener alertas activas de un aula
-- Usado por: AlertService.getActiveAlerts(), Teacher dashboard

CREATE INDEX IF NOT EXISTS idx_intervention_alerts_classroom_active
    ON progress_tracking.student_intervention_alerts(classroom_id, status, severity)
    WHERE status IN ('active', 'acknowledged');

COMMENT ON INDEX progress_tracking.idx_intervention_alerts_classroom_active IS
    'Indice parcial para alertas activas por classroom+severity. '
    'Optimiza dashboard de alertas del teacher portal. '
    'Creado: TASK-RLS-FK-OPTIMIZATION 2026-02-03';

-- =============================================================================
-- INDICE 10: Intervenciones por teacher con follow-up pendiente
-- =============================================================================
-- Acelera: Obtener intervenciones con follow-up pendiente
-- Usado por: InterventionService.getPendingFollowUps()

CREATE INDEX IF NOT EXISTS idx_teacher_interventions_follow_up_pending
    ON progress_tracking.teacher_interventions(teacher_id, follow_up_date)
    WHERE follow_up_required = true AND status NOT IN ('completed', 'cancelled');

COMMENT ON INDEX progress_tracking.idx_teacher_interventions_follow_up_pending IS
    'Indice parcial para intervenciones con follow-up pendiente por teacher. '
    'Optimiza recordatorios y dashboard de seguimiento. '
    'Creado: TASK-RLS-FK-OPTIMIZATION 2026-02-03';

-- =============================================================================
-- VALIDACION
-- =============================================================================
-- Verificar que los indices fueron creados

DO $$
DECLARE
    v_count INTEGER;
    v_expected INTEGER := 10;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM pg_indexes
    WHERE indexname IN (
        'idx_comodin_tracking_user_exercise',
        'idx_teacher_alerts_teacher_classroom_type',
        'idx_guild_members_guild_user',
        'idx_classroom_missions_classroom_active',
        'idx_submissions_user_exercise_date',
        'idx_submissions_grading_queue',
        'idx_guild_missions_guild_active',
        'idx_guild_mission_contributions_mission',
        'idx_intervention_alerts_classroom_active',
        'idx_teacher_interventions_follow_up_pending'
    );

    IF v_count = v_expected THEN
        RAISE NOTICE 'OK: % indices de optimizacion FK creados correctamente', v_expected;
    ELSE
        RAISE WARNING 'WARN: Solo % de % indices fueron creados', v_count, v_expected;
    END IF;
END $$;

-- =============================================================================
-- NOTAS DE MANTENIMIENTO
-- =============================================================================
--
-- REINDEXACION RECOMENDADA (mensual):
-- REINDEX INDEX CONCURRENTLY gamification_system.idx_comodin_tracking_user_exercise;
-- REINDEX INDEX CONCURRENTLY progress_tracking.idx_teacher_alerts_teacher_classroom_type;
-- REINDEX INDEX CONCURRENTLY social_features.idx_guild_members_guild_user;
-- REINDEX INDEX CONCURRENTLY gamification_system.idx_classroom_missions_classroom_active;
-- REINDEX INDEX CONCURRENTLY progress_tracking.idx_submissions_user_exercise_date;
-- REINDEX INDEX CONCURRENTLY progress_tracking.idx_submissions_grading_queue;
-- REINDEX INDEX CONCURRENTLY social_features.idx_guild_missions_guild_active;
-- REINDEX INDEX CONCURRENTLY social_features.idx_guild_mission_contributions_mission;
-- REINDEX INDEX CONCURRENTLY progress_tracking.idx_intervention_alerts_classroom_active;
-- REINDEX INDEX CONCURRENTLY progress_tracking.idx_teacher_interventions_follow_up_pending;
--
-- MONITOREO DE USO:
-- SELECT indexrelname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE indexrelname LIKE 'idx_%'
-- ORDER BY idx_scan DESC;
--
-- ROLLBACK (si es necesario):
-- DROP INDEX IF EXISTS gamification_system.idx_comodin_tracking_user_exercise;
-- DROP INDEX IF EXISTS progress_tracking.idx_teacher_alerts_teacher_classroom_type;
-- DROP INDEX IF EXISTS social_features.idx_guild_members_guild_user;
-- DROP INDEX IF EXISTS gamification_system.idx_classroom_missions_classroom_active;
-- DROP INDEX IF EXISTS progress_tracking.idx_submissions_user_exercise_date;
-- DROP INDEX IF EXISTS progress_tracking.idx_submissions_grading_queue;
-- DROP INDEX IF EXISTS social_features.idx_guild_missions_guild_active;
-- DROP INDEX IF EXISTS social_features.idx_guild_mission_contributions_mission;
-- DROP INDEX IF EXISTS progress_tracking.idx_intervention_alerts_classroom_active;
-- DROP INDEX IF EXISTS progress_tracking.idx_teacher_interventions_follow_up_pending;
--
-- =============================================================================
