-- =====================================================
-- Función: generate_student_alerts
-- Descripción: Genera alertas automáticas basadas en métricas de estudiantes
-- Schema: progress_tracking
-- Autor: Database-Agent (GAP-ALERTS-001)
-- Fecha: 2025-11-24
-- =====================================================
--
-- PROPÓSITO:
-- Esta función analiza el progreso y actividad de los estudiantes para
-- generar alertas automáticas de intervención cuando se detectan patrones
-- de riesgo como inactividad, bajo rendimiento o fallos repetidos.
--
-- TIPOS DE ALERTAS GENERADAS:
-- 1. no_activity: Estudiante sin actividad reciente (7+ días)
-- 2. low_score: Bajo rendimiento académico (score < 60%)
-- 3. repeated_failures: Intentos repetidos fallidos (>5 attempts en mismo ejercicio)
-- 4. declining_trend: Tendencia decreciente (score promedio baja >20% semana a semana)
-- 5. excessive_time: Tiempo excesivo en ejercicios (>2x del promedio general)
-- 6. low_engagement: Bajo engagement (<3 ejercicios o <30 min por semana)
--
-- USO:
-- Debe ejecutarse diariamente vía CRON job o scheduler:
-- SELECT progress_tracking.generate_student_alerts();
--
-- NOTA: La función previene duplicación de alertas verificando que no existan
-- alertas activas del mismo tipo para el mismo estudiante/classroom en un
-- período reciente (varía según tipo de alerta).
--

CREATE OR REPLACE FUNCTION progress_tracking.generate_student_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_alerts_count INTEGER := 0;
  v_no_activity_count INTEGER := 0;
  v_low_score_count INTEGER := 0;
  v_repeated_failures_count INTEGER := 0;
