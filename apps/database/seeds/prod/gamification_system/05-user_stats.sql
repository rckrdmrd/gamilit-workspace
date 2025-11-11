-- =====================================================
-- Seed: gamification_system.user_stats (PROD)
-- Description: Estadísticas de gamificación para usuarios demo
-- Environment: PRODUCTION
-- Dependencies: auth_management.profiles, gamification_system.maya_ranks
-- Order: 05
-- Created: 2025-01-11
-- Version: 1.0
-- =====================================================
--
-- ESTADÍSTICAS INCLUIDAS:
-- - 5 estudiantes con diferentes niveles de progreso
-- - 2 profesores con estadísticas de actividad
-- - 2 administradores con stats altos
-- - 1 padre con estadísticas básicas
--
-- TOTAL: 10 usuarios con stats iniciales
--
-- IMPORTANTE: Estas estadísticas dan vida a los usuarios demo
-- con diferentes niveles de XP, ML Coins, rachas y progreso.
-- =====================================================

SET search_path TO gamification_system, auth_management, public;

-- =====================================================
-- INSERT: User Stats Demo
-- =====================================================

INSERT INTO gamification_system.user_stats (
    id,
    user_id,
    tenant_id,
    level,
    total_xp,
    xp_to_next_level,
    current_rank,
    rank_progress,
    ml_coins,
    ml_coins_earned_total,
    ml_coins_spent_total,
    ml_coins_earned_today,
    last_ml_coins_reset,
    current_streak,
    max_streak,
    streak_started_at,
    days_active_total,
    exercises_completed,
    modules_completed,
    total_score,
    average_score,
    perfect_scores,
    achievements_earned,
    certificates_earned,
    total_time_spent,
    weekly_time_spent,
    sessions_count,
    weekly_xp,
    monthly_xp,
    weekly_exercises,
    global_rank_position,
    class_rank_position,
    school_rank_position,
    last_activity_at,
    last_login_at,
    metadata,
    created_at,
    updated_at
) VALUES

-- =====================================================
-- Estudiante 1: Ana García - Nivel 2, Progreso Medio
-- =====================================================
(
    'a0000001-0000-0000-0000-000000000001'::uuid,
    '01ac4f00-082e-4287-b899-2e169c49b05e'::uuid,  -- Ana García
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,  -- Tenant principal
    2,                  -- level
    1250,               -- total_xp
    250,                -- xp_to_next_level (para nivel 3)
    'Ajaw'::gamification_system.maya_rank,
    45.50,              -- rank_progress (45.5% hacia Nacom)
    275,                -- ml_coins actuales
    450,                -- ml_coins_earned_total
    175,                -- ml_coins_spent_total
    25,                 -- ml_coins_earned_today
    gamilit.now_mexico() - INTERVAL '3 hours',  -- last_ml_coins_reset
    3,                  -- current_streak (3 días)
    5,                  -- max_streak
    gamilit.now_mexico() - INTERVAL '3 days',
    12,                 -- days_active_total
    15,                 -- exercises_completed
    0,                  -- modules_completed
    1200,               -- total_score
    80.00,              -- average_score
    2,                  -- perfect_scores
    3,                  -- achievements_earned
    0,                  -- certificates_earned
    '03:25:00'::interval,  -- total_time_spent (3h 25min)
    '01:15:00'::interval,  -- weekly_time_spent
    12,                 -- sessions_count
    450,                -- weekly_xp
    1250,               -- monthly_xp
    8,                  -- weekly_exercises
    NULL,               -- global_rank_position (se calcula)
    1,                  -- class_rank_position (1ra en 5to A)
    NULL,               -- school_rank_position
    gamilit.now_mexico() - INTERVAL '2 hours',
    gamilit.now_mexico() - INTERVAL '2 hours',
    jsonb_build_object(
        'demo_user', true,
        'preferred_theme', 'detective',
        'favorite_module', 'modulo-01-comprension-literal',
        'learning_pace', 'steady'
    ),
    gamilit.now_mexico() - INTERVAL '12 days',
    gamilit.now_mexico()
),

