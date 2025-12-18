-- =====================================================
-- Script de Validación: Estructura de Objectives en Missions
-- Fecha: 2025-11-26
-- Propósito: Validar que initialize_user_missions crea objectives como ARRAY
-- =====================================================

\echo '=================================================='
\echo 'VALIDACIÓN: Estructura de objectives en missions'
\echo '=================================================='
\echo ''

DO $$
DECLARE
    v_test_user_id UUID;
    v_objectives JSONB;
    v_objectives_type TEXT;
    v_mission_count INT;
    v_total_missions INT;
    v_test_passed BOOLEAN := true;
BEGIN
    RAISE NOTICE '1. Buscando usuario de prueba...';

    -- Buscar un usuario existente
    SELECT id INTO v_test_user_id
    FROM auth_management.profiles
    LIMIT 1;

    IF v_test_user_id IS NULL THEN
        RAISE EXCEPTION 'No hay usuarios en la base de datos para testing';
    END IF;

    RAISE NOTICE 'Usuario de prueba: %', v_test_user_id;

    RAISE NOTICE '2. Limpiando misiones previas...';
    DELETE FROM gamification_system.missions WHERE user_id = v_test_user_id;

    RAISE NOTICE '3. Ejecutando initialize_user_missions()...';
    PERFORM gamilit.initialize_user_missions(v_test_user_id);

    RAISE NOTICE '4. Verificando estructura de objectives...';

    -- Verificar que se crearon 8 misiones
    SELECT COUNT(*) INTO v_total_missions
    FROM gamification_system.missions
    WHERE user_id = v_test_user_id;

    RAISE NOTICE 'Misiones creadas: %', v_total_missions;

    IF v_total_missions != 8 THEN
        RAISE NOTICE '❌ ERROR: Se esperaban 8 misiones, se crearon %', v_total_missions;
        v_test_passed := false;
    ELSE
        RAISE NOTICE '✅ OK: Se crearon las 8 misiones esperadas';
    END IF;

    -- Verificar que TODAS las misiones tienen objectives como ARRAY
    SELECT objectives, jsonb_typeof(objectives)
    INTO v_objectives, v_objectives_type
    FROM gamification_system.missions
    WHERE user_id = v_test_user_id
    LIMIT 1;

    RAISE NOTICE 'Tipo de objectives: %', v_objectives_type;
    RAISE NOTICE 'Ejemplo de objectives: %', v_objectives;

    IF v_objectives_type != 'array' THEN
        RAISE NOTICE '❌ ERROR: objectives NO es un array, es: %', v_objectives_type;
        v_test_passed := false;
    ELSE
        RAISE NOTICE '✅ OK: objectives es un ARRAY';
    END IF;

    RAISE NOTICE '5. Verificando compatibilidad con operador @>...';

    -- Test: Buscar misiones de tipo complete_exercises
    SELECT COUNT(*) INTO v_mission_count
    FROM gamification_system.missions
    WHERE user_id = v_test_user_id
    AND objectives @> '[{"type": "complete_exercises"}]'::jsonb;

    RAISE NOTICE 'Misiones con type=complete_exercises encontradas con @>: %', v_mission_count;

    IF v_mission_count = 0 THEN
        RAISE NOTICE '❌ ERROR: El operador @> NO encuentra misiones';
        v_test_passed := false;
    ELSE
        RAISE NOTICE '✅ OK: El operador @> funciona correctamente';
    END IF;

    -- Test: Buscar misión de earn_xp
    SELECT COUNT(*) INTO v_mission_count
    FROM gamification_system.missions
    WHERE user_id = v_test_user_id
    AND objectives @> '[{"type": "earn_xp"}]'::jsonb;

    RAISE NOTICE 'Misiones con type=earn_xp encontradas: %', v_mission_count;

    IF v_mission_count = 0 THEN
        RAISE NOTICE '❌ ERROR: No se encuentra misión de earn_xp';
        v_test_passed := false;
    END IF;

    -- Test: Verificar misión weekly_explorer con modules_visited
    SELECT COUNT(*) INTO v_mission_count
    FROM gamification_system.missions
    WHERE user_id = v_test_user_id
    AND template_id = 'weekly_explorer'
    AND objectives @> '[{"type": "explore_modules"}]'::jsonb
    AND objectives::text LIKE '%modules_visited%';

    RAISE NOTICE 'Misión weekly_explorer con modules_visited: %', v_mission_count;

    IF v_mission_count = 0 THEN
        RAISE NOTICE '❌ ERROR: weekly_explorer no tiene modules_visited';
        v_test_passed := false;
    ELSE
        RAISE NOTICE '✅ OK: weekly_explorer tiene modules_visited';
    END IF;

    RAISE NOTICE '6. Limpiando datos de prueba...';
    DELETE FROM gamification_system.missions WHERE user_id = v_test_user_id;

    RAISE NOTICE '';
    RAISE NOTICE '==================================================';
    IF v_test_passed THEN
        RAISE NOTICE '✅ ✅ ✅ VALIDACIÓN EXITOSA ✅ ✅ ✅';
        RAISE NOTICE 'La función initialize_user_missions está correcta';
    ELSE
        RAISE NOTICE '❌ ❌ ❌ VALIDACIÓN FALLIDA ❌ ❌ ❌';
        RAISE NOTICE 'Hay problemas en la función initialize_user_missions';
    END IF;
    RAISE NOTICE '==================================================';

END;
$$;
