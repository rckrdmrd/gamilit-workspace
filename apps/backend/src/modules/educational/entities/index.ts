/**
 * Educational Entities - Barrel Export
 *
 * @description Exporta todas las entities del módulo de contenido educativo.
 * @usage import { Module, Exercise, AssessmentRubric, MediaResource } from '@/modules/educational/entities';
 */

export * from './module.entity';
export * from './exercise.entity';
export * from './assessment-rubric.entity';
export * from './media-resource.entity';
export * from './media-attachment.entity';
export * from './exercise-mechanic-mapping.entity';
export * from './content-approval.entity';
export * from './difficulty-criteria.entity';
export * from './classroom-module.entity'; // ✨ NUEVO - P1-002 (Módulos asignados a aulas)
export * from './exercise-validation-config.entity'; // ✨ NUEVO - 2026-01-14 (Sistema Dual ADR-008)
export * from './exercise-type-rubric.entity'; // ✨ NUEVO - 2026-01-14 (Rúbricas por tipo M4-M5)
export * from './exercise-validation-audit.entity'; // ✨ NUEVO - 2026-01-14 (Auditoría de validaciones)
