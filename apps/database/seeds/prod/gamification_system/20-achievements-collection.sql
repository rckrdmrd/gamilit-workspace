-- =====================================================
-- Seed: gamification_system.achievements (Collection Category)
-- Description: Logros de coleccion — REC-011
-- Environment: PRODUCTION
-- Dependencies: gamification_system.achievement_categories
-- Order: 20
-- Created: 2026-02-18
-- Version: 1.0
-- =====================================================
--
-- ACHIEVEMENTS DE COLECCION (5):
-- - Coleccionista de Logros: Desbloquear 5 logros (common)
-- - Maestro de Niveles: Nivel 3+ en todos los modulos (rare)
-- - Coleccionista de Avatares: Equipar 10+ items cosmeticos (rare)
-- - Millonario ML: Acumular 10,000 ML Coins (epic)
-- - Cazador de Tesoros: Comprar todos los items de tienda (legendary)
--
-- NOTA: Estos llenan la categoria 'collection' que estaba definida
-- en el ENUM (v1.1) pero sin logros asignados (DISC-010).
-- =====================================================

SET search_path TO gamification_system, educational_content, public;

INSERT INTO gamification_system.achievements (
    id,
    tenant_id,
    name,
    description,
    icon,
    category,
    rarity,
    difficulty_level,
    conditions,
    rewards,
    ml_coins_reward,
    is_secret,
    is_active,
    is_repeatable,
    order_index,
    points_value,
    unlock_message,
    instructions,
    tips,
    metadata,
    created_at,
    updated_at
) VALUES

-- =====================================================
-- CATEGORY: COLLECTION (5 achievements)
-- =====================================================

