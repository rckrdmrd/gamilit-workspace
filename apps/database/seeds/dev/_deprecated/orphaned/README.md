# Orphaned Seeds (BD-P03)

Seeds moved here on 2026-02-26 because they are not referenced in any loader
(`init-database.sh`, `load-dev-seeds.sh`, `load-staging-seeds.sh`, `load-prod-seeds.sh`).

## Files

| File | Original Location | Reason |
|------|------------------|--------|
| `02-notification_templates_i18n.sql` | `dev/notifications/` | i18n templates not used by notification system |
| `03-notifications.sql` | `dev/notifications/` | Sample notifications — runtime generates these |
| `04-notification_logs.sql` | `dev/notifications/` | Logs are runtime-generated, not seeded |
| `05-notification_queue.sql` | `dev/notifications/` | Queue is runtime-managed, not seeded |
| `03-pending_user_initialization.sql` | `dev/audit_logging/` | Initialization handled by trigger `initialize_user_stats()` |
| `16-classroom_modules.sql` | `dev/educational_content/` | Duplicate of `14-classroom_modules.sql` (already loaded) |

## Restoration

If any of these seeds become needed, move them back to their original directory
and add the appropriate entry to the loader script.
