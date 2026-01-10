-- =====================================================
-- Seed: Comodines Inventory (Dynamic UUIDs)
-- =====================================================
-- Description: Inventarios de comodines para usuarios demo
-- Environment: dev/prod
-- Dependencies:
--   - auth_management.profiles
--   - gamification_system.user_stats
-- Execution Order: 9
-- Version: 2.1.0
-- Updated: 2025-12-28 - Reescrito con UUIDs dinámicos (P2-001)
-- Updated: 2026-01-07 - EXCLUIDOS usuarios de testing (@gamilit.com)
--                       Los testing users mantienen inventario vacio inicial
-- =====================================================
--
-- IMPORTANTE: Los usuarios de TESTING (admin@, teacher@, student@gamilit.com)
-- NO reciben comodines demo. Mantienen el inventario vacio creado por el trigger.
--
-- Tipos de Comodines:
-- 1. Pistas Contextuales (15 ML Coins): Ayudas para resolver ejercicios
-- 2. Visión Lectora (25 ML Coins): Resalta información clave en textos
-- 3. Segunda Oportunidad (40 ML Coins): Permite reintentar ejercicios
--
-- Fórmula: available = purchased_total - used_total
-- =====================================================

SET search_path TO gamification_system, auth_management, public;

-- =====================================================
-- Crear inventarios de comodines para estudiantes de demo
-- =====================================================

DO $$
DECLARE
    v_student RECORD;
    v_count INTEGER := 0;
    v_pistas_available INTEGER;
    v_vision_available INTEGER;
    v_segunda_available INTEGER;
    v_row_num INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Inicializando Comodines Inventory';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';

    -- Iterar sobre estudiantes de demo (EXCLUYE testing users)
    -- NOTA: Usuarios de testing (admin@, teacher@, student@gamilit.com)
    -- NO reciben comodines demo. Mantienen inventario vacio inicial.
    FOR v_student IN
        SELECT
            p.id,
            p.email,
            p.display_name
        FROM auth_management.profiles p
        WHERE p.role = 'student'
          AND p.email NOT IN ('admin@gamilit.com', 'teacher@gamilit.com', 'student@gamilit.com')
        ORDER BY p.created_at
        LIMIT 10
    LOOP
        v_row_num := v_row_num + 1;

        -- Variar inventario según posición
        CASE v_row_num
            WHEN 1 THEN  -- Estudiante activo
                v_pistas_available := 2;
                v_vision_available := 1;
                v_segunda_available := 0;
            WHEN 2 THEN  -- Estudiante moderado
                v_pistas_available := 3;
                v_vision_available := 2;
                v_segunda_available := 1;
            WHEN 3 THEN  -- Estudiante nuevo
                v_pistas_available := 0;
                v_vision_available := 0;
                v_segunda_available := 0;
            ELSE  -- Estudiantes adicionales
                v_pistas_available := FLOOR(RANDOM() * 5)::INTEGER;
                v_vision_available := FLOOR(RANDOM() * 3)::INTEGER;
                v_segunda_available := FLOOR(RANDOM() * 2)::INTEGER;
        END CASE;

        -- Insertar inventario
        INSERT INTO gamification_system.comodines_inventory (
            user_id,
            pistas_available,
            vision_lectora_available,
            segunda_oportunidad_available,
            pistas_purchased_total,
            vision_lectora_purchased_total,
            segunda_oportunidad_purchased_total,
            pistas_used_total,
            vision_lectora_used_total,
            segunda_oportunidad_used_total,
            pistas_cost,
            vision_lectora_cost,
            segunda_oportunidad_cost,
            metadata,
            created_at,
            updated_at
        ) VALUES (
            v_student.id,
            v_pistas_available,
            v_vision_available,
            v_segunda_available,
            v_pistas_available + FLOOR(RANDOM() * 5)::INTEGER,  -- purchased = available + used
            v_vision_available + FLOOR(RANDOM() * 3)::INTEGER,
            v_segunda_available + FLOOR(RANDOM() * 2)::INTEGER,
            FLOOR(RANDOM() * 5)::INTEGER,  -- used_total
            FLOOR(RANDOM() * 3)::INTEGER,
            FLOOR(RANDOM() * 2)::INTEGER,
            15,  -- pistas_cost
            25,  -- vision_lectora_cost
            40,  -- segunda_oportunidad_cost
            jsonb_build_object(
                'demo_inventory', true,
                'initialized_by', 'seed-09-comodines'
            ),
            NOW() - (RANDOM() * INTERVAL '30 days'),
            NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
            pistas_available = EXCLUDED.pistas_available,
            vision_lectora_available = EXCLUDED.vision_lectora_available,
            segunda_oportunidad_available = EXCLUDED.segunda_oportunidad_available,
            updated_at = NOW();

        v_count := v_count + 1;
        RAISE NOTICE '  ✓ % (%)', v_student.display_name, v_student.email;
    END LOOP;

    -- También crear inventarios vacíos para usuarios de producción sin comodines
    INSERT INTO gamification_system.comodines_inventory (
        user_id,
        pistas_available,
        vision_lectora_available,
        segunda_oportunidad_available,
        pistas_purchased_total,
        vision_lectora_purchased_total,
        segunda_oportunidad_purchased_total,
        pistas_used_total,
        vision_lectora_used_total,
        segunda_oportunidad_used_total,
        pistas_cost,
        vision_lectora_cost,
        segunda_oportunidad_cost,
        metadata
    )
    SELECT
        p.id,
        0, 0, 0,  -- available
        0, 0, 0,  -- purchased
        0, 0, 0,  -- used
        15, 25, 40,  -- costs
        jsonb_build_object('demo_inventory', false, 'initialized_by', 'seed-09-comodines')
    FROM auth_management.profiles p
    WHERE p.role IN ('student', 'admin_teacher', 'super_admin')
      AND NOT EXISTS (
          SELECT 1 FROM gamification_system.comodines_inventory ci
          WHERE ci.user_id = p.id
      )
    ON CONFLICT (user_id) DO NOTHING;

    GET DIAGNOSTICS v_count = ROW_COUNT;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Comodines Inventory Inicializado';
    RAISE NOTICE '  Demo inventories: %', v_row_num;
    RAISE NOTICE '  Empty inventories: %', v_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;

-- =====================================================
-- Verificación
-- =====================================================

DO $$
DECLARE
    v_total INTEGER;
    v_with_comodines INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total FROM gamification_system.comodines_inventory;
    SELECT COUNT(*) INTO v_with_comodines
    FROM gamification_system.comodines_inventory
    WHERE pistas_available > 0 OR vision_lectora_available > 0 OR segunda_oportunidad_available > 0;

    RAISE NOTICE '📊 Verificación Comodines:';
    RAISE NOTICE '   Total inventarios: %', v_total;
    RAISE NOTICE '   Con comodines disponibles: %', v_with_comodines;
END $$;
