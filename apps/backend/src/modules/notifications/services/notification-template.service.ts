import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Handlebars from 'handlebars';
import dayjs from 'dayjs';
import { NotificationTemplate } from '../entities/multichannel/notification-template.entity';

/**
 * NotificationTemplateService
 *
 * @description Gestión de plantillas de notificaciones multi-canal (EXT-003)
 * @version 2.0 (2026-02-03) - Advanced Templates Enhancement
 *
 * Responsabilidades:
 * - CRUD de templates
 * - Compilación de templates con Handlebars (lógica condicional, loops, helpers)
 * - Validación de variables requeridas
 * - Renderizado completo de templates (subject, body, HTML)
 *
 * Características v2.0:
 * - Handlebars como motor de templates
 * - Soporte para {{#if}}, {{#unless}}, {{#each}}
 * - Helpers personalizados: formatDate, pluralize, currency, etc.
 * - Retrocompatibilidad con interpolación básica {{variable}}
 * - Filtrado por is_active
 *
 * Sintaxis Handlebars soportada:
 * - {{variable}} - Interpolación de variables
 * - {{#if condition}}...{{/if}} - Condicionales
 * - {{#unless condition}}...{{/unless}} - Condicionales negativos
 * - {{#each items}}{{this}}{{/each}} - Loops
 * - {{formatDate date "DD/MM/YYYY"}} - Formateo de fechas
 * - {{pluralize count "item" "items"}} - Pluralización
 * - {{uppercase str}} - Transformación a mayúsculas
 *
 * Templates de producción (8 cargados en seeds):
 * 1. welcome_email - Email de bienvenida
 * 2. new_assignment - Nueva asignación
 * 3. assignment_reminder - Recordatorio de tarea
 * 4. achievement_unlocked - Logro desbloqueado
 * 5. teacher_message - Mensaje del profesor
 * 6. team_invitation - Invitación a equipo
 * 7. exercise_feedback - Retroalimentación de ejercicio
 * 8. streak_milestone - Racha alcanzada
 */
@Injectable()
export class NotificationTemplateService {
  constructor(
    @InjectRepository(NotificationTemplate, 'notifications')
    private readonly templateRepository: Repository<NotificationTemplate>,
  ) {
    this.registerHandlebarsHelpers();
  }

