import { HttpStatus } from '@nestjs/common';
import { DomainError } from './domain-error.base';

export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Unauthorized', code: string = 'UNAUTHORIZED') {
    super(message, code, HttpStatus.UNAUTHORIZED);
  }
}
