-- =====================================================================================
-- Migration: migrate-difficulty-level-enum
-- Date: 2025-11-08
-- Type: ENUM Migration
-- Schema: educational_content (source: public)
-- Tables: modules, exercises (educational_content), content_templates, marie_curie_content (content_management)
-- =====================================================================================
--
-- DESCRIPTION:
-- Migrates difficulty_level ENUM from public to educational_content schema
-- and updates all tables using this ENUM to reference the new schema
--
-- COMPLEXITY: BAJA - Migración estándar de ENUM
--
-- CHANGES:
-- 1. Create educational_content.difficulty_level with 8 values
-- 2. ALTER TABLE modules.difficulty_level to use new schema
-- 3. ALTER TABLE exercises.difficulty_level to use new schema
-- 4. ALTER TABLE content_templates.difficulty_level to use new schema (if exists)
-- 5. ALTER TABLE marie_curie_content.difficulty_level to use new schema (if exists)
-- 6. Drop public.difficulty_level (if not used by other tables)
--
-- ALIGNMENT:
-- - FASE 1 - Sprint 1 - PLAN-MIGRACION-ENUMS-FASE1.md
-- - Migración P1 ALTA - Complejidad BAJA
--
-- ESTIMATED TIME: 1-2 seconds
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
    v_educational_enum_exists BOOLEAN;
    v_modules_count BIGINT;
    v_exercises_count BIGINT;
    v_enum_values TEXT[];
BEGIN
    -- Check if public.difficulty_level exists
    SELECT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public' AND t.typname = 'difficulty_level'
    ) INTO v_public_enum_exists;

    -- Check if educational_content.difficulty_level exists
    SELECT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'educational_content' AND t.typname = 'difficulty_level'
    ) INTO v_educational_enum_exists;

    -- Count modules and exercises
    SELECT COUNT(*) INTO v_modules_count FROM educational_content.modules;
    SELECT COUNT(*) INTO v_exercises_count FROM educational_content.exercises;

    -- Get current enum values
    SELECT ARRAY_AGG(enumlabel ORDER BY enumsortorder)
    INTO v_enum_values
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE n.nspname = 'public' AND t.typname = 'difficulty_level';

    RAISE NOTICE '=== PRE-VALIDATION ===';
    RAISE NOTICE 'public.difficulty_level exists: %', v_public_enum_exists;
    RAISE NOTICE 'educational_content.difficulty_level exists: %', v_educational_enum_exists;
    RAISE NOTICE 'Current enum values: %', v_enum_values;
    RAISE NOTICE 'Total modules: %', v_modules_count;
    RAISE NOTICE 'Total exercises: %', v_exercises_count;
    RAISE NOTICE '=====================';

    -- Validation checks
    IF v_educational_enum_exists THEN
        RAISE EXCEPTION 'Migration halted: educational_content.difficulty_level already exists. Please check if migration was already applied.';
    END IF;

    IF NOT v_public_enum_exists THEN
        RAISE EXCEPTION 'Migration halted: public.difficulty_level does not exist. Cannot migrate.';
    END IF;
END $$;

-- =====================================================================================
-- STEP 1: Create educational_content.difficulty_level ENUM (8 values)
-- =====================================================================================

CREATE TYPE educational_content.difficulty_level AS ENUM (
    'very_easy',     -- Nivel 1: Muy fácil
    'easy',          -- Nivel 2: Fácil
    'beginner',      -- Nivel 3: Principiante
    'medium',        -- Nivel 4: Medio
    'intermediate',  -- Nivel 5: Intermedio
    'hard',          -- Nivel 6: Difícil
    'advanced',      -- Nivel 7: Avanzado
    'very_hard'      -- Nivel 8: Muy difícil
);

COMMENT ON TYPE educational_content.difficulty_level IS
    'Niveles de dificultad para contenido educativo (v1.0 - 2025-11-08). '
    'Define 8 niveles de dificultad combinando escala numérica (very_easy→very_hard) y descriptiva (beginner→advanced). '
    'Migrado de public schema. Usado en modules, exercises, y content_management.';

