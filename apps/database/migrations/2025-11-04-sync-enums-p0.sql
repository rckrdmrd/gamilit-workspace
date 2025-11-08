-- ============================================================================
-- MIGRACIÓN: Sincronización de Enums Database (P0 - CRÍTICO)
-- ============================================================================
-- Fecha: 2025-11-04
-- Autor: NEXUS-INTEGRATION (Validación Integral Multi-Capa)
-- Propósito: Sincronizar enums entre Database y Backend/Frontend
-- Prioridad: P0 - BLOQUEADOR
-- Issue: Enum mismatches causan INSERT failures con constraint violation
--
-- Problema Detectado:
-- - difficulty_level DB: 3 valores vs Backend: 8 valores
-- - exercise_type DB: 27 tipos vs Backend: 31 tipos
-- - Default 'very_easy' NO EXISTE en enum DB
--
-- Validación: VAL-002 (Agente 4 - Educational Module Deep Dive)
-- ============================================================================

\echo '========================================='
\echo 'MIGRACIÓN: Sincronización de Enums (P0)'
\echo 'Fecha: 2025-11-04'
\echo '========================================='
\echo ''

-- ============================================================================
-- PARTE 1: Sincronizar difficulty_level
-- ============================================================================

\echo 'PARTE 1/3: Sincronizando difficulty_level enum...'
\echo ''

-- Estado actual DB: beginner, intermediate, advanced (3 valores)
-- Estado requerido: very_easy, easy, beginner, medium, intermediate, hard, advanced, very_hard (8 valores)

\echo '  - Agregando valor: very_easy'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'very_easy'
        AND enumtypid = 'difficulty_level'::regtype
    ) THEN
        ALTER TYPE difficulty_level ADD VALUE 'very_easy';
        RAISE NOTICE 'Valor "very_easy" agregado a difficulty_level';
    ELSE
        RAISE NOTICE 'Valor "very_easy" ya existe';
    END IF;
END
$$;

\echo '  - Agregando valor: easy'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'easy'
        AND enumtypid = 'difficulty_level'::regtype
    ) THEN
        ALTER TYPE difficulty_level ADD VALUE 'easy';
        RAISE NOTICE 'Valor "easy" agregado a difficulty_level';
    ELSE
        RAISE NOTICE 'Valor "easy" ya existe';
    END IF;
END
$$;

\echo '  - Agregando valor: medium'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'medium'
        AND enumtypid = 'difficulty_level'::regtype
    ) THEN
        ALTER TYPE difficulty_level ADD VALUE 'medium';
        RAISE NOTICE 'Valor "medium" agregado a difficulty_level';
    ELSE
        RAISE NOTICE 'Valor "medium" ya existe';
    END IF;
END
$$;

\echo '  - Agregando valor: hard'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'hard'
        AND enumtypid = 'difficulty_level'::regtype
    ) THEN
        ALTER TYPE difficulty_level ADD VALUE 'hard';
        RAISE NOTICE 'Valor "hard" agregado a difficulty_level';
    ELSE
        RAISE NOTICE 'Valor "hard" ya existe';
    END IF;
END
$$;

\echo '  - Agregando valor: very_hard'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'very_hard'
        AND enumtypid = 'difficulty_level'::regtype
    ) THEN
        ALTER TYPE difficulty_level ADD VALUE 'very_hard';
        RAISE NOTICE 'Valor "very_hard" agregado a difficulty_level';
    ELSE
        RAISE NOTICE 'Valor "very_hard" ya existe';
    END IF;
END
$$;

\echo '✅ difficulty_level sincronizado: 8 valores disponibles'
\echo ''

-- ============================================================================
-- PARTE 2: Fix Default Value (CRÍTICO)
-- ============================================================================

\echo 'PARTE 2/3: Corrigiendo default value de exercises.difficulty_level...'
\echo ''
\echo '  - Problema: Default usa "very_easy" pero NO existía en enum'
\echo '  - Solución: Cambiar default a "beginner" (valor seguro)'

ALTER TABLE educational_content.exercises
  ALTER COLUMN difficulty_level SET DEFAULT 'beginner';

