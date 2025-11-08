# Triggers - gamification_system Schema
**Generated:** 2025-11-02
**Total Triggers:** 7/7
**Status:** MIGRATED

---

## Trigger Mapping

| # | Trigger Name | File | Table | Function | Event | Status |
|---|---|---|---|---|---|---|
| 1 | trg_achievements_updated_at | 15-trg_achievements_updated_at.sql | achievements | gamilit.update_updated_at_column() | BEFORE UPDATE | ✓ OK |
| 2 | trg_comodines_inventory_updated_at | 16-trg_comodines_inventory_updated_at.sql | comodines_inventory | gamilit.update_updated_at_column() | BEFORE UPDATE | ✓ OK |
| 3 | missions_updated_at | 17-missions_updated_at.sql | missions | gamification_system.update_missions_updated_at() | BEFORE UPDATE | ✓ OK |
| 4 | notifications_updated_at | 18-notifications_updated_at.sql | notifications | gamification_system.update_notifications_updated_at() | BEFORE UPDATE | ✓ OK |
| 5 | trg_recalculate_level_on_xp_change | 18-trg_recalculate_level_on_xp_change.sql | user_stats | gamification_system.recalculate_level_on_xp_change() | BEFORE UPDATE OF | ✓ OK |
| 6 | trg_user_ranks_updated_at | 19-trg_user_ranks_updated_at.sql | user_ranks | gamilit.update_updated_at_column() | BEFORE UPDATE | ✓ OK |
| 7 | trg_user_stats_updated_at | 20-trg_user_stats_updated_at.sql | user_stats | gamilit.update_updated_at_column() | BEFORE UPDATE | ✓ OK |

---

## Function Dependencies

### Functions in gamilit schema:
- gamilit.update_updated_at_column() - ✓ VERIFIED

### Functions in gamification_system schema:
- gamification_system.update_missions_updated_at() - ✓ VERIFIED (source: /gamification_system/functions/06-update_missions_updated_at.sql)
- gamification_system.update_notifications_updated_at() - ✓ VERIFIED (source: /gamification_system/functions/07-update_notifications_updated_at.sql)
- gamification_system.recalculate_level_on_xp_change() - ✓ VERIFIED (source: /gamification_system/functions/08-recalculate_level_on_xp_change.sql)

---

## Syntax Validation

All triggers passed SQL syntax validation:
- TRIGGER keyword syntax: ✓ OK
- EXECUTE FUNCTION syntax: ✓ OK
- DROP IF EXISTS clauses: ✓ OK
- Comments and documentation: ✓ COMPLETE

---

## Notes

- Triggers 1, 2, 6, 7 use shared utility function from gamilit schema
- Triggers 3, 4, 5 use specialized functions specific to gamification_system
- All triggers include DROP IF EXISTS CASCADE for safety
- Trigger 5 uses conditional execution with WHEN clause (NEW.total_xp IS DISTINCT FROM OLD.total_xp)
- Proper sequencing: updated_at triggers should be executed before specialized triggers

---

## Files

**Directory:** `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/triggers/`

**Total Size:** ~28 KB
**Last Updated:** 2025-11-02

