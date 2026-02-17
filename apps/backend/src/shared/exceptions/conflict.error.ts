import { HttpStatus } from '@nestjs/common';
import { DomainError } from './domain-error.base';

export class ConflictError extends DomainError {
  constructor(message: string, code: string = 'CONFLICT') {
    super(message, code, HttpStatus.CONFLICT);
  }
}
