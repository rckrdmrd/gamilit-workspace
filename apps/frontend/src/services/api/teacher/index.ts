/**
 * Teacher API Services
 *
 * Central export point for all teacher-related API services.
 *
 * @module services/api/teacher
 */

// ============================================================================
// API SERVICES
// ============================================================================

export { teacherApi, TeacherDashboardAPI } from './teacherApi';
export { studentProgressApi, StudentProgressAPI } from './studentProgressApi';
export { analyticsApi, AnalyticsAPI } from './analyticsApi';
export { gradingApi, GradingAPI } from './gradingApi';
export { classroomsApi, ClassroomsAPI } from './classroomsApi';
export { assignmentsApi, AssignmentsAPI } from './assignmentsApi';
export { interventionAlertsApi } from './interventionAlertsApi';
export { teacherMessagesApi } from './teacherMessagesApi';
export { teacherContentApi } from './teacherContentApi';
export { bonusCoinsApi, BonusCoinsAPI } from './bonusCoinsApi';
export { exerciseResponsesApi } from './exerciseResponsesApi';
export type { ExerciseResponsesAPI } from './exerciseResponsesApi';
export { reportsApi } from './reportsApi'; // P1-003: Teacher Reports services

// Re-export shared profile API for consistency (ISS-FE-002)
export { profileAPI } from '../profileAPI';
export type { UpdateProfileDto, UpdatePreferencesDto, UpdatePasswordDto } from '../profileAPI';

// ============================================================================
// TYPES
// ============================================================================

// Teacher API types
export type { Activity } from './teacherApi';

// Student Progress types
export type {
  GetStudentProgressQueryDto,
  StudentProgress,
  StudentOverview,
  StudentStats,
  StudentNote,
  AddTeacherNoteDto,
} from './studentProgressApi';

// Analytics types
export type {
  GetAnalyticsQueryDto,
  GetEngagementMetricsDto,
  GenerateReportsDto,
  Report,
  StudentInsights,
} from './analyticsApi';

// Grading types
export type {
  GetSubmissionsQueryDto,
  SubmitFeedbackDto,
  BulkGradeDto,
  SubmissionDetail,
  PaginatedSubmissionsResponse,
} from './gradingApi';

// Classrooms types
export type {
  GetClassroomsQueryDto,
  GetClassroomStudentsQueryDto,
  ClassroomProgressData,
  ModuleProgressItem,
  ClassroomProgressResponse,
} from './classroomsApi';

// Assignments types
export type {
  CreateAssignmentDto,
  UpdateAssignmentDto,
  GradeSubmissionDto,
  GetAssignmentsQueryDto,
  GetSubmissionsQueryDto as GetAssignmentSubmissionsQueryDto,
} from './assignmentsApi';

// Intervention Alerts types
export type {
  StudentInterventionAlert,
  InterventionAlertsListResponse,
  GetAlertsParams,
  ResolveAlertData,
  InterventionAlertType,
  InterventionAlertSeverity,
  InterventionAlertStatus,
  // Deprecated aliases (remove after 2025-12-08)
  Alert,
  AlertsListResponse,
  AlertType,
  AlertSeverity,
  AlertStatus,
} from './interventionAlertsApi';

// Teacher Messages types
export type {
  Message,
  MessagesListResponse,
  GetMessagesParams,
  SendMessageData,
  SendAnnouncementData,
  SendFeedbackData,
  Conversation,
  MessageType,
  MessageRecipient,
  UnreadCountResponse,
  SuccessResponse,
} from './teacherMessagesApi';

// Teacher Content types
export type {
  TeacherContent,
  ContentListResponse,
  GetContentParams,
  CreateContentData,
  UpdateContentData,
  CloneContentData,
  TeacherContentType,
  TeacherContentStatus,
  TeacherContentVisibility,
} from './teacherContentApi';

// Bonus Coins types
export type { GrantBonusRequest, GrantBonusResponse } from './bonusCoinsApi';

// Exercise Responses types
export type {
  GetAttemptsQuery,
  AttemptResponse,
  AttemptDetailResponse,
  AttemptsListResponse,
} from './exerciseResponsesApi';

// Reports types (P1-003)
export type {
  ReportFormat,
  ReportType,
  GenerateReportDto,
  ReportMetadata,
  TeacherReport,
  ReportStats,
} from './reportsApi';
