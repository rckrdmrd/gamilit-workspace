import { HttpStatus } from '@nestjs/common';
import { DomainError } from './domain-error.base';

export class BusinessRuleError extends DomainError {
  constructor(message: string, code: string = 'BUSINESS_RULE_VIOLATION') {
    super(message, code, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
