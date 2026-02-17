import { HttpStatus } from '@nestjs/common';
import {
  DomainError,
  NotFoundError,
  ValidationError,
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
  BusinessRuleError,
} from '../index';

describe('Domain Errors', () => {
  describe('NotFoundError', () => {
    it('should create with entity and identifier', () => {
      const error = new NotFoundError('User', '123');
      expect(error.message).toBe('User with ID 123 not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.httpStatus).toBe(HttpStatus.NOT_FOUND);
      expect(error.name).toBe('NotFoundError');
    });

    it('should create with entity only', () => {
      const error = new NotFoundError('User');
      expect(error.message).toBe('User not found');
    });

    it('should be instanceof DomainError', () => {
      const error = new NotFoundError('User');
      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe('ValidationError', () => {
    it('should create with message', () => {
      const error = new ValidationError('Invalid email');
      expect(error.message).toBe('Invalid email');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.httpStatus).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should accept custom code', () => {
      const error = new ValidationError('Too short', 'MIN_LENGTH');
      expect(error.code).toBe('MIN_LENGTH');
    });
  });

  describe('ConflictError', () => {
    it('should have 409 status', () => {
      const error = new ConflictError('Already exists');
      expect(error.httpStatus).toBe(HttpStatus.CONFLICT);
    });
  });

  describe('ForbiddenError', () => {
    it('should have default message', () => {
      const error = new ForbiddenError();
      expect(error.message).toBe('Access forbidden');
      expect(error.httpStatus).toBe(HttpStatus.FORBIDDEN);
    });
  });

  describe('UnauthorizedError', () => {
    it('should have 401 status', () => {
      const error = new UnauthorizedError();
      expect(error.httpStatus).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('BusinessRuleError', () => {
    it('should have 422 status', () => {
      const error = new BusinessRuleError('Insufficient funds');
      expect(error.httpStatus).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(error.code).toBe('BUSINESS_RULE_VIOLATION');
    });
  });

  describe('toJSON', () => {
    it('should return structured object', () => {
      const error = new NotFoundError('User', '123');
      const json = error.toJSON();
      expect(json).toEqual({
        error: 'NotFoundError',
        code: 'NOT_FOUND',
        message: 'User with ID 123 not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    });
  });
});
