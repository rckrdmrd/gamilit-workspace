-- =====================================================
-- Seed Data: Maya Ranks Configuration (DEVELOPMENT)
-- =====================================================
-- Description: Configuración de rangos maya del sistema de gamificación
-- Environment: DEVELOPMENT
-- Records: 5
-- Date: 2025-11-07
-- Source: Migrated from backend ranks.service.ts
-- Note: Dev environment includes XP thresholds reducidos para testing
-- =====================================================

SET search_path TO gamification_system, public;

-- =====================================================
-- CONFIGURACIÓN DE RANGOS MAYA (DEV - Testing friendly)
-- =====================================================
-- En DEV, los umbrales de XP pueden ser más bajos para
-- facilitar testing de promociones de rango.
-- =====================================================

INSERT INTO gamification_system.maya_ranks (
    rank_name,
    display_name,
    description,
    min_xp_required,
    max_xp_threshold,
    ml_coins_bonus,
    xp_multiplier,
    missions_required,
    modules_required,
    perks,
    icon,
    color,
    badge_image_url,
    rank_order,
    next_rank,
    is_active
) VALUES
    -- Nivel 1: Ajaw (Señor - Nivel inicial)
    (
        'Ajaw',
        'Ajaw',
        'Señor - Nivel inicial del viaje maya',
        0,
        999,
        0,
        1.00,
        0,
        0,
        '["basic_access", "forum_access"]'::jsonb,
        'star',
        '#CD7F32',
        NULL,
        1,
        'Nacom',
        true
    ),
    -- Nivel 2: Nacom (Capitán de Guerra)
    (
        'Nacom',
        'Nacom',
        'Capitán de Guerra - Comandante en entrenamiento',
        1000,
        2999,
        500,
        1.10,
        0,
        0,
        '["xp_boost_10", "daily_bonus", "forum_access"]'::jsonb,
        'shield',
        '#C0C0C0',
        NULL,
        2,
        'Ah K''in',
        true
    ),
    -- Nivel 3: Ah K'in (Sacerdote del Sol)
    (
        'Ah K''in',
        'Ah K''in',
        'Sacerdote del Sol - Guía del conocimiento',
        3000,
        5999,
        1000,
        1.20,
        0,
        0,
        '["xp_boost_20", "coin_bonus", "exclusive_content", "custom_avatar"]'::jsonb,
        'sun',
        '#FFD700',
        NULL,
        3,
        'Halach Uinic',
        true
    ),
    -- Nivel 4: Halach Uinic (Hombre Verdadero)
    (
        'Halach Uinic',
        'Halach Uinic',
        'Hombre Verdadero - Líder de la comunidad',
        6000,
        9999,
        2000,
        1.30,
        0,
        0,
        '["xp_boost_30", "priority_support", "exclusive_missions", "leaderboard_badge"]'::jsonb,
        'crown',
        '#E5E4E2',
        NULL,
        4,
        'K''uk''ulkan',
        true
    ),
    -- Nivel 5: K'uk'ulkan (Serpiente Emplumada - Máximo rango)
    (
        'K''uk''ulkan',
        'K''uk''ulkan',
        'Serpiente Emplumada - Nivel legendario',
        10000,
        NULL,
        5000,
        1.50,
        0,
        0,
        '["xp_boost_50", "all_perks", "mentor_access", "exclusive_events", "legendary_badge"]'::jsonb,
        'dragon',
        '#B9F2FF',
        NULL,
        5,
        NULL,
        true
    )
ON CONFLICT (rank_name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    min_xp_required = EXCLUDED.min_xp_required,
    max_xp_threshold = EXCLUDED.max_xp_threshold,
    ml_coins_bonus = EXCLUDED.ml_coins_bonus,
    xp_multiplier = EXCLUDED.xp_multiplier,
    missions_required = EXCLUDED.missions_required,
    modules_required = EXCLUDED.modules_required,
    perks = EXCLUDED.perks,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    badge_image_url = EXCLUDED.badge_image_url,
    rank_order = EXCLUDED.rank_order,
    next_rank = EXCLUDED.next_rank,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

SELECT
    'Maya Ranks Configuration (Development)' AS seed_name,
    COUNT(*) AS records_inserted
FROM gamification_system.maya_ranks;

SELECT
    rank_order,
    rank_name,
    min_xp_required,
    max_xp_threshold,
    ml_coins_bonus,
    xp_multiplier,
    next_rank
FROM gamification_system.maya_ranks
ORDER BY rank_order;

-- =====================================================
-- DEV TESTING HELPERS
-- =====================================================
-- Queries útiles para testing:
--
-- Ver todos los rangos:
-- SELECT * FROM gamification_system.maya_ranks ORDER BY rank_order;
--
-- Simular XP del usuario para testing:
-- UPDATE gamification_system.user_stats SET total_xp = 1500 WHERE user_id = 'xxx';
--
-- Verificar qué rango le corresponde a un usuario:
-- SELECT * FROM gamification_system.calculate_user_rank('user-id-here');
-- =====================================================
