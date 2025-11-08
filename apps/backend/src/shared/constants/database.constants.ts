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
  GAMILIT: 'gamilit',
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
    MEMBERSHIPS: 'memberships',
    AUTH_PROVIDERS: 'auth_providers',
    AUTH_ATTEMPTS: 'auth_attempts',
    USER_SESSIONS: 'user_sessions',
    EMAIL_VERIFICATION_TOKENS: 'email_verification_tokens',
    PASSWORD_RESET_TOKENS: 'password_reset_tokens',
    SECURITY_EVENTS: 'security_events',
    USER_PREFERENCES: 'user_preferences',
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
    COMODINES_INVENTORY: 'comodines_inventory',
    NOTIFICATIONS: 'notifications',
    LEADERBOARD_METADATA: 'leaderboard_metadata',
    ACHIEVEMENT_CATEGORIES: 'achievement_categories',
    ACTIVE_BOOSTS: 'active_boosts',
    INVENTORY_TRANSACTIONS: 'inventory_transactions',
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
  },

  /**
   * Content Management Schema
   * Tablas de plantillas de contenido y archivos multimedia
   */
  CONTENT: {
    CONTENT_TEMPLATES: 'content_templates',
    MARIE_CURIE_CONTENT: 'marie_curie_content',
    MEDIA_FILES: 'media_files',
  },

  /**
   * Audit Logging Schema
   * Tablas de auditoría y logs (no migradas aún)
   */
  AUDIT: {},

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