  /**
   * Register custom Handlebars helpers for template compilation
   *
   * These helpers are available in all templates:
   * - formatDate: Format dates
   * - pluralize: Choose singular/plural
   * - uppercase/lowercase: Case transformation
   * - currency: Format as currency
   * - eq, gt, lt: Comparisons
   */
  private registerHandlebarsHelpers(): void {
    // Date formatting
    Handlebars.registerHelper('formatDate', (date: string | Date, format?: string) => {
      if (!date) return '';
      const dateFormat = typeof format === 'string' ? format : 'DD/MM/YYYY';
      return dayjs(date).format(dateFormat);
    });

    // Pluralize
    Handlebars.registerHelper(
      'pluralize',
      (count: number, singular: string, plural: string) => {
        if (typeof count !== 'number') return singular;
        return count === 1 ? singular : plural;
      },
    );

    // String manipulation
    Handlebars.registerHelper('uppercase', (str: string) =>
      typeof str === 'string' ? str.toUpperCase() : '',
    );
    Handlebars.registerHelper('lowercase', (str: string) =>
      typeof str === 'string' ? str.toLowerCase() : '',
    );

    // Currency formatting
    Handlebars.registerHelper('currency', (amount: number, currencyCode?: string) => {
      if (typeof amount !== 'number') return '';
      const code = typeof currencyCode === 'string' ? currencyCode : 'MXN';
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: code,
      }).format(amount);
    });

    // Comparisons
    Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);
    Handlebars.registerHelper('gt', (a: number, b: number) => a > b);
    Handlebars.registerHelper('lt', (a: number, b: number) => a < b);

    // Default value
    Handlebars.registerHelper('default', (value: unknown, defaultValue: unknown) =>
      value !== undefined && value !== null && value !== '' ? value : defaultValue,
    );
  }

  /**
   * Obtener template por key
   *
   * @param templateKey - Identificador único del template (ej: 'welcome_message')
   * @returns Template encontrado
   * @throws NotFoundException si el template no existe o está inactivo
   *
   * @example
   * const template = await this.templateService.findByKey('achievement_unlocked');
   */
  async findByKey(templateKey: string): Promise<NotificationTemplate> {
    const template = await this.templateRepository.findOne({
      where: { templateKey, isActive: true },
    });

    if (!template) {
      throw new NotFoundException(
        `Template with key '${templateKey}' not found or is inactive`,
      );
    }

    return template;
  }

  /**
   * Obtener todos los templates
   *
   * @param filters - Filtros opcionales
   * @param filters.isActive - Filtrar por estado activo (default: solo activos)
   * @param filters.search - Buscar en name o description
   * @returns Lista de templates
   *
   * @example
   * const templates = await this.templateService.findAll({ isActive: true });
   */
  async findAll(filters?: {
    isActive?: boolean;
    search?: string;
  }): Promise<NotificationTemplate[]> {
    const query = this.templateRepository.createQueryBuilder('template');

    // Filtro por isActive (default: solo activos)
    if (filters?.isActive !== undefined) {
      query.andWhere('template.isActive = :isActive', { isActive: filters.isActive });
    } else {
      query.andWhere('template.isActive = true');
    }

    // Búsqueda en name o description
    if (filters?.search) {
      query.andWhere(
        '(template.name ILIKE :search OR template.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    query.orderBy('template.name', 'ASC');

    return query.getMany();
  }

  /**
   * Validar que todas las variables requeridas estén presentes
   *
   * @param requiredVariables - Array de nombres de variables requeridas
   * @param providedVariables - Objeto con variables proporcionadas
   * @throws BadRequestException si falta alguna variable requerida
   *
   * @example
   * this.validateVariables(
   *   ['user_name', 'achievement_name'],
   *   { user_name: 'Juan', achievement_name: 'Maestro' }
   * ); // OK
   *
   * this.validateVariables(
   *   ['user_name', 'achievement_name'],
   *   { user_name: 'Juan' }
   * ); // Throws: Missing variables: achievement_name
   */
  validateVariables(
    requiredVariables: string[],
    providedVariables: Record<string, string>,
  ): void {
    if (!requiredVariables || requiredVariables.length === 0) {
      return; // No hay variables requeridas
    }

    const missingVariables = requiredVariables.filter(
      (variable) => !(variable in providedVariables),
    );

    if (missingVariables.length > 0) {
      throw new BadRequestException(
        `Missing required variables: ${missingVariables.join(', ')}`,
      );
    }

    // Validar que las variables proporcionadas no estén vacías
    const emptyVariables = requiredVariables.filter(
      (variable) =>
        providedVariables[variable] === undefined ||
        providedVariables[variable] === null ||
        providedVariables[variable] === '',
    );

    if (emptyVariables.length > 0) {
      throw new BadRequestException(
        `Empty values for required variables: ${emptyVariables.join(', ')}`,
      );
    }
  }

  /**
   * Compile template string with Handlebars
   *
   * Supports full Handlebars syntax:
   * - {{variable}} - Variable interpolation
   * - {{#if condition}}...{{/if}} - Conditionals
   * - {{#unless condition}}...{{/unless}} - Negative conditionals
   * - {{#each items}}{{this}}{{/each}} - Loops
   * - {{formatDate date "DD/MM/YYYY"}} - Date formatting
   * - {{pluralize count "item" "items"}} - Pluralization
   *
   * @param template - String del template con sintaxis Handlebars
   * @param variables - Objeto con variables a interpolar
   * @returns String compilado con Handlebars
   *
   * @example
   * const result = this.interpolate(
   *   'Hola {{user_name}}, tienes {{count}} {{pluralize count "mensaje" "mensajes"}}',
   *   { user_name: 'Juan', count: 5 }
   * );
   * // Result: "Hola Juan, tienes 5 mensajes"
   */
  interpolate(template: string, variables: Record<string, string>): string {
    try {
      const compiled = Handlebars.compile(template);
      return compiled(variables);
    } catch (error) {
      // Fallback to basic interpolation if Handlebars fails
      return template.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
        const value = variables[variableName];
        if (value === undefined) {
          return match;
        }
        return String(value);
      });
    }
  }

  /**
   * Renderizar template completo (subject, body y HTML)
   *
   * 1. Obtiene el template por key
   * 2. Valida que todas las variables requeridas estén presentes
   * 3. Interpola variables en subject, body y HTML
   * 4. Retorna objeto con los 3 strings renderizados
   *
   * @param templateKey - Identificador del template
   * @param variables - Variables a interpolar
   * @returns Objeto con subject, body y html renderizados
   * @throws NotFoundException si el template no existe
   * @throws BadRequestException si faltan variables requeridas
   *
   * @example
   * const rendered = await this.templateService.renderTemplate(
   *   'achievement_unlocked',
   *   {
   *     user_name: 'Juan',
   *     achievement_name: 'Maestro del Pensamiento Crítico',
   *     achievement_icon: '🏆'
   *   }
   * );
   * // rendered.subject: "¡Felicidades Juan! Has desbloqueado un logro 🏆"
   * // rendered.body: "Has desbloqueado el logro 'Maestro del Pensamiento Crítico'..."
   * // rendered.html: "<html>...</html>"
   */
  async renderTemplate(
    templateKey: string,
    variables: Record<string, string>,
  ): Promise<{ subject: string; body: string; html: string }> {
    // 1. Obtener template
    const template = await this.findByKey(templateKey);

    // 2. Validar variables requeridas
    if (template.variables && template.variables.length > 0) {
      this.validateVariables(template.variables, variables);
    }

    // 3. Interpolar subject
    const subject = this.interpolate(template.subjectTemplate, variables);

    // 4. Interpolar body
    const body = this.interpolate(template.bodyTemplate, variables);

    // 5. Interpolar HTML (si existe)
    const html = template.htmlTemplate
      ? this.interpolate(template.htmlTemplate, variables)
      : body; // Fallback al body si no hay HTML

    return { subject, body, html };
  }

  /**
   * Activar o desactivar un template
   *
   * Templates inactivos no pueden ser usados para enviar notificaciones
   * Útil para deshabilitar temporalmente sin eliminar
   *
   * @param templateKey - Identificador del template
   * @param isActive - true para activar, false para desactivar
   * @throws NotFoundException si el template no existe
   *
   * @example
   * await this.templateService.toggleActive('system_announcement', false);
   */
  async toggleActive(templateKey: string, isActive: boolean): Promise<void> {
    const template = await this.templateRepository.findOne({
      where: { templateKey },
    });

    if (!template) {
      throw new NotFoundException(`Template with key '${templateKey}' not found`);
    }

    template.isActive = isActive;
    await this.templateRepository.save(template);
  }

  /**
   * Actualizar template
   *
   * IMPORTANTE: Solo admin puede actualizar templates
   * Templates de producción deben ser actualizados con cuidado
   *
   * @param templateKey - Identificador del template
   * @param updates - Campos a actualizar
   * @returns Template actualizado
   * @throws NotFoundException si el template no existe
   *
   * @example
   * const updated = await this.templateService.update('welcome_message', {
   *   subjectTemplate: 'Bienvenido {{user_name}} a GAMILIT',
   *   bodyTemplate: 'Hola {{user_name}}, te damos la bienvenida...'
   * });
   */
  async update(
    templateKey: string,
    updates: Partial<NotificationTemplate>,
  ): Promise<NotificationTemplate> {
    const template = await this.templateRepository.findOne({
      where: { templateKey },
    });

    if (!template) {
      throw new NotFoundException(`Template with key '${templateKey}' not found`);
    }

    // Aplicar updates
    Object.assign(template, updates);

    // No permitir cambiar el templateKey
    template.templateKey = templateKey;

    return this.templateRepository.save(template);
  }
}