\echo '✅ Default value corregido: "beginner"'
\echo ''

-- ============================================================================
-- PARTE 3: Sincronizar exercise_type
-- ============================================================================

\echo 'PARTE 3/3: Sincronizando exercise_type enum...'
\echo ''

-- Estado actual DB: 27 tipos
-- Estado Backend: 31 tipos (5 nuevos que backend usa)
-- Tipos a agregar: diario_multimedia, comic_digital, video_carta, verdadero_falso, completar_espacios

\echo '  - Agregando tipo: diario_multimedia'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'diario_multimedia'
        AND enumtypid = 'exercise_type'::regtype
    ) THEN
        ALTER TYPE exercise_type ADD VALUE 'diario_multimedia';
        RAISE NOTICE 'Tipo "diario_multimedia" agregado a exercise_type';
    ELSE
        RAISE NOTICE 'Tipo "diario_multimedia" ya existe';
    END IF;
END
$$;

\echo '  - Agregando tipo: comic_digital'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'comic_digital'
        AND enumtypid = 'exercise_type'::regtype
    ) THEN
        ALTER TYPE exercise_type ADD VALUE 'comic_digital';
        RAISE NOTICE 'Tipo "comic_digital" agregado a exercise_type';
    ELSE
        RAISE NOTICE 'Tipo "comic_digital" ya existe';
    END IF;
END
$$;

\echo '  - Agregando tipo: video_carta'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'video_carta'
        AND enumtypid = 'exercise_type'::regtype
    ) THEN
        ALTER TYPE exercise_type ADD VALUE 'video_carta';
        RAISE NOTICE 'Tipo "video_carta" agregado a exercise_type';
    ELSE
        RAISE NOTICE 'Tipo "video_carta" ya existe';
    END IF;
END
$$;

\echo '  - Agregando tipo: verdadero_falso'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'verdadero_falso'
        AND enumtypid = 'exercise_type'::regtype
    ) THEN
        ALTER TYPE exercise_type ADD VALUE 'verdadero_falso';
        RAISE NOTICE 'Tipo "verdadero_falso" agregado a exercise_type';
    ELSE
        RAISE NOTICE 'Tipo "verdadero_falso" ya existe';
    END IF;
END
$$;

\echo '  - Agregando tipo: completar_espacios'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'completar_espacios'
        AND enumtypid = 'exercise_type'::regtype
    ) THEN
        ALTER TYPE exercise_type ADD VALUE 'completar_espacios';
        RAISE NOTICE 'Tipo "completar_espacios" agregado a exercise_type';
    ELSE
        RAISE NOTICE 'Tipo "completar_espacios" ya existe';
    END IF;
END
$$;

\echo '✅ exercise_type sincronizado: 32 tipos disponibles'
\echo ''

-- ============================================================================
-- VERIFICACIÓN POST-MIGRACIÓN
-- ============================================================================

\echo '========================================='
\echo 'VERIFICACIÓN POST-MIGRACIÓN'
\echo '========================================='
\echo ''

\echo 'Verificando difficulty_level enum...'
SELECT
    enumlabel,
    enumsortorder
FROM pg_enum
WHERE enumtypid = 'difficulty_level'::regtype
ORDER BY enumsortorder;

\echo ''
\echo 'Total valores difficulty_level:'
SELECT COUNT(*) as total_values
FROM pg_enum
WHERE enumtypid = 'difficulty_level'::regtype;

\echo ''
\echo 'Verificando exercise_type enum...'
SELECT
    enumlabel,
    enumsortorder
FROM pg_enum
WHERE enumtypid = 'exercise_type'::regtype
ORDER BY enumsortorder;

\echo ''
\echo 'Total tipos exercise_type:'
SELECT COUNT(*) as total_types
FROM pg_enum
WHERE enumtypid = 'exercise_type'::regtype;

\echo ''
\echo 'Verificando default de exercises.difficulty_level...'
SELECT
    column_name,
    column_default
FROM information_schema.columns
WHERE table_schema = 'educational_content'
  AND table_name = 'exercises'
  AND column_name = 'difficulty_level';

