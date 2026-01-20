/**
 * ENUMs Constants - Shared (Frontend)
 *
 * @description ENUMs compartidos entre Backend y Frontend.
 * @usage import { AuthProviderEnum, DifficultyLevelEnum } from '@/shared/constants';
 *
 * IMPORTANTE:
 * - Sincronizado automáticamente a Frontend por sync-enums.ts
 * - Representa ENUMs de PostgreSQL DDL
 *
 * @see /docs/03-desarrollo/CONSTANTS-ARCHITECTURE.md
 */

/**
 * Auth Management ENUMs
 */

/**
 * Proveedores de autenticación OAuth/Social
 * @see DDL: auth_management.auth_providers (auth_provider ENUM)
 */
export enum AuthProviderEnum {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
  MICROSOFT = 'microsoft',
  GITHUB = 'github',
}

/**
 * Niveles de suscripción de tenant
 * @see DDL: auth_management.tenants.subscription_tier
 */
export enum SubscriptionTierEnum {
  FREE = 'free',
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

/**
 * Estados de cuenta de usuario
 * @see DDL: auth_management.user_status ENUM
 * @version 1.1 (2025-11-08) - Agregado 'banned' para alineación con BD
 */
export enum UserStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BANNED = 'banned',      // v1.1: NUEVO - Usuario baneado permanentemente
  PENDING = 'pending',
}

/**
 * Severidad de eventos de seguridad
 * @see DDL: auth_management.security_events.severity
 */