-- =====================================================
-- Estudiante 2: Carlos Ramírez - Nivel 1, Principiante
-- =====================================================
(
    'a0000001-0000-0000-0000-000000000002'::uuid,
    '02bc5f00-182e-5387-c899-3f269d49c06f'::uuid,  -- Carlos Ramírez
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    1,                  -- level
    250,                -- total_xp
    750,                -- xp_to_next_level
    'Ajaw'::gamification_system.maya_rank,
    12.50,              -- rank_progress
    150,                -- ml_coins
    200,                -- ml_coins_earned_total
    50,                 -- ml_coins_spent_total
    10,                 -- ml_coins_earned_today
    gamilit.now_mexico() - INTERVAL '5 hours',
    1,                  -- current_streak (1 día)
    2,                  -- max_streak
    gamilit.now_mexico() - INTERVAL '1 day',
    5,                  -- days_active_total
    5,                  -- exercises_completed
    0,                  -- modules_completed
    350,                -- total_score
    70.00,              -- average_score
    0,                  -- perfect_scores
    1,                  -- achievements_earned (Primera Visita)
    0,                  -- certificates_earned
    '01:10:00'::interval,
    '00:45:00'::interval,
    5,                  -- sessions_count
    150,                -- weekly_xp
    250,                -- monthly_xp
    3,                  -- weekly_exercises
    NULL,
    2,                  -- class_rank_position (2do en 5to A)
    NULL,
    gamilit.now_mexico() - INTERVAL '4 hours',
    gamilit.now_mexico() - INTERVAL '4 hours',
    jsonb_build_object(
        'demo_user', true,
        'preferred_theme', 'space',
        'learning_pace', 'slow'
    ),
    gamilit.now_mexico() - INTERVAL '5 days',
    gamilit.now_mexico()
),

-- =====================================================
-- Estudiante 3: María Fernanda - Nivel 3, Avanzada
-- =====================================================
(
    'a0000001-0000-0000-0000-000000000003'::uuid,
    '03cd6000-282e-6487-d899-40369e49d070'::uuid,  -- María Fernanda
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    3,                  -- level
    3200,               -- total_xp
    800,                -- xp_to_next_level
    'Nacom'::gamification_system.maya_rank,
    60.00,              -- rank_progress
    425,                -- ml_coins
    800,                -- ml_coins_earned_total
    375,                -- ml_coins_spent_total
    50,                 -- ml_coins_earned_today
    gamilit.now_mexico() - INTERVAL '2 hours',
    7,                  -- current_streak (7 días - achievement!)
    7,                  -- max_streak
    gamilit.now_mexico() - INTERVAL '7 days',
    20,                 -- days_active_total
    35,                 -- exercises_completed
    1,                  -- modules_completed (Módulo 1)
    2800,               -- total_score
    85.00,              -- average_score
    5,                  -- perfect_scores
    6,                  -- achievements_earned
    1,                  -- certificates_earned
    '06:30:00'::interval,
    '02:00:00'::interval,
    20,                 -- sessions_count
    900,                -- weekly_xp
    3200,               -- monthly_xp
    15,                 -- weekly_exercises
    NULL,
    1,                  -- class_rank_position (1ra en 5to B)
    NULL,
    gamilit.now_mexico() - INTERVAL '1 hour',
    gamilit.now_mexico() - INTERVAL '1 hour',
    jsonb_build_object(
        'demo_user', true,
        'preferred_theme', 'ocean',
        'favorite_module', 'modulo-02-comprension-inferencial',
        'learning_pace', 'fast',
        'achievement_hunter', true
    ),
    gamilit.now_mexico() - INTERVAL '20 days',
    gamilit.now_mexico()
),

