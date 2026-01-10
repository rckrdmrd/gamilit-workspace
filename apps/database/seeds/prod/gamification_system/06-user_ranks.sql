-- =====================================================
-- Seed: gamification_system.user_ranks (Dynamic Updates)
-- =====================================================
-- Description: Actualiza rangos maya para usuarios demo
-- Environment: dev/prod
-- Dependencies: auth_management.profiles, gamification_system.user_ranks
-- Order: 06
-- Version: 2.1.0
-- Updated: 2025-12-28 - Reescrito con UPDATEs dinámicos (P2-002)
-- Updated: 2026-01-07 - EXCLUIDOS usuarios de testing (@gamilit.com)
--                       Los testing users mantienen rango inicial 'Ajaw'
-- =====================================================
--
-- NOTA: El trigger initialize_user_stats ya crea user_ranks base (Ajaw)
-- para cada usuario nuevo. Este seed ACTUALIZA algunos rankings
-- para demostrar diferentes niveles en la plataforma.
--
-- IMPORTANTE: Los usuarios de TESTING (@gamilit.com) NO son actualizados.
-- Mantienen sus valores iniciales para simular usuarios recién registrados.
--
-- RANGOS MAYA (de menor a mayor):
-- 1. Ajaw      - Nivel inicial (todos empiezan aquí)
-- 2. Nacom     - Nivel intermedio bajo
-- 3. Ah K'in  - Nivel intermedio alto
-- 4. Halach Uinic - Nivel avanzado
-- 5. K'uk'ulkan - Nivel máximo
-- =====================================================

SET search_path TO gamification_system, auth_management, public;

-- =====================================================
-- Actualizar rangos de usuarios demo
-- =====================================================

