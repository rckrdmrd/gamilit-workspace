# Admin Dashboard Views Map

## Overview
This directory contains SQL views for the admin_dashboard schema, providing aggregated statistics and monitoring data for administrators.

## Files

### user_stats_summary.sql
- **View**: `admin_dashboard.user_stats_summary`
- **Description**: Aggregated user statistics for admin dashboard
- **Type**: Normal View
- **Columns**:
  - `total_users` - Total count of non-deleted users
  - `users_today` - Users created today
  - `users_this_week` - Users created in last 7 days
  - `users_this_month` - Users created in last 30 days
  - `active_users_today` - Users who signed in today
  - `active_users_week` - Users who signed in in last 7 days
  - `total_students` - Users with student role
  - `total_teachers` - Users with admin_teacher role
  - `total_admins` - Users with super_admin role
- **Source**: `/home/isem/workspace/projects/glit/database/migrations/008_admin_module_tables.sql` (lines 150-162)

### organization_stats_summary.sql
- **View**: `admin_dashboard.organization_stats_summary`
- **Description**: Aggregated organization statistics for admin dashboard
- **Type**: Normal View
- **Columns**:
  - `total_organizations` - Total count of tenants
  - `active_organizations` - Count of active organizations
  - `new_organizations_month` - New organizations created in last 30 days
- **Source**: `/home/isem/workspace/projects/glit/database/migrations/008_admin_module_tables.sql` (lines 164-170)

### moderation_queue.sql
- **View**: `admin_dashboard.moderation_queue`
- **Description**: Pending content moderation items prioritized for review
- **Type**: Normal View
- **Columns**:
  - `id` - Flagged content ID
  - `content_type` - Type of content (exercise, comment, profile, post, message)
  - `content_id` - ID of the flagged content
  - `content_preview` - Short preview of content
  - `reason` - Reason for flagging
  - `priority` - Priority level (high, medium, low)
  - `status` - Current status (always 'pending' in this view)
  - `created_at` - When the content was flagged
  - `reporter_email` - Email of the reporter
  - `reporter_name` - Full name of the reporter
- **Source**: `/home/isem/workspace/projects/glit/database/migrations/008_admin_module_tables.sql` (lines 172-195)
- **Ordering**: By priority (high=1, medium=2, low=3) then by creation date

### recent_admin_actions.sql
- **View**: `admin_dashboard.recent_admin_actions`
- **Description**: Recent admin actions from audit log
- **Type**: Normal View
- **Columns**:
  - `id` - Action ID
  - `action` - Action type
  - `resource_type` - Type of resource affected
  - `resource_id` - ID of the resource
  - `description` - Action description
  - `status` - Action status
  - `created_at` - When the action occurred
  - `admin_email` - Email of the admin who performed the action
  - `admin_name` - Full name of the admin
- **Source**: `/home/isem/workspace/projects/glit/database/migrations/008_admin_module_tables.sql` (lines 197-214)
- **Limit**: 100 most recent actions
- **Filter**: Only admin_action event types

## Migration Summary
- **Date Migrated**: 2025-11-02
- **Source**: `/home/isem/workspace/projects/glit/database/migrations/008_admin_module_tables.sql`
- **Destination Base**: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/`
- **Total Views**: 4
- **Status**: COMPLETED
- **Schema Created**: YES - admin_dashboard schema created as new

## Notes
- All views are marked as COMPLETED SPECIAL EXTRACTION from migration file
- Schema admin_dashboard was created during this migration
- Views provide read-only access for admin monitoring
