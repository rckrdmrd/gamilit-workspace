/**
 * Admin API DTOs and Types
 * Generated for FE-051
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// ============================================================================
// ORGANIZATIONS (INSTITUTIONS)
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  type: 'school' | 'university' | 'corporate' | 'individual';
  tier: 'free' | 'basic' | 'professional' | 'enterprise';
  users: number;
  status: 'active' | 'suspended' | 'inactive';
  features: string[];
  subscription?: {
    tier: string;
    startDate: string;
    endDate?: string;
    autoRenew: boolean;
  };
  contact?: {
    email: string;
    phone?: string;
    address?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationFilters extends PaginationParams {
  type?: 'school' | 'university' | 'corporate' | 'individual';
  tier?: 'free' | 'basic' | 'professional' | 'enterprise';
  status?: 'active' | 'suspended' | 'inactive';
  search?: string;
}

export interface OrganizationUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinDate: string;
}

// ============================================================================
// CONTENT & APPROVALS
// ============================================================================

export interface PendingContent {
  id: string;
  type: 'exercise' | 'media' | 'module' | 'assignment';
  title: string;
  author: string;
  authorId: string;
  authorEmail: string;
  module?: string;
  submittedAt: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected';
}

export interface ContentFilters extends PaginationParams {
  type?: 'exercise' | 'media' | 'module' | 'assignment';
  status?: 'pending' | 'approved' | 'rejected';
  priority?: 'low' | 'medium' | 'high';
}

export interface MediaFile {
  id: string;
  filename: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  size: number;
  uploaderId: string;
  uploaderName: string;
  uploadedAt: string;
}

export interface ApprovalHistory {
  id: string;
  contentId: string;
  contentType: string;
  action: 'approved' | 'rejected';
  reason?: string;
  approvedBy: string;
  approvedByName: string;
  approvedAt: string;
}

// ============================================================================
// DASHBOARD
// ============================================================================

export interface DashboardStats {
  users: {
    total: number;
    activeToday: number;
    newThisWeek: number;
    growth: number; // percentage
  };
  content: {
    exercises: number;
    modules: number;
    avgCompletion: number; // percentage
  };
  organizations: {
    total: number;
    active: number;
    suspended: number;
  };
}

export interface DashboardActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

export interface MonthlyGrowth {
  month: string;
  users: number;
  organizations: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: DashboardActivity[];
  growthData: MonthlyGrowth[];
}

// ============================================================================
// USERS
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin_teacher' | 'super_admin';
  status: 'active' | 'inactive' | 'suspended' | 'banned' | 'pending';
  organization?: string;
  organizationId?: string;
  joinDate: string;
  /**
   * Last login timestamp from backend (last_sign_in_at).
   * Backend returns Date type, but JSON serialization converts to ISO string.
   * Transformed via transformUser() function in adminAPI.ts.
   * @see UserDetailsDto.last_sign_in_at in backend
   * @see transformUser() in adminAPI.ts (CORR-003)
   */
  lastLogin?: string;
  metadata?: any;
}

export interface UserFilters extends PaginationParams {
  role?: 'student' | 'admin_teacher' | 'super_admin';
  status?: 'active' | 'inactive' | 'suspended' | 'banned' | 'pending';
  organizationId?: string;
  search?: string;
}

export interface UserDetails extends User {
  profile?: {
    avatar?: string;
    bio?: string;
    phone?: string;
  };
  stats?: {
    exercisesCompleted: number;
    modulesCompleted: number;
    mlCoins: number;
    rank: string;
  };
}

/**
 * Type aliases for better type safety and consistency
 */
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'banned' | 'pending';
export type SubscriptionTier = 'free' | 'basic' | 'professional' | 'enterprise';

// ============================================================================
// ROLES & PERMISSIONS
// ============================================================================

export interface Role {
  roleId: string;
  roleName: string;
  description: string;
  userCount: number;
  isSystem: boolean; // cannot be deleted
  createdAt?: string;
  updatedAt?: string;
}

export interface Permission {
  module:
    | 'users'
    | 'content'
    | 'gamification'
    | 'monitoring'
    | 'system'
    | 'organizations'
    | 'reports'
    | 'analytics'
    | 'admin'
    | 'roles';
  action: 'view' | 'create' | 'edit' | 'delete' | 'manage' | 'export';
  granted: boolean;
}

export interface RolePermissions {
  role: Role;
  permissions: Permission[];
}

export interface AvailablePermission {
  module: string;
  action: string;
  description: string;
}

// ============================================================================
// GAMIFICATION
// ============================================================================

