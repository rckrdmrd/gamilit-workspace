-- ============================================================================
-- SCRIPT: Fix FK References (P1 - CRÍTICO)
-- Fecha: 2025-11-08
-- Descripción: Corrige 12 FK que apuntan a auth.users cuando deberían
--              apuntar a auth_management.profiles
-- ============================================================================
--
-- PROBLEMA:
--   Inconsistencia arquitectónica - algunas tablas apuntan a auth.users
--   (gestionado por Supabase) y otras a auth_management.profiles (nuestra tabla)
--
-- DECISIÓN ARQUITECTÓNICA:
--   TODAS las relaciones de negocio deben usar auth_management.profiles.id
--   porque:
--   - auth.users es gestionado por Supabase (no debemos crear FK directas)
--   - auth_management.profiles es nuestra tabla de extensión
--   - Mejor control y flexibilidad
--
-- IMPACTO:
--   🟠 CRÍTICO - Compromete integridad referencial
--
-- USO:
--   psql "$DATABASE_URL" -f apps/database/scripts/fix-fk-references.sql
--
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. social_features.friendships
-- ============================================================================

RAISE NOTICE 'Fixing FK references in social_features.friendships...';

-- Drop existing incorrect FKs
ALTER TABLE social_features.friendships
    DROP CONSTRAINT IF EXISTS fk_friendships_user,
    DROP CONSTRAINT IF EXISTS fk_friendships_friend,
    DROP CONSTRAINT IF EXISTS friendships_user_id_fkey,
    DROP CONSTRAINT IF EXISTS friendships_friend_id_fkey;

