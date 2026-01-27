/**
 * Taxonomy Types
 *
 * @description Types for educational taxonomies (Bloom, SOLO, Webb DOK, custom)
 * stored in educational_content.taxonomies
 * @see backend: modules/educational/entities/taxonomy.entity.ts
 * @created TASK-022 - Frontend type coherence
 */

export type TaxonomyType = 'bloom' | 'solo' | 'webb' | 'custom';

export interface TaxonomyLevel {
  level: number;
  name: string;
  description: string;
}

export interface Taxonomy {
  id: string;
  name: string;
  description?: string;
  taxonomy_type: TaxonomyType;
  levels: TaxonomyLevel[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
