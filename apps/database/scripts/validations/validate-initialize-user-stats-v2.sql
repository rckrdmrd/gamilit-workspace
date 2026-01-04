-- =====================================================
-- Validation Script: initialize_user_stats v2.0
-- Description: Valida que la funcion actualizada funciona correctamente
-- Created: 2025-12-28
-- =====================================================

DO $$
DECLARE
    v_test_user_id UUID;
    v_test_profile_id UUID;
    v_test_email TEXT := 'test_trigger_' || gen_random_uuid()::text || '@test.gamilit.com';
    v_tenant_id UUID;
    v_results RECORD;
    v_test_passed BOOLEAN := true;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VALIDACION: initialize_user_stats v2.0';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';

    -- Obtener tenant para testing
    SELECT id INTO v_tenant_id
    FROM auth_management.tenants
    WHERE is_active = true
    LIMIT 1;

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No se encontro tenant activo para testing';
    END IF;

    RAISE NOTICE '[1/8] Creando usuario de prueba: %', v_test_email;

    -- Crear usuario de prueba
    INSERT INTO auth.users (
        email,
        encrypted_password,
        role,
        gamilit_role,
        status,
        email_verified
    ) VALUES (
        v_test_email,
        '$2b$10$test_hash_placeholder_for_testing',
        'authenticated',
        'student',
        'active',
        true
    )
    RETURNING id INTO v_test_user_id;

    RAISE NOTICE '   Usuario creado: %', v_test_user_id;

    -- Crear perfil (esto dispara el trigger)
    RAISE NOTICE '[2/8] Creando perfil (dispara trigger)...';

    INSERT INTO auth_management.profiles (
        user_id,
        tenant_id,
        email,
        role,
        first_name,
        last_name
    ) VALUES (
        v_test_user_id,
        v_tenant_id,
        v_test_email,
        'student',
        'Test',
        'User'
    )
    RETURNING id INTO v_test_profile_id;

    RAISE NOTICE '   Perfil creado: %', v_test_profile_id;
    RAISE NOTICE '';

    -- Verificar resultados
    RAISE NOTICE '[3/8] Verificando inicializaciones...';

    SELECT
        (SELECT COUNT(*) FROM gamification_system.user_stats WHERE user_id = v_test_profile_id) as stats_count,
        (SELECT COUNT(*) FROM gamification_system.user_ranks WHERE user_id = v_test_profile_id) as ranks_count,
        (SELECT COUNT(*) FROM gamification_system.comodines_inventory WHERE user_id = v_test_profile_id) as comodines_count,
        (SELECT COUNT(*) FROM progress_tracking.module_progress WHERE user_id = v_test_profile_id) as progress_count,
        (SELECT COUNT(*) FROM gamification_system.missions WHERE user_id = v_test_profile_id) as missions_count,
        (SELECT COUNT(*) FROM social_features.classroom_members WHERE student_id = v_test_profile_id) as classroom_count,
        -- NUEVOS en v2.0
        (SELECT COUNT(*) FROM auth_management.user_preferences WHERE user_id = v_test_profile_id) as preferences_count,
        (SELECT COUNT(*) FROM gamification_system.ml_coins_transactions WHERE user_id = v_test_profile_id AND source = 'system_welcome_bonus') as welcome_bonus_count
    INTO v_results;

    -- Reportar resultados
    RAISE NOTICE '';
    RAISE NOTICE '--- RESULTADOS ---';
    RAISE NOTICE 'user_stats:           % (esperado: 1)', v_results.stats_count;
    RAISE NOTICE 'user_ranks:           % (esperado: 1)', v_results.ranks_count;
    RAISE NOTICE 'comodines_inventory:  % (esperado: 1)', v_results.comodines_count;
    RAISE NOTICE 'module_progress:      % (esperado: >=1)', v_results.progress_count;
    RAISE NOTICE 'missions:             % (esperado: 8)', v_results.missions_count;
    RAISE NOTICE 'classroom_members:    % (esperado: 1)', v_results.classroom_count;
    RAISE NOTICE '[NUEVO] user_preferences:   % (esperado: 1)', v_results.preferences_count;
    RAISE NOTICE '[NUEVO] welcome_bonus:      % (esperado: 1)', v_results.welcome_bonus_count;
    RAISE NOTICE '';

    -- Verificar cada assertion
    RAISE NOTICE '[4/8] Validando assertions...';

    IF v_results.stats_count != 1 THEN
        RAISE WARNING 'FAIL: user_stats no creado';
        v_test_passed := false;
    END IF;

    IF v_results.ranks_count != 1 THEN
        RAISE WARNING 'FAIL: user_ranks no creado';
        v_test_passed := false;
    END IF;

    IF v_results.comodines_count != 1 THEN
        RAISE WARNING 'FAIL: comodines_inventory no creado';
        v_test_passed := false;
    END IF;

    IF v_results.progress_count < 1 THEN
        RAISE WARNING 'FAIL: module_progress no creado';
        v_test_passed := false;
    END IF;

    IF v_results.missions_count != 8 THEN
        RAISE WARNING 'FAIL: missions incorrectas (esperado 8, obtenido %)', v_results.missions_count;
        v_test_passed := false;
    END IF;

    -- NUEVAS validaciones v2.0
    IF v_results.preferences_count != 1 THEN
        RAISE WARNING 'FAIL: user_preferences no creado (NUEVO v2.0)';
        v_test_passed := false;
    END IF;

    IF v_results.welcome_bonus_count != 1 THEN
        RAISE WARNING 'FAIL: ml_coins_transactions welcome bonus no creado (NUEVO v2.0)';
        v_test_passed := false;
    END IF;

    -- Verificar valores de user_preferences
    RAISE NOTICE '[5/8] Verificando valores de user_preferences...';

    PERFORM 1 FROM auth_management.user_preferences
    WHERE user_id = v_test_profile_id
      AND theme = 'light'
      AND language = 'es'
      AND notifications_enabled = true;

    IF NOT FOUND THEN
        RAISE WARNING 'FAIL: user_preferences tiene valores incorrectos';
        v_test_passed := false;
    ELSE
        RAISE NOTICE '   user_preferences valores OK';
    END IF;

    -- Verificar transaccion de welcome bonus
    RAISE NOTICE '[6/8] Verificando welcome bonus transaction...';

    PERFORM 1 FROM gamification_system.ml_coins_transactions
    WHERE user_id = v_test_profile_id
      AND amount = 100
      AND transaction_type = 'earn'
      AND source = 'system_welcome_bonus';

    IF NOT FOUND THEN
        RAISE WARNING 'FAIL: welcome bonus transaction incorrecta';
        v_test_passed := false;
    ELSE
        RAISE NOTICE '   Welcome bonus transaction OK';
    END IF;

    -- Limpiar datos de prueba
    RAISE NOTICE '[7/8] Limpiando datos de prueba...';

    DELETE FROM auth_management.profiles WHERE id = v_test_profile_id;
    DELETE FROM auth.users WHERE id = v_test_user_id;

    RAISE NOTICE '   Datos limpiados correctamente';
    RAISE NOTICE '';

    -- Resultado final
    RAISE NOTICE '[8/8] RESULTADO FINAL';
    RAISE NOTICE '========================================';

    IF v_test_passed THEN
        RAISE NOTICE '✅ TODOS LOS TESTS PASARON';
        RAISE NOTICE 'La funcion initialize_user_stats v2.0 funciona correctamente';
    ELSE
        RAISE NOTICE '❌ ALGUNOS TESTS FALLARON';
        RAISE NOTICE 'Revisar los warnings anteriores para detalles';
    END IF;

    RAISE NOTICE '========================================';

