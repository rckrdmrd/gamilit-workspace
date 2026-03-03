import { NotFoundError, ValidationError, ConflictError } from '@shared/exceptions';

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

export class ModuleNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super('Module', id);
  }
}

export class ExerciseTypeNotSupportedError extends ValidationError {
  constructor(type: string) {
    super(`Exercise type '${type}' is not supported`, 'EXERCISE_TYPE_NOT_SUPPORTED');
  }
}

export class InvalidExerciseConfigError extends ValidationError {
  constructor(reason: string) {
    super(`Exercise configuration is invalid: ${reason}`, 'INVALID_EXERCISE_CONFIG');
  }
}

export class MediaResourceNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super('Media resource', id);
  }
}

export class ExerciseAlreadyExistsError extends ConflictError {
  constructor(slug: string) {
    super(`Exercise with slug '${slug}' already exists in module`, 'EXERCISE_ALREADY_EXISTS');
  }
}
