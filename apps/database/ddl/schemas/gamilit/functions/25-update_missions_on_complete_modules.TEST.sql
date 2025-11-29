-- =============================================================================
-- TEST SUITE: update_missions_on_complete_modules()
-- Función: gamilit.update_missions_on_complete_modules
-- Trigger: trg_update_missions_on_complete_modules
-- Fecha: 2025-11-28
-- =============================================================================
--
-- PREREQUISITOS:
-- 1. Función gamilit.update_missions_on_complete_modules() creada
-- 2. Trigger trg_update_missions_on_complete_modules creado
-- 3. Usuario de prueba existente en auth_management.profiles
-- 4. Módulos de prueba en educational_content.modules
--
-- EJECUCIÓN:
-- psql -d gamilit_platform -f 25-update_missions_on_complete_modules.TEST.sql
--
-- =============================================================================

-- Limpiar datos de prueba previos
DO $$
BEGIN
    DELETE FROM gamification_system.missions WHERE template_id LIKE 'TEST_%';
    DELETE FROM progress_tracking.module_progress WHERE user_id IN (
        SELECT id FROM auth_management.profiles WHERE username LIKE 'test_user_%'
    );
    RAISE NOTICE 'Test data cleaned';
END $$;

-- =============================================================================
-- TEST 1: Primera completación (not_started -> completed)
-- ESPERADO: Misión incrementa current de 0 a 1, progress de 0% a 50%
-- =============================================================================
DO $$
DECLARE
    v_test_user_id UUID;
    v_test_module_id UUID;
    v_mission_id UUID;
    v_mission RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '====== TEST 1: Primera completación ======';

    -- Obtener usuario y módulo de prueba
    SELECT id INTO v_test_user_id
    FROM auth_management.profiles
    WHERE username = 'test_student' LIMIT 1;

    SELECT id INTO v_test_module_id
    FROM educational_content.modules
    LIMIT 1;

    IF v_test_user_id IS NULL OR v_test_module_id IS NULL THEN
        RAISE WARNING 'Skipping Test 1: No test user or module found';
        RETURN;
    END IF;

    -- Crear misión de prueba
    INSERT INTO gamification_system.missions (
        user_id, template_id, title, mission_type, objectives, rewards, end_date
    ) VALUES (
        v_test_user_id,
        'TEST_DAILY_COMPLETE_MODULES',
        'Test: Completar 2 módulos',
        'daily',
        '[{"type": "complete_modules", "target": 2, "current": 0, "description": "Completa 2 módulos"}]'::jsonb,
        '{"xp": 100, "ml_coins": 50}'::jsonb,
        gamilit.now_mexico() + INTERVAL '1 day'
    ) RETURNING id INTO v_mission_id;

    RAISE NOTICE 'Misión creada: % (current: 0/2, progress: 0%%)', v_mission_id;

    -- Crear module_progress en estado not_started
    INSERT INTO progress_tracking.module_progress (
        user_id, module_id, status
    ) VALUES (
        v_test_user_id, v_test_module_id, 'not_started'
    );

    -- ACCIÓN: Cambiar status a completed (primera vez)
    UPDATE progress_tracking.module_progress
    SET status = 'completed', completed_at = gamilit.now_mexico()
    WHERE user_id = v_test_user_id AND module_id = v_test_module_id;

    -- VERIFICAR: Misión debe tener current: 1/2, progress: 50%
    SELECT * INTO v_mission
    FROM gamification_system.missions
    WHERE id = v_mission_id;

    IF (v_mission.objectives->0->>'current')::INTEGER = 1 AND v_mission.progress = 50 THEN
        RAISE NOTICE '✅ TEST 1 PASSED: current=1/2, progress=50%%';
    ELSE
        RAISE WARNING '❌ TEST 1 FAILED: current=%, progress=% (esperado: current=1, progress=50)',
            v_mission.objectives->0->>'current', v_mission.progress;
    END IF;

END $$;

