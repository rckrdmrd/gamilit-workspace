-- =====================================================
-- Seed: social_features.schools - SCHOOL DEFAULT
-- Description: Institución principal única de GAMILIT
-- Environment: ALL
-- Dependencies: auth_management.tenants
-- Order: 00 (debe ejecutarse ANTES de 01-schools.sql)
-- Created: 2025-12-15
-- Updated: 2026-01-08 - Renombrado y simplificado
-- Version: 2.0
-- =====================================================
--
-- PROPÓSITO:
-- Esta es la ÚNICA institución del sistema donde:
-- 1. TODOS los usuarios (demo + registrados) son asignados
-- 2. El classroom default apunta a esta institución
-- 3. Los administradores gestionan usuarios desde aquí
--
-- UUID FIJO: 99999999-9999-9999-9999-999999999999
-- CÓDIGO: GAMILIT-DEFAULT
--
-- IMPORTANTE: Esta institución NO debe eliminarse nunca.
-- =====================================================

SET search_path TO social_features, auth_management, public;

-- =====================================================
-- Obtener tenant_id para la escuela
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    -- Buscar tenant principal (primero por nombre exacto, luego por UUID conocido, luego cualquier Gamilit)
    SELECT id INTO v_tenant_id
    FROM auth_management.tenants
    WHERE name = 'GAMILIT Platform'
       OR id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid
       OR name ILIKE '%Gamilit%'
    ORDER BY
        CASE
            WHEN name = 'GAMILIT Platform' THEN 1
            WHEN id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid THEN 2
            ELSE 3
        END
    LIMIT 1;

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No se encontro ningun tenant Gamilit. Ejecutar primero seed de tenants.';
    END IF;

    RAISE NOTICE 'Usando tenant_id: % (busqueda flexible)', v_tenant_id;

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
    'GAMILIT - Institución General',
    'GAMILIT-DEFAULT',
    'GAMILIT',
    'Institución principal de GAMILIT. Todos los usuarios registrados pertenecen a esta institución. Los administradores pueden crear aulas adicionales desde el panel de administración.',
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
        'is_primary', true,
        'created_by', 'system',
        'purpose', 'Institución principal única de GAMILIT',
        'policies', jsonb_build_object(
            'allow_student_reassignment', true,
            'allow_admin_reassignment', true,
            'require_approval', false,
            'auto_assign_new_users', true
        ),
        'description', 'Institución principal de GAMILIT para todos los usuarios',
        'version', '2.0'
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
    v_school RECORD;
BEGIN
    SELECT id, name, code INTO v_school
    FROM social_features.schools
    WHERE code = 'GAMILIT-DEFAULT';

    IF v_school.id IS NOT NULL THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE 'INSTITUCIÓN PRINCIPAL GAMILIT CREADA';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'ID: %', v_school.id;
        RAISE NOTICE 'Nombre: %', v_school.name;
        RAISE NOTICE 'Código: %', v_school.code;
        RAISE NOTICE '========================================';
    ELSE
        RAISE WARNING 'ERROR: No se pudo crear la institución principal';
    END IF;
END $$;
