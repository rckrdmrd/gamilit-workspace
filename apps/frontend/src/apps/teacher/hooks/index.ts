/**
 * Teacher Hooks - Central export point
 */

// New hooks (FE-052 Quick Wins + CICLO 9)
export { useTeacherDashboard, dashboardKeys } from './useTeacherDashboard';
export { useStudentProgress } from './useStudentProgress';
export { useAnalytics, useStudentInsights } from './useAnalytics';
export { useGrading } from './useGrading';
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

// Legacy hooks (kept for backward compatibility)
export { useClassroomData } from './useClassroomData';
export { useStudentMonitoring } from './useStudentMonitoring';

// Types
export type { UseTeacherDashboardReturn } from './useTeacherDashboard';
export type { UseStudentProgressReturn } from './useStudentProgress';
export type { UseAnalyticsReturn, UseStudentInsightsReturn, StudentInsights } from './useAnalytics';
export type { UseGradingReturn } from './useGrading';
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

// P1-06/P1-07: Mission and Mastery tracking hooks (2025-12-18)
export { useMissionStats, useMissionStatsMultiple } from './useMissionStats';
export { useMasteryTracking } from './useMasteryTracking';
export type { UseMissionStatsReturn, MissionStats, ClassroomMission } from './useMissionStats';
export type { UseMasteryTrackingReturn, MasteryData, SkillMastery } from './useMasteryTracking';

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
