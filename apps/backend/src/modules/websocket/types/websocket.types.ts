/**
 * WebSocket Types and Interfaces
 */

export enum SocketEvent {
  // Connection
  AUTHENTICATED = 'authenticated',
  ERROR = 'error',

  // Notifications
  NEW_NOTIFICATION = 'notification:new',
  NOTIFICATION_READ = 'notification:read',
  NOTIFICATION_DELETED = 'notification:deleted',
  UNREAD_COUNT_UPDATED = 'notification:unread_count',
  MARK_AS_READ = 'notification:mark_read',

  // Gamification
  ACHIEVEMENT_UNLOCKED = 'achievement:unlocked',
  RANK_UPDATED = 'rank:updated',
  XP_GAINED = 'xp:gained',
  // FIX GAP-LOW-003: Added for real-time balance updates
  BALANCE_UPDATED = 'balance:updated',
  ML_COINS_EARNED = 'mlcoins:earned',

  // Leaderboard
  LEADERBOARD_UPDATED = 'leaderboard:updated',

  // Missions
  MISSION_COMPLETED = 'mission:completed',
  MISSION_PROGRESS = 'mission:progress',

  // Teacher Portal (P2-01: 2025-12-18)
  STUDENT_ACTIVITY = 'teacher:student_activity',
  CLASSROOM_UPDATE = 'teacher:classroom_update',
  NEW_SUBMISSION = 'teacher:new_submission',
  ALERT_TRIGGERED = 'teacher:alert_triggered',
  STUDENT_ONLINE = 'teacher:student_online',
  STUDENT_OFFLINE = 'teacher:student_offline',
  PROGRESS_UPDATE = 'teacher:progress_update',
}

export interface SocketUserData {
  userId: string;
  email: string;
  role: string;
  tenantId?: string;
}

// Notification structure for WebSocket payloads
export interface WebSocketNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface NotificationPayload {
  notification: WebSocketNotification;
  timestamp: string;
}

export interface AchievementPayload {
  achievementId: string;
  title: string;
  description: string;
  icon: string;
  timestamp: string;
}

// Leaderboard entry for WebSocket payloads
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  xp: number;
  level: number;
  weeklyXp?: number;
  isCurrentUser?: boolean;
}

export interface LeaderboardPayload {
  leaderboard: LeaderboardEntry[];
  timestamp: string;
}

// Teacher Portal Payloads (P2-01: 2025-12-18)

export interface StudentActivityPayload {
  studentId: string;
  studentName: string;
  classroomId: string;
  activityType: 'exercise_start' | 'exercise_complete' | 'hint_used' | 'comodin_used' | 'module_start';
  exerciseId?: string;
  exerciseTitle?: string;
  moduleId?: string;
  moduleTitle?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface ClassroomUpdatePayload {
  classroomId: string;
  classroomName: string;
  updateType: 'student_joined' | 'student_left' | 'stats_changed';
  data: Record<string, unknown>;
  timestamp: string;
}

export interface NewSubmissionPayload {
  submissionId: string;
  studentId: string;
  studentName: string;
  exerciseId: string;
  exerciseTitle: string;
  classroomId: string;
  score: number;
  maxScore: number;
  requiresReview: boolean;
  timestamp: string;
}

export interface AlertTriggeredPayload {
  alertId: string;
  studentId: string;
  studentName: string;
  classroomId: string;
  alertType: 'at_risk' | 'low_performance' | 'inactive' | 'struggling';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  timestamp: string;
}

export interface StudentOnlineStatusPayload {
  studentId: string;
  studentName: string;
  classroomId: string;
  isOnline: boolean;
  lastActivity?: string;
  timestamp: string;
}
