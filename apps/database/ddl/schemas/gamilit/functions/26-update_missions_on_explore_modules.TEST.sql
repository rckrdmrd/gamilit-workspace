-- =============================================================================
-- SCRIPT DE PRUEBA: update_missions_on_explore_modules
-- Función: gamilit.update_missions_on_explore_modules()
-- Trigger: trg_update_missions_on_explore_modules
-- Fecha: 2025-11-28
-- =============================================================================
--
-- PROPÓSITO:
-- Este script valida que la función y trigger para actualizar misiones
-- con objetivo 'explore_modules' funcionen correctamente.
--
-- PREREQUISITOS:
-- - Base de datos gamilit_platform creada y operativa
-- - Schema gamification_system.missions existe
-- - Schema progress_tracking.module_progress existe
-- - Función gamilit.now_mexico() existe
-- - Usuario de prueba y módulos de prueba existen
--
-- USO:
-- psql -d gamilit_platform -f 26-update_missions_on_explore_modules.TEST.sql
-- =============================================================================

BEGIN;

-- =============================================================================
-- SETUP: Crear datos de prueba
-- =============================================================================

-- Variables de prueba (ajustar según datos reales en BD)
DO $$
DECLARE
    v_test_user_id UUID;
    v_module_a_id UUID;
    v_module_b_id UUID;
    v_module_c_id UUID;
    v_mission_id UUID;
    v_mission RECORD;
