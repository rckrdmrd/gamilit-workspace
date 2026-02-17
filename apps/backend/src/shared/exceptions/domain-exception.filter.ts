import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from './domain-error.base';

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(exception.httpStatus).json({
      success: false,
      error: {
        code: exception.code,
        message: exception.message,
        ...(process.env.NODE_ENV === 'development' && {
          type: exception.name,
          stack: exception.stack?.substring(0, 1000),
        }),
      },
    });
  }
}