export enum SecurityEventSeverityEnum {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Temas visuales de la aplicación
 * @see DDL: auth_management.user_preferences.theme
 */
export enum ThemeEnum {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
}

/**
 * Idiomas soportados
 * @see DDL: auth_management.user_preferences.language
 */
export enum LanguageEnum {
  ES = 'es',
  EN = 'en',
}

/**
 * Tipos de dispositivos
 * @see DDL: auth_management.user_sessions.device_type
 */
export enum DeviceTypeEnum {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
  UNKNOWN = 'unknown',  // v1.1: Alineado con DDL user_sessions (2025-11-26)
}

/**
 * Roles en memberships (multi-tenant)
 * @see DDL: auth_management.memberships.role
 */
export enum MembershipRoleEnum {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  GUEST = 'guest',
}

/**
 * Estados de memberships
 * @see DDL: auth_management.memberships.status
 */
export enum MembershipStatusEnum {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  REVOKED = 'revoked',
}

/**
 * Gamification ENUMs
 */

/**
 * Niveles de dificultad CEFR para ejercicios y contenido educativo
 * @see DDL: educational_content.difficulty_level ENUM
 * @see Docs: docs/01-fase-alcance-inicial/EAI-002-actividades/especificaciones/ET-EDU-002-niveles-dificultad.md
 * @version 2.0 (2025-11-11) - Migrado a estándar CEFR internacional
 *
 * IMPORTANTE:
 * - Este enum está sincronizado con el ENUM de PostgreSQL en educational_content schema
 * - Total: 8 niveles de dificultad basados en CEFR (Common European Framework of Reference)
 * - Usado en: modules, exercises, content_templates, marie_curie_content
 *
 * ESCALA DE DIFICULTAD CEFR (menor a mayor):
 * 1. BEGINNER (A1) ⭐ - Nivel básico de supervivencia (10-50 palabras)
 * 2. ELEMENTARY (A2) ⭐⭐ - Nivel elemental (50-150 palabras)
 * 3. PRE_INTERMEDIATE (B1) ⭐⭐ - Pre-intermedio (150-400 palabras)
 * 4. INTERMEDIATE (B2) ⭐⭐⭐ - Intermedio (400-800 palabras)
 * 5. UPPER_INTERMEDIATE (C1) ⭐⭐⭐⭐ - Intermedio avanzado (800-1500 palabras)
 * 6. ADVANCED (C2) ⭐⭐⭐⭐ - Avanzado (1500-3000 palabras)
 * 7. PROFICIENT (C2+) ⭐⭐⭐⭐⭐ - Competente (3000+ palabras)
 * 8. NATIVE ⭐⭐⭐⭐⭐ - Nativo, dominio total del idioma
 */
export enum DifficultyLevelEnum {
  BEGINNER = 'beginner',              // A1
  ELEMENTARY = 'elementary',          // A2
  PRE_INTERMEDIATE = 'pre_intermediate', // B1
  INTERMEDIATE = 'intermediate',      // B2
  UPPER_INTERMEDIATE = 'upper_intermediate', // C1
  ADVANCED = 'advanced',              // C2
  PROFICIENT = 'proficient',          // C2+
  NATIVE = 'native',                  // Nativo
}

/**
 * Rangos jerárquicos mayas del sistema de gamificación (Title Case)
 * @see DDL: maya_rank ENUM (gamification_system/enums/maya_rank.sql)
 * @see Docs: /docs/02-especificaciones-tecnicas/apis/gamificacion-api/01-RANGOS-MAYA.md
 * @note Progresión: Ajaw (inicial) → Nacom → Ah K'in → Halach Uinic → K'uk'ulkan (máximo)
 * @version 1.0 (2025-11-03) - Homologación de rangos legacy a correctos
 */
export enum MayaRank {
  AJAW = 'Ajaw',                    // Nivel 1: Señor (0-499 XP) - @see ranks.constants.ts v2.0
  NACOM = 'Nacom',                  // Nivel 2: Capitan de guerra (500-999 XP)
  AH_KIN = 'Ah K\'in',              // Nivel 3: Sacerdote del sol (1,000-1,499 XP)
  HALACH_UINIC = 'Halach Uinic',    // Nivel 4: Hombre verdadero (1,500-2,249 XP)
  KUKULKAN = 'K\'uk\'ulkan',        // Nivel 5: Serpiente emplumada (2,250+ XP)
}

/**
 * Tipos de comodines (power-ups) para ayuda en ejercicios
 * @see DDL: gamification_system.comodin_type ENUM
 * @see Docs: docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md
 * @version 1.0 (2025-11-08) - Migrado de public a gamification_system
 *
 * IMPORTANTE:
 * - Este enum está sincronizado con el ENUM de PostgreSQL en gamification_system schema
 * - Total: 3 tipos de comodines (power-ups)
 * - Usado como ARRAY type en exercises.comodines_allowed
 *
 * VALORES Y PRECIOS:
 * - pistas: Pistas Contextuales (15 ML Coins)
 * - vision_lectora: Visión Lectora (25 ML Coins)
 * - segunda_oportunidad: Segunda Oportunidad (40 ML Coins)
 */
export enum ComodinTypeEnum {
  PISTAS = 'pistas',
  VISION_LECTORA = 'vision_lectora',
  SEGUNDA_OPORTUNIDAD = 'segunda_oportunidad',
}

/**
 * Categorías de items de la tienda (Shop)
 * @see DDL: gamification_system.shop_items.category ENUM
 * @version 1.0 (2025-11-29) - Sistema de Shop
 *
 * IMPORTANTE:
 * - Este enum está sincronizado con el ENUM de PostgreSQL en gamification_system schema
 * - Total: 5 categorías de items disponibles en la tienda
 * - Usado en shop_items.category
 *
 * CATEGORÍAS:
 * - cosmetics: Items cosméticos (avatares, marcos, efectos visuales)
 * - profile: Items para personalización de perfil
 * - guild: Items relacionados con guilds/equipos
 * - social: Items sociales (emotes, stickers)
 * - consumable: Items consumibles (boosts temporales, comodines)
 */
export enum ShopItemCategoryEnum {
  COSMETICS = 'cosmetics',
  PROFILE = 'profile',
  GUILD = 'guild',
  SOCIAL = 'social',
  CONSUMABLE = 'consumable',
}

/**
 * Tipos de transacciones de ML Coins
 * @see DDL: gamification_system.transaction_type ENUM
 * @see Docs: docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md:216-230
 * @version 2.0 (2025-11-08) - Sincronizado con documentación oficial
 *
 * IMPORTANTE:
 * - Este enum está sincronizado con el ENUM de PostgreSQL en gamification_system schema
 * - Total: 14 tipos de transacciones
 * - Categorías: 7 earned (ingresos), 3 spent (gastos), 4 admin/sistema
 *
 * Cambios de v1.0 a v2.0:
 * - Eliminados valores legacy: EARNED_DAILY_BONUS, EARNED_RANK_PROMOTION, SPENT_UNLOCK_CONTENT, SPENT_CUSTOMIZATION, GIFT
 * - Agregados: EARNED_MODULE, EARNED_STREAK, EARNED_DAILY, EARNED_BONUS, SPENT_POWERUP, SPENT_RETRY, BONUS, WELCOME_BONUS
 * - Renombrados para consistencia: earned_daily_bonus → EARNED_DAILY, earned_rank_promotion → EARNED_RANK
 */
export enum TransactionTypeEnum {
  // ========== EARNED (Ingresos - 7 tipos) ==========
  EARNED_EXERCISE = 'earned_exercise',        // +5-50 coins por ejercicio
  EARNED_MODULE = 'earned_module',            // +100-300 coins por módulo
  EARNED_ACHIEVEMENT = 'earned_achievement',  // +50-500 coins por logro
  EARNED_RANK = 'earned_rank',                // +100-1000 coins por rango
  EARNED_STREAK = 'earned_streak',            // +10-100 coins por racha
  EARNED_DAILY = 'earned_daily',              // +50 coins por login diario
  EARNED_BONUS = 'earned_bonus',              // Bonus especial por eventos

