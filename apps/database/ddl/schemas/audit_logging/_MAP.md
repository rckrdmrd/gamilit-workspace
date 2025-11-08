# Audit Logging Schema - Table Map

## Overview
The `audit_logging` schema handles all audit, logging, and monitoring operations including audit logs, performance metrics, system alerts, system logs, and user activity tracking.

**Total Tables: 6**

## Tables

| # | Filename | Table Name | Description | Status |
|---|----------|-----------|-------------|--------|
| 1 | `01-audit_logs.sql` | `audit_logs` | Main audit log for system events and changes | Active |
| 2 | `02-performance_metrics.sql` | `performance_metrics` | Performance metrics and monitoring data | Active |
| 3 | `03-system_alerts.sql` | `system_alerts` | System alerts and notifications | Active |
| 4 | `04-system_logs.sql` | `system_logs` | System-wide application logs for admin monitoring | Active |
| 5 | `05-user_activity_logs.sql` | `user_activity_logs` | Legacy user activity logs table | Active |
| 6 | `06-user_activity.sql` | `user_activity` | User activity log for admin monitoring | New |

## Implementation Notes

### New Tables (Latest)
- **user_activity**: Simplified user activity logging with support for IP addresses and user agents

### Schema Purpose
This schema provides comprehensive audit and logging capabilities for:
- Event tracking and audit trails
- Performance monitoring
- System health alerts
- Application-level logging
- User activity monitoring

### Indexes
All tables include appropriate indexes for:
- User references
- Timestamp searches (optimized for recent data queries)
- Activity type filtering
- Log level filtering
- Status/priority filtering
- JSONB metadata searches (GIN indexes where applicable)
- Error-specific queries (WHERE conditions for errors)

### Cleanup Functions
- `cleanup_old_user_activity()`: Removes user activity logs older than specified days
- `cleanup_old_system_logs()`: Removes old system logs while preserving errors and warnings

## Last Updated
2025-11-02 - Added user_activity table
