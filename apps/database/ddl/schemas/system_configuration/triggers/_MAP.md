# Triggers - system_configuration Schema
**Generated:** 2025-11-02
**Total Triggers:** 2/2
**Status:** MIGRATED

---

## Trigger Mapping

| # | Trigger Name | File | Table | Function | Event | Status |
|---|---|---|---|---|---|---|
| 1 | trg_feature_flags_updated_at | 29-trg_feature_flags_updated_at.sql | feature_flags | gamilit.update_updated_at_column() | BEFORE UPDATE | OK |
| 2 | trg_system_settings_updated_at | 30-trg_system_settings_updated_at.sql | system_settings | gamilit.update_updated_at_column() | BEFORE UPDATE | OK |

---

## Function Dependencies

### All functions in gamilit schema:
- gamilit.update_updated_at_column() - VERIFIED (used by: triggers 1, 2)

---

## Syntax Validation

All triggers passed SQL syntax validation:
- TRIGGER keyword syntax: OK
- EXECUTE FUNCTION syntax: OK
- DROP IF EXISTS clauses: OK
- Comments and documentation: COMPLETE

---

## Event Types Distribution

- **BEFORE UPDATE:** 2 triggers (1, 2)

---

## Notes

- All triggers depend exclusively on gamilit.update_updated_at_column() function
- All triggers use BEFORE UPDATE event to automatically update timestamp field
- Trigger 1 monitors feature flags for system feature toggles
- Trigger 2 monitors system-wide settings and configuration changes
- Consistent naming convention follows pattern: trg_[table]_updated_at
- Proper execution order: Both triggers are independent and can execute in any order

---

## Files

**Directory:** `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/system_configuration/triggers/`

**Total Files:** 2
**Last Updated:** 2025-11-02

