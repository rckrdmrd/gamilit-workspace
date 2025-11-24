-- ============================================================================
-- GAMILIT Platform - Script de Corrección de Registros Huérfanos
-- ============================================================================
-- Fecha: 2025-11-23
-- Propósito: Corregir registros huérfanos detectados en validación de integridad
-- ADVERTENCIA: Este script ELIMINA datos. Ejecutar SOLO en ambiente de desarrollo.
-- ============================================================================

\echo '========================================================================'
\echo '🔧 SCRIPT DE CORRECCIÓN DE REGISTROS HUÉRFANOS'
\echo '========================================================================'
\echo ''
\echo 'ADVERTENCIA: Este script eliminará 16 registros huérfanos'
\echo 'AMBIENTE: SOLO DESARROLLO - NO EJECUTAR EN PRODUCCIÓN'
\echo ''
\echo 'Presiona Ctrl+C para cancelar en los próximos 5 segundos...'
SELECT pg_sleep(5);
\echo ''

-- ============================================================================
-- PASO 1: CREAR BACKUP DE SEGURIDAD
-- ============================================================================

\echo '========================================================================'
\echo 'PASO 1: Creando backup de seguridad'
\echo '========================================================================'
\echo ''

-- Backup de exercise_attempts
CREATE TABLE IF NOT EXISTS progress_tracking.exercise_attempts_backup_20251123 AS
SELECT * FROM progress_tracking.exercise_attempts;

\echo '✅ Backup creado: progress_tracking.exercise_attempts_backup_20251123'
\echo ''

SELECT
    'Registros en backup' as descripcion,
    COUNT(*) as cantidad
FROM progress_tracking.exercise_attempts_backup_20251123;

\echo ''

-- ============================================================================
-- PASO 2: MOSTRAR REGISTROS QUE SERÁN ELIMINADOS
-- ============================================================================

\echo '========================================================================'
\echo 'PASO 2: Registros que serán eliminados'
\echo '========================================================================'
\echo ''

SELECT
    ea.id as attempt_id,
    ea.exercise_id,
    ea.user_id,
    ea.submitted_at,
    ea.is_correct,
    ea.score
FROM progress_tracking.exercise_attempts ea
LEFT JOIN educational_content.exercises e ON e.id = ea.exercise_id
WHERE e.id IS NULL
ORDER BY ea.submitted_at DESC;

\echo ''

-- ============================================================================
-- PASO 3: ELIMINAR REGISTROS HUÉRFANOS
-- ============================================================================

\echo '========================================================================'
\echo 'PASO 3: Eliminando registros huérfanos'
\echo '========================================================================'
\echo ''

-- Eliminar registros con exercise_id inexistente
DELETE FROM progress_tracking.exercise_attempts
WHERE exercise_id NOT IN (
    SELECT id FROM educational_content.exercises
);

\echo ''
\echo '✅ Registros huérfanos eliminados'
\echo ''

-- ============================================================================
-- PASO 4: VERIFICAR RESULTADO
-- ============================================================================

\echo '========================================================================'
\echo 'PASO 4: Verificación post-limpieza'
\echo '========================================================================'
\echo ''

SELECT
    COUNT(*) as total_exercise_attempts,
    COUNT(e.id) as attempts_con_exercise_valido,
    COUNT(*) - COUNT(e.id) as attempts_huerfanos,
    CASE
        WHEN COUNT(*) = COUNT(e.id) THEN '✅ CORRECCIÓN EXITOSA'
        ELSE '❌ AÚN HAY PROBLEMAS'
    END as estado
FROM progress_tracking.exercise_attempts ea
LEFT JOIN educational_content.exercises e ON e.id = ea.exercise_id;

\echo ''

-- ============================================================================
-- PASO 5: AGREGAR FOREIGN KEY CONSTRAINTS (PREVENCIÓN FUTURA)
-- ============================================================================

\echo '========================================================================'
\echo 'PASO 5: Agregando FK constraints para prevención futura'
\echo '========================================================================'
\echo ''