  // ========== SPENT (Gastos - 3 tipos) ==========
  SPENT_POWERUP = 'spent_powerup',            // -15 a -40 coins por comodín
  SPENT_HINT = 'spent_hint',                  // -10 coins por pista
  SPENT_RETRY = 'spent_retry',                // -20 coins por reintento

  // ========== ADMIN/SISTEMA (4 tipos) ==========
  ADMIN_ADJUSTMENT = 'admin_adjustment',      // Ajuste manual (+ o -)
  REFUND = 'refund',                          // Devolución de coins
  BONUS = 'bonus',                            // Bonus general del sistema
  WELCOME_BONUS = 'welcome_bonus',            // +100 coins al registrarse
}

/**
 * Categorías de logros (achievements)
 * @see DDL: gamification_system.achievement_category ENUM
 * @version 1.1 (2025-12-15) - Agregados 'collection' y 'hidden' para alineación con Frontend
 */
export enum AchievementCategoryEnum {
  PROGRESS = 'progress',
  STREAK = 'streak',
  COMPLETION = 'completion',
  SOCIAL = 'social',
  SPECIAL = 'special',
  MASTERY = 'mastery',
  EXPLORATION = 'exploration',
  COLLECTION = 'collection',  // v1.1: Logros de colección
  HIDDEN = 'hidden',          // v1.1: Logros ocultos/secretos
}

/**
 * Tipos de logros
 * @see DDL: achievement_type ENUM
 */
export enum AchievementTypeEnum {
  BADGE = 'badge',
  MILESTONE = 'milestone',
  SPECIAL = 'special',
  RANK_PROMOTION = 'rank_promotion',
}

/**
 * Tipos de mensajes del sistema de comunicación Teacher-Student
 * @context Teacher Portal - Communication feature
 * @version 1.0
 * @synchronized-with frontend/services/api/teacher/teacherMessagesApi.ts
 */
export enum MessageTypeEnum {
  /** Mensaje directo entre profesor y estudiante */
  DIRECT = 'direct',
  /** Anuncio a toda el aula */
  CLASSROOM_ANNOUNCEMENT = 'classroom_announcement',
  /** Chat grupal del aula */
  CLASSROOM_CHAT = 'classroom_chat',
  /** Feedback privado sobre desempeño */
  PRIVATE_FEEDBACK = 'private_feedback',
  /** Comentario en una asignación */
  ASSIGNMENT_COMMENT = 'assignment_comment',
}

/**
 * Tipos de notificaciones del sistema
 * @see DDL: gamification_system.notification_type ENUM
 * @see Docs: docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-NOTIFICATIONS.md
 * @version 2.0 (2025-11-07) - Alineado con documentación oficial
 *
 * IMPORTANTE:
 * - Este enum está sincronizado con el ENUM de PostgreSQL
 * - Total: 11 tipos de notificaciones
 * - Cambios de v1.0 a v2.0:
 *   * Eliminado: REMINDER (no en especificación oficial)
 *   * Renombrado: TEAM_INVITE → GUILD_INVITATION (terminología oficial)
 *   * Agregados: LEVEL_UP, MESSAGE_RECEIVED, ML_COINS_EARNED, STREAK_MILESTONE, EXERCISE_FEEDBACK
 *
 * NOTA: Este enum reemplaza las múltiples definiciones previas de NotificationType
 * y debe ser la ÚNICA fuente de verdad para tipos de notificación en backend.
 */
export enum NotificationTypeEnum {
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  RANK_UP = 'rank_up',
  FRIEND_REQUEST = 'friend_request',
  GUILD_INVITATION = 'guild_invitation',      // v2.0: Renombrado de TEAM_INVITE
  MISSION_COMPLETED = 'mission_completed',
  LEVEL_UP = 'level_up',                      // v2.0: NUEVO
  MESSAGE_RECEIVED = 'message_received',      // v2.0: NUEVO
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  ML_COINS_EARNED = 'ml_coins_earned',       // v2.0: NUEVO
  STREAK_MILESTONE = 'streak_milestone',      // v2.0: NUEVO
  EXERCISE_FEEDBACK = 'exercise_feedback',    // v2.0: NUEVO
}

/**
 * Prioridad de notificaciones (urgencia de visualización)
 * @see DDL: gamification_system.notification_priority ENUM
 * @see Docs: docs/02-especificaciones-tecnicas/trazabilidad/05-realtime-notifications.md:240
 * @version 1.1 (2025-11-08) - Agregado 'critical' para alineación con BD
 *
 * IMPORTANTE:
 * - Este enum está sincronizado con el ENUM de PostgreSQL
 * - Total: 4 niveles de prioridad
 * - Valor por defecto en BD: 'medium'
 */
export enum NotificationPriorityEnum {
  LOW = 'low',          // Prioridad baja: Notificaciones informativas, sin urgencia
  MEDIUM = 'medium',    // Prioridad media: Notificaciones estándar (DEFAULT)
  HIGH = 'high',        // Prioridad alta: Notificaciones urgentes que requieren atención inmediata
  CRITICAL = 'critical', // v1.1: NUEVO - Prioridad crítica: Alertas del sistema, emergencias
}

/**
 * Tipo derivado del enum para uso en TypeScript
 */
export type NotificationType = `${NotificationTypeEnum}`;

/**
 * Estructura de datos adicionales de notificación
 */
export interface NotificationData {
  missionId?: string;
  achievementId?: string;
  rewardType?: string;
  amount?: number;
  action?: {
    type: string;
    url: string;
  };
  [key: string]: any;
}

/**
 * Array de todos los tipos de notificación (útil para validaciones)
 */
export const NOTIFICATION_TYPES = Object.values(NotificationTypeEnum);

/**
 * Categorización de notificaciones por prioridad
 * Útil para determinar urgencia de entrega y visualización automáticamente según el tipo
 * @version 2.1 (2025-11-08) - Agregado nivel CRITICAL
 */
export const NOTIFICATION_PRIORITY_BY_TYPE = {
  [NotificationPriorityEnum.CRITICAL]: [
    NotificationTypeEnum.SYSTEM_ANNOUNCEMENT,  // Mensajes críticos del sistema
  ],
  [NotificationPriorityEnum.HIGH]: [
    NotificationTypeEnum.MESSAGE_RECEIVED,
    NotificationTypeEnum.RANK_UP,
  ],
  [NotificationPriorityEnum.MEDIUM]: [
    NotificationTypeEnum.ACHIEVEMENT_UNLOCKED,
    NotificationTypeEnum.MISSION_COMPLETED,
    NotificationTypeEnum.GUILD_INVITATION,
    NotificationTypeEnum.FRIEND_REQUEST,
  ],
  [NotificationPriorityEnum.LOW]: [
    NotificationTypeEnum.LEVEL_UP,
    NotificationTypeEnum.ML_COINS_EARNED,
    NotificationTypeEnum.STREAK_MILESTONE,
    NotificationTypeEnum.EXERCISE_FEEDBACK,
  ],
} as const;

/**
 * Mapeo de tipos de notificación a íconos sugeridos
 * Útil para UI consistency
 */
export const NOTIFICATION_ICONS = {
  [NotificationTypeEnum.ACHIEVEMENT_UNLOCKED]: '🏆',
  [NotificationTypeEnum.RANK_UP]: '⬆️',
  [NotificationTypeEnum.FRIEND_REQUEST]: '👥',
  [NotificationTypeEnum.GUILD_INVITATION]: '🏰',
  [NotificationTypeEnum.MISSION_COMPLETED]: '✅',
  [NotificationTypeEnum.LEVEL_UP]: '🆙',
  [NotificationTypeEnum.MESSAGE_RECEIVED]: '💬',
  [NotificationTypeEnum.SYSTEM_ANNOUNCEMENT]: '📢',
  [NotificationTypeEnum.ML_COINS_EARNED]: '🪙',
  [NotificationTypeEnum.STREAK_MILESTONE]: '🔥',
  [NotificationTypeEnum.EXERCISE_FEEDBACK]: '📝',
} as const;

/**
 * Educational Content ENUMs
 */

/**
 * Estados del ciclo de vida del contenido
 * @see DDL: content_management.content_status ENUM
 * @version 1.1 (2025-11-08) - Cambiado 'reviewing' a 'under_review' para alineación con BD
 */
export enum ContentStatusEnum {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  UNDER_REVIEW = 'under_review',  // v1.1: RENOMBRADO de 'reviewing'
}

/**
 * Tipos de contenido educativo
 * @see DDL: content_management.content_type ENUM
 */
export enum ContentTypeEnum {
  VIDEO = 'video',
  TEXT = 'text',
  INTERACTIVE = 'interactive',
  QUIZ = 'quiz',
  GAME = 'game',
  SIMULATION = 'simulation',
}

/**
 * Tipos de archivos multimedia
 * @see DDL: media_type ENUM
 */
export enum MediaTypeEnum {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  INTERACTIVE = 'interactive',
  ANIMATION = 'animation',
}

/**
 * Estados de procesamiento de archivos multimedia
 * @see DDL: processing_status ENUM
 */
export enum ProcessingStatusEnum {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  READY = 'ready',
  ERROR = 'error',
  OPTIMIZING = 'optimizing',
}

/**
 * Tipos de ejercicios (33 mecánicas diferentes)
 * @see DDL: apps/database/ddl/schemas/educational_content/enums/exercise_type.sql
 * @note Module 1: Comprensión Literal (5 mecánicas)
 * @note Module 2: Comprensión Inferencial (5 mecánicas)
 * @note Module 3: Comprensión Crítica (5 mecánicas)
 * @note Module 4: Lectura Digital (9 mecánicas)
 * @note Module 5: Producción Lectora (3 mecánicas)
 * @note Auxiliares (6 mecánicas)
 * @version 1.1 (2025-11-11) - Removidas 2 mecánicas huérfanas sin implementación (diario_interactivo, resumen_visual)
 * @version 1.0 - Sincronizado con DDL educational_content.exercise_type
 */
export enum ExerciseTypeEnum {
  // Module 1: Comprensión Literal
  CRUCIGRAMA = 'crucigrama',
  LINEA_TIEMPO = 'linea_tiempo',
  SOPA_LETRAS = 'sopa_letras',
  MAPA_CONCEPTUAL = 'mapa_conceptual',
  EMPAREJAMIENTO = 'emparejamiento',

