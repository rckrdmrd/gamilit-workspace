-- =====================================================================================
-- SEED: Teacher Notes for Progress Tracking Schema
-- =====================================================================================
-- Description: Teacher observations and notes about demo students
-- Dependencies: auth_management.profiles (teachers and students)
-- Idempotency: Uses DELETE + INSERT pattern with dynamic lookups
-- FIX AUDIT-D3-Q01: Fixed FK mismatch — student lookups now use profiles JOIN (not auth.users)
-- FIX AUDIT-D3-Q02: Fixed self-referential DELETE bug (renamed var to v_teacher_id)
-- =====================================================================================

SET search_path TO progress_tracking, auth_management, auth, public;

-- =====================================================================================
-- TEACHER NOTES
-- =====================================================================================

DO $$
DECLARE
    v_teacher_id UUID;
    v_student1_id UUID;
    v_student2_id UUID;
    v_student3_id UUID;
BEGIN
    -- Get teacher profile ID
    SELECT p.id INTO v_teacher_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE p.role = 'admin_teacher'
    LIMIT 1;

    -- FIX AUDIT-D3-Q01: Get student PROFILE IDs (not auth.users IDs)
    -- teacher_notes.student_id FK references auth_management.profiles(id)
    SELECT p.id INTO v_student1_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'estudiante1@demo.glit.edu.mx';

    SELECT p.id INTO v_student2_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'estudiante2@demo.glit.edu.mx';

    SELECT p.id INTO v_student3_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'estudiante3@demo.glit.edu.mx';

    IF v_teacher_id IS NULL OR v_student1_id IS NULL THEN
        RAISE NOTICE 'Required profiles not found. Skipping teacher notes seed.';
        RETURN;
    END IF;

    RAISE NOTICE 'Creating teacher notes...';

    -- FIX AUDIT-D3-Q02: Use v_teacher_id variable (not column name teacher_id)
    DELETE FROM progress_tracking.teacher_notes
    WHERE teacher_id = v_teacher_id
      AND student_id IN (v_student1_id, v_student2_id, v_student3_id);

    INSERT INTO progress_tracking.teacher_notes (
        teacher_id, student_id, note, is_private, created_at
    ) VALUES
    -- ================================================================================
    -- STUDENT 1: Advanced Student - Positive observations
    -- ================================================================================
    (
        v_teacher_id, v_student1_id,
        'Excelente progreso en comprension lectora. Demuestra gran capacidad de analisis critico y ha completado todos los ejercicios con puntajes superiores al 90%. Candidato para actividades de liderazgo entre pares.',
        true,
        NOW() - INTERVAL '5 days'
    ),
    (
        v_teacher_id, v_student1_id,
        'Nota para reunion con padres: Felicitar por el rendimiento excepcional. Sugerir material de lectura avanzado para mantener la motivacion.',
        false, -- visible for parents
        NOW() - INTERVAL '2 days'
    ),

    -- ================================================================================
    -- STUDENT 2: Intermediate Student - Mixed observations
    -- ================================================================================
    (
        v_teacher_id, v_student2_id,
        'Buen avance general. Necesita reforzar habilidades de inferencia. Se recomienda ejercicios adicionales en el modulo 2 antes de avanzar al modulo 3.',
        true,
        NOW() - INTERVAL '8 days'
    ),
    (
        v_teacher_id, v_student2_id,
        'Mejora notable en los ultimos 3 dias. La estrategia de lectura guiada esta funcionando bien.',
        true,
        NOW() - INTERVAL '3 days'
    ),

    -- ================================================================================
    -- STUDENT 3: Foundational Student - Support needed
    -- ================================================================================
    (
        v_teacher_id, v_student3_id,
        'ATENCION: Estudiante requiere apoyo adicional. Muestra dificultades con vocabulario cientifico y comprension de textos largos. Programar sesion de tutoria individual.',
        true,
        NOW() - INTERVAL '10 days'
    ),
    (
        v_teacher_id, v_student3_id,
        'Seguimiento: Se implemento estrategia de apoyo con imagenes y resumen previo. Hay mejora leve pero aun necesita atencion.',
        true,
        NOW() - INTERVAL '4 days'
    ),
    (
        v_teacher_id, v_student3_id,
        'Se contacto a padres. Acordamos sesiones de lectura en casa de 15 minutos diarios.',
        false, -- visible for parents
        NOW() - INTERVAL '1 day'
    );

    RAISE NOTICE 'Teacher notes created successfully';
    RAISE NOTICE '  - Total notes: 7';
    RAISE NOTICE '  - Private notes: 5';
    RAISE NOTICE '  - Parent-visible notes: 2';

END $$;
