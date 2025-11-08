-- =====================================================================================
-- Migration: migrate-comodin-type-enum
-- Date: 2025-11-08
-- Type: ENUM Migration (ARRAY type)
-- Schema: gamification_system (source: public)
-- Table: educational_content.exercises
-- =====================================================================================
--
-- DESCRIPTION:
-- Migrates comodin_type ENUM from public to gamification_system schema
-- and updates exercises.comodines_allowed column to use new schema
--
-- COMPLEXITY: MEDIA - Maneja ARRAY type (comodin_type[])
--
-- CHANGES:
-- 1. Create gamification_system.comodin_type with 3 values (pistas, vision_lectora, segunda_oportunidad)
-- 2. ALTER TABLE exercises.comodines_allowed from public.comodin_type[] to gamification_system.comodin_type[]
-- 3. Drop public.comodin_type (if not used by other tables)
--
-- ALIGNMENT:
-- - FASE 1 - Sprint 1 - PLAN-MIGRACION-ENUMS-FASE1.md
-- - Migración P1 ALTA - Complejidad MEDIA (ARRAY type)
--
-- ESTIMATED TIME: 1-3 seconds
--
-- ROLLBACK: See section at bottom
--
-- =====================================================================================

-- =====================================================================================
-- PRE-VALIDATION: Check current state
-- =====================================================================================

DO $$
DECLARE
    v_public_enum_exists BOOLEAN;
    v_gamification_enum_exists BOOLEAN;
    v_exercises_using_public BOOLEAN;
    v_exercises_count BIGINT;
    v_exercises_with_comodines BIGINT;
BEGIN
    -- Check if public.comodin_type exists
    SELECT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public' AND t.typname = 'comodin_type'
    ) INTO v_public_enum_exists;

    -- Check if gamification_system.comodin_type exists
    SELECT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'gamification_system' AND t.typname = 'comodin_type'
    ) INTO v_gamification_enum_exists;

    -- Check if exercises table exists and uses public.comodin_type
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'educational_content'
        AND table_name = 'exercises'
        AND column_name = 'comodines_allowed'
        AND udt_name = '_comodin_type'
    ) INTO v_exercises_using_public;

    -- Count exercises
    SELECT COUNT(*) INTO v_exercises_count
    FROM educational_content.exercises;

    -- Count exercises with non-null comodines_allowed
    SELECT COUNT(*) INTO v_exercises_with_comodines
    FROM educational_content.exercises
    WHERE comodines_allowed IS NOT NULL;

    RAISE NOTICE '=== PRE-VALIDATION ===';
    RAISE NOTICE 'public.comodin_type exists: %', v_public_enum_exists;
    RAISE NOTICE 'gamification_system.comodin_type exists: %', v_gamification_enum_exists;
    RAISE NOTICE 'exercises.comodines_allowed uses public type: %', v_exercises_using_public;
    RAISE NOTICE 'Total exercises: %', v_exercises_count;
    RAISE NOTICE 'Exercises with comodines_allowed: %', v_exercises_with_comodines;
    RAISE NOTICE '=====================';

    -- Validation checks
    IF v_gamification_enum_exists THEN
        RAISE EXCEPTION 'Migration halted: gamification_system.comodin_type already exists. Please check if migration was already applied.';
    END IF;

    IF NOT v_public_enum_exists THEN
        RAISE EXCEPTION 'Migration halted: public.comodin_type does not exist. Cannot migrate.';
    END IF;
END $$;

-- =====================================================================================
-- STEP 1: Create gamification_system.comodin_type ENUM (3 values)
-- =====================================================================================

CREATE TYPE gamification_system.comodin_type AS ENUM (
    'pistas',               -- Pistas Contextuales: Ayudas sobre el ejercicio (15 ML Coins)
    'vision_lectora',       -- Visión Lectora: Revela parte del texto clave (25 ML Coins)
    'segunda_oportunidad'   -- Segunda Oportunidad: Permite reintento del ejercicio (40 ML Coins)
);

COMMENT ON TYPE gamification_system.comodin_type IS
    'Tipos de comodines (power-ups) para ayuda en ejercicios (v1.0 - 2025-11-08). '
    'Define los 3 tipos de ayudas disponibles: pistas (15 coins), vision_lectora (25 coins), segunda_oportunidad (40 coins). '
    'Migrado de public schema. Usado en exercises.comodines_allowed como ARRAY type.';

RAISE NOTICE 'Created gamification_system.comodin_type with 3 values';

-- =====================================================================================
-- STEP 2: Migrate exercises.comodines_allowed column (ARRAY type)
-- =====================================================================================

-- IMPORTANTE: Este es el paso crítico - migrar ARRAY type
-- La conversión requiere: text[]::gamification_system.comodin_type[]

ALTER TABLE educational_content.exercises
    ALTER COLUMN comodines_allowed TYPE gamification_system.comodin_type[]
    USING comodines_allowed::text[]::gamification_system.comodin_type[];

-- Update DEFAULT value to use new schema
ALTER TABLE educational_content.exercises
    ALTER COLUMN comodines_allowed SET DEFAULT ARRAY[
        'pistas'::gamification_system.comodin_type,
        'vision_lectora'::gamification_system.comodin_type,
        'segunda_oportunidad'::gamification_system.comodin_type
    ];

-- Update COMMENT
COMMENT ON COLUMN educational_content.exercises.comodines_allowed IS
    'Power-ups permitidos en este ejercicio (gamification_system.comodin_type[] ARRAY). '
    'Valores: pistas (15 coins), vision_lectora (25 coins), segunda_oportunidad (40 coins). '
    'DEFAULT: todos habilitados.';

