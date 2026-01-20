-- =====================================================================================
-- SEED: Teacher Notes for Progress Tracking Schema
-- =====================================================================================
-- Description: Teacher observations and notes about demo students
-- Dependencies: auth_management.profiles (teachers and students)
-- Idempotency: Uses INSERT with specific IDs to handle re-runs
-- =====================================================================================

SET search_path TO progress_tracking, auth_management, auth, public;

-- =====================================================================================
-- TEACHER NOTES
-- =====================================================================================

DO $$
DECLARE
    teacher_id UUID;
    student1_id UUID;
    student2_id UUID;
    student3_id UUID;
BEGIN
    -- Get teacher ID
    SELECT id INTO teacher_id
    FROM auth_management.profiles
    WHERE role = 'admin_teacher'
    LIMIT 1;

    -- Get demo student IDs
    SELECT id INTO student1_id
    FROM auth.users
    WHERE email = 'estudiante1@demo.glit.edu.mx';

    SELECT id INTO student2_id
    FROM auth.users
    WHERE email = 'estudiante2@demo.glit.edu.mx';

    SELECT id INTO student3_id
    FROM auth.users
    WHERE email = 'estudiante3@demo.glit.edu.mx';

    IF teacher_id IS NULL OR student1_id IS NULL THEN
        RAISE NOTICE 'Required profiles not found. Skipping teacher notes seed.';
        RETURN;
    END IF;

    RAISE NOTICE 'Creating teacher notes...';

    -- Delete existing demo notes to allow re-runs
    DELETE FROM progress_tracking.teacher_notes
    WHERE teacher_id = teacher_id
      AND student_id IN (student1_id, student2_id, student3_id);

    INSERT INTO progress_tracking.teacher_notes (
        teacher_id, student_id, note, is_private, created_at
    ) VALUES
    -- ================================================================================
    -- STUDENT 1: Advanced Student - Positive observations
    -- ================================================================================
    (
        teacher_id, student1_id,
        'Excelente progreso en comprension lectora. Demuestra gran capacidad de analisis critico y ha completado todos los ejercicios con puntajes superiores al 90%. Candidato para actividades de liderazgo entre pares.',
        true,
        NOW() - INTERVAL '5 days'
    ),
    (
        teacher_id, student1_id,
        'Nota para reunion con padres: Felicitar por el rendimiento excepcional. Sugerir material de lectura avanzado para mantener la motivacion.',
        false, -- visible for parents
        NOW() - INTERVAL '2 days'
    ),

    -- ================================================================================
    -- STUDENT 2: Intermediate Student - Mixed observations
    -- ================================================================================
    (
        teacher_id, student2_id,
        'Buen avance general. Necesita reforzar habilidades de inferencia. Se recomienda ejercicios adicionales en el modulo 2 antes de avanzar al modulo 3.',
        true,
        NOW() - INTERVAL '8 days'
    ),
    (
        teacher_id, student2_id,
        'Mejora notable en los ultimos 3 dias. La estrategia de lectura guiada esta funcionando bien.',
        true,
        NOW() - INTERVAL '3 days'
    ),

    -- ================================================================================
    -- STUDENT 3: Foundational Student - Support needed
    -- ================================================================================
    (
        teacher_id, student3_id,
        'ATENCION: Estudiante requiere apoyo adicional. Muestra dificultades con vocabulario cientifico y comprension de textos largos. Programar sesion de tutoria individual.',
        true,
        NOW() - INTERVAL '10 days'
    ),
    (
        teacher_id, student3_id,
        'Seguimiento: Se implemento estrategia de apoyo con imagenes y resumen previo. Hay mejora leve pero aun necesita atencion.',
        true,
        NOW() - INTERVAL '4 days'
    ),
    (
        teacher_id, student3_id,
        'Se contacto a padres. Acordamos sesiones de lectura en casa de 15 minutos diarios.',
        false, -- visible for parents
        NOW() - INTERVAL '1 day'
    );

    RAISE NOTICE 'Teacher notes created successfully';
    RAISE NOTICE '  - Total notes: 7';
    RAISE NOTICE '  - Private notes: 5';
    RAISE NOTICE '  - Parent-visible notes: 2';

END $$;
