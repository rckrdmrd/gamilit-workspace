# Triggers - social_features Schema
**Generated:** 2025-11-02
**Total Triggers:** 5/5
**Status:** MIGRATED

---

## Trigger Mapping

| # | Trigger Name | File | Table | Function | Event | Status |
|---|---|---|---|---|---|---|
| 1 | trg_classroom_members_updated_at | 24-trg_classroom_members_updated_at.sql | classroom_members | gamilit.update_updated_at_column() | BEFORE UPDATE | ✓ OK |
| 2 | trg_update_classroom_count | 25-trg_update_classroom_count.sql | classroom_members | gamilit.update_classroom_member_count() | AFTER INSERT OR DELETE | ✓ OK |
| 3 | trg_classrooms_updated_at | 26-trg_classrooms_updated_at.sql | classrooms | gamilit.update_updated_at_column() | BEFORE UPDATE | ✓ OK |
| 4 | trg_schools_updated_at | 27-trg_schools_updated_at.sql | schools | gamilit.update_updated_at_column() | BEFORE UPDATE | ✓ OK |
| 5 | trg_teams_updated_at | 28-trg_teams_updated_at.sql | teams | gamilit.update_updated_at_column() | BEFORE UPDATE | ✓ OK |

---

## Function Dependencies

### All functions in gamilit schema:
- gamilit.update_updated_at_column() - ✓ VERIFIED (used by: triggers 1, 3, 4, 5)
- gamilit.update_classroom_member_count() - ✓ VERIFIED (source: /gamilit/functions/10-update_classroom_member_count.sql)

---

## Syntax Validation

All triggers passed SQL syntax validation:
- TRIGGER keyword syntax: ✓ OK
- EXECUTE FUNCTION syntax: ✓ OK
- DROP IF EXISTS clauses: ✓ OK
- Comments and documentation: ✓ COMPLETE

---

## Event Types Distribution

- **BEFORE UPDATE:** 4 triggers (1, 3, 4, 5)
- **AFTER INSERT OR DELETE:** 1 trigger (2)

---

## Notes

- All triggers depend exclusively on functions in gamilit schema
- Trigger 2 (trg_update_classroom_count) handles both INSERT and DELETE operations on classroom_members
- This allows automatic synchronization of member_count in classrooms table
- Triggers 1, 3, 4, 5 share common utility for timestamp management
- Proper execution order: BEFORE triggers (1, 3, 4, 5) execute first, then AFTER trigger (2)

---

## Table Coverage

- **classroom_members:** 2 triggers (1, 2)
- **classrooms:** 1 trigger (3)
- **schools:** 1 trigger (4)
- **teams:** 1 trigger (5)

---

## Files

**Directory:** `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/triggers/`

**Total Size:** ~20 KB
**Last Updated:** 2025-11-02

