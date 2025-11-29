-- =============================================================================
-- Función: update_user_stats_on_submission_graded
-- Descripción: Actualiza estadísticas del usuario al calificarse una submission
-- Schema: gamilit
-- Tipo: TRIGGER FUNCTION
-- Dependencias: gamification_system.user_stats, gamilit.now_mexico()
-- Uso: Trigger AFTER UPDATE ON progress_tracking.exercise_submissions
-- =============================================================================

CREATE OR REPLACE FUNCTION gamilit.update_user_stats_on_submission_graded()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Validar que solo procesemos calificaciones nuevas
    -- Solo procesar si:
    -- 1. El status cambió a 'graded' o 'reviewed'
    -- 2. La respuesta es correcta
    -- 3. Hay XP a otorgar
    -- 4. El estado cambió (evitar re-disparos)
    IF NEW.status NOT IN ('graded', 'reviewed') THEN
        RETURN NEW;
    END IF;

    IF NEW.is_correct IS NOT TRUE THEN
        RETURN NEW;
    END IF;

    IF NEW.xp_earned <= 0 THEN
        RETURN NEW;
    END IF;

    -- Evitar re-disparos cuando el status o is_correct no cambiaron
    IF OLD.status IS NOT DISTINCT FROM NEW.status
       AND OLD.is_correct IS NOT DISTINCT FROM NEW.is_correct THEN
        RETURN NEW;
    END IF;

    -- Actualizar estadísticas del usuario (patrón UPSERT)
    UPDATE gamification_system.user_stats
    SET
        exercises_completed = exercises_completed + 1,
        total_xp = total_xp + NEW.xp_earned,
        ml_coins = ml_coins + NEW.ml_coins_earned,
        ml_coins_earned_total = ml_coins_earned_total + NEW.ml_coins_earned,
        last_activity_at = gamilit.now_mexico(),
        updated_at = gamilit.now_mexico()
    WHERE user_id = NEW.user_id;

    -- Si no existe el registro de estadísticas, crearlo (UPSERT pattern)
    IF NOT FOUND THEN
        INSERT INTO gamification_system.user_stats (
            user_id,
            tenant_id,
            exercises_completed,
            total_xp,
            ml_coins,
            ml_coins_earned_total,
            last_activity_at
        ) VALUES (
            NEW.user_id,
            '00000000-0000-0000-0000-000000000000'::UUID,
            1,
            NEW.xp_earned,
            100 + NEW.ml_coins_earned, -- Balance inicial de 100
            NEW.ml_coins_earned,
            gamilit.now_mexico()
        );
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error pero no bloquear el update de la submission
        RAISE WARNING 'Error al actualizar estadísticas de usuario % desde submission %: %',
            NEW.user_id, NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Comentario descriptivo
COMMENT ON FUNCTION gamilit.update_user_stats_on_submission_graded() IS
    'Trigger function que actualiza las estadísticas del usuario al calificarse una submission. '
    'Incrementa contadores de ejercicios, XP, monedas ML y mantiene last_activity_at actualizado. '
    'Usa patrón UPSERT para crear registro de stats si no existe. '
    'Complementa a update_user_stats_on_exercise_complete() para el flujo de submissions.';

