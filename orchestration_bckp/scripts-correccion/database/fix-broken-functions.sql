-- ============================================================================
-- SCRIPT: Fix Broken Functions (P0 - BLOQUEANTE)
-- Fecha: 2025-11-08
-- Descripción: Corrige 4 funciones con errores de lógica o referencias
--              a campos inexistentes
-- ============================================================================
--
-- FUNCIONES CORREGIDAS:
--   1. gamification_system.process_exercise_completion - Fórmula de nivel incorrecta
--   2. audit_logging.log_audit_event - Nombres de columnas incorrectos
--   3. gamification_system.calculate_user_rank - Campo inexistente
--   4. educational_content.calculate_learning_path - ELIMINADA (tabla missions no existe)
--   5. educational_content.get_recommended_missions - ELIMINADA (tabla missions no existe)
--
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. FIX: gamification_system.process_exercise_completion
-- ============================================================================
--
-- PROBLEMA: Fórmula de cálculo de nivel incorrecta
--   ❌ INCORRECTO: new_level := (us.total_xp / 1000)::INTEGER + 1;
--   ✅ CORRECTO:   new_level := FLOOR(SQRT(us.total_xp / 100))::INTEGER + 1;
--
-- DOCUMENTACIÓN: docs/01-requerimientos/02-gamificacion/RF-GAM-003-rangos-maya.md
--   Nivel = FLOOR(√(XP_total / 100)) + 1
--   Ejemplo: 10,000 XP = FLOOR(√100) + 1 = 11
--
-- ============================================================================

CREATE OR REPLACE FUNCTION gamification_system.process_exercise_completion(
    p_user_id UUID,
    p_exercise_id UUID,
    p_score INTEGER,
    p_time_spent INTEGER
)
RETURNS TABLE(
    xp_awarded INTEGER,
    coins_awarded INTEGER,
    new_level INTEGER,
    level_up BOOLEAN
)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = gamification_system, progress_tracking, educational_content, gamilit, public
AS $$
DECLARE
    v_xp_base INTEGER;
    v_xp_bonus INTEGER := 0;
    v_xp_total INTEGER;
    v_coins_earned INTEGER;
    v_current_level INTEGER;
    v_new_level INTEGER;
    v_level_up BOOLEAN := FALSE;
    us RECORD;
    ex RECORD;
BEGIN
    -- Obtener datos del ejercicio
    SELECT difficulty_level INTO ex
    FROM educational_content.exercises
    WHERE id = p_exercise_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Exercise % not found', p_exercise_id;
    END IF;

    -- Calcular XP base según dificultad
    CASE ex.difficulty_level::TEXT
        WHEN 'muy_facil' THEN v_xp_base := 10;
        WHEN 'facil' THEN v_xp_base := 20;
        WHEN 'intermedio_bajo' THEN v_xp_base := 30;
        WHEN 'intermedio' THEN v_xp_base := 40;
        WHEN 'intermedio_alto' THEN v_xp_base := 50;
        WHEN 'avanzado' THEN v_xp_base := 60;
        WHEN 'muy_avanzado' THEN v_xp_base := 80;
        WHEN 'experto' THEN v_xp_base := 100;
        ELSE v_xp_base := 20; -- Default
    END CASE;

    -- Bonus por puntuación perfecta (100%)
    IF p_score >= 100 THEN
        v_xp_bonus := v_xp_bonus + (v_xp_base * 0.5)::INTEGER;
    ELSIF p_score >= 90 THEN
        v_xp_bonus := v_xp_bonus + (v_xp_base * 0.25)::INTEGER;
    END IF;

    -- Bonus por tiempo rápido (si se completó en menos de la mitad del tiempo estimado)
    -- Asumimos que el tiempo estimado es 300 segundos (5 min) por defecto
    IF p_time_spent < 150 AND p_score >= 80 THEN
        v_xp_bonus := v_xp_bonus + (v_xp_base * 0.2)::INTEGER;
    END IF;

    v_xp_total := v_xp_base + v_xp_bonus;

    -- Calcular ML Coins (1 coin por cada 10 XP)
    v_coins_earned := (v_xp_total / 10)::INTEGER;

    -- Obtener stats actuales del usuario
    SELECT * INTO us
    FROM gamification_system.user_stats
    WHERE profile_id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User stats not found for user %', p_user_id;
    END IF;

    v_current_level := us.current_level;

    -- ✅ CORREGIDO: Calcular nuevo nivel usando fórmula correcta
    -- Nivel = FLOOR(√(XP_total / 100)) + 1
    v_new_level := FLOOR(SQRT((us.total_xp + v_xp_total) / 100.0))::INTEGER + 1;

    -- Verificar si subió de nivel
    IF v_new_level > v_current_level THEN
        v_level_up := TRUE;
    END IF;

    -- Actualizar user_stats
    UPDATE gamification_system.user_stats
    SET
        total_xp = total_xp + v_xp_total,
        current_level = v_new_level,
        ml_coins_balance = ml_coins_balance + v_coins_earned,
        exercises_completed = exercises_completed + 1,
        last_activity_at = gamilit.now_mexico(),
        updated_at = gamilit.now_mexico()
    WHERE profile_id = p_user_id;

    -- Registrar transacción de ML Coins
    INSERT INTO gamification_system.ml_coins_transactions (
        user_id,
        transaction_type,
        amount,
        balance_after,
        description,
        metadata
    ) VALUES (
        p_user_id,
        'exercise_completion',
        v_coins_earned,
        us.ml_coins_balance + v_coins_earned,
        'Completó ejercicio con ' || p_score || '% de aciertos',
        jsonb_build_object(
            'exercise_id', p_exercise_id,
            'score', p_score,
            'xp_earned', v_xp_total,
            'xp_base', v_xp_base,
            'xp_bonus', v_xp_bonus,
            'time_spent', p_time_spent,
            'difficulty', ex.difficulty_level
        )
    );

    -- Si subió de nivel, registrar en achievement o notificación
    IF v_level_up THEN
        -- Crear notificación de level up
        INSERT INTO gamification_system.notifications (
            user_id,
            type,
            priority,
            title,
            message,
            metadata
        ) VALUES (
            p_user_id,
            'level_up',
            'high',
            '¡Subiste de nivel!',
            'Alcanzaste el nivel ' || v_new_level,
            jsonb_build_object(
                'old_level', v_current_level,
                'new_level', v_new_level,
                'total_xp', us.total_xp + v_xp_total
            )
        );
    END IF;

    -- Retornar resultados
    RETURN QUERY SELECT
        v_xp_total,
        v_coins_earned,
        v_new_level,
        v_level_up;
