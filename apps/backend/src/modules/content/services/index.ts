/**
 * Content Management Services - Barrel Export
 *
 * @description Exporta todos los servicios del módulo Content Management.
 * @usage import { ContentTemplatesService, MarieCurieContentService, MediaFilesService } from '@modules/content/services';
 */

export { ContentTemplatesService } from './content-templates.service';
export { MarieCurieContentService } from './marie-curie-content.service';
export { MediaFilesService } from './media-files.service';
export { ContentAuthorsService } from './content-authors.service'; // ✨ NUEVO - P2
export { ContentCategoriesService } from './content-categories.service'; // ✨ NUEVO - P2
export { TagsService } from './tags.service'; // ✨ NUEVO - P2 (2026-01-16)
export { ContentVersionsService } from './content-versions.service'; // ✨ NUEVO - P2 (2026-01-16)
export { FlaggedContentService } from './flagged-content.service'; // ✨ NUEVO - P2 (2026-01-16)
export { MediaMetadataService } from './media-metadata.service'; // ✨ NUEVO - P2 (2026-01-16)
export { ModerationRulesService } from './moderation-rules.service'; // ✨ NUEVO - P2 (2026-01-16)
