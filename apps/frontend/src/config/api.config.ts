/**
 * API Configuration - Single Source of Truth
 *
 * IMPORTANTE: Este es el ÚNICO lugar donde se configuran las URLs del API.
 * Todos los demás archivos DEBEN importar desde aquí.
 *
 * @author Architecture-Analyst Agent
 * @date 2025-11-24
 * @version 1.0.0
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

const API_HOST = import.meta.env.VITE_API_HOST;
const API_PROTOCOL = import.meta.env.VITE_API_PROTOCOL || 'http';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

const WS_HOST = import.meta.env.VITE_WS_HOST || API_HOST;
const WS_PROTOCOL = import.meta.env.VITE_WS_PROTOCOL || 'ws';

const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');

// Validación
if (!API_HOST) {
  throw new Error('VITE_API_HOST is required in .env file');
}

// ============================================================================
// API CONFIGURATION
// ============================================================================

/**
 * Base API URL
 * Construido desde: PROTOCOL://HOST/api/VERSION
 * Ejemplo: http://localhost:3006/api/v1
 */
export const API_BASE_URL = `${API_PROTOCOL}://${API_HOST}/api/${API_VERSION}`;

/**
 * WebSocket URL
 * Construido desde: WS_PROTOCOL://WS_HOST
 * Ejemplo: ws://localhost:3006
 */
export const WS_BASE_URL = `${WS_PROTOCOL}://${WS_HOST}`;

/**
 * API Configuration Object
 */
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  wsURL: WS_BASE_URL,
  timeout: API_TIMEOUT,
  version: API_VERSION,
  host: API_HOST,
  protocol: API_PROTOCOL,
} as const;

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * API Endpoints - Todas las rutas relativas (sin /v1, ya está en baseURL)
 */
