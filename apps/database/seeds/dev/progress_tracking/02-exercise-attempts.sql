-- =====================================================================================
-- SEED: Exercise Attempts and Submissions for Progress Tracking
-- =====================================================================================
-- Description: Exercise attempts, submissions and detailed performance tracking
-- Dependencies: auth.users, educational_content.exercises, module_progress
-- Idempotency: Uses ON CONFLICT to handle re-runs safely
-- Version: 1.1 (fixed column names to match DDL)
-- =====================================================================================
-- DDL exercise_attempts columns: id, user_id, exercise_id, attempt_number,
--   submitted_answers, is_correct, score, time_spent_seconds, hints_used,
--   comodines_used, xp_earned, ml_coins_earned, submitted_at, metadata
-- DDL exercise_submissions columns: id, user_id, exercise_id, answer_data,
--   is_correct, score, max_score, feedback, hint_used, hints_count,
--   comodines_used, ml_coins_spent, time_spent_seconds, attempt_number,
--   status, started_at, submitted_at, graded_at, created_at, updated_at,
--   xp_earned, ml_coins_earned, rewards_claimed
-- =====================================================================================

SET search_path TO progress_tracking, educational_content, auth, public;

-- =====================================================================================
-- EXERCISE ATTEMPTS & SUBMISSIONS
-- =====================================================================================

DO $$
DECLARE
    student1_id UUID;
    student2_id UUID;
    student3_id UUID;
    exercise_1_1_id UUID; -- Crucigrama Cientifico
    exercise_1_2_id UUID; -- Linea de Tiempo
    exercise_1_3_id UUID; -- Completar Biografia
    exercise_2_1_id UUID; -- Detective de Motivaciones
    exercise_2_2_id UUID; -- Predictor de Consecuencias
    exercise_3_1_id UUID; -- Juez de Argumentos
