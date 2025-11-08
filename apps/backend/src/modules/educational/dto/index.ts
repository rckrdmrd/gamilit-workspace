/**
 * Educational DTOs - Barrel Export
 *
 * @description Exporta todos los DTOs del módulo de contenido educativo.
 * @usage import { CreateModuleDto, ModuleResponseDto, CreateExerciseDto, ExerciseResponseDto } from '@/modules/educational/dto';
 */

// Module DTOs
export * from './modules/create-module.dto';
export * from './modules/module-response.dto';

// Exercise DTOs
export * from './exercises/create-exercise.dto';
export * from './exercises/exercise-response.dto';

// Assessment Rubric DTOs
export * from './rubrics/create-rubric.dto';
export * from './rubrics/rubric-response.dto';

// Media Resource DTOs
export * from './media/upload-media.dto';
export * from './media/media-response.dto';
