/**
 * Teacher Hooks - Central export point
 */

// New hooks (FE-052 Quick Wins + CICLO 9)
export { useTeacherDashboard } from './useTeacherDashboard';
export { useStudentProgress } from './useStudentProgress';
export { useAnalytics, useStudentInsights } from './useAnalytics';
export { useGrading } from './useGrading';
export { useClassrooms } from './useClassrooms';
export { useClassroomsStats } from './useClassroomsStats'; // TEACHER-003
export { useAssignments } from './useAssignments';
export { useInterventionAlerts } from './useInterventionAlerts';
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
export type { UseTeacherMessagesReturn, MessageFilters } from './useTeacherMessages';
export type { UseGrantBonusReturn } from './useGrantBonus';