-- =====================================================
-- Estudiante 4: Luis Miguel - Nivel 2, Progreso Constante
-- =====================================================
(
    'a0000001-0000-0000-0000-000000000004'::uuid,
    '04de7000-382e-7587-e899-51469f49e081'::uuid,  -- Luis Miguel
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    2,                  -- level
    1400,               -- total_xp
    100,                -- xp_to_next_level
    'Ajaw'::gamification_system.maya_rank,
    52.00,              -- rank_progress
    300,                -- ml_coins
    500,                -- ml_coins_earned_total
    200,                -- ml_coins_spent_total
    30,                 -- ml_coins_earned_today
    gamilit.now_mexico() - INTERVAL '4 hours',
    4,                  -- current_streak
    6,                  -- max_streak
    gamilit.now_mexico() - INTERVAL '4 days',
    15,                 -- days_active_total
    20,                 -- exercises_completed
    0,                  -- modules_completed
    1500,               -- total_score
    75.00,              -- average_score
    1,                  -- perfect_scores
    4,                  -- achievements_earned
    0,                  -- certificates_earned
    '04:00:00'::interval,
    '01:30:00'::interval,
    15,                 -- sessions_count
    550,                -- weekly_xp
    1400,               -- monthly_xp
    10,                 -- weekly_exercises
    NULL,
    2,                  -- class_rank_position (2do en 5to B)
    NULL,
    gamilit.now_mexico() - INTERVAL '3 hours',
    gamilit.now_mexico() - INTERVAL '3 hours',
    jsonb_build_object(
        'demo_user', true,
        'preferred_theme', 'forest',
        'learning_pace', 'steady'
    ),
    gamilit.now_mexico() - INTERVAL '15 days',
    gamilit.now_mexico()
),

-- =====================================================
-- Estudiante 5: Sofía Martínez - Nivel 4, Muy Avanzada
-- =====================================================
(
    'a0000001-0000-0000-0000-000000000005'::uuid,
    '05ef8000-482e-8687-f899-62569049f092'::uuid,  -- Sofía Martínez
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    4,                  -- level
    6500,               -- total_xp
    500,                -- xp_to_next_level
    'Nacom'::gamification_system.maya_rank,
    82.50,              -- rank_progress
    650,                -- ml_coins
    1200,               -- ml_coins_earned_total
    550,                -- ml_coins_spent_total
    75,                 -- ml_coins_earned_today
    gamilit.now_mexico() - INTERVAL '1 hour',
    10,                 -- current_streak (10 días)
    12,                 -- max_streak
    gamilit.now_mexico() - INTERVAL '10 days',
    30,                 -- days_active_total
    55,                 -- exercises_completed
    2,                  -- modules_completed (Módulos 1 y 2)
    4800,               -- total_score
    90.00,              -- average_score
    10,                 -- perfect_scores (Perfeccionista achievement!)
    8,                  -- achievements_earned
    2,                  -- certificates_earned
    '10:15:00'::interval,
    '03:00:00'::interval,
    30,                 -- sessions_count
    1500,               -- weekly_xp
    6500,               -- monthly_xp
    25,                 // weekly_exercises
    NULL,
    1,                  -- class_rank_position (1ra en 6to A)
    NULL,
    gamilit.now_mexico() - INTERVAL '30 minutes',
    gamilit.now_mexico() - INTERVAL '30 minutes',
    jsonb_build_object(
        'demo_user', true,
        'preferred_theme', 'galaxy',
        'favorite_module', 'modulo-03-comprension-critica',
        'learning_pace', 'very_fast',
        'achievement_hunter', true,
        'top_performer', true
    ),
    gamilit.now_mexico() - INTERVAL '30 days',
    gamilit.now_mexico()
),

-- =====================================================
-- Profesor 1: Juan Pérez - Nivel 5, Profesor Activo
-- =====================================================
(
    'a0000001-0000-0000-0000-000000000006'::uuid,
    '10ac4f00-092e-4297-b909-2e179c49b15e'::uuid,  -- Juan Pérez
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    5,                  -- level
    10000,              -- total_xp
    2000,               -- xp_to_next_level
    'Ah K''in'::gamification_system.maya_rank,
    33.33,              -- rank_progress
    1000,               // ml_coins
    2000,               -- ml_coins_earned_total
    1000,               -- ml_coins_spent_total
    0,                  -- ml_coins_earned_today
    gamilit.now_mexico() - INTERVAL '8 hours',
    15,                 -- current_streak
    20,                 -- max_streak
    gamilit.now_mexico() - INTERVAL '15 days',
    60,                 -- days_active_total
    100,                -- exercises_completed (testing exercises)
    5,                  -- modules_completed
    9000,               -- total_score
    92.00,              -- average_score
    25,                 -- perfect_scores
    12,                 -- achievements_earned
    5,                  -- certificates_earned
    '25:00:00'::interval,
    '05:00:00'::interval,
    60,                 -- sessions_count
    2500,               -- weekly_xp
    10000,              -- monthly_xp
    30,                 -- weekly_exercises
    NULL,
    NULL,
    NULL,
    gamilit.now_mexico() - INTERVAL '1 hour',
    gamilit.now_mexico() - INTERVAL '1 hour',
    jsonb_build_object(
        'demo_user', true,
        'role', 'teacher',
        'teacher_stats', jsonb_build_object(
            'students_count', 3,
            'classrooms_count', 2,
            'avg_student_score', 85.00
        )
    ),
    gamilit.now_mexico() - INTERVAL '60 days',
    gamilit.now_mexico()
),

