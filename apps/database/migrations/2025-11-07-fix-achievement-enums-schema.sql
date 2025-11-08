-- =====================================================================================
-- Migration: Fix achievement ENUMs schema references
-- Created: 2025-11-07
-- Purpose: Corregir referencias de achievement_category de public a gamification_system
-- Source: TRACKING-CORRECCIONES.md - P1.1.1, P1.1.2
-- Priority: P0 - CRÍTICO
-- =====================================================================================
--
-- PROBLEMA IDENTIFICADO:
-- - Los ENUMs achievement_category y achievement_type están correctamente definidos
--   en gamification_system schema
-- - PERO la tabla achievements referencia public.achievement_category
-- - Esto crea inconsistencia y dependencias incorrectas
--
-- SOLUCIÓN:
-- - Actualizar columna achievements.category para usar gamification_system.achievement_category
-- - Eliminar public.achievement_category si existe y no es usado por otras tablas
-- - Verificar achievement_type (actualmente no usado en tablas, pero validar)
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
    achievements_count INTEGER;
BEGIN
    -- Verificar si existe public.achievement_category
    SELECT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public' AND t.typname = 'achievement_category'
    ) INTO public_enum_exists;

    -- Verificar si existe gamification_system.achievement_category
    SELECT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'gamification_system' AND t.typname = 'achievement_category'
    ) INTO gamification_enum_exists;

    -- Contar achievements
    SELECT COUNT(*) INTO achievements_count
    FROM gamification_system.achievements;

    RAISE NOTICE '';
    RAISE NOTICE '===== PRE-MIGRATION VALIDATION =====';
    RAISE NOTICE 'public.achievement_category exists: %', public_enum_exists;
    RAISE NOTICE 'gamification_system.achievement_category exists: %', gamification_enum_exists;
    RAISE NOTICE 'Total achievements in table: %', achievements_count;
    RAISE NOTICE '====================================';
    RAISE NOTICE '';

    -- Validar que gamification_system.achievement_category existe
    IF NOT gamification_enum_exists THEN
        RAISE EXCEPTION 'MIGRATION ABORTED: gamification_system.achievement_category does not exist. Run prerequisites.sql first.';
    END IF;

    -- Si existe public.achievement_category, mostrar warning
    IF public_enum_exists THEN
        RAISE WARNING 'public.achievement_category exists and will be dropped after column migration';
    END IF;
END $$;

-- =====================================================================================
-- PASO 2: Verificar Uso de public.achievement_category en Otras Tablas
-- =====================================================================================

DO $$
DECLARE
    other_tables_using_public TEXT;
BEGIN
    -- Buscar otras tablas que usen public.achievement_category
    SELECT string_agg(t.table_schema || '.' || t.table_name || '.' || c.column_name, ', ')
    INTO other_tables_using_public
    FROM information_schema.columns c
    JOIN information_schema.tables t ON c.table_name = t.table_name AND c.table_schema = t.table_schema
    WHERE c.udt_schema = 'public'
      AND c.udt_name = 'achievement_category'
      AND NOT (t.table_schema = 'gamification_system' AND t.table_name = 'achievements');

    IF other_tables_using_public IS NOT NULL THEN
        RAISE WARNING 'Other tables using public.achievement_category: %', other_tables_using_public;
        RAISE WARNING 'These will need to be migrated separately';
    ELSE
        RAISE NOTICE 'No other tables use public.achievement_category';
    END IF;
END $$;

-- =====================================================================================
-- PASO 3: Actualizar Columna achievements.category
-- =====================================================================================

-- 3.1. Convertir columna a TEXT temporalmente
ALTER TABLE gamification_system.achievements
    ALTER COLUMN category TYPE text;

RAISE NOTICE 'Step 3.1: Converted column to TEXT';

-- 3.2. Aplicar gamification_system.achievement_category
ALTER TABLE gamification_system.achievements
    ALTER COLUMN category TYPE gamification_system.achievement_category
    USING category::text::gamification_system.achievement_category;

RAISE NOTICE 'Step 3.2: Applied gamification_system.achievement_category to column';

-- 3.3. Verificar que la conversión fue exitosa
DO $$
DECLARE
    column_type_schema TEXT;
    column_type_name TEXT;
BEGIN
    SELECT c.udt_schema, c.udt_name
    INTO column_type_schema, column_type_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'gamification_system'
      AND c.table_name = 'achievements'
      AND c.column_name = 'category';

    RAISE NOTICE 'Column category now uses: %.%', column_type_schema, column_type_name;

    IF column_type_schema != 'gamification_system' OR column_type_name != 'achievement_category' THEN
        RAISE EXCEPTION 'Column migration failed. Expected gamification_system.achievement_category, got %.%',
            column_type_schema, column_type_name;
    END IF;
END $$;

-- =====================================================================================
-- PASO 4: Eliminar public.achievement_category (si no es usado por otras tablas)
-- =====================================================================================

DO $$
DECLARE
    other_usage_count INTEGER;