export const API_ENDPOINTS = {
  /**
   * Authentication endpoints
   */
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    profile: '/auth/profile',
    resetPassword: '/auth/reset-password',
    changePassword: '/auth/change-password',
    verifyEmail: '/auth/verify-email',
    requestPasswordReset: '/auth/reset-password/request',
    getCurrentUser: '/auth/profile',
    updateProfile: '/auth/profile',
    getSessions: '/auth/sessions',
    revokeSession: (sessionId: string) => `/auth/sessions/${sessionId}`,
  },

  /**
   * Gamification endpoints
   */
  gamification: {
    userSummary: (userId: string) => `/gamification/users/${userId}/summary`,
    userStats: (userId: string) => `/gamification/users/${userId}/stats`,
    userRankProgress: (userId: string) => `/gamification/ranks/users/${userId}/rank-progress`,
    achievements: '/gamification/achievements',
    achievement: (achievementId: string) => `/gamification/achievements/${achievementId}`,
    userAchievements: (userId: string) => `/gamification/users/${userId}/achievements`,
    leaderboard: '/gamification/leaderboard',
    rewards: '/gamification/rewards',
    badges: '/gamification/badges',
    mlCoins: (userId: string) => `/gamification/users/${userId}/ml-coins`,
    // Classroom missions (P1-005: Centralized endpoint)
    classroomMissions: (classroomId: string) => `/gamification/classrooms/${classroomId}/missions`,
    // Missions endpoints (P1-001: Centralized 2025-12-28)
    missions: {
      daily: '/gamification/missions/daily',
      weekly: '/gamification/missions/weekly',
      special: '/gamification/missions/special',
      claim: (missionId: string) => `/gamification/missions/${missionId}/claim`,
      progress: (missionId: string) => `/gamification/missions/${missionId}/progress`,
      stats: (userId: string) => `/gamification/missions/stats/${userId}`,
      // P1-002: Endpoint /me que extrae userId del JWT (evita 403)
      statsMe: '/gamification/missions/stats/me',
    },
  },

  /**
   * Educational endpoints
   */
  educational: {
    // Modules
    modules: '/educational/modules',
    module: (id: string) => `/educational/modules/${id}`,
    userModules: (userId: string) => `/educational/modules/user/${userId}`,
    moduleAccess: (moduleId: string) => `/educational/modules/${moduleId}/access`,
    moduleExercises: (moduleId: string) => `/educational/modules/${moduleId}/exercises`,

    // Exercises
    exercises: '/educational/exercises',
    exercise: (id: string) => `/educational/exercises/${id}`,

    // Exercise Validation & Rubrics (TASK-022: P1-5)
    rubrics: {
      list: '/educational/rubrics',
      get: (id: string) => `/educational/rubrics/${id}`,
      byExerciseType: (exerciseType: string) => `/educational/rubrics/exercise-type/${exerciseType}`,
      byModule: (moduleCode: string) => `/educational/rubrics/module/${moduleCode}`,
      create: '/educational/rubrics',
      update: (id: string) => `/educational/rubrics/${id}`,
      delete: (id: string) => `/educational/rubrics/${id}`,
      setDefault: (id: string) => `/educational/rubrics/${id}/set-default`,
    },
    validation: {
      configs: '/educational/validation/configs',
      config: (id: string) => `/educational/validation/configs/${id}`,
      configsByExerciseType: (exerciseType: string) =>
        `/educational/validation/configs/exercise-type/${exerciseType}`,
      createConfig: '/educational/validation/configs',
      deleteConfig: (id: string) => `/educational/validation/configs/${id}`,
      availableFunctions: '/educational/validation/configs/functions/available',
      audit: '/educational/validation/audit',
      auditById: (id: string) => `/educational/validation/audit/${id}`,
      auditByExercise: (exerciseId: string) => `/educational/validation/audit/exercise/${exerciseId}`,
      auditByUser: (userId: string) => `/educational/validation/audit/user/${userId}`,
      auditDiscrepancies: '/educational/validation/audit/discrepancies',
      auditExerciseStats: (exerciseId: string) =>
        `/educational/validation/audit/exercise/${exerciseId}/stats`,
      recordDiscrepancy: (id: string) => `/educational/validation/audit/${id}/discrepancy`,
    },

    // Lessons
    lessons: '/educational/lessons',
    lesson: (id: string) => `/educational/lessons/${id}`,

    // User Progress & Analytics (legacy - these should use progress namespace)
    userProgress: (userId: string) => `/progress/users/${userId}`,
    moduleProgress: (userId: string, moduleId: string) =>
      `/progress/users/${userId}/modules/${moduleId}`,
    userDashboard: (userId: string) => `/educational/users/${userId}/dashboard`,
    exerciseAttempts: (userId: string) => `/progress/attempts/users/${userId}`,
    userAnalytics: (userId: string) => `/educational/users/${userId}/analytics`,
    activityStats: (userId: string) => `/educational/users/${userId}/activity-stats`,
    activitiesByType: (userId: string, type: string) =>
      `/educational/users/${userId}/activities/${type}`,
    userActivities: (userId: string) => `/educational/users/${userId}/activities`,
  },

  /**
   * Progress endpoints
   */
  progress: {
    userProgress: (userId: string) => `/progress/users/${userId}`,
    moduleProgress: (userId: string, moduleId: string) =>
      `/progress/users/${userId}/modules/${moduleId}`,
    exerciseProgress: (userId: string, exerciseId: string) =>
      `/progress/users/${userId}/exercises/${exerciseId}`,
    recentActivities: (userId: string) => `/progress/users/${userId}/recent-activities`,
    statistics: (userId: string) => `/progress/users/${userId}/statistics`,
  },

  /**
   * Economy endpoints (mapped to gamification backend controllers)
   */
  economy: {
    balance: (userId: string) => `/gamification/users/${userId}/ml-coins`,
    transactions: (userId: string) => `/gamification/users/${userId}/ml-coins/transactions`,
    shop: '/gamification/shop',
    purchase: '/gamification/shop/purchase',
    shopItems: '/gamification/shop/items',
    shopItem: (itemId: string) => `/gamification/shop/items/${itemId}`,
    inventory: (userId: string) => `/gamification/users/${userId}/comodines`,
    inventoryItem: (userId: string, itemId: string) =>
      `/gamification/users/${userId}/comodines/${itemId}`,
  },

  /**
   * Social endpoints
   */
  social: {
    guilds: '/guilds',
    guild: (id: string) => `/guilds/${id}`,
    userGuilds: (userId: string) => `/guilds/users/${userId}`,
    friends: (userId: string) => `/social/users/${userId}/friends`,
    messages: (userId: string) => `/social/users/${userId}/messages`,
    // Schools endpoints (P1-003: Centralized 2025-12-28)
    schools: '/social/schools',
    school: (schoolId: string) => `/social/schools/${schoolId}`,

    // User Activities (TASK-022: P1-5)
    activities: {
      feed: '/social/activities/feed',
      create: '/social/activities',
      get: (activityId: string) => `/social/activities/${activityId}`,
      publicAll: '/social/activities/public/all',
      userActivities: (userId: string) => `/social/users/${userId}/activities/me`,
    },
  },

  /**
   * Notifications endpoints
   */
  notifications: {
    all: (userId: string) => `/notifications/users/${userId}`,
    unread: (userId: string) => `/notifications/users/${userId}/unread`,
    markRead: (notificationId: string) => `/notifications/${notificationId}/read`,
    markAllRead: (userId: string) => `/notifications/users/${userId}/mark-all-read`,
  },

  /**
   * Admin endpoints
   */
  admin: {
    // Dashboard
    dashboard: '/admin/dashboard',
    analytics: {
      overview: '/admin/analytics/overview',
      engagement: '/admin/analytics/engagement',
      gamification: '/admin/analytics/gamification',
      activityTimeline: '/admin/analytics/activity-timeline',
      topUsers: '/admin/analytics/top-users',
      retention: '/admin/analytics/retention',
      export: '/admin/analytics/export',
    },
    settings: '/admin/settings',

    // Organizations (nested structure for adminAPI.ts compatibility)
    organizations: {
      list: '/admin/organizations',
      get: (id: string) => `/admin/organizations/${id}`,
      create: '/admin/organizations',
      update: (id: string) => `/admin/organizations/${id}`,
      delete: (id: string) => `/admin/organizations/${id}`,
      stats: (id: string) => `/admin/organizations/${id}/stats`,
      users: (id: string) => `/admin/organizations/${id}/users`,
      updateSubscription: (id: string) => `/admin/organizations/${id}/subscription`,
      updateFeatures: (id: string) => `/admin/organizations/${id}/features`,
    },

    // Backwards compatibility (flat structure)
    organization: (id: string) => `/admin/organizations/${id}`,
    organizationFeatures: (id: string) => `/admin/organizations/${id}/features`,
    organizationSubscription: (id: string) => `/admin/organizations/${id}/subscription`,
    organizationUsers: (id: string) => `/admin/organizations/${id}/users`,

    // Content Management (includes approvals workflow)
    content: {
      // Content approval workflow
      pending: '/admin/content/pending',
      approve: (id: string) => `/admin/content/${id}/approve`,
      reject: (id: string) => `/admin/content/${id}/reject`,
      history: '/admin/content/history',
      list: '/admin/content',
      get: (id: string) => `/admin/content/${id}`,

      // Media library
      mediaLibrary: '/admin/content/media',
      deleteMedia: (id: string) => `/admin/content/media/${id}`,
      createVersion: '/admin/content/versions',
    },

    // Users Management (nested structure)
    users: {
      list: '/admin/users',
      get: (id: string) => `/admin/users/${id}`,
      update: (id: string) => `/admin/users/${id}`,
      delete: (id: string) => `/admin/users/${id}`,
      activate: (id: string) => `/admin/users/${id}/activate`,
      deactivate: (id: string) => `/admin/users/${id}/deactivate`,
      suspend: (id: string) => `/admin/users/${id}/suspend`,
      unsuspend: (id: string) => `/admin/users/${id}/unsuspend`,
      resetPassword: (id: string) => `/admin/users/${id}/reset-password`,
    },

    // Backwards compatibility (flat structure)
    user: (id: string) => `/admin/users/${id}`,

    // Roles & Permissions
    roles: {
      list: '/admin/roles',
      permissions: (roleId: string) => `/admin/roles/${roleId}/permissions`,
      updatePermissions: (roleId: string) => `/admin/roles/${roleId}/permissions`,
      availablePermissions: '/admin/roles/permissions',
    },

    // Classrooms
    classrooms: '/admin/classrooms',
    classroom: (id: string) => `/admin/classrooms/${id}`,
    classroomTeachersById: (classroomId: string) => `/admin/classrooms/${classroomId}/teachers`,

    // Gamification Configuration
    gamificationConfig: '/admin/gamification',
    gamification: {
      settings: '/admin/gamification/settings',
      updateSettings: '/admin/gamification/settings',
      previewChanges: '/admin/gamification/preview-changes',
      restoreDefaults: '/admin/gamification/restore-defaults',
    },

    // System Monitoring & Configuration
    system: {
      health: '/admin/system/health',
      metrics: '/admin/system/metrics',
      logs: '/admin/system/logs',
      maintenance: '/admin/system/maintenance',
      config: '/admin/system/config',
      configCategories: '/admin/system/config/categories',
      categoryConfig: (category: string) => `/admin/system/config/${category}`,
      validateConfig: '/admin/system/config/validate',
    },

    // Reports
    reports: {
      generate: '/admin/reports/generate',
      list: '/admin/reports',
      download: (reportId: string) => `/admin/reports/${reportId}/download`,
      delete: (reportId: string) => `/admin/reports/${reportId}`,
      schedule: (reportId: string) => `/admin/reports/${reportId}/schedule`,
    },

    // Alerts (used as string concatenation in adminAPI.ts)
    alerts: '/admin/alerts',

    // Monitoring
    monitoring: {
      metrics: '/admin/monitoring/metrics',
      metricsHistory: '/admin/monitoring/metrics/history',
      errorStats: '/admin/monitoring/errors/stats',
      recentErrors: '/admin/monitoring/errors/recent',
      errorTrends: '/admin/monitoring/errors/trends',
    },

    // Progress
    progress: {
      overview: '/admin/progress/overview',
      classroom: (id: string) => `/admin/progress/classrooms/${id}`,
      student: (id: string) => `/admin/progress/students/${id}`,
      module: (id: string) => `/admin/progress/modules/${id}`,
      exercise: (id: string) => `/admin/progress/exercises/${id}`,
      export: '/admin/progress/export',
    },

    // Classroom Teachers
    classroomTeachers: {
      list: '/admin/classroom-teachers',
      bulk: '/admin/classroom-teachers/bulk',
      byClassroom: (id: string) => `/admin/classrooms/${id}/teachers`,
      byTeacher: (id: string) => `/admin/teachers/${id}/classrooms`,
      classroomsList: '/admin/classrooms/list',
      teachersList: '/admin/teachers/list',
    },

    // Bulk Operations
    bulk: {
      suspendUsers: '/admin/users/bulk/suspend',
      deleteUsers: '/admin/users/bulk/delete',
      updateRole: '/admin/users/bulk/update-role',
    },

    // Activity Logs (P1: Centralized 2025-12-28)
    activity: '/admin/activity',

    // Error Management (P1: Centralized 2025-12-28)
    errors: {
      list: '/admin/errors',
      resolve: (errorId: string) => `/admin/errors/${errorId}/resolve`,
    },

    // Assignments Export (P1: Centralized 2025-12-28)
    assignments: {
      export: '/admin/assignments/export',
    },

    // Feature Flags (P1: Centralized 2025-12-28)
    featureFlags: {
      list: '/admin/feature-flags',
      get: (key: string) => `/admin/feature-flags/${key}`,
      create: '/admin/feature-flags',
      update: (key: string) => `/admin/feature-flags/${key}`,
      delete: (key: string) => `/admin/feature-flags/${key}`,
    },

    // Metrics shorthand (P1: Centralized 2025-12-28)
    metrics: '/admin/metrics',

    // Alert Actions (P1: Centralized 2025-12-28)
    alertActions: {
      suppress: (alertId: string) => `/admin/alerts/${alertId}/suppress`,
    },

    // Logs shorthand (P1: Centralized 2025-12-28)
    logs: '/admin/logs',
  },

  /**
   * Teacher endpoints
   */
  teacher: {
    // Dashboard (nested structure for teacherApi.ts compatibility)
    dashboard: {
      stats: '/teacher/dashboard/stats',
      activities: '/teacher/dashboard/activities',
      alerts: '/teacher/dashboard/alerts',
      topPerformers: '/teacher/dashboard/top-performers',
      moduleProgress: '/teacher/dashboard/module-progress',
    },

    // Classrooms
    classrooms: '/teacher/classrooms',
    classroom: (id: string) => `/teacher/classrooms/${id}`,
    classroomTeachers: (classroomId: string) => `/teacher/classrooms/${classroomId}/teachers`,
    classroomStudents: (classroomId: string) => `/teacher/classrooms/${classroomId}/students`,
    classroomStats: (classroomId: string) => `/teacher/classrooms/${classroomId}/stats`,
    createClassroom: '/teacher/classrooms',
    updateClassroom: (id: string) => `/teacher/classrooms/${id}`,
    deleteClassroom: (id: string) => `/teacher/classrooms/${id}`,

    // Assignments
    assignments: '/teacher/assignments',
    assignment: (assignmentId: string) => `/teacher/assignments/${assignmentId}`,
    createAssignment: '/teacher/assignments',
    updateAssignment: (assignmentId: string) => `/teacher/assignments/${assignmentId}`,
    deleteAssignment: (assignmentId: string) => `/teacher/assignments/${assignmentId}`,
    assignmentSubmissions: (assignmentId: string) =>
      `/teacher/assignments/${assignmentId}/submissions`,
    submission: (submissionId: string) => `/teacher/submissions/${submissionId}`,
    gradeSubmission: (submissionId: string) => `/teacher/submissions/${submissionId}/feedback`,
    sendReminder: (assignmentId: string) => `/teacher/assignments/${assignmentId}/send-reminder`,
    upcomingAssignments: '/teacher/assignments/upcoming',

    // Analytics
    analytics: '/teacher/analytics',
    engagementMetrics: '/teacher/analytics/engagement',
    economyAnalytics: '/teacher/analytics/economy', // GAP-ST-005
    studentsEconomy: '/teacher/analytics/students-economy', // GAP-ST-006
    achievementsStats: '/teacher/analytics/achievements', // GAP-ST-007
    generateReport: '/teacher/reports/generate',
    reportStatus: (reportId: string) => `/teacher/reports/${reportId}/status`,
    studentInsights: (studentId: string) => `/teacher/students/${studentId}/insights`,

    // Grades & Reports
    grades: '/teacher/grades',
    reports: {
      list: '/teacher/reports',
      recent: '/teacher/reports/recent',
      stats: '/teacher/reports/stats',
      download: (reportId: string) => `/teacher/reports/${reportId}/download`,
      generate: '/teacher/reports/generate',
      delete: (reportId: string) => `/teacher/reports/${reportId}`, // TASK-2026-01-18-015 Sprint 4.2

      // Scheduled Reports
      scheduled: {
        list: '/teacher/reports/scheduled',
        create: '/teacher/reports/scheduled',
        get: (id: string) => `/teacher/reports/scheduled/${id}`,
        update: (id: string) => `/teacher/reports/scheduled/${id}`,
        delete: (id: string) => `/teacher/reports/scheduled/${id}`,
        pause: (id: string) => `/teacher/reports/scheduled/${id}/pause`,
        resume: (id: string) => `/teacher/reports/scheduled/${id}/resume`,
      },

      // Shared Reports
      shared: {
        share: '/teacher/reports/share',
        byMe: '/teacher/reports/shared/by-me',
        withMe: '/teacher/reports/shared/with-me',
        view: (shareId: string) => `/teacher/reports/shared/${shareId}/view`,
        revoke: (shareId: string) => `/teacher/reports/shared/${shareId}`,
        updatePermission: (shareId: string) => `/teacher/reports/shared/${shareId}/permission`,
      },
    },

    // Communications
    communications: '/teacher/communications',
    sendCommunication: '/teacher/communications',

    // Messages (P1-002: Centralized 2025-12-28)
    messages: {
      list: '/teacher/messages',
      get: (messageId: string) => `/teacher/messages/${messageId}`,
      send: '/teacher/messages',
      classroomAnnouncement: (classroomId: string) =>
        `/teacher/messages/classroom/${classroomId}/announcement`,
      privateFeedback: (studentId: string) => `/teacher/messages/student/${studentId}/feedback`,
      markAsRead: (messageId: string) => `/teacher/messages/${messageId}/read`,
      conversations: '/teacher/messages/conversations',
      unreadCount: '/teacher/messages/unread-count',
    },

    // Alerts
    alerts: {
      list: '/teacher/alerts',
      byClassroom: (classroomId: string) => `/teacher/alerts?classroomId=${classroomId}`,
      get: (alertId: string) => `/teacher/alerts/${alertId}`,
      acknowledge: (alertId: string) => `/teacher/alerts/${alertId}/acknowledge`,
      resolve: (alertId: string) => `/teacher/alerts/${alertId}/resolve`,
      dismiss: (alertId: string) => `/teacher/alerts/${alertId}/dismiss`,
      studentHistory: (studentId: string) => `/teacher/alerts/student/${studentId}/history`,
      generate: '/teacher/alerts/generate',
    },

    // Content Management
    content: {
      list: '/teacher/content',
      get: (contentId: string) => `/teacher/content/${contentId}`,
      create: '/teacher/content',
      update: (contentId: string) => `/teacher/content/${contentId}`,
      delete: (contentId: string) => `/teacher/content/${contentId}`,
      clone: (contentId: string) => `/teacher/content/${contentId}/clone`,
      publish: (contentId: string) => `/teacher/content/${contentId}/publish`,
    },

    // Manual Review (for modules 4 and 5)
    reviews: {
      pending: '/teacher/reviews/pending',
      pendingByModule: (moduleOrder: number) => `/teacher/reviews/pending/module/${moduleOrder}`,
      // TASK-2026-01-18-012: Endpoint para obtener reviews del profesor actual con filtro de status
      myReviews: '/teacher/reviews/my-reviews',
      stats: '/teacher/reviews/stats', // TASK-2026-01-25: GAP-API-001 resolved
      get: (id: string) => `/teacher/reviews/${id}`,
      create: '/teacher/reviews', // TASK-2026-01-25: GAP-API-001 resolved
      start: (reviewId: string) => `/teacher/reviews/${reviewId}/start`,
      update: (id: string) => `/teacher/reviews/${id}`,
      complete: (id: string) => `/teacher/reviews/${id}/complete`,
      return: (id: string) => `/teacher/reviews/${id}/return`, // TASK-2026-01-25: GAP-API-001 resolved
      // TASK-2026-01-18-009: Endpoint para obtener config de ejercicios (reemplaza hardcoded data)
      config: '/teacher/reviews/config/exercises',
    },

    // Student Progress (P1-05: Centralized endpoints)
    studentsProgress: {
      base: '/teacher/students',
      progress: (studentId: string) => `/teacher/students/${studentId}/progress`,
      overview: (studentId: string) => `/teacher/students/${studentId}/overview`,
      stats: (studentId: string) => `/teacher/students/${studentId}/stats`,
      notes: (studentId: string) => `/teacher/students/${studentId}/notes`,
      addNote: (studentId: string) => `/teacher/students/${studentId}/note`,
    },

    // Submissions & Grading (P1-05: Centralized endpoints)
    submissions: {
      list: '/teacher/submissions',
      get: (submissionId: string) => `/teacher/submissions/${submissionId}`,
      feedback: (submissionId: string) => `/teacher/submissions/${submissionId}/feedback`,
      bulkGrade: '/teacher/submissions/bulk-grade',
    },

    // Exercise Attempts/Responses (P1-05: Centralized endpoints)
    attempts: {
      list: '/teacher/attempts',
      get: (attemptId: string) => `/teacher/attempts/${attemptId}`,
      byStudent: (studentId: string) => `/teacher/attempts/student/${studentId}`,
      exerciseResponses: (exerciseId: string) => `/teacher/exercises/${exerciseId}/responses`,
    },

    // Economy Config (P1-03: Uses admin gamification endpoint)
    economyConfig: '/admin/gamification/settings',
  },

  /**
   * Educational Media endpoints
   */
  media: {
    upload: '/educational/media/upload',
    get: (id: string) => `/educational/media/${id}`,
    delete: (id: string) => `/educational/media/${id}`,
    validate: '/educational/media/validate',
  },

  /**
   * Ranks API endpoints
   *
   * NOTA: Hay dos formas de obtener rango:
   * - /gamification/ranks/current - Usa JWT, retorna UserRank entity
   * - /gamification/users/:userId/rank - Recibe userId, retorna objeto simplificado
   *
   * El dashboard usa ranks/current y rank-progress.
   * El gamificationApi.getUserRank usa users/:userId/rank.
   */
  ranks: {
    current: '/gamification/ranks/current',
    rankProgress: (userId: string) => `/gamification/ranks/users/${userId}/progress`,
    // FIX GAP-SP-001: Corregida ruta para alinearse con user-stats.controller.ts
    // Backend: GET /api/v1/gamification/users/:userId/rank (user-stats.controller.ts:177)
    userRank: (userId: string) => `/gamification/users/${userId}/rank`,
    promote: (userId: string) => `/gamification/ranks/users/${userId}/promote`,
    history: (userId: string) => `/gamification/ranks/users/${userId}/history`,
    multipliers: (userId: string) => `/gamification/ranks/users/${userId}/multipliers`,
  },

  // NOTE: Streaks namespace removed — no dedicated /gamification/streaks endpoint.
  // Streak data is included in user_stats via gamification.userStats(userId).

  /**
   * Leaderboard position endpoints (P1: Centralized 2025-12-28)
   */
  leaderboardPosition: {
    user: '/gamification/leaderboards/user-rank',
  },

  /**
   * Achievements API endpoints
   */
  achievements: {
    list: '/gamification/achievements',
    get: (achievementId: string) => `/gamification/achievements/${achievementId}`,
    unlockSpecific: (achievementId: string) => `/gamification/achievements/${achievementId}/unlock`,
    updateProgress: (achievementId: string) =>
      `/gamification/achievements/${achievementId}/progress`,
    stats: '/gamification/achievements/stats',
  },

  /**
   * Powerups (Comodines) API endpoints
   * ARCH-015: Aligned with backend comodines.controller.ts routes
   */
  powerups: {
    list: '/gamification/comodines',
    purchase: '/gamification/comodines/purchase',
    use: '/gamification/comodines/use',
    inventory: (userId: string) => `/gamification/comodines/users/${userId}/inventory`,
    history: (userId: string) => `/gamification/comodines/users/${userId}/history`,
    stats: (userId: string) => `/gamification/comodines/users/${userId}/stats`,
  },

  /**
   * Leaderboards API endpoints
   */
  leaderboards: {
    byTypeAndPeriod: (type: string, period: string) =>
      `/gamification/leaderboards/${type}/${period}`,
    userRank: '/gamification/leaderboards/user-rank',
    xp: '/gamification/leaderboards/xp',
    coins: '/gamification/leaderboards/coins',
    streaks: '/gamification/leaderboards/streaks',
    globalView: '/gamification/leaderboards/global',
    myRank: (type: string) => `/gamification/leaderboards/${type}/my-rank`,
    classroom: (classroomId: string) => `/gamification/leaderboard/classrooms/${classroomId}`,
  },

  /**
   * Guilds API endpoints
   */
  guilds: {
    list: '/guilds',
    get: (guildId: string) => `/guilds/${guildId}`,
    create: '/guilds',
    join: (guildId: string) => `/guilds/${guildId}/join`,
    leave: (guildId: string) => `/guilds/${guildId}/leave`,
    members: (guildId: string) => `/guilds/${guildId}/members`,
    updateMemberRole: (guildId: string, memberId: string) =>
      `/guilds/${guildId}/members/${memberId}/role`,
    challenges: (guildId: string) => `/guilds/${guildId}/challenges`,
  },

  /**
   * Friends API endpoints (friends.controller.ts at /friends)
   */
  friends: {
    list: '/friends',
    request: '/friends/request',
    requests: '/friends/requests',
    accept: (requestId: string) => `/friends/requests/${requestId}/accept`,
    decline: (requestId: string) => `/friends/requests/${requestId}/decline`,
    remove: (userId: string) => `/friends/${userId}`,
    recommendations: '/friends/recommendations',
    activities: '/friends/activities',
  },

  /**
   * Mechanics API endpoints
   * MOCK ONLY — no backend /mechanics controller exists.
   * Real exercise data uses /educational/exercises endpoints.
   * All consumers use FEATURE_FLAGS.USE_MOCK_DATA fallback.
   */
  mechanics: {
    list: '/mechanics',
    get: (mechanicId: string) => `/mechanics/${mechanicId}`,
    progress: '/mechanics/progress',
    hints: (mechanicId: string) => `/mechanics/${mechanicId}/hints`,
    scoring: '/mechanics/scoring',
    validate: '/mechanics/validate',
  },

  /**
   * AI Service endpoints
   * MOCK ONLY — no backend /ai controller exists.
   * All consumers check FEATURE_FLAGS.USE_MOCK_DATA || !FEATURE_FLAGS.ENABLE_AI.
   */
  ai: {
    analyzeText: '/ai/analyze-text',
    generateResponse: '/ai/generate-response',
    checkFact: '/ai/check-fact',
    validateHypothesis: '/ai/validate-hypothesis',
    improveReading: '/ai/improve-reading',
    getSuggestions: '/ai/suggestions',
  },

  /**
   * Users endpoints (general)
   */
  users: {
    list: '/users',
    get: (userId: string) => `/users/${userId}`,
    create: '/users',
    update: (userId: string) => `/users/${userId}`,
    delete: (userId: string) => `/users/${userId}`,
  },

  // NOTE: Student namespace removed — no backend /student controller exists.
  // Student features use /educational, /progress, /gamification endpoints.

  /**
   * Health check (health.controller.ts)
   */
  health: {
    check: '/health',
    live: '/health/live',
    ready: '/health/ready',
    metrics: '/health/metrics',
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Construye URL completa para un endpoint
 * @param path - Ruta relativa (puede ser string o función)
 * @returns URL completa
 */
export function buildApiUrl(path: string | ((...args: any[]) => string), ...args: any[]): string {
  const relativePath = typeof path === 'function' ? path(...args) : path;
  return `${API_BASE_URL}${relativePath}`;
}

/**
 * Construye WebSocket URL
 * @param path - Ruta relativa para WebSocket
 * @returns WebSocket URL completa
 */
export function buildWsUrl(path: string = ''): string {
  return `${WS_BASE_URL}${path}`;
}

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURE_FLAGS = {
  USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  MOCK_API: import.meta.env.VITE_MOCK_API === 'true',
  ENABLE_WEBSOCKET: import.meta.env.VITE_ENABLE_WEBSOCKET !== 'false',
  DEBUG_API: import.meta.env.VITE_DEBUG_API === 'true',
  ENABLE_AI: import.meta.env.VITE_ENABLE_AI !== 'false',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_GAMIFICATION: import.meta.env.VITE_ENABLE_GAMIFICATION === 'true',
  ENABLE_SOCIAL_FEATURES: import.meta.env.VITE_ENABLE_SOCIAL_FEATURES === 'true',
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  // ISS-FE-003: Feature flag centralizado para páginas en construcción
  SHOW_UNDER_CONSTRUCTION: import.meta.env.VITE_SHOW_UNDER_CONSTRUCTION === 'true',
} as const;

// ============================================================================
// HTTP STATUS CODES
// ============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================================================
// VALIDATION & LOGGING
// ============================================================================

if (import.meta.env.MODE === 'development') {
  console.log('[API Config] Configuration loaded:', {
    baseURL: API_BASE_URL,
    wsURL: WS_BASE_URL,
    version: API_VERSION,
    host: API_HOST,
    protocol: API_PROTOCOL,
  });
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  API_CONFIG,
  API_ENDPOINTS,
  FEATURE_FLAGS,
  HTTP_STATUS,
  buildApiUrl,
  buildWsUrl,
};
