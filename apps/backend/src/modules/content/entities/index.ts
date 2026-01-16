/**
 * Content Management Entities - Barrel Export
 *
 * @description Exporta todas las entidades del módulo Content Management.
 * @usage import { ContentTemplate, MarieCurieContent, MediaFile } from '@modules/content/entities';
 */

export { ContentTemplate } from './content-template.entity';
export { MarieCurieContent } from './marie-curie-content.entity';
export { MediaFile } from './media-file.entity';
export { ContentAuthor } from './content-author.entity'; // ✨ NUEVO - P2 (Autores de contenido)
export { ContentCategory } from './content-category.entity'; // ✨ NUEVO - P2 (Categorías jerárquicas)
export * from './content-version.entity'; // ✨ NUEVO - 2026-01-14 (Versionado de contenido)
export * from './flagged-content.entity'; // ✨ NUEVO - 2026-01-14 (Moderación de contenido)
export * from './media-metadata.entity'; // ✨ NUEVO - 2026-01-14 (Metadatos multimedia)
export * from './tag.entity'; // ✨ NUEVO - 2026-01-14 (Etiquetas de contenido)
export * from './moderation-rule.entity'; // ✨ NUEVO - 2026-01-14 (Reglas de moderación)
