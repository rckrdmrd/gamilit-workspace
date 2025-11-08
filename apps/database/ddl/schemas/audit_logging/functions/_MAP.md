# Audit Logging Functions Map

## Overview
This directory contains SQL functions for the audit_logging schema.

## Files

### log_audit_event.sql
- **Function**: `audit_logging.log_audit_event()`
- **Description**: Registra eventos de auditoría en system_logs
- **Priority**: CRITICAL - Compliance requirement
- **Parameters**:
  - `p_user_id uuid` - User ID performing the action
  - `p_action text` - Action being logged
  - `p_table_name text` - Table name affected
  - `p_record_id uuid` (optional) - Record ID affected
  - `p_old_data jsonb` (optional) - Previous data state
  - `p_new_data jsonb` (optional) - New data state
  - `p_ip_address inet` (optional) - IP address of user
  - `p_user_agent text` (optional) - Browser/client user agent
- **Returns**: `uuid` - Log ID
- **Source**: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/audit_logging/functions/01-log_audit_event.sql`
- **Permissions**: Executed by `gamilit_user` role

## Migration Summary
- **Date Migrated**: 2025-11-02
- **Source Base**: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/`
- **Destination Base**: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/`
- **Total Functions**: 1
- **Status**: COMPLETED