RAISE NOTICE 'Migrated exercises.comodines_allowed to gamification_system.comodin_type[]';

-- =====================================================================================
-- STEP 3: Drop public.comodin_type (if not used by other tables)
-- =====================================================================================

DO $$
BEGIN
    -- Check if public.comodin_type is used by any other table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns c
        JOIN pg_type t ON c.udt_name = t.typname OR c.udt_name = ('_' || t.typname)
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public'
        AND t.typname = 'comodin_type'
        AND (c.table_schema != 'educational_content' OR c.table_name != 'exercises')
    ) THEN
        RAISE NOTICE 'WARNING: public.comodin_type is still used by other tables. NOT dropping.';
    ELSE
        DROP TYPE public.comodin_type;
        RAISE NOTICE 'Dropped public.comodin_type (no other tables using it)';
    END IF;
END $$;

-- =====================================================================================
-- POST-VALIDATION: Verify changes
-- =====================================================================================

DO $$
DECLARE
    v_enum_values TEXT[];
    v_exercises_using_new_type BOOLEAN;
    v_exercises_count BIGINT;
    v_exercises_with_comodines BIGINT;
    v_sample_comodines TEXT[];
BEGIN
    -- Check enum values
    SELECT ARRAY_AGG(enumlabel ORDER BY enumsortorder)
    INTO v_enum_values
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE n.nspname = 'gamification_system' AND t.typname = 'comodin_type';

    -- Check exercises table now uses gamification_system type
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_schema = 'educational_content'
        AND c.table_name = 'exercises'
        AND c.column_name = 'comodines_allowed'
        AND c.udt_schema = 'gamification_system'
        AND c.udt_name = '_comodin_type'
    ) INTO v_exercises_using_new_type;

    -- Count exercises
    SELECT COUNT(*) INTO v_exercises_count
    FROM educational_content.exercises;

    -- Count exercises with comodines_allowed
    SELECT COUNT(*) INTO v_exercises_with_comodines
    FROM educational_content.exercises
    WHERE comodines_allowed IS NOT NULL;

    -- Get sample of comodines_allowed values
    SELECT comodines_allowed INTO v_sample_comodines
    FROM educational_content.exercises
    WHERE comodines_allowed IS NOT NULL
    LIMIT 1;

    RAISE NOTICE '=== POST-VALIDATION ===';
    RAISE NOTICE 'ENUM values: %', v_enum_values;
    RAISE NOTICE 'Expected: {pistas,vision_lectora,segunda_oportunidad}';
    RAISE NOTICE 'exercises.comodines_allowed uses new type: %', v_exercises_using_new_type;
    RAISE NOTICE 'Total exercises: %', v_exercises_count;
    RAISE NOTICE 'Exercises with comodines: %', v_exercises_with_comodines;
    RAISE NOTICE 'Sample comodines_allowed: %', v_sample_comodines;
    RAISE NOTICE '======================';

    -- Validations
    IF v_enum_values != ARRAY['pistas', 'vision_lectora', 'segunda_oportunidad'] THEN
        RAISE EXCEPTION 'POST-VALIDATION FAILED: ENUM values do not match expected';
    END IF;

    IF NOT v_exercises_using_new_type THEN
        RAISE EXCEPTION 'POST-VALIDATION FAILED: exercises.comodines_allowed is not using gamification_system.comodin_type[]';
    END IF;

    RAISE NOTICE '✅ POST-VALIDATION PASSED: All checks successful';
END $$;

-- =====================================================================================
-- SUMMARY
-- =====================================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'MIGRATION COMPLETED SUCCESSFULLY';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Changes applied:';
    RAISE NOTICE '1. Created gamification_system.comodin_type (3 values)';
    RAISE NOTICE '2. Migrated exercises.comodines_allowed to use new type (ARRAY)';
    RAISE NOTICE '3. Dropped public.comodin_type (if not used elsewhere)';
    RAISE NOTICE '';
    RAISE NOTICE 'All exercises comodines_allowed now use gamification_system schema';
    RAISE NOTICE '=================================================';
END $$;

-- =====================================================================================
-- ROLLBACK SCRIPT
-- =====================================================================================
--
-- WARNING: This rollback will:
-- 1. Recreate public.comodin_type
-- 2. Convert exercises.comodines_allowed back to public schema
-- 3. Drop gamification_system.comodin_type
--
-- TO ROLLBACK THIS MIGRATION, RUN:
--
-- BEGIN;
--
-- -- Step 1: Recreate public.comodin_type
-- CREATE TYPE public.comodin_type AS ENUM (
--     'pistas',
--     'vision_lectora',
--     'segunda_oportunidad'
-- );
--
-- -- Step 2: Convert exercises.comodines_allowed back to public
-- ALTER TABLE educational_content.exercises
--     ALTER COLUMN comodines_allowed TYPE public.comodin_type[]
--     USING comodines_allowed::text[]::public.comodin_type[];
--
-- ALTER TABLE educational_content.exercises
--     ALTER COLUMN comodines_allowed SET DEFAULT ARRAY[
--         'pistas'::public.comodin_type,
--         'vision_lectora'::public.comodin_type,
--         'segunda_oportunidad'::public.comodin_type
--     ];
--
-- -- Step 3: Drop gamification_system.comodin_type
-- DROP TYPE IF EXISTS gamification_system.comodin_type;
--
-- COMMIT;
--
-- =====================================================================================
