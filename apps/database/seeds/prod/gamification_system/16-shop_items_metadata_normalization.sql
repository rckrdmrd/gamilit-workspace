-- =====================================================
-- Seed: gamification_system.shop_items metadata normalization (PROD)
-- Description: Alinea metadata visual canonica desde datos legacy
-- Environment: PRODUCTION
-- Dependencies: 13-shop_items.sql
-- Order: 16
-- =====================================================

SET search_path TO gamification_system, auth_management, public;

-- Normaliza metadata visual cuando el item aun trae payload visual en effect_data
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

-- Para marcos basados en asset_url, explicitar render_mode canonico
UPDATE gamification_system.shop_items
SET metadata = metadata || jsonb_build_object('render_mode', 'image')
WHERE metadata->>'type' = 'profile_frame'
  AND metadata ? 'asset_url'
  AND NOT (metadata ? 'render_mode');
