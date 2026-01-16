-- =====================================================
-- Seed: social_features.classrooms (DEV)
-- Description: Aula general única de GAMILIT
-- Environment: ALL
-- Dependencies: social_features.schools (00-schools-default.sql), auth_management.profiles
-- Order: 02
-- Created: 2025-01-11
-- Updated: 2026-01-08 - Renombrado a GAMILIT Aula General
-- Version: 4.0
-- =====================================================
--
-- AULAS INCLUIDAS:
-- - GAMILIT - Aula General (code: DEFAULT) - Única aula del sistema
--
-- TOTAL: 1 aula
--
-- DECISIÓN DE DISEÑO (2026-01-08):
-- - Solo existe UN aula general donde todos los estudiantes son asignados
-- - El código 'DEFAULT' se mantiene para compatibilidad con trigger
-- - Todas las aulas adicionales serán creadas por el admin desde la UI
-- - Los estudiantes nuevos se asignan automáticamente aquí
--
-- =====================================================

SET search_path TO social_features, auth_management, public;

-- =====================================================
-- Obtener tenant_id y validar dependencias
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_default_school_id UUID;
    v_teacher_id UUID;
BEGIN
    -- Obtener el tenant principal
    SELECT id INTO v_tenant_id
    FROM auth_management.tenants
    WHERE name = 'GAMILIT Platform'
    LIMIT 1;

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Tenant "GAMILIT Platform" no encontrado. Ejecutar primero seed de tenants.';
    END IF;

    -- Obtener la escuela/institución principal
    SELECT id INTO v_default_school_id
    FROM social_features.schools
    WHERE (code = 'GAMILIT-DEFAULT' OR code = 'SYSTEM-UNASSIGNED') AND is_active = true
    LIMIT 1;

    IF v_default_school_id IS NULL THEN
        RAISE EXCEPTION 'Institución principal no encontrada. Ejecutar primero 00-schools-default.sql';
    END IF;

    -- Obtener el teacher default (teacher@gamilit.com)
    SELECT id INTO v_teacher_id
    FROM auth_management.profiles
    WHERE email = 'teacher@gamilit.com'
    LIMIT 1;

    IF v_teacher_id IS NULL THEN
        -- Usar el UUID conocido como fallback
        v_teacher_id := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid;
        RAISE WARNING 'Teacher default no encontrado, usando UUID: %', v_teacher_id;
    END IF;

    RAISE NOTICE 'Usando tenant_id: %', v_tenant_id;
    RAISE NOTICE 'Usando school_id (default): %', v_default_school_id;
    RAISE NOTICE 'Usando teacher_id: %', v_teacher_id;

-- =====================================================
-- INSERT: SOLO Classroom DEFAULT
-- =====================================================

INSERT INTO social_features.classrooms (
    id,
    school_id,
    tenant_id,
    teacher_id,
    name,
    code,
    grade_level,
    section,
    subject,
    description,
    capacity,
    current_students_count,
    start_date,
    end_date,
    schedule,
    is_active,
    settings,
    metadata,
    created_at,
    updated_at
) VALUES
-- =====================================================
-- CLASSROOM DEFAULT (GAMILIT - Aula General)
-- IMPORTANTE: Este classroom es usado automáticamente para
-- asignar a TODOS los estudiantes nuevos registrados.
-- =====================================================
(
    '00000000-0000-0000-0000-000000000001'::uuid,  -- UUID predecible para default
    v_default_school_id,                            -- GAMILIT - Institución General
    v_tenant_id,
    v_teacher_id,                                   -- Teacher default (teacher@gamilit.com)
    'GAMILIT - Aula General',
    'DEFAULT',  -- Código mantenido para compatibilidad con trigger
    'todos',  -- Todos los niveles
    'GENERAL',
    'General',
    'Aula general de GAMILIT. Todos los estudiantes registrados son asignados automáticamente a esta aula. Los administradores pueden crear aulas adicionales desde el panel.',
    999,  -- Capacidad alta para no limitar
    0,
    '2025-01-01'::date,
    '2099-12-31'::date,  -- Sin fecha de fin
    jsonb_build_object(
        'days', jsonb_build_array('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'),
        'time', 'flexible',
        'room', 'Virtual',
        'weekly_hours', 0
    ),
    true,
    jsonb_build_object(
        'allow_student_self_enrollment', false,
        'enable_gamification', true,
        'require_parental_consent', false,
        'grading_system', 'none',
        'attendance_required', false,
        'is_system_classroom', true
    ),
    jsonb_build_object(
        'is_default', true,
        'is_primary', true,
        'system_classroom', true,
        'auto_assignment', true,
        'description', 'Aula general de GAMILIT para todos los estudiantes',
        'version', '4.0'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
)
ON CONFLICT (code) DO UPDATE SET
    school_id = EXCLUDED.school_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    capacity = EXCLUDED.capacity,
    is_active = EXCLUDED.is_active,
    settings = EXCLUDED.settings,
    metadata = EXCLUDED.metadata,
    updated_at = gamilit.now_mexico();

END $$;

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
    classroom_count INTEGER;
    default_classroom_exists BOOLEAN;
    default_classroom RECORD;
BEGIN
    SELECT COUNT(*) INTO classroom_count
    FROM social_features.classrooms;

    SELECT EXISTS(
        SELECT 1 FROM social_features.classrooms
        WHERE code = 'DEFAULT' AND is_active = true
    ) INTO default_classroom_exists;

    SELECT c.id, c.name, c.code, s.name as school_name
    INTO default_classroom
    FROM social_features.classrooms c
    JOIN social_features.schools s ON c.school_id = s.id
    WHERE c.code = 'DEFAULT';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICACIÓN DE CLASSROOMS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total classrooms: %', classroom_count;
    RAISE NOTICE 'Classroom default existe: %', default_classroom_exists;

    IF default_classroom_exists THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE 'AULA GENERAL GAMILIT:';
        RAISE NOTICE '  ID: %', default_classroom.id;
        RAISE NOTICE '  Nombre: %', default_classroom.name;
        RAISE NOTICE '  Código: %', default_classroom.code;
        RAISE NOTICE '  Institución: %', default_classroom.school_name;
        RAISE NOTICE '========================================';
        RAISE NOTICE '✓ Aula general configurada correctamente';
        RAISE NOTICE '  Aulas adicionales pueden ser creadas por el admin';
    ELSE
        RAISE WARNING '⚠ Aula general NO encontrada';
    END IF;
END $$;

-- =====================================================
-- SYNC teacher_classrooms (many-to-many)
-- =====================================================
-- Asegurar que el classroom default tiene su entrada en teacher_classrooms
-- =====================================================

INSERT INTO social_features.teacher_classrooms (id, teacher_id, classroom_id, tenant_id, role, assigned_at, created_at)
SELECT
    'cc000001-0000-0000-0000-000000000001'::uuid,  -- UUID estático para classroom DEFAULT (hex válido)
    c.teacher_id,
    c.id,
    c.tenant_id,
    'owner',
    c.created_at,
    NOW()
FROM social_features.classrooms c
WHERE c.teacher_id IS NOT NULL
  AND c.code = 'DEFAULT'
ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    teacher_id = EXCLUDED.teacher_id;

-- Verificar sync
DO $$
DECLARE
    tc_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tc_count
    FROM social_features.teacher_classrooms tc
    JOIN social_features.classrooms c ON tc.classroom_id = c.id
    WHERE c.code = 'DEFAULT';

    RAISE NOTICE '';
    RAISE NOTICE 'teacher_classrooms sincronizados para DEFAULT: %', tc_count;
    RAISE NOTICE '========================================';
END $$;