-- =====================================================
-- Profesor 2: Laura Martínez - Nivel 5, Profesora Activa
-- =====================================================
(
    'a0000001-0000-0000-0000-000000000007'::uuid,
    '11bc5f00-192e-5397-c919-3f279d49c26f'::uuid,  -- Laura Martínez
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    5,                  -- level
    9500,               -- total_xp
    2500,               -- xp_to_next_level
    'Ah K''in'::gamification_system.maya_rank,
    25.00,              -- rank_progress
    950,                -- ml_coins
    1900,               -- ml_coins_earned_total
    950,                -- ml_coins_spent_total
    0,                  -- ml_coins_earned_today
    gamilit.now_mexico() - INTERVAL '10 hours',
    12,                 -- current_streak
    18,                 -- max_streak
    gamilit.now_mexico() - INTERVAL '12 days',
    55,                 -- days_active_total
    90,                 -- exercises_completed
    5,                  -- modules_completed
    8500,               -- total_score
    90.00,              -- average_score
    20,                 -- perfect_scores
    11,                 -- achievements_earned
    5,                  -- certificates_earned
    '22:30:00'::interval,
    '04:30:00'::interval,
    55,                 -- sessions_count
    2300,               -- weekly_xp
    9500,               -- monthly_xp
    28,                 -- weekly_exercises
    NULL,
    NULL,
    NULL,
    gamilit.now_mexico() - INTERVAL '2 hours',
    gamilit.now_mexico() - INTERVAL '2 hours',
    jsonb_build_object(
        'demo_user', true,
        'role', 'teacher',
        'teacher_stats', jsonb_build_object(
            'students_count', 2,
            'classrooms_count', 2,
            'avg_student_score', 82.50
        )
    ),
    gamilit.now_mexico() - INTERVAL '55 days',
    gamilit.now_mexico()
),

-- =====================================================
-- Admin: Admin Sistema - Nivel 10, Super Admin
-- =====================================================
(
    'a0000001-0000-0000-0000-000000000008'::uuid,
    '20ac4f00-102e-5307-c829-3f289d49c36f'::uuid,  -- Admin Sistema
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    10,                 -- level (max)
    50000,              -- total_xp
    0,                  -- xp_to_next_level (max level)
    'K''uk''ulkan'::gamification_system.maya_rank,
    100.00,             -- rank_progress (max rank)
    5000,               -- ml_coins
    10000,              -- ml_coins_earned_total
    5000,               -- ml_coins_spent_total
    0,                  -- ml_coins_earned_today
    gamilit.now_mexico() - INTERVAL '12 hours',
    30,                 -- current_streak
    30,                 -- max_streak
    gamilit.now_mexico() - INTERVAL '30 days',
    100,                -- days_active_total
    250,                -- exercises_completed
    5,                  -- modules_completed
    24000,              -- total_score
    96.00,              -- average_score
    50,                 -- perfect_scores
    20,                 -- achievements_earned (todos)
    5,                  -- certificates_earned
    '50:00:00'::interval,
    '08:00:00'::interval,
    100,                -- sessions_count
    5000,               -- weekly_xp
    50000,              -- monthly_xp
    50,                 -- weekly_exercises
    NULL,
    NULL,
    NULL,
    gamilit.now_mexico() - INTERVAL '30 minutes',
    gamilit.now_mexico() - INTERVAL '30 minutes',
    jsonb_build_object(
        'demo_user', true,
        'role', 'super_admin',
        'admin_access', 'full'
    ),
    gamilit.now_mexico() - INTERVAL '100 days',
    gamilit.now_mexico()
),

