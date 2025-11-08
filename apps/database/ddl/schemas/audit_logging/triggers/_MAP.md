# Triggers - audit_logging Schema
**Generated:** 2025-11-02
**Total Triggers:** 1/1
**Status:** MIGRATED

---

## Trigger Mapping

| # | Trigger Name | File | Table | Function | Event | Status |
|---|---|---|---|---|---|---|
| 1 | trg_system_alerts_updated_at | 01-trg_system_alerts_updated_at.sql | system_alerts | gamilit.update_updated_at_column() | BEFORE UPDATE | OK |

---

## Function Dependencies

### All functions in gamilit schema:
- gamilit.update_updated_at_column() - VERIFIED (used by: trigger 1)

---

## Syntax Validation

All trigger passed SQL syntax validation:
- TRIGGER keyword syntax: OK
- EXECUTE FUNCTION syntax: OK
- DROP IF EXISTS clauses: OK
- Comments and documentation: COMPLETE

---

## Event Types Distribution

- **BEFORE UPDATE:** 1 trigger (1)

---

## Notes

- Trigger depends exclusively on gamilit.update_updated_at_column() function
- Trigger uses BEFORE UPDATE event to automatically update timestamp field
- Trigger monitors system alerts table for audit and logging purposes
- Consistent naming convention follows pattern: trg_[table]_updated_at
- Critical for audit trail maintenance - ensures all system alerts have updated timestamps

---

## Files

**Directory:** `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/audit_logging/triggers/`

**Total Files:** 1
**Last Updated:** 2025-11-02

