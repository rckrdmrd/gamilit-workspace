-- =====================================================
-- Seed: progress_tracking.module_progress (PROD)
-- Description: Progreso de estudiantes demo en módulos
-- Environment: PRODUCTION
-- Dependencies: auth_management.profiles, educational_content.modules
-- Order: 01
-- Created: 2025-01-11
-- Version: 1.0
-- =====================================================
--
-- PROGRESO INCLUIDO:
-- - 5 estudiantes con progreso en diferentes módulos
-- - Módulo 1: 5 estudiantes (diferentes niveles)
-- - Módulo 2: 2 estudiantes (en progreso y completado)
-- - Módulo 3: 1 estudiante (en progreso)
--
-- TOTAL: 8 registros de module_progress
--
-- IMPORTANTE: El progreso está alineado con user_stats.
-- Los números de ejercicios y scores coinciden con las estadísticas globales.
-- =====================================================

SET search_path TO progress_tracking, educational_content, auth_management, public;

-- =====================================================
-- INSERT: Module Progress Demo
-- =====================================================

INSERT INTO progress_tracking.module_progress (
    id,
    user_id,
    module_id,
    status,
    progress_percentage,
    completed_exercises,
    total_exercises,
    skipped_exercises,
    total_score,
    max_possible_score,
    average_score,
    best_score,
    total_xp_earned,
    total_ml_coins_earned,
    time_spent,
    sessions_count,
    attempts_count,
    hints_used_total,
    comodines_used_total,
    comodines_cost_total,
    started_at,
    completed_at,
    last_accessed_at,
    deadline,
    classroom_id,
    assignment_id,
    allow_retry,
    sequential_completion,
    adaptive_difficulty,
    learning_path,
    performance_analytics,
    student_notes,
    teacher_notes,
    system_observations,
    metadata,
    created_at,
    updated_at
) VALUES

-- =====================================================
-- Estudiante 1: Ana García - Módulo 1 en progreso
-- =====================================================
(
    'c0000001-0000-0000-0000-000000000001'::uuid,
    '01ac4f00-082e-4287-b899-2e169c49b05e'::uuid,  -- Ana García
    'modulo-01-comprension-literal'::uuid,
    'in_progress'::progress_tracking.progress_status,
    60,                 -- progress_percentage (60% del módulo)
    15,                 -- completed_exercises
    25,                 -- total_exercises (en el módulo)
    0,                  -- skipped_exercises
    1200,               -- total_score
    1500,               -- max_possible_score
    80.00,              -- average_score
    100,                -- best_score
    1250,               -- total_xp_earned
    300,                -- total_ml_coins_earned
    '03:25:00'::interval,
    12,                 -- sessions_count
    18,                 -- attempts_count (algunos ejercicios reintentados)
    5,                  -- hints_used_total
    2,                  -- comodines_used_total
    40,                 -- comodines_cost_total (20 ML Coins cada uno)
    gamilit.now_mexico() - INTERVAL '12 days',
    NULL,               -- No completado aún
    gamilit.now_mexico() - INTERVAL '2 hours',
    NULL,               -- No deadline
    '60000000-0000-0000-0000-000000000001'::uuid,  -- 5to A
    NULL,
    true,               -- allow_retry
    false,              -- sequential_completion
    true,               -- adaptive_difficulty
    jsonb_build_array(
        jsonb_build_object('exercise_id', 'ex-001', 'completed', true, 'score', 85),
        jsonb_build_object('exercise_id', 'ex-002', 'completed', true, 'score', 90),
        jsonb_build_object('exercise_id', 'ex-003', 'completed', true, 'score', 75)
    ),
    jsonb_build_object(
        'strengths', jsonb_build_array('identificación de detalles', 'comprensión de secuencias'),
        'weaknesses', jsonb_build_array('vocabulario avanzado'),
        'recommended_exercises', jsonb_build_array('ex-vocab-001', 'ex-vocab-002')
    ),
    'Me gustan los textos sobre ciencia y naturaleza',
    NULL,
    jsonb_build_object(
        'learning_pace', 'steady',
        'engagement_level', 'high',
        'completion_prediction', '5 días'
    ),
    jsonb_build_object(
        'demo_progress', true,
        'module_name', 'MÓDULO 1: Comprensión Literal'
    ),
    gamilit.now_mexico() - INTERVAL '12 days',
    gamilit.now_mexico()
),