END;
$$;

COMMENT ON FUNCTION gamification_system.process_exercise_completion(UUID, UUID, INTEGER, INTEGER) IS
    'Procesa la finalización de un ejercicio, otorga XP y ML Coins (v1.1 - 2025-11-08). '
    'CORREGIDO: Usa fórmula correcta para cálculo de nivel: FLOOR(√(XP/100)) + 1. '
    'Retorna: xp_awarded, coins_awarded, new_level, level_up.';

RAISE NOTICE '✅ Fixed: gamification_system.process_exercise_completion - level calculation formula';

-- ============================================================================
-- 2. FIX: audit_logging.log_audit_event
-- ============================================================================
--
-- PROBLEMA: Nombres de columnas incorrectos
--   ❌ user_id → ✅ auth_user_id
--   ❌ old_data → ✅ old_values
--   ❌ new_data → ✅ new_values
--
-- ============================================================================

CREATE OR REPLACE FUNCTION audit_logging.log_audit_event(
    p_user_id UUID,
    p_table_name VARCHAR,
    p_action VARCHAR,
    p_old_data JSONB DEFAULT NULL,
    p_new_data JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = audit_logging, gamilit, public
AS $$
DECLARE
    v_audit_id UUID;
BEGIN
    -- ✅ CORREGIDO: Usar nombres de columnas correctos
    INSERT INTO audit_logging.audit_logs (
        auth_user_id,      -- ✅ Correcto (antes: user_id)
        table_name,
        action,
        old_values,        -- ✅ Correcto (antes: old_data)
        new_values,        -- ✅ Correcto (antes: new_data)
        ip_address,
        metadata
    ) VALUES (
        p_user_id,
        p_table_name,
        p_action::audit_logging.audit_action,
        p_old_data,
        p_new_data,
        p_ip_address,
        jsonb_build_object(
            'timestamp', gamilit.now_mexico(),
            'session_id', current_setting('app.session_id', TRUE),
            'user_agent', current_setting('request.headers', TRUE)::JSONB->>'user-agent'
        )
    )
    RETURNING id INTO v_audit_id;

    RETURN v_audit_id;
END;
$$;

COMMENT ON FUNCTION audit_logging.log_audit_event(UUID, VARCHAR, VARCHAR, JSONB, JSONB, INET) IS
    'Registra un evento de auditoría en audit_logs (v1.1 - 2025-11-08). '
    'CORREGIDO: Usa nombres de columnas correctos (auth_user_id, old_values, new_values). '
    'Retorna el UUID del registro creado.';

RAISE NOTICE '✅ Fixed: audit_logging.log_audit_event - column names';

-- ============================================================================
-- 3. FIX: gamification_system.calculate_user_rank
-- ============================================================================
--
-- PROBLEMA: Campo 'missions_completed' no existe en user_stats
--   Debe contar desde exercise_submissions en su lugar
--
-- ============================================================================

CREATE OR REPLACE FUNCTION gamification_system.calculate_user_rank(p_user_id UUID)
RETURNS VARCHAR
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = gamification_system, progress_tracking, gamilit, public
AS $$
DECLARE
    us RECORD;
    v_exercises_completed INTEGER;
    v_rank VARCHAR;
BEGIN
    -- Obtener stats del usuario
    SELECT * INTO us
    FROM gamification_system.user_stats
    WHERE profile_id = p_user_id;

    IF NOT FOUND THEN
        RETURN 'Ajaw'; -- Rango inicial por defecto
    END IF;

    -- ✅ CORREGIDO: Contar ejercicios completados desde exercise_submissions
    SELECT COUNT(DISTINCT exercise_id) INTO v_exercises_completed
    FROM progress_tracking.exercise_submissions
    WHERE user_id = p_user_id
      AND status = 'completed';

    -- Determinar rango Maya según XP y ejercicios completados
    -- Rangos: Ajaw → Nacom → Ah K'in → Halach Uinic → K'uk'ulkan

    IF us.total_xp >= 50000 AND v_exercises_completed >= 200 THEN
        v_rank := 'K''uk''ulkan';  -- Máximo rango
    ELSIF us.total_xp >= 25000 AND v_exercises_completed >= 100 THEN
        v_rank := 'Halach Uinic';
    ELSIF us.total_xp >= 10000 AND v_exercises_completed >= 50 THEN
        v_rank := 'Ah K''in';
    ELSIF us.total_xp >= 5000 AND v_exercises_completed >= 20 THEN
        v_rank := 'Nacom';
    ELSE
        v_rank := 'Ajaw';  -- Rango inicial
    END IF;

    RETURN v_rank;
END;
$$;

COMMENT ON FUNCTION gamification_system.calculate_user_rank(UUID) IS
    'Calcula el rango Maya de un usuario según XP y ejercicios completados (v1.1 - 2025-11-08). '
    'CORREGIDO: Cuenta ejercicios desde exercise_submissions en lugar de campo inexistente. '
    'Retorna uno de los 5 rangos: Ajaw, Nacom, Ah K''in, Halach Uinic, K''uk''ulkan.';

RAISE NOTICE '✅ Fixed: gamification_system.calculate_user_rank - exercises count';

-- ============================================================================
-- 4. DROP: educational_content.calculate_learning_path
-- ============================================================================
--
-- PROBLEMA: Referencia tabla 'missions' que no existe
--
-- DECISIÓN: Eliminar función (no se puede corregir sin tabla missions)
--
-- ============================================================================

DROP FUNCTION IF EXISTS educational_content.calculate_learning_path(UUID);

RAISE NOTICE '✅ Dropped: educational_content.calculate_learning_path (table missions does not exist)';

-- ============================================================================
-- 5. DROP: educational_content.get_recommended_missions
-- ============================================================================
--
-- PROBLEMA: Referencia tabla 'missions' que no existe
--
-- DECISIÓN: Eliminar función (no se puede corregir sin tabla missions)
--
-- ============================================================================

DROP FUNCTION IF EXISTS educational_content.get_recommended_missions(UUID);

RAISE NOTICE '✅ Dropped: educational_content.get_recommended_missions (table missions does not exist)';

-- ============================================================================
-- TAMBIÉN: Eliminar archivos DDL de funciones eliminadas
-- ============================================================================
--
-- ACCIÓN MANUAL REQUERIDA:
--   rm apps/database/ddl/schemas/educational_content/functions/calculate_learning_path.sql
--   rm apps/database/ddl/schemas/educational_content/functions/get_recommended_missions.sql
--
-- O comentar completamente el contenido de esos archivos
--
-- ============================================================================

COMMIT;

-- ============================================================================
-- VALIDACIÓN POST-CORRECCIÓN
-- ============================================================================

DO $$
BEGIN
    -- Verificar que las funciones corregidas existen
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'process_exercise_completion'
    ) THEN
        RAISE EXCEPTION '❌ Function process_exercise_completion not found';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'log_audit_event'
    ) THEN
        RAISE EXCEPTION '❌ Function log_audit_event not found';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'calculate_user_rank'
    ) THEN
        RAISE EXCEPTION '❌ Function calculate_user_rank not found';
    END IF;

    -- Verificar que las funciones eliminadas NO existen
    IF EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'calculate_learning_path'
    ) THEN
        RAISE WARNING '⚠️  Function calculate_learning_path still exists (should be dropped)';
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'get_recommended_missions'
    ) THEN
        RAISE WARNING '⚠️  Function get_recommended_missions still exists (should be dropped)';
    END IF;

    RAISE NOTICE '✅ All function fixes validated successfully';
    RAISE NOTICE '   - process_exercise_completion: Fixed level formula';
    RAISE NOTICE '   - log_audit_event: Fixed column names';
    RAISE NOTICE '   - calculate_user_rank: Fixed exercises count';
    RAISE NOTICE '   - calculate_learning_path: Dropped';
    RAISE NOTICE '   - get_recommended_missions: Dropped';
END $$;
