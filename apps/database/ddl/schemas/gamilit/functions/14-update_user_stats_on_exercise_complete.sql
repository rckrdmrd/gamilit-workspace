-- Nombre: update_user_stats_on_exercise_complete
-- Descripción: Actualiza estadísticas del usuario al completar un ejercicio
-- Schema: gamilit
-- Tipo: TRIGGER FUNCTION
-- Dependencias: gamification_system.user_stats, gamilit.now_mexico()
-- Uso: Trigger AFTER INSERT OR UPDATE ON progress_tracking.exercise_submissions

CREATE OR REPLACE FUNCTION gamilit.update_user_stats_on_exercise_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_is_correct BOOLEAN;
    v_xp_earned INTEGER;
    v_coins_earned INTEGER;
BEGIN
    -- Determinar si el ejercicio fue completado correctamente
    v_is_correct := (NEW.result = 'correct' OR NEW.score >= 70);

    -- Calcular XP y monedas ganadas
    IF v_is_correct THEN
        v_xp_earned := COALESCE(NEW.xp_earned, 10); -- Default 10 XP
        v_coins_earned := COALESCE(NEW.coins_earned, 5); -- Default 5 coins
    ELSE
        v_xp_earned := 0;
        v_coins_earned := 0;
    END IF;

    -- Actualizar estadísticas del usuario
    UPDATE gamification_system.user_stats
    SET
        exercises_completed = exercises_completed + 1,
        exercises_correct = exercises_correct + CASE WHEN v_is_correct THEN 1 ELSE 0 END,
        total_xp = total_xp + v_xp_earned,
        ml_coins_balance = ml_coins_balance + v_coins_earned,
        last_activity_at = gamilit.now_mexico(),
        updated_at = gamilit.now_mexico()
    WHERE user_id = NEW.user_id;

    -- Si no existe el registro de estadísticas, crearlo
    IF NOT FOUND THEN
        INSERT INTO gamification_system.user_stats (
            user_id,
            tenant_id,
            exercises_completed,
            exercises_correct,
            total_xp,
            ml_coins_balance,
            last_activity_at
        ) VALUES (
            NEW.user_id,
            COALESCE(NEW.tenant_id, '00000000-0000-0000-0000-000000000000'::UUID),
            1,
            CASE WHEN v_is_correct THEN 1 ELSE 0 END,
            v_xp_earned,
            v_coins_earned,
            gamilit.now_mexico()
        );
    END IF;

    -- Actualizar racha diaria si es aplicable
    -- (Esta lógica puede extenderse según requisitos de negocio)

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error pero no bloquear el insert del attempt
        RAISE WARNING 'Error al actualizar estadísticas de usuario %: %', NEW.user_id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Comentario descriptivo
COMMENT ON FUNCTION gamilit.update_user_stats_on_exercise_complete() IS
    'Trigger function que actualiza las estadísticas del usuario al completar un ejercicio. '
    'Incrementa contadores de ejercicios, XP, monedas ML y mantiene last_activity_at actualizado. '
    'Usa patrón UPSERT para crear registro de stats si no existe.';

-- =====================================================================================
-- NOTAS DE IMPLEMENTACIÓN
-- =====================================================================================
--
-- LÓGICA DE NEGOCIO:
-- - Ejercicio correcto si: result='correct' OR score >= 70
-- - XP ganado: 10 por defecto (puede personalizarse en NEW.xp_earned)
-- - Monedas ganadas: 5 por defecto (puede personalizarse en NEW.coins_earned)
-- - Ejercicios incorrectos: incrementan contador pero no otorgan XP ni monedas
--
-- PATRÓN UPSERT:
-- 1. Intenta UPDATE en user_stats existente
-- 2. Si no existe (NOT FOUND), hace INSERT
-- 3. Evita errores por falta de registro inicial
--
-- SEGURIDAD:
-- - SECURITY DEFINER permite escribir en user_stats incluso sin permisos directos
-- - Manejo de excepciones evita bloquear inserts por errores de stats
-- - Solo logs warning en caso de error, no falla la transacción
--
-- PERFORMANCE:
-- - Un solo UPDATE/INSERT por completion
-- - Usa COALESCE para defaults eficientemente
-- - Timestamp calculado una vez con now_mexico()
--
-- DEPENDENCIAS:
-- - Tabla: gamification_system.user_stats
-- - Función: gamilit.now_mexico()
-- - Columnas en NEW: user_id, tenant_id, result, score, xp_earned, coins_earned
--
-- =====================================================================================
-- USO EN TRIGGERS
-- =====================================================================================
--
-- CREATE TRIGGER trg_update_user_stats_on_exercise
--   AFTER INSERT OR UPDATE ON progress_tracking.exercise_submissions
--   FOR EACH ROW
--   WHEN (NEW.status = 'completed')
--   EXECUTE FUNCTION gamilit.update_user_stats_on_exercise_complete();
--
-- =====================================================================================
-- TESTING
-- =====================================================================================
--
-- Test 1: Insertar ejercicio correcto
-- INSERT INTO progress_tracking.exercise_submissions (user_id, exercise_id, result, score)
-- VALUES ('user-uuid', 'exercise-uuid', 'correct', 100);
-- -- Verificar: SELECT * FROM gamification_system.user_stats WHERE user_id = 'user-uuid';
--
-- Test 2: Insertar ejercicio incorrecto
-- INSERT INTO progress_tracking.exercise_submissions (user_id, exercise_id, result, score)
-- VALUES ('user-uuid', 'exercise-uuid', 'incorrect', 40);
-- -- Verificar: exercises_completed aumenta, exercises_correct no
--
-- Test 3: Usuario sin stats previos
-- INSERT INTO progress_tracking.exercise_submissions (user_id, exercise_id, result, score)
-- VALUES ('new-user-uuid', 'exercise-uuid', 'correct', 85);
-- -- Verificar: Se crea registro en user_stats automáticamente
--
-- =====================================================================================
-- CHANGELOG
-- =====================================================================================
-- 2025-11-03: Creación inicial (ISSUE-M8-002)
--             Implementada para desbloquear 2 triggers
--             Identificada como crítica en Microciclo M8
--             Lógica de gamificación: XP, monedas, contadores
-- =====================================================================================
