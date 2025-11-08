# Social Features Functions Map

## Overview
This directory contains SQL functions for the social_features schema related to notifications and user interactions.

## Files

### cleanup_old_notifications.sql
- **Function**: `social_features.cleanup_old_notifications(p_days_to_keep INTEGER DEFAULT 30)`
- **Description**: Limpia notificaciones leídas más antiguas que el período especificado
- **Parameters**:
  - `p_days_to_keep INTEGER` - Number of days to keep notifications (default: 30)
- **Returns**: TABLE with columns:
  - `deleted_count INTEGER` - Number of notifications deleted
  - `oldest_kept_date TIMESTAMPTZ` - Cutoff date for deletion
- **Source**: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/social_features/functions/01-cleanup_old_notifications.sql`
- **Dependencies**: social_features.notifications table
- **Behavior**: Deletes notifications where created_at < cutoff_date AND is_read = true
- **Permissions**: Executed by `authenticated` role

## Migration Summary
- **Date Migrated**: 2025-11-02
- **Source Base**: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/`
- **Destination Base**: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/`
- **Total Functions**: 1
- **Status**: COMPLETED
