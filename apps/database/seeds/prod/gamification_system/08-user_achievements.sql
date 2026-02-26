-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- Seed: User Achievements (Production Demo Data)
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- Description: Asociaciones de achievements desbloqueados por usuarios demo
-- Environment: production
-- Dependencies:
--   - auth.users (01-demo-users.sql, 02-production-users.sql)
--   - auth_management.profiles (03-profiles.sql, 04-profiles-complete.sql, 06-profiles-production.sql)
--   - gamification_system.achievements (04-achievements.sql)
--   - gamification_system.user_stats (05-user_stats.sql)
-- Execution Order: 8
-- Created: 2025-01-11
-- Updated: 2026-02-17 (Replaced hardcoded user_id UUIDs with profile lookup subqueries)
-- Version: 2.0.0
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
--
-- PATRON DE LOOKUP:
--   (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = '...')
-- Esto resuelve el profile ID dinamicamente, sin depender de UUIDs hardcodeados.
-- UUID-to-email mapping (from auth.02-production-users.sql):
--   2f5a9846-... = blu3wt7@gmail.com          (Azul Valentina, Estudiante 1 demo)
--   7a6a973e-... = hernandezfonsecabenjamin7@gmail.com (Benjamin H., Estudiante 2 demo)
--   00c742d9-... = marbancarlos916@gmail.com   (Carlos Marban, Estudiante 3 demo)
--   33306a65-... = diego.colores09@gmail.com   (Diego Colores, Estudiante 4 demo)
--   9951ad75-... = barraganfer03@gmail.com     (Fernando Barragan, Estudiante 7 demo)
--   735235f5-... = roman.rebollar.marcoantonio1008@gmail.com (Marco Antonio, Director demo)
--   5e738038-... = ricardolugo786@icloud.com   (Ricardo Lugo, Padre demo)
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP

SET search_path TO gamification_system, public;

-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- ESTUDIANTE 1: Azul Valentina → blu3wt7@gmail.com (3 achievements)
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP

