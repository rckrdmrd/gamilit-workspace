# RLS Policies Migration Map: system_configuration

**Migration Date:** 2025-11-02
**Migrated By:** SA-DB-041 (RLS Migration Subagent)
**Source:** `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/system_configuration/rls-policies/`

## Summary

| Metric | Count |
|--------|-------|
| Total Policies | 4 |
| Tables with RLS | 2 |
| Files Migrated | 1 |
| Status | ✅ COMPLETED |

## Policies by Table

### 1. system_configuration.system_settings
**Status:** ✅ Migrated
**Total Policies:** 2 (ALL: 1, SELECT: 1)

| Policy Name | Type | Purpose |
|-------------|------|---------|
| `system_settings_all_admin` | ALL | Admins manage all system settings |
| `system_settings_select_all` | SELECT | Authenticated users see settings |

**Security Strategy:**
- Admins: Full management access to system settings
- Authenticated Users: Read-only access to settings

### 2. system_configuration.feature_flags
**Status:** ✅ Migrated
**Total Policies:** 2 (ALL: 1, SELECT: 1)

| Policy Name | Type | Purpose |
|-------------|------|---------|
| `feature_flags_all_admin` | ALL | Admins manage all feature flags |
| `feature_flags_select_all` | SELECT | Authenticated users check flags |

**Security Strategy:**
- Admins: Full management access to feature flags
- Authenticated Users: Read-only access to check flag status

## Migration Files

### Source → Destination

1. **Policies**
   - Source: `02-policies.sql`
   - Destination: `01-policies.sql`
   - Status: ✅ Copied
   - Lines: 70
   - Contains: 4 policies across 2 tables

## Implementation Details

### Function-Based Authorization Pattern
This schema uses function-based authorization for consistency with gamilit patterns:
```sql
gamilit.is_admin()
gamilit.is_super_admin()
gamilit.get_current_user_id()
```

### Functions Used

| Function | Purpose | Returns |
|----------|---------|---------|
| `gamilit.is_admin()` | Check if user is admin | BOOLEAN |
| `gamilit.is_super_admin()` | Check if user is super admin | BOOLEAN |
| `gamilit.get_current_user_id()` | Get current user UUID | UUID |

### Authentication Check Pattern
All authenticated user policies use:
```sql
gamilit.get_current_user_id() IS NOT NULL
```

## Security Strategy

### System Settings (2 policies)
| User Role | Visibility | Allowed Operations |
|-----------|------------|-------------------|
| Admin/Super Admin | All | Full CRUD (Create, Read, Update, Delete) |
| Authenticated Users | All | Read settings |
| Unauthenticated | None | No access |

### Feature Flags (2 policies)
| User Role | Visibility | Allowed Operations |
|-----------|------------|-------------------|
| Admin/Super Admin | All | Full CRUD |
| Authenticated Users | All | Read flag status |
| Unauthenticated | None | No access |

**Purpose of Feature Flags:**
Feature flags allow safe rollout of new features by:
- Enabling/disabling features without deployment
- Gradual rollout to users
- A/B testing capabilities
- Quick rollback if issues arise

## Validation Notes

### Tables Verified
- ✅ `system_configuration.system_settings` - EXISTS
- ✅ `system_configuration.feature_flags` - EXISTS

### SQL Syntax
- ✅ All DROP POLICY statements - Valid
- ✅ All CREATE POLICY statements - Valid
- ✅ All COMMENT statements - Valid

### Functions Referenced
- ✅ `gamilit.is_admin()` - Must be defined in gamilit schema
- ✅ `gamilit.is_super_admin()` - Must be defined in gamilit schema
- ✅ `gamilit.get_current_user_id()` - Must be defined in gamilit schema

**Note:** These functions should be verified to exist in the gamilit schema before deployment.

## Deployment Checklist

- [x] Files copied to destination
- [x] Directory structure created
- [x] SQL syntax validated
- [x] Table references verified
- [x] Policy documentation complete
- [ ] Verify gamilit functions exist
- [ ] Execute in target database (manual step)

## Execution Order

When deploying, RLS must be enabled on tables first (separate step). Then execute:
1. `01-policies.sql` - Create all 4 policies

## Pre-Deployment Verification

Before deployment, verify these gamilit functions exist:
```sql
-- Check function existence
SELECT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'is_admin' AND pronamespace = 'gamilit'::regnamespace
);

SELECT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'is_super_admin' AND pronamespace = 'gamilit'::regnamespace
);

SELECT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'get_current_user_id' AND pronamespace = 'gamilit'::regnamespace
);
```

## Configuration Considerations

### System Settings Table
Store global configuration that applies to entire platform:
- Platform name/version
- Maintenance mode status
- Default timeout values
- Rate limiting settings
- Email service configuration
- Storage limits

### Feature Flags Table
Enable/disable features without redeployment:
- New UI components
- API endpoints
- Advanced features
- Experimental features
- Beta features

## Related Documentation

- System configuration design: `schemas/system_configuration/tables/`
- Gamilit functions: See `gamilit/functions/`
- Configuration management: `system_configuration/tables/_MAP.md`

---

**Migration Status: COMPLETE** ✅
**Next Step:** Verify gamilit functions, then deploy to target database