/**
 * MayaRankConfig - Configuration for Maya rank in admin panel
 *
 * NOTA: Renombrado de MayaRank a MayaRankConfig (P2-001)
 * para evitar conflicto con enum MayaRank de @shared/constants/ranks.constants
 *
 * @see SSOT enum: @shared/constants/ranks.constants.ts
 */
export interface MayaRankConfig {
  id: string;
  name: string;
  level: number;
  minXP: number;
  maxXP: number;
  multiplierXp: number;
  multiplierMlCoins: number;
  bonusMlCoins: number;
  color: string;
  icon?: string;
  description: string;
  perks: string[];
  isActive: boolean;
  order: number;
  userCount?: number; // Frontend-only field
}

/**
 * AdminAchievement - Simplified achievement for admin dashboard
 *
 * Este es un tipo simplificado para uso en el dashboard de admin.
 * Para el tipo completo, usar Achievement de @shared/types/achievement.types
 *
 * @see SSOT: @shared/types/achievement.types.ts
 * P2-001: Renombrado de Achievement a AdminAchievement para evitar conflicto
 */
export interface AdminAchievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
  xpReward: number;
  mlCoinsReward: number;
  userCount?: number;
  isActive: boolean;
}

/** @deprecated Use AdminAchievement instead */
export type Achievement = AdminAchievement;

export interface EconomyConfig {
  mlCoinsPerExercise: number;
  mlCoinsPerAchievement: number;
  mlCoinsPerModule: number;
  shopEnabled: boolean;
  powerUpsEnabled: boolean;
}

export interface GamificationStats {
  totalXPEarned: number;
  totalAchievementsUnlocked: number;
  averageRank: string;
  mostActiveDay: string;
  totalMLCoinsCirculation: number;
  averageMLCoinsPerUser: number;
  dailyTransactions: number;
}

export interface GamificationSettings {
  ranks: MayaRankConfig[];
  achievements: AdminAchievement[];
  economy: EconomyConfig;
  stats: GamificationStats;
}

// ============================================================================
// MONITORING
// ============================================================================

/**
 * SystemHealth type aligned with backend SystemHealthDto
 * @see apps/backend/src/modules/admin/dto/system/system-health.dto.ts
 */
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime_seconds: number;
  timestamp: string;
  version: string;
  node_version: string;
  environment: string;
  database: {
    status: 'healthy' | 'degraded' | 'down';
    response_time_ms: number;
    pool_size?: number;
    active_connections?: number;
  };
  redis?: {
    status: 'healthy' | 'degraded' | 'down';
    response_time_ms: number;
    memory_usage_mb?: number;
  };
  memory: {
    used_mb: number;
    total_mb: number;
    usage_percent: number;
  };
  cpu: {
    usage_percent: number;
  };
}

/**
 * SystemMetrics - Aligned with backend SystemMetricsDto
 * @see apps/backend/src/modules/admin/dto/system/system-metrics.dto.ts
 */
export interface SystemMetrics {
  timestamp: string;
  total_users: number;
  active_users_24h: number;
  total_modules: number;
  total_exercises: number;
  total_organizations: number;
  exercises_completed_24h: number;
  avg_response_time_ms: number;
  requests_last_hour: number;
  error_rate_last_hour: number;
  db_queries_last_hour: number;
  cache_hit_rate?: number;
  top_errors?: Array<{ error: string; count: number }>;
}

export interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  context?: any;
  stackTrace?: string;
}

export interface LogFilters extends PaginationParams {
  level?: 'error' | 'warn' | 'info' | 'debug';
  date?: string;
  search?: string;
}

export interface MaintenanceMode {
  enabled: boolean;
  message?: string;
  startedAt?: string;
  startedBy?: string;
}

/**
 * Audit Log Entry
 * Represents authentication attempts and system actions
 * Aligned with backend AuditLogDto
 */
export interface AuditLogEntry {
  id: string;
  userId?: string | null;
  email: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  success: boolean;
  failureReason?: string | null;
  attemptedAt: string; // ISO date string
}

/**
 * Audit Log Query Filters
 * Aligned with backend AuditLogQueryDto
 */
export interface AuditLogFilters extends PaginationParams {
  userId?: string;
  email?: string;
  ipAddress?: string;
  success?: boolean;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
}

// ============================================================================
// SETTINGS
// ============================================================================

export type SettingsCategory =
  | 'general'
  | 'email'
  | 'notifications'
  | 'security'
  | 'maintenance'
  | 'analytics'
  | 'integrations';