-- =====================================================
-- Estudiante 2: Carlos Ramírez - Módulo 1 principiante
-- =====================================================
(
    'c0000001-0000-0000-0000-000000000002'::uuid,
    '02bc5f00-182e-5387-c899-3f269d49c06f'::uuid,
    'modulo-01-comprension-literal'::uuid,
    'in_progress'::progress_tracking.progress_status,
    20,                 -- progress_percentage
    5,                  -- completed_exercises
    25,
    1,                  -- skipped_exercises
    350,
    500,
    70.00,
    85,
    250,
    100,
    '01:10:00'::interval,
    5,
    7,
    8,                  -- Usa más hints
    1,
    20,
    gamilit.now_mexico() - INTERVAL '5 days',
    NULL,
    gamilit.now_mexico() - INTERVAL '4 hours',
    NULL,
    '60000000-0000-0000-0000-000000000001'::uuid,  -- 5to A
    NULL,
    true,
    false,
    true,
    jsonb_build_array(
        jsonb_build_object('exercise_id', 'ex-001', 'completed', true, 'score', 70),
        jsonb_build_object('exercise_id', 'ex-002', 'completed', true, 'score', 65)
    ),
    jsonb_build_object(
        'strengths', jsonb_build_array('comprensión básica'),
        'weaknesses', jsonb_build_array('atención a detalles', 'vocabulario'),
        'needs_support', true
    ),
    'Necesito más tiempo para leer',
    'Carlos necesita refuerzo en vocabulario básico',
    jsonb_build_object(
        'learning_pace', 'slow',
        'engagement_level', 'medium',
        'needs_intervention', false
    ),
    jsonb_build_object(
        'demo_progress', true,
        'module_name', 'MÓDULO 1: Comprensión Literal',
        'difficulty_level', 'beginner'
    ),
    gamilit.now_mexico() - INTERVAL '5 days',
    gamilit.now_mexico()
),

-- =====================================================
-- Estudiante 3: María Fernanda - Módulo 1 COMPLETADO
-- =====================================================
(
    'c0000001-0000-0000-0000-000000000003'::uuid,
    '03cd6000-282e-6487-d899-40369e49d070'::uuid,
    'modulo-01-comprension-literal'::uuid,
    'completed'::progress_tracking.progress_status,
    100,                -- progress_percentage (COMPLETADO)
    25,                 -- completed_exercises (todos)
    25,
    0,
    2200,               -- total_score excelente
    2500,
    88.00,
    100,
    2000,
    500,
    '04:00:00'::interval,
    12,
    25,
    2,                  -- Usa pocas hints (es avanzada)
    1,
    20,
    gamilit.now_mexico() - INTERVAL '18 days',
    gamilit.now_mexico() - INTERVAL '10 days',  -- Completado hace 10 días
    gamilit.now_mexico() - INTERVAL '10 days',
    NULL,
    '60000000-0000-0000-0000-000000000002'::uuid,  -- 5to B
    NULL,
    true,
    false,
    true,
    jsonb_build_array(),  -- learning_path completo
    jsonb_build_object(
        'strengths', jsonb_build_array('todas las áreas'),
        'completion_rate', '100%',
        'mastery_level', 'high'
    ),
    'Módulo 1 completado. Listo para Módulo 2',
    'Excelente desempeño. Estudiante destacada',
    jsonb_build_object(
        'learning_pace', 'fast',
        'engagement_level', 'very_high',
        'certificate_earned', true
    ),
    jsonb_build_object(
        'demo_progress', true,
        'module_name', 'MÓDULO 1: Comprensión Literal',
        'completed', true
    ),
    gamilit.now_mexico() - INTERVAL '18 days',
    gamilit.now_mexico() - INTERVAL '10 days'
),

