-- =====================================================
-- Seed: gamification_system.shop_items metadata normalization (STAGING)
-- Description: Alinea metadata visual canonica desde datos legacy
-- Environment: STAGING
-- Dependencies: 13-shop_items.sql
-- Order: 15
-- =====================================================

SET search_path TO gamification_system, auth_management, public;

UPDATE gamification_system.shop_items
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_strip_nulls(
    jsonb_build_object(
        'type', effect_data->>'type',
        'asset_url', effect_data->>'asset_url',
        'animated', effect_data->'animated',
        'border_color', effect_data->>'border_color',
        'display_text', effect_data->>'display_text',
        'color', effect_data->>'color'
    )
)
WHERE effect_data ? 'type'
  AND (metadata IS NULL OR NOT (metadata ? 'type'));

UPDATE gamification_system.shop_items
SET metadata = metadata || jsonb_build_object('render_mode', 'image')
WHERE metadata->>'type' = 'profile_frame'
  AND metadata ? 'asset_url'
  AND NOT (metadata ? 'render_mode');