-- =====================================================
-- Director: Roberto Silva - Nivel 8, Director IEI
-- =====================================================
(
    'a0000001-0000-0000-0000-000000000009'::uuid,
    '21bc5f00-102e-5307-c829-3f289d49c36f'::uuid,  -- Roberto Silva
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    8,                  -- level
    25000,              -- total_xp
    3000,               -- xp_to_next_level
    'Halach Uinic'::gamification_system.maya_rank,
    75.00,              -- rank_progress
    2500,               -- ml_coins
    5000,               -- ml_coins_earned_total
    2500,               -- ml_coins_spent_total
    0,                  -- ml_coins_earned_today
    gamilit.now_mexico() - INTERVAL '14 hours',
    20,                 -- current_streak
    25,                 -- max_streak
    gamilit.now_mexico() - INTERVAL '20 days',
    80,                 -- days_active_total
    150,                -- exercises_completed
    5,                  -- modules_completed
    14000,              -- total_score
    94.00,              -- average_score
    35,                 -- perfect_scores
    15,                 -- achievements_earned
    5,                  -- certificates_earned
    '35:00:00'::interval,
    '06:00:00'::interval,
    80,                 -- sessions_count
    3500,               -- weekly_xp
    25000,              -- monthly_xp
    40,                 -- weekly_exercises
    NULL,
    NULL,
    NULL,
    gamilit.now_mexico() - INTERVAL '1 hour',
    gamilit.now_mexico() - INTERVAL '1 hour',
    jsonb_build_object(
        'demo_user', true,
        'role', 'director',
        'school_id', '50000000-0000-0000-0000-000000000002'
    ),
    gamilit.now_mexico() - INTERVAL '80 days',
    gamilit.now_mexico()
),

-- =====================================================
-- Padre: Carmen López - Nivel 1, Padre Observador
-- =====================================================
(
    'a0000001-0000-0000-0000-000000000010'::uuid,
    '30ac4f00-202e-6307-d839-4f389e49d47g'::uuid,  -- Carmen López
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    1,                  -- level
    100,                -- total_xp
    900,                -- xp_to_next_level
    'Ajaw'::gamification_system.maya_rank,
    5.00,               -- rank_progress
    100,                -- ml_coins (inicial)
    100,                -- ml_coins_earned_total
    0,                  -- ml_coins_spent_total
    0,                  -- ml_coins_earned_today
    gamilit.now_mexico() - INTERVAL '24 hours',
    0,                  -- current_streak
    1,                  -- max_streak
    NULL,               -- streak_started_at
    3,                  // days_active_total
    0,                  -- exercises_completed
    0,                  -- modules_completed
    0,                  -- total_score
    NULL,               -- average_score
    0,                  -- perfect_scores
    1,                  -- achievements_earned (Primera Visita)
    0,                  -- certificates_earned
    '00:30:00'::interval,
    '00:10:00'::interval,
    3,                  -- sessions_count
    50,                 -- weekly_xp
    100,                -- monthly_xp
    0,                  -- weekly_exercises
    NULL,
    NULL,
    NULL,
    gamilit.now_mexico() - INTERVAL '1 day',
    gamilit.now_mexico() - INTERVAL '1 day',
    jsonb_build_object(
        'demo_user', true,
        'role', 'parent',
        'children_ids', jsonb_build_array('01ac4f00-082e-4287-b899-2e169c49b05e')
    ),
    gamilit.now_mexico() - INTERVAL '3 days',
    gamilit.now_mexico()
)

