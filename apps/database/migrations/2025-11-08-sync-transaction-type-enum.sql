-- =====================================================================================
-- Migration: Sync transaction_type enum with official documentation
-- Created: 2025-11-08
-- Purpose: Convertir transaction_type de TEXT a ENUM y sincronizar con especificación oficial
-- Source: docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md:216-230
-- Issue: Incompleto - DDL actualizado pero migration faltante
-- Priority: P0 - CRÍTICO
-- =====================================================================================
--
-- CAMBIOS APLICADOS:
-- - Convertir columna transaction_type de TEXT a ENUM gamification_system.transaction_type
-- - Eliminar CHECK constraint legacy de ml_coins_transactions
-- - Mapear valores legacy (10) a nuevos valores (14)
-- - Eliminar public.transaction_type si existe
--
-- ANTES (v1.0):
-- - DDL: public.transaction_type ENUM (10 valores legacy)
-- - Tabla: transaction_type TEXT con CHECK constraint (12 valores)
-- - Backend: TransactionTypeEnum (10 valores legacy)
--
-- DESPUÉS (v2.0):
-- - DDL: gamification_system.transaction_type ENUM (14 valores oficiales)
-- - Tabla: transaction_type gamification_system.transaction_type
-- - Backend: TransactionTypeEnum (14 valores) ✅ YA ACTUALIZADO
--
-- =====================================================================================

BEGIN;

-- =====================================================================================
-- PASO 1: Validación Pre-Migración
-- =====================================================================================

DO $$
DECLARE
    public_enum_exists BOOLEAN;
    gamification_enum_exists BOOLEAN;
    total_transactions INTEGER;
    check_constraint_exists BOOLEAN;
BEGIN
    -- Verificar si existe public.transaction_type
    SELECT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public' AND t.typname = 'transaction_type'
    ) INTO public_enum_exists;

    -- Verificar si existe gamification_system.transaction_type
    SELECT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'gamification_system' AND t.typname = 'transaction_type'
    ) INTO gamification_enum_exists;

    -- Contar transacciones existentes
    SELECT COUNT(*) INTO total_transactions
    FROM gamification_system.ml_coins_transactions;

    -- Verificar si existe CHECK constraint
    SELECT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname LIKE '%transaction_type%'
          AND conrelid = 'gamification_system.ml_coins_transactions'::regclass
    ) INTO check_constraint_exists;

    RAISE NOTICE '';
    RAISE NOTICE '===== PRE-MIGRATION VALIDATION =====';
    RAISE NOTICE 'public.transaction_type exists: %', public_enum_exists;
    RAISE NOTICE 'gamification_system.transaction_type exists: %', gamification_enum_exists;
    RAISE NOTICE 'Total transactions in table: %', total_transactions;
    RAISE NOTICE 'CHECK constraint exists: %', check_constraint_exists;
    RAISE NOTICE '====================================';
    RAISE NOTICE '';

    -- Validar que gamification_system.transaction_type existe
    IF NOT gamification_enum_exists THEN
        RAISE EXCEPTION 'MIGRATION ABORTED: gamification_system.transaction_type does not exist. Run DDL first.';
    END IF;
END $$;

-- Mostrar distribución actual de tipos
DO $$
DECLARE
    type_distribution RECORD;
BEGIN
    RAISE NOTICE 'Current distribution of transaction types:';
    FOR type_distribution IN
        SELECT transaction_type, COUNT(*) as count
        FROM gamification_system.ml_coins_transactions
        GROUP BY transaction_type
        ORDER BY count DESC
    LOOP
        RAISE NOTICE '  - %: % transactions', type_distribution.transaction_type, type_distribution.count;
    END LOOP;
    RAISE NOTICE '';
END $$;

-- =====================================================================================
-- PASO 2: Identificar Valores Legacy que Necesitan Mapeo
-- =====================================================================================

DO $$
DECLARE
    legacy_values_found TEXT[];
    legacy_count INTEGER;
BEGIN
    -- Buscar valores legacy que deben ser mapeados
    SELECT ARRAY_AGG(DISTINCT transaction_type)
    INTO legacy_values_found
    FROM gamification_system.ml_coins_transactions
    WHERE transaction_type IN (
        'earned_daily_bonus',
        'earned_rank_promotion',
        'spent_unlock_content',
        'spent_customization',
        'gift'
    );

    SELECT COUNT(*)
    INTO legacy_count
    FROM gamification_system.ml_coins_transactions
    WHERE transaction_type IN (
        'earned_daily_bonus',
        'earned_rank_promotion',
        'spent_unlock_content',
        'spent_customization',
        'gift'
    );

    RAISE NOTICE '===== LEGACY VALUES FOUND =====';
    IF legacy_values_found IS NOT NULL THEN
        RAISE NOTICE 'Legacy values to migrate: %', array_to_string(legacy_values_found, ', ');
        RAISE NOTICE 'Total transactions with legacy values: %', legacy_count;
    ELSE
        RAISE NOTICE 'No legacy values found - migration will only change column type';
    END IF;
    RAISE NOTICE '================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================================