-- Verificar si el constraint ya existe
DO $$
BEGIN
    -- Agregar FK constraint para exercise_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_exercise_attempts_exercise'
          AND table_name = 'exercise_attempts'
          AND table_schema = 'progress_tracking'
    ) THEN
        ALTER TABLE progress_tracking.exercise_attempts
        ADD CONSTRAINT fk_exercise_attempts_exercise
        FOREIGN KEY (exercise_id)
        REFERENCES educational_content.exercises(id)
        ON DELETE CASCADE;

        RAISE NOTICE '✅ FK constraint agregado: fk_exercise_attempts_exercise';
    ELSE
        RAISE NOTICE '⚠️  FK constraint ya existe: fk_exercise_attempts_exercise';
    END IF;

    -- Agregar FK constraint para user_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_exercise_attempts_user'
          AND table_name = 'exercise_attempts'
          AND table_schema = 'progress_tracking'
    ) THEN
        ALTER TABLE progress_tracking.exercise_attempts
        ADD CONSTRAINT fk_exercise_attempts_user
        FOREIGN KEY (user_id)
        REFERENCES auth_management.profiles(id)
        ON DELETE CASCADE;

        RAISE NOTICE '✅ FK constraint agregado: fk_exercise_attempts_user';
    ELSE
        RAISE NOTICE '⚠️  FK constraint ya existe: fk_exercise_attempts_user';
    END IF;
END $$;

\echo ''

-- ============================================================================
-- PASO 6: VALIDACIÓN FINAL
-- ============================================================================

\echo '========================================================================'
\echo 'PASO 6: Validación final de integridad'
\echo '========================================================================'
\echo ''

-- Verificar constraints FK
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'progress_tracking'
  AND tc.table_name = 'exercise_attempts'
ORDER BY tc.constraint_name;

\echo ''

-- Verificar que no hay más huérfanos
SELECT
    'Validación de exercise_id' as validacion,
    COUNT(*) as total_registros,
    COUNT(e.id) as registros_validos,
    COUNT(*) - COUNT(e.id) as registros_huerfanos,
    CASE
        WHEN COUNT(*) = COUNT(e.id) THEN '✅ OK'
        ELSE '❌ FALLÓ'
    END as estado
FROM progress_tracking.exercise_attempts ea
LEFT JOIN educational_content.exercises e ON e.id = ea.exercise_id

UNION ALL

SELECT
    'Validación de user_id' as validacion,
    COUNT(*) as total_registros,
    COUNT(p.id) as registros_validos,
    COUNT(*) - COUNT(p.id) as registros_huerfanos,
    CASE
        WHEN COUNT(*) = COUNT(p.id) THEN '✅ OK'
        ELSE '❌ FALLÓ'
    END as estado
FROM progress_tracking.exercise_attempts ea
LEFT JOIN auth_management.profiles p ON p.id = ea.user_id;

\echo ''

-- ============================================================================
-- RESUMEN FINAL
-- ============================================================================

\echo '========================================================================'
\echo '📊 RESUMEN DE CORRECCIÓN'
\echo '========================================================================'
\echo ''

SELECT
    'Registros en backup' as metrica,
    COUNT(*) as valor
FROM progress_tracking.exercise_attempts_backup_20251123

UNION ALL

SELECT
    'Registros actuales en exercise_attempts' as metrica,
    COUNT(*) as valor
FROM progress_tracking.exercise_attempts

UNION ALL

SELECT
    'Registros eliminados' as metrica,
    (SELECT COUNT(*) FROM progress_tracking.exercise_attempts_backup_20251123) -
    (SELECT COUNT(*) FROM progress_tracking.exercise_attempts) as valor;

\echo ''
\echo '========================================================================'
\echo '✅ CORRECCIÓN COMPLETADA'
\echo '========================================================================'
\echo ''
\echo 'Próximos pasos:'
\echo '  1. Re-ejecutar validacion-integridad.sql para confirmar 0 huérfanos'
\echo '  2. Si la validación es exitosa, aprobar deploy a producción'
\echo '  3. Backup creado en: progress_tracking.exercise_attempts_backup_20251123'
\echo ''
\echo 'Para restaurar backup (si es necesario):'
\echo '  DROP TABLE progress_tracking.exercise_attempts;'
\echo '  ALTER TABLE progress_tracking.exercise_attempts_backup_20251123'
\echo '    RENAME TO exercise_attempts;'
\echo ''

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