-- Primera Visita (completado)
INSERT INTO gamification_system.user_achievements (
    id, user_id, achievement_id, progress, max_progress,
    is_completed, completion_percentage, completed_at,
    notified, viewed, rewards_claimed, rewards_received,
    progress_data, milestones_reached, metadata,
    started_at, created_at
) VALUES (
    gen_random_uuid(),
    (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'blu3wt7@gmail.com'),
    (SELECT id FROM gamification_system.achievements WHERE name = 'Primera Visita' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    1, 1, true, 100.00,
    gamilit.now_mexico() - INTERVAL '12 days',
    true, true, true,
    jsonb_build_object(
        'xp', 50,
        'ml_coins', 25,
        'badge_url', '/badges/achievements/primera-visita.png'
    ),
    jsonb_build_object('first_login', true),
    ARRAY['first_login'],
    jsonb_build_object('demo_achievement', true, 'category', 'special'),
    gamilit.now_mexico() - INTERVAL '12 days',
    gamilit.now_mexico() - INTERVAL '12 days'
) ON CONFLICT (user_id, achievement_id) DO UPDATE SET
    is_completed = EXCLUDED.is_completed,
    completion_percentage = EXCLUDED.completion_percentage;

-- Primeros Pasos (completado)
INSERT INTO gamification_system.user_achievements (
    id, user_id, achievement_id, progress, max_progress,
    is_completed, completion_percentage, completed_at,
    notified, viewed, rewards_claimed, rewards_received,
    progress_data, milestones_reached, metadata,
    started_at, created_at
) VALUES (
    gen_random_uuid(),
    (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'blu3wt7@gmail.com'),
    (SELECT id FROM gamification_system.achievements WHERE name = 'Primeros Pasos' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    1, 1, true, 100.00,
    gamilit.now_mexico() - INTERVAL '10 days',
    true, true, true,
    jsonb_build_object(
        'xp', 100,
        'ml_coins', 50,
        'badge_url', '/badges/achievements/primeros-pasos.png'
    ),
    jsonb_build_object('exercises_completed', 1),
    ARRAY['first_exercise'],
    jsonb_build_object('demo_achievement', true, 'category', 'progress'),
    gamilit.now_mexico() - INTERVAL '11 days',
    gamilit.now_mexico() - INTERVAL '10 days'
) ON CONFLICT (user_id, achievement_id) DO UPDATE SET
    is_completed = EXCLUDED.is_completed,
    completion_percentage = EXCLUDED.completion_percentage;

-- Racha de 3 Dias (completado)
INSERT INTO gamification_system.user_achievements (
    id, user_id, achievement_id, progress, max_progress,
    is_completed, completion_percentage, completed_at,
    notified, viewed, rewards_claimed, rewards_received,
    progress_data, milestones_reached, metadata,
    started_at, created_at
) VALUES (
    gen_random_uuid(),
    (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'blu3wt7@gmail.com'),
    (SELECT id FROM gamification_system.achievements WHERE name = 'Racha de 3 Días' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    3, 3, true, 100.00,
    gamilit.now_mexico() - INTERVAL '5 days',
    true, true, true,
    jsonb_build_object(
        'xp', 150,
        'ml_coins', 50,
        'badge_url', '/badges/achievements/racha-3-dias.png'
    ),
    jsonb_build_object('streak_days', 3),
    ARRAY['day_1', 'day_2', 'day_3'],
    jsonb_build_object('demo_achievement', true, 'category', 'streak'),
    gamilit.now_mexico() - INTERVAL '7 days',
    gamilit.now_mexico() - INTERVAL '5 days'
) ON CONFLICT (user_id, achievement_id) DO UPDATE SET
    is_completed = EXCLUDED.is_completed,
    completion_percentage = EXCLUDED.completion_percentage;

-- Lector Principiante (en progreso 60%)
INSERT INTO gamification_system.user_achievements (
    id, user_id, achievement_id, progress, max_progress,
    is_completed, completion_percentage, completed_at,
    notified, viewed, rewards_claimed, rewards_received,
    progress_data, milestones_reached, metadata,
    started_at, created_at
) VALUES (
    gen_random_uuid(),
    (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'blu3wt7@gmail.com'),
    (SELECT id FROM gamification_system.achievements WHERE name = 'Lector Principiante' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    15, 25, false, 60.00, NULL,
    false, false, false, '{}'::jsonb,
    jsonb_build_object('exercises_completed', 15, 'target', 25),
    ARRAY['milestone_10'],
    jsonb_build_object('demo_achievement', true, 'category', 'progress', 'status', 'in_progress'),
    gamilit.now_mexico() - INTERVAL '10 days',
    gamilit.now_mexico() - INTERVAL '10 days'
) ON CONFLICT (user_id, achievement_id) DO UPDATE SET
    progress = EXCLUDED.progress,
    completion_percentage = EXCLUDED.completion_percentage;

-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- ESTUDIANTE 2: Benjamin Hernandez → hernandezfonsecabenjamin7@gmail.com (1 achievement)
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP

-- Primera Visita (completado)
INSERT INTO gamification_system.user_achievements (
    id, user_id, achievement_id, progress, max_progress,
    is_completed, completion_percentage, completed_at,
    notified, viewed, rewards_claimed, rewards_received,
    progress_data, milestones_reached, metadata,
    started_at, created_at
) VALUES (
    gen_random_uuid(),
    (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'hernandezfonsecabenjamin7@gmail.com'),
    (SELECT id FROM gamification_system.achievements WHERE name = 'Primera Visita' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    1, 1, true, 100.00,
    gamilit.now_mexico() - INTERVAL '8 days',
    true, true, true,
    jsonb_build_object(
        'xp', 50,
        'ml_coins', 25,
        'badge_url', '/badges/achievements/primera-visita.png'
    ),
    jsonb_build_object('first_login', true),
    ARRAY['first_login'],
    jsonb_build_object('demo_achievement', true, 'category', 'special'),
    gamilit.now_mexico() - INTERVAL '8 days',
    gamilit.now_mexico() - INTERVAL '8 days'
) ON CONFLICT (user_id, achievement_id) DO UPDATE SET
    is_completed = EXCLUDED.is_completed,
    completion_percentage = EXCLUDED.completion_percentage;

-- Primeros Pasos (en progreso 20%)
INSERT INTO gamification_system.user_achievements (
    id, user_id, achievement_id, progress, max_progress,
    is_completed, completion_percentage, completed_at,
    notified, viewed, rewards_claimed, rewards_received,
    progress_data, milestones_reached, metadata,
    started_at, created_at
) VALUES (
    gen_random_uuid(),
    (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'hernandezfonsecabenjamin7@gmail.com'),
    (SELECT id FROM gamification_system.achievements WHERE name = 'Primeros Pasos' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    5, 25, false, 20.00, NULL,
    false, false, false, '{}'::jsonb,
    jsonb_build_object('exercises_completed', 5, 'target', 25),
    ARRAY[]::text[],
    jsonb_build_object('demo_achievement', true, 'category', 'progress', 'status', 'in_progress'),
    gamilit.now_mexico() - INTERVAL '8 days',
    gamilit.now_mexico() - INTERVAL '8 days'
) ON CONFLICT (user_id, achievement_id) DO UPDATE SET
    progress = EXCLUDED.progress,
    completion_percentage = EXCLUDED.completion_percentage;

-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- ESTUDIANTE 3: Carlos Marban → marbancarlos916@gmail.com (5+ achievements - modulo 1 completado)
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP

INSERT INTO gamification_system.user_achievements
(id, user_id, achievement_id, progress, max_progress, is_completed, completion_percentage, completed_at, notified, viewed, rewards_claimed, rewards_received, progress_data, milestones_reached, metadata, started_at, created_at)
VALUES
-- Primera Visita
(gen_random_uuid(), (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'marbancarlos916@gmail.com'), (SELECT id FROM gamification_system.achievements WHERE name = 'Primera Visita' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 1, 1, true, 100.00, gamilit.now_mexico() - INTERVAL '15 days', true, true, true, jsonb_build_object('xp', 50, 'ml_coins', 25), jsonb_build_object('first_login', true), ARRAY['first_login'], jsonb_build_object('demo_achievement', true), gamilit.now_mexico() - INTERVAL '15 days', gamilit.now_mexico() - INTERVAL '15 days'),
-- Primeros Pasos
(gen_random_uuid(), (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'marbancarlos916@gmail.com'), (SELECT id FROM gamification_system.achievements WHERE name = 'Primeros Pasos' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 1, 1, true, 100.00, gamilit.now_mexico() - INTERVAL '14 days', true, true, true, jsonb_build_object('xp', 100, 'ml_coins', 50), jsonb_build_object('exercises_completed', 1), ARRAY['first_exercise'], jsonb_build_object('demo_achievement', true), gamilit.now_mexico() - INTERVAL '14 days', gamilit.now_mexico() - INTERVAL '14 days'),
-- Lector Principiante
(gen_random_uuid(), (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'marbancarlos916@gmail.com'), (SELECT id FROM gamification_system.achievements WHERE name = 'Lector Principiante' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 25, 25, true, 100.00, gamilit.now_mexico() - INTERVAL '12 days', true, true, true, jsonb_build_object('xp', 200, 'ml_coins', 75), jsonb_build_object('exercises_completed', 25), ARRAY['milestone_10', 'milestone_20', 'milestone_25'], jsonb_build_object('demo_achievement', true), gamilit.now_mexico() - INTERVAL '13 days', gamilit.now_mexico() - INTERVAL '12 days'),
-- Racha de 7 Dias
(gen_random_uuid(), (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'marbancarlos916@gmail.com'), (SELECT id FROM gamification_system.achievements WHERE name = 'Racha de 7 Días' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 7, 7, true, 100.00, gamilit.now_mexico() - INTERVAL '7 days', true, true, true, jsonb_build_object('xp', 300, 'ml_coins', 100), jsonb_build_object('streak_days', 7), ARRAY['day_3', 'day_5', 'day_7'], jsonb_build_object('demo_achievement', true), gamilit.now_mexico() - INTERVAL '10 days', gamilit.now_mexico() - INTERVAL '7 days'),
-- Modulo 1 Completado
(gen_random_uuid(), (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'marbancarlos916@gmail.com'), (SELECT id FROM gamification_system.achievements WHERE name = 'Comprensión Literal Dominada' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 1, 1, true, 100.00, gamilit.now_mexico() - INTERVAL '10 days', true, true, true, jsonb_build_object('xp', 500, 'ml_coins', 150, 'certificate_url', '/certificates/modules/modulo-1.pdf'), jsonb_build_object('module_completed', 'modulo-01', 'score', 88), ARRAY['module_1_completed'], jsonb_build_object('demo_achievement', true), gamilit.now_mexico() - INTERVAL '12 days', gamilit.now_mexico() - INTERVAL '10 days'),
-- Lector Experimentado (en progreso 40% por Modulo 2)
(gen_random_uuid(), (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'marbancarlos916@gmail.com'), (SELECT id FROM gamification_system.achievements WHERE name = 'Lector Experimentado' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 35, 100, false, 35.00, NULL, false, false, false, '{}'::jsonb, jsonb_build_object('exercises_completed', 35, 'target', 100), ARRAY['milestone_25'], jsonb_build_object('demo_achievement', true, 'status', 'in_progress'), gamilit.now_mexico() - INTERVAL '12 days', gamilit.now_mexico() - INTERVAL '10 days')
ON CONFLICT (user_id, achievement_id) DO UPDATE SET
    progress = EXCLUDED.progress,
    is_completed = EXCLUDED.is_completed,
    completion_percentage = EXCLUDED.completion_percentage;

-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- ESTUDIANTE 4: Diego Colores → diego.colores09@gmail.com (2 achievements)
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP

INSERT INTO gamification_system.user_achievements
(id, user_id, achievement_id, progress, max_progress, is_completed, completion_percentage, completed_at, notified, viewed, rewards_claimed, rewards_received, progress_data, milestones_reached, metadata, started_at, created_at)
VALUES
-- Primera Visita
(gen_random_uuid(), (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'diego.colores09@gmail.com'), (SELECT id FROM gamification_system.achievements WHERE name = 'Primera Visita' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 1, 1, true, 100.00, gamilit.now_mexico() - INTERVAL '14 days', true, true, true, jsonb_build_object('xp', 50, 'ml_coins', 25), jsonb_build_object('first_login', true), ARRAY['first_login'], jsonb_build_object('demo_achievement', true), gamilit.now_mexico() - INTERVAL '14 days', gamilit.now_mexico() - INTERVAL '14 days'),
-- Primeros Pasos
(gen_random_uuid(), (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'diego.colores09@gmail.com'), (SELECT id FROM gamification_system.achievements WHERE name = 'Primeros Pasos' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 1, 1, true, 100.00, gamilit.now_mexico() - INTERVAL '13 days', true, true, true, jsonb_build_object('xp', 100, 'ml_coins', 50), jsonb_build_object('exercises_completed', 1), ARRAY['first_exercise'], jsonb_build_object('demo_achievement', true), gamilit.now_mexico() - INTERVAL '13 days', gamilit.now_mexico() - INTERVAL '13 days'),
-- Lector Principiante (en progreso 80%)
(gen_random_uuid(), (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'diego.colores09@gmail.com'), (SELECT id FROM gamification_system.achievements WHERE name = 'Lector Principiante' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 20, 25, false, 80.00, NULL, false, false, false, '{}'::jsonb, jsonb_build_object('exercises_completed', 20, 'target', 25), ARRAY['milestone_10', 'milestone_20'], jsonb_build_object('demo_achievement', true, 'status', 'in_progress'), gamilit.now_mexico() - INTERVAL '12 days', gamilit.now_mexico() - INTERVAL '12 days')
ON CONFLICT (user_id, achievement_id) DO UPDATE SET
    progress = EXCLUDED.progress,
    completion_percentage = EXCLUDED.completion_percentage;

-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- ESTUDIANTE DE TESTING: student@gamilit.com (4 achievements demo)
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- CORRECCION 2026-01-10: Se agregan achievements de demo para permitir testing
-- visual de la pagina /achievements. Anteriormente deshabilitado (2026-01-07).
-- User: student@gamilit.com (dynamically resolved via profile lookup)
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP

DO $$
DECLARE
    v_student_profile_id uuid;
BEGIN
    SELECT p.id INTO v_student_profile_id
    FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'student@gamilit.com';

    INSERT INTO gamification_system.user_achievements
    (id, user_id, achievement_id, progress, max_progress, is_completed, completion_percentage, completed_at, notified, viewed, rewards_claimed, rewards_received, progress_data, milestones_reached, metadata, started_at, created_at)
    VALUES
    -- Primera Visita (completado)
    (gen_random_uuid(), v_student_profile_id, (SELECT id FROM gamification_system.achievements WHERE name = 'Primera Visita' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 1, 1, true, 100.00, gamilit.now_mexico() - INTERVAL '5 days', true, true, true, jsonb_build_object('xp', 50, 'ml_coins', 25), jsonb_build_object('first_login', true), ARRAY['first_login'], jsonb_build_object('demo_achievement', true, 'category', 'special'), gamilit.now_mexico() - INTERVAL '5 days', gamilit.now_mexico() - INTERVAL '5 days'),
    -- Primeros Pasos (completado)
    (gen_random_uuid(), v_student_profile_id, (SELECT id FROM gamification_system.achievements WHERE name = 'Primeros Pasos' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 1, 1, true, 100.00, gamilit.now_mexico() - INTERVAL '4 days', true, true, true, jsonb_build_object('xp', 100, 'ml_coins', 50), jsonb_build_object('exercises_completed', 1), ARRAY['first_exercise'], jsonb_build_object('demo_achievement', true, 'category', 'progress'), gamilit.now_mexico() - INTERVAL '4 days', gamilit.now_mexico() - INTERVAL '4 days'),
    -- Racha de 3 Dias (completado, rewards sin reclamar)
    (gen_random_uuid(), v_student_profile_id, (SELECT id FROM gamification_system.achievements WHERE name = 'Racha de 3 Días' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 3, 3, true, 100.00, gamilit.now_mexico() - INTERVAL '2 days', true, true, false, jsonb_build_object('xp', 150, 'ml_coins', 50), jsonb_build_object('streak_days', 3), ARRAY['day_1', 'day_2', 'day_3'], jsonb_build_object('demo_achievement', true, 'category', 'streak'), gamilit.now_mexico() - INTERVAL '4 days', gamilit.now_mexico() - INTERVAL '2 days'),
    -- Lector Principiante (en progreso 60%)
    (gen_random_uuid(), v_student_profile_id, (SELECT id FROM gamification_system.achievements WHERE name = 'Lector Principiante' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 6, 10, false, 60.00, NULL, false, false, false, '{}'::jsonb, jsonb_build_object('exercises_completed', 6, 'target', 10), ARRAY['milestone_5'], jsonb_build_object('demo_achievement', true, 'category', 'progress', 'status', 'in_progress'), gamilit.now_mexico() - INTERVAL '5 days', gamilit.now_mexico() - INTERVAL '3 days')
    ON CONFLICT (user_id, achievement_id) DO UPDATE SET
        progress = EXCLUDED.progress,
        is_completed = EXCLUDED.is_completed,
        completion_percentage = EXCLUDED.completion_percentage,
        rewards_claimed = EXCLUDED.rewards_claimed;
END $$;

-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- DESHABILITADO: PROFESOR DE TESTING (teacher@gamilit.com)
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- CORRECCION 2026-01-07: Los usuarios de testing NO deben tener achievements
-- preexistentes. Deben empezar desde cero como un usuario recien registrado.
-- User: teacher@gamilit.com (dynamically resolved via profile lookup)
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP

-- [DESHABILITADO] Los achievements para teacher@gamilit.com han sido removidos
-- para que el usuario inicie sin achievements previos.

-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- ESTUDIANTE: Fernando Barragan → barraganfer03@gmail.com (5 achievements de estudiante)
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP

INSERT INTO gamification_system.user_achievements
(id, user_id, achievement_id, progress, max_progress, is_completed, completion_percentage, completed_at, notified, viewed, rewards_claimed, rewards_received, progress_data, milestones_reached, metadata, started_at, created_at)
VALUES
-- Primera Visita
(gen_random_uuid(), (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'barraganfer03@gmail.com'), (SELECT id FROM gamification_system.achievements WHERE name = 'Primera Visita' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 1, 1, true, 100.00, gamilit.now_mexico() - INTERVAL '28 days', true, true, true, jsonb_build_object('xp', 50, 'ml_coins', 25), jsonb_build_object('first_login', true), ARRAY['first_login'], jsonb_build_object('demo_achievement', true), gamilit.now_mexico() - INTERVAL '28 days', gamilit.now_mexico() - INTERVAL '28 days'),
-- Racha de 7 Dias
(gen_random_uuid(), (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'barraganfer03@gmail.com'), (SELECT id FROM gamification_system.achievements WHERE name = 'Racha de 7 Días' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 7, 7, true, 100.00, gamilit.now_mexico() - INTERVAL '20 days', true, true, true, jsonb_build_object('xp', 300, 'ml_coins', 100), jsonb_build_object('streak_days', 7), ARRAY['day_3', 'day_5', 'day_7'], jsonb_build_object('demo_achievement', true), gamilit.now_mexico() - INTERVAL '23 days', gamilit.now_mexico() - INTERVAL '20 days'),
-- Racha de 30 Dias (en progreso 40%)
(gen_random_uuid(), (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'barraganfer03@gmail.com'), (SELECT id FROM gamification_system.achievements WHERE name = 'Racha de 30 Días' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 12, 30, false, 40.00, NULL, false, false, false, '{}'::jsonb, jsonb_build_object('streak_days', 12, 'target', 30), ARRAY['day_7'], jsonb_build_object('demo_achievement', true, 'status', 'in_progress'), gamilit.now_mexico() - INTERVAL '28 days', gamilit.now_mexico() - INTERVAL '16 days'),
-- Companero de Aula
(gen_random_uuid(), (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'barraganfer03@gmail.com'), (SELECT id FROM gamification_system.achievements WHERE name = 'Compañero de Aula' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 1, 1, true, 100.00, gamilit.now_mexico() - INTERVAL '26 days', true, true, true, jsonb_build_object('xp', 200, 'ml_coins', 75), jsonb_build_object('classroom_joined', true), ARRAY['join_classroom'], jsonb_build_object('demo_achievement', true), gamilit.now_mexico() - INTERVAL '26 days', gamilit.now_mexico() - INTERVAL '26 days'),
-- Estudiante Colaborativo
(gen_random_uuid(), (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'barraganfer03@gmail.com'), (SELECT id FROM gamification_system.achievements WHERE name = 'Estudiante Colaborativo' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 1, 1, true, 100.00, gamilit.now_mexico() - INTERVAL '23 days', true, true, true, jsonb_build_object('xp', 300, 'ml_coins', 100), jsonb_build_object('collaborations', 10), ARRAY['collab_5', 'collab_10'], jsonb_build_object('demo_achievement', true), gamilit.now_mexico() - INTERVAL '24 days', gamilit.now_mexico() - INTERVAL '23 days')
ON CONFLICT (user_id, achievement_id) DO UPDATE SET
    progress = EXCLUDED.progress,
    is_completed = EXCLUDED.is_completed,
    completion_percentage = EXCLUDED.completion_percentage;

-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- DESHABILITADO: ADMIN DE TESTING (admin@gamilit.com)
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- CORRECCION 2026-01-07: Los usuarios de testing NO deben tener achievements
-- preexistentes. Deben empezar desde cero como un usuario recien registrado.
-- User: admin@gamilit.com (dynamically resolved via profile lookup)
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP

-- [DESHABILITADO] Los achievements para admin@gamilit.com han sido removidos
-- para que el usuario inicie sin achievements previos.

-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- DIRECTOR: Marco Antonio Roman → roman.rebollar.marcoantonio1008@gmail.com (6 achievements)
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP

INSERT INTO gamification_system.user_achievements
(id, user_id, achievement_id, progress, max_progress, is_completed, completion_percentage, completed_at, notified, viewed, rewards_claimed, rewards_received, progress_data, milestones_reached, metadata, started_at, created_at)
VALUES
-- Primera Visita
(gen_random_uuid(), (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'roman.rebollar.marcoantonio1008@gmail.com'), (SELECT id FROM gamification_system.achievements WHERE name = 'Primera Visita' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 1, 1, true, 100.00, gamilit.now_mexico() - INTERVAL '45 days', true, true, true, jsonb_build_object('xp', 50, 'ml_coins', 25), jsonb_build_object('first_login', true), ARRAY['first_login'], jsonb_build_object('demo_achievement', true), gamilit.now_mexico() - INTERVAL '45 days', gamilit.now_mexico() - INTERVAL '45 days'),
-- Racha de 30 Dias (en progreso 67%)
(gen_random_uuid(), (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'roman.rebollar.marcoantonio1008@gmail.com'), (SELECT id FROM gamification_system.achievements WHERE name = 'Racha de 30 Días' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 20, 30, false, 66.67, NULL, false, false, false, '{}'::jsonb, jsonb_build_object('streak_days', 20, 'target', 30), ARRAY['day_7', 'day_14'], jsonb_build_object('demo_achievement', true, 'status', 'in_progress'), gamilit.now_mexico() - INTERVAL '45 days', gamilit.now_mexico() - INTERVAL '25 days'),
-- Companero de Aula
(gen_random_uuid(), (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'roman.rebollar.marcoantonio1008@gmail.com'), (SELECT id FROM gamification_system.achievements WHERE name = 'Compañero de Aula' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 1, 1, true, 100.00, gamilit.now_mexico() - INTERVAL '40 days', true, true, true, jsonb_build_object('xp', 200, 'ml_coins', 75), jsonb_build_object('classroom_joined', true), ARRAY['join_classroom'], jsonb_build_object('demo_achievement', true), gamilit.now_mexico() - INTERVAL '40 days', gamilit.now_mexico() - INTERVAL '40 days')
ON CONFLICT (user_id, achievement_id) DO UPDATE SET
    progress = EXCLUDED.progress,
    is_completed = EXCLUDED.is_completed,
    completion_percentage = EXCLUDED.completion_percentage;

-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- PADRE: Ricardo Lugo → ricardolugo786@icloud.com (1 achievement)
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP

INSERT INTO gamification_system.user_achievements
(id, user_id, achievement_id, progress, max_progress, is_completed, completion_percentage, completed_at, notified, viewed, rewards_claimed, rewards_received, progress_data, milestones_reached, metadata, started_at, created_at)
VALUES
-- Primera Visita
(gen_random_uuid(), (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'ricardolugo786@icloud.com'), (SELECT id FROM gamification_system.achievements WHERE name = 'Primera Visita' AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 1, 1, true, 100.00, gamilit.now_mexico() - INTERVAL '5 days', true, false, false, jsonb_build_object('xp', 50, 'ml_coins', 25), jsonb_build_object('first_login', true), ARRAY['first_login'], jsonb_build_object('demo_achievement', true), gamilit.now_mexico() - INTERVAL '5 days', gamilit.now_mexico() - INTERVAL '5 days')
ON CONFLICT (user_id, achievement_id) DO UPDATE SET
    is_completed = EXCLUDED.is_completed,
    completion_percentage = EXCLUDED.completion_percentage;

-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- VERIFICACION DE USER ACHIEVEMENTS
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP

DO $$
DECLARE
    v_achievement_count INTEGER;
    v_completed_count INTEGER;
    v_in_progress_count INTEGER;
BEGIN
    -- Contar user achievements insertados
    SELECT COUNT(*) INTO v_achievement_count
    FROM gamification_system.user_achievements
    WHERE metadata->>'demo_achievement' = 'true';

    -- Contar completados
    SELECT COUNT(*) INTO v_completed_count
    FROM gamification_system.user_achievements
    WHERE metadata->>'demo_achievement' = 'true'
    AND is_completed = true;

    -- Contar en progreso
    SELECT COUNT(*) INTO v_in_progress_count
    FROM gamification_system.user_achievements
    WHERE metadata->>'demo_achievement' = 'true'
    AND is_completed = false;

    RAISE NOTICE 'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP';
    RAISE NOTICE 'User Achievements - Verificacion de Seeds';
    RAISE NOTICE 'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP';
    RAISE NOTICE 'Total de user achievements insertados: %', v_achievement_count;
    RAISE NOTICE 'Achievements completados: %', v_completed_count;
    RAISE NOTICE 'Achievements en progreso: %', v_in_progress_count;
    RAISE NOTICE 'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP';

    -- Verificar que tenemos achievements
    IF v_achievement_count = 0 THEN
        RAISE WARNING 'No se insertaron user achievements demo';
    ELSIF v_achievement_count < 35 THEN
        RAISE WARNING 'Se esperaban al menos 35 user achievements, se insertaron %', v_achievement_count;
    ELSE
        RAISE NOTICE ' Seeds de user achievements insertados correctamente';
    END IF;
END $$;

-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- LISTADO DE USER ACHIEVEMENTS INSERTADOS (para debugging)
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP

DO $$
DECLARE
    v_user_record RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Resumen de achievements por usuario:';
    RAISE NOTICE 'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP';

    FOR v_user_record IN (
        SELECT
            u.email,
            p.display_name,
            COUNT(ua.id) as total_achievements,
            COUNT(CASE WHEN ua.is_completed THEN 1 END) as completed,
            COUNT(CASE WHEN NOT ua.is_completed THEN 1 END) as in_progress
        FROM auth.users u
        JOIN auth_management.profiles p ON p.user_id = u.id
        LEFT JOIN gamification_system.user_achievements ua ON ua.user_id = p.id
        WHERE ua.metadata->>'demo_achievement' = 'true'
        GROUP BY u.email, p.display_name
        ORDER BY u.email
    ) LOOP
        RAISE NOTICE '% (%): % total | % completados | % en progreso',
            v_user_record.display_name,
            v_user_record.email,
            v_user_record.total_achievements,
            v_user_record.completed,
            v_user_record.in_progress;
    END LOOP;

    RAISE NOTICE 'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP';
END $$;

-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- FIN DEL SEED
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
