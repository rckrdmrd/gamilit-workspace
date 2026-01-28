/**
 * Parent Portal Types
 *
 * EXT-011 Parent Portal - TypeScript Types
 *
 * @description Type definitions for parent portal feature.
 * @see ET-PAR-001-parent-authentication.md
 * @see ET-PAR-002-portal-dashboard.md
 * @created 2026-01-27
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum RelationshipType {
  FATHER = 'father',
  MOTHER = 'mother',
  GUARDIAN = 'guardian',
  GRANDPARENT = 'grandparent',
  OTHER = 'other',
}

export enum NotificationFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
}

export enum ReportFormat {
  EMAIL = 'email',
  PDF = 'pdf',
  BOTH = 'both',
}

export enum LinkStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REVOKED = 'revoked',
}

export enum ActivityType {
  EXERCISE_COMPLETED = 'exercise_completed',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  LEVEL_UP = 'level_up',
  RANK_PROMOTION = 'rank_promotion',
  MODULE_COMPLETED = 'module_completed',
  ASSIGNMENT_SUBMITTED = 'assignment_submitted',
  STREAK_MILESTONE = 'streak_milestone',
}

export enum AssignmentStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  OVERDUE = 'overdue',
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface ParentLoginCredentials {
  email: string;
  password: string;
}

export interface ParentRegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  relationshipType?: RelationshipType;
  preferredLanguage?: string;
}

export interface ParentAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ParentAccount {
  id: string;
  profileId: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  relationshipType?: RelationshipType;
  notificationFrequency: NotificationFrequency;
  preferredReportFormat: ReportFormat;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface ParentAuthResponse {
  tokens: ParentAuthTokens;
  account: ParentAccount;
}

// ============================================================================
// STUDENT TYPES
// ============================================================================

export interface LinkedStudent {
  studentId: string;
  linkId: string;
  displayName: string;
  avatarUrl?: string;
  relationshipType: RelationshipType;
  linkStatus: LinkStatus;
  canViewProgress: boolean;
  canViewGrades: boolean;
  canReceiveNotifications: boolean;
  canContactTeachers: boolean;
  linkedAt: string;
}

export interface LinkStudentData {
  studentCode: string;
  relationshipType: RelationshipType;
  requireStudentApproval?: boolean;
}

export interface VerifyLinkData {
  linkId: string;
  verificationCode: string;
}

// ============================================================================
// PROGRESS TYPES
// ============================================================================

export interface StudentProgressSummary {
  studentId: string;
  displayName: string;
  currentLevel: number;
  currentRank: string;
  totalXp: number;
  xpThisWeek: number;
  currentStreak: number;
  exercisesCompletedThisWeek: number;
  averageAccuracyThisWeek: number;
  modulesInProgress: number;
  modulesCompleted: number;
  recentAchievements: string[];
  lastActivityDate?: string;
}

export interface RecentActivity {
  id: string;
  studentId: string;
  studentName: string;
  activityType: ActivityType;
  title: string;
  description: string;
  xpEarned?: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface UpcomingAssignment {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  dueDate: string;
  status: AssignmentStatus;
  teacherName?: string;
  className?: string;
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface ParentDashboard {
  students: LinkedStudent[];
  progressSummaries: StudentProgressSummary[];
  recentActivities: RecentActivity[];
  upcomingAssignments: UpcomingAssignment[];
  unreadNotifications: number;
  unreadMessages: number;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface ParentNotification {
  id: string;
  parentAccountId: string;
  studentId?: string;
  type: string;
  title: string;
  message: string;
  status: 'pending' | 'sent' | 'read' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  sentAt?: string;
  readAt?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// REPORT TYPES
// ============================================================================

export interface WeeklyReport {
  id: string;
  parentAccountId: string;
  studentId: string;
  weekStartDate: string;
  weekEndDate: string;
  status: 'generating' | 'completed' | 'failed';
  generatedAt?: string;
  summary: {
    xpEarned: number;
    exercisesCompleted: number;
    averageAccuracy: number;
    timeSpent: number;
    achievementsUnlocked: number;
    streak: number;
  };
  downloadUrl?: string;
}

// ============================================================================
// STORE STATE TYPES
// ============================================================================

export interface ParentState {
  // Auth
  account: ParentAccount | null;
  tokens: ParentAuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Dashboard
  students: LinkedStudent[];
  progressSummaries: StudentProgressSummary[];
  recentActivities: RecentActivity[];
  upcomingAssignments: UpcomingAssignment[];
  unreadNotifications: number;
  notifications: ParentNotification[];
  weeklyReports: WeeklyReport[];

  // Selected state
  selectedStudentId: string | null;

  // Actions
  login: (credentials: ParentLoginCredentials) => Promise<void>;
  register: (data: ParentRegisterData) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  loadDashboard: () => Promise<void>;
  loadStudentProgress: (studentId: string) => Promise<StudentProgressSummary>;
  linkStudent: (data: LinkStudentData) => Promise<void>;
  verifyLink: (data: VerifyLinkData) => Promise<void>;
  loadNotifications: () => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  selectStudent: (studentId: string | null) => void;
  clearError: () => void;
}