export interface GeneralSettings {
  platformName: string;
  platformUrl: string;
  platformLogo?: string;
  defaultLanguage: 'es' | 'en' | 'fr';
  timezone: string;
}

export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword?: string; // never returned from API
  smtpFrom: string;
  smtpFromName: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
}

export interface SecuritySettings {
  sessionDuration: number; // hours
  require2FA: boolean;
  passwordMinLength: number;
  passwordRequireSpecialChars: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireUppercase: boolean;
  loginAttempts: number;
  lockoutDuration: number; // minutes
}

export interface MaintenanceSettings {
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  lastBackup?: string;
  cacheEnabled: boolean;
  cacheTTL: number; // seconds
}

export interface SystemConfig {
  general?: GeneralSettings;
  email?: EmailSettings;
  notifications?: NotificationSettings;
  security?: SecuritySettings;
  maintenance?: MaintenanceSettings;
  [key: string]: any;
}

// ============================================================================
// REPORTS
// ============================================================================

/**
 * Report types - must match backend ReportType enum
 */
export type ReportType =
  | 'users'
  | 'progress'
  | 'gamification'
  | 'system'
  | 'student_insights'
  | 'classroom_summary'
  | 'risk_analysis';

/**
 * Report formats - must match backend ReportFormat enum
 */
export type ReportFormat = 'pdf' | 'csv' | 'excel';

/**
 * Report status - must match backend ReportStatus enum
 */
export type ReportStatus = 'pending' | 'generating' | 'completed' | 'failed';

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  organizationId?: string;
  classroomId?: string;
  studentIds?: string[];
  [key: string]: any;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  nextRun?: string;
}

/**
 * Report entity - matches backend ReportDto
 */
export interface Report {
  id: string;
  type: ReportType;
  format: ReportFormat;
  status: ReportStatus;
  file_url?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  completed_at?: string;
  requested_by: string;
}

/**
 * Generate report params - matches backend GenerateReportDto
 */
export interface GenerateReportParams {
  type: ReportType;
  format: ReportFormat;
  student_ids?: string[];
  classroom_id?: string;
  start_date?: string;
  end_date?: string;
  filters?: Record<string, unknown>;
}

/**
 * List reports query params - matches backend ListReportsDto
 */
export interface ReportListFilters {
  type?: ReportType;
  status?: ReportStatus;
  page?: number;
  limit?: number;
}

/**
 * Paginated reports response - matches backend PaginatedReportsDto
 */
