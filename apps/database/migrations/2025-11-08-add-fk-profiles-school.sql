-- Migration: Add FK constraint for profiles.school_id
-- Date: 2025-11-08
-- Description: Create foreign key constraint from auth_management.profiles.school_id to social_features.schools.id
-- Priority: P1
-- Issue: profiles.school_id field exists but FK constraint was not created

-- =====================================================
-- VALIDACIÓN PREVIA
-- =====================================================

-- Verificar que no existan valores huérfanos (school_id que no existen en schools)
DO $$
DECLARE
    v_orphaned_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_orphaned_count
    FROM auth_management.profiles p
    WHERE p.school_id IS NOT NULL
      AND NOT EXISTS (
          SELECT 1
          FROM social_features.schools s
          WHERE s.id = p.school_id
      );

    IF v_orphaned_count > 0 THEN
        RAISE WARNING 'Found % profiles with orphaned school_id. Setting them to NULL before creating FK.', v_orphaned_count;

        -- Limpiar valores huérfanos
        UPDATE auth_management.profiles
        SET school_id = NULL
        WHERE school_id IS NOT NULL
          AND NOT EXISTS (
              SELECT 1
              FROM social_features.schools s
              WHERE s.id = school_id
          );
    ELSE
        RAISE NOTICE 'No orphaned school_id values found. Safe to create FK.';
    END IF;
END $$;

-- =====================================================
-- CREAR FOREIGN KEY CONSTRAINT
-- =====================================================

-- Verificar si el constraint ya existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_schema = 'auth_management'
          AND table_name = 'profiles'
          AND constraint_name = 'fk_profiles_school_id'
    ) THEN
        -- Crear el constraint
        ALTER TABLE auth_management.profiles
        ADD CONSTRAINT fk_profiles_school_id
        FOREIGN KEY (school_id)
        REFERENCES social_features.schools(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;

        RAISE NOTICE '✅ FK constraint fk_profiles_school_id created successfully';
    ELSE
        RAISE NOTICE 'ℹ️  FK constraint fk_profiles_school_id already exists';
    END IF;
END $$;

-- =====================================================
-- VALIDACIÓN POST-CREACIÓN
-- =====================================================

-- Verificar que el constraint se creó correctamente
DO $$
DECLARE
    v_constraint_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_schema = 'auth_management'
          AND table_name = 'profiles'
          AND constraint_name = 'fk_profiles_school_id'
          AND constraint_type = 'FOREIGN KEY'
    ) INTO v_constraint_exists;

    IF v_constraint_exists THEN
        RAISE NOTICE '✅ VALIDATION PASSED: FK constraint exists and is valid';
    ELSE
        RAISE EXCEPTION '❌ VALIDATION FAILED: FK constraint was not created';
    END IF;
END $$;

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON CONSTRAINT fk_profiles_school_id ON auth_management.profiles IS
'Foreign key linking user profiles to their school/organization.
SET NULL on delete to preserve user profile when school is deleted.
CASCADE on update to maintain referential integrity.';

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================

-- To rollback this migration, run:
-- ALTER TABLE auth_management.profiles DROP CONSTRAINT IF EXISTS fk_profiles_school_id;
