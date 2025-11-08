# Code Map - M-GAM

**Última actualización:** 2025-11-07
**Total de objetos:** 92

---

## Base de Datos

| OBJ ID | Tipo | Nombre | Schema | Ruta | Líneas |
|--------|------|--------|--------|------|--------|
| `OBJ-DB-GAM-ENUM-MAYA-RANK` | enum | `maya_rank` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/enums/maya_rank.sql` | 54 |
| `OBJ-DB-GAM-ENUM-TRANSACTION-TYPE` | enum | `transaction_type` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/enums/transaction_type.sql` | 114 |
| `OBJ-DB-GAM-FN-UPDATE-MISSIONS-UPDATED-AT` | function | `update_missions_updated_at` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/functions/06-update_missions_updated_at.sql` | 18 |
| `OBJ-DB-GAM-FN-UPDATE-NOTIFICATIONS-UPDATED-AT` | function | `update_notifications_updated_at` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/functions/07-update_notifications_updated_at.sql` | 18 |
| `OBJ-DB-GAM-FN-RECALCULATE-LEVEL-ON-XP-CHANGE` | function | `recalculate_level_on_xp_change` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/functions/08-recalculate_level_on_xp_change.sql` | 29 |
| `OBJ-DB-GAM-FN-APPLY-XP-BOOST` | function | `apply_xp_boost` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/functions/apply_xp_boost.sql` | 51 |
| `OBJ-DB-GAM-FN-AWARD-ML-COINS` | function | `award_ml_coins` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/functions/award_ml_coins.sql` | 92 |
| `OBJ-DB-GAM-FN-CALCULATE-LEVEL-FROM-XP` | function | `calculate_level_from_xp` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/functions/calculate_level_from_xp.sql` | 22 |
| `OBJ-DB-GAM-FN-CALCULATE-USER-RANK` | function | `calculate_user_rank` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/functions/calculate_user_rank.sql` | 67 |
| `OBJ-DB-GAM-FN-CHECK-AND-GRANT-ACHIEVEMENTS` | function | `check_and_grant_achievements` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/functions/check_and_award_achievements.sql` | 112 |
| `OBJ-DB-GAM-FN-CLAIM-ACHIEVEMENT-REWARD` | function | `claim_achievement_reward` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/functions/claim_achievement_reward.sql` | 91 |
| `OBJ-DB-GAM-FN-CONSUME-COMODIN` | function | `consume_comodin` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/functions/consume_comodin.sql` | 139 |
| `OBJ-DB-GAM-FN-GET-USER-COMODINES` | function | `get_user_comodines` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/functions/get_user_comodines.sql` | 49 |
| `OBJ-DB-GAM-FN-GET-USER-RANK-PROGRESS` | function | `get_user_rank_progress` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/functions/get_user_current_rank.sql` | 85 |
| `OBJ-DB-GAM-FN-GET-USER-INVENTORY-SUMMARY` | function | `get_user_inventory_summary` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/functions/get_user_inventory.sql` | 62 |
| `OBJ-DB-GAM-FN-GET-USER-INVENTORY-SUMMARY` | function | `get_user_inventory_summary` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/functions/get_user_inventory_summary.sql` | 62 |
| `OBJ-DB-GAM-FN-GET-USER-RANK-PROGRESS` | function | `get_user_rank_progress` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/functions/get_user_rank_progress.sql` | 85 |
| `OBJ-DB-GAM-FN-GET-USER-RANK-REQUIREMENTS` | function | `get_user_rank_requirements` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/functions/get_user_rank_requirements.sql` | 53 |
| `OBJ-DB-GAM-FN-CHECK-AND-GRANT-ACHIEVEMENTS` | function | `check_and_grant_achievements` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/functions/grant_achievement.sql` | 112 |
| `OBJ-DB-GAM-FN-PROCESS-EXERCISE-COMPLETION` | function | `process_exercise_completion` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/functions/process_exercise_completion.sql` | 68 |
| `OBJ-DB-GAM-FN-CONSUME-COMODIN` | function | `consume_comodin` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/functions/redeem_comodin.sql` | 139 |
| `OBJ-DB-GAM-FN-UPDATE-LEADERBOARD-COINS` | function | `update_leaderboard_coins` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/functions/update_leaderboard_coins.sql` | 53 |
| `OBJ-DB-GAM-FN-UPDATE-LEADERBOARD-GLOBAL` | function | `update_leaderboard_global` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/functions/update_leaderboard_global.sql` | 77 |
| `OBJ-DB-GAM-FN-UPDATE-LEADERBOARD-STREAKS` | function | `update_leaderboard_streaks` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/functions/update_leaderboard_streaks.sql` | 88 |
| `OBJ-DB-GAM-FN-UPDATE-USER-RANK` | function | `update_user_rank` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/functions/update_user_rank.sql` | 86 |
| `OBJ-DB-GAM-IDX-IDX-ACHIEVEMENT-CATEGORIES-ACTIVE` | index | `idx_achievement_categories_active` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/indexes/01-idx_achievement_categories_active.sql` | 109 |
| `OBJ-DB-GAM-IDX-IDX-ACHIEVEMENTS-METADATA-GIN` | index | `idx_achievements_metadata_gin` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/indexes/01-idx_achievements_metadata_gin.sql` | 30 |
| `OBJ-DB-GAM-IDX-IDX-ACTIVE-BOOSTS-USER` | index | `idx_active_boosts_user` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/indexes/02-idx_active_boosts_user.sql` | 25 |
| `OBJ-DB-GAM-IDX-IDX-INVENTORY-TRANSACTIONS-USER` | index | `idx_inventory_transactions_user` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/indexes/02-idx_inventory_transactions_user.sql` | 149 |
| `OBJ-DB-GAM-MATE-CREATE` | materialized_view | `create` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/materialized-views/01-mv_global_leaderboard.sql` | 88 |
| `OBJ-DB-GAM-MATE-CREATE` | materialized_view | `create` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/materialized-views/02-mv_classroom_leaderboard.sql` | 104 |
| `OBJ-DB-GAM-MATE-CREATE` | materialized_view | `create` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/materialized-views/03-mv_weekly_leaderboard.sql` | 98 |
| `OBJ-DB-GAM-MATE-MV-MECHANIC-LEADERBOARD` | materialized_view | `mv_mechanic_leaderboard` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/materialized-views/04-mv_mechanic_leaderboard.sql` | 111 |
| `OBJ-DB-GAM-UNKN-01-ENABLE-RLS` | unknown | `01-enable-rls` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/rls-policies/01-enable-rls.sql` | 33 |
| `OBJ-DB-GAM-UNKN-02-ML-COINS-POLICIES` | unknown | `02-ml-coins-policies` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/rls-policies/02-ml-coins-policies.sql` | 92 |
| `OBJ-DB-GAM-UNKN-02-POLICIES` | unknown | `02-policies` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/rls-policies/02-policies.sql` | 160 |
| `OBJ-DB-GAM-UNKN-03-ACHIEVEMENTS-POLICIES` | unknown | `03-achievements-policies` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/rls-policies/03-achievements-policies.sql` | 120 |
| `OBJ-DB-GAM-UNKN-03-GRANTS` | unknown | `03-grants` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/rls-policies/03-grants.sql` | 26 |
| `OBJ-DB-GAM-UNKN-04-USER-STATS-POLICIES` | unknown | `04-user-stats-policies` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/rls-policies/04-user-stats-policies.sql` | 139 |
| `OBJ-DB-GAM-UNKN-05-INVENTORY-MISSIONS-POLICIES` | unknown | `05-inventory-missions-policies` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/rls-policies/05-inventory-missions-policies.sql` | 104 |
| `OBJ-DB-GAM-UNKN-06-NOTIFICATIONS-LEADERBOARD-POLICIES` | unknown | `06-notifications-leaderboard-policies` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/rls-policies/06-notifications-leaderboard-policies.sql` | 117 |
| `OBJ-DB-GAM-TRG-USER-STATS` | trigger | `user_stats` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/tables/01-user_stats.sql` | 324 |
| `OBJ-DB-GAM-TRG-USER-RANKS` | trigger | `user_ranks` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/tables/02-user_ranks.sql` | 100 |
| `OBJ-DB-GAM-TRG-ACHIEVEMENTS` | trigger | `achievements` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/tables/03-achievements.sql` | 191 |
| `OBJ-DB-GAM-IDX-USER-ACHIEVEMENTS` | index | `user_achievements` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/tables/04-user_achievements.sql` | 171 |
| `OBJ-DB-GAM-IDX-ML-COINS-TRANSACTIONS` | index | `ml_coins_transactions` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/tables/05-ml_coins_transactions.sql` | 170 |
| `OBJ-DB-GAM-TRG-MISSIONS` | trigger | `missions` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/tables/06-missions.sql` | 173 |
| `OBJ-DB-GAM-TRG-COMODINES-INVENTORY` | trigger | `comodines_inventory` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/tables/07-comodines_inventory.sql` | 238 |
| `OBJ-DB-GAM-TRG-NOTIFICATIONS` | trigger | `notifications` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/tables/08-notifications.sql` | 152 |
| `OBJ-DB-GAM-TBL-LEADERBOARD-METADATA` | table | `leaderboard_metadata` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/tables/09-leaderboard_metadata.sql` | 27 |
| `OBJ-DB-GAM-TRG-ACHIEVEMENT-CATEGORIES` | trigger | `achievement_categories` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/tables/10-achievement_categories.sql` | 56 |
| `OBJ-DB-GAM-TRG-ACTIVE-BOOSTS` | trigger | `active_boosts` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/tables/11-active_boosts.sql` | 66 |
| `OBJ-DB-GAM-IDX-INVENTORY-TRANSACTIONS` | index | `inventory_transactions` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/tables/12-inventory_transactions.sql` | 60 |
| `OBJ-DB-GAM-TRG-MAYA-RANKS` | trigger | `maya_ranks` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/tables/13-maya_ranks.sql` | 131 |
| `OBJ-DB-GAM-TRG-TRG-ACHIEVEMENTS-UPDATED-AT` | trigger | `trg_achievements_updated_at` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/triggers/15-trg_achievements_updated_at.sql` | 15 |
| `OBJ-DB-GAM-TRG-TRG-COMODINES-INVENTORY-UPDATED-AT` | trigger | `trg_comodines_inventory_updated_at` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/triggers/16-trg_comodines_inventory_updated_at.sql` | 15 |
| `OBJ-DB-GAM-TRG-MISSIONS-UPDATED-AT` | trigger | `missions_updated_at` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/triggers/17-missions_updated_at.sql` | 15 |
| `OBJ-DB-GAM-TRG-NOTIFICATIONS-UPDATED-AT` | trigger | `notifications_updated_at` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/triggers/18-notifications_updated_at.sql` | 15 |
| `OBJ-DB-GAM-TRG-TRG-RECALCULATE-LEVEL-ON-XP-CHANGE` | trigger | `trg_recalculate_level_on_xp_change` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/triggers/18-trg_recalculate_level_on_xp_change.sql` | 16 |
| `OBJ-DB-GAM-TRG-TRG-USER-RANKS-UPDATED-AT` | trigger | `trg_user_ranks_updated_at` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/triggers/19-trg_user_ranks_updated_at.sql` | 15 |
| `OBJ-DB-GAM-TRG-TRG-USER-STATS-UPDATED-AT` | trigger | `trg_user_stats_updated_at` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/triggers/20-trg_user_stats_updated_at.sql` | 15 |
| `OBJ-DB-GAM-MATE-LEADERBOARD-COINS` | materialized_view | `leaderboard_coins` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/views/01-leaderboard_coins.sql` | 48 |
| `OBJ-DB-GAM-MATE-LEADERBOARD-GLOBAL` | materialized_view | `leaderboard_global` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/views/02-leaderboard_global.sql` | 70 |
| `OBJ-DB-GAM-MATE-LEADERBOARD-STREAKS` | materialized_view | `leaderboard_streaks` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/views/03-leaderboard_streaks.sql` | 49 |
| `OBJ-DB-GAM-MATE-LEADERBOARD-XP` | materialized_view | `leaderboard_xp` | gamification_system | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/views/04-leaderboard_xp.sql` | 48 |

---

## Backend

| OBJ ID | Tipo | Nombre | Ruta |
|--------|------|--------|------|
| `OBJ-BE-GAM-CTRL-ACHIEVEMENTS-CONTROLLER` | controller | `achievements.controller` | `gamification/controllers/achievements.controller.ts` |
| `OBJ-BE-GAM-CTRL-LEADERBOARD-CONTROLLER` | controller | `leaderboard.controller` | `gamification/controllers/leaderboard.controller.ts` |
| `OBJ-BE-GAM-CTRL-ML-COINS-CONTROLLER` | controller | `ml-coins.controller` | `gamification/controllers/ml-coins.controller.ts` |
| `OBJ-BE-GAM-CTRL-RANKS-CONTROLLER` | controller | `ranks.controller` | `gamification/controllers/ranks.controller.ts` |
| `OBJ-BE-GAM-CTRL-USER-STATS-CONTROLLER` | controller | `user-stats.controller` | `gamification/controllers/user-stats.controller.ts` |
| `OBJ-BE-GAM-SVC-ACHIEVEMENTS-SERVICE` | service | `achievements.service` | `gamification/services/achievements.service.ts` |
| `OBJ-BE-GAM-SVC-LEADERBOARD-SERVICE` | service | `leaderboard.service` | `gamification/services/leaderboard.service.ts` |
| `OBJ-BE-GAM-SVC-ML-COINS-SERVICE` | service | `ml-coins.service` | `gamification/services/ml-coins.service.ts` |
| `OBJ-BE-GAM-SVC-RANKS-SERVICE` | service | `ranks.service` | `gamification/services/ranks.service.ts` |
| `OBJ-BE-GAM-SVC-USER-STATS-SERVICE` | service | `user-stats.service` | `gamification/services/user-stats.service.ts` |
| `OBJ-BE-GAM-ENT-ACHIEVEMENT-CATEGORY-ENTITY` | entity | `achievement-category.entity` | `gamification/entities/achievement-category.entity.ts` |
| `OBJ-BE-GAM-ENT-ACHIEVEMENT-ENTITY` | entity | `achievement.entity` | `gamification/entities/achievement.entity.ts` |
| `OBJ-BE-GAM-ENT-ACTIVE-BOOST-ENTITY` | entity | `active-boost.entity` | `gamification/entities/active-boost.entity.ts` |
| `OBJ-BE-GAM-ENT-COMODINES-INVENTORY-ENTITY` | entity | `comodines-inventory.entity` | `gamification/entities/comodines-inventory.entity.ts` |
| `OBJ-BE-GAM-ENT-INVENTORY-TRANSACTION-ENTITY` | entity | `inventory-transaction.entity` | `gamification/entities/inventory-transaction.entity.ts` |
| `OBJ-BE-GAM-ENT-LEADERBOARD-METADATA-ENTITY` | entity | `leaderboard-metadata.entity` | `gamification/entities/leaderboard-metadata.entity.ts` |
| `OBJ-BE-GAM-ENT-MISSION-ENTITY` | entity | `mission.entity` | `gamification/entities/mission.entity.ts` |
| `OBJ-BE-GAM-ENT-ML-COINS-TRANSACTION-ENTITY` | entity | `ml-coins-transaction.entity` | `gamification/entities/ml-coins-transaction.entity.ts` |
| `OBJ-BE-GAM-ENT-USER-ACHIEVEMENT-ENTITY` | entity | `user-achievement.entity` | `gamification/entities/user-achievement.entity.ts` |
| `OBJ-BE-GAM-ENT-USER-RANK-ENTITY` | entity | `user-rank.entity` | `gamification/entities/user-rank.entity.ts` |
| `OBJ-BE-GAM-ENT-USER-STATS-ENTITY` | entity | `user-stats.entity` | `gamification/entities/user-stats.entity.ts` |
| `OBJ-BE-GAM-CTRL-MISSIONS-CONTROLLER` | controller | `missions.controller` | `missions/controllers/missions.controller.ts` |
| `OBJ-BE-GAM-SVC-MISSIONS-SERVICE` | service | `missions.service` | `missions/services/missions.service.ts` |
| `OBJ-BE-GAM-ENT-MISSION-ENTITY` | entity | `mission.entity` | `missions/entities/mission.entity.ts` |
| `OBJ-BE-GAM-CTRL-POWERUPS-CONTROLLER` | controller | `powerups.controller` | `powerups/controllers/powerups.controller.ts` |
| `OBJ-BE-GAM-SVC-POWERUPS-SERVICE` | service | `powerups.service` | `powerups/services/powerups.service.ts` |
| `OBJ-BE-GAM-ENT-COMODINES-INVENTORY-ENTITY` | entity | `comodines-inventory.entity` | `powerups/entities/comodines-inventory.entity.ts` |

---

## Frontend

| OBJ ID | Tipo | Nombre | Ruta |
|--------|------|--------|------|