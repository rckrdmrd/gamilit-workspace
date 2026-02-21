import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { HealthService } from '../health.service';
import { HealthStatus } from '../dto/health-check.dto';

describe('HealthService', () => {
  let service: HealthService;
  let authDataSource: jest.Mocked<DataSource>;
  let educationalDataSource: jest.Mocked<DataSource>;
  let gamificationDataSource: jest.Mocked<DataSource>;
  let progressDataSource: jest.Mocked<DataSource>;
  let socialDataSource: jest.Mocked<DataSource>;
  let contentDataSource: jest.Mocked<DataSource>;
  let auditDataSource: jest.Mocked<DataSource>;
  let notificationsDataSource: jest.Mocked<DataSource>;
  let configService: jest.Mocked<ConfigService>;

  const createMockDataSource = (isHealthy = true): jest.Mocked<DataSource> => ({
    query: jest.fn().mockImplementation((sql: string, _params?: any[]) => {
      if (isHealthy) {
        if (sql.includes('SELECT 1')) {
          return Promise.resolve([{ '?column?': 1 }]);
        }
        if (sql.includes('information_schema.tables')) {
          return Promise.resolve([{ exists: true }]);
        }
      } else {
        return Promise.reject(new Error('Connection failed'));
      }
      return Promise.resolve([]);
    }),
    isInitialized: isHealthy,
  } as any);

  beforeEach(async () => {
    authDataSource = createMockDataSource();
    educationalDataSource = createMockDataSource();
    gamificationDataSource = createMockDataSource();
    progressDataSource = createMockDataSource();
    socialDataSource = createMockDataSource();
    contentDataSource = createMockDataSource();
    auditDataSource = createMockDataSource();
    notificationsDataSource = createMockDataSource();

    configService = {
      get: jest.fn().mockImplementation((key: string, defaultValue?: any) => {
        const config: Record<string, unknown> = {
          NODE_ENV: 'test',
          npm_package_version: '1.0.0',
        };
        return config[key] || defaultValue;
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: 'authDataSource', useValue: authDataSource },
        { provide: 'educationalDataSource', useValue: educationalDataSource },
        { provide: 'gamificationDataSource', useValue: gamificationDataSource },
        { provide: 'progressDataSource', useValue: progressDataSource },
        { provide: 'socialDataSource', useValue: socialDataSource },
        { provide: 'contentDataSource', useValue: contentDataSource },
        { provide: 'auditDataSource', useValue: auditDataSource },
        { provide: 'notificationsDataSource', useValue: notificationsDataSource },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);

    // Manually inject datasources (since we can't use @InjectDataSource in tests)
    (service as any).authDataSource = authDataSource;
    (service as any).educationalDataSource = educationalDataSource;
    (service as any).gamificationDataSource = gamificationDataSource;
    (service as any).progressDataSource = progressDataSource;
    (service as any).socialDataSource = socialDataSource;
    (service as any).contentDataSource = contentDataSource;
    (service as any).auditDataSource = auditDataSource;
    (service as any).notificationsDataSource = notificationsDataSource;

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('checkHealth', () => {
    it('should return healthy status when all checks pass', async () => {
      // Act
      const result = await service.checkHealth();

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(HealthStatus.HEALTHY);
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeGreaterThanOrEqual(0);
      expect(result.environment).toBe('test');
      expect(result.version).toBe('1.0.0');
      expect(result.checks.database).toBeDefined();
      expect(result.checks.database?.status).toBe(HealthStatus.HEALTHY);
      expect(result.checks.tables).toBeDefined();
      expect(result.checks.tables?.status).toBe(HealthStatus.HEALTHY);
    });

    it('should return unhealthy status when database check fails', async () => {
      // Arrange
      authDataSource.query.mockRejectedValue(new Error('Connection timeout'));

      // Act
      const result = await service.checkHealth();

      // Assert
      expect(result.status).toBe(HealthStatus.UNHEALTHY);
      expect(result.checks.database?.status).toBe(HealthStatus.UNHEALTHY);
      expect(result.checks.database?.message).toContain('Connection timeout');
    });

    it('should return degraded status when tables check shows missing tables', async () => {
      // Arrange
      authDataSource.query.mockImplementation((sql: string) => {
        if (sql.includes('SELECT 1')) {
          return Promise.resolve([{ '?column?': 1 }]);
        }
        if (sql.includes('information_schema.tables')) {
          return Promise.resolve([{ exists: false }]);
        }
        return Promise.resolve([]);
      });

      // Act
      const result = await service.checkHealth();

      // Assert
      expect(result.status).toBe(HealthStatus.DEGRADED);
      expect(result.checks.tables?.status).toBe(HealthStatus.DEGRADED);
      expect(result.checks.tables?.message).toContain('critical table(s) missing');
    });

    it('should include timestamp in ISO format', async () => {
      // Act
      const result = await service.checkHealth();

      // Assert
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      const timestamp = new Date(result.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(0);
    });

    it('should include response times for all checks', async () => {
      // Act
      const result = await service.checkHealth();

      // Assert
      expect(result.checks.database?.responseTime).toBeGreaterThanOrEqual(0);
      expect(result.checks.tables?.responseTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('checkDatabaseConnection', () => {
    it('should return healthy status when database is connected', async () => {
      // Act
      const result = await service.checkDatabaseConnection();

      // Assert
      expect(result.status).toBe(HealthStatus.HEALTHY);
      expect(result.message).toBe('PostgreSQL connected');
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
      expect(result.details?.driver).toBe('postgres');
      expect(result.details?.isConnected).toBe(true);
      expect(authDataSource.query).toHaveBeenCalledWith('SELECT 1');
    });

    it('should return unhealthy status when database query fails', async () => {
      // Arrange
      const error = new Error('Connection timeout');
      authDataSource.query.mockRejectedValue(error);

      // Act
      const result = await service.checkDatabaseConnection();

      // Assert
      expect(result.status).toBe(HealthStatus.UNHEALTHY);
      expect(result.message).toContain('Connection timeout');
      expect(result.details?.error).toBe('Connection timeout');
    });

    it('should measure response time accurately', async () => {
      // Arrange
      authDataSource.query.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve([{ '?column?': 1 }]), 10);
        });
      });

      // Act
      const result = await service.checkDatabaseConnection();

      // Assert
      expect(result.responseTime).toBeGreaterThanOrEqual(10);
    });

    it('should handle network errors gracefully', async () => {
      // Arrange
      authDataSource.query.mockRejectedValue(new Error('ECONNREFUSED'));

      // Act
      const result = await service.checkDatabaseConnection();

      // Assert
      expect(result.status).toBe(HealthStatus.UNHEALTHY);
      expect(result.message).toContain('ECONNREFUSED');
    });
  });

  describe('checkCriticalTables', () => {
    it('should return healthy status when all critical tables exist', async () => {
      // Act
      const result = await service.checkCriticalTables();

      // Assert
      expect(result.status).toBe(HealthStatus.HEALTHY);
      expect(result.message).toBe('All critical tables exist');
      expect(result.details?.totalChecked).toBe(8);
      expect(result.details?.allPresent).toBe(true);
    });

    it('should return degraded status when some tables are missing', async () => {
      // Arrange
      let callCount = 0;
      authDataSource.query.mockImplementation((sql: string) => {
        if (sql.includes('information_schema.tables')) {
          callCount++;
          return Promise.resolve([{ exists: callCount > 1 }]); // First call fails
        }
        return Promise.resolve([]);
      });

      // Act
      const result = await service.checkCriticalTables();

      // Assert
      expect(result.status).toBe(HealthStatus.DEGRADED);
      expect(result.message).toContain('critical table(s) missing');
      expect(result.details?.missingCount).toBeGreaterThan(0);
      expect(result.details?.missing).toBeDefined();
      expect(Array.isArray(result.details?.missing)).toBe(true);
    });

    it('should check all critical tables across all schemas', async () => {
      // Act
      await service.checkCriticalTables();

      // Assert
      // Verify queries were made to check tables across the 6 datasources used by the 8 critical tables
      // Note: contentDataSource and notificationsDataSource are NOT used by any critical table
      expect(authDataSource.query).toHaveBeenCalled();
      expect(educationalDataSource.query).toHaveBeenCalled();
      expect(gamificationDataSource.query).toHaveBeenCalled();
      expect(progressDataSource.query).toHaveBeenCalled();
      expect(socialDataSource.query).toHaveBeenCalled();
      expect(auditDataSource.query).toHaveBeenCalled();
    });

    it('should handle query errors gracefully', async () => {
      // Arrange
      // All datasources reject - this will cause all table checks to fail
      const error = new Error('Query failed');
      authDataSource.query.mockRejectedValue(error);
      educationalDataSource.query.mockRejectedValue(error);
      gamificationDataSource.query.mockRejectedValue(error);
      progressDataSource.query.mockRejectedValue(error);
      socialDataSource.query.mockRejectedValue(error);
      contentDataSource.query.mockRejectedValue(error);
      auditDataSource.query.mockRejectedValue(error);

      // Act
      const result = await service.checkCriticalTables();

      // Assert
      // When individual table queries fail, they're marked as missing (degraded)
      expect(result.status).toBe(HealthStatus.DEGRADED);
      expect(result.details?.missingCount).toBeGreaterThan(0);
    });

    it('should include missing table names in details', async () => {
      // Arrange
      authDataSource.query.mockImplementation((sql: string) => {
        if (sql.includes('information_schema.tables')) {
          return Promise.resolve([{ exists: false }]);
        }
        return Promise.resolve([]);
      });

      // Act
      const result = await service.checkCriticalTables();

      // Assert
      expect(result.details?.missing).toBeDefined();
      expect(Array.isArray(result.details?.missing)).toBe(true);
      expect(result.details?.missing?.length).toBeGreaterThan(0);
      expect(result.details?.missing?.[0]).toMatch(/^[a-z_]+\.[a-z_]+$/);
    });
  });

  describe('getUptime', () => {
    it('should return uptime in seconds', () => {
      // Act
      const uptime = service.getUptime();

      // Assert
      expect(uptime).toBeGreaterThanOrEqual(0);
      expect(typeof uptime).toBe('number');
      expect(Number.isInteger(uptime)).toBe(true);
    });

    it('should increment uptime over time', async () => {
      // Arrange
      const firstUptime = service.getUptime();

      // Act - Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 100));
      const secondUptime = service.getUptime();

      // Assert
      expect(secondUptime).toBeGreaterThanOrEqual(firstUptime);
    });
  });

  describe('getEnvironment', () => {
    it('should return environment from config', () => {
      // Act
      const environment = service.getEnvironment();

      // Assert
      expect(environment).toBe('test');
      expect(configService.get).toHaveBeenCalledWith('NODE_ENV');
    });

    it('should return default environment if not configured', () => {
      // Arrange
      configService.get.mockReturnValue(undefined);

      // Act
      const environment = service.getEnvironment();

      // Assert
      expect(environment).toBe('development');
    });
  });

  describe('getVersion', () => {
    it('should return version from config', () => {
      // Act
      const version = service.getVersion();

      // Assert
      expect(version).toBe('1.0.0');
      expect(configService.get).toHaveBeenCalledWith('npm_package_version');
    });

    it('should return default version if not configured', () => {
      // Arrange
      configService.get.mockReturnValue(undefined);

      // Act
      const version = service.getVersion();

      // Assert
      expect(version).toBe('1.0.0');
    });
  });

  describe('determineOverallStatus', () => {
    it('should return UNHEALTHY if any check is unhealthy', async () => {
      // Arrange
      authDataSource.query.mockRejectedValue(new Error('Connection failed'));

      // Act
      const result = await service.checkHealth();

      // Assert
      expect(result.status).toBe(HealthStatus.UNHEALTHY);
    });

    it('should return DEGRADED if any check is degraded', async () => {
      // Arrange
      authDataSource.query.mockImplementation((sql: string) => {
        if (sql.includes('SELECT 1')) {
          return Promise.resolve([{ '?column?': 1 }]);
        }
        if (sql.includes('information_schema.tables')) {
          return Promise.resolve([{ exists: false }]);
        }
        return Promise.resolve([]);
      });

      // Act
      const result = await service.checkHealth();

      // Assert
      expect(result.status).toBe(HealthStatus.DEGRADED);
    });

    it('should return HEALTHY if all checks are healthy', async () => {
      // Act
      const result = await service.checkHealth();

      // Assert
      expect(result.status).toBe(HealthStatus.HEALTHY);
    });
  });

  describe('Performance', () => {
    it('should complete health check in less than 1000ms', async () => {
      // Arrange
      const startTime = Date.now();

      // Act
      await service.checkHealth();
      const duration = Date.now() - startTime;

      // Assert
      expect(duration).toBeLessThan(1000);
    });

    it('should handle concurrent health checks', async () => {
      // Act
      const results = await Promise.all([
        service.checkHealth(),
        service.checkHealth(),
        service.checkHealth(),
      ]);

      // Assert
      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.status).toBe(HealthStatus.HEALTHY);
      });
    });
  });
});
