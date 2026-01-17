import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import {
  ContentTemplate,
  MarieCurieContent,
  MediaFile,
  ContentAuthor, // ✨ NUEVO - P2 (Autores de contenido)
  ContentCategory, // ✨ NUEVO - P2 (Categorías jerárquicas)
  ContentVersion, // ✨ NUEVO - 2026-01-14 (Versionado de contenido)
  FlaggedContent, // ✨ NUEVO - 2026-01-14 (Moderación de contenido)
  MediaMetadata, // ✨ NUEVO - 2026-01-14 (Metadatos multimedia)
  Tag, // ✨ NUEVO - 2026-01-14 (Etiquetas de contenido)
  ModerationRule, // ✨ NUEVO - 2026-01-14 (Reglas de moderación)
} from './entities';

// Services
import {
  ContentTemplatesService,
  MarieCurieContentService,
  MediaFilesService,
  ContentAuthorsService,
  ContentCategoriesService,
  TagsService,
  ContentVersionsService,
  FlaggedContentService,
  MediaMetadataService,
  ModerationRulesService,
} from './services';

// Controllers
import {
  ContentTemplatesController,
  MarieCurieContentController,
  MediaFilesController,
  ContentAuthorsController,
  ContentCategoriesController,
  TagsController,
  ContentVersionsController,
  FlaggedContentController,
  MediaMetadataController,
  ModerationRulesController,
} from './controllers';

// Constants

/**
 * ContentModule
 *
 * @description Módulo de gestión de contenido educativo y multimedia.
 *              Incluye plantillas reutilizables, contenido sobre Marie Curie,
 *              y gestión completa de archivos multimedia.
 *
 * @features
 * - Plantillas de contenido reutilizables (5 tipos)
 * - Contenido curado sobre Marie Curie (9 categorías)
 * - Gestión de archivos multimedia (6 tipos)
 * - Workflow de publicación (draft → published)
 * - Procesamiento de archivos (uploading → ready)
 * - Full-text search en español
 * - Estadísticas de almacenamiento y uso
 *
 * @exports
 * - ContentTemplatesService
 * - MarieCurieContentService
 * - MediaFilesService
 * - ContentAuthorsService (P2 - Gestión de perfiles de autores)
 * - ContentCategoriesService (P2 - Categorías jerárquicas para contenido)
 */
@Module({
  imports: [
    // Connection 'content' handles schema 'content_management'
    TypeOrmModule.forFeature(
      [
        ContentTemplate,
        MarieCurieContent,
        MediaFile,
        ContentAuthor, // ✨ NUEVO - P2 (Autores de contenido)
        ContentCategory, // ✨ NUEVO - P2 (Categorías jerárquicas)
        ContentVersion, // ✨ NUEVO - 2026-01-14 (Versionado de contenido)
        FlaggedContent, // ✨ NUEVO - 2026-01-14 (Moderación de contenido)
        MediaMetadata, // ✨ NUEVO - 2026-01-14 (Metadatos multimedia)
        Tag, // ✨ NUEVO - 2026-01-14 (Etiquetas de contenido)
        ModerationRule, // ✨ NUEVO - 2026-01-14 (Reglas de moderación)
      ],
      'content',
    ),
  ],
  providers: [
    ContentTemplatesService,
    MarieCurieContentService,
    MediaFilesService,
    ContentAuthorsService, // ✨ NUEVO - P2
    ContentCategoriesService, // ✨ NUEVO - P2
    TagsService, // ✨ NUEVO - P2 (2026-01-16)
    ContentVersionsService, // ✨ NUEVO - P2 (2026-01-16)
    FlaggedContentService, // ✨ NUEVO - P2 (2026-01-16)
    MediaMetadataService, // ✨ NUEVO - P2 (2026-01-16)
    ModerationRulesService, // ✨ NUEVO - P2 (2026-01-16)
  ],
  controllers: [
    ContentTemplatesController,
    MarieCurieContentController,
    MediaFilesController,
    ContentAuthorsController, // ✨ NUEVO - P2
    ContentCategoriesController, // ✨ NUEVO - P2
    TagsController, // ✨ NUEVO - P2 (2026-01-16)
    ContentVersionsController, // ✨ NUEVO - P2 (2026-01-16)
    FlaggedContentController, // ✨ NUEVO - P2 (2026-01-16)
    MediaMetadataController, // ✨ NUEVO - P2 (2026-01-16)
    ModerationRulesController, // ✨ NUEVO - P2 (2026-01-16)
  ],
  exports: [
    ContentTemplatesService,
    MarieCurieContentService,
    MediaFilesService,
    ContentAuthorsService, // ✨ NUEVO - P2
    ContentCategoriesService, // ✨ NUEVO - P2
    TagsService, // ✨ NUEVO - P2 (2026-01-16)
    ContentVersionsService, // ✨ NUEVO - P2 (2026-01-16)
    FlaggedContentService, // ✨ NUEVO - P2 (2026-01-16)
    MediaMetadataService, // ✨ NUEVO - P2 (2026-01-16)
    ModerationRulesService, // ✨ NUEVO - P2 (2026-01-16)
  ],
})
export class ContentModule {}
