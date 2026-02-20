-- =====================================================================================
-- SEED: Peer Challenges for social_features Schema
-- =====================================================================================
-- Description: Sample peer-to-peer challenge data for student competitions
-- Dependencies: auth_management.profiles, educational_content.modules, educational_content.exercises
-- Idempotency: Uses ON CONFLICT to handle re-runs safely
-- Created: 2026-01-20
-- Task: P2-3 (Aumentar cobertura de seeds al 80%)
-- =====================================================================================

SET search_path TO social_features, auth_management, educational_content, public;

-- =====================================================
-- PEER CHALLENGES
-- =====================================================

DO $$
DECLARE
    v_student1_id UUID;
    v_student2_id UUID;
    v_student3_id UUID;
    v_module1_id UUID;
    v_module2_id UUID;
    v_exercise1_id UUID;
    v_exercise2_id UUID;
BEGIN
    RAISE NOTICE 'Creating peer challenge records...';

    -- Get student IDs
    SELECT id INTO v_student1_id FROM auth_management.profiles
    WHERE role = 'student' AND is_active = true
    ORDER BY created_at LIMIT 1;

    SELECT id INTO v_student2_id FROM auth_management.profiles
    WHERE role = 'student' AND is_active = true
    ORDER BY created_at OFFSET 1 LIMIT 1;

    SELECT id INTO v_student3_id FROM auth_management.profiles
    WHERE role = 'student' AND is_active = true
    ORDER BY created_at OFFSET 2 LIMIT 1;

    -- Fallbacks for students
    IF v_student1_id IS NULL THEN
        SELECT id INTO v_student1_id FROM auth_management.profiles WHERE is_active = true LIMIT 1;
    END IF;
    IF v_student2_id IS NULL THEN
        v_student2_id := v_student1_id;
    END IF;
    IF v_student3_id IS NULL THEN
        v_student3_id := v_student1_id;
    END IF;

    -- Get module and exercise IDs
    SELECT id INTO v_module1_id FROM educational_content.modules
    WHERE module_code ILIKE '%literal%' OR module_code ILIKE 'MOD-01%' LIMIT 1;

    SELECT id INTO v_module2_id FROM educational_content.modules
    WHERE module_code ILIKE '%inferencia%' OR module_code ILIKE 'MOD-02%' LIMIT 1;

    SELECT id INTO v_exercise1_id FROM educational_content.exercises LIMIT 1;
    SELECT id INTO v_exercise2_id FROM educational_content.exercises OFFSET 1 LIMIT 1;

    -- Skip if no creator found
    IF v_student1_id IS NULL THEN
        RAISE NOTICE 'No users found. Skipping peer_challenges seed.';
        RETURN;
    END IF;

    INSERT INTO social_features.peer_challenges (
        id,
        challenge_type,
        created_by,
        module_id,
        exercise_id,
        title,
        description,
        difficulty_level,
        max_participants,
        min_participants,
        current_participants,
        start_time,
        end_time,
        time_limit_minutes,
        status,
        rewards,
        winner_bonus_multiplier,
        allow_spectators,
        is_public,
        requires_approval,
        custom_rules,
        created_at,
        updated_at,
        started_at,
        completed_at,
        metadata
    ) VALUES

    -- Challenge 1: Open head-to-head challenge
    (
        '61111111-1111-1111-1111-111111111001'::uuid,
        'head_to_head',
        v_student1_id,
        v_module1_id,
        v_exercise1_id,
        'Duelo de Comprension Literal',
        'Quien puede contestar mas ejercicios de comprension literal correctamente en 10 minutos?',
        'intermediate',
        2,
        2,
        1,
        NOW() + INTERVAL '1 hour',
        NOW() + INTERVAL '2 hours',
        10,
        'open',
        jsonb_build_object(
            'xp', 100,
            'ml_coins', 50,
            'badge_id', 'challenge_winner'
        ),
        1.5,
        true,
        true,
        false,
        jsonb_build_object(
            'no_hints_allowed', true,
            'single_attempt', true
        ),
        NOW() - INTERVAL '30 minutes',
        NOW() - INTERVAL '30 minutes',
        NULL,
        NULL,
        jsonb_build_object(
            'created_from', 'student_portal',
            'tags', ARRAY['comprension', 'literal']
        )
    ),

    -- Challenge 2: Multiplayer in progress
    (
        '61111111-1111-1111-1111-111111111002'::uuid,
        'multiplayer',
        v_student2_id,
        v_module2_id,
        NULL,
        'Torneo Inferencias Rapidas',
        'Compite con tus companeros para ver quien hace las mejores inferencias',
        'advanced',
        5,
        3,
        4,
        NOW() - INTERVAL '15 minutes',
        NOW() + INTERVAL '45 minutes',
        30,
        'in_progress',
        jsonb_build_object(
            'xp', 200,
            'ml_coins', 100,
            'achievement_id', 'inference_master'
        ),
        2.0,
        true,
        true,
        false,
        jsonb_build_object(
            'best_of', 5,
            'points_per_correct', 10
        ),
        NOW() - INTERVAL '1 hour',
        NOW() - INTERVAL '15 minutes',
        NOW() - INTERVAL '15 minutes',
        NULL,
        jsonb_build_object(
            'current_leader', v_student3_id,
            'leader_score', 85
        )
    ),

    -- Challenge 3: Completed challenge
    (
        '61111111-1111-1111-1111-111111111003'::uuid,
        'head_to_head',
        v_student3_id,
        v_module1_id,
        v_exercise2_id,
        'Desafio Rapido: Idea Principal',
        'Identifica la idea principal de 5 textos antes que tu oponente',
        'beginner',
        2,
        2,
        2,
        NOW() - INTERVAL '3 hours',
        NOW() - INTERVAL '2 hours',
        15,
        'completed',
        jsonb_build_object(
            'xp', 75,
            'ml_coins', 35
        ),
        1.5,
        false,
        true,
        false,
        jsonb_build_object(),
        NOW() - INTERVAL '4 hours',
        NOW() - INTERVAL '2 hours',
        NOW() - INTERVAL '3 hours',
        NOW() - INTERVAL '2 hours' - INTERVAL '12 minutes',
        jsonb_build_object(
            'winner_id', v_student1_id,
            'final_scores', jsonb_build_object(
                v_student3_id::text, 80,
                v_student1_id::text, 95
            )
        )
    ),

    -- Challenge 4: Cancelled challenge
    (
        '61111111-1111-1111-1111-111111111004'::uuid,
        'tournament',
        v_student1_id,
        NULL,
        NULL,
        'Torneo Semanal de Lectura',
        'Gran torneo con todos los modulos disponibles',
        'advanced',
        16,
        8,
        3,
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day' + INTERVAL '4 hours',
        60,
        'cancelled',
        jsonb_build_object(
            'xp', 500,
            'ml_coins', 250,
            'special_badge', 'tournament_champion'
        ),
        3.0,
        true,
        true,
        true,
        jsonb_build_object(
            'elimination_rounds', 4,
            'bracket_style', 'single_elimination'
        ),
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '1 day',
        NULL,
        NULL,
        jsonb_build_object(
            'cancellation_reason', 'Insufficient participants',
            'registered_participants', 3
        )
    ),

    -- Challenge 5: Private leaderboard challenge
    (
        '61111111-1111-1111-1111-111111111005'::uuid,
        'leaderboard',
        v_student2_id,
        v_module1_id,
        NULL,
        'Ranking Semanal del Salon 2A',
        'Competencia de una semana para estudiantes del salon 2A',
        'intermediate',
        30,
        5,
        12,
        NOW() - INTERVAL '2 days',
        NOW() + INTERVAL '5 days',
        NULL,
        'in_progress',
        jsonb_build_object(
            'xp_first', 300,
            'xp_second', 200,
            'xp_third', 100,
            'ml_coins_first', 150
        ),
        1.0,
        false,
        false,
        true,
        jsonb_build_object(
            'scoring', 'cumulative',
            'daily_cap', 100
        ),
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '1 hour',
        NOW() - INTERVAL '2 days',
        NULL,
        jsonb_build_object(
            'classroom_id', 'salon-2a',
            'teacher_created', false,
            'leaderboard_update_interval', 'hourly'
        )
    ),

    -- =====================================================
    -- NUEVOS DESAFIOS (P1 Expansion - 2026-01-27)
    -- =====================================================

    -- Challenge 6: Tournament for vocabulary mastery
    (
        '61111111-1111-1111-1111-111111111006'::uuid,
        'tournament',
        v_student1_id,
        v_module1_id,
        NULL,
        'Torneo de Vocabulario Contextual',
        'Demuestra tu dominio del vocabulario en contexto. Competencia eliminatoria con 8 participantes.',
        'intermediate',
        8,
        4,
        6,
        NOW() + INTERVAL '2 hours',
        NOW() + INTERVAL '6 hours',
        45,
        'open',
        jsonb_build_object(
            'xp', 250,
            'ml_coins', 125,
            'badge_id', 'vocab_champion'
        ),
        2.0,
        true,
        true,
        false,
        jsonb_build_object(
            'elimination_rounds', 3,
            'words_per_round', 15,
            'time_per_word', 30
        ),
        NOW() - INTERVAL '2 hours',
        NOW() - INTERVAL '2 hours',
        NULL,
        NULL,
        jsonb_build_object(
            'category', 'vocabulary',
            'skill_focus', 'context_clues'
        )
    ),

    -- Challenge 7: Completed multiplayer reading comprehension
    (
        '61111111-1111-1111-1111-111111111007'::uuid,
        'multiplayer',
        v_student3_id,
        v_module2_id,
        v_exercise1_id,
        'Batalla de Comprension: Ciencia',
        'Quien comprende mejor los textos cientificos? Competencia grupal completada.',
        'advanced',
        6,
        3,
        5,
        NOW() - INTERVAL '5 hours',
        NOW() - INTERVAL '3 hours',
        40,
        'completed',
        jsonb_build_object(
            'xp', 180,
            'ml_coins', 90,
            'special_reward', 'science_reader_badge'
        ),
        1.75,
        true,
        true,
        false,
        jsonb_build_object(
            'theme', 'science',
            'text_count', 5,
            'questions_per_text', 4
        ),
        NOW() - INTERVAL '8 hours',
        NOW() - INTERVAL '3 hours',
        NOW() - INTERVAL '5 hours',
        NOW() - INTERVAL '3 hours' - INTERVAL '45 minutes',
        jsonb_build_object(
            'winner_id', v_student2_id,
            'participation_rate', 0.83,
            'average_score', 78.5
        )
    ),

    -- Challenge 8: Open head-to-head speed reading
    (
        '61111111-1111-1111-1111-111111111008'::uuid,
        'head_to_head',
        v_student2_id,
        NULL,
        v_exercise2_id,
        'Duelo de Lectura Rapida',
        'Quien puede leer y comprender mas rapido? Un ejercicio, dos competidores, un ganador.',
        'hard',
        2,
        2,
        1,
        NOW() + INTERVAL '30 minutes',
        NOW() + INTERVAL '1 hour',
        8,
        'open',
        jsonb_build_object(
            'xp', 120,
            'ml_coins', 60,
            'streak_bonus', true
        ),
        1.5,
        false,
        true,
        false,
        jsonb_build_object(
            'speed_matters', true,
            'accuracy_weight', 0.7,
            'speed_weight', 0.3
        ),
        NOW() - INTERVAL '10 minutes',
        NOW() - INTERVAL '10 minutes',
        NULL,
        NULL,
        jsonb_build_object(
            'challenge_type', 'speed_reading',
            'min_accuracy', 70
        )
    ),

    -- Challenge 9: Expired challenge (never started)
    (
        '61111111-1111-1111-1111-111111111009'::uuid,
        'multiplayer',
        v_student1_id,
        v_module1_id,
        NULL,
        'Maraton de Lectura Nocturna',
        'Sesion especial de lectura nocturna que no alcanzo el minimo de participantes.',
        'intermediate',
        10,
        5,
        2,
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days' + INTERVAL '3 hours',
        120,
        'expired',
        jsonb_build_object(
            'xp', 400,
            'ml_coins', 200,
            'exclusive_avatar', 'night_owl'
        ),
        2.5,
        true,
        true,
        false,
        jsonb_build_object(
            'special_event', true,
            'time_slot', 'night'
        ),
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '2 days',
        NULL,
        NULL,
        jsonb_build_object(
            'expiration_reason', 'minimum_participants_not_reached',
            'registered_count', 2,
            'minimum_required', 5
        )
    ),

    -- Challenge 10: Open leaderboard for classroom competition
    (
        '61111111-1111-1111-1111-111111111010'::uuid,
        'leaderboard',
        v_student3_id,
        NULL,
        NULL,
        'Competencia Mensual: Mejor Lector',
        'Quien sera el mejor lector del mes? Acumula puntos con cada ejercicio completado.',
        'beginner',
        50,
        10,
        18,
        NOW() - INTERVAL '10 days',
        NOW() + INTERVAL '20 days',
        NULL,
        'in_progress',
        jsonb_build_object(
            'xp_first', 500,
            'xp_second', 300,
            'xp_third', 150,
            'ml_coins_first', 250,
            'ml_coins_second', 150,
            'ml_coins_third', 75,
            'monthly_badge', 'reader_of_the_month'
        ),
        1.0,
        true,
        true,
        false,
        jsonb_build_object(
            'scoring_rules', 'cumulative',
            'bonus_for_streak', 10,
            'points_per_exercise', 5,
            'perfect_score_multiplier', 1.5
        ),
        NOW() - INTERVAL '12 days',
        NOW() - INTERVAL '1 hour',
        NOW() - INTERVAL '10 days',
        NULL,
        jsonb_build_object(
            'school_wide', true,
            'current_leader_score', 285,
            'active_participants', 18,
            'update_frequency', 'daily'
        )
    )

    ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        current_participants = EXCLUDED.current_participants,
        started_at = EXCLUDED.started_at,
        completed_at = EXCLUDED.completed_at,
        metadata = EXCLUDED.metadata,
        updated_at = gamilit.now_mexico();

    RAISE NOTICE 'Peer challenges created successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Warning: Could not create all peer challenges: %', SQLERRM;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
    v_total_count INTEGER;
    v_open_count INTEGER;
    v_in_progress INTEGER;
    v_completed_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_count FROM social_features.peer_challenges;
    SELECT COUNT(*) INTO v_open_count FROM social_features.peer_challenges WHERE status = 'open';
    SELECT COUNT(*) INTO v_in_progress FROM social_features.peer_challenges WHERE status = 'in_progress';
    SELECT COUNT(*) INTO v_completed_count FROM social_features.peer_challenges WHERE status = 'completed';

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  SEED COMPLETADO: peer_challenges';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  Total desafios: %', v_total_count;
    RAISE NOTICE '  - Open: %', v_open_count;
    RAISE NOTICE '  - In Progress: %', v_in_progress;
    RAISE NOTICE '  - Completed: %', v_completed_count;
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;