-- =====================================================
-- Estudiante 3: María Fernanda - Módulo 2 en progreso
-- =====================================================
(
    'c0000001-0000-0000-0000-000000000004'::uuid,
    '03cd6000-282e-6487-d899-40369e49d070'::uuid,
    'modulo-02-comprension-inferencial'::uuid,
    'in_progress'::progress_tracking.progress_status,
    40,                 -- progress_percentage
    10,                 -- completed_exercises (de 25)
    25,
    0,
    850,
    1000,
    85.00,
    95,
    800,
    250,
    '02:30:00'::interval,
    8,
    12,
    3,
    2,
    40,
    gamilit.now_mexico() - INTERVAL '10 days',
    NULL,
    gamilit.now_mexico() - INTERVAL '1 hour',
    NULL,
    '60000000-0000-0000-0000-000000000002'::uuid,
    NULL,
    true,
    false,
    true,
    jsonb_build_array(
        jsonb_build_object('exercise_id', 'ex-inf-001', 'completed', true, 'score', 90)
    ),
    jsonb_build_object(
        'strengths', jsonb_build_array('inferencias causales', 'predicciones'),
        'progressing_well', true
    ),
    'Me gusta hacer inferencias sobre los personajes',
    NULL,
    jsonb_build_object(
        'learning_pace', 'fast',
        'engagement_level', 'very_high'
    ),
    jsonb_build_object(
        'demo_progress', true,
        'module_name', 'MÓDULO 2: Comprensión Inferencial'
    ),
    gamilit.now_mexico() - INTERVAL '10 days',
    gamilit.now_mexico()
),

-- =====================================================
-- Estudiante 4: Luis Miguel - Módulo 1 en progreso
-- =====================================================
(
    'c0000001-0000-0000-0000-000000000005'::uuid,
    '04de7000-382e-7587-e899-51469f49e081'::uuid,
    'modulo-01-comprension-literal'::uuid,
    'in_progress'::progress_tracking.progress_status,
    80,                 -- progress_percentage (avanzado)
    20,                 -- completed_exercises
    25,
    0,
    1500,
    2000,
    75.00,
    90,
    1400,
    350,
    '04:00:00'::interval,
    15,
    23,
    6,
    3,
    60,
    gamilit.now_mexico() - INTERVAL '15 days',
    NULL,
    gamilit.now_mexico() - INTERVAL '3 hours',
    NULL,
    '60000000-0000-0000-0000-000000000002'::uuid,  -- 5to B
    NULL,
    true,
    false,
    true,
    jsonb_build_array(),
    jsonb_build_object(
        'strengths', jsonb_build_array('comprensión de secuencias', 'identificación de causas'),
        'near_completion', true
    ),
    'Casi termino el Módulo 1',
    NULL,
    jsonb_build_object(
        'learning_pace', 'steady',
        'engagement_level', 'high',
        'completion_prediction', '2 días'
    ),
    jsonb_build_object(
        'demo_progress', true,
        'module_name', 'MÓDULO 1: Comprensión Literal'
    ),
    gamilit.now_mexico() - INTERVAL '15 days',
    gamilit.now_mexico()
),