DO $$
DECLARE
    v_student RECORD;
    v_teacher RECORD;
    v_admin RECORD;
    v_count INTEGER := 0;
    v_row_num INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Actualizando User Ranks Demo';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';

    -- =========================================
    -- ESTUDIANTES DE DEMO (EXCLUYE testing users)
    -- =========================================
    -- NOTA: Usuarios de testing (admin@, teacher@, student@gamilit.com)
    -- NO son actualizados. Mantienen rango inicial 'Ajaw'.
    FOR v_student IN
        SELECT p.id, p.email, p.display_name
        FROM auth_management.profiles p
        WHERE p.role = 'student'
          AND p.email NOT IN ('admin@gamilit.com', 'teacher@gamilit.com', 'student@gamilit.com')
        ORDER BY p.created_at
        LIMIT 5
    LOOP
        v_row_num := v_row_num + 1;

        CASE v_row_num
            WHEN 1 THEN
                -- Primer estudiante: Nacom (nivel intermedio)
                UPDATE gamification_system.user_ranks
                SET current_rank = 'Nacom',
                    previous_rank = 'Ajaw',
                    rank_progress_percentage = 60,
                    xp_earned_for_rank = 3200,
                    badge_url = '/badges/ranks/nacom.png',
                    rank_metadata = jsonb_build_object(
                        'demo_rank', true,
                        'rank_tier', 2,
                        'rank_name_es', 'Nacom'
                    ),
                    updated_at = NOW()
                WHERE user_id = v_student.id AND is_current = true;

                RAISE NOTICE '  ✓ % → Nacom', v_student.display_name;

            WHEN 2 THEN
                -- Segundo estudiante: Ah K'in (nivel alto)
                UPDATE gamification_system.user_ranks
                SET current_rank = 'Ah K''in',
                    previous_rank = 'Nacom',
                    rank_progress_percentage = 40,
                    xp_earned_for_rank = 7500,
                    badge_url = '/badges/ranks/ah_kin.png',
                    rank_metadata = jsonb_build_object(
                        'demo_rank', true,
                        'rank_tier', 3,
                        'rank_name_es', 'Ah K''in'
                    ),
                    updated_at = NOW()
                WHERE user_id = v_student.id AND is_current = true;

                RAISE NOTICE '  ✓ % → Ah K''in', v_student.display_name;

            ELSE
                -- Resto: mantener Ajaw pero actualizar progreso
                UPDATE gamification_system.user_ranks
                SET rank_progress_percentage = (RANDOM() * 80)::INTEGER,
                    xp_earned_for_rank = (RANDOM() * 900)::INTEGER,
                    rank_metadata = jsonb_build_object(
                        'demo_rank', true,
                        'rank_tier', 1,
                        'rank_name_es', 'Ajaw'
                    ),
                    updated_at = NOW()
                WHERE user_id = v_student.id AND is_current = true;

                RAISE NOTICE '  ✓ % → Ajaw (actualizado)', v_student.display_name;
        END CASE;

        v_count := v_count + 1;
    END LOOP;

    -- =========================================
    -- TEACHER (EXCLUYE testing user)
    -- =========================================
    -- NOTA: teacher@gamilit.com NO es actualizado. Mantiene rango inicial.
    SELECT p.id, p.email, p.display_name INTO v_teacher
    FROM auth_management.profiles p
    WHERE p.role = 'admin_teacher'
      AND p.email NOT IN ('admin@gamilit.com', 'teacher@gamilit.com', 'student@gamilit.com')
    LIMIT 1;

    IF v_teacher.id IS NOT NULL THEN
        UPDATE gamification_system.user_ranks
        SET current_rank = 'Halach Uinic',
            previous_rank = 'Ah K''in',
            rank_progress_percentage = 75,
            xp_earned_for_rank = 15000,
            badge_url = '/badges/ranks/halach_uinic.png',
            rank_metadata = jsonb_build_object(
                'demo_rank', true,
                'rank_tier', 4,
                'rank_name_es', 'Halach Uinic',
                'role', 'teacher'
            ),
            updated_at = NOW()
        WHERE user_id = v_teacher.id AND is_current = true;

        v_count := v_count + 1;
        RAISE NOTICE '  ✓ % (teacher) → Halach Uinic', v_teacher.display_name;
    END IF;

    -- =========================================
    -- SUPER ADMIN (EXCLUYE testing user)
    -- =========================================
    -- NOTA: admin@gamilit.com NO es actualizado. Mantiene rango inicial.
    SELECT p.id, p.email, p.display_name INTO v_admin
    FROM auth_management.profiles p
    WHERE p.role = 'super_admin'
      AND p.email NOT IN ('admin@gamilit.com', 'teacher@gamilit.com', 'student@gamilit.com')
    LIMIT 1;

    IF v_admin.id IS NOT NULL THEN
        UPDATE gamification_system.user_ranks
        SET current_rank = 'K''uk''ulkan',
            previous_rank = 'Halach Uinic',
            rank_progress_percentage = 100,
            xp_earned_for_rank = 50000,
            badge_url = '/badges/ranks/kukulkan.png',
            rank_metadata = jsonb_build_object(
                'demo_rank', true,
                'rank_tier', 5,
                'rank_name_es', 'K''uk''ulkan',
                'role', 'super_admin',
                'max_rank', true
            ),
            updated_at = NOW()
        WHERE user_id = v_admin.id AND is_current = true;

        v_count := v_count + 1;
        RAISE NOTICE '  ✓ % (admin) → K''uk''ulkan (MAX)', v_admin.display_name;
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'User Ranks Actualizados: %', v_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;

-- =====================================================
-- Verificación
-- =====================================================

DO $$
DECLARE
    v_rank RECORD;
BEGIN
    RAISE NOTICE '📊 Distribución de Rangos:';
    FOR v_rank IN
        SELECT current_rank, COUNT(*) as total
        FROM gamification_system.user_ranks
        WHERE is_current = true
        GROUP BY current_rank
        ORDER BY
            CASE current_rank
                WHEN 'Ajaw' THEN 1
                WHEN 'Nacom' THEN 2
                WHEN 'Ah K''in' THEN 3
                WHEN 'Halach Uinic' THEN 4
                WHEN 'K''uk''ulkan' THEN 5
            END
    LOOP
        RAISE NOTICE '   %: %', v_rank.current_rank, v_rank.total;
    END LOOP;
END $$;
