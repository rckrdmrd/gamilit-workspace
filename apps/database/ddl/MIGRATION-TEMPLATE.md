# Migration Template — Expand/Contract Pattern

## Overview
Use the expand/contract pattern for zero-downtime schema migrations.
Each migration has 3 phases: EXPAND (add new), BACKFILL (migrate data), CONTRACT (remove old).

## Naming Convention
```
EXPAND-YYYY-MM-DD-description.sql
BACKFILL-YYYY-MM-DD-description.sql
CONTRACT-YYYY-MM-DD-description.sql
```

## Phase 1: EXPAND (Safe — no breaking changes)
```sql
-- EXPAND-2026-XX-XX-add-column-to-table.sql
-- Description: Add new_column to schema.table_name
-- Backwards compatible: YES (old code ignores new column)

BEGIN;

ALTER TABLE schema_name.table_name
  ADD COLUMN IF NOT EXISTS new_column_name data_type DEFAULT default_value;

COMMENT ON COLUMN schema_name.table_name.new_column_name
  IS 'Description of the new column. Added in migration EXPAND-2026-XX-XX.';

COMMIT;
```

## Phase 2: BACKFILL (Data migration)
```sql
-- BACKFILL-2026-XX-XX-populate-new-column.sql
-- Description: Copy data from old_column to new_column
-- Run in batches to avoid locking

DO $$
DECLARE
  batch_size INT := 1000;
  total_updated INT := 0;
  rows_affected INT;
BEGIN
  LOOP
    UPDATE schema_name.table_name
    SET new_column_name = old_column_expression
    WHERE new_column_name IS NULL  -- Only unprocessed rows
    LIMIT batch_size;

    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    total_updated := total_updated + rows_affected;

    RAISE NOTICE 'Backfilled % rows (total: %)', rows_affected, total_updated;

    EXIT WHEN rows_affected = 0;

    -- Brief pause between batches
    PERFORM pg_sleep(0.1);
  END LOOP;

  RAISE NOTICE 'Backfill complete. Total rows updated: %', total_updated;
END $$;
```

## Phase 3: CONTRACT (Remove old — deploy after all code uses new column)
```sql
-- CONTRACT-2026-XX-XX-remove-old-column.sql
-- Description: Remove old_column after all code migrated to new_column
-- BREAKING: Old code that references old_column will fail
-- Pre-requisite: All application code must use new_column

BEGIN;

ALTER TABLE schema_name.table_name
  DROP COLUMN IF EXISTS old_column_name;

COMMIT;
```

## Pre-Migration Checklist
- [ ] Backup created (`bash scripts/pre-deploy-backup.sh`)
- [ ] EXPAND SQL tested on staging
- [ ] BACKFILL SQL tested on staging with representative data volume
- [ ] CONTRACT SQL tested on staging after code deploy
- [ ] Rollback plan documented
- [ ] Team notified of migration window

## Rollback
If any phase fails:
- **EXPAND failed**: No action needed (additive change, safe to retry)
- **BACKFILL failed**: Re-run backfill (idempotent by design)
- **CONTRACT failed**: Restore from backup (`bash scripts/rollback-migration.sh`)
