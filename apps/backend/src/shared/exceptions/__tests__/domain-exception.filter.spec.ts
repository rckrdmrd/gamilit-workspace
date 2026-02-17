import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { DomainExceptionFilter } from '../domain-exception.filter';
import { NotFoundError } from '../not-found.error';
import { BusinessRuleError } from '../business-rule.error';

describe('DomainExceptionFilter', () => {
  let filter: DomainExceptionFilter;
  let mockResponse: any;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new DomainExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => ({}),
      }),
    } as any;
  });

  it('should handle NotFoundError', () => {
    const error = new NotFoundError('User', '123');
    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'NOT_FOUND',
          message: 'User with ID 123 not found',
        }),
      }),
    );
  });

  it('should handle BusinessRuleError', () => {
    const error = new BusinessRuleError('Insufficient funds', 'INSUFFICIENT_FUNDS');
    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'INSUFFICIENT_FUNDS',
        }),
      }),
    );
  });
});