  // Module 2: Comprensión Inferencial
  DETECTIVE_TEXTUAL = 'detective_textual',
  CONSTRUCCION_HIPOTESIS = 'construccion_hipotesis',
  PREDICCION_NARRATIVA = 'prediccion_narrativa',
  PUZZLE_CONTEXTO = 'puzzle_contexto',
  RUEDA_INFERENCIAS = 'rueda_inferencias',

  // Module 3: Comprensión Crítica
  TRIBUNAL_OPINIONES = 'tribunal_opiniones',
  DEBATE_DIGITAL = 'debate_digital',
  ANALISIS_FUENTES = 'analisis_fuentes',
  PODCAST_ARGUMENTATIVO = 'podcast_argumentativo',
  MATRIZ_PERSPECTIVAS = 'matriz_perspectivas',

  // Module 4: Lectura Digital (9 mecánicas)
  // UPDATED 2025-11-07: Agregadas 4 mecánicas faltantes
  VERIFICADOR_FAKE_NEWS = 'verificador_fake_news',
  INFOGRAFIA_INTERACTIVA = 'infografia_interactiva',
  QUIZ_TIKTOK = 'quiz_tiktok',
  NAVEGACION_HIPERTEXTUAL = 'navegacion_hipertextual',
  ANALISIS_MEMES = 'analisis_memes',
  RESENA_CRITICA = 'resena_critica',
  CHAT_LITERARIO = 'chat_literario',
  EMAIL_FORMAL = 'email_formal',
  ENSAYO_ARGUMENTATIVO = 'ensayo_argumentativo',

