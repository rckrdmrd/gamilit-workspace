# Schema: gamification_system

Sistema de gamificación: logros, rangos, monedas ML, comodines, notificaciones

## Estructura

- **tables/**: 15 archivos
- **enums/**: 4 archivos
- **functions/**: 21 archivos
- **triggers/**: 9 archivos
- **indexes/**: 22 archivos
- **views/**: 4 archivos
- **rls-policies/**: 8 archivos
- **materialized-views/**: 4 archivos

**Total:** 87 objetos

## Contenido Detallado

### tables/ (15 archivos)

```
01-user_stats.sql
02-user_ranks.sql
03-achievements.sql
04-user_achievements.sql
05-ml_coins_transactions.sql
06-missions.sql
07-comodines_inventory.sql
08-notifications.sql
09-leaderboard_metadata.sql
10-achievement_categories.sql
11-active_boosts.sql
12-inventory_transactions.sql
13-maya_ranks.sql
14-comodin_usage_log.sql
15-comodin_usage_tracking.sql
```

### enums/ (4 archivos)

```
maya_rank.sql
notification_priority.sql
notification_type.sql
transaction_type.sql
```

### functions/ (21 archivos)

```
06-update_missions_updated_at.sql
07-update_notifications_updated_at.sql
08-recalculate_level_on_xp_change.sql
apply_xp_boost.sql
award_ml_coins.sql
calculate_level_from_xp.sql
calculate_user_rank.sql
check_and_award_achievements.sql
claim_achievement_reward.sql
consume_comodin.sql
get_user_comodines.sql
get_user_inventory_summary.sql
get_user_rank_progress.sql
get_user_rank_requirements.sql
process_exercise_completion.sql
send_notification.sql
update_leaderboard_coins.sql
update_leaderboard_global.sql
update_leaderboard_streaks.sql
update_user_rank.sql
```

### triggers/ (9 archivos)

```
01-trg_achievement_unlocked.sql
02-trg_check_rank_promotion.sql
15-trg_achievements_updated_at.sql
16-trg_comodines_inventory_updated_at.sql
17-missions_updated_at.sql
18-notifications_updated_at.sql
19-trg_user_ranks_updated_at.sql
20-trg_user_stats_updated_at.sql
21-trg_recalculate_level_on_xp_change.sql
```

### indexes/ (22 archivos)

```
01-idx_achievement_categories_active.sql
02-idx_active_boosts_user.sql
03-idx_achievements_metadata_gin.sql
04-idx_inventory_transactions_user.sql
idx_achievements_active.sql
idx_achievements_category.sql
idx_achievements_conditions_gin.sql
idx_achievements_secret.sql
idx_user_achievements_completed.sql
idx_user_achievements_unclaimed.sql
idx_user_achievements_user_completed.sql
idx_user_achievements_user_id.sql
idx_user_ranks_current.sql
idx_user_ranks_is_current.sql
idx_user_ranks_user_id.sql
idx_user_stats_global_rank.sql
idx_user_stats_level.sql
idx_user_stats_ml_coins.sql
idx_user_stats_streak.sql
idx_user_stats_tenant_id.sql
idx_user_stats_tenant_level.sql
idx_user_stats_user_id.sql
```

### views/ (4 archivos)

```
01-leaderboard_coins.sql
02-leaderboard_global.sql
03-leaderboard_streaks.sql
04-leaderboard_xp.sql
```

### rls-policies/ (8 archivos)

```
01-enable-rls.sql
02-ml-coins-policies.sql
02-policies.sql
03-achievements-policies.sql
03-grants.sql
04-user-stats-policies.sql
05-inventory-missions-policies.sql
06-notifications-leaderboard-policies.sql
```

### materialized-views/ (4 archivos)

```
01-mv_global_leaderboard.sql
02-mv_classroom_leaderboard.sql
03-mv_weekly_leaderboard.sql
04-mv_mechanic_leaderboard.sql
```

---

**Última actualización:** 2025-11-09
**Reorganización:** 2025-11-09
