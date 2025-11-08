# Triggers - content_management Schema
**Generated:** 2025-11-02
**Total Triggers:** 3/3
**Status:** MIGRATED

---

## Trigger Mapping

| # | Trigger Name | File | Table | Function | Event | Status |
|---|---|---|---|---|---|---|
| 1 | trg_content_templates_updated_at | 08-trg_content_templates_updated_at.sql | content_templates | gamilit.update_updated_at_column() | BEFORE UPDATE | OK |
| 2 | trg_marie_curie_content_updated_at | 09-trg_marie_curie_content_updated_at.sql | marie_curie_content | gamilit.update_updated_at_column() | BEFORE UPDATE | OK |
| 3 | trg_media_files_updated_at | 10-trg_media_files_updated_at.sql | media_files | gamilit.update_updated_at_column() | BEFORE UPDATE | OK |

---

## Function Dependencies

### All functions in gamilit schema:
- gamilit.update_updated_at_column() - VERIFIED (used by: triggers 1, 2, 3)

---

## Syntax Validation

All triggers passed SQL syntax validation:
- TRIGGER keyword syntax: OK
- EXECUTE FUNCTION syntax: OK
- DROP IF EXISTS clauses: OK
- Comments and documentation: COMPLETE

---

## Event Types Distribution

- **BEFORE UPDATE:** 3 triggers (1, 2, 3)

---

## Notes

- All triggers depend exclusively on gamilit.update_updated_at_column() function
- All triggers use BEFORE UPDATE event to automatically update timestamp field
- Trigger 2 is specific to Marie Curie content module
- Triggers handle different content types: templates, specialized content, and media files
- Consistent naming convention follows pattern: trg_[table]_updated_at
- Proper execution order: All triggers are independent and can execute in any order

---

## Files

**Directory:** `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/content_management/triggers/`

**Total Files:** 3
**Last Updated:** 2025-11-02

