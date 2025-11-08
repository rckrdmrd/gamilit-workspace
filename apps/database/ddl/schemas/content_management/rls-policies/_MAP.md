# RLS Policies Migration Map: content_management

**Migration Date:** 2025-11-02
**Migrated By:** SA-DB-041 (RLS Migration Subagent)
**Source:** `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/content_management/rls-policies/`

## Summary

| Metric | Count |
|--------|-------|
| Total Policies | 8 |
| Tables with RLS | 3 |
| Files Migrated | 1 |
| Status | ✅ COMPLETED |

## Policies by Table

### 1. content_management.marie_curie_content
**Status:** ✅ Migrated
**Total Policies:** 2 (ALL: 1, SELECT: 1)

| Policy Name | Type | Purpose |
|-------------|------|---------|
| `marie_content_all_admin` | ALL | Admins manage all Marie Curie content |
| `marie_content_select_all` | SELECT | All users see published content |

**Security Strategy:**
- Admins: Full management access
- All Users: Can view published content

### 2. content_management.content_templates
**Status:** ✅ Migrated
**Total Policies:** 2 (ALL: 1, SELECT: 1)

| Policy Name | Type | Purpose |
|-------------|------|---------|
| `content_templates_all_admin` | ALL | Admins manage all templates |
| `content_templates_select_all` | SELECT | Authenticated users see templates |

**Security Strategy:**
- Admins: Full management access
- Authenticated Users: Can view available templates

### 3. content_management.media_files
**Status:** ✅ Migrated
**Total Policies:** 3 (ALL: 1, SELECT: 1, INSERT: 1)

| Policy Name | Type | Purpose |
|-------------|------|---------|
| `media_files_all_admin` | ALL | Admins manage all media files |
| `media_files_select_all` | SELECT | Authenticated users see media |
| `media_files_insert_teacher` | INSERT | Teachers upload media files |

**Security Strategy:**
- Admins: Full management access
- Teachers: Can upload media files
- Authenticated Users: Can view media files

## Migration Files

### Source → Destination

1. **Policies**
   - Source: `02-policies.sql`
   - Destination: `01-policies.sql`
   - Status: ✅ Copied
   - Lines: 119
   - Contains: 8 policies across 3 tables

## Implementation Details

### Function-Based Authorization Pattern
This schema uses function-based authorization instead of direct column comparisons:
```sql
gamilit.is_admin()
gamilit.is_super_admin()
gamilit.get_current_user_id()
gamilit.get_current_user_role()
```

### Functions Used

| Function | Purpose | Returns |
|----------|---------|---------|
| `gamilit.is_admin()` | Check if user is admin | BOOLEAN |
| `gamilit.is_super_admin()` | Check if user is super admin | BOOLEAN |
| `gamilit.get_current_user_id()` | Get current user UUID | UUID |
| `gamilit.get_current_user_role()` | Get current user role | gamilit_role |

### Authentication Check Pattern
All authenticated user policies use:
```sql
gamilit.get_current_user_id() IS NOT NULL
```

### Role Enumeration
The `gamilit_role` enum includes:
- `admin_teacher` - Teacher role (used in INSERT check)
- Other roles as defined in gamilit schema

## Security Strategy

### Marie Curie Content (2 policies)
| User Role | Visibility | Allowed Operations |
|-----------|------------|-------------------|
| Admin | All | Full CRUD (Create, Read, Update, Delete) |
| All Users | Published only | Read published content |
| Unauthenticated | Published | Read published via public role |

### Content Templates (2 policies)
| User Role | Visibility | Allowed Operations |
|-----------|------------|-------------------|
| Admin/Super Admin | All | Full CRUD |
| Authenticated Users | All | Read available templates |
| Unauthenticated | None | No access |

### Media Files (3 policies)
| User Role | Visibility | Allowed Operations |
|-----------|------------|-------------------|
| Admin/Super Admin | All | Full CRUD |
| Teachers | All (read), Own (upload) | Read files, Upload new files |
| Authenticated Users | All | Read files |
| Unauthenticated | None | No access |

## Validation Notes

### Tables Verified
- ✅ `content_management.marie_curie_content` - EXISTS
- ✅ `content_management.content_templates` - EXISTS
- ✅ `content_management.media_files` - EXISTS

### SQL Syntax
- ✅ All DROP POLICY statements - Valid
- ✅ All CREATE POLICY statements - Valid
- ✅ All COMMENT statements - Valid

### Functions Referenced
- ✅ `gamilit.is_admin()` - Must be defined in gamilit schema
- ✅ `gamilit.is_super_admin()` - Must be defined in gamilit schema
- ✅ `gamilit.get_current_user_id()` - Must be defined in gamilit schema
- ✅ `gamilit.get_current_user_role()` - Must be defined in gamilit schema

**Note:** These functions should be verified to exist in the gamilit schema before deployment.

### Content Status Enum
- ✅ `content_status` type - Referenced for status filtering

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
1. `01-policies.sql` - Create all 8 policies

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

SELECT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'get_current_user_role' AND pronamespace = 'gamilit'::regnamespace
);
```

## Related Documentation

- Content management design: `schemas/content_management/tables/`
- Gamilit functions: See `gamilit/functions/`
- Publishing workflow: `content_management/tables/_MAP.md`

---

**Migration Status: COMPLETE** ✅
**Next Step:** Verify gamilit functions, then deploy to target database