  // Module 5: Producción Lectora
  DIARIO_MULTIMEDIA = 'diario_multimedia',
  COMIC_DIGITAL = 'comic_digital',
  VIDEO_CARTA = 'video_carta',

  // Auxiliares (6 mecánicas)
  // UPDATED 2025-11-11: Reducido de 8 a 6 mecánicas
  COMPRENSION_AUDITIVA = 'comprension_auditiva',
  COLLAGE_PRENSA = 'collage_prensa',
  TEXTO_MOVIMIENTO = 'texto_movimiento',
  CALL_TO_ACTION = 'call_to_action',
  VERDADERO_FALSO = 'verdadero_falso',
  COMPLETAR_ESPACIOS = 'completar_espacios',
  // REMOVIDO 2025-11-11: DIARIO_INTERACTIVO, RESUMEN_VISUAL (mecánicas huérfanas sin implementación)
}

/**
 * Progress Tracking ENUMs
 */

/**
 * Estados de progreso para módulos y ejercicios
 * @see DDL: progress_tracking.progress_status ENUM
 * @version 1.2 (2025-11-11) - Agregado 'abandoned' para sincronización con DDL
 * @version 1.1 (2025-11-08) - Cambiado 'reviewed' a 'needs_review' para alineación con BD
 *
 * FLUJO DE ESTADOS:
 * 1. NOT_STARTED → Sin iniciar (estado inicial)
 * 2. IN_PROGRESS → En progreso (0% < progreso < 100%)
 * 3. COMPLETED → Completado (100%, cumple requisitos mínimos)
 * 4. NEEDS_REVIEW → Requiere revisión (pendiente de revisión por docente)
 * 5. MASTERED → Dominado (nivel de excelencia/maestría)
 * 6. ABANDONED → Abandonado (estudiante dejó sin completar, tracking futuro)
 *
 * TRANSICIONES:
 * - Normal: not_started → in_progress → completed → needs_review → mastered
 * - Autoestudio: not_started → in_progress → completed → mastered
 * - Reintento: completed → in_progress → completed
 * - Abandono: in_progress → abandoned
 */
export enum ProgressStatusEnum {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  NEEDS_REVIEW = 'needs_review',  // v1.1: RENOMBRADO de 'reviewed'
  MASTERED = 'mastered',
  ABANDONED = 'abandoned',  // v1.2: AGREGADO para sincronización con DDL
}

/**
 * Resultados de intentos de ejercicio
 * @see DDL: progress_tracking.attempt_result ENUM
 */
export enum AttemptResultEnum {
  CORRECT = 'correct',
  INCORRECT = 'incorrect',
  PARTIAL = 'partial',
  SKIPPED = 'skipped',
}

/**
 * Social Features ENUMs
 */

/**
 * Estados de amistad entre usuarios
 * @see DDL: social_features.friendships.status
 */
export enum FriendshipStatusEnum {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  BLOCKED = 'blocked',
}

/**
 * Estados de membresía en aulas
 * @see DDL: social_features.classroom_members.status
 */
export enum ClassroomMemberStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  WITHDRAWN = 'withdrawn',
  COMPLETED = 'completed',
}

