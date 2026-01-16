-- =====================================================================================
-- Script: Validación de corrección update_user_rank()
-- Propósito: Validar que la función update_user_rank() incluye balance_before y balance_after
-- Fecha: 2025-11-24
-- Uso: psql -d gamilit_platform -f scripts/validate-update-user-rank-fix.sql
-- =====================================================================================

\echo ''
\echo '========================================='
\echo 'VALIDACIÓN: update_user_rank() - Balance Fields'
\echo '========================================='
\echo ''

-- =====================================================================================
-- PASO 1: Verificar existencia de la función
-- =====================================================================================
\echo '1. Verificando existencia de función...'
SELECT
    p.proname AS function_name,
    n.nspname AS schema_name,
    pg_get_function_result(p.oid) AS return_type,
    pg_get_function_arguments(p.oid) AS arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'update_user_rank'
  AND n.nspname = 'gamification_system';

\echo ''

-- =====================================================================================
-- PASO 2: Verificar estructura de la tabla ml_coins_transactions
-- =====================================================================================
\echo '2. Verificando estructura de ml_coins_transactions...'
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'gamification_system'
  AND table_name = 'ml_coins_transactions'
  AND column_name IN ('balance_before', 'balance_after', 'transaction_type', 'amount', 'user_id')
ORDER BY ordinal_position;

\echo ''

-- =====================================================================================
-- PASO 3: Verificar valores del ENUM transaction_type
-- =====================================================================================
\echo '3. Verificando ENUM transaction_type...'
SELECT
    t.typname AS enum_name,
    e.enumlabel AS enum_value,
    e.enumsortorder AS sort_order
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE t.typname = 'transaction_type'
  AND n.nspname = 'gamification_system'
ORDER BY e.enumsortorder;

\echo ''

-- =====================================================================================
-- PASO 4: Verificar que 'earned_rank' existe en el ENUM
-- =====================================================================================
\echo '4. Verificando que ''earned_rank'' existe en el ENUM...'
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM pg_type t
            JOIN pg_enum e ON t.oid = e.enumtypid
            JOIN pg_namespace n ON t.typnamespace = n.oid
            WHERE t.typname = 'transaction_type'
              AND n.nspname = 'gamification_system'
              AND e.enumlabel = 'earned_rank'
        ) THEN '✅ ENUM ''earned_rank'' existe'
        ELSE '❌ ERROR: ENUM ''earned_rank'' NO existe'
    END AS validation_result;

\echo ''

-- =====================================================================================
-- PASO 5: Ver código fuente de la función (últimas líneas del INSERT)
-- =====================================================================================
\echo '5. Verificando código fuente de la función (fragmento del INSERT)...'
SELECT
    substring(
        pg_get_functiondef(p.oid),
        position('INSERT INTO gamification_system.ml_coins_transactions' in pg_get_functiondef(p.oid)),
        500
    ) AS insert_statement_fragment
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'update_user_rank'
  AND n.nspname = 'gamification_system';

\echo ''

-- =====================================================================================
-- PASO 6: Test básico de sintaxis (sin ejecutar realmente)
-- =====================================================================================
\echo '6. Validación de sintaxis SQL...'
\echo 'Preparando transacción de prueba (se hará ROLLBACK)...'

BEGIN;

-- Crear usuario de prueba temporal
DO $$
DECLARE
    v_test_user_id UUID := 'test-user-validate-rank-fix'::UUID;
BEGIN
    -- Limpiar si existe
    DELETE FROM gamification_system.user_stats WHERE user_id = v_test_user_id;
    DELETE FROM gamification_system.user_ranks WHERE user_id = v_test_user_id;
    DELETE FROM auth_management.profiles WHERE id = v_test_user_id;

    -- Crear perfil de prueba
    INSERT INTO auth_management.profiles (id, display_name, role, tenant_id)
    VALUES (
        v_test_user_id,
        'Test User - Validate Rank Fix',
        'student',
        (SELECT id FROM auth_management.tenants LIMIT 1)
    );

    -- Crear user_stats inicial (debe disparar trigger de inicialización)
    -- Si el trigger funciona, creará el registro automáticamente

    RAISE NOTICE 'Usuario de prueba creado: %', v_test_user_id;
