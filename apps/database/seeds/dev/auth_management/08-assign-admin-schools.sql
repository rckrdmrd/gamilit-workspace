-- =====================================================
-- Seed: auth_management.profiles - Assign School to ALL Users (PROD)
-- Description: Asigna la escuela default a TODOS los usuarios sin escuela
-- Environment: PRODUCTION
-- Dependencies:
--   - social_features.schools (00-schools-default.sql)
--   - auth_management.profiles (04-profiles-complete.sql)
-- Order: 08 (debe ejecutarse DESPUÉS de profiles y schools)
-- Created: 2025-12-15
-- Updated: 2025-12-15 - Expandido a TODOS los usuarios
-- Version: 2.0
-- =====================================================
--
-- PROPÓSITO:
-- Asegurar que TODOS los usuarios tengan una escuela asignada
-- (school_id NOT NULL) apuntando a la escuela default.
--
-- USUARIOS AFECTADOS:
-- - Todos los roles: super_admin, admin_teacher, student, parent
-- - Cualquier usuario nuevo sin school_id
--
-- DECISIÓN DE DISEÑO (v2.0):
-- - TODOS los usuarios van a la escuela default
-- - El admin puede reasignarlos desde la UI a otras escuelas
-- - Esto garantiza integridad referencial
--
-- IMPORTANTE: Este seed es idempotente - solo actualiza si school_id IS NULL
-- =====================================================

SET search_path TO auth_management, social_features, public;

-- =====================================================
-- Asignar escuela default a TODOS los usuarios sin escuela
-- =====================================================

DO $$
DECLARE
    v_default_school_id UUID;
    v_total_users INTEGER;
    v_users_without_school INTEGER;
    v_affected_count INTEGER;
    rec RECORD;
BEGIN
    -- Obtener la escuela default del sistema
    SELECT id INTO v_default_school_id
    FROM social_features.schools
    WHERE code = 'SYSTEM-UNASSIGNED'
      AND is_active = true
    LIMIT 1;

    IF v_default_school_id IS NULL THEN
        RAISE EXCEPTION 'Escuela default (SYSTEM-UNASSIGNED) no encontrada. Ejecutar primero 00-schools-default.sql';
    END IF;

    RAISE NOTICE 'Usando escuela default: %', v_default_school_id;

    -- Contar usuarios totales y sin escuela
    SELECT COUNT(*) INTO v_total_users
    FROM auth_management.profiles;

    SELECT COUNT(*) INTO v_users_without_school
    FROM auth_management.profiles
    WHERE school_id IS NULL;

    RAISE NOTICE 'Total usuarios: %', v_total_users;
    RAISE NOTICE 'Usuarios sin escuela: %', v_users_without_school;

    -- Actualizar TODOS los usuarios sin escuela asignada
    UPDATE auth_management.profiles
    SET
        school_id = v_default_school_id,
        updated_at = gamilit.now_mexico()
    WHERE school_id IS NULL;

    GET DIAGNOSTICS v_affected_count = ROW_COUNT;

    -- Reportar resultados
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ASIGNACIÓN DE ESCUELA A USUARIOS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Escuela default ID: %', v_default_school_id;
    RAISE NOTICE 'Usuarios actualizados: %', v_affected_count;
    RAISE NOTICE '========================================';

    IF v_affected_count > 0 THEN
        RAISE NOTICE 'Usuarios ahora tienen escuela asignada por rol:';

        -- Mostrar conteo por rol
        FOR rec IN
            SELECT role, COUNT(*) as count
            FROM auth_management.profiles
            WHERE school_id = v_default_school_id
            GROUP BY role
            ORDER BY role
        LOOP
            RAISE NOTICE '  - %: % usuarios', rec.role, rec.count;
        END LOOP;
    ELSE
        RAISE NOTICE 'No hay usuarios sin escuela asignada (todos ya tienen school_id)';
    END IF;

END $$;

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
    v_users_without_school INTEGER;
    v_total_in_default INTEGER;
    rec RECORD;
BEGIN
    SELECT COUNT(*) INTO v_users_without_school
    FROM auth_management.profiles
    WHERE school_id IS NULL;

    SELECT COUNT(*) INTO v_total_in_default
    FROM auth_management.profiles p
    JOIN social_features.schools s ON p.school_id = s.id
    WHERE s.code = 'SYSTEM-UNASSIGNED';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICACIÓN DE ASIGNACIÓN DE ESCUELAS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Usuarios sin escuela: %', v_users_without_school;
    RAISE NOTICE 'Usuarios en escuela default: %', v_total_in_default;
    RAISE NOTICE '========================================';

    IF v_users_without_school = 0 THEN
        RAISE NOTICE '✓ Todos los usuarios tienen escuela asignada';

        -- Mostrar distribución por rol
        RAISE NOTICE '';
        RAISE NOTICE 'Distribución por rol en escuela default:';
        FOR rec IN
            SELECT p.role, COUNT(*) as count
            FROM auth_management.profiles p
            JOIN social_features.schools s ON p.school_id = s.id
            WHERE s.code = 'SYSTEM-UNASSIGNED'
            GROUP BY p.role
            ORDER BY p.role
        LOOP
            RAISE NOTICE '  - %: %', rec.role, rec.count;
        END LOOP;
    ELSE
        RAISE WARNING '⚠ ADVERTENCIA: Hay % usuarios sin escuela asignada', v_users_without_school;
    END IF;
END $$;
