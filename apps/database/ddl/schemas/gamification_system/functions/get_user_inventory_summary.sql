-- Function: gamification_system.get_user_inventory_summary
-- Description: Obtiene resumen completo del inventario del usuario con estadísticas y adquisiciones recientes
-- Parameters:
--   - p_user_id: UUID - ID del usuario (auth_management.profiles.id)
-- Returns: TABLE (total_items, total_value_coins, items_by_category, consumables_count, cosmetics_count, boosts_count, recent_acquisitions)
-- Example:
--   SELECT * FROM gamification_system.get_user_inventory_summary('123e4567-e89b-12d3-a456-426614174000');
-- Dependencies: gamification_system.user_purchases, gamification_system.shop_items
-- Created: 2025-10-28
-- Modified: 2026-02-18 (FIX-P0-2: Corregidas referencias a tablas/columnas reales)

DROP FUNCTION IF EXISTS gamification_system.get_user_inventory_summary(UUID);

CREATE OR REPLACE FUNCTION gamification_system.get_user_inventory_summary(
    p_user_id UUID
)
RETURNS TABLE (
    total_items INTEGER,
    total_value_coins INTEGER,
    items_by_category JSONB,
    consumables_count INTEGER,
    cosmetics_count INTEGER,
    boosts_count INTEGER,
    recent_acquisitions JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER AS total_items,
        COALESCE(SUM(si.price * up.quantity), 0)::INTEGER AS total_value_coins,
        COALESCE(
            jsonb_object_agg(si.category, cat_count.cnt),
            '{}'::jsonb
        ) AS items_by_category,
        COUNT(*) FILTER (WHERE si.is_consumable = true)::INTEGER AS consumables_count,
        COUNT(*) FILTER (WHERE si.is_consumable = false AND si.category IN ('cosmetics', 'profile'))::INTEGER AS cosmetics_count,
        COUNT(*) FILTER (WHERE si.is_consumable = true AND si.effect_data->>'type' IN ('xp_boost', 'coins_boost'))::INTEGER AS boosts_count,
        (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'item_name', si2.name,
                    'quantity', up2.quantity,
                    'purchased_at', up2.purchased_at
                )
            ), '[]'::jsonb)
            FROM gamification_system.user_purchases up2
            JOIN gamification_system.shop_items si2 ON si2.id = up2.item_id
            WHERE up2.user_id = p_user_id
              AND up2.status = 'completed'
            ORDER BY up2.purchased_at DESC
            LIMIT 5
        ) AS recent_acquisitions
    FROM gamification_system.user_purchases up
    JOIN gamification_system.shop_items si ON si.id = up.item_id
    LEFT JOIN LATERAL (
        SELECT si_inner.category, COUNT(*)::INTEGER AS cnt
        FROM gamification_system.user_purchases up_inner
        JOIN gamification_system.shop_items si_inner ON si_inner.id = up_inner.item_id
        WHERE up_inner.user_id = p_user_id AND up_inner.status = 'completed'
        GROUP BY si_inner.category
    ) cat_count ON cat_count.category = si.category
    WHERE up.user_id = p_user_id
      AND up.status = 'completed'
    GROUP BY up.user_id;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION gamification_system.get_user_inventory_summary(UUID) IS
    'Obtiene resumen completo del inventario del usuario con estadísticas (v2.0 - tablas corregidas)';

-- Grant permissions
GRANT EXECUTE ON FUNCTION gamification_system.get_user_inventory_summary(UUID) TO gamilit_user;
