-- =====================================================================================
-- SEED: Learning Paths for Progress Tracking Schema
-- =====================================================================================
-- Description: Predefined learning paths (sequences of modules)
-- Dependencies: auth_management.profiles (teachers)
-- Idempotency: Uses ON CONFLICT to handle re-runs safely
-- =====================================================================================

SET search_path TO progress_tracking, educational_content, auth_management, public;

-- =====================================================================================
-- LEARNING PATHS
-- =====================================================================================

DO $$
DECLARE
    teacher_id UUID;
    v_path1_id UUID := gen_random_uuid();
    v_path2_id UUID := gen_random_uuid();
    v_path3_id UUID := gen_random_uuid();
    v_path4_id UUID := gen_random_uuid();
    v_path5_id UUID := gen_random_uuid();
BEGIN
    -- Get a teacher ID to assign as creator
    SELECT id INTO teacher_id
    FROM auth_management.profiles
    WHERE role = 'admin_teacher'
    LIMIT 1;

    -- Idempotency: If paths already exist, skip insert
    IF EXISTS (SELECT 1 FROM progress_tracking.learning_paths WHERE name = 'Viaje de Lectura para Principiantes' LIMIT 1) THEN
        RAISE NOTICE 'Learning paths already exist, skipping insert';
        RETURN;
    END IF;

    RAISE NOTICE 'Creating learning paths...';

    INSERT INTO progress_tracking.learning_paths (
        id, name, description, is_recommended, difficulty_level,
        estimated_hours, is_active, created_by, created_at, updated_at
    ) VALUES
    -- ================================================================================
    -- Path 1: Beginner Reading Journey (Recommended for new users)
    -- ================================================================================
    (
        v_path1_id,
        'Viaje de Lectura para Principiantes',
        'Ruta de aprendizaje ideal para estudiantes que comienzan su aventura en comprension lectora. Incluye modulos de lectura literal e inferencial.',
        true, -- is_recommended
        'facil',
        10, -- estimated_hours
        true,
        teacher_id,
        NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '30 days'
    ),

    -- ================================================================================
    -- Path 2: Intermediate Reading Mastery
    -- ================================================================================
    (
        v_path2_id,
        'Dominio de Lectura Intermedia',
        'Para estudiantes que ya dominan la lectura literal y buscan mejorar sus habilidades inferenciales y criticas.',
        false,
        'intermedio',
        15,
        true,
        teacher_id,
        NOW() - INTERVAL '25 days',
        NOW() - INTERVAL '25 days'
    ),

    -- ================================================================================
    -- Path 3: Advanced Critical Thinking
    -- ================================================================================
    (
        v_path3_id,
        'Pensamiento Critico Avanzado',
        'Ruta avanzada que incluye analisis critico, produccion de textos y habilidades digitales.',
        false,
        'dificil',
        25,
        true,
        teacher_id,
        NOW() - INTERVAL '20 days',
        NOW() - INTERVAL '20 days'
    ),

    -- ================================================================================
    -- Path 4: Complete Reading Curriculum
    -- ================================================================================
    (
        v_path4_id,
        'Curriculum Completo de Lectura',
        'Ruta completa que cubre todos los modulos desde lectura literal hasta produccion de textos.',
        false,
        'experto',
        40,
        true,
        teacher_id,
        NOW() - INTERVAL '15 days',
        NOW() - INTERVAL '15 days'
    ),

    -- ================================================================================
    -- Path 5: Quick Review Path (for catch-up)
    -- ================================================================================
    (
        v_path5_id,
        'Revision Rapida',
        'Ruta de repaso para estudiantes que necesitan refrescar conocimientos previos.',
        false,
        'intermedio',
        5,
        true,
        teacher_id,
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '10 days'
    )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Learning paths created successfully';
    RAISE NOTICE '  - Total paths: 5';

END $$;
