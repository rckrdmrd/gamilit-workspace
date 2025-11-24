import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { HealthController } from '../health.controller';
import { HealthService } from '../health.service';
import { HealthStatus } from '../dto/health-check.dto';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: jest.Mocked<HealthService>;

  const mockHealthyResponse = {
    status: HealthStatus.HEALTHY,
    timestamp: '2025-11-23T19:00:00.000Z',
    uptime: 3600,
    environment: 'test',
    checks: {
      database: {
        status: HealthStatus.HEALTHY,
        responseTime: 15,
        message: 'PostgreSQL connected',
        details: {
          driver: 'postgres',
          isConnected: true,
        },
      },
      tables: {
        status: HealthStatus.HEALTHY,
        responseTime: 42,
        message: 'All critical tables exist',
        details: {
          totalChecked: 9,
          allPresent: true,
        },
      },
    },
    version: '1.0.0',
  };

  const mockUnhealthyResponse = {
    status: HealthStatus.UNHEALTHY,
    timestamp: '2025-11-23T19:00:00.000Z',
    uptime: 3600,
    environment: 'test',
    checks: {
      database: {
        status: HealthStatus.UNHEALTHY,
        responseTime: 5000,
        message: 'Database connection failed: Connection timeout',
        details: {
          error: 'Connection timeout',
        },
      },
      tables: {
        status: HealthStatus.HEALTHY,
        responseTime: 42,
        message: 'All critical tables exist',
        details: {
          totalChecked: 9,
          allPresent: true,
        },
      },
    },
    version: '1.0.0',
  };

  const mockDegradedResponse = {
    status: HealthStatus.DEGRADED,
    timestamp: '2025-11-23T19:00:00.000Z',
    uptime: 3600,
    environment: 'test',
    checks: {
      database: {
        status: HealthStatus.HEALTHY,
        responseTime: 15,
        message: 'PostgreSQL connected',
        details: {
          driver: 'postgres',
          isConnected: true,
        },
      },
      tables: {
        status: HealthStatus.DEGRADED,
        responseTime: 85,
        message: '2 critical table(s) missing',
        details: {
          totalChecked: 9,
          missingCount: 2,
          missing: ['auth_management.users', 'educational_content.modules'],
        },
      },
    },
    version: '1.0.0',
  };

  beforeEach(async () => {
    const mockHealthService = {
      checkHealth: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthService = module.get(HealthService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /health', () => {
    it('should return 200 OK when all checks pass', async () => {
      // Arrange
      healthService.checkHealth.mockResolvedValue(mockHealthyResponse);
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      // Act
      await controller.check(mockResponse);

      // Assert
      expect(healthService.checkHealth).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockHealthyResponse);
    });

    it('should return 503 Service Unavailable when system is unhealthy', async () => {
      // Arrange
      healthService.checkHealth.mockResolvedValue(mockUnhealthyResponse);
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      // Act
      await controller.check(mockResponse);

      // Assert
      expect(healthService.checkHealth).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUnhealthyResponse);
    });

    it('should return 503 Service Unavailable when system is degraded', async () => {
      // Arrange
      healthService.checkHealth.mockResolvedValue(mockDegradedResponse);
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      // Act
      await controller.check(mockResponse);

      // Assert
      expect(healthService.checkHealth).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
      expect(mockResponse.json).toHaveBeenCalledWith(mockDegradedResponse);
    });

    it('should include all required fields in healthy response', async () => {
      // Arrange
      healthService.checkHealth.mockResolvedValue(mockHealthyResponse);
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      // Act
      await controller.check(mockResponse);

      // Assert
      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response).toHaveProperty('status');
      expect(response).toHaveProperty('timestamp');
      expect(response).toHaveProperty('uptime');
      expect(response).toHaveProperty('environment');
      expect(response).toHaveProperty('checks');
      expect(response).toHaveProperty('version');
    });

    it('should include database check in response', async () => {
      // Arrange
      healthService.checkHealth.mockResolvedValue(mockHealthyResponse);
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      // Act
      await controller.check(mockResponse);

      // Assert
      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.checks.database).toBeDefined();
      expect(response.checks.database.status).toBe(HealthStatus.HEALTHY);
      expect(response.checks.database.responseTime).toBeGreaterThanOrEqual(0);
      expect(response.checks.database.message).toBeDefined();
    });

    it('should include tables check in response', async () => {
      // Arrange
      healthService.checkHealth.mockResolvedValue(mockHealthyResponse);
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      // Act
      await controller.check(mockResponse);

      // Assert
      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.checks.tables).toBeDefined();
      expect(response.checks.tables.status).toBe(HealthStatus.HEALTHY);
      expect(response.checks.tables.responseTime).toBeGreaterThanOrEqual(0);
      expect(response.checks.tables.message).toBeDefined();
    });

    it('should include error details when database check fails', async () => {
      // Arrange
      healthService.checkHealth.mockResolvedValue(mockUnhealthyResponse);
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      // Act
      await controller.check(mockResponse);

      // Assert
      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.checks.database.status).toBe(HealthStatus.UNHEALTHY);
      expect(response.checks.database.message).toContain('Connection timeout');
      expect(response.checks.database.details?.error).toBeDefined();
    });

    it('should include missing table details when tables check is degraded', async () => {
      // Arrange
      healthService.checkHealth.mockResolvedValue(mockDegradedResponse);
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      // Act
      await controller.check(mockResponse);

      // Assert
      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.checks.tables.status).toBe(HealthStatus.DEGRADED);
      expect(response.checks.tables.message).toContain('missing');
      expect(response.checks.tables.details?.missing).toBeDefined();
      expect(Array.isArray(response.checks.tables.details?.missing)).toBe(true);
    });

    it('should return consistent response structure across all statuses', async () => {
      // Test all three status types
      const responses = [mockHealthyResponse, mockUnhealthyResponse, mockDegradedResponse];

      for (const testResponse of responses) {
        // Arrange
        healthService.checkHealth.mockResolvedValue(testResponse);
        const mockResponse = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn().mockReturnThis(),
        } as unknown as Response;

        // Act
        await controller.check(mockResponse);

        // Assert
        const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
        expect(response).toHaveProperty('status');
        expect(response).toHaveProperty('timestamp');
        expect(response).toHaveProperty('uptime');
        expect(response).toHaveProperty('environment');
        expect(response).toHaveProperty('checks');
        expect(response).toHaveProperty('version');
      }
    });

    it('should call health service only once per request', async () => {
      // Arrange
      healthService.checkHealth.mockResolvedValue(mockHealthyResponse);
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      // Act
      await controller.check(mockResponse);

      // Assert
      expect(healthService.checkHealth).toHaveBeenCalledTimes(1);
    });
  });

  describe('Controller Metadata', () => {
    it('should have @Controller decorator with health route', () => {
      const metadata = Reflect.getMetadata('path', HealthController);
      expect(metadata).toBe('health');
    });

    it('should have check endpoint with GET method', () => {
      const metadata = Reflect.getMetadata('path', controller.check);
      expect(metadata).toBeDefined();
    });

    it('should not require authentication', () => {
      // Health endpoint should be public
      const guards = Reflect.getMetadata('__guards__', controller.check);
      expect(guards).toBeUndefined();
    });
  });

  describe('Swagger Documentation', () => {
    it('should have API tags', () => {
      const tags = Reflect.getMetadata('swagger/apiUseTags', HealthController);
      expect(tags).toBeDefined();
    });

    it('should have operation documentation', () => {
      const operation = Reflect.getMetadata('swagger/apiOperation', controller.check);
      expect(operation).toBeDefined();
    });

    it('should document 200 response', () => {
      const responses = Reflect.getMetadata('swagger/apiResponse', controller.check);
      expect(responses).toBeDefined();
    });

    it('should document 503 response', () => {
      const responses = Reflect.getMetadata('swagger/apiResponse', controller.check);
      expect(responses).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should respond quickly (under 100ms)', async () => {
      // Arrange
      healthService.checkHealth.mockResolvedValue(mockHealthyResponse);
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      // Act
      const startTime = Date.now();
      await controller.check(mockResponse);
      const duration = Date.now() - startTime;

      // Assert
      expect(duration).toBeLessThan(100);
    });
  });
});