export interface PaginatedReportsResponse {
  data: Report[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ============================================================================
// ALERTS
// ============================================================================

/**
 * System alert severity levels - must match backend AlertSeverity enum
 */
export type SystemAlertSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * System alert status - must match backend AlertStatus enum
 */
export type SystemAlertStatus = 'open' | 'acknowledged' | 'resolved' | 'suppressed';

/**
 * System alert types - must match backend AlertType enum
 */
export type SystemAlertType =
  | 'performance_degradation'
  | 'high_error_rate'
  | 'security_breach'
  | 'resource_limit'
  | 'service_outage'
  | 'data_anomaly';

/**
 * System alert filters - matches backend ListAlertsDto
 */
export interface AlertFilters extends PaginationParams {
  severity?: SystemAlertSeverity;
  status?: SystemAlertStatus;
  alert_type?: SystemAlertType;
  date_from?: string;
  date_to?: string;
}

/**
 * System alert entity - matches backend AlertResponseDto
 */
export interface SystemAlert {
  id: string;
  tenant_id?: string;
  alert_type: SystemAlertType;
  severity: SystemAlertSeverity;
  title: string;
  description?: string;
  source_system?: string;
  source_module?: string;
  error_code?: string;
  affected_users: number;
  status: SystemAlertStatus;
  acknowledgment_note?: string;
  resolution_note?: string;
  acknowledged_by?: string;
  acknowledged_by_name?: string;
  acknowledged_at?: string;
  resolved_by?: string;
  resolved_by_name?: string;
  resolved_at?: string;
  notification_sent: boolean;
  escalation_level: number;
  auto_resolve: boolean;
  suppress_similar: boolean;
  context_data?: Record<string, unknown>;
  metrics?: Record<string, unknown>;
  related_alerts?: string[];
  triggered_at: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// DEPRECATED ALIASES (for backwards compatibility - remove after 2025-12-08)
// ============================================================================

/** @deprecated Use SystemAlert instead */
export type Alert = SystemAlert;

/** @deprecated Use SystemAlertSeverity instead */
export type AlertSeverity = SystemAlertSeverity;

/** @deprecated Use SystemAlertStatus instead */
export type AlertStatus = SystemAlertStatus;

/** @deprecated Use SystemAlertType instead */
export type AlertType = SystemAlertType;

/**
 * Alert statistics - matches backend AlertsStatsDto
 */
export interface AlertsStats {
  total_alerts: number;
  open_alerts: number;
  acknowledged_alerts: number;
  resolved_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  medium_alerts: number;
  low_alerts: number;
  alerts_24h: number;
  alerts_7d: number;
  avg_resolution_time_hours: number;
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Analytics Overview - Main statistics
 */
export interface AnalyticsOverview {
  total_users: number;
  total_students: number;
  total_teachers: number;
  active_users: number;
  avg_xp: number;
  avg_exercises_completed: number;
  avg_engagement_score: number;
  inactive_users: number;
  beginner_users: number;
  intermediate_users: number;
  advanced_users: number;
}

/**
 * Engagement by Segment
 */
export interface EngagementBySegment {
  user_segment: string;
  users_count: number;
  avg_engagement_score: number;
  avg_exercises_completed: number;
  avg_streak: number;
  active_last_7d: number;
  active_last_30d: number;
}

/**
 * Engagement Analytics
 */
export interface EngagementAnalytics {
  by_segment: EngagementBySegment[];
}

/**
 * XP Distribution
 */
export interface XpDistribution {
  xp_range: string;
  users_count: number;
}

/**
 * Rank Distribution
 */
export interface RankDistribution {
  current_rank: string;
  users_count: number;
  avg_xp: number;
  avg_exercises: number;
}

/**
 * Level Distribution
 */
export interface LevelDistribution {
  current_level: number;
  users_count: number;
}

/**
 * Gamification Analytics
 */
export interface GamificationAnalytics {
  xp_distribution: XpDistribution[];
  ranks_distribution: RankDistribution[];
  levels_distribution: LevelDistribution[];
}

/**
 * Daily Activity
 */
export interface DailyActivity {
  activity_date: string;
  unique_users: number;
  total_activities: number;
  exercises_completed: number;
  modules_completed: number;
  logins: number;
}

/**
 * Activity Timeline
 */
export interface ActivityTimeline {
  timeline: DailyActivity[];
}

/**
 * Top User
 */
export interface TopUser {
  user_id: string;
  display_name: string;
  email: string;
  role: string;
  total_xp: number;
  exercises_completed: number;
  current_streak: number;
  current_rank: string;
  current_level: number;
  engagement_score: number;
}

/**
 * Top Users Response
 */
export interface TopUsers {
  metric: string;
  users: TopUser[];
}

/**
 * Cohort Retention
 */
export interface CohortRetention {
  cohort_month: string;
  cohort_size: number;
  retained_users: number;
  retention_rate: number;
}

/**
 * Retention Analytics
 */
export interface RetentionAnalytics {
  cohorts: CohortRetention[];
}

// ============================================================================
// MONITORING (EXTENDED)
// ============================================================================

/**
 * Extended System Metrics for real-time monitoring
 */
export interface ExtendedSystemMetrics {
  timestamp: string;
  memory: {
    total_mb: number;
    used_mb: number;
    free_mb: number;
    usage_percent: number;
    heap_used_mb: number;
    heap_total_mb: number;
  };
  cpu: {
    user_ms: number;
    system_ms: number;
    load_average: number[];
    cores: number;
  };
  system: {
    platform: string;
    arch: string;
    hostname: string;
    uptime_seconds: number;
    node_version: string;
  };
  process: {
    pid: number;
    uptime_seconds: number;
    active_handles: number;
    active_requests: number;
  };
}

/**
 * Error Statistics
 */
export interface ErrorStats {
  total_errors: number;
  days_with_errors: number;
  fatal_errors: number;
  error_level_errors: number;
  first_error_at: string | null;
  last_error_at: string | null;
  time_period_hours: number;
}

/**
 * Recent Error Entry
 */
export interface RecentError {
  id: string;
  log_level: string;
  message: string;
  context: Record<string, unknown> | null;
  source: string | null;
  timestamp: string;
  user_id: string | null;
  user_name: string | null;
}

/**
 * Error Trend Data Point
 */
export interface ErrorTrendDataPoint {
  time_bucket: string;
  error_count: number;
  fatal_count: number;
  error_count_level: number;
  unique_sources: number;
}

/**
 * Metrics History Data Point
 */
export interface MetricsHistoryDataPoint {
  timestamp: string;
  memory_usage_percent: number;
  cpu_load: number;
  heap_usage_mb: number;
}

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

/**
 * System-wide progress overview
 */
export interface ProgressOverview {
  total_users: number;
  active_users: number;
  total_submissions: number;
  correct_submissions: number;
  avg_score: number;
  completed_modules: number;
  in_progress_modules: number;
  avg_progress_percent: number;
  total_time_spent_hours: number;
}

/**
 * Student progress summary (used in classroom view)
 */
export interface StudentProgressSummary {
  user_id: string;
  display_name: string;
  email: string;
  level: number;
  total_xp: number;
  exercises_completed: number;
  modules_completed: number;
  streak_days: number;
  last_activity_at: string | null;
  avg_module_progress: number;
  modules_completed_count: number;
  total_submissions: number;
  correct_submissions: number;
  avg_score: number | null;

  // FE-002: Additional exercise fields
  skipped_exercises?: number;
  max_possible_score?: number;

  // FE-002: Additional gamification fields
  hints_used_total?: number;
  comodines_used_total?: number;

  // FE-002: Additional analytics fields
  performance_analytics?: Record<string, unknown>;
  learning_path?: any[];
}

/**
 * Classroom progress with students
 */
export interface ClassroomProgress {
  classroom_id: string;
  classroom_name: string;
  teacher_name: string;
  total_students: number;
  active_students: number;
  avg_class_progress_percent: number;
  students: StudentProgressSummary[];
}

/**
 * Module progress detail for a student
 */
export interface ModuleProgressDetail {
  id: string;
  module_id: string;
  module_title: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'reviewed' | 'mastered';
  progress_percentage: number;
  completed_exercises: number;
  total_exercises: number;
  average_score: number | null;
  total_xp_earned: number;
  time_spent_minutes: number;
  started_at: string | null;
  completed_at: string | null;
  last_accessed_at: string | null;
  classroom_id: string | null;
  classroom_name: string | null;
}

/**
 * Recent submission for a student
 */
export interface RecentSubmission {
  id: string;
  exercise_id: string;
  exercise_title: string;
  exercise_type: string;
  score: number;
  max_score: number;
  is_correct: boolean;
  time_spent_seconds: number | null;
  attempt_number: number;
  status: string;
  submitted_at: string;

  // FE-002: Additional submission fields
  xp_earned?: number;
  ml_coins_earned?: number;
  ml_coins_spent?: number;
  feedback?: string | null;
  comodines_used?: string[];
  hints_used?: number;
  grading_status?: 'pending' | 'auto_graded' | 'manually_graded';
  graded_by?: string;
  graded_at?: string;
}

/**
 * Detailed student progress
 */
export interface StudentProgress {
  user_info: {
    id: string;
    display_name: string;
    email: string;
    status: string;
    level: number;
    total_xp: number;
    ml_coins: number;
    exercises_completed: number;
    modules_completed: number;
    streak_days: number;
    max_streak: number;
    achievements_earned: number;
    last_activity_at: string | null;
  };
  modules_progress: ModuleProgressDetail[];
  recent_submissions: RecentSubmission[];
}

/**
 * Module statistics
 */
export interface ModuleProgressStats {
  module_info: {
    id: string;
    title: string;
    description: string | null;
    difficulty_level: string;
    estimated_duration: number | null;
    order_number: number;
    total_exercises: number;
  };
  progress_stats: {
    total_students: number;
    not_started_count: number;
    in_progress_count: number;
    completed_count: number;
    avg_progress_percent: number;
    avg_score: number | null;
    avg_time_spent_minutes: number;
    total_xp_distributed: number;
  };
}

/**
 * Exercise statistics
 */
export interface ExerciseStats {
  exercise_info: {
    id: string;
    title: string;
    description: string | null;
    exercise_type: string;
    difficulty: string;
    xp_reward: number;
    ml_coins_reward: number;
    module_id: string;
    module_title: string;
  };
  submission_stats: {
    total_students_attempted: number;
    total_submissions: number;
    students_completed: number;
    completion_rate: number;
    avg_score: number | null;
    max_score_achieved: number | null;
    min_score_achieved: number | null;
    avg_time_seconds: number | null;
    avg_attempts: number;
  };
}

// ============================================================================
// CLASSROOMS (for Admin Progress Page)
// ============================================================================

/**
 * Basic classroom information for selectors and lists
 */
export interface ClassroomBasic {
  id: string;
  name: string;
  school_id?: string;
  teacher_id?: string;
  code?: string;
  grade_level?: string;
  section?: string;
  capacity?: number;
  current_students_count?: number;
  is_active: boolean;
  created_at?: string;
}
