/**
 * Teacher Hooks - Central export point
 */

// Page setup (Phase 3B standardization)
export { useTeacherPageSetup } from './useTeacherPageSetup';

// New hooks (FE-052 Quick Wins + CICLO 9)
export { useTeacherDashboard, dashboardKeys } from './useTeacherDashboard';
export { useAnalytics, useStudentInsights } from './useAnalytics';
export { useClassrooms, classroomKeys } from './useClassrooms';
export { useClassroomsStats } from './useClassroomsStats'; // TEACHER-003
export { useAssignments } from './useAssignments';
export { useInterventionAlerts } from './useInterventionAlerts';
export { useStudentBlocking, BlockType } from './useStudentBlocking'; // US-PM-006
export { useAlertConfig, AlertConfigType } from './useAlertConfig'; // US-PM-007
export { useTeacherMessages } from './useTeacherMessages';
export { useGrantBonus } from './useGrantBonus';
export { useEconomyAnalytics } from './useEconomyAnalytics'; // GAP-ST-005
export { useStudentsEconomy } from './useStudentsEconomy'; // GAP-ST-006
export { useAchievementsStats } from './useAchievementsStats'; // GAP-ST-007
export { useScheduledReports, scheduledReportKeys } from './useScheduledReports'; // Scheduled Reports
export { useSharedReports, sharedReportsKeys } from './useSharedReports'; // Shared Reports between teachers
export { useSharedResources } from './useSharedResources'; // Resource Sharing (ResourceSharingPanel)

// Legacy hooks (kept for backward compatibility)
export { useClassroomData } from './useClassroomData';
export { useStudentMonitoring } from './useStudentMonitoring';

// Types
export type { UseTeacherDashboardReturn } from './useTeacherDashboard';
export type { UseAnalyticsReturn, UseStudentInsightsReturn, StudentInsights } from './useAnalytics';
export type { UseClassroomsReturn } from './useClassrooms';
export type {
  UseClassroomsStatsReturn,
  ClassroomStats,
  AggregateStats,
} from './useClassroomsStats'; // TEACHER-003
export type { UseAssignmentsReturn } from './useAssignments';
export type { UseInterventionAlertsReturn, AlertFilters } from './useInterventionAlerts';
export type {
  UseStudentBlockingReturn,
  BlockStudentDto,
  StudentPermissionsResponse,
} from './useStudentBlocking'; // US-PM-006
export type {
  UseAlertConfigReturn,
  AlertConfigResponse,
  AlertConfigDefaults,
  CreateAlertConfigDto,
  UpdateAlertConfigDto,
} from './useAlertConfig'; // US-PM-007
export type { UseTeacherMessagesReturn, MessageFilters } from './useTeacherMessages';
export type { UseGrantBonusReturn } from './useGrantBonus';
export type { UseScheduledReportsReturn } from './useScheduledReports'; // Scheduled Reports
export type { UseSharedReportsReturn } from './useSharedReports'; // Shared Reports between teachers
export type { UseSharedResourcesReturn, ResourceFilters } from './useSharedResources'; // Resource Sharing

// P2-01: Real-time classroom monitoring (2025-12-18)
export { useClassroomRealtime } from './useClassroomRealtime';
export type {
  UseClassroomRealtimeReturn,
  StudentActivity,
  ClassroomUpdate,
  NewSubmission,
  AlertTriggered,
  StudentOnlineStatus,
  ProgressUpdate,
  RealtimeEvent,
} from './useClassroomRealtime';