-- =============================================================================
-- NOTAS DE IMPLEMENTACIÓN
-- =============================================================================
--
-- CONTEXTO Y ARQUITECTURA:
-- - Esta función complementa update_user_stats_on_exercise_complete() (función 14)
-- - Mientras función 14 maneja exercise_attempts (tabla legacy)
-- - Esta función maneja exercise_submissions (tabla activa del sistema)
-- - Ambas actualizan la misma tabla: gamification_system.user_stats
--
-- GAP IDENTIFICADO:
-- - exercise_attempts tiene trigger que actualiza user_stats ✅
-- - exercise_submissions NO tenía trigger equivalente ❌ (ESTE ARCHIVO LO SOLUCIONA)
-- - Esto causaba que misiones earn_xp no se actualizaran desde submissions
-- - La arquitectura debe ser BD-first: triggers = fuente de verdad
--
-- LÓGICA DE NEGOCIO:
-- - Solo procesa submissions con status 'graded' o 'reviewed'
-- - Solo otorga recompensas si is_correct = true
-- - Solo procesa si xp_earned > 0 (tiene recompensas que otorgar)
-- - Evita re-disparos verificando cambios en status o is_correct
-- - XP ganado: viene de NEW.xp_earned (calculado por ExerciseSubmissionService)
-- - Monedas ganadas: viene de NEW.ml_coins_earned (calculado por ExerciseSubmissionService)
--
-- PATRÓN UPSERT:
-- 1. Intenta UPDATE en user_stats existente
-- 2. Si no existe (NOT FOUND), hace INSERT con balance inicial de 100 ML Coins
-- 3. Evita errores por falta de registro inicial
-- 4. Mismo patrón que función 14 para consistencia
--
-- SEGURIDAD:
-- - SECURITY DEFINER permite escribir en user_stats incluso sin permisos directos
-- - Manejo de excepciones evita bloquear updates por errores de stats
-- - Solo logs warning en caso de error, no falla la transacción
--
-- PERFORMANCE:
-- - Validaciones tempranas (RETURN NEW) evitan procesamiento innecesario
-- - Un solo UPDATE/INSERT por calificación
-- - Timestamp calculado una vez con now_mexico()
-- - Índices en exercise_submissions(status, user_id) ayudan
--
-- DEPENDENCIAS:
-- - Tabla: gamification_system.user_stats
-- - Función: gamilit.now_mexico()
-- - Columnas en NEW: user_id, status, is_correct, xp_earned, ml_coins_earned
--
-- INTEGRACIÓN CON MISIONES:
-- - Al actualizar user_stats.total_xp, dispara automáticamente:
--   → trg_update_missions_on_earn_xp (trigger existente en user_stats)
-- - Esto completa la cadena:
--   submission graded → user_stats updated → missions earn_xp updated
-- - BD-first: toda la lógica de gamificación se ejecuta en triggers
--
-- =============================================================================
-- USO EN TRIGGERS
-- =============================================================================
--
-- CREATE TRIGGER trg_update_user_stats_on_submission
--   AFTER UPDATE ON progress_tracking.exercise_submissions
--   FOR EACH ROW
--   WHEN (NEW.status IN ('graded', 'reviewed')
--         AND NEW.is_correct = true
--         AND (OLD.status IS DISTINCT FROM NEW.status
--              OR OLD.is_correct IS DISTINCT FROM NEW.is_correct))
--   EXECUTE FUNCTION gamilit.update_user_stats_on_submission_graded();
--
-- =============================================================================
-- TESTING MANUAL
-- =============================================================================
--
-- SETUP: Crear usuario de prueba
-- INSERT INTO auth_management.profiles (id, username, email)
-- VALUES ('11111111-1111-1111-1111-111111111111', 'test_user', 'test@example.com');
--
-- INSERT INTO auth_management.users (id, profile_id, tenant_id)
-- VALUES ('11111111-1111-1111-1111-111111111111',
--         '11111111-1111-1111-1111-111111111111',
--         '00000000-0000-0000-0000-000000000000');
--
-- -- Test 1: Calificar submission correcta (debe actualizar stats)
-- INSERT INTO progress_tracking.exercise_submissions
--   (user_id, exercise_id, answer_data, status, is_correct, xp_earned, ml_coins_earned)
-- VALUES ('11111111-1111-1111-1111-111111111111',
--         '22222222-2222-2222-2222-222222222222',
--         '{"answer": "test"}'::jsonb,
--         'submitted', false, 0, 0);
--
-- -- Obtener el ID de la submission
-- SELECT id FROM progress_tracking.exercise_submissions
-- WHERE user_id = '11111111-1111-1111-1111-111111111111'
-- ORDER BY created_at DESC LIMIT 1;
--
-- -- Calificar la submission (ESTO DISPARA EL TRIGGER)
-- UPDATE progress_tracking.exercise_submissions
-- SET status = 'graded',
--     is_correct = true,
--     xp_earned = 200,
--     ml_coins_earned = 50,
--     graded_at = NOW()
-- WHERE id = '<id-obtenido-arriba>';
--
-- -- Verificar que se actualizaron las stats
-- SELECT user_id, exercises_completed, total_xp, ml_coins, ml_coins_earned_total, last_activity_at
-- FROM gamification_system.user_stats
-- WHERE user_id = '11111111-1111-1111-1111-111111111111';
-- -- Esperado: exercises_completed=1, total_xp=200, ml_coins=150, ml_coins_earned_total=50
--
-- -- Test 2: Calificar submission incorrecta (NO debe otorgar recompensas)
-- INSERT INTO progress_tracking.exercise_submissions
--   (user_id, exercise_id, answer_data, status, is_correct, xp_earned, ml_coins_earned)
-- VALUES ('11111111-1111-1111-1111-111111111111',
--         '33333333-3333-3333-3333-333333333333',
--         '{"answer": "wrong"}'::jsonb,
--         'submitted', false, 0, 0);
--
-- UPDATE progress_tracking.exercise_submissions
-- SET status = 'graded',
--     is_correct = false,
--     xp_earned = 0,
--     ml_coins_earned = 0,
--     graded_at = NOW()
-- WHERE id = (SELECT id FROM progress_tracking.exercise_submissions
--             WHERE user_id = '11111111-1111-1111-1111-111111111111'
--             AND exercise_id = '33333333-3333-3333-3333-333333333333');
--
-- -- Verificar que las stats NO cambiaron
-- SELECT user_id, exercises_completed, total_xp, ml_coins, ml_coins_earned_total
-- FROM gamification_system.user_stats
-- WHERE user_id = '11111111-1111-1111-1111-111111111111';
-- -- Esperado: Sin cambios desde Test 1
--
-- -- Test 3: Re-calificar misma submission (NO debe duplicar recompensas)
-- UPDATE progress_tracking.exercise_submissions
-- SET graded_at = NOW() -- Cambio que NO afecta status ni is_correct
-- WHERE id = (SELECT id FROM progress_tracking.exercise_submissions
--             WHERE user_id = '11111111-1111-1111-1111-111111111111'
--             ORDER BY created_at DESC LIMIT 1);
--
-- -- Verificar que las stats NO cambiaron
-- SELECT user_id, exercises_completed, total_xp, ml_coins, ml_coins_earned_total
-- FROM gamification_system.user_stats
-- WHERE user_id = '11111111-1111-1111-1111-111111111111';
-- -- Esperado: Sin cambios (no duplica recompensas)
--
-- -- Test 4: Usuario sin stats previos (debe crear registro con UPSERT)
-- INSERT INTO auth_management.profiles (id, username, email)
-- VALUES ('99999999-9999-9999-9999-999999999999', 'new_user', 'new@example.com');
--
-- INSERT INTO auth_management.users (id, profile_id, tenant_id)
-- VALUES ('99999999-9999-9999-9999-999999999999',
--         '99999999-9999-9999-9999-999999999999',
--         '00000000-0000-0000-0000-000000000000');
--
-- INSERT INTO progress_tracking.exercise_submissions
--   (user_id, exercise_id, answer_data, status, is_correct, xp_earned, ml_coins_earned)
-- VALUES ('99999999-9999-9999-9999-999999999999',
--         '44444444-4444-4444-4444-444444444444',
--         '{"answer": "test"}'::jsonb,
--         'submitted', false, 0, 0);
--
-- UPDATE progress_tracking.exercise_submissions
-- SET status = 'graded',
--     is_correct = true,
--     xp_earned = 150,
--     ml_coins_earned = 40,
--     graded_at = NOW()
-- WHERE user_id = '99999999-9999-9999-9999-999999999999';
--
-- -- Verificar que se creó registro en user_stats con balance inicial
-- SELECT user_id, exercises_completed, total_xp, ml_coins, ml_coins_earned_total
-- FROM gamification_system.user_stats
-- WHERE user_id = '99999999-9999-9999-9999-999999999999';
-- -- Esperado: exercises_completed=1, total_xp=150, ml_coins=140 (100+40), ml_coins_earned_total=40
--
-- -- CLEANUP
-- DELETE FROM gamification_system.user_stats
-- WHERE user_id IN ('11111111-1111-1111-1111-111111111111',
--                   '99999999-9999-9999-9999-999999999999');
--
-- DELETE FROM progress_tracking.exercise_submissions
-- WHERE user_id IN ('11111111-1111-1111-1111-111111111111',
--                   '99999999-9999-9999-9999-999999999999');
--
-- DELETE FROM auth_management.users
-- WHERE id IN ('11111111-1111-1111-1111-111111111111',
--              '99999999-9999-9999-9999-999999999999');
--
-- DELETE FROM auth_management.profiles
-- WHERE id IN ('11111111-1111-1111-1111-111111111111',
--              '99999999-9999-9999-9999-999999999999');
--
-- =============================================================================
-- CHANGELOG
-- =============================================================================
-- 2025-11-29: Creación inicial (GAP: submissions sin trigger user_stats)
--             - Implementada para cerrar brecha en sistema de recompensas
--             - Complementa función 14 (exercise_attempts)
--             - Permite que misiones earn_xp se actualicen desde submissions
--             - Arquitectura BD-first: triggers como fuente de verdad
--             - Patrón UPSERT consistente con función 14
--             - Validaciones anti-re-disparo implementadas
--             - Testing manual documentado
-- =============================================================================