-- PASO 3: Migración de Datos Legacy
-- =====================================================================================

-- 3.1. Mapear valores legacy a nuevos valores
UPDATE gamification_system.ml_coins_transactions
SET transaction_type = 'earned_daily'
WHERE transaction_type = 'earned_daily_bonus';

UPDATE gamification_system.ml_coins_transactions
SET transaction_type = 'earned_rank'
WHERE transaction_type = 'earned_rank_promotion';

UPDATE gamification_system.ml_coins_transactions
SET transaction_type = 'spent_powerup'
WHERE transaction_type IN ('spent_unlock_content', 'spent_customization');

UPDATE gamification_system.ml_coins_transactions
SET transaction_type = 'bonus'
WHERE transaction_type = 'gift';

-- Verificar migración de datos
DO $$
DECLARE
    migrated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO migrated_count
    FROM gamification_system.ml_coins_transactions
    WHERE transaction_type IN (
        'earned_daily', 'earned_rank', 'spent_powerup', 'bonus'
    );

    RAISE NOTICE 'Transactions migrated from legacy values: %', migrated_count;
END $$;

-- =====================================================================================
-- PASO 4: Preparar Tabla para Nuevo ENUM
-- =====================================================================================

-- 4.1. Eliminar CHECK constraint si existe
ALTER TABLE gamification_system.ml_coins_transactions
    DROP CONSTRAINT IF EXISTS ml_coins_transactions_transaction_type_check;

RAISE NOTICE 'Removed CHECK constraint from ml_coins_transactions';

-- 4.2. Convertir columna a TEXT temporalmente (si no lo es ya)
ALTER TABLE gamification_system.ml_coins_transactions
    ALTER COLUMN transaction_type TYPE text;

RAISE NOTICE 'Converted column to TEXT';

-- 4.3. Aplicar nuevo enum a la columna
ALTER TABLE gamification_system.ml_coins_transactions
    ALTER COLUMN transaction_type TYPE gamification_system.transaction_type
    USING transaction_type::text::gamification_system.transaction_type;

RAISE NOTICE 'Applied gamification_system.transaction_type ENUM to column';

-- =====================================================================================
-- PASO 5: Eliminar public.transaction_type (si existe y no es usado)
-- =====================================================================================

DO $$
DECLARE
    other_usage_count INTEGER;
BEGIN
    -- Contar cuántas columnas usan public.transaction_type
    SELECT COUNT(*)
    INTO other_usage_count
    FROM information_schema.columns
    WHERE udt_schema = 'public'
      AND udt_name = 'transaction_type';

    IF other_usage_count = 0 THEN
        -- No hay otras tablas usándolo, seguro eliminarlo
        DROP TYPE IF EXISTS public.transaction_type CASCADE;
        RAISE NOTICE 'Dropped public.transaction_type (no longer in use)';
    ELSE
        RAISE WARNING 'public.transaction_type still in use by % column(s). Not dropping.', other_usage_count;
        RAISE WARNING 'Manual intervention required to migrate other tables first.';
    END IF;
END $$;

-- =====================================================================================
-- PASO 6: Validación Post-Migración
-- =====================================================================================

DO $$
DECLARE
    column_type_schema TEXT;
    column_type_name TEXT;
    type_distribution RECORD;
    total_transactions INTEGER;
    null_types INTEGER;
    invalid_values INTEGER;
