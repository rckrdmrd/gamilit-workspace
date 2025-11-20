import { IsObject, IsNotEmpty } from 'class-validator';

/**
 * TribunalOpinionesAnswersDto
 *
 * @description DTO for validating Tribunal de Opiniones (Module 3.1) answers
 * Ethical dilemma questions with multiple choice answers
 *
 * Expected format:
 * {
 *   "q1": "option_b",
 *   "q2": "option_a",
 *   "q3": "option_c"
 * }
 *
 * Note: Removed @ValidateNested() and nested class with index signature.
 * class-validator doesn't handle index signatures well, causing validation to always fail.
 * Using @IsObject() and @IsNotEmpty() provides sufficient validation.
 */
export class TribunalOpinionesAnswersDto {
  /**
   * Object mapping question IDs to selected option IDs
   */
  @IsObject({ message: 'questions must be an object' })
  @IsNotEmpty({ message: 'questions object is required' })
  questions!: Record<string, string>;

  constructor() {
    this.questions = {};
  }
}