-- =====================================================
-- Estudiante 5: Sofía Martínez - Módulo 1 MASTERED
-- =====================================================
(
    'c0000001-0000-0000-0000-000000000006'::uuid,
    '05ef8000-482e-8687-f899-62569049f092'::uuid,
    'modulo-01-comprension-literal'::uuid,
    'mastered'::progress_tracking.progress_status,  -- MASTERED (nivel superior a completed)
    100,
    25,
    25,
    0,
    2400,               -- Casi score perfecto
    2500,
    96.00,
    100,
    2500,
    600,
    '03:00:00'::interval,
    10,
    25,
    0,                  -- No usó hints (dominó el módulo)
    0,                  -- No usó comodines
    0,
    gamilit.now_mexico() - INTERVAL '25 days',
    gamilit.now_mexico() - INTERVAL '20 days',
    gamilit.now_mexico() - INTERVAL '20 days',
    NULL,
    '60000000-0000-0000-0000-000000000003'::uuid,  -- 6to A
    NULL,
    true,
    false,
    true,
    jsonb_build_array(),
    jsonb_build_object(
        'strengths', jsonb_build_array('todas las áreas'),
        'mastery_level', 'expert',
        'perfect_scores', 5
    ),
    'Módulo 1 dominado completamente',
    'Desempeño excepcional. Estudiante modelo',
    jsonb_build_object(
        'learning_pace', 'very_fast',
        'engagement_level', 'exceptional',
        'mastery_achieved', true,
        'certificate_earned', true
    ),
    jsonb_build_object(
        'demo_progress', true,
        'module_name', 'MÓDULO 1: Comprensión Literal',
        'mastered', true
    ),
    gamilit.now_mexico() - INTERVAL '25 days',
    gamilit.now_mexico() - INTERVAL '20 days'
),

-- =====================================================
-- Estudiante 5: Sofía Martínez - Módulo 2 COMPLETADO
-- =====================================================
(
    'c0000001-0000-0000-0000-000000000007'::uuid,
    '05ef8000-482e-8687-f899-62569049f092'::uuid,
    'modulo-02-comprension-inferencial'::uuid,
    'completed'::progress_tracking.progress_status,
    100,
    25,
    25,
    0,
    2250,
    2500,
    90.00,
    100,
    2500,
    600,
    '03:30:00'::interval,
    10,
    25,
    1,
    1,
    20,
    gamilit.now_mexico() - INTERVAL '15 days',
    gamilit.now_mexico() - INTERVAL '8 days',
    gamilit.now_mexico() - INTERVAL '8 days',
    NULL,
    '60000000-0000-0000-0000-000000000003'::uuid,
    NULL,
    true,
    false,
    true,
    jsonb_build_array(),
    jsonb_build_object(
        'strengths', jsonb_build_array('inferencias complejas', 'análisis profundo'),
        'completion_rate', '100%'
    ),
    'Módulo 2 completado. Avanzando a Módulo 3',
    'Continúa con excelente desempeño',
    jsonb_build_object(
        'learning_pace', 'very_fast',
        'engagement_level', 'very_high',
        'certificate_earned', true
    ),
    jsonb_build_object(
        'demo_progress', true,
        'module_name', 'MÓDULO 2: Comprensión Inferencial',
        'completed', true
    ),
    gamilit.now_mexico() - INTERVAL '15 days',
    gamilit.now_mexico() - INTERVAL '8 days'
),

