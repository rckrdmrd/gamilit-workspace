/**
 * Database Constants - Single Source of Truth
 *
 * @description Nombres de esquemas y tablas PostgreSQL centralizados.
 * @usage import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants';
 *
 * IMPORTANTE:
 * - NO hardcodear nombres de schemas/tablas en código
 * - SIEMPRE importar desde aquí
 * - Mantener sincronizado con DDL en /apps/database/
 *
 * @see /docs/03-desarrollo/CONSTANTS-ARCHITECTURE.md
 */

/**
 * Database Schemas
 */
export const DB_SCHEMAS = {
  AUTH: 'auth_management',
  GAMIFICATION: 'gamification_system',
  EDUCATIONAL: 'educational_content',
  PROGRESS: 'progress_tracking',
  SOCIAL: 'social_features',
  CONTENT: 'content_management',
  AUDIT: 'audit_logging',
  NOTIFICATIONS: 'notifications', // ✨ NUEVO - EXT-003 (Sistema Multi-Canal de Notificaciones)
  GAMILIT: 'gamilit',
  PUBLIC: 'public',
  ADMIN_DASHBOARD: 'admin_dashboard',
  SYSTEM_CONFIGURATION: 'system_configuration',
  LTI_INTEGRATION: 'lti_integration',
  STORAGE: 'storage',
  AUTH_BASE: 'auth', // Schema base de autenticación (diferente de auth_management)
  COMMUNICATION: 'communication', // ✨ NUEVO - Audit 2026-01-04 (Mensajería docente)
} as const;

/**
 * Database Tables por Schema
 * IMPORTANTE: Mapear TODAS las tablas de cada esquema migrado
 */