-- 1. Coleccionista de Logros
(
    '90000008-0000-0000-0000-000000000001'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Coleccionista de Logros',
    'Desbloquea 5 logros diferentes en tu viaje de aprendizaje',
    'award',
    'collection'::gamification_system.achievement_category,
    'common',
    'elementary'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'achievements_collected',
        'requirements', jsonb_build_object(
            'achievements_unlocked', 5
        )
    ),
    jsonb_build_object(
        'xp', 50,
        'ml_coins', 30,
        'badge', 'achievement_collector'
    ),
    30,
    false,
    true,
    false,
    70,
    50,
    '¡Excelente! Has comenzado tu coleccion de logros. ¡Sigue desbloqueando mas!',
    'Desbloquea 5 logros de cualquier categoria para obtener este reconocimiento.',
    ARRAY[
        'Explora diferentes actividades para desbloquear variedad de logros',
        'Cada logro desbloqueado te acerca a este objetivo'
    ],
    jsonb_build_object(
        'collection_type', 'achievements',
        'threshold', 5
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- 2. Maestro de Niveles
(
    '90000008-0000-0000-0000-000000000002'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Maestro de Niveles',
    'Alcanza nivel 3 o superior en todos los modulos educativos',
    'layers',
    'collection'::gamification_system.achievement_category,
    'rare',
    'upper_intermediate'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'module_levels',
        'requirements', jsonb_build_object(
            'min_level_per_module', 3,
            'all_modules_required', true
        )
    ),
    jsonb_build_object(
        'xp', 200,
        'ml_coins', 150,
        'badge', 'level_master'
    ),
    150,
    false,
    true,
    false,
    71,
    200,
    '¡Impresionante! Dominas todos los modulos con nivel avanzado. Eres un verdadero maestro.',
    'Alcanza al menos nivel 3 en cada uno de los 5 modulos educativos.',
    ARRAY[
        'Practica regularmente en cada modulo',
        'Los ejercicios dificiles dan mas XP y suben nivel mas rapido'
    ],
    jsonb_build_object(
        'collection_type', 'module_levels',
        'threshold', 3
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- 3. Coleccionista de Avatares
(
    '90000008-0000-0000-0000-000000000003'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Coleccionista de Avatares',
    'Equipa 10 o mas items cosmeticos para personalizar tu perfil',
    'palette',
    'collection'::gamification_system.achievement_category,
    'rare',
    'pre_intermediate'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'items_equipped',
        'requirements', jsonb_build_object(
            'cosmetic_items_equipped', 10
        )
    ),
    jsonb_build_object(
        'xp', 100,
        'ml_coins', 75,
        'badge', 'avatar_collector'
    ),
    75,
    false,
    true,
    false,
    72,
    100,
    '¡Tu avatar es increible! Has personalizado tu perfil con estilo.',
    'Compra y equipa al menos 10 items cosmeticos de la tienda.',
    ARRAY[
        'Visita la tienda regularmente para ver items nuevos',
        'Gana ML Coins completando misiones para comprar items'
    ],
    jsonb_build_object(
        'collection_type', 'cosmetic_items',
        'threshold', 10
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- 4. Millonario ML
(
    '90000008-0000-0000-0000-000000000004'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Millonario ML',
    'Acumula un total de 10,000 ML Coins a lo largo de tu experiencia',
    'gem',
    'collection'::gamification_system.achievement_category,
    'epic',
    'upper_intermediate'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'coins_accumulated',
        'requirements', jsonb_build_object(
            'total_ml_coins_earned', 10000
        )
    ),
    jsonb_build_object(
        'xp', 300,
        'ml_coins', 250,
        'badge', 'ml_millionaire'
    ),
    250,
    false,
    true,
    false,
    73,
    300,
    '¡EPICO! Has acumulado 10,000 ML Coins. Tu economia virtual es impresionante.',
    'Gana un total acumulado de 10,000 ML Coins (no necesitas tenerlos todos al mismo tiempo).',
    ARRAY[
        'Completa misiones diarias y semanales para ganar mas ML Coins',
        'Los logros tambien otorgan ML Coins como recompensa'
    ],
    jsonb_build_object(
        'collection_type', 'currency',
        'threshold', 10000
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- 5. Cazador de Tesoros
(
    '90000008-0000-0000-0000-000000000005'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Cazador de Tesoros',
    'Compra todos los items disponibles en la tienda virtual',
    'shopping-bag',
    'collection'::gamification_system.achievement_category,
    'legendary',
    'proficient'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'shop_completionist',
        'requirements', jsonb_build_object(
            'all_shop_items_purchased', true
        )
    ),
    jsonb_build_object(
        'xp', 250,
        'ml_coins', 200,
        'badge', 'treasure_hunter'
    ),
    200,
    false,
    true,
    false,
    74,
    250,
    '¡LEGENDARIO! Has adquirido todos los tesoros de la tienda. Eres un verdadero cazador.',
    'Compra cada uno de los items disponibles en la tienda virtual al menos una vez.',
    ARRAY[
        'Ahorra ML Coins para los items mas caros',
        'Revisa la tienda periodicamente por nuevos items'
    ],
    jsonb_build_object(
        'collection_type', 'shop_items',
        'threshold', 'all'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
)

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    rarity = EXCLUDED.rarity,
    difficulty_level = EXCLUDED.difficulty_level,
    conditions = EXCLUDED.conditions,
    rewards = EXCLUDED.rewards,
    ml_coins_reward = EXCLUDED.ml_coins_reward,
    is_secret = EXCLUDED.is_secret,
    is_active = EXCLUDED.is_active,
    is_repeatable = EXCLUDED.is_repeatable,
    order_index = EXCLUDED.order_index,
    points_value = EXCLUDED.points_value,
    unlock_message = EXCLUDED.unlock_message,
    instructions = EXCLUDED.instructions,
    tips = EXCLUDED.tips,
    metadata = EXCLUDED.metadata,
    updated_at = gamilit.now_mexico();

-- =====================================================
-- Verification
-- =====================================================
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM gamification_system.achievements
    WHERE category = 'collection'::gamification_system.achievement_category;

    RAISE NOTICE '';
    RAISE NOTICE '=== COLLECTION ACHIEVEMENTS (REC-011) ===';
    RAISE NOTICE 'Total collection achievements: %', v_count;

    IF v_count = 5 THEN
        RAISE NOTICE 'All 5 collection achievements created successfully';
    ELSE
        RAISE WARNING 'Expected 5 collection achievements, found %', v_count;
    END IF;
END $$;
