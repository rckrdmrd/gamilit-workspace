-- ============================================================
-- Backfill: Initialize user_achievements for existing users
-- Idempotent: safe to run multiple times (ON CONFLICT DO NOTHING)
-- Run as superuser (postgres) or gamilit_user with BYPASSRLS
-- ============================================================

DO $$
DECLARE
  v_count INT := 0;
  v_user RECORD;
BEGIN
  RAISE NOTICE 'Starting user_achievements backfill...';

  FOR v_user IN
    SELECT DISTINCT us.user_id
    FROM gamification_system.user_stats us
    WHERE NOT EXISTS (
      SELECT 1 FROM gamification_system.user_achievements ua
      WHERE ua.user_id = us.user_id
      LIMIT 1
    )
  LOOP
    INSERT INTO gamification_system.user_achievements (
      user_id, achievement_id, progress, max_progress, is_completed, completion_percentage
    )
    SELECT
      v_user.user_id,
      a.id,
      0,
      CASE
        WHEN a.conditions->'requirements'->>'exercises_completed' IS NOT NULL
          THEN (a.conditions->'requirements'->>'exercises_completed')::int
        WHEN a.conditions->'requirements'->>'streak_days' IS NOT NULL
          THEN (a.conditions->'requirements'->>'streak_days')::int
        WHEN a.conditions->'requirements'->>'perfect_scores' IS NOT NULL
          THEN (a.conditions->'requirements'->>'perfect_scores')::int
        WHEN a.conditions->'requirements'->>'modules_completed' IS NOT NULL
          THEN (a.conditions->'requirements'->>'modules_completed')::int
        WHEN a.conditions->'requirements'->>'count' IS NOT NULL
          THEN (a.conditions->'requirements'->>'count')::int
        ELSE 1
      END,
      false,
      0.00
    FROM gamification_system.achievements a
    WHERE a.is_active = true
    ON CONFLICT (user_id, achievement_id) DO NOTHING;

    v_count := v_count + 1;
  END LOOP;

  RAISE NOTICE 'Backfill complete: % users processed', v_count;
END $$;

-- Verification
SELECT
  'Total user_achievements records' as metric,
  COUNT(*)::text as value
FROM gamification_system.user_achievements
UNION ALL
SELECT
  'Users with achievements initialized',
  COUNT(DISTINCT user_id)::text
FROM gamification_system.user_achievements
UNION ALL
SELECT
  'Users missing achievements',
  COUNT(*)::text
FROM gamification_system.user_stats us
WHERE NOT EXISTS (
  SELECT 1 FROM gamification_system.user_achievements ua
  WHERE ua.user_id = us.user_id
);