BEGIN
    -- ==================================================================================
    -- GET USER IDS (Demo Students - profile IDs)
    -- ==================================================================================

    SELECT p.id INTO student1_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'estudiante1@demo.glit.edu.mx';

    SELECT p.id INTO student2_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'estudiante2@demo.glit.edu.mx';

    SELECT p.id INTO student3_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'estudiante3@demo.glit.edu.mx';

    -- ==================================================================================
    -- GET EXERCISE IDS (by title patterns)
    -- ==================================================================================

    -- Module 1 Exercises (Literal)
    -- Title: 'Crucigrama Científico - DISTRIBUCIÓN'
    SELECT id INTO exercise_1_1_id
    FROM educational_content.exercises
    WHERE title ILIKE '%Crucigrama%'
    ORDER BY created_at LIMIT 1;

    -- Title: 'Línea de Tiempo de Marie Curie'
    SELECT id INTO exercise_1_2_id
    FROM educational_content.exercises
    WHERE title ILIKE '%nea de Tiempo%'
    ORDER BY created_at LIMIT 1;

    -- Title: 'Completar Espacios en Blanco'
    SELECT id INTO exercise_1_3_id
    FROM educational_content.exercises
    WHERE title ILIKE '%Completar%'
    ORDER BY created_at LIMIT 1;

    -- Module 2 Exercises (Inferencial)
    -- Title: 'Detective Textual: El Misterio de la Radiación'
    SELECT id INTO exercise_2_1_id
    FROM educational_content.exercises
    WHERE title ILIKE '%Detective%'
    ORDER BY created_at LIMIT 1;

    -- Title: 'Predicción Narrativa: ¿Qué Sucederá Después?'
    SELECT id INTO exercise_2_2_id
    FROM educational_content.exercises
    WHERE title ILIKE '%Predic%'
    ORDER BY created_at LIMIT 1;

    -- Module 3 Exercises (Critica)
    -- Title: 'Tribunal de Opiniones: Evaluando Afirmaciones'
    SELECT id INTO exercise_3_1_id
    FROM educational_content.exercises
    WHERE title ILIKE '%Tribunal%'
    ORDER BY created_at LIMIT 1;

    -- ==================================================================================
    -- EXERCISE ATTEMPTS: Detailed Attempt Tracking
    -- ==================================================================================

    RAISE NOTICE 'Inserting exercise attempts data...';

    INSERT INTO progress_tracking.exercise_attempts (
        user_id, exercise_id,
        attempt_number,
        submitted_answers, is_correct, score,
        time_spent_seconds,
        hints_used, comodines_used,
        xp_earned, ml_coins_earned,
        metadata, submitted_at
    ) VALUES
    -- ================================================================================
    -- ESTUDIANTE 1: Crucigrama Cientifico (Progressive Improvement - 3 attempts)
    -- ================================================================================

    -- Attempt 1: First Try (Good but not perfect)
    (
        student1_id, exercise_1_1_id,
        1,
        '{"words_completed": ["RADIO", "NOBEL", "SORBONA"], "words_struggled": ["PECHBLENDA", "POLONIO"]}'::jsonb,
        false, 75,
        420,
        1, '[]'::jsonb,
        15, 5,
        '{"mistakes": 5, "corrections": 3, "completion_path": "sequential"}'::jsonb,
        NOW() - INTERVAL '9 days'
    ),

    -- Attempt 2: Second Try (Significant Improvement)
    (
        student1_id, exercise_1_1_id,
        2,
        '{"words_completed": ["RADIO", "POLONIO", "NOBEL", "SORBONA"], "words_struggled": ["RADIOACTIVIDAD"]}'::jsonb,
        false, 90,
        360,
        0, '["vision_lectora"]'::jsonb,
        20, 8,
        '{"mistakes": 2, "corrections": 1, "improvements": ["mejor tiempo"]}'::jsonb,
        NOW() - INTERVAL '8 days'
    ),

    -- Attempt 3: Mastery Achievement (Perfect Score)
    (
        student1_id, exercise_1_1_id,
        3,
        '{"all_words_correct": ["RADIO", "POLONIO", "RADIOACTIVIDAD", "NOBEL", "SORBONA", "PECHBLENDA"]}'::jsonb,
        true, 100,
        300,
        0, '[]'::jsonb,
        30, 15,
        '{"mistakes": 0, "perfect_score": true, "mastery_achieved": true}'::jsonb,
        NOW() - INTERVAL '7 days'
    ),

    -- ESTUDIANTE 1: Linea de Tiempo (1 attempt - High Performance)
    (
        student1_id, exercise_1_2_id,
        1,
        '{"events_placed": 8, "sequence": "correct"}'::jsonb,
        true, 95,
        480,
        0, '[]'::jsonb,
        25, 10,
        '{"date_errors": 0, "sequence_errors": 1, "chronological_accuracy": "excellent"}'::jsonb,
        NOW() - INTERVAL '6 days'
    ),

    -- ESTUDIANTE 1: Detective de Motivaciones (Module 2)
    (
        student1_id, exercise_2_1_id,
        1,
        '{"clues_found": 8, "clues_total": 8, "motivation_identified": "pasion por la ciencia"}'::jsonb,
        true, 95,
        540,
        1, '["pistas"]'::jsonb,
        25, 10,
        '{"inference_accuracy": "excellent"}'::jsonb,
        NOW() - INTERVAL '1 hour'
    ),

    -- ESTUDIANTE 2: Linea de Tiempo (2 attempts)
    -- Attempt 1
    (
        student2_id, exercise_1_2_id,
        1,
        '{"events_placed": 8, "date_errors": 3}'::jsonb,
        false, 70,
        540,
        2, '["pistas"]'::jsonb,
        10, 5,
        '{"date_errors": 3, "sequence_errors": 2}'::jsonb,
        NOW() - INTERVAL '12 days'
    ),

    -- Attempt 2
    (
        student2_id, exercise_1_2_id,
        2,
        '{"events_placed": 8, "date_errors": 1}'::jsonb,
        false, 85,
        480,
        1, '["segunda_oportunidad"]'::jsonb,
        18, 8,
        '{"date_errors": 1, "sequence_errors": 0, "improvement": "significant"}'::jsonb,
        NOW() - INTERVAL '11 days'
    ),

    -- ESTUDIANTE 2: Completar Biografia (1 attempt)
    (
        student2_id, exercise_1_3_id,
        1,
        '{"blanks_total": 10, "blanks_correct": 8}'::jsonb,
        false, 80,
        600,
        1, '[]'::jsonb,
        15, 6,
        '{"vocabulary_accuracy": "good", "context_understanding": "solid"}'::jsonb,
        NOW() - INTERVAL '10 days'
    ),

    -- ESTUDIANTE 2: Juez de Argumentos (Module 3)
    (
        student2_id, exercise_3_1_id,
        1,
        '{"arguments_analyzed": 5, "correct_evaluations": 3}'::jsonb,
        false, 70,
        720,
        2, '["segunda_oportunidad"]'::jsonb,
        10, 5,
        '{"critical_thinking_level": "developing"}'::jsonb,
        NOW() - INTERVAL '3 hours'
    ),

    -- ESTUDIANTE 3: Crucigrama Cientifico (2 attempts)
    -- Attempt 1
    (
        student3_id, exercise_1_1_id,
        1,
        '{"words_completed": ["RADIO", "NOBEL"], "words_incomplete": ["PECHBLENDA", "RADIOACTIVIDAD"]}'::jsonb,
        false, 60,
        600,
        3, '["pistas", "vision_lectora"]'::jsonb,
        8, 3,
        '{"mistakes": 8, "corrections": 5, "reading_support_needed": true}'::jsonb,
        NOW() - INTERVAL '4 days'
    ),

    -- Attempt 2 (in progress - score 0)
    (
        student3_id, exercise_1_1_id,
        2,
        '{"current_progress": 40, "words_completed": ["RADIO", "NOBEL"]}'::jsonb,
        NULL, 0,
        180,
        1, '["pistas"]'::jsonb,
        0, 0,
        '{"current_word": "SORBONA", "session_active": true}'::jsonb,
        NOW() - INTERVAL '3 hours'
    ),

    -- ESTUDIANTE 3: Linea de Tiempo (1 attempt)
    (
        student3_id, exercise_1_2_id,
        1,
        '{"events_placed": 8, "date_errors": 4, "sequence_errors": 3}'::jsonb,
        false, 65,
        720,
        2, '["pistas", "vision_lectora"]'::jsonb,
        6, 3,
        '{"chronological_confusion": "high", "support_recommendation": "review timeline concepts"}'::jsonb,
        NOW() - INTERVAL '3 days'
    )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Exercise attempts data inserted successfully';

    -- ==================================================================================
    -- EXERCISE SUBMISSIONS: Detailed Submission Data
    -- ==================================================================================

    RAISE NOTICE 'Inserting exercise submissions data...';

    INSERT INTO progress_tracking.exercise_submissions (
        user_id, exercise_id, attempt_number,
        answer_data,
        score, max_score, feedback,
        hints_count, comodines_used,
        time_spent_seconds,
        status,
        started_at, submitted_at, graded_at,
        xp_earned, ml_coins_earned,
        created_at, updated_at
    ) VALUES
    -- ESTUDIANTE 1: Crucigrama Perfect Score Submission
    (
        student1_id, exercise_1_1_id, 3,
        '{"exercise_type": "crossword", "answers": {"1_across": "RADIO", "2_across": "POLONIO", "3_down": "RADIOACTIVIDAD"}, "all_correct": true}'::jsonb,
        100, 100,
        'Perfecto! Dominas el vocabulario cientifico de Marie Curie.',
        0, ARRAY[]::text[],
        300,
        'graded',
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '7 days' + INTERVAL '5 minutes',
        NOW() - INTERVAL '7 days' + INTERVAL '5 minutes',
        30, 15,
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '7 days'
    ),

    -- ESTUDIANTE 1: Linea de Tiempo Submission
    (
        student1_id, exercise_1_2_id, 1,
        '{"exercise_type": "timeline", "events_placed": 8, "sequence_accuracy": "perfect"}'::jsonb,
        95, 100,
        'Excelente trabajo. Solo un pequeno error en la fecha del segundo Nobel.',
        0, ARRAY[]::text[],
        480,
        'graded',
        NOW() - INTERVAL '6 days',
        NOW() - INTERVAL '6 days' + INTERVAL '8 minutes',
        NOW() - INTERVAL '6 days' + INTERVAL '8 minutes',
        25, 10,
        NOW() - INTERVAL '6 days',
        NOW() - INTERVAL '6 days'
    ),

    -- ESTUDIANTE 2: Linea de Tiempo Retry Submission
    (
        student2_id, exercise_1_2_id, 2,
        '{"exercise_type": "timeline", "events_placed": 8, "date_errors": 1}'::jsonb,
        85, 100,
        'Muy bien. Has mejorado significativamente.',
        1, ARRAY['segunda_oportunidad']::text[],
        480,
        'graded',
        NOW() - INTERVAL '11 days',
        NOW() - INTERVAL '11 days' + INTERVAL '8 minutes',
        NOW() - INTERVAL '11 days' + INTERVAL '8 minutes',
        18, 8,
        NOW() - INTERVAL '11 days',
        NOW() - INTERVAL '11 days'
    ),

    -- ESTUDIANTE 2: Completar Biografia Submission
    (
        student2_id, exercise_1_3_id, 1,
        '{"exercise_type": "fill_in_blank", "blanks_total": 10, "blanks_correct": 8}'::jsonb,
        80, 100,
        'Buen trabajo. Solo un error: el mineral es pechblenda, no uranio.',
        1, ARRAY[]::text[],
        600,
        'graded',
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '10 days' + INTERVAL '10 minutes',
        NOW() - INTERVAL '10 days' + INTERVAL '10 minutes',
        15, 6,
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '10 days'
    )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Exercise submissions data inserted successfully';
    RAISE NOTICE 'Exercise attempts and submissions seeds completed';
    RAISE NOTICE '  - Exercise attempts: 12';
    RAISE NOTICE '  - Exercise submissions: 4';
    RAISE NOTICE '  - Students tracked: 3';

END $$;
