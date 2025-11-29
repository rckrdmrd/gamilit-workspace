-- =============================================================================
-- Test Script: update_missions_on_perfect_scores
-- Descripción: Pruebas de validación para la función y trigger de scores perfectos
-- Fecha: 2025-11-28
-- =============================================================================

-- =============================================================================
-- SETUP: Preparar datos de prueba
-- =============================================================================

-- Limpiar datos de prueba anteriores
DO $$
BEGIN
    DELETE FROM progress_tracking.exercise_attempts
    WHERE user_id IN (
        SELECT id FROM auth_management.profiles WHERE email LIKE 'test_perfect_%@test.com'
    );

    DELETE FROM gamification_system.missions
    WHERE user_id IN (
        SELECT id FROM auth_management.profiles WHERE email LIKE 'test_perfect_%@test.com'
    );

    DELETE FROM auth_management.profiles WHERE email LIKE 'test_perfect_%@test.com';
END $$;

-- Crear usuario de prueba
INSERT INTO auth_management.profiles (id, email, first_name, last_name)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'test_perfect_user@test.com',
    'Test',
    'Perfect'
) ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email;

-- Crear ejercicio de prueba
INSERT INTO educational_content.exercises (id, title, mechanic_type, difficulty_level)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Test Exercise for Perfect Scores',
    'fill_in_blank',
    'intermediate'
) ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title;

-- =============================================================================
-- TEST 1: Usuario con misión de scores perfectos
-- =============================================================================

\echo '==================================================================='
\echo 'TEST 1: Crear misión de scores perfectos'
\echo '==================================================================='

-- Crear misión de prueba
INSERT INTO gamification_system.missions (
    id,
    user_id,
    template_id,
    title,
    description,
    mission_type,
    objectives,
    rewards,
    status,
    progress,
    start_date,
    end_date
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'daily_perfect_scores',
    'Obtén 5 scores perfectos',
    'Completa 5 ejercicios con puntaje perfecto (100/100)',
    'daily',
    '[{"type": "perfect_scores", "target": 5, "current": 0, "description": "Consigue 5 puntajes perfectos"}]'::jsonb,
    '{"xp": 100, "ml_coins": 50}'::jsonb,
    'active',
    0,
    NOW(),
    NOW() + INTERVAL '1 day'
) ON CONFLICT (id) DO UPDATE
SET objectives = EXCLUDED.objectives,
    progress = EXCLUDED.progress,
    status = EXCLUDED.status;

-- Verificar estado inicial
SELECT
    id,
    title,
    status,
    progress,
    objectives->0->>'current' as current_value,
    objectives->0->>'target' as target_value
FROM gamification_system.missions
WHERE id = '33333333-3333-3333-3333-333333333333';

-- =============================================================================
-- TEST 2: Insertar ejercicio con score perfecto (100)
-- =============================================================================

\echo ''
\echo '==================================================================='
\echo 'TEST 2: Insertar ejercicio con score perfecto (100)'
\echo '==================================================================='

-- Insertar ejercicio con score perfecto
INSERT INTO progress_tracking.exercise_attempts (
    user_id,
    exercise_id,
    submitted_answers,
    is_correct,
    score,
    time_spent_seconds
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '{"answer": "correct"}'::jsonb,
    true,
    100,
    120
);

-- Verificar que la misión se actualizó
SELECT
    id,
    title,
    status,
    progress,
    objectives->0->>'current' as current_value,
    objectives->0->>'target' as target_value
FROM gamification_system.missions
WHERE id = '33333333-3333-3333-3333-333333333333';

-- Resultado esperado: current = 1, progress = 20%

-- =============================================================================
-- TEST 3: Insertar más ejercicios con score perfecto
-- =============================================================================

\echo ''
\echo '==================================================================='
\echo 'TEST 3: Insertar 4 ejercicios más con score perfecto'
\echo '==================================================================='

-- Insertar 4 ejercicios más
INSERT INTO progress_tracking.exercise_attempts (
    user_id,
    exercise_id,
    submitted_answers,
    is_correct,
    score,
    time_spent_seconds
)
SELECT
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '{"answer": "correct"}'::jsonb,
    true,
    100,
    120
FROM generate_series(1, 4);

-- Verificar que la misión se completó
SELECT
    id,
    title,
    status,
    progress,
    completed_at IS NOT NULL as is_completed,
    objectives->0->>'current' as current_value,
    objectives->0->>'target' as target_value
FROM gamification_system.missions
WHERE id = '33333333-3333-3333-3333-333333333333';

-- Resultado esperado: current = 5, progress = 100%, status = 'completed', completed_at NOT NULL

-- =============================================================================
-- TEST 4: Score no perfecto no afecta la misión
-- =============================================================================

\echo ''
\echo '==================================================================='
\echo 'TEST 4: Score 85 no debe actualizar misión de scores perfectos'
\echo '==================================================================='

