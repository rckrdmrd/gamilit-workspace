-- =====================================================
-- Seed: social_features.classroom_members (DEV)
-- Description: Asignar TODOS los estudiantes al classroom DEFAULT
-- Environment: DEVELOPMENT
-- Dependencies: social_features.classrooms (02-classrooms.sql), auth_management.profiles
-- Order: 03
-- Created: 2025-01-11
-- Updated: 2025-12-15 - Simplificado a solo DEFAULT
-- Version: 3.0
-- =====================================================
--
-- DECISIÓN DE DISEÑO:
-- - Todos los estudiantes se asignan automáticamente al classroom DEFAULT
-- - El admin/teacher puede reasignarlos a otros classrooms desde la UI
-- - Esto facilita la gestión inicial de usuarios nuevos
--
-- ASOCIACIONES DEMO REMOVIDAS (v3.0):
-- - Todas las asociaciones específicas - REMOVIDAS
--
-- =====================================================

SET search_path TO social_features, auth_management, public;

-- =====================================================
-- Asignar TODOS los estudiantes al classroom DEFAULT
-- =====================================================

DO $$
DECLARE
    v_default_classroom_id UUID;
    v_student_count INTEGER;
    v_assigned_count INTEGER;
    rec RECORD;
BEGIN
    -- Obtener el classroom DEFAULT
    SELECT id INTO v_default_classroom_id
    FROM social_features.classrooms
    WHERE code = 'DEFAULT' AND is_active = true
    LIMIT 1;

    IF v_default_classroom_id IS NULL THEN
        RAISE EXCEPTION 'Classroom DEFAULT no encontrado. Ejecutar primero 02-classrooms.sql';
    END IF;

    RAISE NOTICE 'Usando classroom DEFAULT: %', v_default_classroom_id;

    -- Contar estudiantes existentes
    SELECT COUNT(*) INTO v_student_count
    FROM auth_management.profiles
    WHERE role = 'student';

    RAISE NOTICE 'Estudiantes encontrados: %', v_student_count;

    -- Asignar cada estudiante al classroom DEFAULT
    INSERT INTO social_features.classroom_members (
        id,
        classroom_id,
        student_id,
        enrollment_date,
        enrollment_method,
        status,
        attendance_percentage,
        metadata,
        created_at,
        updated_at
    )
    SELECT
        gen_random_uuid(),
        v_default_classroom_id,
        p.id,
        gamilit.now_mexico(),
        'admin_add',  -- Valid values: teacher_invite, self_enroll, admin_add, bulk_import
        'active',
        0.00,
        jsonb_build_object(
            'enrollment_type', 'auto',
            'auto_assigned', true,
            'enrolled_by', 'seed_script',
            'assigned_to_default', true,
            'pending_reassignment', true
        ),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    FROM auth_management.profiles p
    WHERE p.role = 'student'
    ON CONFLICT (classroom_id, student_id) DO UPDATE SET
        status = 'active',
        metadata = EXCLUDED.metadata || jsonb_build_object('updated_by_seed', true),
        updated_at = gamilit.now_mexico();

    GET DIAGNOSTICS v_assigned_count = ROW_COUNT;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'ASIGNACIÓN DE ESTUDIANTES A DEFAULT';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Classroom DEFAULT ID: %', v_default_classroom_id;
    RAISE NOTICE 'Estudiantes asignados: %', v_assigned_count;
    RAISE NOTICE '========================================';

END $$;

-- =====================================================
-- Actualizar current_students_count en classroom DEFAULT
-- =====================================================

UPDATE social_features.classrooms
SET current_students_count = (
    SELECT COUNT(*)
    FROM social_features.classroom_members
    WHERE classroom_id = classrooms.id
      AND status = 'active'
)
WHERE code = 'DEFAULT';

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
    member_count INTEGER;
    default_count INTEGER;
    classroom_students INTEGER;
BEGIN
    -- Total membresías
    SELECT COUNT(*) INTO member_count
    FROM social_features.classroom_members;

    -- Membresías en classroom DEFAULT
    SELECT COUNT(*) INTO default_count
    FROM social_features.classroom_members cm
    JOIN social_features.classrooms c ON c.id = cm.classroom_id
    WHERE c.code = 'DEFAULT';

    -- Count en el classroom
    SELECT current_students_count INTO classroom_students
    FROM social_features.classrooms
    WHERE code = 'DEFAULT';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICACIÓN DE CLASSROOM_MEMBERS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total membresías: %', member_count;
    RAISE NOTICE 'Estudiantes en DEFAULT: %', default_count;
    RAISE NOTICE 'current_students_count: %', classroom_students;
    RAISE NOTICE '========================================';

    IF default_count = member_count THEN
        RAISE NOTICE '✓ Todos los estudiantes están en el classroom DEFAULT';
        RAISE NOTICE '  El admin puede reasignarlos desde la UI';
    ELSE
        RAISE WARNING '⚠ Hay membresías en otros classrooms';
    END IF;
END $$;

-- =====================================================
-- Listado de estudiantes asignados
-- =====================================================

DO $$
DECLARE
    member_record RECORD;
    total_students INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Estudiantes asignados al classroom DEFAULT:';
    RAISE NOTICE '========================================';

    FOR member_record IN
        SELECT
            p.display_name,
            p.email,
            cm.enrollment_date,
            cm.status
        FROM social_features.classroom_members cm
        JOIN auth_management.profiles p ON p.id = cm.student_id
        JOIN social_features.classrooms c ON c.id = cm.classroom_id
        WHERE c.code = 'DEFAULT'
        ORDER BY p.display_name
        LIMIT 20  -- Limitar output para no saturar
    LOOP
        RAISE NOTICE '  - % <%> [%]',
            member_record.display_name,
            member_record.email,
            member_record.status;
        total_students := total_students + 1;
    END LOOP;

    IF total_students = 0 THEN
        RAISE NOTICE '  (No hay estudiantes asignados aún)';
    ELSIF total_students = 20 THEN
        RAISE NOTICE '  ... (mostrando primeros 20)';
    END IF;

    RAISE NOTICE '========================================';
END $$;
