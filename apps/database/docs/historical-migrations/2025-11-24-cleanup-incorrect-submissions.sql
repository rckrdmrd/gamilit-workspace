-- =====================================================
-- Migration: Cleanup Incorrect Submissions
-- Date: 2025-11-24
-- Purpose: Eliminar ejercicios autocorregibles de exercise_submissions
-- Issue: Arquitectura dual - Datos legacy antes del fix
-- =====================================================

BEGIN;

-- 1. Verificar registros incorrectos ANTES de la limpieza
DO $$
DECLARE
  v_incorrectos INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_incorrectos
  FROM progress_tracking.exercise_submissions es
  JOIN educational_content.exercises e ON e.id = es.exercise_id
  WHERE e.requires_manual_grading = false;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'LIMPIEZA DE DATOS LEGACY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Registros incorrectos encontrados: %', v_incorrectos;
  RAISE NOTICE '';
END $$;

-- 2. Mostrar los registros que se van a eliminar (para auditoría)
SELECT
  es.id,
  e.title as ejercicio,
  e.exercise_type as tipo,
  es.user_id,
  es.status,
  es.submitted_at
FROM progress_tracking.exercise_submissions es
JOIN educational_content.exercises e ON e.id = es.exercise_id
WHERE e.requires_manual_grading = false
ORDER BY es.submitted_at DESC;

-- 3. ELIMINAR registros incorrectos
-- Nota: Estos ejercicios autocorregibles NO deberían estar en exercise_submissions
-- El sistema correcto es: autocorregibles → exercise_attempts
DELETE FROM progress_tracking.exercise_submissions es
USING educational_content.exercises e
WHERE es.exercise_id = e.id
  AND e.requires_manual_grading = false;

-- 4. Verificar después de la limpieza
DO $$
DECLARE
  v_restantes INTEGER;
  v_total_submissions INTEGER;
  v_total_attempts INTEGER;
BEGIN
  -- Contar registros restantes incorrectos (debe ser 0)
  SELECT COUNT(*) INTO v_restantes
  FROM progress_tracking.exercise_submissions es
  JOIN educational_content.exercises e ON e.id = es.exercise_id
  WHERE e.requires_manual_grading = false;

  -- Contar totales
  SELECT COUNT(*) INTO v_total_submissions
  FROM progress_tracking.exercise_submissions;

  SELECT COUNT(*) INTO v_total_attempts
  FROM progress_tracking.exercise_attempts;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'LIMPIEZA COMPLETADA';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Registros incorrectos restantes: % (debe ser 0)', v_restantes;
  RAISE NOTICE 'Total exercise_submissions: %', v_total_submissions;
  RAISE NOTICE 'Total exercise_attempts: %', v_total_attempts;
  RAISE NOTICE '========================================';

  IF v_restantes > 0 THEN
    RAISE EXCEPTION 'ERROR: Aún hay % registros incorrectos', v_restantes;
  END IF;
END $$;

COMMIT;

-- =====================================================
-- ROLLBACK (si es necesario)
-- =====================================================
-- No hay rollback para esta migración ya que elimina datos legacy incorrectos.
-- Si necesitas recuperar los datos, usa un backup de la base de datos.
