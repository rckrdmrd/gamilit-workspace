import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { NotificationTemplateService } from '../services/notification-template.service';
import { TemplateI18nService } from '../services/template-i18n.service';
import { JwtAuthGuard } from '@/modules/auth/guards';
import {
  RenderTemplateDto,
  TemplateResponseDto,
  TemplatesListResponseDto,
  RenderedTemplateResponseDto,
  PreviewTemplateDto,
  PreviewTemplateResponseDto,
  LocalizedRenderTemplateDto,
  LocalizedRenderResponseDto,
  TemplateVersionHistoryResponseDto,
  ValidateTemplateSyntaxDto,
  ValidateTemplateSyntaxResponseDto,
} from '../dto/templates';

/**
 * NotificationTemplatesController
 *
 * @description Controller para templates de notificaciones con Handlebars, i18n y versionado
 * @version 2.0 (2026-02-03) - Advanced Templates Enhancement
 *
 * Rutas: /notifications/templates/*
 *
 * Endpoints (v1.0 - EXT-003):
 * - GET /templates - Obtener todos los templates
 * - GET /templates/:templateKey - Obtener template específico
 * - POST /templates/:templateKey/render - Renderizar template básico
 *
 * Endpoints (v2.0 - Advanced Templates):
 * - POST /templates/preview - Preview de template raw con Handlebars
 * - POST /templates/validate - Validar sintaxis de template
 * - POST /templates/:templateKey/render-localized - Renderizar con i18n
 * - GET /templates/:templateKey/versions - Obtener historial de versiones
 * - GET /templates/locales - Obtener locales soportados
 *
 * Sintaxis Handlebars soportada:
 * - {{variable}} - Interpolación
 * - {{#if condition}}...{{/if}} - Condicionales
 * - {{#unless condition}}...{{/unless}} - Condicionales negativos
 * - {{#each items}}{{this}}{{/each}} - Loops
 * - {{formatDate date "DD/MM/YYYY"}} - Formateo de fechas
 * - {{pluralize count "item" "items"}} - Pluralización
 * - {{uppercase str}} - Transformación a mayúsculas
 * - {{currency amount "MXN"}} - Formateo de moneda
 *
 * Seguridad:
 * - Todos los endpoints requieren autenticación JWT
 * - Acceso de solo lectura para usuarios normales
 * - Solo admin puede modificar templates
 *
 * Templates disponibles (seeded en DB):
 * 1. welcome_email - Email de bienvenida
 * 2. new_assignment - Nueva asignación
 * 3. assignment_reminder - Recordatorio de tarea
 * 4. achievement_unlocked - Logro desbloqueado
 * 5. teacher_message - Mensaje del profesor
 * 6. team_invitation - Invitación a equipo
 * 7. exercise_feedback - Retroalimentación de ejercicio
 * 8. streak_milestone - Racha alcanzada
 */
