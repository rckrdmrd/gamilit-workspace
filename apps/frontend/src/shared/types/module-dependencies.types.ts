/**
 * Module Dependencies Types
 *
 * @description Types for module prerequisite chains (educational_content.module_dependencies)
 * @see backend: modules/educational/entities/module-dependencies.entity.ts
 * @created TASK-022 - Frontend type coherence
 */

export type ModuleDependencyType = 'required' | 'recommended' | 'optional';

export interface ModuleDependency {
  id: string;
  module_id: string;
  prerequisite_module_id: string;
  dependency_type: ModuleDependencyType;
  minimum_completion_percentage: number;
  created_at?: string;
}
