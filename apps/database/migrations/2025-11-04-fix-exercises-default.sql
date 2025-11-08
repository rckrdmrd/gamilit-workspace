-- ============================================================================
-- MIGRACIÓN: Corregir default de exercises.difficulty_level
-- ============================================================================
-- Fecha: 2025-11-04
-- Propósito: Cambiar default de 'beginner' a 'very_easy' ahora que el valor existe
-- Dependencias: 2025-11-04-sync-enums-p0.sql
-- ============================================================================

\echo '========================================='
\echo 'Corrigiendo default de exercises.difficulty_level'
\echo 'Cambio: beginner → very_easy'
\echo '========================================='
\echo ''

-- Cambiar default a 'very_easy' (valor intencional del diseño)
ALTER TABLE educational_content.exercises
  ALTER COLUMN difficulty_level SET DEFAULT 'very_easy'::public.difficulty_level;

\echo '✅ Default actualizado a "very_easy"'
\echo ''

-- Verificar
\echo 'Verificando default actual:'
SELECT
    column_name,
    column_default
FROM information_schema.columns
WHERE table_schema = 'educational_content'
  AND table_name = 'exercises'
  AND column_name = 'difficulty_level';

\echo ''
\echo '✅ MIGRACIÓN COMPLETADA'
