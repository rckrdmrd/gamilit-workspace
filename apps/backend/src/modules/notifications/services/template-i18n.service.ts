import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Handlebars from 'handlebars';
import dayjs from 'dayjs';
import { NotificationTemplate } from '../entities/multichannel/notification-template.entity';

/**
 * Supported locales for i18n
 */
export type SupportedLocale = 'es' | 'en';

/**
 * Compiled template result
 */
export interface CompiledTemplateResult {
  subject: string;
  body: string;
  html?: string;
}

/**
 * Template with locale information
 */
export interface LocalizedTemplateResult extends CompiledTemplateResult {
  locale: SupportedLocale;
  templateKey: string;
  version: number;
}

/**
 * TemplateI18nService
 *
 * @description Advanced template service with Handlebars, i18n, and versioning support
 * @version 1.0 (2026-02-03) - Advanced Templates Enhancement
 *
 * Features:
 * - Handlebars template engine with full syntax support
 * - Conditional logic: {{#if}}, {{#unless}}, {{#each}}
 * - Internationalization (es/en locales)
 * - Custom helpers: formatDate, pluralize, uppercase, lowercase, currency
 * - Template versioning support
 * - Preview functionality
 *
 * Usage:
 * ```typescript
 * const result = await templateI18nService.getLocalizedTemplate(
 *   'welcome_email',
 *   'es',
 *   { user_name: 'Juan', items: ['item1', 'item2'] }
 * );
 * ```
 */
@Injectable()
export class TemplateI18nService {
  /**
   * Supported locales for the platform
   */
  private readonly supportedLocales: SupportedLocale[] = ['es', 'en'];

  /**
   * Default locale when not specified or invalid
   */
  private readonly defaultLocale: SupportedLocale = 'es';

  constructor(
    @InjectRepository(NotificationTemplate, 'notifications')
    private readonly templateRepository: Repository<NotificationTemplate>,
  ) {
    this.registerCustomHelpers();
  }

  /**
   * Register custom Handlebars helpers
   *
   * Available helpers:
   * - formatDate: Format dates (DD/MM/YYYY by default)
   * - pluralize: Choose singular/plural based on count
   * - uppercase: Convert to uppercase
   * - lowercase: Convert to lowercase
   * - currency: Format as currency (MXN by default)
   * - eq: Equality comparison
   * - gt: Greater than comparison
   * - lt: Less than comparison
   * - and: Logical AND
   * - or: Logical OR
   * - concat: Concatenate strings
   * - truncate: Truncate text with ellipsis
   * - default: Provide default value if undefined
   */
  private registerCustomHelpers(): void {
    // Date formatting helper
    Handlebars.registerHelper('formatDate', (date: string | Date, format?: string) => {
      if (!date) return '';
      const dateFormat = typeof format === 'string' ? format : 'DD/MM/YYYY';
      return dayjs(date).format(dateFormat);
    });

    // Pluralize helper (Spanish/English aware)
    Handlebars.registerHelper(
      'pluralize',
      (count: number, singular: string, plural: string) => {
        if (typeof count !== 'number') return singular;
        return count === 1 ? singular : plural;
      },
    );

    // String manipulation helpers
    Handlebars.registerHelper('uppercase', (str: string) => {
      return typeof str === 'string' ? str.toUpperCase() : '';
    });

    Handlebars.registerHelper('lowercase', (str: string) => {
      return typeof str === 'string' ? str.toLowerCase() : '';
    });

    Handlebars.registerHelper('capitalize', (str: string) => {
      if (typeof str !== 'string') return '';
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    });

    // Currency formatting helper
    Handlebars.registerHelper(
      'currency',
      (amount: number, currencyCode?: string, locale?: string) => {
        if (typeof amount !== 'number') return '';
        const code = typeof currencyCode === 'string' ? currencyCode : 'MXN';
        const loc = typeof locale === 'string' ? locale : 'es-MX';
        return new Intl.NumberFormat(loc, {
          style: 'currency',
          currency: code,
        }).format(amount);
      },
    );

    // Number formatting helper
    Handlebars.registerHelper('formatNumber', (num: number, decimals?: number) => {
      if (typeof num !== 'number') return '';
      const dec = typeof decimals === 'number' ? decimals : 0;
      return new Intl.NumberFormat('es-MX', {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
      }).format(num);
    });

    // Comparison helpers
    Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);
    Handlebars.registerHelper('neq', (a: unknown, b: unknown) => a !== b);
    Handlebars.registerHelper('gt', (a: number, b: number) => a > b);
    Handlebars.registerHelper('gte', (a: number, b: number) => a >= b);
    Handlebars.registerHelper('lt', (a: number, b: number) => a < b);
    Handlebars.registerHelper('lte', (a: number, b: number) => a <= b);

