import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';

/**
 * RuedaInferenciasAnswersDto
 *
 * @description DTO for validating Rueda de Inferencias (Module 2.5) answers
 * Students select correct inferences from a list of options
 *
 * Expected format:
 * {
 *   "selectedInferences": ["inf1", "inf3", "inf5"]
 * }
 */
export class RuedaInferenciasAnswersDto {
  /**
   * Array of selected inference IDs (correct + incorrect mixed)
   */
  @IsArray()
  @ArrayNotEmpty({ message: 'selectedInferences array cannot be empty' })
  @IsString({ each: true, message: 'Each inference ID must be a string' })
  selectedInferences!: string[];
}