RAISE NOTICE 'Created educational_content.difficulty_level with 8 values';

-- =====================================================================================
-- STEP 2: Migrate educational_content.modules.difficulty_level
-- =====================================================================================

ALTER TABLE educational_content.modules
    ALTER COLUMN difficulty_level TYPE educational_content.difficulty_level
    USING difficulty_level::text::educational_content.difficulty_level;

ALTER TABLE educational_content.modules
    ALTER COLUMN difficulty_level SET DEFAULT 'very_easy'::educational_content.difficulty_level;

RAISE NOTICE 'Migrated modules.difficulty_level to educational_content.difficulty_level';

-- =====================================================================================
-- STEP 3: Migrate educational_content.exercises.difficulty_level
-- =====================================================================================

ALTER TABLE educational_content.exercises
    ALTER COLUMN difficulty_level TYPE educational_content.difficulty_level
    USING difficulty_level::text::educational_content.difficulty_level;

ALTER TABLE educational_content.exercises
    ALTER COLUMN difficulty_level SET DEFAULT 'very_easy'::educational_content.difficulty_level;

RAISE NOTICE 'Migrated exercises.difficulty_level to educational_content.difficulty_level';

-- =====================================================================================
-- STEP 4: Migrate content_management.content_templates (if exists)
-- =====================================================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'content_management'
        AND table_name = 'content_templates'
        AND column_name = 'difficulty_level'
    ) THEN
        EXECUTE '
            ALTER TABLE content_management.content_templates
                ALTER COLUMN difficulty_level TYPE educational_content.difficulty_level
                USING difficulty_level::text::educational_content.difficulty_level
        ';
        RAISE NOTICE 'Migrated content_templates.difficulty_level to educational_content.difficulty_level';
    ELSE
        RAISE NOTICE 'content_templates.difficulty_level does not exist, skipping';
    END IF;
END $$;

-- =====================================================================================
-- STEP 5: Migrate content_management.marie_curie_content (if exists)
-- =====================================================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'content_management'
        AND table_name = 'marie_curie_content'
        AND column_name = 'difficulty_level'
    ) THEN
        EXECUTE '
            ALTER TABLE content_management.marie_curie_content
                ALTER COLUMN difficulty_level TYPE educational_content.difficulty_level
                USING difficulty_level::text::educational_content.difficulty_level
        ';
        RAISE NOTICE 'Migrated marie_curie_content.difficulty_level to educational_content.difficulty_level';
    ELSE
        RAISE NOTICE 'marie_curie_content.difficulty_level does not exist, skipping';
    END IF;
END $$;

-- =====================================================================================
-- STEP 6: Drop public.difficulty_level (if not used by other tables)
-- =====================================================================================

DO $$
BEGIN
    -- Check if public.difficulty_level is used by any other table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns c
        JOIN pg_type t ON c.udt_name = t.typname
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public'
        AND t.typname = 'difficulty_level'
        AND NOT (
            (c.table_schema = 'educational_content' AND c.table_name IN ('modules', 'exercises'))
            OR (c.table_schema = 'content_management' AND c.table_name IN ('content_templates', 'marie_curie_content'))
        )
    ) THEN
        RAISE NOTICE 'WARNING: public.difficulty_level is still used by other tables. NOT dropping.';
    ELSE
        DROP TYPE public.difficulty_level;
        RAISE NOTICE 'Dropped public.difficulty_level (no other tables using it)';
    END IF;
END $$;

-- =====================================================================================
-- POST-VALIDATION: Verify changes
-- =====================================================================================

DO $$
DECLARE
    v_enum_values TEXT[];
    v_modules_using_new BOOLEAN;
    v_exercises_using_new BOOLEAN;
    v_modules_count BIGINT;
    v_exercises_count BIGINT;
    v_modules_by_difficulty RECORD;
