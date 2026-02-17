// OpenTelemetry MUST be imported before any NestJS code
import './telemetry';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { API_PREFIX, API_VERSION } from './shared/constants/routes.constants';
import { TransformResponseInterceptor } from './shared/interceptors/transform-response.interceptor';
import { AllExceptionsFilter } from './shared/filters/http-exception.filter';
import { DomainExceptionFilter } from './shared/exceptions';
import { RedisIoAdapter } from './adapters/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Global prefix with versioning (from unified constants)
  app.setGlobalPrefix(`${API_PREFIX}/${API_VERSION}`);

  // CORS configuration - Supports multiple origins separated by comma
  // Default origins include frontend (3005) and backend (3006) for Swagger
  const corsOrigin = configService.get<string>('app.corsOrigin') || 'http://localhost:3005,http://localhost:3006';
  const allowedOrigins = corsOrigin.split(',').map(origin => origin.trim());

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps, Postman, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in the allowed list
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        console.warn(`⚠️  CORS blocked request from origin: ${origin}`);
        console.warn(`   Allowed origins: ${allowedOrigins.join(', ')}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
  });

  // FIX-BE-016-2026-01-29: Use unified Socket.IO adapter to prevent
  // "handleUpgrade() was called more than once" error with multiple gateways
  // 2026-02-03: Upgraded to RedisIoAdapter for horizontal scaling support
  const redisIoAdapter = new RedisIoAdapter(app, allowedOrigins);

  // Connect to Redis only if enabled (disabled in dev to avoid WSL2 svchost proxy issues)
  const redisEnabled = configService.get<boolean>('redis.enabled', true);
  let redisConnected = false;

  if (redisEnabled) {
    redisConnected = await redisIoAdapter.connectToRedis();
    if (redisConnected) {
      Logger.log('Socket.IO using Redis adapter for horizontal scaling', 'Bootstrap');
    } else {
      Logger.warn('Socket.IO using in-memory adapter (Redis connection failed)', 'Bootstrap');
    }
  } else {
    Logger.log('Redis disabled by configuration (REDIS_ENABLED=false) — using in-memory adapter', 'Bootstrap');
  }

  app.useWebSocketAdapter(redisIoAdapter);

  // Security
  app.use(helmet());

  // Compression
  app.use(compression());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter - captures ALL exceptions with detailed error info
  app.useGlobalFilters(new DomainExceptionFilter(), new AllExceptionsFilter());

  // Global response transformation interceptor
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // Swagger documentation - disabled in production (ESTANDAR-SEGURIDAD §3.9 API9)
  if (configService.get<string>('env.nodeEnv', 'development') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('GAMILIT API')
      .setDescription(
        'Educational Gamification Platform - Marie Curie Reading Comprehension',
      )
      .setVersion('1.0.0')
      .addBearerAuth()
      .addTag('Auth', 'Authentication and authorization endpoints')
      .addTag('Educational', 'Educational content (modules, exercises)')
      .addTag('Progress', 'Student progress tracking')
      .addTag('Social', 'Social features (classrooms, teams, friendships)')
      .addTag('Content', 'Content management and templates')
      .addTag('Gamification', 'Gamification system (XP, ML Coins, Ranks, Achievements)')
      .addTag('Admin - Users', 'Admin user management')
      .addTag('Admin - Organizations', 'Admin organization/tenant management')
      .addTag('Admin - Content', 'Admin content approval')
      .addTag('Admin - System', 'Admin system monitoring and configuration')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${API_PREFIX}/${API_VERSION}/docs`, app, document, {
      customSiteTitle: 'GAMILIT API Documentation',
      customCss: '.swagger-ui .topbar { display: none }',
    });
  }

  // Get port from environment
  const port = configService.get('env.port', 3006);
  const nodeEnv = configService.get('env.nodeEnv', 'development');

  // Production security validations (ESTANDAR-SEGURIDAD §3.2, GUIA-ROTACION-SECRETOS)
  if (nodeEnv === 'production') {
    const jwtSecret = configService.get<string>('JWT_SECRET') || '';
    const jwtRefreshSecret = configService.get<string>('JWT_REFRESH_SECRET') || '';
    const dbPassword = configService.get<string>('database.password') || configService.get<string>('DB_PASSWORD') || '';

    const errors: string[] = [];

    if (jwtSecret.length < 32 || jwtSecret.includes('change-in-production') || jwtSecret.includes('your-secret')) {
      errors.push('JWT_SECRET must be at least 32 characters and not a placeholder');
    }
    if (jwtRefreshSecret.length < 32 || jwtRefreshSecret.includes('change-in-production') || jwtRefreshSecret.includes('your-secret')) {
      errors.push('JWT_REFRESH_SECRET must be at least 32 characters and not a placeholder');
    }
    if (jwtSecret === jwtRefreshSecret) {
      errors.push('JWT_SECRET and JWT_REFRESH_SECRET must be different');
    }
    if (!dbPassword || dbPassword.length < 8) {
      errors.push('DB_PASSWORD is required and must be at least 8 characters');
    }

    if (errors.length > 0) {
      Logger.error('SECURITY VALIDATION FAILED - Cannot start in production:', 'Bootstrap');
      errors.forEach(err => Logger.error(`  - ${err}`, 'Bootstrap'));
      process.exit(1);
    }
  }

  await app.listen(port);

  const socketStatus = redisConnected ? 'Redis (scalable)' : 'In-memory';
  const cronEnabled = (process.env.CRON_ENABLED || 'true').toLowerCase() !== 'false';
  const cronStatus = cronEnabled ? 'Enabled (19 jobs)' : 'Disabled';
  const swaggerStatus = nodeEnv !== 'production' ? `http://localhost:${port}/${API_PREFIX}/${API_VERSION}/docs` : 'Disabled in production';
  console.log(`
=====================================================================

   GAMILIT Backend API Server

   Server running at: http://localhost:${port}
   API Docs: ${swaggerStatus}
   Environment: ${nodeEnv}
   CORS Origins: ${allowedOrigins.length} configured
   WebSocket: ${socketStatus}
   Cron Jobs: ${cronStatus}

=====================================================================
  `);

  // Log CORS configuration
  console.log('🔒 CORS Configuration:');
  allowedOrigins.forEach(origin => {
    console.log(`   ✅ ${origin}`);
  });
  console.log('');

  // Log available modules
  console.log('📦 Loaded modules:');
  console.log('   ✅ AuthModule');
  console.log('   ✅ EducationalModule');
  console.log('   ✅ ProgressModule');
  console.log('   ✅ SocialModule');
  console.log('   ✅ ContentModule');
  console.log('   ✅ GamificationModule');
  console.log('   ✅ AdminModule');
  console.log('');
}

bootstrap().catch((error) => {
  console.error('❌ Application failed to start:');
  console.error(error);
  process.exit(1);
});
