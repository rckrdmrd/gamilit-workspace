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
    validateToken: '/auth/validate-token',
    resetPassword: '/auth/reset-password',
    changePassword: '/auth/change-password',
    verifyEmail: '/auth/verify-email',
    requestPasswordReset: '/auth/request-password-reset',
    getCurrentUser: '/auth/me',
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
   * Economy endpoints
   */
  economy: {
    balance: (userId: string) => `/economy/users/${userId}/balance`,
    transactions: (userId: string) => `/economy/users/${userId}/transactions`,
    shop: '/economy/shop',
    purchase: '/economy/purchase',
    earn: '/economy/earn',
    spend: '/economy/spend',
    shopItems: '/economy/shop/items',
    shopItem: (itemId: string) => `/economy/shop/items/${itemId}`,
    inventory: (userId: string) => `/economy/users/${userId}/inventory`,
    inventoryItem: (userId: string, itemId: string) =>
      `/economy/users/${userId}/inventory/${itemId}`,
  },

  /**
   * Social endpoints
   */
  social: {
    guilds: '/social/guilds',
    guild: (id: string) => `/social/guilds/${id}`,
    userGuilds: (userId: string) => `/social/users/${userId}/guilds`,
    friends: (userId: string) => `/social/users/${userId}/friends`,
    messages: (userId: string) => `/social/users/${userId}/messages`,
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
      mediaLibrary: '/admin/content/media-library',
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
    gamificationConfig: '/admin/gamification/config',
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

    // Backwards compatibility
    students: (classroomId: string) => `/teacher/classrooms/${classroomId}/students`,

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
    },

    // Communications
    communications: '/teacher/communications',
    sendCommunication: '/teacher/communications',

    // Alerts
    alerts: {
      list: '/teacher/alerts',
      byClassroom: (classroomId: string) => `/teacher/alerts?classroomId=${classroomId}`,
      get: (alertId: string) => `/teacher/alerts/${alertId}`,
      resolve: (alertId: string) => `/teacher/alerts/${alertId}/resolve`,
      dismiss: (alertId: string) => `/teacher/alerts/${alertId}/dismiss`,
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
  },

  /**
   * Ranks API endpoints
   */
  ranks: {
    current: '/gamification/ranks/current',
    rankProgress: (userId: string) => `/gamification/ranks/users/${userId}/progress`,
    promote: (userId: string) => `/gamification/ranks/users/${userId}/promote`,
    history: (userId: string) => `/gamification/ranks/users/${userId}/history`,
    multipliers: (userId: string) => `/gamification/ranks/users/${userId}/multipliers`,
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
   * Powerups API endpoints
   */
  powerups: {
    list: '/gamification/powerups',
    purchase: '/gamification/powerups/purchase',
    purchaseSpecific: (powerupId: string) => `/gamification/powerups/${powerupId}/purchase`,
    use: '/gamification/powerups/use',
    useSpecific: (powerupId: string) => `/gamification/powerups/${powerupId}/use`,
    inventory: '/gamification/powerups/inventory',
    active: '/gamification/powerups/active',
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
  },

  /**
   * Guilds API endpoints
   */
  guilds: {
    list: '/gamification/guilds',
    get: (guildId: string) => `/gamification/guilds/${guildId}`,
    create: '/gamification/guilds',
    join: (guildId: string) => `/gamification/guilds/${guildId}/join`,
    leave: (guildId: string) => `/gamification/guilds/${guildId}/leave`,
    members: (guildId: string) => `/gamification/guilds/${guildId}/members`,
    updateMemberRole: (guildId: string, memberId: string) =>
      `/gamification/guilds/${guildId}/members/${memberId}/role`,
    challenges: (guildId: string) => `/gamification/guilds/${guildId}/challenges`,
  },

  /**
   * Friends API endpoints
   */
  friends: {
    list: '/gamification/friends',
    request: '/gamification/friends/request',
    requests: '/gamification/friends/requests',
    accept: (requestId: string) => `/gamification/friends/requests/${requestId}/accept`,
    decline: (requestId: string) => `/gamification/friends/requests/${requestId}/decline`,
    remove: (userId: string) => `/gamification/friends/${userId}`,
    recommendations: '/gamification/friends/recommendations',
    activities: '/gamification/friends/activities',
  },

  /**
   * Mechanics API endpoints
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

  /**
   * Student endpoints
   */
  student: {
    dashboard: '/student/dashboard',
    profile: (userId: string) => `/student/users/${userId}/profile`,
    courses: '/student/courses',
    assignments: '/student/assignments',
    grades: '/student/grades',
  },

  /**
   * Health check
   */
  health: {
    check: '/health',
    status: '/health/status',
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
