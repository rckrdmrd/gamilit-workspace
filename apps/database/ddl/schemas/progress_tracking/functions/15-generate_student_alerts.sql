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
  'Genera alertas automáticas de intervención basadas en métricas de estudiantes. Debe ejecutarse diariamente vía CRON o scheduler. Detecta: inactividad (7+ días), bajo rendimiento (<60%), fallos repetidos (>5 intentos).';
