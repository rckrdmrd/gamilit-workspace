/**
 * TestApp Helper
 *
 * @description Creates a minimal NestJS `TestingModule` backed by real TypeORM
 * connections to the dev/test PostgreSQL instance.
 *
 * Architecture note:
 *  - gamilit uses 11 named TypeORM data-sources (auth, educational, gamification,
 *    progress, social, content, notifications, audit, analytics, settings, communication).
 *  - This helper wires up only the connections required by the requested modules so
 *    test modules stay small and fast.
 *  - All connections point to the same physical database (`gamilit_platform`) because
 *    isolation is achieved through PostgreSQL schemas, not separate databases.
 *
 * Usage:
 * ```typescript
 * const app = await TestAppHelper.createWithModules([AuthModule]);
 * const httpServer = app.getHttpServer();
 * await app.close();
 * ```
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

// ---------------------------------------------------------------------------
// DB connection factory
// ---------------------------------------------------------------------------

type DataSourceName =
  | 'auth'
  | 'educational'
  | 'gamification'
  | 'progress'
  | 'social'
  | 'content'
  | 'notifications'
  | 'audit'
  | 'analytics'
  | 'settings'
  | 'communication';

function buildTypeOrmConfig(name: DataSourceName) {
  return TypeOrmModule.forRoot({
    name,
    type: 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || process.env.DB_USER || 'gamilit_user',
    password: process.env.DB_PASSWORD || 'gamilit_dev_2026',
    database: process.env.DB_DATABASE || 'gamilit_platform',
    synchronize: false,
    logging: false,
    // Minimal pool — integration tests are sequential (--runInBand)
    extra: {
      max: 2,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 15000,
    },
    // Let TypeORM auto-discover entities registered via forFeature()
    autoLoadEntities: true,
  });
}

// ---------------------------------------------------------------------------
// TestAppHelper
// ---------------------------------------------------------------------------

export interface TestAppOptions {
  /**
   * Names of the TypeORM datasources to wire up.
   * Defaults to ['auth', 'gamification'] which covers most integration tests.
   */
  dataSources?: DataSourceName[];
  /**
   * Additional NestJS module imports (the modules under test).
   */
  moduleImports?: any[];
}

export class TestAppHelper {
  private constructor() {}

  /**
   * Creates a NestJS application wired to real database connections.
   *
   * @param options - datasources to open and modules to import
   * @returns Fully initialised INestApplication ready for supertest
   */
  static async create(options: TestAppOptions = {}): Promise<INestApplication> {
    const dataSources: DataSourceName[] = options.dataSources ?? ['auth', 'gamification'];
    const moduleImports: any[] = options.moduleImports ?? [];

    const typeOrmModules = dataSources.map((name) => buildTypeOrmConfig(name));

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        // Config module — reads from process.env (set in setup.ts)
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: false,
          envFilePath: ['.env.test', '.env'],
        }),

        // Throttler disabled in tests (use limit: 1000 so it never fires)
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 1000 }]),

        // TypeORM datasources
        ...typeOrmModules,

        // Feature modules
        ...moduleImports,
      ],
    }).compile();

    const app = moduleRef.createNestApplication();

    // Apply the same global pipes the real application uses
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    // Set global prefix matching the real app
    app.setGlobalPrefix('api');

    await app.init();
    return app;
  }

  /**
   * Creates an application with auth + gamification datasources and the
   * provided modules.  Convenience wrapper for the most common test setup.
   */
  static async createWithModules(moduleImports: any[]): Promise<INestApplication> {
    return TestAppHelper.create({
      dataSources: ['auth', 'gamification', 'progress'],
      moduleImports,
    });
  }
}
