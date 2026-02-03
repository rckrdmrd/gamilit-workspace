import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * PreviewTemplateDto
 *
 * @description DTO para preview de template con Handlebars (sin guardar)
 * @version 1.0 (2026-02-03) - Advanced Templates Enhancement
 *
 * Usado en: POST /notifications/templates/preview
 *
 * Permite probar templates antes de guardarlos en base de datos.
 * Soporta la sintaxis completa de Handlebars incluyendo:
 * - Interpolación de variables: {{variable}}
 * - Condicionales: {{#if}}, {{#unless}}
 * - Loops: {{#each items}}
 * - Helpers: {{formatDate}}, {{pluralize}}, etc.
 *
 * @example
 * {
 *   "template": "Hola {{name}}, tienes {{count}} {{pluralize count 'mensaje' 'mensajes'}}",
 *   "variables": { "name": "Juan", "count": 5 },
 *   "locale": "es"
 * }
 */
export class PreviewTemplateDto {
  /**
   * Template del asunto a previsualizar
   *
   * Soporta sintaxis Handlebars completa
   *
   * @example "¡Hola {{user_name}}!"
   */
  @ApiProperty({
    description: 'Template del asunto (subject) con sintaxis Handlebars',
    example: '¡Hola {{user_name}}! Tienes {{count}} {{pluralize count "notificación" "notificaciones"}}',
  })
  @IsString()
  @IsNotEmpty()
    subject!: string;

  /**
   * Template del cuerpo a previsualizar
   *
   * Soporta sintaxis Handlebars completa
   *
   * @example "Hola {{name}}, {{#if hasItems}}tienes items{{/if}}"
   */
  @ApiProperty({
    description: 'Template del cuerpo (body) con sintaxis Handlebars',
    example: `Hola {{user_name}},

{{#if has_notifications}}
Tienes {{count}} {{pluralize count "notificación pendiente" "notificaciones pendientes"}}:

{{#each notifications}}
- {{this.title}} ({{formatDate this.date "DD/MM/YYYY"}})
{{/each}}
{{else}}
No tienes notificaciones pendientes.
{{/if}}

Saludos,
Equipo Gamilit`,
  })
  @IsString()
  @IsNotEmpty()
    body!: string;

  /**
   * Template HTML opcional
   *
   * Si no se proporciona, se usa el body como fallback
   */
  @ApiPropertyOptional({
    description: 'Template HTML opcional con sintaxis Handlebars',
    example: '<h1>¡Hola {{user_name}}!</h1><p>Tienes {{count}} mensajes.</p>',
  })
  @IsString()
  @IsOptional()
    html?: string;

  /**
   * Variables para interpolar en el template
   *
   * Objeto con los valores a usar para el preview
   * Debe incluir todas las variables usadas en el template
   */
  @ApiProperty({
    description: 'Variables para interpolar en el template',
    example: {
      user_name: 'Juan Pérez',
      count: 3,
      has_notifications: true,
      notifications: [
        { title: 'Nuevo logro', date: '2026-02-03' },
        { title: 'Mensaje del profesor', date: '2026-02-02' },
        { title: 'Tarea pendiente', date: '2026-02-01' },
      ],
    },
  })
  @IsObject()
  @IsNotEmpty()
    variables!: Record<string, unknown>;

  /**
   * Locale para el preview
   *
   * Afecta helpers como formatDate, currency
   * Valores soportados: 'es', 'en'
   *
   * @default 'es'
   */
  @ApiPropertyOptional({
    description: 'Locale para el preview (es/en)',
    example: 'es',
    default: 'es',
    enum: ['es', 'en'],
  })
  @IsString()
  @IsIn(['es', 'en'])
  @IsOptional()
    locale?: string;
}

/**
 * PreviewTemplateResponseDto
 *
 * @description DTO de respuesta para preview de template
 *
 * @example
 * {
 *   "subject": "¡Hola Juan Pérez! Tienes 3 notificaciones",
 *   "body": "Hola Juan Pérez,\n\nTienes 3 notificaciones pendientes...",
 *   "html": "<h1>¡Hola Juan Pérez!</h1>...",
 *   "locale": "es",
 *   "success": true
 * }
 */
export class PreviewTemplateResponseDto {
  /**
   * Asunto renderizado
   */
  @ApiProperty({
    description: 'Asunto renderizado con variables interpoladas',
    example: '¡Hola Juan Pérez! Tienes 3 notificaciones',
  })
    subject!: string;

  /**
   * Cuerpo renderizado
   */
  @ApiProperty({
    description: 'Cuerpo renderizado con variables interpoladas',
    example: 'Hola Juan Pérez,\n\nTienes 3 notificaciones pendientes:\n- Nuevo logro...',
  })
    body!: string;

  /**
   * HTML renderizado (si se proporcionó)
   */
  @ApiPropertyOptional({
    description: 'HTML renderizado con variables interpoladas',
    example: '<h1>¡Hola Juan Pérez!</h1><p>Tienes 3 mensajes.</p>',
  })
    html?: string;

  /**
   * Locale usado para el renderizado
   */
  @ApiProperty({
    description: 'Locale usado para el renderizado',
    example: 'es',
  })
    locale!: string;

  /**
   * Indica si el preview fue exitoso
   */
  @ApiProperty({
    description: 'Indica si el preview fue exitoso',
    example: true,
  })
    success!: boolean;
}

/**
 * LocalizedRenderTemplateDto
 *
 * @description DTO para renderizar template existente con i18n
 * @version 1.0 (2026-02-03)
 *
 * Usado en: POST /notifications/templates/:templateKey/render-localized
 */
export class LocalizedRenderTemplateDto {
  /**
   * Variables para interpolar
   */
  @ApiProperty({
    description: 'Variables para interpolar en el template',
    example: {
      user_name: 'Juan',
      achievement_name: 'Maestro del Pensamiento',
      achievement_icon: '🏆',
    },
  })
  @IsObject()
  @IsNotEmpty()
    variables!: Record<string, unknown>;

  /**
   * Locale deseado
   *
   * @default 'es'
   */
  @ApiPropertyOptional({
    description: 'Locale deseado (es/en)',
    example: 'es',
    default: 'es',
    enum: ['es', 'en'],
  })
  @IsString()
  @IsIn(['es', 'en'])
  @IsOptional()
    locale?: string;

  /**
   * Versión específica del template (opcional)
   *
   * Si no se proporciona, usa la versión activa más reciente
   */
  @ApiPropertyOptional({
    description: 'Versión específica del template (opcional)',
    example: 1,
  })
  @IsOptional()
    version?: number;
}

/**
 * LocalizedRenderResponseDto
 *
 * @description DTO de respuesta para template localizado renderizado
 */
export class LocalizedRenderResponseDto {
  /**
   * Asunto renderizado
   */
  @ApiProperty({
    description: 'Asunto renderizado',
    example: '¡Felicidades Juan! Has desbloqueado 🏆',
  })
    subject!: string;

  /**
   * Cuerpo renderizado
   */
  @ApiProperty({
    description: 'Cuerpo renderizado',
    example: 'Has desbloqueado el logro "Maestro del Pensamiento"...',
  })
    body!: string;

  /**
   * HTML renderizado
   */
  @ApiPropertyOptional({
    description: 'HTML renderizado',
    example: '<html>...</html>',
  })
    html?: string;

  /**
   * Locale usado
   */
  @ApiProperty({
    description: 'Locale efectivo usado para el renderizado',
    example: 'es',
  })
    locale!: string;

  /**
   * Clave del template
   */
  @ApiProperty({
    description: 'Clave del template renderizado',
    example: 'achievement_unlocked',
  })
    templateKey!: string;

  /**
   * Versión del template
   */
  @ApiProperty({
    description: 'Versión del template usado',
    example: 1,
  })
    version!: number;
}

/**
 * TemplateVersionDto
 *
 * @description DTO para información de versión de template
 */
export class TemplateVersionDto {
  /**
   * UUID de la versión
   */
  @ApiProperty({
    description: 'UUID de la versión',
    example: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
  })
    id!: string;

  /**
   * Número de versión
   */
  @ApiProperty({
    description: 'Número de versión',
    example: 2,
  })
    version!: number;

  /**
   * Si es la versión activa
   */
  @ApiProperty({
    description: 'Si es la versión activa actualmente',
    example: true,
  })
    isActive!: boolean;

  /**
   * Fecha de creación
   */
  @ApiProperty({
    description: 'Fecha de creación de esta versión',
    example: '2026-02-03T10:00:00.000Z',
  })
    createdAt!: Date;
}

/**
 * TemplateVersionHistoryResponseDto
 *
 * @description DTO de respuesta para historial de versiones
 */
export class TemplateVersionHistoryResponseDto {
  /**
   * Clave del template
   */
  @ApiProperty({
    description: 'Clave del template',
    example: 'achievement_unlocked',
  })
    templateKey!: string;

  /**
   * Lista de versiones
   */
  @ApiProperty({
    description: 'Lista de versiones del template',
    type: [TemplateVersionDto],
  })
    versions!: TemplateVersionDto[];
}

/**
 * ValidateTemplateSyntaxDto
 *
 * @description DTO para validar sintaxis de template
 */
export class ValidateTemplateSyntaxDto {
  /**
   * Template a validar
   */
  @ApiProperty({
    description: 'Template con sintaxis Handlebars a validar',
    example: 'Hola {{name}}, {{#if premium}}eres premium{{/if}}',
  })
  @IsString()
  @IsNotEmpty()
    template!: string;
}

/**
 * ValidateTemplateSyntaxResponseDto
 *
 * @description DTO de respuesta para validación de sintaxis
 */
export class ValidateTemplateSyntaxResponseDto {
  /**
   * Si la sintaxis es válida
   */
  @ApiProperty({
    description: 'Si la sintaxis del template es válida',
    example: true,
  })
    valid!: boolean;

  /**
   * Mensaje de error si la sintaxis es inválida
   */
  @ApiPropertyOptional({
    description: 'Mensaje de error si la sintaxis es inválida',
    example: null,
  })
    error?: string | null;
}
