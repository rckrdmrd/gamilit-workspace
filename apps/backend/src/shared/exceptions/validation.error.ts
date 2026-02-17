import { HttpStatus } from '@nestjs/common';
import { DomainError } from './domain-error.base';

export class ValidationError extends DomainError {
  constructor(message: string, code: string = 'VALIDATION_ERROR') {
    super(message, code, HttpStatus.BAD_REQUEST);
  }
}