export const DB_TABLES = {
  /**
   * Auth Management Schema
   * Tablas de autenticación, usuarios, roles y seguridad
   */
  AUTH: {
    TENANTS: 'tenants',
    USERS: 'users',
    PROFILES: 'profiles',
    USER_ROLES: 'user_roles',
    ROLES: 'roles', // ✨ NUEVO - P0 CRÍTICO (RBAC)
    MEMBERSHIPS: 'memberships',
    AUTH_PROVIDERS: 'auth_providers',
    AUTH_ATTEMPTS: 'auth_attempts',
    USER_SESSIONS: 'user_sessions',
    EMAIL_VERIFICATION_TOKENS: 'email_verification_tokens',
    PASSWORD_RESET_TOKENS: 'password_reset_tokens',
    SECURITY_EVENTS: 'security_events',
    USER_PREFERENCES: 'user_preferences',
    USER_SUSPENSIONS: 'user_suspensions', // ✨ NUEVO - P0
    TWO_FACTOR_TOKENS: 'two_factor_tokens', // ✨ NUEVO - GAP-P0-001 (2FA)
    // ⚠️ PARENT PORTAL TABLES - FUTURE (Extension EXT-010, v1.3, P2)
    // ⚠️ NOT IN CURRENT SCOPE - Alcance actual: teacher, student, admin portals ONLY
    PARENT_ACCOUNTS: 'parent_accounts', // 🔮 FUTURE - Extension EXT-010
    PARENT_STUDENT_LINKS: 'parent_student_links', // 🔮 FUTURE - Extension EXT-010
    PARENT_NOTIFICATIONS: 'parent_notifications', // 🔮 FUTURE - Extension EXT-010
  },

  /**
   * Gamification System Schema
   * Tablas de gamificación, logros, misiones y comodines
   */
  GAMIFICATION: {
    USER_STATS: 'user_stats',
    USER_RANKS: 'user_ranks',
    ACHIEVEMENTS: 'achievements',
    USER_ACHIEVEMENTS: 'user_achievements',
    ML_COINS_TRANSACTIONS: 'ml_coins_transactions',
    MISSIONS: 'missions',
    MISSION_TEMPLATES: 'mission_templates', // ✨ NUEVO - MISSION-003/004 (Sistema de Templates)
    COMODINES_INVENTORY: 'comodines_inventory',
    NOTIFICATIONS: 'notifications',
    LEADERBOARD_METADATA: 'leaderboard_metadata',
    ACHIEVEMENT_CATEGORIES: 'achievement_categories',
    ACTIVE_BOOSTS: 'active_boosts',
    INVENTORY_TRANSACTIONS: 'inventory_transactions',
    MAYA_RANKS: 'maya_ranks', // ✨ NUEVO - P1 (Rankings Maya)
    COMODIN_USAGE_LOG: 'comodin_usage_log', // ✨ NUEVO - P1 (Tracking comodines)
    COMODIN_USAGE_TRACKING: 'comodin_usage_tracking', // ✨ NUEVO - P1 (Tracking comodines)
    SHOP_CATEGORIES: 'shop_categories', // ✨ NUEVO - P1 (Sistema de Shop)
    SHOP_ITEMS: 'shop_items', // ✨ NUEVO - P1 (Sistema de Shop)
    USER_PURCHASES: 'user_purchases', // ✨ NUEVO - P1 (Sistema de Shop)
    CLASSROOM_MISSIONS: 'classroom_missions', // ✨ NUEVO - Audit 2026-01-04 (Misiones de aula)
  },

  /**
   * Educational Content Schema
   * Tablas de módulos, ejercicios y recursos educativos
   */
  EDUCATIONAL: {
    MODULES: 'modules',
    EXERCISES: 'exercises',
    ASSESSMENT_RUBRICS: 'assessment_rubrics',
    MEDIA_RESOURCES: 'media_resources',
    MEDIA_ATTACHMENTS: 'media_attachments', // ✨ NUEVO - MOD-04/05 (Archivos multimedia de ejercicios creativos)
    ASSIGNMENTS: 'assignments',
    ASSIGNMENT_EXERCISES: 'assignment_exercises',
    ASSIGNMENT_STUDENTS: 'assignment_students',
    ASSIGNMENT_SUBMISSIONS: 'assignment_submissions',
    CONTENT_METADATA: 'content_metadata',
    MODULE_DEPENDENCIES: 'module_dependencies',
    TAXONOMIES: 'taxonomies',
    CONTENT_TAGS: 'content_tags',
    CONTENT_APPROVALS: 'content_approvals',
    EXERCISE_MECHANIC_MAPPING: 'exercise_mechanic_mapping', // ✨ NUEVO - DB-113 (Sistema Dual - ADR-008)
    DIFFICULTY_CRITERIA: 'difficulty_criteria', // ✨ NUEVO - P1-001 (Criterios de dificultad CEFR)
    CLASSROOM_MODULES: 'classroom_modules', // ✨ NUEVO - P1-002 (Módulos asignados a aulas)
    TEACHER_CONTENT: 'teacher_content', // ✨ NUEVO - Audit 2026-01-04 (Contenido docente)
    EXERCISE_VALIDATION_CONFIG: 'exercise_validation_config', // ✨ NUEVO - 2026-01-14 (Sistema Dual ADR-008)
    EXERCISE_TYPE_RUBRICS: 'exercise_type_rubrics', // ✨ NUEVO - 2026-01-14 (Rúbricas por tipo M4-M5)
    EXERCISE_VALIDATION_AUDIT: 'exercise_validation_audit', // ✨ NUEVO - 2026-01-14 (Auditoría de validaciones)
    // REMOVED: exercise_options, exercise_answers (legacy dual model - moved to JSONB puro)
  },

  /**
   * Progress Tracking Schema
   * Tablas de seguimiento de progreso y sesiones de aprendizaje
   */
  PROGRESS: {
    MODULE_PROGRESS: 'module_progress',
    LEARNING_SESSIONS: 'learning_sessions',
    EXERCISE_ATTEMPTS: 'exercise_attempts',
    EXERCISE_SUBMISSIONS: 'exercise_submissions',
    SCHEDULED_MISSIONS: 'scheduled_missions',
    TEACHER_NOTES: 'teacher_notes', // ✨ NUEVO - P0 (Notas del profesor)
    MANUAL_REVIEWS: 'manual_reviews', // ✨ NUEVO - MOD-04/05 (Evaluaciones manuales)
    ENGAGEMENT_METRICS: 'engagement_metrics', // ✨ NUEVO - P2
    LEARNING_PATHS: 'learning_paths', // ✨ NUEVO - P2
    MASTERY_TRACKING: 'mastery_tracking', // ✨ NUEVO - P2
    MODULE_COMPLETION_TRACKING: 'module_completion_tracking', // ✨ NUEVO - P2
    PROGRESS_SNAPSHOTS: 'progress_snapshots', // ✨ NUEVO - P2
    SKILL_ASSESSMENTS: 'skill_assessments', // ✨ NUEVO - P2
    USER_LEARNING_PATHS: 'user_learning_paths', // ✨ NUEVO - P2
    TEACHER_INTERVENTIONS: 'teacher_interventions', // ✨ NUEVO - P1-002 (Intervenciones docentes)
    STUDENT_INTERVENTION_ALERTS: 'student_intervention_alerts', // ✨ NUEVO - P1-002 (Alertas de intervención)
    CERTIFICATES: 'certificates', // ✨ NUEVO - EPIC 10.2 (Certificados digitales)
    TEACHER_ALERT_CONFIGURATIONS: 'teacher_alert_configurations', // ✨ NUEVO - US-PM-007 (Config alertas profesor)
  },

  /**
   * Social Features Schema
   * Tablas de interacciones sociales, escuelas, aulas y equipos
   */
  SOCIAL: {
    FRIENDSHIPS: 'friendships',
    SCHOOLS: 'schools',
    CLASSROOMS: 'classrooms',
    CLASSROOM_MEMBERS: 'classroom_members',
    TEAMS: 'teams',
    TEAM_MEMBERS: 'team_members',
    TEAM_CHALLENGES: 'team_challenges',
    ASSIGNMENT_CLASSROOMS: 'assignment_classrooms',
    PEER_CHALLENGES: 'peer_challenges', // ✨ NUEVO - P1 (Desafíos entre pares)
    CHALLENGE_PARTICIPANTS: 'challenge_participants', // ✨ NUEVO - P1
    CHALLENGE_RESULTS: 'challenge_results', // ✨ NUEVO - P1
    DISCUSSION_THREADS: 'discussion_threads', // ✨ NUEVO - P2
    SOCIAL_INTERACTIONS: 'social_interactions', // ✨ NUEVO - P2
    TEACHER_CLASSROOMS: 'teacher_classrooms', // ✨ NUEVO - P2
    USER_FOLLOWS: 'user_follows', // ✨ NUEVO - P2
    USER_ACTIVITIES: 'user_activities', // ✨ NUEVO - P2 (Activity Feed)
    FRIEND_REQUESTS: 'friend_requests', // ✨ NUEVO - DB-157 (Solicitudes de amistad)
    TEACHER_REPORTS: 'teacher_reports', // ✨ NUEVO - Audit 2026-01-04 (Reportes docentes)
    SCHEDULED_REPORTS: 'scheduled_reports', // ✨ NUEVO - TASK-2026-01-18-015 Sprint 5 (Reportes programados)
    SHARED_REPORTS: 'shared_reports', // ✨ NUEVO - TASK-2026-01-18-015 Sprint 5 (Reportes compartidos)
  },

  /**
   * Content Management Schema
   * Tablas de plantillas de contenido y archivos multimedia
   */
  CONTENT: {
    CONTENT_TEMPLATES: 'content_templates',
    MARIE_CURIE_CONTENT: 'marie_curie_content',
    MEDIA_FILES: 'media_files',
    CONTENT_AUTHORS: 'content_authors', // ✨ NUEVO - P2
    CONTENT_CATEGORIES: 'content_categories', // ✨ NUEVO - P2
    CONTENT_VERSIONS: 'content_versions', // ✨ NUEVO - P2
    FLAGGED_CONTENT: 'flagged_content', // ✨ NUEVO - P2
    MEDIA_METADATA: 'media_metadata', // ✨ NUEVO - P2
    TAGS: 'tags', // ✨ NUEVO - 2026-01-14 (Categorización de contenido)
    MODERATION_RULES: 'moderation_rules', // ✨ NUEVO - 2026-01-14 (Reglas de moderación automática)
  },

  /**
   * Audit Logging Schema
   * Tablas de auditoría y logs del sistema
   */
  AUDIT: {
    AUDIT_LOGS: 'audit_logs', // ✨ NUEVO - P2
    SYSTEM_LOGS: 'system_logs', // ✨ NUEVO - P2
    USER_ACTIVITY_LOGS: 'user_activity_logs', // ✨ NUEVO - P2
    PERFORMANCE_METRICS: 'performance_metrics', // ✨ NUEVO - P2
    SYSTEM_ALERTS: 'system_alerts', // ✨ NUEVO - P2
    ACTIVITY_LOG: 'activity_log', // ✨ Admin Dashboard activity tracking
    PENDING_USER_INITIALIZATION: 'pending_user_initialization', // ✨ NUEVO - 2026-01-14 (Control de inicialización fallida)
    // USER_ACTIVITY: ELIMINADO 2026-01-07 - Migrado completamente a ACTIVITY_LOG
  },

  /**
   * Notifications Schema (Multi-Canal)
   * Sistema completo de notificaciones multi-canal (EXT-003)
   * Incluye notificaciones, preferencias, logs, templates, cola y dispositivos
   */
  NOTIFICATIONS: {
    NOTIFICATIONS: 'notifications', // ✨ NUEVO - EXT-003 (Notificaciones multi-canal)
    NOTIFICATION_PREFERENCES: 'notification_preferences', // ✨ NUEVO - EXT-003 (Preferencias por canal)
    NOTIFICATION_LOGS: 'notification_logs', // ✨ NUEVO - EXT-003 (Registro de envíos)
    NOTIFICATION_TEMPLATES: 'notification_templates', // ✨ NUEVO - EXT-003 (Plantillas reutilizables)
    NOTIFICATION_QUEUE: 'notification_queue', // ✨ NUEVO - EXT-003 (Cola de envíos)
    USER_DEVICES: 'user_devices', // ✨ NUEVO - EXT-003 (Dispositivos para push)
  },

  /**
   * Admin Dashboard Schema
   * Tablas para operaciones administrativas y reportes
   */
  ADMIN: {
    BULK_OPERATIONS: 'bulk_operations', // ✨ NUEVO - EXT-002 (Bulk Operations)
    ADMIN_REPORTS: 'admin_reports', // ✨ NUEVO - EXT-002 (Admin Reports)
    METRICS_HISTORY: 'metrics_history', // ✨ NUEVO - P2 (Historial de métricas del sistema)
  },

  /**
   * System Configuration Schema
   * Configuración dinámica del sistema
   */
  SYSTEM: {
    SYSTEM_SETTINGS: 'system_settings', // ✨ NUEVO - P1 CRÍTICO
    FEATURE_FLAGS: 'feature_flags', // ✨ NUEVO - P1 CRÍTICO
    NOTIFICATION_SETTINGS: 'notification_settings', // ✨ NUEVO - P1
    RATE_LIMITS: 'rate_limits', // ✨ NUEVO - AUDIT-003 (Rate Limiting)
    NOTIFICATION_SETTINGS_GLOBAL: 'notification_settings_global', // ✨ NUEVO - AUDIT-003 (Config Global Notificaciones)
    API_CONFIGURATION: 'api_configuration', // ✨ NUEVO - P2
    ENVIRONMENT_CONFIG: 'environment_config', // ✨ NUEVO - P2
    TENANT_CONFIGURATIONS: 'tenant_configurations', // ✨ NUEVO - P2
    GAMIFICATION_PARAMETERS: 'gamification_parameters', // ✨ NUEVO - P1-002 (Parámetros de gamificación)
  },

  /**
   * LTI Integration Schema
   * Learning Tools Interoperability para integración con LMS externos
   */
  LTI: {
    LTI_CONSUMERS: 'lti_consumers', // ✨ NUEVO - P3
    LTI_SESSIONS: 'lti_sessions', // ✨ NUEVO - P3
    LTI_GRADE_PASSBACK: 'lti_grade_passback', // ✨ NUEVO - P3
  },

  /**
   * Auth Base Schema
   * Tabla base de usuarios para autenticación (diferente de auth_management)
   */
  AUTH_BASE: {
    USERS: 'users', // ✨ NUEVO - P0
  },

  /**
   * Communication Schema
   * Mensajería interna entre docentes, estudiantes y padres
   * ✨ NUEVO - Audit 2026-01-04
   */
  COMMUNICATION: {
    MESSAGES: 'messages', // Mensajes de la plataforma
    MESSAGE_PARTICIPANTS: 'message_participants', // Participantes de conversaciones
  },

  /**
   * Gamilit Schema (público)
   * Funciones y utilidades compartidas
   */
  GAMILIT: {},
} as const;