    // Logical helpers
    Handlebars.registerHelper('and', (...args: unknown[]) => {
      // Remove options object from args
      const values = args.slice(0, -1);
      return values.every(Boolean);
    });

    Handlebars.registerHelper('or', (...args: unknown[]) => {
      const values = args.slice(0, -1);
      return values.some(Boolean);
    });

    Handlebars.registerHelper('not', (value: unknown) => !value);

    // String helpers
    Handlebars.registerHelper('concat', (...args: unknown[]) => {
      const values = args.slice(0, -1);
      return values.filter((v) => typeof v === 'string' || typeof v === 'number').join('');
    });

    Handlebars.registerHelper(
      'truncate',
      (str: string, length: number, suffix?: string) => {
        if (typeof str !== 'string') return '';
        if (str.length <= length) return str;
        const suf = typeof suffix === 'string' ? suffix : '...';
        return str.substring(0, length) + suf;
      },
    );

    // Default value helper
    Handlebars.registerHelper('default', (value: unknown, defaultValue: unknown) => {
      return value !== undefined && value !== null && value !== '' ? value : defaultValue;
    });

    // Array/Collection helpers
    Handlebars.registerHelper('first', (array: unknown[]) => {
      return Array.isArray(array) && array.length > 0 ? array[0] : null;
    });

    Handlebars.registerHelper('last', (array: unknown[]) => {
      return Array.isArray(array) && array.length > 0 ? array[array.length - 1] : null;
    });

    Handlebars.registerHelper('length', (array: unknown[]) => {
      return Array.isArray(array) ? array.length : 0;
    });

    // JSON helper for debugging
    Handlebars.registerHelper('json', (context: unknown) => {
      return JSON.stringify(context, null, 2);
    });