@ApiTags('notifications-templates')
@Controller('notifications/templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationTemplatesController {
  constructor(
    private readonly templateService: NotificationTemplateService,
    private readonly templateI18nService: TemplateI18nService,
  ) {}

  /**
   * GET /notifications/templates
   *
   * Obtener todos los templates activos
   *
   * Útil para:
   * - UI de admin (gestión de templates)
   * - UI de developer (ver templates disponibles)
   * - Documentación de API
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener todos los templates',
    description:
      'Retorna lista de templates activos disponibles para enviar notificaciones',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de templates obtenida exitosamente',
    type: TemplatesListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  async getAllTemplates(): Promise<TemplatesListResponseDto> {
    const templates = await this.templateService.findAll({ isActive: true });

    return {
      templates: templates as TemplateResponseDto[],
    };
  }

  /**
   * GET /notifications/templates/:templateKey
   *
   * Obtener template específico por clave
   *
   * Retorna:
   * - subject_template con placeholders {{variable}}
   * - body_template con placeholders
   * - html_template (si existe)
   * - variables requeridas
   * - default_channels
   */
  @Get(':templateKey')
  @ApiOperation({
    summary: 'Obtener template por clave',
    description:
      'Retorna un template específico con toda su configuración y variables requeridas',
  })
  @ApiParam({
    name: 'templateKey',
    description: 'Clave única del template (ej: achievement_unlocked)',
    example: 'achievement_unlocked',
  })
  @ApiResponse({
    status: 200,
    description: 'Template encontrado',
    type: TemplateResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Template no encontrado o inactivo',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  async getTemplateByKey(
    @Param('templateKey') templateKey: string,
  ): Promise<TemplateResponseDto> {
    const template = await this.templateService.findByKey(templateKey);
    return template as TemplateResponseDto;
  }

  /**
   * POST /notifications/templates/:templateKey/render
   *
   * Renderizar template con variables (preview)
   *
   * Casos de uso:
   * - Preview en UI de admin antes de enviar
   * - Testing de interpolación de variables
   * - Validar que todas las variables están presentes
   *
   * IMPORTANTE:
   * - NO crea ni envía notificación
   * - Solo renderiza el template con las variables proporcionadas
   * - Retorna subject, body y html renderizados
   */
  @Post(':templateKey/render')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renderizar template (preview)',
    description:
      'Renderiza un template con variables sin crear notificación. ' +
      'Útil para preview y testing.',
  })
  @ApiParam({
    name: 'templateKey',
    description: 'Clave única del template',
    example: 'achievement_unlocked',
  })
  @ApiResponse({
    status: 200,
    description: 'Template renderizado exitosamente',
    type: RenderedTemplateResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Variables faltantes o inválidas',
  })
  @ApiResponse({
    status: 404,
    description: 'Template no encontrado o inactivo',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  async renderTemplate(
    @Param('templateKey') templateKey: string,
      @Body() renderDto: RenderTemplateDto,
  ): Promise<RenderedTemplateResponseDto> {
    const rendered = await this.templateService.renderTemplate(
      templateKey,
      renderDto.variables,
    );

    return {
      subject: rendered.subject,
      body: rendered.body,
      html: rendered.html,
    };
  }

  // ========== ADVANCED TEMPLATES ENDPOINTS (v2.0 - 2026-02-03) ==========

  /**
   * POST /notifications/templates/preview
   *
   * Preview de template raw con Handlebars (sin guardar)
   *
   * Permite probar templates antes de guardarlos.
   * Soporta la sintaxis completa de Handlebars:
   * - {{#if}}, {{#unless}}, {{#each}}
   * - Helpers: formatDate, pluralize, currency, etc.
   *
   * Casos de uso:
   * - Testing de sintaxis Handlebars
   * - Preview antes de crear/actualizar template
   * - Validación de variables y lógica condicional
   */
  @Post('preview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Preview de template raw con Handlebars',
    description:
      'Renderiza un template raw con sintaxis Handlebars sin guardarlo. ' +
      'Soporta condicionales ({{#if}}), loops ({{#each}}), y helpers personalizados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Template renderizado exitosamente',
    type: PreviewTemplateResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Error de sintaxis o variables inválidas',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  async previewTemplate(
    @Body() previewDto: PreviewTemplateDto,
  ): Promise<PreviewTemplateResponseDto> {
    const result = this.templateI18nService.previewRawTemplate(
      {
        subject: previewDto.subject,
        body: previewDto.body,
        html: previewDto.html,
      },
      previewDto.variables,
      previewDto.locale,
    );

    return {
      subject: result.subject,
      body: result.body,
      html: result.html,
      locale: this.templateI18nService.getEffectiveLocale(previewDto.locale),
      success: true,
    };
  }

  /**
   * POST /notifications/templates/validate
   *
   * Validar sintaxis de template Handlebars
   *
   * Verifica que la sintaxis sea correcta sin renderizar.
   * Útil para validación en tiempo real en UI de admin.
   */
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validar sintaxis de template',
    description:
      'Valida que la sintaxis Handlebars del template sea correcta sin renderizarlo.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado de validación',
    type: ValidateTemplateSyntaxResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  async validateTemplateSyntax(
    @Body() validateDto: ValidateTemplateSyntaxDto,
  ): Promise<ValidateTemplateSyntaxResponseDto> {
    try {
      this.templateI18nService.validateTemplateSyntax(validateDto.template);
      return { valid: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { valid: false, error: errorMessage };
    }
  }

  /**
   * GET /notifications/templates/locales
   *
   * Obtener locales soportados para i18n
   */
  @Get('locales')
  @ApiOperation({
    summary: 'Obtener locales soportados',
    description: 'Retorna la lista de locales soportados para internacionalización.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de locales',
    schema: {
      type: 'object',
      properties: {
        locales: {
          type: 'array',
          items: { type: 'string' },
          example: ['es', 'en'],
        },
        defaultLocale: {
          type: 'string',
          example: 'es',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  getSupportedLocales(): { locales: string[]; defaultLocale: string } {
    return {
      locales: this.templateI18nService.getSupportedLocales(),
      defaultLocale: this.templateI18nService.getDefaultLocale(),
    };
  }

  /**
   * POST /notifications/templates/:templateKey/render-localized
   *
   * Renderizar template con i18n (internacionalización)
   *
   * Usa las traducciones almacenadas en subject_translations,
   * body_translations, html_translations si están disponibles.
   * Fallback al template por defecto si no hay traducción.
   */
  @Post(':templateKey/render-localized')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renderizar template con i18n',
    description:
      'Renderiza un template usando traducciones según el locale especificado. ' +
      'Soporta versionado y sintaxis Handlebars completa.',
  })
  @ApiParam({
    name: 'templateKey',
    description: 'Clave única del template',
    example: 'achievement_unlocked',
  })
  @ApiResponse({
    status: 200,
    description: 'Template renderizado con i18n',
    type: LocalizedRenderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Variables faltantes o sintaxis inválida',
  })
  @ApiResponse({
    status: 404,
    description: 'Template no encontrado o inactivo',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  async renderLocalizedTemplate(
    @Param('templateKey') templateKey: string,
    @Body() renderDto: LocalizedRenderTemplateDto,
  ): Promise<LocalizedRenderResponseDto> {
    const result = await this.templateI18nService.getLocalizedTemplate(
      templateKey,
      renderDto.locale || 'es',
      renderDto.variables,
    );

    return {
      subject: result.subject,
      body: result.body,
      html: result.html,
      locale: result.locale,
      templateKey: result.templateKey,
      version: result.version,
    };
  }

  /**
   * GET /notifications/templates/:templateKey/versions
   *
   * Obtener historial de versiones de un template
   *
   * Útil para:
   * - Ver historial de cambios
   * - Seleccionar versión específica
   * - Rollback a versión anterior
   */
  @Get(':templateKey/versions')
  @ApiOperation({
    summary: 'Obtener historial de versiones',
    description:
      'Retorna el historial de todas las versiones de un template, ' +
      'ordenadas de más reciente a más antigua.',
  })
  @ApiParam({
    name: 'templateKey',
    description: 'Clave única del template',
    example: 'achievement_unlocked',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de versiones',
    type: TemplateVersionHistoryResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  async getTemplateVersionHistory(
    @Param('templateKey') templateKey: string,
  ): Promise<TemplateVersionHistoryResponseDto> {
    const versions = await this.templateI18nService.getTemplateVersionHistory(templateKey);

    return {
      templateKey,
      versions: versions.map((v) => ({
        id: v.id,
        version: v.version || 1,
        isActive: v.isActive,
        createdAt: v.createdAt,
      })),
    };
  }

  /**
   * GET /notifications/templates/:templateKey/version/:version
   *
   * Obtener template por versión específica
   */
  @Get(':templateKey/version/:version')
  @ApiOperation({
    summary: 'Obtener template por versión',
    description: 'Retorna una versión específica de un template.',
  })
  @ApiParam({
    name: 'templateKey',
    description: 'Clave única del template',
    example: 'achievement_unlocked',
  })
  @ApiParam({
    name: 'version',
    description: 'Número de versión',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Template encontrado',
    type: TemplateResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Versión no encontrada',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  async getTemplateByVersion(
    @Param('templateKey') templateKey: string,
    @Param('version') version: number,
  ): Promise<TemplateResponseDto> {
    const template = await this.templateI18nService.getTemplateByVersion(
      templateKey,
      version,
    );

    if (!template) {
      throw new NotFoundException(`Template version ${version} not found for key '${templateKey}'`);
    }

    return template as TemplateResponseDto;
  }
}
