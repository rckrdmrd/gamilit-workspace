/**
 * Admin Controllers Index
 *
 * Centralized export for all admin-related controllers.
 * This file provides a single import point for the admin module.
 */

// Dashboard Controllers
export { AdminDashboardStatsController } from './admin-dashboard-stats.controller';
export { AdminDashboardActivityController } from './admin-dashboard-activity.controller';
export { AdminDashboardController } from './admin-dashboard.controller';

// User Stats Controllers
export { AdminUserStatsController } from './admin-user-stats.controller';

// Gamification Controllers
export { AdminGamificationConfigController } from './admin-gamification-config.controller';

// Other Admin Controllers
export { AdminAlertsController } from './admin-alerts.controller';
export { AdminAnalyticsController } from './admin-analytics.controller';
export { AdminAssignmentsController } from './admin-assignments.controller';
export { AdminBulkOperationsController } from './admin-bulk-operations.controller';
export { AdminContentController } from './admin-content.controller';
export { AdminInterventionsController } from './admin-interventions.controller';
export { AdminLogsController } from './admin-logs.controller';
export { AdminMonitoringController } from './admin-monitoring.controller';
export { AdminOrganizationsController } from './admin-organizations.controller';
export { AdminProgressController } from './admin-progress.controller';
export { AdminReportsController } from './admin-reports.controller';
export { AdminRolesController } from './admin-roles.controller';
export { AdminSystemController } from './admin-system.controller';
export { AdminUsersController } from './admin-users.controller';

// Classroom Controllers
export { ClassroomAssignmentsController } from './classroom-assignments.controller';
export { ClassroomTeachersRestController } from './classroom-teachers-rest.controller';

// Feature Flags Controller
export { FeatureFlagsController } from './feature-flags.controller';
