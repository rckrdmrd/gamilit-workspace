-- =====================================================
-- Seed: social_features.classrooms (PROD)
-- Description: Aulas demo para testing y demostraciones
-- Environment: PRODUCTION
-- Dependencies: social_features.schools, auth_management.profiles
-- Order: 02
-- Created: 2025-01-11
-- Version: 1.0
-- =====================================================
--
-- AULAS DEMO INCLUIDAS:
-- - 5to A (Escuela Marie Curie, Profesor 1)
-- - 5to B (Escuela Marie Curie, Profesor 2)
-- - 6to A (Escuela Marie Curie, Profesor 1)
-- - Aula de Pruebas (IEI, Director)
-- - Aula Demo Parent Portal (IEI, Profesor 2)
--
-- TOTAL: 5 aulas demo
--
-- IMPORTANTE: Estas aulas están asociadas a las escuelas y profesores demo.
-- =====================================================

SET search_path TO social_features, auth_management, public;

-- =====================================================
-- INSERT: Aulas Demo
-- =====================================================

INSERT INTO social_features.classrooms (
    id,
    school_id,
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
    status,
    is_active,
    settings,
    metadata,
    created_at,
    updated_at
) VALUES

-- =====================================================
-- Aula 1: 5to A - Escuela Marie Curie (Profesor 1)
-- =====================================================
(
    '60000000-0000-0000-0000-000000000001'::uuid,
    '50000000-0000-0000-0000-000000000001'::uuid,  -- Escuela Marie Curie
    '10ac4f00-092e-4297-b909-2e179c49b15e'::uuid,  -- Profesor 1
    '5to A - Comprensión Lectora',
    '5A-COMP-2025',
    '5',
    'A',
    'Comprensión Lectora',
    'Grupo de 5to grado, sección A. Enfoque en comprensión literal e inferencial.',
    35,
    2,  -- 2 estudiantes inicialmente
    '2025-08-15'::date,
    '2026-07-15'::date,
    jsonb_build_object(
        'days', jsonb_build_array('Lunes', 'Miércoles', 'Viernes'),
        'time', '08:00-09:30',
        'room', 'Aula 501',
        'weekly_hours', 4.5
    ),
    'active',
    true,
    jsonb_build_object(
        'allow_student_self_enrollment', false,
        'enable_gamification', true,
        'require_parental_consent', true,
        'grading_system', 'numerical',
        'attendance_required', true,
        'homework_policy', jsonb_build_object(
            'frequency', 'weekly',
            'submission_platform', 'gamilit',
            'late_penalty', 10
        )
    ),
    jsonb_build_object(
        'academic_year', '2025-2026',
        'demo_classroom', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- =====================================================
-- Aula 2: 5to B - Escuela Marie Curie (Profesor 2)
-- =====================================================
(
    '60000000-0000-0000-0000-000000000002'::uuid,
    '50000000-0000-0000-0000-000000000001'::uuid,  -- Escuela Marie Curie
    '11bc5f00-192e-5397-c919-3f279d49c26f'::uuid,  -- Profesor 2
    '5to B - Lectura Digital',
    '5B-DIGI-2025',
    '5',
    'B',
    'Lectura Digital',
    'Grupo de 5to grado, sección B. Especialización en alfabetización digital y fact-checking.',
    35,
    2,  -- 2 estudiantes inicialmente
    '2025-08-15'::date,
    '2026-07-15'::date,
    jsonb_build_object(
        'days', jsonb_build_array('Martes', 'Jueves'),
        'time', '10:00-11:30',
        'room', 'Laboratorio de Cómputo',
        'weekly_hours', 3
    ),
    'active',
    true,
    jsonb_build_object(
        'allow_student_self_enrollment', false,
        'enable_gamification', true,
        'require_parental_consent', true,
        'grading_system', 'numerical',
        'attendance_required', true,
        'digital_tools', jsonb_build_object(
            'requires_tablet', true,
            'internet_required', true
        )
    ),
    jsonb_build_object(
        'academic_year', '2025-2026',
        'demo_classroom', true,
        'focus', 'digital_literacy'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- =====================================================
-- Aula 3: 6to A - Escuela Marie Curie (Profesor 1)
-- =====================================================
(
    '60000000-0000-0000-0000-000000000003'::uuid,
    '50000000-0000-0000-0000-000000000001'::uuid,  -- Escuela Marie Curie
    '10ac4f00-092e-4297-b909-2e179c49b15e'::uuid,  -- Profesor 1
    '6to A - Producción de Textos',
    '6A-PROD-2025',
    '6',
    'A',
    'Producción de Textos',
    'Grupo de 6to grado, sección A. Enfoque en redacción y producción escrita.',
    35,
    1,  -- 1 estudiante inicialmente
    '2025-08-15'::date,
    '2026-07-15'::date,
    jsonb_build_object(
        'days', jsonb_build_array('Lunes', 'Miércoles', 'Viernes'),
        'time', '14:00-15:30',
        'room', 'Aula 601',
        'weekly_hours', 4.5
    ),
    'active',
    true,
    jsonb_build_object(
        'allow_student_self_enrollment', false,
        'enable_gamification', true,
        'require_parental_consent', true,
        'grading_system', 'rubrics',
        'attendance_required', true,
        'peer_review_enabled', true
    ),
    jsonb_build_object(
        'academic_year', '2025-2026',
        'demo_classroom', true,
        'focus', 'writing_skills'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- =====================================================
-- Aula 4: Aula de Pruebas - IEI (Director)
-- =====================================================
(
    '60000000-0000-0000-0000-000000000004'::uuid,
    '50000000-0000-0000-0000-000000000002'::uuid,  -- IEI
    '21bc5f00-102e-5307-c829-3f289d49c36f'::uuid,  -- Director
    'Aula de Pruebas - Testing',
    'TEST-2025',
    'MIXED',
    'X',
    'Testing Multi-grado',
    'Aula de pruebas para testing y validación de funcionalidades.',
    40,
    0,  -- Sin estudiantes inicialmente
    '2025-01-11'::date,
    '2025-12-31'::date,
    jsonb_build_object(
        'days', jsonb_build_array('Lunes'),
        'time', '16:00-17:00',
        'room', 'Sala de Innovación',
        'weekly_hours', 1
    ),
    'active',
    true,
    jsonb_build_object(
        'allow_student_self_enrollment', true,
        'enable_gamification', true,
        'require_parental_consent', false,
        'grading_system', 'pass_fail',
        'attendance_required', false,
        'testing_mode', true
    ),
    jsonb_build_object(
        'academic_year', '2025',
        'demo_classroom', true,
        'purpose', 'testing_and_qa'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- =====================================================
-- Aula 5: Aula Demo Parent Portal - IEI (Profesor 2)
-- =====================================================
(
    '60000000-0000-0000-0000-000000000005'::uuid,
    '50000000-0000-0000-0000-000000000002'::uuid,  -- IEI
    '11bc5f00-192e-5397-c919-3f279d49c26f'::uuid,  -- Profesor 2
    'Aula Demo Parent Portal',
    'PARENT-DEMO-2025',
    '5',
    'P',
    'Comprensión Lectora',
    'Aula demo especial para demostración del portal de padres.',
    30,
    0,  -- Sin estudiantes inicialmente
    '2025-08-15'::date,
    '2026-07-15'::date,
    jsonb_build_object(
        'days', jsonb_build_array('Martes', 'Jueves'),
        'time', '09:00-10:30',
        'room', 'Aula 102',
        'weekly_hours', 3
    ),
    'active',
    true,
    jsonb_build_object(
        'allow_student_self_enrollment', false,
        'enable_gamification', true,
        'require_parental_consent', true,
        'grading_system', 'numerical',
        'attendance_required', true,
        'parent_portal', jsonb_build_object(
            'daily_reports', true,
            'weekly_summaries', true,
            'real_time_notifications', true,
            'message_teacher', true
        )
    ),
    jsonb_build_object(
        'academic_year', '2025-2026',
        'demo_classroom', true,
        'purpose', 'parent_portal_demo',
        'showcase_features', jsonb_build_array(
            'daily_progress',
            'assignments',
            'grades',
            'attendance',
            'behavior_notes'
        )
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
)

ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    teacher_id = EXCLUDED.teacher_id,
    description = EXCLUDED.description,
    capacity = EXCLUDED.capacity,
    current_students_count = EXCLUDED.current_students_count,
    schedule = EXCLUDED.schedule,
    status = EXCLUDED.status,
    is_active = EXCLUDED.is_active,
    settings = EXCLUDED.settings,
    metadata = EXCLUDED.metadata,
    updated_at = gamilit.now_mexico();

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
    classroom_count INTEGER;
    marie_curie_count INTEGER;
    iei_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO classroom_count
    FROM social_features.classrooms
    WHERE metadata->>'demo_classroom' = 'true';

    SELECT COUNT(*) INTO marie_curie_count
    FROM social_features.classrooms
    WHERE school_id = '50000000-0000-0000-0000-000000000001'::uuid
      AND metadata->>'demo_classroom' = 'true';

    SELECT COUNT(*) INTO iei_count
    FROM social_features.classrooms
    WHERE school_id = '50000000-0000-0000-0000-000000000002'::uuid
      AND metadata->>'demo_classroom' = 'true';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'AULAS DEMO CREADAS EXITOSAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total aulas: %', classroom_count;
    RAISE NOTICE '  - Marie Curie: %', marie_curie_count;
    RAISE NOTICE '  - IEI: %', iei_count;
    RAISE NOTICE '========================================';

    IF classroom_count = 5 THEN
        RAISE NOTICE '✓ Todas las aulas demo fueron creadas correctamente';
    ELSE
        RAISE WARNING '⚠ Se esperaban 5 aulas, se crearon %', classroom_count;
    END IF;
END $$;

-- =====================================================
-- Listado de aulas
-- =====================================================

DO $$
DECLARE
    classroom_record RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Listado de aulas demo:';
    RAISE NOTICE '========================================';

    FOR classroom_record IN
        SELECT
            c.name,
            c.code,
            s.name as school_name,
            p.display_name as teacher_name,
            c.current_students_count
        FROM social_features.classrooms c
        JOIN social_features.schools s ON s.id = c.school_id
        JOIN auth_management.profiles p ON p.id = c.teacher_id
        WHERE c.metadata->>'demo_classroom' = 'true'
        ORDER BY c.created_at
    LOOP
        RAISE NOTICE '  - % (%)',
            classroom_record.name,
            classroom_record.code;
        RAISE NOTICE '    Escuela: %', classroom_record.school_name;
        RAISE NOTICE '    Profesor: %', classroom_record.teacher_name;
        RAISE NOTICE '    Estudiantes: %', classroom_record.current_students_count;
        RAISE NOTICE '';
    END LOOP;

    RAISE NOTICE '========================================';
END $$;
