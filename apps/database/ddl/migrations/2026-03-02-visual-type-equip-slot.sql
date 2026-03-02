-- =====================================================================================
-- Migration: Add visual_type column to user_equipped_items
-- Date: 2026-03-02
-- Purpose: Allow independent equipment slots (avatar + frame + background simultaneously)
--          instead of one-item-per-category which caused avatar/frame conflicts.
--
-- Changes:
--   1. Add visual_type column (text, default 'cosmetics')
--   2. Backfill visual_type from shop_items.effect_data->>'type'
--   3. Deduplicate conflicting rows (keep most recent per user_id + visual_type)
--   4. Replace UNIQUE index (user_id, category_id) -> (user_id, visual_type)
--
-- Rollback: DROP COLUMN visual_type + recreate old unique index
-- =====================================================================================

BEGIN;

-- Step 1: Add column (idempotent)
ALTER TABLE gamification_system.user_equipped_items
  ADD COLUMN IF NOT EXISTS visual_type text DEFAULT 'cosmetics';

-- Step 2: Backfill from shop_items metadata
UPDATE gamification_system.user_equipped_items uei
SET visual_type = COALESCE(
  si.effect_data->>'type',
  (si.metadata->>'type'),
  'cosmetics'
)
FROM gamification_system.shop_items si
WHERE si.id = uei.item_id
  AND uei.visual_type = 'cosmetics';

-- Step 3: Set NOT NULL
ALTER TABLE gamification_system.user_equipped_items
  ALTER COLUMN visual_type SET NOT NULL;

-- Step 4: Deduplicate — keep the most recently equipped row per user_id + visual_type
DELETE FROM gamification_system.user_equipped_items
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY user_id, visual_type ORDER BY equipped_at DESC NULLS LAST) AS rn
    FROM gamification_system.user_equipped_items
  ) ranked
  WHERE rn > 1
);

-- Step 5: Drop old unique index and create new one
DROP INDEX IF EXISTS gamification_system.idx_user_equipped_unique_category;
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_equipped_unique_visual_type
  ON gamification_system.user_equipped_items(user_id, visual_type);

-- Step 6: Add column comment
COMMENT ON COLUMN gamification_system.user_equipped_items.visual_type
  IS 'Slot visual del equipamiento: avatar, profile_frame, profile_background, title, badge';

COMMIT;
