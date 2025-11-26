/**
 * API Routes Constants - Backend
 *
 * @description Single source of truth para rutas API del backend NestJS.
 * @usage import { API_ROUTES } from '@/shared/constants';
 *
 * IMPORTANTE:
 * - Debe coincidir EXACTAMENTE con Frontend api-endpoints.ts
 * - Validado automáticamente por validate-api-contract.ts en CI/CD
 *
 * @see /docs/03-desarrollo/CONSTANTS-ARCHITECTURE.md
 */

/**
 * API Version (configurable desde .env)
 */
export const API_VERSION = process.env.API_VERSION || 'v1';

/**
 * API Prefix (configurable desde .env)
 */
export const API_PREFIX = process.env.API_PREFIX || 'api';

/**
 * API Base Path
 */
export const API_BASE = `/${API_PREFIX}/${API_VERSION}`;

/**
 * API Routes por módulo
 */
export const API_ROUTES = {
  // Auth Module
  AUTH: {
    BASE: '/auth',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    PROFILE: '/auth/profile',
  },

  // Users Module
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    PROFILE: (id: string) => `/users/${id}/profile`,
    PREFERENCES: (id: string) => `/users/${id}/preferences`,
    ROLES: (id: string) => `/users/${id}/roles`,
    STATS: (id: string) => `/users/${id}/stats`,
  },

  // Gamification Module
  GAMIFICATION: {
    BASE: '/gamification',

    // Achievements
    ACHIEVEMENTS: '/gamification/achievements',
    ACHIEVEMENT_BY_ID: (id: string) => `/gamification/achievements/${id}`,
    USER_ACHIEVEMENTS: (userId: string) => `/gamification/users/${userId}/achievements`,
    GRANT_ACHIEVEMENT: (userId: string, achievementId: string) =>
      `/gamification/users/${userId}/achievements/${achievementId}`,

    // Leaderboard
    LEADERBOARD: '/gamification/leaderboard',
    LEADERBOARD_BY_PERIOD: (period: string) => `/gamification/leaderboard/${period}`,

    // User Stats & Ranks
    USER_STATS: (userId: string) => `/gamification/users/${userId}/stats`,
    USER_RANK: (userId: string) => `/gamification/users/${userId}/rank`,
    RANK_HISTORY: (userId: string) => `/gamification/users/${userId}/rank/history`,

    // Rewards & ML Coins
    REWARDS: (userId: string) => `/gamification/users/${userId}/rewards`,
    ML_COINS_BALANCE: (userId: string) => `/gamification/users/${userId}/ml-coins`,
    ML_COINS_TRANSACTIONS: (userId: string) =>
      `/gamification/users/${userId}/ml-coins/transactions`,

    // Missions
    MISSIONS: '/gamification/missions',
    MISSION_BY_ID: (id: string) => `/gamification/missions/${id}`,
    USER_MISSIONS: (userId: string) => `/gamification/users/${userId}/missions`,
    ASSIGN_MISSION: (userId: string, missionId: string) =>
      `/gamification/users/${userId}/missions/${missionId}`,

    // Comodines (Power-ups)
    COMODINES: (userId: string) => `/gamification/users/${userId}/comodines`,
    PURCHASE_COMODIN: (userId: string, type: string) =>
      `/gamification/users/${userId}/comodines/${type}/purchase`,
    USE_COMODIN: (userId: string, type: string) =>
      `/gamification/users/${userId}/comodines/${type}/use`,

    // Notifications
    NOTIFICATIONS: (userId: string) => `/gamification/users/${userId}/notifications`,
    MARK_NOTIFICATION_READ: (userId: string, notificationId: string) =>
      `/gamification/users/${userId}/notifications/${notificationId}/read`,
  },

  // Educational Module
  EDUCATIONAL: {
    BASE: '/educational',

    // Modules
    MODULES: '/educational/modules',
    MODULE_BY_ID: (id: string) => `/educational/modules/${id}`,
    MODULE_EXERCISES: (moduleId: string) => `/educational/modules/${moduleId}/exercises`,
    MODULE_PROGRESS: (moduleId: string, userId: string) =>
      `/educational/modules/${moduleId}/progress/${userId}`,

    // Exercises
    EXERCISES: '/educational/exercises',
    EXERCISE_BY_ID: (id: string) => `/educational/exercises/${id}`,
    EXERCISE_SUBMIT: (id: string) => `/educational/exercises/${id}/submit`,
    EXERCISE_VALIDATE: (id: string) => `/educational/exercises/${id}/validate`,
    EXERCISE_HINTS: (id: string) => `/educational/exercises/${id}/hints`,

    // Media Resources
    MEDIA_RESOURCES: '/educational/media',
    MEDIA_BY_ID: (id: string) => `/educational/media/${id}`,
    MEDIA_UPLOAD: '/educational/media/upload',

    // Assessment Rubrics
    RUBRICS: '/educational/rubrics',
    RUBRIC_BY_ID: (id: string) => `/educational/rubrics/${id}`,
  },

  // Progress Module
  PROGRESS: {
    BASE: '/progress',

    // Module Progress Routes
    USER_PROGRESS: (userId: string) => `/progress/users/${userId}`,
    MODULE_PROGRESS: (userId: string, moduleId: string) =>
      `/progress/users/${userId}/modules/${moduleId}`,
    UPDATE_PROGRESS_PERCENTAGE: (id: string) => `/progress/${id}/percentage`,
    COMPLETE_MODULE: (id: string) => `/progress/${id}/complete`,
    MODULE_STATS: (moduleId: string) => `/progress/modules/${moduleId}/stats`,
    USER_PROGRESS_SUMMARY: (userId: string) => `/progress/users/${userId}/summary`,
    USER_IN_PROGRESS: (userId: string) => `/progress/users/${userId}/in-progress`,
    USER_LEARNING_PATH: (userId: string) => `/progress/users/${userId}/learning-path`,

    // Learning Sessions Routes
    SESSIONS: '/progress/sessions',
    SESSIONS_BY_USER: (userId: string) => `/progress/sessions/users/${userId}`,
    SESSION_BY_ID: (sessionId: string) => `/progress/sessions/${sessionId}`,
    END_SESSION: (sessionId: string) => `/progress/sessions/${sessionId}/end`,
    UPDATE_ENGAGEMENT: (sessionId: string) => `/progress/sessions/${sessionId}/engagement`,
    ACTIVE_SESSION: (userId: string) => `/progress/sessions/users/${userId}/active`,
    SESSION_STATS: (userId: string) => `/progress/sessions/users/${userId}/stats`,
    SESSION_DATE_RANGE: (userId: string) => `/progress/sessions/users/${userId}/range`,

    // Exercise Attempts Routes
    ATTEMPTS: '/progress/attempts',
    ATTEMPTS_BY_USER: (userId: string) => `/progress/attempts/users/${userId}`,
    ATTEMPTS_BY_EXERCISE: (exerciseId: string) => `/progress/attempts/exercises/${exerciseId}`,
    ATTEMPTS_BY_USER_EXERCISE: (userId: string, exerciseId: string) =>
      `/progress/attempts/users/${userId}/exercises/${exerciseId}`,
    NEXT_ATTEMPT_NUMBER: (userId: string, exerciseId: string) =>
      `/progress/attempts/users/${userId}/exercises/${exerciseId}/next-number`,
    SUBMIT_ATTEMPT: (attemptId: string) => `/progress/attempts/${attemptId}/submit`,
    ATTEMPT_STATS: (userId: string) => `/progress/attempts/users/${userId}/stats`,
    BEST_ATTEMPT: (userId: string, exerciseId: string) =>
      `/progress/attempts/users/${userId}/exercises/${exerciseId}/best`,
    TRACK_COMODINES: (attemptId: string) => `/progress/attempts/${attemptId}/comodines`,

    // Exercise Submissions Routes
    SUBMISSIONS: '/progress/submissions',
    SUBMISSIONS_BY_USER: (userId: string) => `/progress/submissions/users/${userId}`,
    SUBMISSIONS_BY_EXERCISE: (exerciseId: string) =>
      `/progress/submissions/exercises/${exerciseId}`,
    SUBMISSIONS_BY_USER_EXERCISE: (userId: string, exerciseId: string) =>
      `/progress/submissions/users/${userId}/exercises/${exerciseId}`,
    SUBMIT_EXERCISE: '/progress/submissions/submit',
    GRADE_SUBMISSION: (submissionId: string) => `/progress/submissions/${submissionId}/grade`,
    PROVIDE_FEEDBACK: (submissionId: string) =>
      `/progress/submissions/${submissionId}/feedback`,
    UPDATE_STATUS: (submissionId: string) => `/progress/submissions/${submissionId}/status`,
    SUBMISSION_STATS: (userId: string) => `/progress/submissions/users/${userId}/stats`,
    PENDING_REVIEW: '/progress/submissions/pending-review',
    CLAIM_REWARDS: (submissionId: string) => `/progress/submissions/${submissionId}/claim-rewards`,

    // Scheduled Missions Routes
    SCHEDULED_MISSIONS: '/progress/scheduled-missions',
    SCHEDULED_MISSIONS_BY_CLASSROOM: (classroomId: string) =>
      `/progress/scheduled-missions/classrooms/${classroomId}`,
    SCHEDULED_MISSIONS_BY_USER: (userId: string) =>
      `/progress/scheduled-missions/users/${userId}`,
    ACTIVE_MISSIONS: '/progress/scheduled-missions/active',
    UPCOMING_MISSIONS: (userId: string) => `/progress/scheduled-missions/users/${userId}/upcoming`,
    START_MISSION: (missionId: string) => `/progress/scheduled-missions/${missionId}/start`,
    COMPLETE_MISSION: (missionId: string) => `/progress/scheduled-missions/${missionId}/complete`,
    UPDATE_MISSION_PROGRESS: (missionId: string) =>
      `/progress/scheduled-missions/${missionId}/progress`,
    CLAIM_BONUS_REWARDS: (missionId: string) =>
      `/progress/scheduled-missions/${missionId}/claim-rewards`,
  },

  // Social Module
  SOCIAL: {
    BASE: '/social',

    // Friendships Routes (~10 endpoints)
    USER_FRIENDS: (userId: string) => `/social/users/${userId}/friends`,
    PENDING_FRIEND_REQUESTS: (userId: string) => `/social/users/${userId}/friends/pending`,
    SENT_FRIEND_REQUESTS: (userId: string) => `/social/users/${userId}/friends/sent`,
    SEND_FRIEND_REQUEST: '/social/friendships/request',
    ACCEPT_FRIEND_REQUEST: (friendshipId: string) => `/social/friendships/${friendshipId}/accept`,
    REJECT_FRIEND_REQUEST: (friendshipId: string) => `/social/friendships/${friendshipId}/reject`,
    BLOCK_USER: (userId: string, friendId: string) => `/social/users/${userId}/block/${friendId}`,
    UNBLOCK_USER: (userId: string, friendId: string) => `/social/users/${userId}/block/${friendId}`,
    REMOVE_FRIEND: (userId: string, friendId: string) => `/social/users/${userId}/friends/${friendId}`,
    CHECK_FRIENDSHIP: (userId1: string, userId2: string) => `/social/users/${userId1}/${userId2}/friendship`,

    // Schools Routes (~8 endpoints)
    SCHOOLS: '/social/schools',
    SCHOOL_BY_ID: (id: string) => `/social/schools/${id}`,
    SCHOOL_BY_CODE: (code: string) => `/social/schools/code/${code}`,
    CREATE_SCHOOL: '/social/schools',
    UPDATE_SCHOOL: (id: string) => `/social/schools/${id}`,
    DELETE_SCHOOL: (id: string) => `/social/schools/${id}`,
    SCHOOL_STATS: (id: string) => `/social/schools/${id}/stats`,
    SCHOOL_SETTINGS: (id: string) => `/social/schools/${id}/settings`,

    // Classrooms Routes (~12 endpoints)
    CLASSROOMS: '/social/classrooms',
    CLASSROOM_BY_ID: (id: string) => `/social/classrooms/${id}`,
    CLASSROOM_BY_CODE: (code: string) => `/social/classrooms/code/${code}`,
    CREATE_CLASSROOM: '/social/classrooms',
    UPDATE_CLASSROOM: (id: string) => `/social/classrooms/${id}`,
    DELETE_CLASSROOM: (id: string) => `/social/classrooms/${id}`,
    CLASSROOM_STATS: (id: string) => `/social/classrooms/${id}/stats`,
    ACTIVE_CLASSROOMS: (teacherId: string) => `/social/teachers/${teacherId}/classrooms/active`,
    ENROLL_STUDENT: (classroomId: string, studentId: string) => `/social/classrooms/${classroomId}/students/${studentId}`,
    REMOVE_STUDENT: (classroomId: string, studentId: string) => `/social/classrooms/${classroomId}/students/${studentId}`,
    UPDATE_CLASSROOM_SCHEDULE: (id: string) => `/social/classrooms/${id}/schedule`,
    CLASSROOM_MEMBERS: (classroomId: string) => `/social/classrooms/${classroomId}/members`,

    // Classroom Members Routes (~10 endpoints)
    GET_CLASSROOM_MEMBERS: (classroomId: string) => `/social/classroom-members/classrooms/${classroomId}`,
    GET_USER_CLASSROOMS: (userId: string) => `/social/classroom-members/users/${userId}`,
    GET_CLASSROOM_MEMBER: (classroomId: string, userId: string) => `/social/classroom-members/classrooms/${classroomId}/users/${userId}`,
    CREATE_CLASSROOM_MEMBER: '/social/classroom-members',
    UPDATE_MEMBER_STATUS: (id: string) => `/social/classroom-members/${id}/status`,
    RECORD_GRADE: (id: string) => `/social/classroom-members/${id}/grade`,
    UPDATE_ATTENDANCE: (id: string) => `/social/classroom-members/${id}/attendance`,
    WITHDRAW_MEMBER: (id: string) => `/social/classroom-members/${id}/withdraw`,
    ACTIVE_CLASSROOM_MEMBERS: (classroomId: string) => `/social/classroom-members/classrooms/${classroomId}/active`,
    CLASSROOM_LEADERBOARD: (classroomId: string) => `/social/classroom-members/classrooms/${classroomId}/leaderboard`,

    // Teams Routes (~13 endpoints)
    TEAMS: '/social/teams',
    TEAM_BY_ID: (id: string) => `/social/teams/${id}`,
    TEAM_BY_CODE: (code: string) => `/social/teams/code/${code}`,
    CREATE_TEAM: '/social/teams',
    UPDATE_TEAM: (id: string) => `/social/teams/${id}`,
    DELETE_TEAM: (id: string) => `/social/teams/${id}`,
    ADD_TEAM_MEMBER: (teamId: string, userId: string) => `/social/teams/${teamId}/members/${userId}`,
    REMOVE_TEAM_MEMBER: (teamId: string, userId: string) => `/social/teams/${teamId}/members/${userId}`,
    UPDATE_TEAM_SCORE: (id: string) => `/social/teams/${id}/score`,
    ADD_TEAM_XP: (id: string) => `/social/teams/${id}/xp`,
    TEAM_LEADERBOARD: (classroomId: string) => `/social/classrooms/${classroomId}/teams/leaderboard`,
    TEAM_STATS: (id: string) => `/social/teams/${id}/stats`,
    TEAM_MEMBERS: (teamId: string) => `/social/teams/${teamId}/members`,

    // Team Members Routes (~8 endpoints)
    GET_TEAM_MEMBERS: (teamId: string) => `/social/team-members/teams/${teamId}`,
    GET_USER_TEAMS: (userId: string) => `/social/team-members/users/${userId}`,
    GET_TEAM_MEMBER: (teamId: string, userId: string) => `/social/team-members/teams/${teamId}/users/${userId}`,
    CREATE_TEAM_MEMBER: '/social/team-members',
    UPDATE_TEAM_MEMBER_ROLE: (id: string) => `/social/team-members/${id}/role`,
    DELETE_TEAM_MEMBER: (id: string) => `/social/team-members/${id}`,
    ACTIVE_TEAM_MEMBERS: (teamId: string) => `/social/team-members/teams/${teamId}/active`,
    TRANSFER_TEAM_OWNERSHIP: (teamId: string) => `/social/team-members/teams/${teamId}/transfer-ownership`,

    // Team Challenges Routes (~9 endpoints)
    GET_TEAM_CHALLENGES: (teamId: string) => `/social/team-challenges/teams/${teamId}`,
    GET_CHALLENGE_TEAMS: (challengeId: string) => `/social/team-challenges/challenges/${challengeId}`,
    GET_TEAM_CHALLENGE: (teamId: string, challengeId: string) => `/social/team-challenges/teams/${teamId}/challenges/${challengeId}`,
    CREATE_TEAM_CHALLENGE: '/social/team-challenges',
    UPDATE_CHALLENGE_STATUS: (id: string) => `/social/team-challenges/${id}/status`,
    RECORD_CHALLENGE_SCORE: (id: string) => `/social/team-challenges/${id}/score`,
    COMPLETE_CHALLENGE: (id: string) => `/social/team-challenges/${id}/complete`,
    FAIL_CHALLENGE: (id: string) => `/social/team-challenges/${id}/fail`,
    CHALLENGE_LEADERBOARD: (challengeId: string) => `/social/team-challenges/challenges/${challengeId}/leaderboard`,
  },

  // Content Management Module
  CONTENT: {
    BASE: '/content',

    // Content Templates (9 endpoints)
    TEMPLATES: '/content/templates',
    TEMPLATE_BY_ID: (id: string) => `/content/templates/${id}`,
    CREATE_TEMPLATE: '/content/templates',
    UPDATE_TEMPLATE: (id: string) => `/content/templates/${id}`,
    DELETE_TEMPLATE: (id: string) => `/content/templates/${id}`,
    INCREMENT_TEMPLATE_USAGE: (id: string) => `/content/templates/${id}/use`,
    TEMPLATES_BY_TYPE: (type: string) => `/content/templates/type/${type}`,
    TEMPLATES_BY_CATEGORY: (category: string) => `/content/templates/category/${category}`,
    POPULAR_TEMPLATES: '/content/templates/popular',

    // Marie Curie Content (10 endpoints)
    MARIE_CURIE: '/content/marie-curie',
    MARIE_CURIE_BY_ID: (id: string) => `/content/marie-curie/${id}`,
    MARIE_CURIE_BY_CATEGORY: (category: string) => `/content/marie-curie/category/${category}`,
    CREATE_MARIE_CURIE: '/content/marie-curie',
    UPDATE_MARIE_CURIE: (id: string) => `/content/marie-curie/${id}`,
    DELETE_MARIE_CURIE: (id: string) => `/content/marie-curie/${id}`,
    PUBLISH_MARIE_CURIE: (id: string) => `/content/marie-curie/${id}/publish`,
    MARIE_CURIE_PUBLISHED: '/content/marie-curie/published',
    MARIE_CURIE_FEATURED: '/content/marie-curie/featured',

    // Media Files (13 endpoints)
    MEDIA_FILES: '/content/media-files',
    MEDIA_FILE_BY_ID: (id: string) => `/content/media-files/${id}`,
    UPLOAD_MEDIA: '/content/media-files',
    UPDATE_MEDIA: (id: string) => `/content/media-files/${id}`,
    DELETE_MEDIA: (id: string) => `/content/media-files/${id}`,
    MEDIA_BY_TYPE: (fileType: string) => `/content/media-files/type/${fileType}`,
    SEARCH_MEDIA_BY_TAGS: '/content/media-files/search',
    UPDATE_MEDIA_STATUS: (id: string) => `/content/media-files/${id}/status`,
    MEDIA_STATS: '/content/media-files/stats',
    MEDIA_BY_UPLOADER: (userId: string) => `/content/media-files/users/${userId}`,
    GENERATE_THUMBNAIL: (id: string) => `/content/media-files/${id}/thumbnail`,
    INCREMENT_MEDIA_COUNTER: (id: string, counterType: string) => `/content/media-files/${id}/increment/${counterType}`,
  },

  // Admin Module
  ADMIN: {
    BASE: '/admin',

    // Dashboard
    DASHBOARD: '/admin/dashboard',
    DASHBOARD_STATS: '/admin/dashboard/stats',
    DASHBOARD_RECENT_ACTIVITY: '/admin/dashboard/recent-activity',
    DASHBOARD_USER_STATS: '/admin/dashboard/user-stats',
    DASHBOARD_ORGANIZATION_STATS: '/admin/dashboard/organization-stats',
    DASHBOARD_MODERATION_QUEUE: '/admin/dashboard/moderation-queue',
    DASHBOARD_CLASSROOM_OVERVIEW: '/admin/dashboard/classroom-overview',
    DASHBOARD_ASSIGNMENT_STATS: '/admin/dashboard/assignment-stats',
    DASHBOARD_ACTIONS_RECENT: '/admin/dashboard/actions/recent',
    DASHBOARD_ALERTS: '/admin/dashboard/alerts',
    DASHBOARD_ANALYTICS_USER_ACTIVITY: '/admin/dashboard/analytics/user-activity',

    // System Alerts
    ALERTS: {
      BASE: '/admin/alerts',
      BY_ID: (id: string) => `/admin/alerts/${id}`,
      STATS_SUMMARY: '/admin/alerts/stats/summary',
      ACKNOWLEDGE: (id: string) => `/admin/alerts/${id}/acknowledge`,
      RESOLVE: (id: string) => `/admin/alerts/${id}/resolve`,
      SUPPRESS: (id: string) => `/admin/alerts/${id}/suppress`,
    },

    // Analytics
    ANALYTICS: {
      BASE: '/admin/analytics',
      OVERVIEW: '/admin/analytics/overview',
      ENGAGEMENT: '/admin/analytics/engagement',
      GAMIFICATION: '/admin/analytics/gamification',
      ACTIVITY_TIMELINE: '/admin/analytics/activity-timeline',
      TOP_USERS: '/admin/analytics/top-users',
      RETENTION: '/admin/analytics/retention',
      EXPORT: '/admin/analytics/export',
    },

    // Monitoring
    MONITORING: {
      BASE: '/admin/monitoring',
      METRICS: '/admin/monitoring/metrics',
      METRICS_HISTORY: '/admin/monitoring/metrics/history',
      ERRORS_STATS: '/admin/monitoring/errors/stats',
      ERRORS_RECENT: '/admin/monitoring/errors/recent',
      ERRORS_TRENDS: '/admin/monitoring/errors/trends',
    },

    // Progress
    PROGRESS: {
      BASE: '/admin/progress',
      OVERVIEW: '/admin/progress/overview',
      CLASSROOM: (id: string) => `/admin/progress/classrooms/${id}`,
      STUDENT: (id: string) => `/admin/progress/students/${id}`,
      MODULE: (id: string) => `/admin/progress/modules/${id}`,
      EXERCISE: (id: string) => `/admin/progress/exercises/${id}`,
      EXPORT: '/admin/progress/export',
    },

    // Reports
    REPORTS: {
      BASE: '/admin/reports',
      GENERATE: '/admin/reports/generate',
      BY_ID: (id: string) => `/admin/reports/${id}`,
      DOWNLOAD: (id: string) => `/admin/reports/${id}/download`,
    },

    // Logs
    LOGS: '/admin/logs',

    // System
    SYSTEM: {
      BASE: '/admin/system',
      HEALTH: '/admin/system/health',
      METRICS: '/admin/system/metrics',
      AUDIT_LOG: '/admin/system/audit-log',
      CONFIG: '/admin/system/config',
      CONFIG_CATEGORY: (category: string) => `/admin/system/config/${category}`,
      MAINTENANCE: '/admin/system/maintenance',
      MAINTENANCE_CLEANUP_LOGS: '/admin/system/maintenance/cleanup-logs',
      MAINTENANCE_CLEANUP_ACTIVITY: '/admin/system/maintenance/cleanup-activity',
      MAINTENANCE_OPTIMIZE_DATABASE: '/admin/system/maintenance/optimize-database',
      MAINTENANCE_CLEAR_CACHE: '/admin/system/maintenance/clear-cache',
      MAINTENANCE_CLEANUP_SESSIONS: '/admin/system/maintenance/cleanup-sessions',
    },

    // Settings
    SETTINGS: '/admin/settings',

    // Organizations
    ORGANIZATIONS: '/admin/organizations',
    ORGANIZATION_BY_ID: (id: string) => `/admin/organizations/${id}`,
    ORGANIZATION_STATS: (id: string) => `/admin/organizations/${id}/stats`,
    ORGANIZATION_USERS: (id: string) => `/admin/organizations/${id}/users`,
    ORGANIZATION_SUBSCRIPTION: (id: string) => `/admin/organizations/${id}/subscription`,
    ORGANIZATION_FEATURES: (id: string) => `/admin/organizations/${id}/features`,

    // Users Management
    USERS: '/admin/users',
    USER_BY_ID: (id: string) => `/admin/users/${id}`,
    USER_STATS: '/admin/users/stats',
    USER_SUSPEND: (id: string) => `/admin/users/${id}/suspend`,
    USER_ACTIVATE: (id: string) => `/admin/users/${id}/activate`,
    USER_UNSUSPEND: (id: string) => `/admin/users/${id}/unsuspend`,
    USER_DEACTIVATE: (id: string) => `/admin/users/${id}/deactivate`,
    USER_RESET_PASSWORD: (id: string) => `/admin/users/${id}/reset-password`,
    USER_BULK_SUSPEND: '/admin/users/bulk/suspend',
    USER_BULK_DELETE: '/admin/users/bulk/delete',
    USER_BULK_UPDATE_ROLE: '/admin/users/bulk/update-role',

    // Roles & Permissions
    ROLES: {
      BASE: '/admin/roles',
      PERMISSIONS: '/admin/roles/permissions',
      ROLE_PERMISSIONS: (id: string) => `/admin/roles/${id}/permissions`,
    },

    // Classrooms Management
    CLASSROOMS: '/admin/classrooms',
    CLASSROOM_BY_ID: (id: string) => `/admin/classrooms/${id}`,
    CLASSROOM_TEACHERS: (classroomId: string) => `/admin/classrooms/${classroomId}/teachers`,
    CLASSROOM_STUDENTS: (classroomId: string) => `/admin/classrooms/${classroomId}/students`,

    // Classroom Teachers REST
    CLASSROOM_TEACHERS_REST: {
      BASE: '/admin/classroom-teachers',
      CLASSROOM_TEACHERS: (classroomId: string) => `/admin/classrooms/${classroomId}/teachers`,
      TEACHER_CLASSROOMS: (teacherId: string) => `/admin/teachers/${teacherId}/classrooms`,
      BULK: '/admin/classroom-teachers/bulk',
    },

    // Content Moderation
    CONTENT: {
      BASE: '/admin/content',
      PENDING: '/admin/content/pending',
      EXERCISES_PENDING: '/admin/content/exercises/pending',
      APPROVE: (id: string) => `/admin/content/${id}/approve`,
      EXERCISES_APPROVE: (id: string) => `/admin/content/exercises/${id}/approve`,
      REJECT: (id: string) => `/admin/content/${id}/reject`,
      EXERCISES_REJECT: (id: string) => `/admin/content/exercises/${id}/reject`,
      VERSION: '/admin/content/version',
      MEDIA: '/admin/content/media',
    },

    // Bulk Operations
    BULK_OPERATIONS: {
      BASE: '/admin/bulk-operations',
      SUSPEND_USERS: '/admin/bulk-operations/suspend-users',
      ACTIVATE_USERS: '/admin/bulk-operations/activate-users',
      UPDATE_ROLE: '/admin/bulk-operations/update-role',
      DELETE_USERS: '/admin/bulk-operations/delete-users',
      BY_ID: (id: string) => `/admin/bulk-operations/${id}`,
    },

    // Gamification Configuration
    GAMIFICATION_CONFIG: {
      BASE: '/admin/gamification/config',
      SETTINGS: '/admin/gamification/config/settings',
      PREVIEW: '/admin/gamification/config/settings/preview',
      RESTORE_DEFAULTS: '/admin/gamification/config/settings/restore-defaults',
      PARAMETERS: '/admin/gamification/config/parameters',
      PARAMETER_BY_ID: (id: string) => `/admin/gamification/config/parameters/${id}`,
      MAYA_RANKS: '/admin/gamification/config/maya-ranks',
      MAYA_RANK: (rankName: string) => `/admin/gamification/config/maya-ranks/${rankName}`,
    },
  },

  // Teacher Module
  TEACHER: {
    BASE: '/teacher',

    // Dashboard
    DASHBOARD: '/teacher/dashboard',
    DASHBOARD_STATS: '/teacher/dashboard/stats',
    DASHBOARD_ACTIVITIES: '/teacher/dashboard/activities',
    DASHBOARD_ALERTS: '/teacher/dashboard/alerts',
    DASHBOARD_TOP_PERFORMERS: '/teacher/dashboard/top-performers',
    DASHBOARD_MODULE_PROGRESS: '/teacher/dashboard/module-progress',

    // Classrooms
    CLASSROOMS: '/teacher/classrooms',
    CLASSROOM_BY_ID: (id: string) => `/teacher/classrooms/${id}`,
    CLASSROOM_TEACHERS: (classroomId: string) => `/teacher/classrooms/${classroomId}/teachers`,
    CLASSROOM_STUDENTS: (classroomId: string) => `/teacher/classrooms/${classroomId}/students`,
    CLASSROOM_STATS: (id: string) => `/teacher/classrooms/${id}/stats`,
    CLASSROOM_PROGRESS: (id: string) => `/teacher/classrooms/${id}/progress`,
    CLASSROOM_STUDENT_BLOCK: (classroomId: string, studentId: string) =>
      `/teacher/classrooms/${classroomId}/students/${studentId}/block`,
    CLASSROOM_STUDENT_UNBLOCK: (classroomId: string, studentId: string) =>
      `/teacher/classrooms/${classroomId}/students/${studentId}/unblock`,
    CLASSROOM_STUDENT_PERMISSIONS: (classroomId: string, studentId: string) =>
      `/teacher/classrooms/${classroomId}/students/${studentId}/permissions`,

    // Students
    STUDENT_PROGRESS: (studentId: string) => `/teacher/students/${studentId}/progress`,
    STUDENT_OVERVIEW: (studentId: string) => `/teacher/students/${studentId}/overview`,
    STUDENT_STATS: (studentId: string) => `/teacher/students/${studentId}/stats`,
    STUDENT_NOTES: (studentId: string) => `/teacher/students/${studentId}/notes`,
    STUDENT_ADD_NOTE: (studentId: string) => `/teacher/students/${studentId}/note`,
    STUDENT_INSIGHTS: (studentId: string) => `/teacher/students/${studentId}/insights`,
    STUDENT_BONUS: (studentId: string) => `/teacher/students/${studentId}/bonus`,

    // Intervention Alerts
    ALERTS: {
      BASE: '/teacher/alerts',
      BY_ID: (id: string) => `/teacher/alerts/${id}`,
      ACKNOWLEDGE: (id: string) => `/teacher/alerts/${id}/acknowledge`,
      RESOLVE: (id: string) => `/teacher/alerts/${id}/resolve`,
      DISMISS: (id: string) => `/teacher/alerts/${id}/dismiss`,
      STUDENT_HISTORY: (studentId: string) => `/teacher/alerts/student/${studentId}/history`,
      GENERATE: '/teacher/alerts/generate',
    },

    // Messages/Communication
    MESSAGES: {
      BASE: '/teacher/messages',
      BY_ID: (id: string) => `/teacher/messages/${id}`,
      CONVERSATIONS: '/teacher/messages/conversations',
      UNREAD_COUNT: '/teacher/messages/unread-count',
      MARK_READ: (id: string) => `/teacher/messages/${id}/read`,
      CLASSROOM_ANNOUNCEMENT: (classroomId: string) =>
        `/teacher/messages/classroom/${classroomId}/announcement`,
      STUDENT_FEEDBACK: (studentId: string) =>
        `/teacher/messages/student/${studentId}/feedback`,
    },

    // Content Management
    CONTENT: {
      BASE: '/teacher/content',
      BY_ID: (id: string) => `/teacher/content/${id}`,
      CLONE: (id: string) => `/teacher/content/${id}/clone`,
      PUBLISH: (id: string) => `/teacher/content/${id}/publish`,
    },

    // Submissions
    SUBMISSIONS: '/teacher/submissions',
    SUBMISSION_BY_ID: (id: string) => `/teacher/submissions/${id}`,
    SUBMISSION_FEEDBACK: (submissionId: string) =>
      `/teacher/submissions/${submissionId}/feedback`,
    SUBMISSIONS_BULK_GRADE: '/teacher/submissions/bulk-grade',

    // Assignments & Grades
    ASSIGNMENTS: '/teacher/assignments',
    ASSIGNMENT_BY_ID: (id: string) => `/teacher/assignments/${id}`,
    GRADES: '/teacher/grades',
    GRADE_BY_ID: (id: string) => `/teacher/grades/${id}`,

    // Analytics
    ANALYTICS: '/teacher/analytics',
    ANALYTICS_CLASSROOM: (id: string) => `/teacher/analytics/classroom/${id}`,
    ANALYTICS_ASSIGNMENT: (id: string) => `/teacher/analytics/assignment/${id}`,
    ANALYTICS_ENGAGEMENT: '/teacher/analytics/engagement',
    ANALYTICS_REPORTS: '/teacher/analytics/reports',
    ANALYTICS_ECONOMY: '/teacher/analytics/economy', // GAP-ST-005
    ANALYTICS_STUDENTS_ECONOMY: '/teacher/analytics/students-economy', // GAP-ST-006
    ANALYTICS_ACHIEVEMENTS: '/teacher/analytics/achievements', // GAP-ST-007

    // Reports
    REPORTS: '/teacher/reports',
    REPORT_BY_ID: (id: string) => `/teacher/reports/${id}`,
    REPORTS_GENERATE: '/teacher/reports/generate',
  },

  // Notifications Module
  NOTIFICATIONS: {
    BASE: '/notifications',

    // User Notifications
    USER_NOTIFICATIONS: (userId: string) => `/notifications/users/${userId}`,
    UNREAD_NOTIFICATIONS: (userId: string) => `/notifications/users/${userId}/unread`,
    NOTIFICATION_BY_ID: (id: string) => `/notifications/${id}`,

    // Mark as Read
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: (userId: string) => `/notifications/users/${userId}/mark-all-read`,

    // Mark as Unread
    MARK_UNREAD: (id: string) => `/notifications/${id}/unread`,

    // Delete
    DELETE_NOTIFICATION: (id: string) => `/notifications/${id}`,
    DELETE_ALL: (userId: string) => `/notifications/users/${userId}`,

    // Preferences
    PREFERENCES: (userId: string) => `/notifications/users/${userId}/preferences`,
    UPDATE_PREFERENCES: (userId: string) => `/notifications/users/${userId}/preferences`,

    // Stats
    STATS: (userId: string) => `/notifications/users/${userId}/stats`,
  },

  // Health & Monitoring
  HEALTH: {
    BASE: '/health',
    LIVENESS: '/health/liveness',
    READINESS: '/health/readiness',
    METRICS: '/health/metrics',
  },
} as const;

/**
 * Helper: Construir URL completa con base
 *
 * @example
 * buildApiUrl('/auth/login') => '/api/v1/auth/login'
 */
export const buildApiUrl = (route: string): string => {
  return `${API_BASE}${route}`;
};

/**
 * Helper: Extraer base path (para @Controller)
 *
 * @example
 * extractBasePath('/users') => 'users'
 */
export const extractBasePath = (route: string): string => {
  return route.replace(/^\//, '');
};

/**
 * Helper: Construir ruta con parámetros
 *
 * @example
 * buildRoute('/users/:id', { id: '123' }) => '/users/123'
 */
export const buildRoute = (template: string, params: Record<string, string>): string => {
  let route = template;
  Object.entries(params).forEach(([key, value]) => {
    route = route.replace(`:${key}`, value);
  });
  return route;
};
