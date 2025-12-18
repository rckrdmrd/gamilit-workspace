-- =====================================================
-- Seed: social_features.schools - SCHOOL DEFAULT (PROD)
-- Description: Escuela del sistema para usuarios pendientes de asignación
-- Environment: PRODUCTION
-- Dependencies: auth_management.tenants
-- Order: 00 (debe ejecutarse ANTES de 01-schools.sql)
-- Created: 2025-12-15
-- Version: 1.0
-- =====================================================
--
-- PROPÓSITO:
-- Esta escuela es utilizada por el sistema para:
-- 1. Asignar automáticamente a usuarios admin nuevos
-- 2. Servir como pool de usuarios "por asignar"
-- 3. El classroom DEFAULT apunta a esta escuela
--
-- UUID FIJO: 99999999-9999-9999-9999-999999999999
-- CÓDIGO: SYSTEM-UNASSIGNED
--
-- IMPORTANTE: Esta escuela NO debe eliminarse nunca.
-- =====================================================

SET search_path TO social_features, auth_management, public;

-- =====================================================
-- Obtener tenant_id para la escuela
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    -- Obtener el tenant principal de GAMILIT Platform
    SELECT id INTO v_tenant_id
    FROM auth_management.tenants
    WHERE name = 'GAMILIT Platform'
    LIMIT 1;

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Tenant "GAMILIT Platform" no encontrado. Ejecutar primero seed de tenants.';
    END IF;

    RAISE NOTICE 'Usando tenant_id: %', v_tenant_id;

-- =====================================================
-- INSERT: Escuela Default del Sistema
-- =====================================================

INSERT INTO social_features.schools (
    id,
    tenant_id,
    name,
    code,
    short_name,
    description,
    address,
    city,
    region,
    country,
    postal_code,
    phone,
    email,
    website,
    principal_id,
    administrative_contact_id,
    academic_year,
    semester_system,
    grade_levels,
    settings,
    max_students,
    max_teachers,
    current_students_count,
    current_teachers_count,
    is_active,
    is_verified,
    metadata,
    created_at,
    updated_at
) VALUES (
    '99999999-9999-9999-9999-999999999999'::uuid,  -- UUID fija para sistema
    v_tenant_id,
    'Sistema - Por Asignar',
    'SYSTEM-UNASSIGNED',
    'Sistema',
    'Escuela del sistema para usuarios pendientes de asignación a sus instituciones finales. Los administradores y profesores nuevos se asignan aquí automáticamente.',
    NULL,                                           -- Sin dirección física
    NULL,                                           -- Sin ciudad
    NULL,                                           -- Sin región
    'México',
    NULL,                                           -- Sin código postal
    NULL,                                           -- Sin teléfono
    'sistema@gamilit.com',                          -- Email de sistema
    NULL,                                           -- Sin website
    NULL,                                           -- Sin principal_id
    NULL,                                           -- Sin administrative_contact_id
    '2025',                                         -- Año académico
    false,                                          -- No usa semestres
    ARRAY['todos'],                                 -- Todos los niveles
    jsonb_build_object(
        'is_system', true,
        'is_default', true,
        'auto_assignment', true,
        'allow_reassignment', true,
        'allow_public_registration', false,
        'require_email_verification', false,
        'enable_gamification', true,
        'max_students_per_classroom', 999,
        'description', 'Configuración de sistema - no editar'
    ),
    9999,                                           -- max_students (sin límite efectivo)
    999,                                            -- max_teachers (sin límite efectivo)
    0,                                              -- current_students_count
    0,                                              -- current_teachers_count
    true,                                           -- is_active
    true,                                           -- is_verified (sistema)
    jsonb_build_object(
        'system_school', true,
        'is_default', true,
        'created_by', 'system',
        'purpose', 'Escuela de sistema para asignación pendiente',
        'policies', jsonb_build_object(
            'allow_student_reassignment', true,
            'allow_admin_reassignment', true,
            'require_approval', false,
            'auto_assign_new_admins', true
        ),
        'description', 'Escuela automática del sistema para gestión de usuarios no asignados'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    short_name = EXCLUDED.short_name,
    description = EXCLUDED.description,
    settings = EXCLUDED.settings,
    metadata = EXCLUDED.metadata,
    is_active = true,
    updated_at = gamilit.now_mexico();

END $$;

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
    v_school_id UUID;
    v_school_name TEXT;
BEGIN
    SELECT id, name INTO v_school_id, v_school_name
    FROM social_features.schools
    WHERE code = 'SYSTEM-UNASSIGNED';

    IF v_school_id IS NOT NULL THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE 'ESCUELA DEFAULT DEL SISTEMA CREADA';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'ID: %', v_school_id;
        RAISE NOTICE 'Nombre: %', v_school_name;
        RAISE NOTICE 'Código: SYSTEM-UNASSIGNED';
        RAISE NOTICE '========================================';
    ELSE
        RAISE WARNING 'ERROR: No se pudo crear la escuela default del sistema';
    END IF;
END $$;