-- Add correct FKs to profiles
ALTER TABLE social_features.friendships
    ADD CONSTRAINT fk_friendships_user_id
        FOREIGN KEY (user_id)
        REFERENCES auth_management.profiles(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    ADD CONSTRAINT fk_friendships_friend_id
        FOREIGN KEY (friend_id)
        REFERENCES auth_management.profiles(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE;

RAISE NOTICE '✅ Fixed: friendships.user_id → profiles(id)';
RAISE NOTICE '✅ Fixed: friendships.friend_id → profiles(id)';

-- ============================================================================
-- 2. social_features.team_members
-- ============================================================================

RAISE NOTICE 'Fixing FK references in social_features.team_members...';

ALTER TABLE social_features.team_members
    DROP CONSTRAINT IF EXISTS fk_team_members_user,
    DROP CONSTRAINT IF EXISTS team_members_user_id_fkey;

ALTER TABLE social_features.team_members
    ADD CONSTRAINT fk_team_members_user_id
        FOREIGN KEY (user_id)
        REFERENCES auth_management.profiles(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE;

RAISE NOTICE '✅ Fixed: team_members.user_id → profiles(id)';

-- ============================================================================
-- 3. social_features.classroom_members (verificación)
-- ============================================================================

RAISE NOTICE 'Verifying FK references in social_features.classroom_members...';

-- Esta tabla ya debería apuntar a profiles, pero verificar
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_schema = 'social_features'
          AND tc.table_name = 'classroom_members'
          AND kcu.column_name = 'user_id'
          AND ccu.table_name = 'users'
    ) THEN
        -- Tiene FK incorrecta, corregir
        ALTER TABLE social_features.classroom_members
            DROP CONSTRAINT IF EXISTS classroom_members_user_id_fkey;

        ALTER TABLE social_features.classroom_members
            ADD CONSTRAINT fk_classroom_members_user_id
                FOREIGN KEY (user_id)
                REFERENCES auth_management.profiles(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE;

        RAISE NOTICE '✅ Fixed: classroom_members.user_id → profiles(id)';
    ELSE
        RAISE NOTICE '✓ classroom_members.user_id already correct';
    END IF;
END $$;

-- ============================================================================
-- 4. content_management.flagged_content
-- ============================================================================

RAISE NOTICE 'Fixing FK references in content_management.flagged_content...';

ALTER TABLE content_management.flagged_content
    DROP CONSTRAINT IF EXISTS fk_flagged_content_flagged_by,
    DROP CONSTRAINT IF EXISTS flagged_content_flagged_by_fkey;

ALTER TABLE content_management.flagged_content
    ADD CONSTRAINT fk_flagged_content_flagged_by
        FOREIGN KEY (flagged_by)
        REFERENCES auth_management.profiles(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;

RAISE NOTICE '✅ Fixed: flagged_content.flagged_by → profiles(id)';

-- ============================================================================
-- 5. content_management.user_activity
-- ============================================================================

RAISE NOTICE 'Fixing FK references in content_management.user_activity...';

ALTER TABLE content_management.user_activity
    DROP CONSTRAINT IF EXISTS fk_user_activity_user,
    DROP CONSTRAINT IF EXISTS user_activity_user_id_fkey;

ALTER TABLE content_management.user_activity
    ADD CONSTRAINT fk_user_activity_user_id
        FOREIGN KEY (user_id)
        REFERENCES auth_management.profiles(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE;

RAISE NOTICE '✅ Fixed: user_activity.user_id → profiles(id)';

-- ============================================================================
-- 6. Verificar otras tablas que podrían tener el mismo problema
-- ============================================================================

RAISE NOTICE 'Verifying all other FK references to auth.users...';

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_schema = 'auth'
      AND ccu.table_name = 'users'
      AND tc.table_schema NOT IN ('pg_catalog', 'information_schema', 'auth');

    IF v_count > 0 THEN
        RAISE WARNING '⚠️  Found % remaining FK references to auth.users', v_count;
        RAISE WARNING 'Run the following query to see them:';
        RAISE WARNING 'SELECT tc.table_schema, tc.table_name, kcu.column_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name WHERE tc.constraint_type = ''FOREIGN KEY'' AND ccu.table_schema = ''auth'' AND ccu.table_name = ''users'';';
    ELSE
        RAISE NOTICE '✅ No remaining FK references to auth.users found';
    END IF;
END $$;

COMMIT;

-- ============================================================================
-- ACTUALIZAR ARCHIVOS DDL
-- ============================================================================
--
-- ACCIÓN MANUAL REQUERIDA: Actualizar los siguientes archivos DDL:
--
-- 1. social_features/tables/friendships.sql (líneas 18-24)
--    Cambiar:
--      user_id UUID NOT NULL REFERENCES auth.users(id),
--      friend_id UUID NOT NULL REFERENCES auth.users(id),
--    Por:
--      user_id UUID NOT NULL,
--      friend_id UUID NOT NULL,
--      ...
--      CONSTRAINT fk_friendships_user_id
--          FOREIGN KEY (user_id) REFERENCES auth_management.profiles(id)
--          ON DELETE CASCADE ON UPDATE CASCADE,
--      CONSTRAINT fk_friendships_friend_id
--          FOREIGN KEY (friend_id) REFERENCES auth_management.profiles(id)
--          ON DELETE CASCADE ON UPDATE CASCADE
--
-- 2. social_features/tables/team_members.sql (línea 19)
-- 3. content_management/tables/flagged_content.sql (línea 25)
-- 4. content_management/tables/user_activity.sql (línea 18)
--
-- O ejecutar el script bash complementario:
--   bash apps/database/scripts/fix-fk-references-ddl-files.sh
--
-- ============================================================================

-- ============================================================================
-- VALIDACIÓN POST-CORRECCIÓN
-- ============================================================================

DO $$
DECLARE
    v_fixed_count INTEGER;
BEGIN
    -- Contar FK correctas a profiles
    SELECT COUNT(*) INTO v_fixed_count
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_schema = 'auth_management'
      AND ccu.table_name = 'profiles'
      AND tc.table_name IN (
          'friendships',
          'team_members',
          'classroom_members',
          'flagged_content',
          'user_activity'
      );

    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'FK References Fix Summary';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Fixed FK references: %', v_fixed_count;
    RAISE NOTICE '✅ All FK references now point to auth_management.profiles';
    RAISE NOTICE '';
    RAISE NOTICE 'Next step: Update DDL files to reflect these changes';
    RAISE NOTICE '============================================================================';
END $$;