BEGIN
  -- ============================================================================
  -- 1. DETECTAR ESTUDIANTES SIN ACTIVIDAD (7+ días)
  -- ============================================================================
  -- Genera alertas para estudiantes que no han tenido actividad reciente
  -- La severidad aumenta según los días de inactividad:
  -- - 7-9 días: medium
  -- - 10-13 días: high
  -- - 14+ días: critical

  INSERT INTO progress_tracking.student_intervention_alerts
    (student_id, classroom_id, alert_type, severity, title, description, metrics, tenant_id)
  SELECT DISTINCT
    p.user_id,
    mp.classroom_id,
    'no_activity'::TEXT,
    CASE
      WHEN EXTRACT(DAY FROM gamilit.now_mexico() - mp.last_accessed_at) >= 14 THEN 'critical'::TEXT
      WHEN EXTRACT(DAY FROM gamilit.now_mexico() - mp.last_accessed_at) >= 10 THEN 'high'::TEXT
      ELSE 'medium'::TEXT
    END,
    'Estudiante sin actividad reciente',
    format('El estudiante no ha tenido actividad en %s días',
      EXTRACT(DAY FROM gamilit.now_mexico() - mp.last_accessed_at)::INTEGER),
    jsonb_build_object(
      'days_inactive', EXTRACT(DAY FROM gamilit.now_mexico() - mp.last_accessed_at)::INTEGER,
      'last_activity', mp.last_accessed_at
    ),
    p.tenant_id
  FROM progress_tracking.module_progress mp
  JOIN auth_management.profiles p ON mp.user_id = p.id
  WHERE mp.last_accessed_at < gamilit.now_mexico() - INTERVAL '7 days'
    AND mp.status != 'completed'::progress_tracking.progress_status
    AND mp.classroom_id IS NOT NULL
    -- Prevenir alertas duplicadas (no generar si ya existe alerta activa reciente)
    AND NOT EXISTS (
      SELECT 1 FROM progress_tracking.student_intervention_alerts sia
      WHERE sia.student_id = mp.user_id
        AND sia.classroom_id = mp.classroom_id
        AND sia.alert_type = 'no_activity'
        AND sia.status = 'active'
        AND sia.generated_at > gamilit.now_mexico() - INTERVAL '5 days'
    );

  GET DIAGNOSTICS v_no_activity_count = ROW_COUNT;

  -- ============================================================================
  -- 2. DETECTAR BAJO RENDIMIENTO (score < 60%)
  -- ============================================================================
  -- Genera alertas para estudiantes con promedio de calificación bajo
  -- La severidad varía según el nivel de bajo rendimiento:
  -- - 50-59%: medium
  -- - 40-49%: high
  -- - <40%: critical
  -- Requiere mínimo 3 ejercicios intentados para evitar falsos positivos

  INSERT INTO progress_tracking.student_intervention_alerts
    (student_id, classroom_id, alert_type, severity, title, description, metrics, tenant_id)
  SELECT
    p.user_id,
    mp.classroom_id,
    'low_score'::TEXT,
    CASE
      WHEN mp.average_score < 40 THEN 'critical'::TEXT
      WHEN mp.average_score < 50 THEN 'high'::TEXT
      WHEN mp.average_score < 60 THEN 'medium'::TEXT
      ELSE 'low'::TEXT
    END,
    'Bajo rendimiento académico',
    format('Promedio de calificación: %.1f%% (Umbral recomendado: 60%%)', mp.average_score),
    jsonb_build_object(
      'score', mp.average_score,
      'threshold', 60,
      'exercises_attempted', mp.total_exercises
    ),
    p.tenant_id
  FROM progress_tracking.module_progress mp
  JOIN auth_management.profiles p ON mp.user_id = p.id
  WHERE mp.average_score < 60
    AND mp.total_exercises >= 3
    AND mp.classroom_id IS NOT NULL
    -- Prevenir alertas duplicadas (no generar si ya existe alerta activa reciente)
    AND NOT EXISTS (
      SELECT 1 FROM progress_tracking.student_intervention_alerts sia
      WHERE sia.student_id = mp.user_id
        AND sia.classroom_id = mp.classroom_id
        AND sia.alert_type = 'low_score'
        AND sia.status = 'active'
        AND sia.generated_at > gamilit.now_mexico() - INTERVAL '3 days'
    );

  GET DIAGNOSTICS v_low_score_count = ROW_COUNT;

  -- ============================================================================
  -- 3. DETECTAR INTENTOS REPETIDOS FALLIDOS (>5 attempts en mismo ejercicio)
  -- ============================================================================
  -- Genera alertas cuando un estudiante tiene dificultad persistente con un ejercicio
  -- La severidad aumenta con el número de intentos:
  -- - 6-7 intentos: low
  -- - 8-10 intentos: medium
  -- - 11+ intentos: high

  INSERT INTO progress_tracking.student_intervention_alerts
    (student_id, classroom_id, alert_type, severity, title, description, metrics, tenant_id)
  SELECT
    p.user_id,
    mp.classroom_id,
    'repeated_failures'::TEXT,
    CASE
      WHEN es.attempts > 10 THEN 'high'::TEXT
      WHEN es.attempts > 7 THEN 'medium'::TEXT
      ELSE 'low'::TEXT
    END,
    'Dificultad persistente en ejercicio',
    format('El estudiante ha intentado %s veces el mismo ejercicio sin éxito', es.attempts),
    jsonb_build_object(
      'exercise_id', es.exercise_id,
      'attempts', es.attempts,
      'module_id', es.module_id
    ),
    p.tenant_id
  FROM progress_tracking.exercise_submissions es
  JOIN progress_tracking.module_progress mp ON es.user_id = mp.user_id
    AND es.module_id = mp.module_id
  JOIN auth_management.profiles p ON es.user_id = p.id
  WHERE es.attempts > 5
    AND es.status != 'correct'
    AND mp.classroom_id IS NOT NULL
    -- Prevenir alertas duplicadas (no generar si ya existe alerta activa reciente para mismo ejercicio)
    AND NOT EXISTS (
      SELECT 1 FROM progress_tracking.student_intervention_alerts sia
      WHERE sia.student_id = es.user_id
        AND sia.alert_type = 'repeated_failures'
        AND sia.metrics->>'exercise_id' = es.exercise_id::TEXT
        AND sia.status = 'active'
        AND sia.generated_at > gamilit.now_mexico() - INTERVAL '2 days'
    );

  GET DIAGNOSTICS v_repeated_failures_count = ROW_COUNT;

  -- ============================================================================
  -- 4. DETECTAR TENDENCIA DECRECIENTE (declining_trend)
  -- ============================================================================
  -- Genera alertas cuando el promedio de la última semana es significativamente
  -- menor que el de la semana anterior (>20% de caída)
  --
  -- TODO: Implementación completa requiere datos históricos de scores semanales.
  -- Esta versión básica compara submissions recientes vs anteriores.

  INSERT INTO progress_tracking.student_intervention_alerts
    (student_id, classroom_id, alert_type, severity, title, description, metrics, tenant_id)
  SELECT
    recent.user_id,
    mp.classroom_id,
    'declining_trend'::TEXT,
    CASE
      WHEN recent.avg_score < prev.avg_score * 0.6 THEN 'critical'::TEXT
      WHEN recent.avg_score < prev.avg_score * 0.7 THEN 'high'::TEXT
      ELSE 'medium'::TEXT
    END,
    'Tendencia decreciente en rendimiento',
    format('El rendimiento ha bajado de %.1f%% a %.1f%% en las últimas 2 semanas',
      prev.avg_score, recent.avg_score),
    jsonb_build_object(
      'previous_week_avg', prev.avg_score,
      'recent_week_avg', recent.avg_score,
      'decline_percentage', ROUND(((prev.avg_score - recent.avg_score) / NULLIF(prev.avg_score, 0)) * 100, 1)
    ),
    p.tenant_id
  FROM (
    -- Promedio última semana
    SELECT user_id, AVG(final_score) as avg_score, COUNT(*) as count
    FROM progress_tracking.exercise_submissions
    WHERE submitted_at > gamilit.now_mexico() - INTERVAL '7 days'
      AND final_score IS NOT NULL
    GROUP BY user_id
    HAVING COUNT(*) >= 2
  ) recent
  JOIN (
    -- Promedio semana anterior
    SELECT user_id, AVG(final_score) as avg_score
    FROM progress_tracking.exercise_submissions
    WHERE submitted_at BETWEEN gamilit.now_mexico() - INTERVAL '14 days'
                           AND gamilit.now_mexico() - INTERVAL '7 days'
      AND final_score IS NOT NULL
    GROUP BY user_id
    HAVING COUNT(*) >= 2
  ) prev ON recent.user_id = prev.user_id
  JOIN progress_tracking.module_progress mp ON recent.user_id = mp.user_id
  JOIN auth_management.profiles p ON recent.user_id = p.id
  WHERE recent.avg_score < prev.avg_score * 0.8  -- 20% decline threshold
    AND mp.classroom_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM progress_tracking.student_intervention_alerts sia
      WHERE sia.student_id = recent.user_id
        AND sia.alert_type = 'declining_trend'
        AND sia.status = 'active'
        AND sia.generated_at > gamilit.now_mexico() - INTERVAL '7 days'
    );

  -- ============================================================================
  -- 5. DETECTAR TIEMPO EXCESIVO (excessive_time)
  -- ============================================================================
  -- Genera alertas cuando un estudiante gasta significativamente más tiempo
  -- del esperado en ejercicios (>2x del promedio general)

  INSERT INTO progress_tracking.student_intervention_alerts
    (student_id, classroom_id, alert_type, severity, title, description, metrics, tenant_id)
  SELECT
    es.user_id,
    mp.classroom_id,
    'excessive_time'::TEXT,
    CASE
      WHEN es.avg_time > avg_all.overall_avg * 3 THEN 'high'::TEXT
      WHEN es.avg_time > avg_all.overall_avg * 2 THEN 'medium'::TEXT
      ELSE 'low'::TEXT
    END,
    'Tiempo excesivo en ejercicios',
    format('Tiempo promedio: %s min (General: %s min)',
      ROUND(es.avg_time / 60, 1), ROUND(avg_all.overall_avg / 60, 1)),
    jsonb_build_object(
      'student_avg_seconds', es.avg_time,
      'overall_avg_seconds', avg_all.overall_avg,
      'ratio', ROUND(es.avg_time / NULLIF(avg_all.overall_avg, 1), 2)
    ),
    p.tenant_id
  FROM (
    -- Promedio de tiempo por estudiante (últimos 7 días)
    SELECT user_id, AVG(time_spent_seconds) as avg_time
    FROM progress_tracking.exercise_submissions
    WHERE submitted_at > gamilit.now_mexico() - INTERVAL '7 days'
      AND time_spent_seconds IS NOT NULL
      AND time_spent_seconds > 0
    GROUP BY user_id
    HAVING COUNT(*) >= 3
  ) es
  CROSS JOIN (
    -- Promedio general de todos los estudiantes
    SELECT AVG(time_spent_seconds) as overall_avg
    FROM progress_tracking.exercise_submissions
    WHERE submitted_at > gamilit.now_mexico() - INTERVAL '30 days'
      AND time_spent_seconds IS NOT NULL
      AND time_spent_seconds > 0
  ) avg_all
  JOIN progress_tracking.module_progress mp ON es.user_id = mp.user_id
  JOIN auth_management.profiles p ON es.user_id = p.id
  WHERE es.avg_time > avg_all.overall_avg * 2  -- 2x threshold
    AND mp.classroom_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM progress_tracking.student_intervention_alerts sia
      WHERE sia.student_id = es.user_id
        AND sia.alert_type = 'excessive_time'
        AND sia.status = 'active'
        AND sia.generated_at > gamilit.now_mexico() - INTERVAL '5 days'
    );

  -- ============================================================================
  -- 6. DETECTAR BAJO ENGAGEMENT (low_engagement)
  -- ============================================================================
  -- Genera alertas cuando un estudiante tiene muy poca actividad semanal
  -- (menos de 2 ejercicios por semana o menos de 30 minutos totales)

  INSERT INTO progress_tracking.student_intervention_alerts
    (student_id, classroom_id, alert_type, severity, title, description, metrics, tenant_id)
  SELECT
    activity.user_id,
    mp.classroom_id,
    'low_engagement'::TEXT,
    CASE
      WHEN activity.exercise_count = 0 THEN 'high'::TEXT
      WHEN activity.exercise_count = 1 THEN 'medium'::TEXT
      ELSE 'low'::TEXT
    END,
    'Bajo nivel de engagement',
    format('Solo %s ejercicios completados esta semana (mínimo recomendado: 3)',
      activity.exercise_count),
    jsonb_build_object(
      'weekly_exercises', activity.exercise_count,
      'weekly_time_minutes', ROUND(activity.total_time / 60, 1),
      'minimum_recommended', 3
    ),
    p.tenant_id
  FROM (
    -- Actividad de la última semana por estudiante
    SELECT
      user_id,
      COUNT(*) as exercise_count,
      COALESCE(SUM(time_spent_seconds), 0) as total_time
    FROM progress_tracking.exercise_submissions
    WHERE submitted_at > gamilit.now_mexico() - INTERVAL '7 days'
    GROUP BY user_id
    HAVING COUNT(*) < 3 OR COALESCE(SUM(time_spent_seconds), 0) < 1800  -- menos de 3 ejercicios o 30 min
  ) activity
  JOIN progress_tracking.module_progress mp ON activity.user_id = mp.user_id
  JOIN auth_management.profiles p ON activity.user_id = p.id
  WHERE mp.classroom_id IS NOT NULL
    AND mp.status NOT IN ('completed'::progress_tracking.progress_status, 'not_started'::progress_tracking.progress_status)
    AND NOT EXISTS (
      SELECT 1 FROM progress_tracking.student_intervention_alerts sia
      WHERE sia.student_id = activity.user_id
        AND sia.alert_type = 'low_engagement'
        AND sia.status = 'active'
        AND sia.generated_at > gamilit.now_mexico() - INTERVAL '5 days'
    );

  -- ============================================================================
  -- LOGGING Y RESUMEN
  -- ============================================================================

  v_alerts_count := v_no_activity_count + v_low_score_count + v_repeated_failures_count;

  RAISE NOTICE 'Alertas generadas exitosamente en %', gamilit.now_mexico();
  RAISE NOTICE '  - Sin actividad: %', v_no_activity_count;
  RAISE NOTICE '  - Bajo rendimiento: %', v_low_score_count;
  RAISE NOTICE '  - Fallos repetidos: %', v_repeated_failures_count;
  RAISE NOTICE '  - Total: %', v_alerts_count;

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error al generar alertas: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    -- No re-lanzar el error para permitir que el job continue
END;
$$;

COMMENT ON FUNCTION progress_tracking.generate_student_alerts() IS
  'Genera alertas automáticas de intervención basadas en métricas de estudiantes. Debe ejecutarse diariamente vía CRON o scheduler. Detecta: inactividad (7+ días), bajo rendimiento (<60%), fallos repetidos (>5 intentos), tendencia decreciente (>20% baja), tiempo excesivo (>2x promedio), bajo engagement (<3 ejercicios/semana).';
