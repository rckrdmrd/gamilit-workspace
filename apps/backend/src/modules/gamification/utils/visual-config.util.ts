/**
 * Utility for merging visual configuration from effect_data into metadata.
 *
 * Per ESTANDAR-METADATA-ITEMS.md (Section 6.1), visual keys belong in `metadata`
 * and functional keys in `effect_data`. This utility bridges legacy data where
 * visual config was stored in effect_data.
 *
 * @module gamification/utils/visual-config
 */

/** Keys that represent visual/rendering configuration */
const VISUAL_KEYS = [
  'type',
  'asset_url',
  'border_color',
  'display_text',
  'color',
  'css_class',
  'render_mode',
  'animated',
  'animation',
  'glow_color',
] as const;

/**
 * Merges visual config keys from effect_data into metadata so the frontend
 * can read asset_url, type, border_color, etc. from a single field.
 *
 * Mutates the item in-place for performance (avoids object spread on hot paths
 * like batch queries).
 *
 * @param item Object with optional effect_data and metadata JSONB fields
 */
export function mergeVisualConfig(
  item: { effect_data?: Record<string, unknown>; metadata?: Record<string, unknown> } | null | undefined,
): void {
  if (!item?.effect_data) return;
  const visual = item.effect_data;
  for (const key of VISUAL_KEYS) {
    if (visual[key] !== undefined) {
      item.metadata = item.metadata || {};
      item.metadata[key] = visual[key];
    }
  }
}