    // i18n specific helper
    Handlebars.registerHelper(
      'i18n',
      (key: string, translations: Record<string, string>, options: Handlebars.HelperOptions) => {
        const locale = options.data?.root?.locale || 'es';
        return translations?.[locale] || translations?.es || key;
      },
    );
  }

  /**
   * Check if a locale is supported
   *
   * @param locale - Locale code to check
   * @returns True if supported, false otherwise
   */
  isLocaleSupported(locale: string): locale is SupportedLocale {
    return this.supportedLocales.includes(locale as SupportedLocale);
  }

  /**
   * Get the effective locale (fallback to default if unsupported)
   *
   * @param locale - Requested locale
   * @returns Effective locale to use
   */
  getEffectiveLocale(locale?: string): SupportedLocale {
    if (locale && this.isLocaleSupported(locale)) {
      return locale;
    }
    return this.defaultLocale;
  }

  /**
   * Compile a template string with Handlebars
   *
   * @param templateString - Template with Handlebars syntax
   * @param variables - Variables to interpolate
   * @param locale - Optional locale for i18n context
   * @returns Compiled string
   *
   * @example
   * const result = service.compileTemplate(
   *   'Hello {{name}}, you have {{count}} {{pluralize count "message" "messages"}}',
   *   { name: 'John', count: 5 }
   * );
   * // Result: "Hello John, you have 5 messages"
   */
  compileTemplate(
    templateString: string,
    variables: Record<string, unknown>,
    locale?: SupportedLocale,
  ): string {
    try {
      const compiled = Handlebars.compile(templateString);
      return compiled({
        ...variables,
        locale: locale || this.defaultLocale,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Template compilation error: ${errorMessage}`);
    }
  }

  /**
   * Get localized template with Handlebars compilation
   *
   * Supports:
   * - Subject/Body/HTML translations via JSONB columns
   * - Fallback to default template if translation not found
   * - Full Handlebars syntax including conditionals and loops
   *
   * @param templateKey - Unique template identifier
   * @param locale - Desired locale (es/en)
   * @param variables - Variables for interpolation
   * @returns Compiled template with subject, body, and optional HTML
   *
   * @throws NotFoundException if template not found
   * @throws BadRequestException if compilation fails
   *
   * @example
   * const result = await service.getLocalizedTemplate(
   *   'achievement_unlocked',
   *   'es',
   *   {
   *     user_name: 'Juan',
   *     achievement_name: 'Maestro',
   *     items: ['badge1', 'badge2'],
   *   }
   * );
   */
  async getLocalizedTemplate(
    templateKey: string,
    locale: string,
    variables: Record<string, unknown>,
  ): Promise<LocalizedTemplateResult> {
    const template = await this.templateRepository.findOne({
      where: { templateKey, isActive: true },
    });

    if (!template) {
      throw new NotFoundException(
        `Template with key '${templateKey}' not found or is inactive`,
      );
    }

    const targetLocale = this.getEffectiveLocale(locale);

    // Get localized content (fallback to default if not available)
    const subjectSource = this.getLocalizedContent(
      template.subjectTranslations,
      template.subjectTemplate ?? '',
      targetLocale,
    );

    const bodySource = this.getLocalizedContent(
      template.bodyTranslations,
      template.bodyTemplate,
      targetLocale,
    );

    const htmlSource = template.htmlTemplate
      ? this.getLocalizedContent(
          template.htmlTranslations,
          template.htmlTemplate,
          targetLocale,
        )
      : undefined;

    // Compile templates with Handlebars
    const subject = this.compileTemplate(subjectSource, variables, targetLocale);
    const body = this.compileTemplate(bodySource, variables, targetLocale);
    const html = htmlSource
      ? this.compileTemplate(htmlSource, variables, targetLocale)
      : undefined;

    return {
      subject,
      body,
      html,
      locale: targetLocale,
      templateKey,
      version: template.version || 1,
    };
  }

  /**
   * Get localized content from translations JSONB or fallback
   *
   * @param translations - JSONB object with locale keys
   * @param fallback - Default content to use if translation not found
   * @param locale - Target locale
   * @returns Localized content string
   */
  private getLocalizedContent(
    translations: Record<string, string> | undefined | null,
    fallback: string,
    locale: SupportedLocale,
  ): string {
    if (translations && translations[locale]) {
      return translations[locale];
    }
    // Try default locale as secondary fallback
    if (translations && translations[this.defaultLocale]) {
      return translations[this.defaultLocale];
    }
    return fallback;
  }

  /**
   * Preview a template without saving (raw template string)
   *
   * Used for previewing templates before saving to database.
   * Supports full Handlebars syntax.
   *
   * @param templateData - Template content to preview
   * @param variables - Variables for interpolation
   * @param locale - Optional locale
   * @returns Compiled preview result
   *
   * @example
   * const preview = service.previewRawTemplate(
   *   {
   *     subject: 'Hello {{name}}!',
   *     body: 'You have {{count}} {{pluralize count "item" "items"}}',
   *     html: '<h1>Hello {{name}}!</h1>',
   *   },
   *   { name: 'John', count: 3 },
   *   'en'
   * );
   */
  previewRawTemplate(
    templateData: {
      subject: string;
      body: string;
      html?: string;
    },
    variables: Record<string, unknown>,
    locale?: string,
  ): CompiledTemplateResult {
    const targetLocale = this.getEffectiveLocale(locale);

    const subject = this.compileTemplate(templateData.subject, variables, targetLocale);
    const body = this.compileTemplate(templateData.body, variables, targetLocale);
    const html = templateData.html
      ? this.compileTemplate(templateData.html, variables, targetLocale)
      : undefined;

    return { subject, body, html };
  }

  /**
   * Get template with specific version
   *
   * @param templateKey - Template identifier
   * @param version - Specific version number (optional, latest if not provided)
   * @returns Template entity or null
   */
  async getTemplateByVersion(
    templateKey: string,
    version?: number,
  ): Promise<NotificationTemplate | null> {
    const query = this.templateRepository.createQueryBuilder('template');

    query.where('template.templateKey = :templateKey', { templateKey });
    query.andWhere('template.isActive = true');

    if (version !== undefined) {
      query.andWhere('template.version = :version', { version });
    } else {
      // Get the latest version
      query.orderBy('template.version', 'DESC');
    }

    return query.getOne();
  }

  /**
   * Get all versions of a template
   *
   * @param templateKey - Template identifier
   * @returns Array of all template versions
   */
  async getTemplateVersionHistory(templateKey: string): Promise<NotificationTemplate[]> {
    return this.templateRepository.find({
      where: { templateKey },
      order: { version: 'DESC' },
    });
  }

  /**
   * Create a new version of a template
   *
   * This creates a new record with incremented version,
   * keeping the previous version intact for history.
   *
   * @param templateKey - Template identifier
   * @param updates - Updates to apply to the new version
   * @returns New template version
   */
  async createNewVersion(
    templateKey: string,
    updates: Partial<NotificationTemplate>,
  ): Promise<NotificationTemplate> {
    // Get current active version
    const currentTemplate = await this.templateRepository.findOne({
      where: { templateKey, isActive: true },
      order: { version: 'DESC' },
    });

    if (!currentTemplate) {
      throw new NotFoundException(`Template with key '${templateKey}' not found`);
    }

    // Deactivate current version
    currentTemplate.isActive = false;
    await this.templateRepository.save(currentTemplate);

    // Create new version
    const newVersion = this.templateRepository.create({
      ...currentTemplate,
      ...updates,
      id: undefined, // Let DB generate new ID
      version: (currentTemplate.version || 1) + 1,
      previousVersionId: currentTemplate.id,
      isActive: true,
      createdAt: undefined,
      updatedAt: undefined,
    });

    return this.templateRepository.save(newVersion);
  }

  /**
   * Rollback to a previous version
   *
   * @param templateKey - Template identifier
   * @param targetVersion - Version to rollback to
   * @returns Reactivated template
   */
  async rollbackToVersion(
    templateKey: string,
    targetVersion: number,
  ): Promise<NotificationTemplate> {
    const targetTemplate = await this.templateRepository.findOne({
      where: { templateKey, version: targetVersion },
    });

    if (!targetTemplate) {
      throw new NotFoundException(
        `Template version ${targetVersion} not found for key '${templateKey}'`,
      );
    }

    // Deactivate current active version
    await this.templateRepository.update(
      { templateKey, isActive: true },
      { isActive: false },
    );

    // Reactivate target version
    targetTemplate.isActive = true;
    return this.templateRepository.save(targetTemplate);
  }

  /**
   * Get list of supported locales
   */
  getSupportedLocales(): SupportedLocale[] {
    return [...this.supportedLocales];
  }

  /**
   * Get default locale
   */
  getDefaultLocale(): SupportedLocale {
    return this.defaultLocale;
  }

  /**
   * Validate template syntax without rendering
   *
   * @param templateString - Template to validate
   * @returns True if valid, throws error if invalid
   */
  validateTemplateSyntax(templateString: string): boolean {
    try {
      Handlebars.compile(templateString);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Invalid template syntax: ${errorMessage}`);
    }
  }
}