ON CONFLICT (user_id) DO UPDATE SET
    level = EXCLUDED.level,
    total_xp = EXCLUDED.total_xp,
    xp_to_next_level = EXCLUDED.xp_to_next_level,
    current_rank = EXCLUDED.current_rank,
    rank_progress = EXCLUDED.rank_progress,
    ml_coins = EXCLUDED.ml_coins,
    ml_coins_earned_total = EXCLUDED.ml_coins_earned_total,
    ml_coins_spent_total = EXCLUDED.ml_coins_spent_total,
    current_streak = EXCLUDED.current_streak,
    max_streak = EXCLUDED.max_streak,
    exercises_completed = EXCLUDED.exercises_completed,
    modules_completed = EXCLUDED.modules_completed,
    total_score = EXCLUDED.total_score,
    average_score = EXCLUDED.average_score,
    perfect_scores = EXCLUDED.perfect_scores,
    achievements_earned = EXCLUDED.achievements_earned,
    metadata = EXCLUDED.metadata,
    updated_at = gamilit.now_mexico();

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
    stats_count INTEGER;
    students_count INTEGER;
    teachers_count INTEGER;
    admins_count INTEGER;
    avg_level NUMERIC;
    total_ml_coins INTEGER;
BEGIN
    SELECT COUNT(*) INTO stats_count
    FROM gamification_system.user_stats
    WHERE metadata->>'demo_user' = 'true';

    SELECT COUNT(*) INTO students_count
    FROM gamification_system.user_stats us
    JOIN auth_management.profiles p ON p.id = us.user_id
    WHERE us.metadata->>'demo_user' = 'true'
      AND p.role = 'student';

    SELECT COUNT(*) INTO teachers_count
    FROM gamification_system.user_stats us
    JOIN auth_management.profiles p ON p.id = us.user_id
    WHERE us.metadata->>'demo_user' = 'true'
      AND p.role = 'admin_teacher';

    SELECT COUNT(*) INTO admins_count
    FROM gamification_system.user_stats us
    JOIN auth_management.profiles p ON p.id = us.user_id
    WHERE us.metadata->>'demo_user' = 'true'
      AND p.role = 'super_admin';

    SELECT AVG(level)::NUMERIC(5,2) INTO avg_level
    FROM gamification_system.user_stats
    WHERE metadata->>'demo_user' = 'true';

    SELECT SUM(ml_coins) INTO total_ml_coins
    FROM gamification_system.user_stats
    WHERE metadata->>'demo_user' = 'true';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'USER STATS DEMO CREADOS EXITOSAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total user stats: %', stats_count;
    RAISE NOTICE '  - Estudiantes: %', students_count;
    RAISE NOTICE '  - Profesores: %', teachers_count;
    RAISE NOTICE '  - Administradores: %', admins_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Estadísticas Agregadas:';
    RAISE NOTICE '  - Nivel promedio: %', avg_level;
    RAISE NOTICE '  - ML Coins totales: %', total_ml_coins;
    RAISE NOTICE '========================================';

    IF stats_count = 10 THEN
        RAISE NOTICE ' Todos los user stats demo fueron creados correctamente';
    ELSE
        RAISE WARNING '  Se esperaban 10 user stats, se crearon %', stats_count;
    END IF;
END $$;

-- =====================================================
-- Listado de user stats
-- =====================================================

DO $$
DECLARE
    stats_record RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Listado de user stats demo:';
    RAISE NOTICE '========================================';

    FOR stats_record IN
        SELECT
            p.display_name,
            p.role,
            us.level,
            us.total_xp,
            us.current_rank,
            us.ml_coins,
            us.exercises_completed,
            us.current_streak,
            us.achievements_earned
        FROM gamification_system.user_stats us
        JOIN auth_management.profiles p ON p.id = us.user_id
        WHERE us.metadata->>'demo_user' = 'true'
        ORDER BY us.level DESC, us.total_xp DESC
    LOOP
        RAISE NOTICE '  - % [%]', stats_record.display_name, stats_record.role;
        RAISE NOTICE '    Nivel: % | XP: % | Rank: %',
            stats_record.level,
            stats_record.total_xp,
            stats_record.current_rank;
        RAISE NOTICE '    ML Coins: % | Ejercicios: % | Racha: % días | Achievements: %',
            stats_record.ml_coins,
            stats_record.exercises_completed,
            stats_record.current_streak,
            stats_record.achievements_earned;
        RAISE NOTICE '';
    END LOOP;

    RAISE NOTICE '========================================';
END $$;
