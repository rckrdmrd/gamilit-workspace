import { HttpStatus } from '@nestjs/common';
import { DomainError } from './domain-error.base';

export class ForbiddenError extends DomainError {
  constructor(message: string = 'Access forbidden', code: string = 'FORBIDDEN') {
    super(message, code, HttpStatus.FORBIDDEN);
  }
}
