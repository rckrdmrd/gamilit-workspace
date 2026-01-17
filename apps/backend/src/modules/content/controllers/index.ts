/**
 * Content Management Controllers - Barrel Export
 *
 * @description Exporta todos los controladores del módulo Content Management.
 * @usage import { ContentTemplatesController, MarieCurieContentController, MediaFilesController } from '@modules/content/controllers';
 */

export { ContentTemplatesController } from './content-templates.controller';
export { MarieCurieContentController } from './marie-curie-content.controller';
export { MediaFilesController } from './media-files.controller';
export { ContentAuthorsController } from './content-authors.controller'; // ✨ NUEVO - P2
export { ContentCategoriesController } from './content-categories.controller'; // ✨ NUEVO - P2
export { TagsController } from './tags.controller'; // ✨ NUEVO - P2 (2026-01-16)
export { ContentVersionsController } from './content-versions.controller'; // ✨ NUEVO - P2 (2026-01-16)
export { FlaggedContentController } from './flagged-content.controller'; // ✨ NUEVO - P2 (2026-01-16)
export { MediaMetadataController } from './media-metadata.controller'; // ✨ NUEVO - P2 (2026-01-16)
export { ModerationRulesController } from './moderation-rules.controller'; // ✨ NUEVO - P2 (2026-01-16)
