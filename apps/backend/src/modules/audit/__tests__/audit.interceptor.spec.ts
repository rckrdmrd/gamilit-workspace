/**
 * AuditInterceptor Unit Tests
 *
 * Tests for the HTTP request audit interceptor.
 * Covers request logging, skip patterns, and error handling.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AuditInterceptor } from '../interceptors/audit.interceptor';
import { AuditService } from '../services/audit.service';
import { Status } from '../entities/audit-log.entity';

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor;
  let auditService: jest.Mocked<AuditService>;

  const mockAuditService = {
    logEvent: jest.fn(),
  };

  // Helper to create mock ExecutionContext
  const createMockExecutionContext = (
    method: string,
    url: string,
    body: any = {},
    user: any = null,
    headers: Record<string, string> = {},
    remoteAddress: string = '127.0.0.1',
  ): ExecutionContext => {
    const mockRequest = {
      method,
      url,
      body,
      user,
      headers: {
        'user-agent': 'Test Agent',
        ...headers,
      },
      socket: {
        remoteAddress,
      },
    };

    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;
  };

  // Helper to create mock CallHandler
  const createMockCallHandler = (response: any = {}): CallHandler => ({
    handle: jest.fn().mockReturnValue(of(response)),
  });

  const createErrorCallHandler = (error: any): CallHandler => ({
    handle: jest.fn().mockReturnValue(throwError(() => error)),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditInterceptor,
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    interceptor = module.get<AuditInterceptor>(AuditInterceptor);
    auditService = module.get(AuditService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('intercept', () => {
    describe('skip patterns', () => {
      it('should skip audit for /health endpoint', (done) => {
        // Arrange
        const context = createMockExecutionContext('GET', '/health');
        const callHandler = createMockCallHandler();

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          complete: () => {
            // Assert
            expect(auditService.logEvent).not.toHaveBeenCalled();
            done();
          },
        });
      });

      it('should skip audit for /metrics endpoint', (done) => {
        // Arrange
        const context = createMockExecutionContext('GET', '/metrics');
        const callHandler = createMockCallHandler();

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          complete: () => {
            expect(auditService.logEvent).not.toHaveBeenCalled();
            done();
          },
        });
      });

      it('should skip audit for /api/auth/refresh endpoint', (done) => {
        // Arrange
        const context = createMockExecutionContext('POST', '/api/auth/refresh');
        const callHandler = createMockCallHandler();

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          complete: () => {
            expect(auditService.logEvent).not.toHaveBeenCalled();
            done();
          },
        });
      });

      it('should skip audit for /api/notifications endpoint', (done) => {
        // Arrange
        const context = createMockExecutionContext('GET', '/api/notifications');
        const callHandler = createMockCallHandler();

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          complete: () => {
            expect(auditService.logEvent).not.toHaveBeenCalled();
            done();
          },
        });
      });

      it('should skip audit for /socket.io connections', (done) => {
        // Arrange
        const context = createMockExecutionContext('GET', '/socket.io/?transport=polling');
        const callHandler = createMockCallHandler();

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          complete: () => {
            expect(auditService.logEvent).not.toHaveBeenCalled();
            done();
          },
        });
      });
    });

    describe('HTTP method filtering', () => {
      it('should log POST requests', (done) => {
        // Arrange
        const context = createMockExecutionContext('POST', '/api/users', { name: 'John' });
        const callHandler = createMockCallHandler({ id: 'user-1' });
        mockAuditService.logEvent.mockResolvedValue(undefined);

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          complete: () => {
            expect(auditService.logEvent).toHaveBeenCalledWith(
              expect.objectContaining({
                eventType: 'http_post_create',
                action: 'create',
              }),
            );
            done();
          },
        });
      });

      it('should log PUT requests', (done) => {
        // Arrange
        const context = createMockExecutionContext('PUT', '/api/users/123', { name: 'Jane' });
        const callHandler = createMockCallHandler();
        mockAuditService.logEvent.mockResolvedValue(undefined);

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          complete: () => {
            expect(auditService.logEvent).toHaveBeenCalledWith(
              expect.objectContaining({
                eventType: 'http_put_update',
                action: 'update',
              }),
            );
            done();
          },
        });
      });

      it('should log PATCH requests', (done) => {
        // Arrange
        const context = createMockExecutionContext('PATCH', '/api/users/123', { status: 'active' });
        const callHandler = createMockCallHandler();
        mockAuditService.logEvent.mockResolvedValue(undefined);

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          complete: () => {
            expect(auditService.logEvent).toHaveBeenCalledWith(
              expect.objectContaining({
                eventType: 'http_patch_update',
                action: 'update',
              }),
            );
            done();
          },
        });
      });

      it('should log DELETE requests', (done) => {
        // Arrange
        const context = createMockExecutionContext('DELETE', '/api/users/123');
        const callHandler = createMockCallHandler();
        mockAuditService.logEvent.mockResolvedValue(undefined);

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          complete: () => {
            expect(auditService.logEvent).toHaveBeenCalledWith(
              expect.objectContaining({
                eventType: 'http_delete_delete',
                action: 'delete',
              }),
            );
            done();
          },
        });
      });

      it('should NOT log GET requests (success)', (done) => {
        // Arrange
        const context = createMockExecutionContext('GET', '/api/users');
        const callHandler = createMockCallHandler([]);

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          complete: () => {
            expect(auditService.logEvent).not.toHaveBeenCalled();
            done();
          },
        });
      });

      it('should NOT log HEAD requests (success)', (done) => {
        // Arrange
        const context = createMockExecutionContext('HEAD', '/api/users');
        const callHandler = createMockCallHandler();

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          complete: () => {
            expect(auditService.logEvent).not.toHaveBeenCalled();
            done();
          },
        });
      });

      it('should NOT log OPTIONS requests (success)', (done) => {
        // Arrange
        const context = createMockExecutionContext('OPTIONS', '/api/users');
        const callHandler = createMockCallHandler();

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          complete: () => {
            expect(auditService.logEvent).not.toHaveBeenCalled();
            done();
          },
        });
      });
    });

    describe('error handling', () => {
      it('should log errors for all methods including GET', (done) => {
        // Arrange
        const context = createMockExecutionContext('GET', '/api/users');
        const error = { status: 500, message: 'Internal server error', stack: 'Error stack' };
        const callHandler = createErrorCallHandler(error);
        mockAuditService.logEvent.mockResolvedValue(undefined);

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          error: () => {
            expect(auditService.logEvent).toHaveBeenCalledWith(
              expect.objectContaining({
                status: Status.FAILURE,
                errorCode: '500',
                errorMessage: 'Internal server error',
              }),
            );
            done();
          },
        });
      });

      it('should include stack trace in error logs', (done) => {
        // Arrange
        const context = createMockExecutionContext('POST', '/api/users');
        const error = {
          status: 400,
          message: 'Validation failed',
          stack: 'Error: Validation failed\n    at ...',
        };
        const callHandler = createErrorCallHandler(error);
        mockAuditService.logEvent.mockResolvedValue(undefined);

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          error: () => {
            expect(auditService.logEvent).toHaveBeenCalledWith(
              expect.objectContaining({
                stackTrace: error.stack,
              }),
            );
            done();
          },
        });
      });
    });

    describe('actor extraction', () => {
      it('should extract actorId from user.userId', (done) => {
        // Arrange
        const context = createMockExecutionContext(
          'POST',
          '/api/users',
          {},
          { userId: 'user-123' },
        );
        const callHandler = createMockCallHandler();
        mockAuditService.logEvent.mockResolvedValue(undefined);

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          complete: () => {
            expect(auditService.logEvent).toHaveBeenCalledWith(
              expect.objectContaining({
                actorId: 'user-123',
              }),
            );
            done();
          },
        });
      });

      it('should extract actorId from user.sub (JWT)', (done) => {
        // Arrange
        const context = createMockExecutionContext('POST', '/api/users', {}, { sub: 'jwt-user-456' });
        const callHandler = createMockCallHandler();
        mockAuditService.logEvent.mockResolvedValue(undefined);

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          complete: () => {
            expect(auditService.logEvent).toHaveBeenCalledWith(
              expect.objectContaining({
                actorId: 'jwt-user-456',
              }),
            );
            done();
          },
        });
      });

      it('should use SYSTEM actor type when no user present', (done) => {
        // Arrange
        const context = createMockExecutionContext('POST', '/api/system/webhook');
        const callHandler = createMockCallHandler();
        mockAuditService.logEvent.mockResolvedValue(undefined);

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          complete: () => {
            expect(auditService.logEvent).toHaveBeenCalledWith(
              expect.objectContaining({
                actorType: 'system',
              }),
            );
            done();
          },
        });
      });
    });

    describe('IP address extraction', () => {
      it('should extract IP from x-forwarded-for header', (done) => {
        // Arrange
        const context = createMockExecutionContext(
          'POST',
          '/api/users',
          {},
          null,
          { 'x-forwarded-for': '203.0.113.195, 70.41.3.18' },
        );
        const callHandler = createMockCallHandler();
        mockAuditService.logEvent.mockResolvedValue(undefined);

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          complete: () => {
            expect(auditService.logEvent).toHaveBeenCalledWith(
              expect.objectContaining({
                actorIp: '203.0.113.195',
              }),
            );
            done();
          },
        });
      });

      it('should extract IP from x-real-ip header', (done) => {
        // Arrange
        const context = createMockExecutionContext('POST', '/api/users', {}, null, {
          'x-real-ip': '192.168.1.100',
        });
        const callHandler = createMockCallHandler();
        mockAuditService.logEvent.mockResolvedValue(undefined);

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          complete: () => {
            expect(auditService.logEvent).toHaveBeenCalledWith(
              expect.objectContaining({
                actorIp: '192.168.1.100',
              }),
            );
            done();
          },
        });
      });

      it('should fallback to socket remoteAddress', (done) => {
        // Arrange
        const context = createMockExecutionContext('POST', '/api/users', {}, null, {}, '10.0.0.5');
        const callHandler = createMockCallHandler();
        mockAuditService.logEvent.mockResolvedValue(undefined);

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          complete: () => {
            expect(auditService.logEvent).toHaveBeenCalledWith(
              expect.objectContaining({
                actorIp: '10.0.0.5',
              }),
            );
            done();
          },
        });
      });
    });

    describe('URL parsing', () => {
      it('should extract resource type from URL', (done) => {
        // Arrange
        const context = createMockExecutionContext('POST', '/api/v1/organizations');
        const callHandler = createMockCallHandler();
        mockAuditService.logEvent.mockResolvedValue(undefined);

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          complete: () => {
            expect(auditService.logEvent).toHaveBeenCalledWith(
              expect.objectContaining({
                resourceType: 'organizations',
              }),
            );
            done();
          },
        });
      });

      it('should extract resource ID (UUID) from URL', (done) => {
        // Arrange
        const uuid = '550e8400-e29b-41d4-a716-446655440000';
        const context = createMockExecutionContext('PUT', `/api/v1/users/${uuid}`);
        const callHandler = createMockCallHandler();
        mockAuditService.logEvent.mockResolvedValue(undefined);

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          complete: () => {
            expect(auditService.logEvent).toHaveBeenCalledWith(
              expect.objectContaining({
                resourceId: uuid,
              }),
            );
            done();
          },
        });
      });

      it('should strip query string from URL', (done) => {
        // Arrange
        const context = createMockExecutionContext('DELETE', '/api/v1/items/123?force=true');
        const callHandler = createMockCallHandler();
        mockAuditService.logEvent.mockResolvedValue(undefined);

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          complete: () => {
            expect(auditService.logEvent).toHaveBeenCalledWith(
              expect.objectContaining({
                description: 'DELETE /api/v1/items/123?force=true',
              }),
            );
            done();
          },
        });
      });
    });

    describe('body sanitization', () => {
      it('should redact password fields', (done) => {
        // Arrange
        const context = createMockExecutionContext('POST', '/api/auth/register', {
          email: 'user@test.com',
          password: 'secret123',
          name: 'John',
        });
        const callHandler = createMockCallHandler();
        mockAuditService.logEvent.mockResolvedValue(undefined);

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          complete: () => {
            expect(auditService.logEvent).toHaveBeenCalledWith(
              expect.objectContaining({
                additionalData: expect.objectContaining({
                  body: expect.objectContaining({
                    password: '[REDACTED]',
                    email: 'user@test.com',
                    name: 'John',
                  }),
                }),
              }),
            );
            done();
          },
        });
      });

      it('should redact token fields', (done) => {
        // Arrange
        const context = createMockExecutionContext('POST', '/api/auth/token', {
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          accessToken: 'another-token',
        });
        const callHandler = createMockCallHandler();
        mockAuditService.logEvent.mockResolvedValue(undefined);

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          complete: () => {
            expect(auditService.logEvent).toHaveBeenCalledWith(
              expect.objectContaining({
                additionalData: expect.objectContaining({
                  body: expect.objectContaining({
                    refreshToken: '[REDACTED]',
                    accessToken: '[REDACTED]',
                  }),
                }),
              }),
            );
            done();
          },
        });
      });

      it('should redact apiKey and secret fields', (done) => {
        // Arrange
        const context = createMockExecutionContext('POST', '/api/integrations', {
          name: 'My Integration',
          apiKey: 'sk_live_abc123',
          secret: 'my-secret-value',
        });
        const callHandler = createMockCallHandler();
        mockAuditService.logEvent.mockResolvedValue(undefined);

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          complete: () => {
            expect(auditService.logEvent).toHaveBeenCalledWith(
              expect.objectContaining({
                additionalData: expect.objectContaining({
                  body: expect.objectContaining({
                    name: 'My Integration',
                    apiKey: '[REDACTED]',
                    secret: '[REDACTED]',
                  }),
                }),
              }),
            );
            done();
          },
        });
      });
    });

    describe('duration tracking', () => {
      it('should include request duration in additional data', (done) => {
        // Arrange
        const context = createMockExecutionContext('POST', '/api/users');
        const callHandler = createMockCallHandler();
        mockAuditService.logEvent.mockResolvedValue(undefined);

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          complete: () => {
            expect(auditService.logEvent).toHaveBeenCalledWith(
              expect.objectContaining({
                additionalData: expect.objectContaining({
                  duration: expect.any(Number),
                }),
              }),
            );
            done();
          },
        });
      });
    });

    describe('silent failure', () => {
      it('should not throw when audit logging fails', (done) => {
        // Arrange
        const context = createMockExecutionContext('POST', '/api/users');
        const callHandler = createMockCallHandler({ id: 'new-user' });
        mockAuditService.logEvent.mockRejectedValue(new Error('Audit service unavailable'));

        // Act
        interceptor.intercept(context, callHandler).subscribe({
          next: (result) => {
            // Assert - request should still succeed
            expect(result).toEqual({ id: 'new-user' });
          },
          complete: () => {
            done();
          },
        });
      });
    });
  });
});