-- Crear nueva misión
INSERT INTO gamification_system.missions (
    id,
    user_id,
    template_id,
    title,
    mission_type,
    objectives,
    rewards,
    end_date
) VALUES (
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'daily_perfect_scores_2',
    'Test score no perfecto',
    'daily',
    '[{"type": "perfect_scores", "target": 3, "current": 0}]'::jsonb,
    '{"xp": 50}'::jsonb,
    NOW() + INTERVAL '1 day'
) ON CONFLICT (id) DO UPDATE
SET objectives = EXCLUDED.objectives,
    progress = 0,
    status = 'active';

-- Insertar ejercicio con score 85
INSERT INTO progress_tracking.exercise_attempts (
    user_id,
    exercise_id,
    submitted_answers,
    is_correct,
    score
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '{"answer": "partial"}'::jsonb,
    true,
    85
);

-- Verificar que NO se actualizó
SELECT
    id,
    title,
    status,
    progress,
    objectives->0->>'current' as current_value
FROM gamification_system.missions
WHERE id = '44444444-4444-4444-4444-444444444444';

-- Resultado esperado: current = 0, progress = 0%

-- =============================================================================
-- TEST 5: Ejercicio incorrecto no afecta la misión
-- =============================================================================

\echo ''
\echo '==================================================================='
\echo 'TEST 5: Ejercicio incorrecto no debe actualizar misión'
\echo '==================================================================='

-- Insertar ejercicio incorrecto (aunque tenga score 100)
INSERT INTO progress_tracking.exercise_attempts (
    user_id,
    exercise_id,
    submitted_answers,
    is_correct,
    score
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '{"answer": "wrong"}'::jsonb,
    false,
    100
);

-- Verificar que NO se actualizó
SELECT
    id,
    title,
    status,
    progress,
    objectives->0->>'current' as current_value
FROM gamification_system.missions
WHERE id = '44444444-4444-4444-4444-444444444444';

-- Resultado esperado: current = 0, progress = 0%

-- =============================================================================
-- TEST 6: Misión con múltiples objetivos
-- =============================================================================

\echo ''
\echo '==================================================================='
\echo 'TEST 6: Misión con múltiples objetivos (uno de perfect_scores)'
\echo '==================================================================='

-- Crear misión con múltiples objetivos
INSERT INTO gamification_system.missions (
    id,
    user_id,
    template_id,
    title,
    mission_type,
    objectives,
    rewards,
    end_date
) VALUES (
    '55555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    'mixed_objectives',
    'Misión combinada',
    'weekly',
    '[
        {"type": "complete_exercises", "target": 10, "current": 0},
        {"type": "perfect_scores", "target": 3, "current": 0},
        {"type": "earn_xp", "target": 500, "current": 0}
    ]'::jsonb,
    '{"xp": 200, "ml_coins": 100}'::jsonb,
    NOW() + INTERVAL '7 days'
) ON CONFLICT (id) DO UPDATE
SET objectives = EXCLUDED.objectives,
    progress = 0,
    status = 'active';

-- Insertar ejercicio perfecto
INSERT INTO progress_tracking.exercise_attempts (
    user_id,
    exercise_id,
    submitted_answers,
    is_correct,
    score
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '{"answer": "correct"}'::jsonb,
    true,
    100
);

-- Verificar que solo el objetivo perfect_scores se actualizó
SELECT
    id,
    title,
    status,
    progress,
    objectives->0->>'current' as complete_exercises_current,
    objectives->1->>'current' as perfect_scores_current,
    objectives->2->>'current' as earn_xp_current
FROM gamification_system.missions
WHERE id = '55555555-5555-5555-5555-555555555555';

-- Resultado esperado:
-- complete_exercises_current = 0 (no se actualiza por este trigger)
-- perfect_scores_current = 1 (SE actualiza)
-- earn_xp_current = 0 (no se actualiza por este trigger)
-- progress debería reflejar 1/3 del segundo objetivo completado

-- =============================================================================
-- CLEANUP: Limpiar datos de prueba
-- =============================================================================

\echo ''
\echo '==================================================================='
\echo 'CLEANUP: Limpiando datos de prueba'
\echo '==================================================================='

DO $$
BEGIN
    DELETE FROM progress_tracking.exercise_attempts
    WHERE user_id = '11111111-1111-1111-1111-111111111111';

    DELETE FROM gamification_system.missions
    WHERE user_id = '11111111-1111-1111-1111-111111111111';

    DELETE FROM educational_content.exercises
    WHERE id = '22222222-2222-2222-2222-222222222222';

    DELETE FROM auth_management.profiles
    WHERE id = '11111111-1111-1111-1111-111111111111';

    RAISE NOTICE 'Datos de prueba eliminados exitosamente';
END $$;

\echo ''
\echo '==================================================================='
\echo 'TESTS COMPLETADOS'
\echo '==================================================================='
