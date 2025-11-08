# Auth Functions Map

## Overview
This directory contains SQL functions for the auth schema.

## Files

### get_current_user_id.sql
- **Function**: `gamilit.get_current_user_id()`
- **Description**: Retorna el ID del usuario actual de la sesión
- **Parameters**: None
- **Returns**: `uuid` - Current user ID from session variable
- **Source**: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamilit/functions/02-get_current_user_id.sql`
- **Behavior**: Reads the session variable `app.current_user_id` set by the application via SET SESSION
- **Error Handling**: Returns NULL if not set or on error

## Migration Summary
- **Date Migrated**: 2025-11-02
- **Source Base**: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/`
- **Destination Base**: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/`
- **Total Functions**: 1
- **Status**: COMPLETED