BEGIN
    -- Check enum values
    SELECT ARRAY_AGG(enumlabel ORDER BY enumsortorder)
    INTO v_enum_values
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE n.nspname = 'educational_content' AND t.typname = 'difficulty_level';

    -- Check modules uses new type
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'educational_content'
        AND table_name = 'modules'
        AND column_name = 'difficulty_level'
        AND udt_schema = 'educational_content'
    ) INTO v_modules_using_new;

    -- Check exercises uses new type
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'educational_content'
        AND table_name = 'exercises'
        AND column_name = 'difficulty_level'
        AND udt_schema = 'educational_content'
    ) INTO v_exercises_using_new;

    -- Count records
    SELECT COUNT(*) INTO v_modules_count FROM educational_content.modules;
    SELECT COUNT(*) INTO v_exercises_count FROM educational_content.exercises;

    RAISE NOTICE '=== POST-VALIDATION ===';
    RAISE NOTICE 'ENUM values: %', v_enum_values;
    RAISE NOTICE 'Expected: {very_easy,easy,beginner,medium,intermediate,hard,advanced,very_hard}';
    RAISE NOTICE 'modules uses new type: %', v_modules_using_new;
    RAISE NOTICE 'exercises uses new type: %', v_exercises_using_new;
    RAISE NOTICE 'Total modules: %', v_modules_count;
    RAISE NOTICE 'Total exercises: %', v_exercises_count;
    RAISE NOTICE '======================';

    -- Validations
    IF v_enum_values != ARRAY['very_easy', 'easy', 'beginner', 'medium', 'intermediate', 'hard', 'advanced', 'very_hard'] THEN
        RAISE EXCEPTION 'POST-VALIDATION FAILED: ENUM values do not match expected';
    END IF;

    IF NOT v_modules_using_new THEN
        RAISE EXCEPTION 'POST-VALIDATION FAILED: modules.difficulty_level is not using educational_content.difficulty_level';
    END IF;

    IF NOT v_exercises_using_new THEN
        RAISE EXCEPTION 'POST-VALIDATION FAILED: exercises.difficulty_level is not using educational_content.difficulty_level';
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
    RAISE NOTICE '1. Created educational_content.difficulty_level (8 values)';
    RAISE NOTICE '2. Migrated modules.difficulty_level to new schema';
    RAISE NOTICE '3. Migrated exercises.difficulty_level to new schema';
    RAISE NOTICE '4. Migrated content_management tables (if exist)';
    RAISE NOTICE '5. Dropped public.difficulty_level (if not used elsewhere)';
    RAISE NOTICE '';
    RAISE NOTICE 'All educational content now uses educational_content.difficulty_level';
    RAISE NOTICE '=================================================';
END $$;

-- =====================================================================================
-- ROLLBACK SCRIPT
-- =====================================================================================
--
-- WARNING: This rollback will:
-- 1. Recreate public.difficulty_level
-- 2. Convert all tables back to public schema
-- 3. Drop educational_content.difficulty_level
--
-- TO ROLLBACK THIS MIGRATION, RUN:
--
-- BEGIN;
--
-- -- Step 1: Recreate public.difficulty_level
-- CREATE TYPE public.difficulty_level AS ENUM (
--     'very_easy',
--     'easy',
--     'beginner',
--     'medium',
--     'intermediate',
--     'hard',
--     'advanced',
--     'very_hard'
-- );
--
-- -- Step 2: Convert modules back
-- ALTER TABLE educational_content.modules
--     ALTER COLUMN difficulty_level TYPE public.difficulty_level
--     USING difficulty_level::text::public.difficulty_level;
--
-- ALTER TABLE educational_content.modules
--     ALTER COLUMN difficulty_level SET DEFAULT 'very_easy'::public.difficulty_level;
--
-- -- Step 3: Convert exercises back
-- ALTER TABLE educational_content.exercises
--     ALTER COLUMN difficulty_level TYPE public.difficulty_level
--     USING difficulty_level::text::public.difficulty_level;
--
-- ALTER TABLE educational_content.exercises
--     ALTER COLUMN difficulty_level SET DEFAULT 'very_easy'::public.difficulty_level;
--
-- -- Step 4: Drop educational_content.difficulty_level
-- DROP TYPE IF EXISTS educational_content.difficulty_level;
--
-- COMMIT;
--
-- =====================================================================================