BEGIN
    -- Obtener un usuario de prueba (ajustar según datos reales)
    SELECT id INTO v_test_user_id
    FROM auth_management.profiles
    LIMIT 1;

    IF v_test_user_id IS NULL THEN
        RAISE EXCEPTION 'No hay usuarios en la base de datos para testing';
    END IF;

    RAISE NOTICE 'Usuario de prueba: %', v_test_user_id;

    -- Obtener 3 módulos de prueba
    SELECT ARRAY_AGG(id) INTO STRICT ARRAY[v_module_a_id, v_module_b_id, v_module_c_id]
    FROM (
        SELECT id FROM educational_content.modules LIMIT 3
    ) AS modules;

    RAISE NOTICE 'Módulos de prueba: %, %, %', v_module_a_id, v_module_b_id, v_module_c_id;

    -- =============================================================================
    -- TEST 1: Crear misión con objetivo explore_modules
    -- =============================================================================
    RAISE NOTICE '';
    RAISE NOTICE '====================================================================';
    RAISE NOTICE 'TEST 1: Crear misión de explorar 3 módulos';
    RAISE NOTICE '====================================================================';

    INSERT INTO gamification_system.missions (
        user_id,
        template_id,
        title,
        description,
        mission_type,
        objectives,
        rewards,
        status,
        progress,
        end_date
    ) VALUES (
        v_test_user_id,
        'test_explore_modules',
        'Explora 3 módulos diferentes',
        'Descubre nuevos contenidos explorando 3 módulos distintos',
        'daily',
        '[{
            "type": "explore_modules",
            "target": 3,
            "current": 0,
            "description": "Explora 3 módulos diferentes"
        }]'::jsonb,
        '{"xp": 75, "ml_coins": 30}'::jsonb,
        'active',
        0,
        NOW() + INTERVAL '1 day'
    ) RETURNING id INTO v_mission_id;

    RAISE NOTICE 'Misión creada con ID: %', v_mission_id;

    -- Verificar estado inicial
    SELECT * INTO v_mission
    FROM gamification_system.missions
    WHERE id = v_mission_id;

    RAISE NOTICE 'Estado inicial:';
    RAISE NOTICE '  - Status: %', v_mission.status;
    RAISE NOTICE '  - Progress: %', v_mission.progress;
    RAISE NOTICE '  - Objectives: %', v_mission.objectives;

    -- =============================================================================
    -- TEST 2: Usuario explora primer módulo
    -- =============================================================================
    RAISE NOTICE '';
    RAISE NOTICE '====================================================================';
    RAISE NOTICE 'TEST 2: Usuario explora módulo A (primera vez)';
    RAISE NOTICE '====================================================================';

    INSERT INTO progress_tracking.module_progress (
        user_id,
        module_id,
        status
    ) VALUES (
        v_test_user_id,
        v_module_a_id,
        'in_progress'
    );

    -- Verificar actualización
    SELECT * INTO v_mission
    FROM gamification_system.missions
    WHERE id = v_mission_id;

    RAISE NOTICE 'Después de explorar módulo A:';
    RAISE NOTICE '  - Status: %', v_mission.status;
    RAISE NOTICE '  - Progress: % (esperado: 33.33)', v_mission.progress;
    RAISE NOTICE '  - Objectives[0].current: % (esperado: 1)', (v_mission.objectives->0->>'current');
    RAISE NOTICE '  - Modules visited: %', (v_mission.objectives->0->'modules_visited');

    -- Validar
    ASSERT v_mission.progress::NUMERIC = 33.33, 'Progress debería ser 33.33%';
    ASSERT (v_mission.objectives->0->>'current')::INTEGER = 1, 'Current debería ser 1';
    ASSERT jsonb_array_length(v_mission.objectives->0->'modules_visited') = 1, 'Debería tener 1 módulo en modules_visited';
    ASSERT v_mission.status = 'in_progress', 'Status debería cambiar a in_progress';

    -- =============================================================================
    -- TEST 3: Usuario explora segundo módulo
    -- =============================================================================
    RAISE NOTICE '';
    RAISE NOTICE '====================================================================';
    RAISE NOTICE 'TEST 3: Usuario explora módulo B (diferente)';
    RAISE NOTICE '====================================================================';

    INSERT INTO progress_tracking.module_progress (
        user_id,
        module_id,
        status
    ) VALUES (
        v_test_user_id,
        v_module_b_id,
        'in_progress'
    );

    -- Verificar actualización
    SELECT * INTO v_mission
    FROM gamification_system.missions
    WHERE id = v_mission_id;

    RAISE NOTICE 'Después de explorar módulo B:';
    RAISE NOTICE '  - Status: %', v_mission.status;
    RAISE NOTICE '  - Progress: % (esperado: 66.67)', v_mission.progress;
    RAISE NOTICE '  - Objectives[0].current: % (esperado: 2)', (v_mission.objectives->0->>'current');
    RAISE NOTICE '  - Modules visited: %', (v_mission.objectives->0->'modules_visited');

    -- Validar
    ASSERT v_mission.progress::NUMERIC = 66.67, 'Progress debería ser 66.67%';
    ASSERT (v_mission.objectives->0->>'current')::INTEGER = 2, 'Current debería ser 2';
    ASSERT jsonb_array_length(v_mission.objectives->0->'modules_visited') = 2, 'Debería tener 2 módulos en modules_visited';

    -- =============================================================================
    -- TEST 4: Usuario vuelve al módulo A (NO debe contar otra vez)
    -- =============================================================================
    RAISE NOTICE '';
    RAISE NOTICE '====================================================================';
    RAISE NOTICE 'TEST 4: Usuario regresa a módulo A (no debe contar)';
    RAISE NOTICE '====================================================================';

    UPDATE progress_tracking.module_progress
    SET last_accessed_at = NOW()
    WHERE user_id = v_test_user_id AND module_id = v_module_a_id;

    -- Verificar que NO cambió
    SELECT * INTO v_mission
    FROM gamification_system.missions
    WHERE id = v_mission_id;

    RAISE NOTICE 'Después de regresar a módulo A:';
    RAISE NOTICE '  - Progress: % (esperado: SIN CAMBIOS = 66.67)', v_mission.progress;
    RAISE NOTICE '  - Objectives[0].current: % (esperado: SIN CAMBIOS = 2)', (v_mission.objectives->0->>'current');
    RAISE NOTICE '  - Modules visited: %', (v_mission.objectives->0->'modules_visited');

    -- Validar que NO cambió
    ASSERT v_mission.progress::NUMERIC = 66.67, 'Progress NO debería cambiar';
    ASSERT (v_mission.objectives->0->>'current')::INTEGER = 2, 'Current NO debería cambiar';
    ASSERT jsonb_array_length(v_mission.objectives->0->'modules_visited') = 2, 'Modules_visited NO debería cambiar';

    -- =============================================================================
    -- TEST 5: Usuario completa la misión (tercer módulo)
    -- =============================================================================
    RAISE NOTICE '';
    RAISE NOTICE '====================================================================';
    RAISE NOTICE 'TEST 5: Usuario explora módulo C (completa misión)';
    RAISE NOTICE '====================================================================';

    INSERT INTO progress_tracking.module_progress (
        user_id,
        module_id,
        status
    ) VALUES (
        v_test_user_id,
        v_module_c_id,
        'in_progress'
    );

    -- Verificar completación
    SELECT * INTO v_mission
    FROM gamification_system.missions
    WHERE id = v_mission_id;

    RAISE NOTICE 'Después de explorar módulo C:';
    RAISE NOTICE '  - Status: % (esperado: completed)', v_mission.status;
    RAISE NOTICE '  - Progress: % (esperado: 100)', v_mission.progress;
    RAISE NOTICE '  - Objectives[0].current: % (esperado: 3)', (v_mission.objectives->0->>'current');
    RAISE NOTICE '  - Modules visited: %', (v_mission.objectives->0->'modules_visited');
    RAISE NOTICE '  - Completed at: %', v_mission.completed_at;

    -- Validar completación
    ASSERT v_mission.progress::NUMERIC = 100, 'Progress debería ser 100%';
    ASSERT (v_mission.objectives->0->>'current')::INTEGER = 3, 'Current debería ser 3';
    ASSERT jsonb_array_length(v_mission.objectives->0->'modules_visited') = 3, 'Debería tener 3 módulos en modules_visited';
    ASSERT v_mission.status = 'completed', 'Status debería ser completed';
    ASSERT v_mission.completed_at IS NOT NULL, 'Completed_at debería estar establecido';

    -- =============================================================================
    -- CLEANUP: Eliminar datos de prueba
    -- =============================================================================
    RAISE NOTICE '';
    RAISE NOTICE '====================================================================';
    RAISE NOTICE 'CLEANUP: Eliminando datos de prueba';
    RAISE NOTICE '====================================================================';

    DELETE FROM progress_tracking.module_progress
    WHERE user_id = v_test_user_id AND module_id IN (v_module_a_id, v_module_b_id, v_module_c_id);

    DELETE FROM gamification_system.missions
    WHERE id = v_mission_id;

    RAISE NOTICE 'Datos de prueba eliminados';

    RAISE NOTICE '';
    RAISE NOTICE '====================================================================';
    RAISE NOTICE 'TODOS LOS TESTS PASARON EXITOSAMENTE!';
    RAISE NOTICE '====================================================================';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '';
        RAISE NOTICE '====================================================================';
        RAISE NOTICE 'TEST FALLÓ!';
        RAISE NOTICE 'Error: %', SQLERRM;
        RAISE NOTICE '====================================================================';
        RAISE;
END;
$$;

ROLLBACK; -- Hacer rollback para no dejar datos de prueba en BD

-- =============================================================================
-- FIN DEL SCRIPT DE PRUEBA
-- =============================================================================
--
-- Si todos los asserts pasan, verás:
-- NOTICE: TODOS LOS TESTS PASARON EXITOSAMENTE!
--
-- Si algún test falla, verás:
-- ERROR: assertion failed
-- =============================================================================