BEGIN
    -- Contar cuántas columnas usan public.achievement_category
    SELECT COUNT(*)
    INTO other_usage_count
    FROM information_schema.columns
    WHERE udt_schema = 'public'
      AND udt_name = 'achievement_category';

    IF other_usage_count = 0 THEN
        -- No hay otras tablas usándolo, seguro eliminarlo
        DROP TYPE IF EXISTS public.achievement_category CASCADE;
        RAISE NOTICE 'Dropped public.achievement_category (no longer in use)';
    ELSE
        RAISE WARNING 'public.achievement_category still in use by % column(s). Not dropping.', other_usage_count;
        RAISE WARNING 'Manual intervention required to migrate other tables first.';
    END IF;
END $$;

-- =====================================================================================
-- PASO 5: Verificar achievement_type (informativo)
-- =====================================================================================

DO $$
DECLARE
    public_achievement_type_exists BOOLEAN;
    usage_count INTEGER;
BEGIN
    -- Verificar si existe public.achievement_type
    SELECT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public' AND t.typname = 'achievement_type'
    ) INTO public_achievement_type_exists;

    IF public_achievement_type_exists THEN
        -- Contar uso
        SELECT COUNT(*)
        INTO usage_count
        FROM information_schema.columns
        WHERE udt_schema = 'public' AND udt_name = 'achievement_type';

        RAISE NOTICE '';
        RAISE NOTICE '===== achievement_type STATUS =====';
        RAISE NOTICE 'public.achievement_type exists: %', public_achievement_type_exists;
        RAISE NOTICE 'Columns using it: %', usage_count;

        IF usage_count = 0 THEN
            RAISE NOTICE 'RECOMMENDATION: public.achievement_type is not used and can be dropped';
            DROP TYPE IF EXISTS public.achievement_type CASCADE;
            RAISE NOTICE 'Dropped unused public.achievement_type';
        ELSE
            RAISE WARNING 'public.achievement_type is in use by % column(s)', usage_count;
        END IF;
        RAISE NOTICE '====================================';
    ELSE
        RAISE NOTICE 'public.achievement_type does not exist (OK)';
    END IF;
END $$;

-- =====================================================================================
-- PASO 6: Validación Post-Migración
-- =====================================================================================

DO $$
DECLARE
    category_type TEXT;
    category_distribution RECORD;
    total_achievements INTEGER;
BEGIN
    -- Obtener el tipo de la columna
    SELECT c.udt_schema || '.' || c.udt_name
    INTO category_type
    FROM information_schema.columns c
    WHERE c.table_schema = 'gamification_system'
      AND c.table_name = 'achievements'
      AND c.column_name = 'category';

    -- Contar achievements
    SELECT COUNT(*) INTO total_achievements
    FROM gamification_system.achievements;

    RAISE NOTICE '';
    RAISE NOTICE '===== POST-MIGRATION VALIDATION =====';
    RAISE NOTICE 'Column achievements.category type: %', category_type;
    RAISE NOTICE 'Total achievements: %', total_achievements;
    RAISE NOTICE '';
    RAISE NOTICE 'Distribution by category:';

    -- Mostrar distribución
    FOR category_distribution IN
        SELECT category::text, COUNT(*) as count
        FROM gamification_system.achievements
        GROUP BY category
        ORDER BY count DESC
    LOOP
        RAISE NOTICE '  - %: % achievements', category_distribution.category, category_distribution.count;
    END LOOP;

    RAISE NOTICE '=====================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ MIGRATION COMPLETED SUCCESSFULLY';
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
-- -- Revertir a public.achievement_category
-- ALTER TABLE gamification_system.achievements
--     ALTER COLUMN category TYPE text;
--
-- -- Recrear public.achievement_category si fue eliminado
-- CREATE TYPE public.achievement_category AS ENUM (
--     'progress', 'streak', 'completion', 'social', 'special', 'mastery', 'exploration'
-- );
--
-- ALTER TABLE gamification_system.achievements
--     ALTER COLUMN category TYPE public.achievement_category
--     USING category::text::public.achievement_category;
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
-- 3. DDL ACTUALIZADO: El DDL de achievements ya fue actualizado para usar
--    gamification_system.achievement_category en:
--    apps/database/ddl/schemas/gamification_system/tables/03-achievements.sql
--
-- 4. BACKEND: Verificar que el backend use el ENUM correcto:
--    - apps/backend/src/modules/gamification/entities/achievement.entity.ts
--    - Debe especificar schema en decorator si es necesario
--
-- 5. TIPOS RELACIONADOS: achievement_type no es usado actualmente en tablas,
--    pero existe en gamification_system. Si se agrega una columna type en el futuro,
--    usar gamification_system.achievement_type
--
-- 6. OTROS ENUMs: Considerar migrar otros ENUMs de public a schemas apropiados:
--    - comodin_type → gamification_system
--    - transaction_type → gamification_system
--    - notification_priority → gamification_system
--    - difficulty_level → educational_content
--    - etc.
--
-- =====================================================================================
