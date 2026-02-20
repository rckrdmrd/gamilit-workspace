/**
 * Admin API - Backward Compatibility Barrel
 *
 * Original monolith (1818 lines, 77 functions) has been split into
 * modular sub-API files under ./admin/ directory.
 *
 * This file re-exports everything for backward compatibility so that
 * existing imports like:
 *   import { getUsers } from '@/services/api/adminAPI'
 *   import { adminAPI } from '@/services/api/adminAPI'
 *   import * as adminAPI from '@/services/api/adminAPI'
 * continue to work without changes.
 *
 * Sub-API files:
 *   - admin/dashboardApi.ts
 *   - admin/organizationsApi.ts
 *   - admin/contentApi.ts
 *   - admin/usersApi.ts
 *   - admin/rolesApi.ts
 *   - admin/gamificationApi.ts
 *   - admin/monitoringApi.ts
 *   - admin/settingsApi.ts
 *   - admin/reportsApi.ts
 *   - admin/alertsApi.ts
 *   - admin/analyticsApi.ts
 *   - admin/progressApi.ts
 */

// Re-export all individual functions and namespace objects
export * from './admin';

// Import everything needed to reconstruct the adminAPI namespace object
import {
  // Dashboard
  getAdminDashboard,
  getRecentActions,
  getAlerts,
  getUserActivity,
  getMayaRanks,
  // Organizations
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationStats,
  getOrganizationUsers,
  updateOrganizationSubscription,
  updateOrganizationFeatures,
  // Content
  getPendingContent,
  approveContent,
  rejectContent,
  getMediaLibrary,
  deleteMediaFile,
  getApprovalHistory,
  // Users
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  suspendUser,
  unsuspendUser,
  // Roles
  getRoles,
  getRolePermissions,
  updateRolePermissions,
  getAvailablePermissions,
  // Gamification
  getGamificationSettings,
  updateGamificationSettings,
  previewGamificationChanges,
  restoreGamificationDefaults,
  // Monitoring
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
  // Settings
  getSystemConfig,
  updateSystemConfig,
  getConfigCategories,
  getCategoryConfig,
  updateCategoryConfig,
  validateConfig,
  // Reports
  generateReport,
  getReports,
  downloadReport,
  deleteReport,
  scheduleReport,
  // Alerts
  listAlerts,
  getAlertById,
  getAlertsStats,
  createAlert,
  acknowledgeAlert,
  resolveAlert,
  suppressAlert,
  // Analytics
  getAnalyticsOverview,
  getEngagementAnalytics,
  getGamificationAnalytics,
  getActivityTimeline,
  getTopUsers,
  getRetentionAnalytics,
  exportAnalyticsCSV,
  // Progress
  getProgressOverview,
  getClassroomProgress,
  getStudentProgress,
  getModuleProgress,
  getExerciseStats,
  exportProgressCSV,
  getAllClassrooms,
} from './admin';

/**
 * Admin API service object
 * Organizes all admin API functions by module
 *
 * Preserved for backward compatibility — consumers use patterns like:
 *   adminAPI.users.list(filters)
 *   adminAPI.monitoring.getHealth()
 */
export const adminAPI = {
  // Dashboard
  getDashboard: getAdminDashboard,
  getRecentActions,
  getAlerts,
  getUserActivity,

  // Organizations
  organizations: {
    list: getOrganizations,
    get: getOrganization,
    create: createOrganization,
    update: updateOrganization,
    delete: deleteOrganization,
    getStats: getOrganizationStats,
    getUsers: getOrganizationUsers,
    updateSubscription: updateOrganizationSubscription,
    updateFeatures: updateOrganizationFeatures,
  },

  // Content & Approvals
  content: {
    getPending: getPendingContent,
    approve: approveContent,
    reject: rejectContent,
    getMediaLibrary,
    deleteMedia: deleteMediaFile,
    getApprovalHistory,
  },

  // Users
  users: {
    list: getUsers,
    get: getUser,
    update: updateUser,
    delete: deleteUser,
    activate: activateUser,
    deactivate: deactivateUser,
    suspend: suspendUser,
    unsuspend: unsuspendUser,
  },

  // Roles
  roles: {
    list: getRoles,
    getPermissions: getRolePermissions,
    updatePermissions: updateRolePermissions,
    getAvailablePermissions,
  },

  // Gamification
  gamification: {
    getSettings: getGamificationSettings,
    updateSettings: updateGamificationSettings,
    previewChanges: previewGamificationChanges,
    restoreDefaults: restoreGamificationDefaults,
    getMayaRanks,
  },

  // Monitoring
  monitoring: {
    getHealth: getSystemHealth,
    getMetrics: getSystemMetrics,
    getLogs: getSystemLogs,
    getAuditLogs: getAuditLogs,
    toggleMaintenance: toggleMaintenanceMode,
    // Extended monitoring endpoints
    getExtendedMetrics,
    getMetricsHistory,
    getErrorStats,
    getRecentErrors,
    getErrorTrends,
  },

  // Settings
  settings: {
    getConfig: getSystemConfig,
    updateConfig: updateSystemConfig,
    getCategories: getConfigCategories,
    getCategoryConfig,
    updateCategoryConfig,
    validateConfig,
  },

  // Reports
  reports: {
    generate: generateReport,
    list: getReports,
    download: downloadReport,
    delete: deleteReport,
    schedule: scheduleReport,
  },

  // Alerts
  alerts: {
    list: listAlerts,
    getById: getAlertById,
    getStats: getAlertsStats,
    create: createAlert,
    acknowledge: acknowledgeAlert,
    resolve: resolveAlert,
    suppress: suppressAlert,
  },

  // Analytics
  analytics: {
    getOverview: getAnalyticsOverview,
    getEngagement: getEngagementAnalytics,
    getGamification: getGamificationAnalytics,
    getActivityTimeline,
    getTopUsers,
    getRetention: getRetentionAnalytics,
    exportCSV: exportAnalyticsCSV,
  },

  // Progress
  progress: {
    getOverview: getProgressOverview,
    getClassroomProgress,
    getStudentProgress,
    getModuleProgress,
    getExerciseStats,
    exportCSV: exportProgressCSV,
  },

  // Classrooms (for admin progress page)
  classrooms: {
    getAll: getAllClassrooms,
  },
};

export default adminAPI;