BEGIN
    -- Verificar tipo de columna
    SELECT c.udt_schema, c.udt_name
    INTO column_type_schema, column_type_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'gamification_system'
      AND c.table_name = 'ml_coins_transactions'
      AND c.column_name = 'transaction_type';

    -- Contar total de transacciones
    SELECT COUNT(*) INTO total_transactions
    FROM gamification_system.ml_coins_transactions;

    -- Verificar que no haya valores NULL
    SELECT COUNT(*) INTO null_types
    FROM gamification_system.ml_coins_transactions
    WHERE transaction_type IS NULL;

    RAISE NOTICE '';
    RAISE NOTICE '===== POST-MIGRATION VALIDATION =====';
    RAISE NOTICE 'Column type: %.%', column_type_schema, column_type_name;
    RAISE NOTICE 'Total transactions: %', total_transactions;
    RAISE NOTICE 'Transactions with NULL type: %', null_types;
    RAISE NOTICE '';
    RAISE NOTICE 'Distribution of types after migration:';

    -- Mostrar distribución de tipos
    FOR type_distribution IN
        SELECT transaction_type::text as type, COUNT(*) as count
        FROM gamification_system.ml_coins_transactions
        GROUP BY transaction_type
        ORDER BY count DESC
    LOOP
        RAISE NOTICE '  - %: % transactions', type_distribution.type, type_distribution.count;
    END LOOP;

    RAISE NOTICE '=====================================';
    RAISE NOTICE '';

    -- Verificar integridad
    IF column_type_schema != 'gamification_system' OR column_type_name != 'transaction_type' THEN
        RAISE EXCEPTION 'MIGRATION FAILED: Column type is %.%, expected gamification_system.transaction_type',
            column_type_schema, column_type_name;
    END IF;

    IF null_types > 0 THEN
        RAISE EXCEPTION 'MIGRATION FAILED: % transactions have NULL transaction_type', null_types;
    END IF;

    RAISE NOTICE '✅ MIGRATION COMPLETED SUCCESSFULLY';
    RAISE NOTICE 'Backend constants already updated: TransactionTypeEnum (14 values)';
    RAISE NOTICE 'Services updated: ranks.service.ts uses EARNED_RANK';
END $$;

COMMIT;

-- =====================================================================================
-- ROLLBACK (Solo en caso de necesitar deshacer cambios)
-- =====================================================================================
--
-- ⚠️ NO EJECUTAR JUNTO CON LA MIGRACIÓN - Solo para emergencias
--
-- BEGIN;
--
-- -- Revertir a TEXT
-- ALTER TABLE gamification_system.ml_coins_transactions
--     ALTER COLUMN transaction_type TYPE text;
--
-- -- Revertir datos (si es necesario)
-- UPDATE gamification_system.ml_coins_transactions
-- SET transaction_type = 'earned_daily_bonus'
-- WHERE transaction_type = 'earned_daily';
--
-- UPDATE gamification_system.ml_coins_transactions
-- SET transaction_type = 'earned_rank_promotion'
-- WHERE transaction_type = 'earned_rank';
--
-- UPDATE gamification_system.ml_coins_transactions
-- SET transaction_type = 'gift'
-- WHERE transaction_type = 'bonus';
--
-- -- Re-crear CHECK constraint legacy (si es necesario)
-- ALTER TABLE gamification_system.ml_coins_transactions
--     ADD CONSTRAINT ml_coins_transactions_transaction_type_check
--     CHECK (transaction_type IN (
--         'earned_exercise', 'earned_module', 'earned_achievement', 'earned_rank', 'earned_streak',
--         'spent_powerup', 'spent_hint', 'spent_retry',
--         'admin_adjustment', 'refund', 'bonus', 'welcome_bonus'
--     ));
--
-- COMMIT;
--
-- =====================================================================================
-- NOTAS IMPORTANTES
-- =====================================================================================
--
-- 1. BACKUP: Asegurarse de tener backup completo antes de ejecutar
--
-- 2. TESTING: Ejecutar primero en ambiente de staging
--
-- 3. BACKEND: ✅ YA ACTUALIZADO (2025-11-08)
--    - apps/backend/src/shared/constants/enums.constants.ts (TransactionTypeEnum - 14 valores)
--    - apps/backend/src/modules/gamification/services/ranks.service.ts (EARNED_RANK)
--    - apps/backend/src/modules/gamification/services/ranks.service.spec.ts (EARNED_RANK)
--
-- 4. DDL: ✅ YA ACTUALIZADO (2025-11-07)
--    - apps/database/ddl/schemas/gamification_system/enums/transaction_type.sql (14 valores)
--    - apps/database/ddl/schemas/gamification_system/tables/05-ml_coins_transactions.sql (usa ENUM)
--
-- 5. MAPEO DE VALORES LEGACY:
--    - earned_daily_bonus → earned_daily
--    - earned_rank_promotion → earned_rank
--    - spent_unlock_content → spent_powerup
--    - spent_customization → spent_powerup
--    - gift → bonus
--
-- 6. NUEVOS VALORES DISPONIBLES (no requieren mapeo):
--    - earned_module (nuevo)
--    - earned_streak (nuevo)
--    - earned_daily (nuevo)
--    - earned_bonus (nuevo)
--    - spent_powerup (nuevo)
--    - spent_retry (nuevo)
--    - welcome_bonus (nuevo)
--
-- 7. VALIDACIÓN POST-DEPLOY:
--    - Verificar que transacciones nuevas se crean correctamente
--    - Testing de cada tipo de transacción
--    - Validar queries existentes en backend
--
-- =====================================================================================
