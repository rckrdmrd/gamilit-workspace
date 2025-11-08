# Triggers - auth_management Schema
**Generated:** 2025-11-02
**Total Triggers:** 6/6
**Status:** MIGRATED

---

## Trigger Mapping

| # | Trigger Name | File | Table | Function | Event | Status |
|---|---|---|---|---|---|---|
| 1 | trg_memberships_updated_at | 02-trg_memberships_updated_at.sql | memberships | gamilit.update_updated_at_column() | BEFORE UPDATE | ✓ OK |
| 2 | trg_audit_profile_changes | 03-trg_audit_profile_changes.sql | profiles | gamilit.audit_profile_changes() | AFTER UPDATE | ✓ OK |
| 3 | trg_initialize_user_stats | 04-trg_initialize_user_stats.sql | profiles | gamilit.initialize_user_stats() | AFTER INSERT | ✓ OK |
| 4 | trg_profiles_updated_at | 05-trg_profiles_updated_at.sql | profiles | gamilit.update_updated_at_column() | BEFORE UPDATE | ✓ OK |
| 5 | trg_tenants_updated_at | 06-trg_tenants_updated_at.sql | tenants | gamilit.update_updated_at_column() | BEFORE UPDATE | ✓ OK |
| 6 | trg_user_roles_updated_at | 07-trg_user_roles_updated_at.sql | user_roles | gamilit.update_updated_at_column() | BEFORE UPDATE | ✓ OK |

---

## Function Dependencies

### All functions in gamilit schema:
- gamilit.update_updated_at_column() - ✓ VERIFIED (used by: triggers 1, 4, 5, 6)
- gamilit.audit_profile_changes() - ✓ VERIFIED (source: /gamilit/functions/01-audit_profile_changes.sql)
- gamilit.initialize_user_stats() - ✓ VERIFIED (source: /gamilit/functions/04-initialize_user_stats.sql)

---

## Syntax Validation

All triggers passed SQL syntax validation:
- TRIGGER keyword syntax: ✓ OK
- EXECUTE FUNCTION syntax: ✓ OK
- DROP IF EXISTS clauses: ✓ OK
- Comments and documentation: ✓ COMPLETE

---

## Event Types Distribution

- **BEFORE UPDATE:** 4 triggers (1, 4, 5, 6)
- **AFTER INSERT:** 1 trigger (3)
- **AFTER UPDATE:** 1 trigger (2)

---

## Notes

- All triggers depend exclusively on functions in gamilit schema
- Trigger 3 (initialize_user_stats) fires on INSERT and initializes gamification data for new users
- Trigger 2 (audit_profile_changes) creates audit trail for security and compliance
- Triggers 1, 4, 5, 6 share common utility for timestamp management
- Proper execution order: BEFORE triggers (1, 4, 5, 6) execute first, then AFTER triggers (2, 3)

---

## Files

**Directory:** `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/triggers/`

**Total Size:** ~24 KB
**Last Updated:** 2025-11-02

