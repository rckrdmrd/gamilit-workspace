# Triggers - educational_content Schema
**Generated:** 2025-11-02
**Total Triggers:** 4/4
**Status:** MIGRATED

---

## Trigger Mapping

| # | Trigger Name | File | Table | Function | Event | Status |
|---|---|---|---|---|---|---|
| 1 | trg_assessment_rubrics_updated_at | 11-trg_assessment_rubrics_updated_at.sql | assessment_rubrics | gamilit.update_updated_at_column() | BEFORE UPDATE | OK |
| 2 | trg_exercises_updated_at | 12-trg_exercises_updated_at.sql | exercises | gamilit.update_updated_at_column() | BEFORE UPDATE | OK |
| 3 | trg_media_resources_updated_at | 13-trg_media_resources_updated_at.sql | media_resources | gamilit.update_updated_at_column() | BEFORE UPDATE | OK |
| 4 | trg_modules_updated_at | 14-trg_modules_updated_at.sql | modules | gamilit.update_updated_at_column() | BEFORE UPDATE | OK |

---

## Function Dependencies

### All functions in gamilit schema:
- gamilit.update_updated_at_column() - VERIFIED (used by: triggers 1, 2, 3, 4)

---

## Syntax Validation

All triggers passed SQL syntax validation:
- TRIGGER keyword syntax: OK
- EXECUTE FUNCTION syntax: OK
- DROP IF EXISTS clauses: OK
- Comments and documentation: COMPLETE

---

## Event Types Distribution

- **BEFORE UPDATE:** 4 triggers (1, 2, 3, 4)

---

## Notes

- All triggers depend exclusively on gamilit.update_updated_at_column() function
- All triggers use BEFORE UPDATE event to automatically update timestamp field
- Triggers fire on any column modification in their respective tables
- Consistent naming convention follows pattern: trg_[table]_updated_at
- Proper execution order: All triggers are independent and can execute in any order

---

## Files

**Directory:** `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/educational_content/triggers/`

**Total Files:** 4
**Last Updated:** 2025-11-02

