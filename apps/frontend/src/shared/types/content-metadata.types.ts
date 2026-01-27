/**
 * Content Metadata Types
 *
 * @description Types for content metadata key-value pairs stored in educational_content.content_metadata
 * @see backend: modules/educational/entities/content-metadata.entity.ts
 * @created TASK-022 - Frontend type coherence
 */

export type ContentMetadataContentType = 'module' | 'exercise' | 'assignment' | 'resource';

export interface ContentMetadata {
  id: string;
  content_type: ContentMetadataContentType;
  content_id: string;
  metadata_key: string;
  metadata_value: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}