-- =============================================================================
-- TEST 2: Segunda completación (completar misión al 100%)
-- ESPERADO: current 2/2, progress 100%, status 'completed'
-- =============================================================================
DO $$
DECLARE
    v_test_user_id UUID;
    v_test_module_id UUID;
    v_mission_id UUID;
    v_mission RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '====== TEST 2: Completar misión al 100%% ======';

    SELECT id INTO v_test_user_id
    FROM auth_management.profiles
    WHERE username = 'test_student' LIMIT 1;

    -- Buscar misión de test anterior
    SELECT id INTO v_mission_id
    FROM gamification_system.missions
    WHERE user_id = v_test_user_id AND template_id = 'TEST_DAILY_COMPLETE_MODULES'
    LIMIT 1;

    IF v_mission_id IS NULL THEN
        RAISE WARNING 'Skipping Test 2: No test mission found (run Test 1 first)';
        RETURN;
    END IF;

    -- Obtener otro módulo diferente
    SELECT id INTO v_test_module_id
    FROM educational_content.modules
    WHERE id NOT IN (
        SELECT module_id FROM progress_tracking.module_progress WHERE user_id = v_test_user_id
    )
    LIMIT 1;

    IF v_test_module_id IS NULL THEN
        RAISE WARNING 'Skipping Test 2: No additional module found';
        RETURN;
    END IF;

    -- Crear module_progress para segundo módulo
    INSERT INTO progress_tracking.module_progress (
        user_id, module_id, status
    ) VALUES (
        v_test_user_id, v_test_module_id, 'in_progress'
    );

    -- ACCIÓN: Completar segundo módulo
    UPDATE progress_tracking.module_progress
    SET status = 'completed', completed_at = gamilit.now_mexico()
    WHERE user_id = v_test_user_id AND module_id = v_test_module_id;

    -- VERIFICAR: Misión debe estar completa
    SELECT * INTO v_mission
    FROM gamification_system.missions
    WHERE id = v_mission_id;

    IF (v_mission.objectives->0->>'current')::INTEGER = 2
       AND v_mission.progress = 100
       AND v_mission.status = 'completed'
       AND v_mission.completed_at IS NOT NULL THEN
        RAISE NOTICE '✅ TEST 2 PASSED: current=2/2, progress=100%%, status=completed';
    ELSE
        RAISE WARNING '❌ TEST 2 FAILED: current=%, progress=%, status=% (esperado: 2, 100, completed)',
            v_mission.objectives->0->>'current', v_mission.progress, v_mission.status;
    END IF;

END $$;

-- =============================================================================
-- TEST 3: Evitar duplicación (completed -> completed)
-- ESPERADO: NO incrementar current (debe quedarse en mismo valor)
-- =============================================================================
DO $$
DECLARE
    v_test_user_id UUID;
    v_test_module_id UUID;
    v_mission_id UUID;
    v_current_before INTEGER;
    v_current_after INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '====== TEST 3: Evitar duplicación ======';

    SELECT id INTO v_test_user_id
    FROM auth_management.profiles
    WHERE username = 'test_student' LIMIT 1;

    -- Crear nueva misión para este test
    INSERT INTO gamification_system.missions (
        user_id, template_id, title, mission_type, objectives, rewards, end_date
    ) VALUES (
        v_test_user_id,
        'TEST_WEEKLY_COMPLETE_MODULES',
        'Test: No duplicar',
        'weekly',
        '[{"type": "complete_modules", "target": 5, "current": 0, "description": "Completa 5 módulos"}]'::jsonb,
        '{"xp": 200, "ml_coins": 100}'::jsonb,
        gamilit.now_mexico() + INTERVAL '7 days'
    ) RETURNING id INTO v_mission_id;

    -- Obtener módulo ya completado
    SELECT module_id INTO v_test_module_id
    FROM progress_tracking.module_progress
    WHERE user_id = v_test_user_id AND status = 'completed'
    LIMIT 1;

    IF v_test_module_id IS NULL THEN
        RAISE WARNING 'Skipping Test 3: No completed module found';
        RETURN;
    END IF;

    -- Obtener current antes
    SELECT (objectives->0->>'current')::INTEGER INTO v_current_before
    FROM gamification_system.missions WHERE id = v_mission_id;

    RAISE NOTICE 'Current antes del UPDATE: %', v_current_before;

    -- ACCIÓN: UPDATE en módulo que YA está completed (sin cambiar status)
    UPDATE progress_tracking.module_progress
    SET progress_percentage = 100  -- Cambio irrelevante
    WHERE user_id = v_test_user_id AND module_id = v_test_module_id;

    -- VERIFICAR: Current NO debe incrementarse
    SELECT (objectives->0->>'current')::INTEGER INTO v_current_after
    FROM gamification_system.missions WHERE id = v_mission_id;

    RAISE NOTICE 'Current después del UPDATE: %', v_current_after;

    IF v_current_before = v_current_after THEN
        RAISE NOTICE '✅ TEST 3 PASSED: No duplicación (current sigue en %)', v_current_after;
    ELSE
        RAISE WARNING '❌ TEST 3 FAILED: Current incrementó de % a % (no debió cambiar)',
            v_current_before, v_current_after;
    END IF;

