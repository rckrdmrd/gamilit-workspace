/**
 * Educational DTOs - Barrel Export
 *
 * @description Exporta todos los DTOs del módulo de contenido educativo.
 * @usage import { CreateModuleDto, ModuleResponseDto, CreateExerciseDto, ExerciseResponseDto } from '@/modules/educational/dto';
 */

// Module DTOs
export * from './modules/create-module.dto';
export * from './modules/module-response.dto';
export * from './modules/get-modules-query.dto';

// Exercise DTOs
export * from './exercises/create-exercise.dto';
export * from './exercises/exercise-response.dto';
export * from './exercises/submit-exercise.dto';
export * from './exercises/submit-exercise-response.dto';

// Assessment Rubric DTOs
export * from './rubrics/create-rubric.dto';
export * from './rubrics/rubric-response.dto';

// Media Resource DTOs
export * from './media/upload-media.dto';
export * from './media/media-response.dto';

// Exercise Mechanic Mapping DTOs (Sistema Dual - ADR-008)
export * from './mechanic-mapping/query-mechanic-mapping.dto';
export * from './mechanic-mapping/mechanic-mapping-response.dto';

// Module 4 Exercise Answer DTOs
export * from './module4';

// Module 5 Exercise Answer DTOs
export * from './module5';