/**
 * Helper: Construir nombre completo (schema.table)
 *
 * @example
 * const fullName = getFullTableName(DB_SCHEMAS.AUTH, DB_TABLES.AUTH.TENANTS);
 * // Result: "auth_management.tenants"
 */
export const getFullTableName = (schema: string, table: string): string => {
  return `${schema}.${table}`;
};

/**
 * Type Helpers (Type-Safe)
 */
export type DbSchema = (typeof DB_SCHEMAS)[keyof typeof DB_SCHEMAS];
export type AuthTable = (typeof DB_TABLES.AUTH)[keyof typeof DB_TABLES.AUTH];
export type GamificationTable =
  (typeof DB_TABLES.GAMIFICATION)[keyof typeof DB_TABLES.GAMIFICATION];
export type EducationalTable =
  (typeof DB_TABLES.EDUCATIONAL)[keyof typeof DB_TABLES.EDUCATIONAL];
export type ProgressTable =
  (typeof DB_TABLES.PROGRESS)[keyof typeof DB_TABLES.PROGRESS];
export type SocialTable = (typeof DB_TABLES.SOCIAL)[keyof typeof DB_TABLES.SOCIAL];
export type ContentTable =
  (typeof DB_TABLES.CONTENT)[keyof typeof DB_TABLES.CONTENT];