/**
 * Métodos de inscripción en aulas
 * @see DDL: social_features.classroom_members.enrollment_method
 */
export enum EnrollmentMethodEnum {
  TEACHER_INVITE = 'teacher_invite',
  SELF_ENROLL = 'self_enroll',
  ADMIN_ADD = 'admin_add',
  BULK_IMPORT = 'bulk_import',
}

/**
 * Roles en equipos
 * @see DDL: social_features.team_members.role
 */
export enum TeamMemberRoleEnum {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

/**
 * Estados de desafíos entre equipos
 * @see DDL: social_features.team_challenges.status
 */
export enum TeamChallengeStatusEnum {
  ACTIVE = 'active',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * Tipos de reportes de profesores
 * FIX-2026-01-19: Agregado para coherencia con CHECK constraint
 * @see DDL: social_features.teacher_reports.report_type
 */
export enum TeacherReportTypeEnum {
  INDIVIDUAL = 'individual',
  CLASSROOM = 'classroom',
  PROGRESS = 'progress',
  ANALYTICS = 'analytics',
}

/**
 * Formatos de exportación de reportes
 * FIX-2026-01-19: Agregado para coherencia con CHECK constraint
 * @see DDL: social_features.teacher_reports.report_format
 */
export enum TeacherReportFormatEnum {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
}

// REMOVIDO (2026-01-07): SocialEventTypeEnum
// Razon: ENUM deprecado, sin uso en BD/Backend/Frontend
// Ver: DEUDA-TECNICA-ENUMS-H-034.md

/**
 * System ENUMs
 */

/**
 * Roles principales del sistema Gamilit
 * @see DDL: gamilit_role ENUM
 */
export enum GamilityRoleEnum {
  STUDENT = 'student',
  ADMIN_TEACHER = 'admin_teacher',
  SUPER_ADMIN = 'super_admin',
}

/**
 * Claves de permisos válidas del sistema
 * @see AdminRolesService.getAvailablePermissions()
 * @version 1.0 (FIX-2025-01-07) - Creado para validación de permisos en UpdatePermissionsDto
 *
 * CATEGORÍAS:
 * - content: Gestión de contenido educativo
 * - users: Gestión de usuarios
 * - organizations: Gestión de organizaciones/tenants
 * - system: Configuración del sistema
 * - reports: Generación y visualización de reportes
 * - gamification: Sistema de gamificación
 * - analytics: Visualización de analíticas
 * - admin: Acceso y gestión del panel de administración
 */
export enum PermissionKeyEnum {
  // Content permissions
  CAN_CREATE_CONTENT = 'can_create_content',
  CAN_EDIT_CONTENT = 'can_edit_content',
  CAN_DELETE_CONTENT = 'can_delete_content',
  CAN_APPROVE_CONTENT = 'can_approve_content',

