/**
 * Admin API - Barrel Export
 *
 * Re-exports all admin sub-API modules for convenient imports.
 * Sub-APIs split from the original adminAPI.ts monolith (1818 lines, 77 functions)
 * into modular domain-specific files.
 *
 * Existing files in this directory (not part of this split):
 * - achievementsApi.ts
 * - classroomTeacherApi.ts
 * - gamificationConfigApi.ts
 * - ltiAPI.ts
 */

// ============================================================================
// DASHBOARD
// ============================================================================
export {
  getAdminDashboard,
  getRecentActions,
  getAlerts,
  getUserActivity,
  getMayaRanks,
  dashboardApi,
} from './dashboardApi';

// ============================================================================
// ORGANIZATIONS
// ============================================================================
export {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationUsers,
  updateOrganizationSubscription,
  updateOrganizationFeatures,
  getOrganizationStats,
  organizationsApi,
} from './organizationsApi';
export type { OrganizationStats } from './organizationsApi';

// ============================================================================
// CONTENT & APPROVALS
// ============================================================================
export {
  getPendingContent,
  approveContent,
  rejectContent,
  getMediaLibrary,
  deleteMediaFile,
  getApprovalHistory,
  contentApi,
} from './contentApi';

// ============================================================================
// USERS
// ============================================================================
export {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  suspendUser,
  unsuspendUser,
  usersApi,
} from './usersApi';

// ============================================================================
// ROLES & PERMISSIONS
// ============================================================================
export {
  getRoles,
  getRolePermissions,
  updateRolePermissions,
  getAvailablePermissions,
  rolesApi,
} from './rolesApi';

// ============================================================================
// GAMIFICATION
// ============================================================================
export {
  getGamificationSettings,
  updateGamificationSettings,
  previewGamificationChanges,
  restoreGamificationDefaults,
  gamificationApi,
} from './gamificationApi';

// ============================================================================
// MONITORING
// ============================================================================
export {
  getSystemHealth,
  getSystemMetrics,
  getSystemLogs,
  getAuditLogs,
  toggleMaintenanceMode,
  getExtendedMetrics,
  getMetricsHistory,
  getErrorStats,
  getRecentErrors,
  getErrorTrends,
  monitoringApi,
} from './monitoringApi';

// ============================================================================
// SETTINGS
// ============================================================================
export {
  getSystemConfig,
  updateSystemConfig,
  getConfigCategories,
  getCategoryConfig,
  updateCategoryConfig,
  validateConfig,
  settingsApi,
} from './settingsApi';

// ============================================================================
// REPORTS
// ============================================================================
export {
  generateReport,
  getReports,
  downloadReport,
  deleteReport,
  scheduleReport,
  reportsApi,
} from './reportsApi';

// ============================================================================
// ALERTS
// ============================================================================
export {
  listAlerts,
  getAlertById,
  getAlertsStats,
  createAlert,
  acknowledgeAlert,
  resolveAlert,
  suppressAlert,
  alertsApi,
} from './alertsApi';

// ============================================================================
// ANALYTICS
// ============================================================================
export {
  getAnalyticsOverview,
  getEngagementAnalytics,
  getGamificationAnalytics,
  getActivityTimeline,
  getTopUsers,
  getRetentionAnalytics,
  exportAnalyticsCSV,
  analyticsApi,
} from './analyticsApi';

// ============================================================================
// PROGRESS
// ============================================================================
export {
  getProgressOverview,
  getClassroomProgress,
  getStudentProgress,
  getModuleProgress,
  getExerciseStats,
  exportProgressCSV,
  getAllClassrooms,
  progressApi,
} from './progressApi';