END $$;

-- =============================================================================
-- TEST 4: Trigger no se dispara en otros cambios
-- ESPERADO: Current no cambia si status no cambia a 'completed'
-- =============================================================================
DO $$
DECLARE
    v_test_user_id UUID;
    v_test_module_id UUID;
    v_mission_id UUID;
    v_current_before INTEGER;
    v_current_after INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '====== TEST 4: Trigger no se dispara en otros cambios ======';

    SELECT id INTO v_test_user_id
    FROM auth_management.profiles
    WHERE username = 'test_student' LIMIT 1;

    -- Buscar misión de test
    SELECT id INTO v_mission_id
    FROM gamification_system.missions
    WHERE user_id = v_test_user_id AND template_id = 'TEST_WEEKLY_COMPLETE_MODULES'
    LIMIT 1;

    -- Crear módulo en estado in_progress
    SELECT id INTO v_test_module_id
    FROM educational_content.modules
    WHERE id NOT IN (
        SELECT module_id FROM progress_tracking.module_progress WHERE user_id = v_test_user_id
    )
    LIMIT 1;

    IF v_test_module_id IS NULL THEN
        RAISE WARNING 'Skipping Test 4: No module available';
        RETURN;
    END IF;

    INSERT INTO progress_tracking.module_progress (
        user_id, module_id, status
    ) VALUES (
        v_test_user_id, v_test_module_id, 'in_progress'
    );

    -- Current antes
    SELECT (objectives->0->>'current')::INTEGER INTO v_current_before
    FROM gamification_system.missions WHERE id = v_mission_id;

    -- ACCIÓN: UPDATE sin cambiar status (sigue in_progress)
    UPDATE progress_tracking.module_progress
    SET progress_percentage = 50
    WHERE user_id = v_test_user_id AND module_id = v_test_module_id;

    -- Current después
    SELECT (objectives->0->>'current')::INTEGER INTO v_current_after
    FROM gamification_system.missions WHERE id = v_mission_id;

    IF v_current_before = v_current_after THEN
        RAISE NOTICE '✅ TEST 4 PASSED: Current no cambió en UPDATE irrelevante';
    ELSE
        RAISE WARNING '❌ TEST 4 FAILED: Current cambió de % a % sin completar módulo',
            v_current_before, v_current_after;
    END IF;

END $$;

-- =============================================================================
-- RESUMEN
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'TEST SUITE COMPLETADO';
    RAISE NOTICE 'Revisa los resultados arriba para ver éxitos/fallos';
    RAISE NOTICE '===============================================';
END $$;

-- Limpiar datos de prueba
DO $$
BEGIN
    DELETE FROM gamification_system.missions WHERE template_id LIKE 'TEST_%';
    DELETE FROM progress_tracking.module_progress WHERE user_id IN (
        SELECT id FROM auth_management.profiles WHERE username LIKE 'test_%'
    );
    RAISE NOTICE 'Test data cleaned';
END $$;