  // User management permissions
  CAN_CREATE_USERS = 'can_create_users',
  CAN_EDIT_USERS = 'can_edit_users',
  CAN_DELETE_USERS = 'can_delete_users',
  CAN_SUSPEND_USERS = 'can_suspend_users',

  // Organization permissions
  CAN_MANAGE_ORGANIZATIONS = 'can_manage_organizations',

  // System permissions
  CAN_MANAGE_SETTINGS = 'can_manage_settings',

  // Reports permissions
  CAN_VIEW_REPORTS = 'can_view_reports',
  CAN_GENERATE_REPORTS = 'can_generate_reports',

  // Gamification permissions
  CAN_MANAGE_GAMIFICATION = 'can_manage_gamification',

  // Analytics permissions
  CAN_VIEW_ANALYTICS = 'can_view_analytics',

  // Admin permissions
  CAN_ACCESS_ADMIN_PANEL = 'can_access_admin_panel',
  CAN_MANAGE_ROLES = 'can_manage_roles',
}

/**
 * Array de todas las claves de permisos válidas
 * @see PermissionKeyEnum
 * @usage Útil para validaciones en DTOs
 */
export const VALID_PERMISSION_KEYS = Object.values(PermissionKeyEnum);

/**
 * Niveles de severidad de alertas
 * @see DDL: alert_severity ENUM
 */
export enum AlertSeverityEnum {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Períodos de agregación para métricas
 * @see DDL: audit_logging.aggregation_period ENUM
 */
export enum AggregationPeriodEnum {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

/**
 * Tipos de métricas
 * @see DDL: audit_logging.metric_type ENUM
 */
export enum MetricTypeEnum {
  ENGAGEMENT = 'engagement',
  PERFORMANCE = 'performance',
  COMPLETION = 'completion',
  TIME_SPENT = 'time_spent',
  ACCURACY = 'accuracy',
  STREAK = 'streak',
  SOCIAL_INTERACTION = 'social_interaction',
}

/**
 * Helper: Validar que valor pertenece a enum
 *
 * @example
 * isValidEnumValue(DifficultyLevelEnum, 'beginner') => true
 * isValidEnumValue(DifficultyLevelEnum, 'invalid') => false
 */
export const isValidEnumValue = <T extends Record<string, string>>(
  enumObj: T,
  value: string,
): value is T[keyof T] => {
  return Object.values(enumObj).includes(value);
};

/**
 * Helper: Obtener todos los valores de un enum como array
 *
 * @example
 * getEnumValues(DifficultyLevelEnum) => ['beginner', 'intermediate', 'advanced', ...]
 */
export const getEnumValues = <T extends Record<string, string>>(enumObj: T): string[] => {
  return Object.values(enumObj);
};

/**
 * Helper: Obtener todas las claves de un enum como array
 *
 * @example
 * getEnumKeys(DifficultyLevelEnum) => ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', ...]
 */
export const getEnumKeys = <T extends Record<string, string>>(enumObj: T): string[] => {
  return Object.keys(enumObj);
};