-- =====================================================
-- Estudiante 5: Sofía Martínez - Módulo 3 en progreso
-- =====================================================
(
    'c0000001-0000-0000-0000-000000000008'::uuid,
    '05ef8000-482e-8687-f899-62569049f092'::uuid,
    'modulo-03-comprension-critica'::uuid,
    'in_progress'::progress_tracking.progress_status,
    20,                 -- Apenas comenzando Módulo 3
    5,
    25,
    0,
    450,
    500,
    90.00,
    95,
    500,
    150,
    '01:00:00'::interval,
    5,
    5,
    0,
    0,
    0,
    gamilit.now_mexico() - INTERVAL '5 days',
    NULL,
    gamilit.now_mexico() - INTERVAL '30 minutes',
    NULL,
    '60000000-0000-0000-0000-000000000003'::uuid,
    NULL,
    true,
    false,
    true,
    jsonb_build_array(),
    jsonb_build_object(
        'strengths', jsonb_build_array('pensamiento crítico inicial'),
        'challenging_but_progressing', true
    ),
    'El Módulo 3 es más difícil pero interesante',
    NULL,
    jsonb_build_object(
        'learning_pace', 'fast',
        'engagement_level', 'high',
        'difficulty_appropriate', true
    ),
    jsonb_build_object(
        'demo_progress', true,
        'module_name', 'MÓDULO 3: Comprensión Crítica'
    ),
    gamilit.now_mexico() - INTERVAL '5 days',
    gamilit.now_mexico()
)

ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    progress_percentage = EXCLUDED.progress_percentage,
    completed_exercises = EXCLUDED.completed_exercises,
    total_score = EXCLUDED.total_score,
    average_score = EXCLUDED.average_score,
    total_xp_earned = EXCLUDED.total_xp_earned,
    total_ml_coins_earned = EXCLUDED.total_ml_coins_earned,
    time_spent = EXCLUDED.time_spent,
    sessions_count = EXCLUDED.sessions_count,
    attempts_count = EXCLUDED.attempts_count,
    last_accessed_at = EXCLUDED.last_accessed_at,
    completed_at = EXCLUDED.completed_at,
    performance_analytics = EXCLUDED.performance_analytics,
    metadata = EXCLUDED.metadata,
    updated_at = gamilit.now_mexico();

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
    progress_count INTEGER;
    in_progress_count INTEGER;
    completed_count INTEGER;
    mastered_count INTEGER;
    avg_completion NUMERIC;
BEGIN
    SELECT COUNT(*) INTO progress_count
    FROM progress_tracking.module_progress
    WHERE metadata->>'demo_progress' = 'true';

    SELECT COUNT(*) INTO in_progress_count
    FROM progress_tracking.module_progress
    WHERE status = 'in_progress' AND metadata->>'demo_progress' = 'true';

    SELECT COUNT(*) INTO completed_count
    FROM progress_tracking.module_progress
    WHERE status = 'completed' AND metadata->>'demo_progress' = 'true';

    SELECT COUNT(*) INTO mastered_count
    FROM progress_tracking.module_progress
    WHERE status = 'mastered' AND metadata->>'demo_progress' = 'true';

    SELECT AVG(progress_percentage)::NUMERIC(5,2) INTO avg_completion
    FROM progress_tracking.module_progress
    WHERE metadata->>'demo_progress' = 'true';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'MODULE PROGRESS DEMO CREADO EXITOSAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total registros: %', progress_count;
    RAISE NOTICE '  - En progreso: %', in_progress_count;
    RAISE NOTICE '  - Completados: %', completed_count;
    RAISE NOTICE '  - Dominados (Mastered): %', mastered_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Progreso promedio: %%', avg_completion;
    RAISE NOTICE '========================================';

    IF progress_count = 8 THEN
        RAISE NOTICE ' Todos los module progress demo fueron creados correctamente';
    ELSE
        RAISE WARNING '  Se esperaban 8 registros, se crearon %', progress_count;
    END IF;
END $$;

-- =====================================================
-- Listado de progress
-- =====================================================

DO $$
DECLARE
    progress_record RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Listado de module progress demo:';
    RAISE NOTICE '========================================';

    FOR progress_record IN
        SELECT
            p.display_name,
            mp.metadata->>'module_name' as module_name,
            mp.status,
            mp.progress_percentage,
            mp.completed_exercises,
            mp.total_exercises,
            mp.average_score
        FROM progress_tracking.module_progress mp
        JOIN auth_management.profiles p ON p.id = mp.user_id
        WHERE mp.metadata->>'demo_progress' = 'true'
        ORDER BY p.display_name, mp.module_id
    LOOP
        RAISE NOTICE '  - %', progress_record.display_name;
        RAISE NOTICE '    Módulo: %', progress_record.module_name;
        RAISE NOTICE '    Estado: % | Progreso: %%%',
            progress_record.status,
            progress_record.progress_percentage;
        RAISE NOTICE '    Ejercicios: %/% | Score promedio: %',
            progress_record.completed_exercises,
            progress_record.total_exercises,
            progress_record.average_score;
        RAISE NOTICE '';
    END LOOP;

    RAISE NOTICE '========================================';
END $$;