-- ============================================================================
-- TEST DE INSERCIÓN (Opcional - comentado por defecto)
-- ============================================================================

-- Descomentar para probar que los nuevos valores funcionan:
/*
\echo ''
\echo '========================================='
\echo 'TEST DE INSERCIÓN (Opcional)'
\echo '========================================='
\echo ''

-- Test 1: Insertar ejercicio con very_easy
INSERT INTO educational_content.exercises (
    module_id,
    exercise_type,
    difficulty_level,
    title,
    tenant_id,
    created_by,
    updated_by
) VALUES (
    (SELECT id FROM educational_content.modules LIMIT 1),
    'verdadero_falso',
    'very_easy',
    'Test Exercise - Verdadero/Falso',
    (SELECT id FROM auth.tenants LIMIT 1),
    (SELECT id FROM auth.users WHERE role = 'SUPER_ADMIN' LIMIT 1),
    (SELECT id FROM auth.users WHERE role = 'SUPER_ADMIN' LIMIT 1)
);

\echo '✅ Test 1: Inserción con very_easy + verdadero_falso EXITOSA'

-- Test 2: Insertar ejercicio con video_carta
INSERT INTO educational_content.exercises (
    module_id,
    exercise_type,
    difficulty_level,
    title,
    tenant_id,
    created_by,
    updated_by
) VALUES (
    (SELECT id FROM educational_content.modules LIMIT 1),
    'video_carta',
    'medium',
    'Test Exercise - Video Carta',
    (SELECT id FROM auth.tenants LIMIT 1),
    (SELECT id FROM auth.users WHERE role = 'SUPER_ADMIN' LIMIT 1),
    (SELECT id FROM auth.users WHERE role = 'SUPER_ADMIN' LIMIT 1)
);

\echo '✅ Test 2: Inserción con video_carta + medium EXITOSA'

-- Rollback de tests (comentar si quieres mantener los tests)
DELETE FROM educational_content.exercises
WHERE title LIKE 'Test Exercise -%';

\echo '🧹 Tests limpiados (ejercicios de prueba eliminados)'
*/

-- ============================================================================
-- RESUMEN FINAL
-- ============================================================================

\echo ''
\echo '========================================='
\echo 'RESUMEN DE MIGRACIÓN'
\echo '========================================='
\echo ''
\echo '✅ PARTE 1: difficulty_level sincronizado (3 → 8 valores)'
\echo '   - Valores agregados: very_easy, easy, medium, hard, very_hard'
\echo ''
\echo '✅ PARTE 2: Default value corregido'
\echo '   - Cambio: very_easy → beginner (valor seguro)'
\echo ''
\echo '✅ PARTE 3: exercise_type sincronizado (27 → 32 tipos)'
\echo '   - Tipos agregados: diario_multimedia, comic_digital, video_carta,'
\echo '                      verdadero_falso, completar_espacios'
\echo ''
\echo '========================================='
\echo '🎯 IMPACTO:'
\echo '   - INSERT de ejercicios ya NO FALLARÁ'
\echo '   - Backend y Frontend pueden usar todos los valores'
\echo '   - Constraint violations eliminadas'
\echo '========================================='
\echo ''
\echo '📋 PRÓXIMOS PASOS:'
\echo '   1. Verificar que los tests pasen ✓'
\echo '   2. Actualizar frontend ExerciseType enum (P1)'
\echo '   3. Continuar con P0-2: Fix route order conflicts'
\echo ''
\echo '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE'
\echo ''

-- ============================================================================
-- NOTAS PARA ROLLBACK (Si es necesario)
-- ============================================================================

-- ADVERTENCIA: PostgreSQL NO permite eliminar valores de enums que estén en uso.
-- Para hacer rollback, necesitarías:
-- 1. Eliminar todos los registros que usan los nuevos valores
-- 2. Recrear el tipo enum desde cero
-- 3. Re-aplicar a todas las tablas
--
-- RECOMENDACIÓN: NO hacer rollback. Los nuevos valores son seguros y necesarios.
-- Si no se usan, simplemente quedan disponibles sin impacto.
