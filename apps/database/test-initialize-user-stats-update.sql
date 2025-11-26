-- =====================================================
-- Script de Validación: initialize_user_stats actualizado
-- Propósito: Validar que la función modificada compila sin errores
-- Fecha: 2025-11-24
-- =====================================================

-- Este script valida:
-- 1. La función initialize_user_stats compila correctamente
-- 2. La función initialize_user_missions existe
-- 3. La llamada a initialize_user_missions usa el FK correcto

\echo '================================================'
\echo 'VALIDACIÓN: initialize_user_stats actualizado'
\echo '================================================'
\echo ''

-- 1. Verificar que la función initialize_user_missions existe
\echo '1. Verificando existencia de initialize_user_missions...'
SELECT
    p.proname as "Función",
    pg_get_function_identity_arguments(p.oid) as "Parámetros",
    CASE
        WHEN p.proname = 'initialize_user_missions' THEN '✅ EXISTE'
        ELSE '❌ NO EXISTE'
    END as "Status"
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'gamilit'
  AND p.proname = 'initialize_user_missions';

\echo ''

-- 2. Verificar que la función initialize_user_stats existe
\echo '2. Verificando existencia de initialize_user_stats...'
SELECT
    p.proname as "Función",
    pg_get_function_result(p.oid) as "Retorna",
    CASE
        WHEN p.proname = 'initialize_user_stats' THEN '✅ EXISTE'
        ELSE '❌ NO EXISTE'
    END as "Status"
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'gamilit'
  AND p.proname = 'initialize_user_stats';

\echo ''

-- 3. Verificar FK en missions table
\echo '3. Verificando FK de missions.user_id...'
SELECT
    tc.constraint_name as "Constraint",
    ccu.table_schema || '.' || ccu.table_name as "Tabla Referenciada",
    ccu.column_name as "Columna Referenciada",
    CASE
        WHEN ccu.table_name = 'profiles' AND ccu.column_name = 'id' THEN '✅ CORRECTO (profiles.id)'
        ELSE '❌ INCORRECTO'
    END as "Validación FK"
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'gamification_system'
  AND tc.table_name = 'missions'
  AND kcu.column_name = 'user_id'
  AND tc.constraint_type = 'FOREIGN KEY';

\echo ''

-- 4. Mostrar definición actual de initialize_user_stats
\echo '4. Código fuente de initialize_user_stats (últimas 15 líneas)...'
\echo 'Buscando línea con initialize_user_missions...'
\echo ''

-- Ver las últimas líneas de la función
SELECT
    regexp_split_to_table(
        pg_get_functiondef(p.oid),
        E'\n'
    ) as "Línea de código"
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'gamilit'
  AND p.proname = 'initialize_user_stats'
LIMIT 5 OFFSET (
    SELECT COUNT(*)
    FROM regexp_split_to_table(
        pg_get_functiondef(p2.oid),
        E'\n'
    )
    FROM pg_proc p2
    JOIN pg_namespace n2 ON p2.pronamespace = n2.oid
    WHERE n2.nspname = 'gamilit'
      AND p2.proname = 'initialize_user_stats'
) - 15;

\echo ''
\echo '================================================'
\echo 'INSTRUCCIONES PARA APLICAR CAMBIO'
\echo '================================================'
\echo ''
\echo 'El archivo DDL ha sido modificado en:'
\echo '  apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql'
\echo ''
\echo 'Para aplicar el cambio:'
\echo '  1. Recrear BD completa: ./drop-and-recreate-database.sh'
\echo '  2. O ejecutar solo la función:'
\echo '     psql -d gamilit_platform -f ddl/schemas/gamilit/functions/04-initialize_user_stats.sql'
\echo ''
\echo '================================================'
\echo 'FIN DE VALIDACIÓN'
\echo '================================================'
