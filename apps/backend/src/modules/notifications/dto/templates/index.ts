/**
 * Templates DTOs (EXT-003 + Advanced Templates Enhancement)
 *
 * @description Exporta DTOs para templates de notificaciones con Handlebars, i18n y versionado
 * @version 2.0 (2026-02-03) - Advanced Templates Enhancement
 */

export { RenderTemplateDto } from './render-template.dto';
export {
  TemplateResponseDto,
  TemplatesListResponseDto,
  RenderedTemplateResponseDto,
} from './template-response.dto';

// Advanced Templates DTOs (v2.0)
export {
  PreviewTemplateDto,
  PreviewTemplateResponseDto,
  LocalizedRenderTemplateDto,
  LocalizedRenderResponseDto,
  TemplateVersionDto,
  TemplateVersionHistoryResponseDto,
  ValidateTemplateSyntaxDto,
  ValidateTemplateSyntaxResponseDto,
} from './preview-template.dto';
