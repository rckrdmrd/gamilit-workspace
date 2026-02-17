import { HttpStatus } from '@nestjs/common';
import { DomainError } from './domain-error.base';

export class NotFoundError extends DomainError {
  constructor(entity: string, identifier?: string) {
    const message = identifier
      ? `${entity} with ID ${identifier} not found`
      : `${entity} not found`;
    super(message, 'NOT_FOUND', HttpStatus.NOT_FOUND);
  }
}