END $$;

-- =====================================================
-- Test adicional: Verificar inicializacion de profesor
-- =====================================================

DO $$
DECLARE
    v_test_user_id UUID;
    v_test_profile_id UUID;
    v_test_email TEXT := 'test_teacher_' || gen_random_uuid()::text || '@test.gamilit.com';
    v_tenant_id UUID;
    v_teacher_report_count INT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VALIDACION: Teacher Reports Initialization';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';

    -- Obtener tenant
    SELECT id INTO v_tenant_id
    FROM auth_management.tenants
    WHERE is_active = true
    LIMIT 1;

    RAISE NOTICE '[1/4] Creando profesor de prueba: %', v_test_email;

    -- Crear usuario profesor
    INSERT INTO auth.users (
        email,
        encrypted_password,
        role,
        gamilit_role,
        status,
        email_verified
    ) VALUES (
        v_test_email,
        '$2b$10$test_hash_placeholder_for_testing',
        'authenticated',
        'admin_teacher',
        'active',
        true
    )
    RETURNING id INTO v_test_user_id;

    -- Crear perfil de profesor (dispara trigger)
    RAISE NOTICE '[2/4] Creando perfil de profesor...';

    INSERT INTO auth_management.profiles (
        user_id,
        tenant_id,
        email,
        role,
        first_name,
        last_name
    ) VALUES (
        v_test_user_id,
        v_tenant_id,
        v_test_email,
        'admin_teacher',
        'Test',
        'Teacher'
    )
    RETURNING id INTO v_test_profile_id;

    -- Verificar teacher_reports
    RAISE NOTICE '[3/4] Verificando teacher_reports...';

    SELECT COUNT(*) INTO v_teacher_report_count
    FROM social_features.teacher_reports
    WHERE teacher_id = v_test_profile_id
      AND report_type = 'monthly'
      AND metadata->>'auto_created' = 'true';

    IF v_teacher_report_count = 1 THEN
        RAISE NOTICE '   ✅ teacher_report creado correctamente';
    ELSE
        RAISE WARNING '   ❌ teacher_report NO creado (count: %)', v_teacher_report_count;
    END IF;

    -- Limpiar
    RAISE NOTICE '[4/4] Limpiando...';
    DELETE FROM auth_management.profiles WHERE id = v_test_profile_id;
    DELETE FROM auth.users WHERE id = v_test_user_id;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Validacion de Teacher completada';
    RAISE NOTICE '========================================';

END $$;