END $$;

-- Verificar que el usuario se creó correctamente
\echo ''
\echo 'Verificando creación de user_stats...'
SELECT
    user_id,
    total_xp,
    COALESCE(ml_coins, 0) AS ml_coins,
    created_at
FROM gamification_system.user_stats
WHERE user_id = 'test-user-validate-rank-fix'::UUID;

-- Simular XP suficiente para ascender de rango
UPDATE gamification_system.user_stats
SET total_xp = 5000  -- Suficiente para pasar de Ajaw
WHERE user_id = 'test-user-validate-rank-fix'::UUID;

\echo ''
\echo 'Ejecutando update_user_rank()...'
SELECT * FROM gamification_system.update_user_rank('test-user-validate-rank-fix'::UUID);

\echo ''
\echo 'Verificando transacción creada...'
SELECT
    user_id,
    amount,
    balance_before,
    balance_after,
    transaction_type,
    description,
    created_at
FROM gamification_system.ml_coins_transactions
WHERE user_id = 'test-user-validate-rank-fix'::UUID
  AND transaction_type = 'earned_rank'
ORDER BY created_at DESC
LIMIT 1;

\echo ''
\echo 'Validando integridad de balance...'
SELECT
    CASE
        WHEN balance_after = balance_before + amount THEN '✅ Balance correcto'
        ELSE '❌ ERROR: Balance incorrecto'
    END AS balance_validation,
    balance_before,
    amount,
    balance_after,
    (balance_before + amount) AS expected_balance_after
FROM gamification_system.ml_coins_transactions
WHERE user_id = 'test-user-validate-rank-fix'::UUID
  AND transaction_type = 'earned_rank'
ORDER BY created_at DESC
LIMIT 1;

-- Rollback para no afectar la base de datos
ROLLBACK;

\echo ''
\echo '✅ Transacción de prueba revertida (ROLLBACK)'
\echo ''

-- =====================================================================================
-- PASO 7: Resumen de validación
-- =====================================================================================
\echo '========================================='
\echo 'RESUMEN DE VALIDACIÓN'
\echo '========================================='
\echo ''
\echo 'Checklist de corrección:'
\echo '  [ ] Función update_user_rank() existe'
\echo '  [ ] Campos balance_before y balance_after existen en ml_coins_transactions'
\echo '  [ ] Campos son NOT NULL'
\echo '  [ ] ENUM transaction_type tiene valor ''earned_rank'''
\echo '  [ ] Función incluye balance_before y balance_after en INSERT'
\echo '  [ ] Balance calculado correctamente (balance_after = balance_before + amount)'
\echo ''
\echo 'Si todos los pasos anteriores mostraron ✅, la corrección es exitosa.'
\echo ''

-- =====================================================================================
-- PASO 8: Instrucciones finales
-- =====================================================================================
\echo '========================================='
\echo 'INSTRUCCIONES'
\echo '========================================='
\echo ''
\echo 'Para aplicar la corrección a producción:'
\echo '  1. Verificar que este script ejecuta sin errores'
\echo '  2. Aplicar función: psql -d gamilit_platform -f ddl/schemas/gamification_system/functions/update_user_rank.sql'
\echo '  3. Validar con usuarios reales en ambiente de staging'
\echo '  4. Deploy a producción'
\echo ''
\echo 'Para revisar otras funciones que usan ml_coins_transactions:'
\echo '  grep -r "INSERT INTO.*ml_coins_transactions" apps/database/ddl/'
\echo ''

-- =====================================================================================
-- FIN DEL SCRIPT
-- =====================================================================================
