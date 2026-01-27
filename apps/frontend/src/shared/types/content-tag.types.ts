/**
 * Content Tag Types
 *
 * @description Types for content tagging system (educational_content.content_tags)
 * @see backend: modules/educational/entities/content-tag.entity.ts
 * @created TASK-022 P1-3 - DDL-Entity coherence
 */

export type ContentTagContentType = 'module' | 'exercise' | 'assignment' | 'resource';

export interface ContentTag {
  id: string;
  content_type: ContentTagContentType;
  content_id: string;
  tag: string;
  tag_category?: string | null;
  created_by?: string | null;
  created_at?: string;
}
