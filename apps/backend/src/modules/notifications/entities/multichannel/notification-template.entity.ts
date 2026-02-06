import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';

/**
 * NotificationTemplate Entity
 *
 * Mapea a la tabla: notifications.notification_templates
 *
 * @description Plantillas reutilizables para notificaciones multi-canal
 * @source orchestration/database/DB-115/HANDOFF-TO-BACKEND.md
 * @version 2.0 (2026-02-03) - Advanced Templates Enhancement
 *
 * IMPORTANTE:
 * - Plantillas con Handlebars (lógica condicional, loops, helpers)
 * - Soporte para subject, body y HTML
 * - Variables definidas en JSONB array
 * - Canales por defecto configurables
 * - Internacionalización (es/en) via JSONB translations
 * - Versionado de templates para historial y rollback
 * - 8 templates de producción + 3 de testing cargados en seeds
 *
 * Características:
 * - template_key: Identificador único (ej: 'welcome_message', 'achievement_unlocked')
 * - subject_template: Asunto del mensaje (email)
 * - body_template: Cuerpo del mensaje (texto plano)
 * - html_template: Cuerpo HTML (email)
 * - variables: Array de variables requeridas (ej: ['user_name', 'achievement_name'])
 * - default_channels: Canales por defecto (['in_app', 'email', 'push'])
 * - is_active: Habilitar/deshabilitar template
 * - version: Número de versión del template
 * - previous_version_id: Referencia a versión anterior
 * - subject_translations: Traducciones del asunto (JSONB)
 * - body_translations: Traducciones del cuerpo (JSONB)
 * - html_translations: Traducciones del HTML (JSONB)
 *
 * Handlebars Syntax Supported:
 * - {{variable}} - Variable interpolation
 * - {{#if condition}}...{{/if}} - Conditionals
 * - {{#unless condition}}...{{/unless}} - Negative conditionals
 * - {{#each items}}{{this}}{{/each}} - Loops
 * - {{formatDate date "DD/MM/YYYY"}} - Date formatting
 * - {{pluralize count "item" "items"}} - Pluralization
 * - {{uppercase str}} / {{lowercase str}} - Case transformation
 * - {{currency amount "MXN"}} - Currency formatting
 *
 * Templates cargados en producción:
 * 1. welcome_email - Email de bienvenida
 * 2. new_assignment - Nueva asignación
 * 3. assignment_reminder - Recordatorio de tarea
 * 4. achievement_unlocked - Logro desbloqueado
 * 5. teacher_message - Mensaje del profesor
 * 6. team_invitation - Invitación a equipo
 * 7. exercise_feedback - Retroalimentación de ejercicio
 * 8. streak_milestone - Racha alcanzada
 */
@Entity({
  schema: DB_SCHEMAS.NOTIFICATIONS,
  name: DB_TABLES.NOTIFICATIONS.NOTIFICATION_TEMPLATES,
})
@Index(['templateKey', 'version'], { unique: true })
@Index(['isActive'])
@Index(['version'])
export class NotificationTemplate {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  /**
   * Identificador único del template
   *
   * Ejemplos: 'welcome_message', 'achievement_unlocked', 'rank_up'
   *
   * @unique
   */
  // FIX H-038: Removed column-level unique:true. DDL has ONLY composite unique (template_key, version).
  // Column-level unique blocks versioning (can't have same key with different versions).
  @Column({ name: 'template_key', type: 'varchar', length: 100 })
    templateKey!: string;

  /**
   * Nombre descriptivo del template
   */
  @Column({ type: 'varchar', length: 255 })
    name!: string;

  /**
   * Descripción del propósito del template
   */
  @Column({ type: 'text', nullable: true })
    description?: string;

  /**
   * Plantilla del asunto (para email)
   *
   * Soporta interpolación con {{variable_name}}
   *
   * Ejemplo: "¡Felicidades {{user_name}}! Has desbloqueado {{achievement_name}}"
   */
  // FIX H-024: DDL subject_template is nullable
  @Column({ name: 'subject_template', type: 'text', nullable: true })
    subjectTemplate?: string;

  /**
   * Plantilla del cuerpo (texto plano)
   *
   * Soporta interpolación con {{variable_name}}
   *
   * Ejemplo: "Hola {{user_name}}, has completado la misión {{mission_name}}..."
   */
  @Column({ name: 'body_template', type: 'text' })
    bodyTemplate!: string;

  /**
   * Plantilla del cuerpo HTML (para email)
   *
   * Soporta interpolación con {{variable_name}}
   * Puede incluir HTML completo con estilos inline
   *
   * @optional Si no se proporciona, se usa bodyTemplate
   */
  @Column({ name: 'html_template', type: 'text', nullable: true })
    htmlTemplate?: string;

  /**
   * Variables requeridas para renderizar el template
   *
   * Array de nombres de variables en JSONB
   *
   * Ejemplo: ["user_name", "achievement_name", "achievement_icon"]
   *
   * El sistema validará que todas las variables requeridas sean proporcionadas
   * antes de renderizar el template.
   */
  @Column({ type: 'jsonb', nullable: true })
    variables?: string[];

  /**
   * Canales por defecto para este template
   *
   * Array de canales: 'in_app' | 'email' | 'push'
   *
   * Ejemplo: ["in_app", "email"]
   *
   * IMPORTANTE: Los canales finales dependen de las preferencias del usuario
   * Este campo solo define los canales sugeridos
   */
  @Column({ name: 'default_channels', type: 'varchar', array: true })
    defaultChannels!: string[];

  /**
   * Indica si el template está activo
   *
   * Templates inactivos no pueden ser usados para enviar notificaciones
   * Útil para deshabilitar temporalmente sin eliminar
   */
  @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive!: boolean;

  // ========== VERSIONING (v2.0 - 2026-02-03) ==========

  /**
   * Número de versión del template
   *
   * Permite mantener historial de cambios y rollback
   * Cada modificación crea una nueva versión
   *
   * @default 1
   */
  @Column({ type: 'integer', default: 1 })
    version!: number;

  /**
   * UUID de la versión anterior
   *
   * Permite reconstruir el historial de cambios
   * NULL para la primera versión
   */
  @Column({ name: 'previous_version_id', type: 'uuid', nullable: true })
    previousVersionId?: string;

  // ========== I18N TRANSLATIONS (v2.0 - 2026-02-03) ==========

  /**
   * Traducciones del asunto por idioma
   *
   * JSONB con claves de locale y valores de template
   *
   * @example { "es": "¡Hola {{user_name}}!", "en": "Hello {{user_name}}!" }
   */
  @Column({ name: 'subject_translations', type: 'jsonb', nullable: true })
    subjectTranslations?: Record<string, string>;

  /**
   * Traducciones del cuerpo por idioma
   *
   * JSONB con claves de locale y valores de template
   *
   * @example { "es": "Bienvenido...", "en": "Welcome..." }
   */
  @Column({ name: 'body_translations', type: 'jsonb', nullable: true })
    bodyTranslations?: Record<string, string>;

  /**
   * Traducciones del HTML por idioma
   *
   * JSONB con claves de locale y valores de template HTML
   *
   * @example { "es": "<h1>Hola</h1>", "en": "<h1>Hello</h1>" }
   */
  @Column({ name: 'html_translations', type: 'jsonb', nullable: true })
    htmlTranslations?: Record<string, string>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt!: Date;
}
