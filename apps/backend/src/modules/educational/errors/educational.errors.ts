import { NotFoundError, ValidationError } from '@shared/exceptions';

export class ExerciseNotFoundError extends NotFoundError {
  constructor(exerciseId?: string) {
    super('Exercise', exerciseId);
  }
}

export class InvalidExerciseContentError extends ValidationError {
  constructor(message: string) {
    super(message, 'INVALID_EXERCISE_CONTENT');
  }
}

export class HintsDisabledError extends ValidationError {
  constructor() {
    super('Hints are disabled for this exercise', 'HINTS_DISABLED');
  }
}
