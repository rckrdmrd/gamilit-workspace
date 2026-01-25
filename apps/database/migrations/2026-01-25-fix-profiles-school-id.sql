-- =====================================================
-- Migration: 2026-01-25-fix-profiles-school-id.sql
-- Description: Corrige usuarios existentes sin school_id asignado
-- Issue: 48 usuarios con school_id = NULL cuando deberían estar en GAMILIT-DEFAULT
-- Author: Claude Code
-- Date: 2026-01-25
-- =====================================================

-- Paso 1: Verificar estado actual ANTES de la corrección
DO $$
DECLARE
    v_count_null INTEGER;
    v_count_total INTEGER;
    v_default_school_id UUID;
BEGIN
    -- Contar usuarios sin school_id
    SELECT COUNT(*) INTO v_count_null
    FROM auth_management.profiles
    WHERE school_id IS NULL;

    SELECT COUNT(*) INTO v_count_total
    FROM auth_management.profiles;

    RAISE NOTICE '=== PRE-MIGRATION STATUS ===';
    RAISE NOTICE 'Total usuarios: %', v_count_total;
    RAISE NOTICE 'Usuarios sin school_id: %', v_count_null;

    -- Obtener la escuela default
    SELECT id INTO v_default_school_id
    FROM social_features.schools
    WHERE code = 'GAMILIT-DEFAULT'
      AND is_active = true
    LIMIT 1;

    IF v_default_school_id IS NULL THEN
        RAISE EXCEPTION 'ERROR: No se encontró la escuela GAMILIT-DEFAULT. Ejecute primero los seeds de social_features.';
    END IF;

    RAISE NOTICE 'Escuela default encontrada: % (GAMILIT-DEFAULT)', v_default_school_id;
END $$;

-- Paso 2: Ejecutar la corrección
UPDATE auth_management.profiles
SET
    school_id = '99999999-9999-9999-9999-999999999999',
    updated_at = NOW(),
    metadata = metadata || jsonb_build_object(
        'school_id_fix', jsonb_build_object(
            'fixed_at', NOW()::text,
            'migration', '2026-01-25-fix-profiles-school-id',
            'previous_value', 'NULL'
        )
    )
WHERE school_id IS NULL;

-- Paso 3: Verificar estado DESPUÉS de la corrección
DO $$
DECLARE
    v_count_null INTEGER;
    v_count_assigned INTEGER;
    v_count_total INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count_null
    FROM auth_management.profiles
    WHERE school_id IS NULL;

    SELECT COUNT(*) INTO v_count_assigned
    FROM auth_management.profiles
    WHERE school_id = '99999999-9999-9999-9999-999999999999';

    SELECT COUNT(*) INTO v_count_total
    FROM auth_management.profiles;

    RAISE NOTICE '=== POST-MIGRATION STATUS ===';
    RAISE NOTICE 'Total usuarios: %', v_count_total;
    RAISE NOTICE 'Usuarios sin school_id: % (esperado: 0)', v_count_null;
    RAISE NOTICE 'Usuarios asignados a GAMILIT-DEFAULT: %', v_count_assigned;

    IF v_count_null > 0 THEN
        RAISE WARNING 'ADVERTENCIA: Aún hay % usuarios sin school_id', v_count_null;
    ELSE
        RAISE NOTICE 'SUCCESS: Todos los usuarios tienen school_id asignado';
    END IF;
END $$;

-- Paso 4: Mostrar resumen por rol
SELECT
    role,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE school_id IS NOT NULL) as con_school,
    COUNT(*) FILTER (WHERE school_id IS NULL) as sin_school
FROM auth_management.profiles
GROUP BY role
ORDER BY total DESC;
