import { PartialType } from '@nestjs/swagger';
import { CreateExerciseTypeRubricDto } from './create-exercise-type-rubric.dto';

/**
 * UpdateExerciseTypeRubricDto
 *
 * @description DTO para actualizar una rubrica por tipo de ejercicio.
 *              Todos los campos son opcionales.
 */
export class UpdateExerciseTypeRubricDto extends PartialType(CreateExerciseTypeRubricDto) {}
