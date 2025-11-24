import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { HealthModule } from '../health.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('HealthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env.test', '.env'],
        }),
        // Mock database connections for testing
        TypeOrmModule.forRoot({
          name: 'auth',
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'gamilit_test',
          synchronize: false,
          logging: false,
        }),
        TypeOrmModule.forRoot({
          name: 'educational',
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'gamilit_test',
          synchronize: false,
          logging: false,
        }),
        TypeOrmModule.forRoot({
          name: 'gamification',
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'gamilit_test',
          synchronize: false,
          logging: false,
        }),
        TypeOrmModule.forRoot({
          name: 'progress',
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'gamilit_test',
          synchronize: false,
          logging: false,
        }),
        TypeOrmModule.forRoot({
          name: 'social',
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'gamilit_test',
          synchronize: false,
          logging: false,
        }),
        TypeOrmModule.forRoot({
          name: 'content',
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'gamilit_test',
          synchronize: false,
          logging: false,
        }),
        TypeOrmModule.forRoot({
          name: 'audit',
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'gamilit_test',
          synchronize: false,
          logging: false,
        }),
        TypeOrmModule.forRoot({
          name: 'notifications',
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'gamilit_test',
          synchronize: false,
          logging: false,
        }),
        HealthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect((res) => {
          expect([HttpStatus.OK, HttpStatus.SERVICE_UNAVAILABLE]).toContain(res.status);
        })
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('uptime');
          expect(res.body).toHaveProperty('environment');
          expect(res.body).toHaveProperty('checks');
          expect(res.body).toHaveProperty('version');
        });
    });

    it('should return valid timestamp', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect((res) => {
          expect(res.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
          const timestamp = new Date(res.body.timestamp);
          expect(timestamp.getTime()).toBeGreaterThan(0);
        });
    });

    it('should return numeric uptime', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect((res) => {
          expect(typeof res.body.uptime).toBe('number');
          expect(res.body.uptime).toBeGreaterThanOrEqual(0);
        });
    });

    it('should include database check', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect((res) => {
          expect(res.body.checks).toHaveProperty('database');
          expect(res.body.checks.database).toHaveProperty('status');
          expect(res.body.checks.database).toHaveProperty('responseTime');
          expect(res.body.checks.database).toHaveProperty('message');
        });
    });

    it('should include tables check', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect((res) => {
          expect(res.body.checks).toHaveProperty('tables');
          expect(res.body.checks.tables).toHaveProperty('status');
          expect(res.body.checks.tables).toHaveProperty('responseTime');
          expect(res.body.checks.tables).toHaveProperty('message');
        });
    });

    it('should return 200 OK when healthy', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect((res) => {
          if (res.body.status === 'healthy') {
            expect(res.status).toBe(HttpStatus.OK);
          }
        });
    });

    it('should return 503 when unhealthy', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect((res) => {
          if (res.body.status === 'unhealthy' || res.body.status === 'degraded') {
            expect(res.status).toBe(HttpStatus.SERVICE_UNAVAILABLE);
          }
        });
    });

    it('should respond within acceptable time', () => {
      const startTime = Date.now();
      return request(app.getHttpServer())
        .get('/health')
        .expect((res) => {
          const duration = Date.now() - startTime;
          expect(duration).toBeLessThan(5000); // 5 seconds max
        });
    });

    it('should not require authentication', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect((res) => {
          // Should not return 401 Unauthorized
          expect(res.status).not.toBe(HttpStatus.UNAUTHORIZED);
        });
    });

    it('should return valid JSON', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect('Content-Type', /json/);
    });

    it('should include version information', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect((res) => {
          expect(res.body.version).toBeDefined();
          expect(typeof res.body.version).toBe('string');
        });
    });

    it('should handle multiple concurrent requests', async () => {
      const requests = Array(5)
        .fill(null)
        .map(() => request(app.getHttpServer()).get('/health'));

      const responses = await Promise.all(requests);

      responses.forEach((res) => {
        expect([HttpStatus.OK, HttpStatus.SERVICE_UNAVAILABLE]).toContain(res.status);
        expect(res.body).toHaveProperty('status');
      });
    });

    it('should return consistent status across multiple calls', async () => {
      const res1 = await request(app.getHttpServer()).get('/health');
      const res2 = await request(app.getHttpServer()).get('/health');

      // Status should be consistent within a short time frame
      expect(res1.body.status).toBe(res2.body.status);
    });
  });
});
