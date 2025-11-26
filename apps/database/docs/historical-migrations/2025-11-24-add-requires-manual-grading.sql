-- =====================================================
-- Migration: Add requires_manual_grading column
-- Date: 2025-11-24
-- Purpose: Diferenciar ejercicios autocorregibles de revisión manual
-- Issue: Sistema de ejercicios - Arquitectura dual (attempts vs submissions)
-- =====================================================

BEGIN;

-- 1. Agregar columna
ALTER TABLE educational_content.exercises
ADD COLUMN IF NOT EXISTS requires_manual_grading BOOLEAN DEFAULT false;

-- 2. Agregar comentario
COMMENT ON COLUMN educational_content.exercises.requires_manual_grading IS
'TRUE: Requiere revisión del maestro (usar exercise_submissions).
FALSE: Autocorregible (usar exercise_attempts).
Determina el flujo de trabajo: práctica ilimitada vs evaluación formal única.';

-- 3. Clasificar ejercicios autocorregibles (Módulos 1, 2, 3)
-- Basado en tipos existentes en la base de datos actual
UPDATE educational_content.exercises
SET requires_manual_grading = false
WHERE exercise_type IN (
  -- Módulo 1: Comprensión Literal
  'crucigrama',
  'linea_tiempo',
  'sopa_letras',
  'completar_espacios',
  'verdadero_falso',

  -- Módulo 2: Comprensión Inferencial
  'detective_textual',
  'construccion_hipotesis',
  'prediccion_narrativa',
  'puzzle_contexto',
  'rueda_inferencias',

  -- Módulo 3: Lectura Crítica
  'analisis_fuentes',
  'debate_digital',
  'matriz_perspectivas',
  'podcast_argumentativo',
  'tribunal_opiniones'
);

-- 4. Nota: No hay ejercicios de revisión manual en la BD actualmente
-- Cuando se agreguen, actualizar con:
-- UPDATE educational_content.exercises
-- SET requires_manual_grading = true
-- WHERE exercise_type IN ('ensayo_argumentativo', 'resena_critica', etc.);

-- 5. Crear índice para mejorar performance de queries
CREATE INDEX IF NOT EXISTS idx_exercises_requires_manual_grading
ON educational_content.exercises(requires_manual_grading)
WHERE is_active = true;

-- 6. Validación: Mostrar distribución
DO $$
DECLARE
  v_autocorregibles INTEGER;
  v_manual INTEGER;
  v_total INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_autocorregibles
  FROM educational_content.exercises
  WHERE requires_manual_grading = false;

  SELECT COUNT(*) INTO v_manual
  FROM educational_content.exercises
  WHERE requires_manual_grading = true;

  v_total := v_autocorregibles + v_manual;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRACIÓN COMPLETADA';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Ejercicios autocorregibles: % (%.1f%%)', v_autocorregibles, (v_autocorregibles::float / v_total * 100);
  RAISE NOTICE 'Ejercicios revisión manual: % (%.1f%%)', v_manual, (v_manual::float / v_total * 100);
  RAISE NOTICE 'Total de ejercicios: %', v_total;
  RAISE NOTICE '========================================';
END $$;

COMMIT;

-- =====================================================
-- ROLLBACK (si es necesario)
-- =====================================================
-- BEGIN;
-- DROP INDEX IF EXISTS idx_exercises_requires_manual_grading;
-- ALTER TABLE educational_content.exercises DROP COLUMN IF EXISTS requires_manual_grading;
-- COMMIT;