export type AuditTable = (typeof DB_TABLES.AUDIT)[keyof typeof DB_TABLES.AUDIT]; // ✨ NUEVO
export type NotificationsTable =
  (typeof DB_TABLES.NOTIFICATIONS)[keyof typeof DB_TABLES.NOTIFICATIONS]; // ✨ NUEVO - EXT-003
export type AdminTable = (typeof DB_TABLES.ADMIN)[keyof typeof DB_TABLES.ADMIN]; // ✨ NUEVO - EXT-002
export type SystemTable = (typeof DB_TABLES.SYSTEM)[keyof typeof DB_TABLES.SYSTEM]; // ✨ NUEVO
export type LTITable = (typeof DB_TABLES.LTI)[keyof typeof DB_TABLES.LTI]; // ✨ NUEVO
export type AuthBaseTable =
  (typeof DB_TABLES.AUTH_BASE)[keyof typeof DB_TABLES.AUTH_BASE]; // ✨ NUEVO
export type CommunicationTable =
  (typeof DB_TABLES.COMMUNICATION)[keyof typeof DB_TABLES.COMMUNICATION]; // ✨ NUEVO - Audit 2026-01-04

/**
 * Validación: Verificar que tabla existe en schema
 *
 * @throws Error si la tabla no existe en el schema
 */
export const validateTableInSchema = (schema: DbSchema, table: string): boolean => {
  const schemaKey = Object.keys(DB_SCHEMAS).find(
    (key) => DB_SCHEMAS[key as keyof typeof DB_SCHEMAS] === schema,
  );

  if (!schemaKey) {
    throw new Error(`Schema "${schema}" no existe en DB_SCHEMAS`);
  }

  const tables = DB_TABLES[schemaKey as keyof typeof DB_TABLES];
  const tableExists = Object.values(tables).includes(table as never);

  if (!tableExists) {
    throw new Error(`Tabla "${table}" no existe en schema "${schema}"`);
  }

  return true;
};
