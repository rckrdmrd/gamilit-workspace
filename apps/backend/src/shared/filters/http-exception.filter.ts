/**
 * HTTP Exception Filter
 *
 * Centralized exception handling for NestJS application.
 * Migrated from Express error.middleware.ts
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { logger } from '@shared/utils/logger.util';

/**
 * Custom Application Error
 *
 * Extended HttpException for application-specific errors.
 */
export class AppError extends HttpException {
  public code: string;

  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message, statusCode);
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * All Exceptions Filter
 *
 * Catches ALL exceptions (not just HttpException) and sends appropriate response.
 * IMPORTANT: This catches everything, including plain Errors and TypeORM errors.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        code = responseObj.error || this.mapHttpStatusToCode(status);
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      // In development, show full error details
      if (process.env.NODE_ENV === 'development') {
        message = `${exception.name}: ${exception.message}`;
      }
    }

    // Log error
    if (status >= 500) {
      logger.error('Server error:', exception);
      console.error('AllExceptionsFilter caught:', exception);
    }

    response.status(status).json({
      statusCode: status,
      message,
      code,
      ...(process.env.NODE_ENV === 'development' && exception instanceof Error && {
        stack: exception.stack?.substring(0, 1000),
      }),
    });
  }

  private mapHttpStatusToCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST: return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED: return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN: return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND: return 'NOT_FOUND';
      default: return 'INTERNAL_ERROR';
    }
  }
}

/**
 * HTTP Exception Filter
 *
 * Catches all HTTP exceptions and sends appropriate response.
 * Handles both NestJS HttpException and custom AppError instances.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Extract status code
    const status = exception.getStatus();

    // Default error values
    let code = 'INTERNAL_ERROR';
    let message = 'Internal server error';

    // Get exception response
    const exceptionResponse = exception.getResponse();

    // Handle custom AppError
    if (exception instanceof AppError) {
      code = exception.code;
      message = exception.message;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      // Handle NestJS validation errors and other structured responses
      const responseObj = exceptionResponse as any;

      if (responseObj.message) {
        message = Array.isArray(responseObj.message)
          ? responseObj.message.join(', ')
          : responseObj.message;
      }

      if (responseObj.error) {
        code = this.mapHttpStatusToCode(status, responseObj.error);
      } else {
        code = this.mapHttpStatusToCode(status);
      }
    } else if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
      code = this.mapHttpStatusToCode(status);
    }

    // Handle specific error types by name
    const errorName = exception.name;

    if (errorName === 'ValidationError') {
      code = 'VALIDATION_ERROR';
    }

    if (errorName === 'UnauthorizedError' || status === HttpStatus.UNAUTHORIZED) {
      code = 'UNAUTHORIZED';
      message = message === 'Internal server error' ? 'Unauthorized access' : message;
    }

    if (status === HttpStatus.NOT_FOUND) {
      code = 'NOT_FOUND';
      message = message === 'Internal server error'
        ? `Route ${request.method} ${request.path} not found`
        : message;
    }

    // Log error
    if (status >= 500) {
      logger.error('Internal server error:', exception);
    } else {
      logger.warn(`Error ${status}: ${message}`);
    }

    // Send error response
    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        ...(process.env.NODE_ENV === 'development' && {
          stack: exception.stack,
          path: request.url,
          timestamp: new Date().toISOString(),
        }),
      },
    });
  }

  /**
   * Map HTTP status code to error code string
   */
  private mapHttpStatusToCode(status: number, errorType?: string): string {
    if (errorType) {
      return errorType.toUpperCase().replace(/\s+/g, '_');
    }

    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'VALIDATION_ERROR';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'TOO_MANY_REQUESTS';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'INTERNAL_ERROR';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'SERVICE_UNAVAILABLE';
      default:
        return 'UNKNOWN_ERROR';
    }
  }
}

/**
 * Not Found Exception
 *
 * Throws a 404 exception for undefined routes.
 * Use in main.ts or app.module.ts for global 404 handling.
 */
export class NotFoundException extends HttpException {
  constructor(method: string, path: string) {
    super(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Route ${method} ${path} not found`,
        },
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
